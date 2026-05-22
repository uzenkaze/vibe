// ytmusic.js

/* ══════════════ STATE ══════════════ */
let currentVideoId  = null;
let isPlaying       = false;
let currentPlaylist = [];
let currentIndex    = -1;
let ytPlayer        = null;
let isPlayerReady   = false;
let progressTimer   = null;
let isDraggingProgress = false;
let isShuffle       = false;
let isRepeat        = false;   // false | 'one' | 'all'
let repeatMode      = 0;       // 0=off, 1=all, 2=one
let isLiked         = false;
let activeBottomTab = 'next';
let currentSearchQuery = '';
let searchPageCount = 0;
let isSearchLoading = false;

/* ══════════════ YT IFRAME API ══════════════ */
window.onYouTubeIframeAPIReady = function () {
  ytPlayer = new YT.Player('yt-player', {
    height: '100%', width: '100%',
    videoId: '',
    playerVars: { playsinline: 1, autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
    events: {
      onReady: () => { isPlayerReady = true; },
      onStateChange: onPlayerStateChange
    }
  });
};

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayPauseIcon();
    startProgressTimer();
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    updatePlayPauseIcon();
    stopProgressTimer();
  } else if (event.data === YT.PlayerState.ENDED) {
    handleTrackEnd();
  }
}

function handleTrackEnd() {
  if (repeatMode === 2) {
    // repeat one
    ytPlayer.seekTo(0);
    ytPlayer.playVideo();
  } else {
    playNext();
  }
}

/* ══════════════ INIT ══════════════ */
document.addEventListener('DOMContentLoaded', () => {
  updateLoginUI();
  loadTrending();
  initProgressBar();
  initBottomSheet();
  initInfiniteScroll();
});

/* ══════════════ LOGIN ══════════════ */
function openLoginModal()  { document.getElementById('login-modal').classList.add('open'); }
function closeLoginModal() { document.getElementById('login-modal').classList.remove('open'); }

function proceedYouTubeLogin() {
  const targetUrl = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://music.youtube.com';
  const isMobile  = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    window.open(targetUrl, '_blank');
  } else {
    const w = 500, h = 650;
    const l = (screen.width  / 2) - (w / 2);
    const t = (screen.height / 2) - (h / 2);
    const popup = window.open(targetUrl, 'ytLogin', `width=${w},height=${h},top=${t},left=${l},scrollbars=yes`);
    if (!popup || popup.closed) window.open(targetUrl, '_blank');
  }
  localStorage.setItem('yt_logged_in', 'true');
  updateLoginUI();
  closeLoginModal();
}

function updateLoginUI() {
  const btn = document.getElementById('login-ui-btn');
  if (!btn) return;
  const loggedIn = localStorage.getItem('yt_logged_in') === 'true';
  if (loggedIn) {
    btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="#bef264" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    btn.onclick = () => {
      if (confirm('로그아웃(상태 초기화) 하시겠습니까?')) {
        localStorage.removeItem('yt_logged_in');
        updateLoginUI();
      }
    };
  } else {
    btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    btn.onclick = openLoginModal;
  }
}

/* ══════════════ SEARCH ══════════════ */
async function searchMusic(query, setInput = true, isAppend = false) {
  if (isSearchLoading) return;
  if (!query) query = document.getElementById('search-input').value.trim();
  else if (setInput) document.getElementById('search-input').value = query;
  if (!query) return;

  if (!isAppend) {
    currentSearchQuery = query;
    searchPageCount = 0;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    document.getElementById('music-list').innerHTML = '';
  }

  isSearchLoading = true;
  const listEl = document.getElementById('music-list');
  const loadEl = isAppend ? document.getElementById('bottom-loading') : document.getElementById('loading-indicator');
  
  if (loadEl) {
    if (isAppend) loadEl.style.display = 'block';
    else loadEl.classList.add('active');
  }

  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  const proxies = [
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];

  let html = '';
  for (const makeProxy of proxies) {
    try {
      const res = await fetch(makeProxy(targetUrl));
      if (!res.ok) continue;
      if (makeProxy(targetUrl).includes('allorigins')) {
        const data = await res.json();
        html = data.contents;
      } else {
        html = await res.text();
      }
      if (html && html.includes('ytInitialData')) break;
    } catch (e) { /* try next */ }
  }

  if (!html) {
    if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">검색 결과를 불러올 수 없습니다.<br>잠시 후 다시 시도해 주세요.</div>`;
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
    isSearchLoading = false;
    return;
  }

  const prefix = 'var ytInitialData = ';
  const si = html.indexOf(prefix);
  if (si === -1) {
    if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
    isSearchLoading = false;
    return;
  }
  const ei = html.indexOf(';</script>', si);
  const jsonStr = html.substring(si + prefix.length, ei);

  let data;
  try {
    try { data = JSON.parse(jsonStr); }
    catch { data = new Function('return ' + jsonStr)(); }

    const contents = data.contents
      .twoColumnSearchResultsRenderer
      .primaryContents
      .sectionListRenderer
      .contents[0]
      .itemSectionRenderer
      .contents;

    const songs = [];
    for (const item of contents) {
      if (!item.videoRenderer) continue;
      const v = item.videoRenderer;
      songs.push({
        title:    v.title.runs[0].text,
        videoId:  v.videoId,
        artist:   v.ownerText?.runs[0].text || 'Unknown',
        duration: v.lengthText?.simpleText || '',
        thumb:    v.thumbnail.thumbnails.slice(-1)[0].url.split('?')[0]
      });
      if (songs.length >= 50) break;
    }

    if (isAppend) {
      const newSongs = songs.filter(s => !currentPlaylist.find(p => p.videoId === s.videoId));
      currentPlaylist = currentPlaylist.concat(newSongs);
      renderMusicList(newSongs, true);
    } else {
      currentPlaylist = songs;
      renderMusicList(songs, false);
    }
  } catch (e) {
    console.error('Parse error', e);
    if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">결과 분석 중 오류가 발생했습니다.</div>`;
  }
  if (loadEl) {
    if (isAppend) loadEl.style.display = 'none';
    else loadEl.classList.remove('active');
  }
  isSearchLoading = false;
}

/* ══════════════ PILL / TABS ══════════════ */
function activatePill(el) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
}

async function loadTrending() {
  activatePill(document.querySelector('.pill'));
  document.getElementById('search-input').value = '';
  
  const cacheKey = 'ytm_trending_cache';
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < 216000000) { // 2.5 days
        currentSearchQuery = '인기곡 플레이리스트';
        searchPageCount = 0;
        currentPlaylist = parsed.songs;
        renderMusicList(parsed.songs, false);
        return;
      }
    } catch(e) {}
  }
  
  await searchMusic('인기곡 플레이리스트', false);
  
  if (currentSearchQuery === '인기곡 플레이리스트' && currentPlaylist.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      songs: currentPlaylist.slice(0, 50)
    }));
  }
}

function loadRecent() {
  const listEl = document.getElementById('music-list');
  document.getElementById('loading-indicator').classList.add('active');
  listEl.innerHTML = '';
  setTimeout(() => {
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem('ytm_recent')) || []; } catch {}
    document.getElementById('loading-indicator').classList.remove('active');
    currentPlaylist = recent;
    renderMusicList(recent);
    if (!recent.length) {
      listEl.innerHTML = `<div class="tab-placeholder">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><br>
        최근 재생한 음악이 없습니다.</div>`;
    }
  }, 80);
}

function saveToRecent(song) {
  let recent = [];
  try { recent = JSON.parse(localStorage.getItem('ytm_recent')) || []; } catch {}
  recent = recent.filter(s => s.videoId !== song.videoId);
  recent.unshift(song);
  if (recent.length > 50) recent = recent.slice(0, 50);
  localStorage.setItem('ytm_recent', JSON.stringify(recent));
}

/* ══════════════ RENDER LIST ══════════════ */
function renderMusicList(songs, isAppend = false) {
  const listEl = document.getElementById('music-list');
  if (!isAppend) listEl.innerHTML = '';
  if (!songs.length && !isAppend) {
    listEl.innerHTML = `<div class="tab-placeholder">결과가 없습니다.</div>`;
    return;
  }
  songs.forEach((song) => {
    const div = document.createElement('div');
    div.className = 'song-item' + (song.videoId === currentVideoId ? ' playing' : '');
    div.onclick = () => playMusic(song);
    div.innerHTML = `
      <img src="${song.thumb}" class="song-thumb" alt="" onerror="this.src=''">
      <div class="song-info">
        <div class="song-title">${song.title}</div>
        <div class="song-artist">${song.artist}${song.duration ? ' · ' + song.duration : ''}</div>
      </div>
      <div class="song-action">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
        </svg>
      </div>`;
    listEl.appendChild(div);
  });
}

/* ══════════════ PLAYBACK ══════════════ */
function playMusic(song, index) {
  currentVideoId = song.videoId;
  currentIndex   = (typeof index !== 'undefined') ? index
                 : currentPlaylist.findIndex(s => s.videoId === song.videoId);
  isPlaying = true;

  if (isPlayerReady && ytPlayer?.loadVideoById) {
    ytPlayer.loadVideoById(song.videoId);
  } else {
    const iv = setInterval(() => {
      if (isPlayerReady && ytPlayer?.loadVideoById) {
        ytPlayer.loadVideoById(song.videoId);
        clearInterval(iv);
      }
    }, 200);
  }

  // Mini player
  const hqThumb = 'https://i.ytimg.com/vi/' + song.videoId + '/hqdefault.jpg';
  document.getElementById('mini-thumb').src  = song.thumb;
  document.getElementById('mini-title').textContent  = song.title;
  document.getElementById('mini-artist').textContent = song.artist;
  document.getElementById('mini-player').classList.add('visible');

  // Full player
  document.getElementById('full-art').src          = hqThumb;
  document.getElementById('full-title').textContent = song.title;
  document.getElementById('full-artist').textContent= song.artist;

  updatePlayPauseIcon();
  saveToRecent(song);
  refreshNextTrackList();

  // Mark playing item in list
  document.querySelectorAll('.song-item').forEach((el, i) => {
    el.classList.toggle('playing', i === currentIndex);
  });
}

function togglePlay(event) {
  if (event) event.stopPropagation();
  if (!currentVideoId || !ytPlayer) return;
  isPlaying ? ytPlayer.pauseVideo() : ytPlayer.playVideo();
}

function updatePlayPauseIcon() {
  const pauseSvg = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
  const playSvg  = `<path d="M8 5v14l11-7z"/>`;
  const svg = isPlaying ? pauseSvg : playSvg;
  const mini = document.getElementById('icon-pause');
  const full = document.getElementById('full-icon-pause');
  if (mini) mini.innerHTML = svg;
  if (full) full.innerHTML = svg;
}

function playNext() {
  if (!currentPlaylist.length) return;
  let idx;
  if (isShuffle) {
    do { idx = Math.floor(Math.random() * currentPlaylist.length); }
    while (idx === currentIndex && currentPlaylist.length > 1);
  } else {
    idx = (currentIndex + 1) % currentPlaylist.length;
  }
  playMusic(currentPlaylist[idx], idx);
}

function playPrev() {
  if (!currentPlaylist.length) return;
  // If > 3 sec in, restart current; else go prev
  const pos = ytPlayer?.getCurrentTime?.() || 0;
  if (pos > 3) {
    ytPlayer.seekTo(0, true);
    return;
  }
  const idx = (currentIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
  playMusic(currentPlaylist[idx], idx);
}

/* ══════════════ SHUFFLE / REPEAT ══════════════ */
function toggleShuffle(event) {
  if (event) event.stopPropagation();
  isShuffle = !isShuffle;
  const btn = document.getElementById('shuffle-btn');
  if (btn) btn.classList.toggle('active', isShuffle);
}

function toggleRepeat(event) {
  if (event) event.stopPropagation();
  repeatMode = (repeatMode + 1) % 3;  // 0→1→2→0
  const btn  = document.getElementById('repeat-btn');
  const icon = document.getElementById('repeat-icon');
  if (!btn) return;

  if (repeatMode === 0) {
    btn.classList.remove('active');
    if (icon) icon.innerHTML = `<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>`;
  } else if (repeatMode === 1) {
    btn.classList.add('active');
    if (icon) icon.innerHTML = `<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/>`;
  } else {
    btn.classList.add('active');
    // repeat one: show "1" badge
    if (icon) icon.innerHTML = `<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="currentColor" stroke="none">1</text>`;
  }
  isRepeat = repeatMode > 0;
}

/* ══════════════ LIKE ══════════════ */
function toggleLike() {
  isLiked = !isLiked;
  const btn = document.getElementById('like-btn');
  if (btn) btn.classList.toggle('liked', isLiked);
}

/* ══════════════ OPEN / CLOSE FULL PLAYER ══════════════ */
function openFullPlayer() {
  document.getElementById('full-player').classList.add('open');
  refreshNextTrackList();
}
function closeFullPlayer() {
  document.getElementById('full-player').classList.remove('open');
}

/* ══════════════ SONG / VIDEO MODE ══════════════ */
function switchMode(mode) {
  const tabSong  = document.getElementById('tab-song');
  const tabVideo = document.getElementById('tab-video');
  const img      = document.getElementById('full-art');
  const ytCon    = document.getElementById('yt-player-container');

  if (mode === 'song') {
    tabSong.classList.add('active');
    tabVideo.classList.remove('active');
    img.style.display = 'block';
    ytCon.className   = 'video-mode-hidden';
  } else {
    tabVideo.classList.add('active');
    tabSong.classList.remove('active');
    img.style.display = 'none';
    ytCon.className   = 'video-mode-active';
  }
}

/* ══════════════ BOTTOM TABS ══════════════ */
function switchBottomTab(tab) {
  activeBottomTab = tab;
  document.querySelectorAll('.bottom-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btab-${tab}`);
  if (btn) btn.classList.add('active');

  const content = document.getElementById('full-bottom-content');
  if (tab === 'next')    renderNextTracks(content);
  else if (tab === 'lyrics')  renderLyrics(content);
  else if (tab === 'related') renderRelated(content);
}

function renderNextTracks(container) {
  container.innerHTML = '';
  if (!currentPlaylist.length) {
    container.innerHTML = `<div class="tab-placeholder">재생 목록이 없습니다.</div>`;
    return;
  }
  currentPlaylist.forEach((song, idx) => {
    const div = document.createElement('div');
    div.className = 'next-track-item' + (idx === currentIndex ? ' next-track-playing' : '');
    div.onclick = () => playMusic(song, idx);
    div.innerHTML = `
      <span class="next-track-num">${idx + 1}</span>
      <img src="${song.thumb}" class="next-track-thumb" alt="" onerror="this.src=''">
      <div class="next-track-info">
        <div class="next-track-title">${song.title}</div>
        <div class="next-track-artist">${song.artist}</div>
      </div>`;
    container.appendChild(div);
  });
  // Scroll to current
  const playing = container.querySelector('.next-track-playing');
  if (playing) playing.scrollIntoView({ block: 'nearest' });
}

function renderLyrics(container) {
  container.innerHTML = `<div class="tab-placeholder">
    <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
    </svg><br>
    현재 가사 데이터를 지원하지 않습니다.<br>
    <span style="font-size:12px; color:#444;">YouTube Music 앱에서 확인하실 수 있습니다.</span>
  </div>`;
}

function renderRelated(container) {
  if (!currentVideoId) {
    container.innerHTML = `<div class="tab-placeholder">재생 중인 곡이 없습니다.</div>`;
    return;
  }
  container.innerHTML = `<div class="tab-placeholder">
    <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/>
    </svg><br>
    관련 음악 검색 중...<br>
    <span style="font-size:12px; color:#444;">잠시 후 자동으로 로드됩니다.</span>
  </div>`;
  // Search related
  searchRelated(currentVideoId, container);
}

async function searchRelated(videoId, container) {
  // Use current song artist name for search
  const song = currentPlaylist[currentIndex];
  if (!song) return;
  const query = `${song.artist} 관련 음악`;
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  const proxies = [
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`
  ];

  let html = '';
  for (const makeProxy of proxies) {
    try {
      const res = await fetch(makeProxy(targetUrl));
      if (!res.ok) continue;
      html = await res.text();
      if (html?.includes('ytInitialData')) break;
    } catch {}
  }

  if (!html) {
    container.innerHTML = `<div class="tab-placeholder">관련 항목을 불러올 수 없습니다.</div>`;
    return;
  }

  try {
    const prefix = 'var ytInitialData = ';
    const si = html.indexOf(prefix);
    const ei = html.indexOf(';</script>', si);
    const jsonStr = html.substring(si + prefix.length, ei);
    let data;
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }

    const contents = data.contents.twoColumnSearchResultsRenderer
      .primaryContents.sectionListRenderer.contents[0]
      .itemSectionRenderer.contents;

    const songs = [];
    for (const item of contents) {
      if (!item.videoRenderer) continue;
      const v = item.videoRenderer;
      songs.push({
        title:    v.title.runs[0].text,
        videoId:  v.videoId,
        artist:   v.ownerText?.runs[0].text || 'Unknown',
        duration: v.lengthText?.simpleText || '',
        thumb:    v.thumbnail.thumbnails.slice(-1)[0].url.split('?')[0]
      });
      if (songs.length >= 10) break;
    }

    container.innerHTML = '';
    songs.forEach((s, idx) => {
      const div = document.createElement('div');
      div.className = 'next-track-item';
      div.onclick = () => {
        currentPlaylist = [...currentPlaylist, ...songs.filter(x => !currentPlaylist.find(c => c.videoId === x.videoId))];
        const newIdx = currentPlaylist.findIndex(c => c.videoId === s.videoId);
        playMusic(s, newIdx);
      };
      div.innerHTML = `
        <span class="next-track-num">${idx + 1}</span>
        <img src="${s.thumb}" class="next-track-thumb" alt="" onerror="this.src=''">
        <div class="next-track-info">
          <div class="next-track-title">${s.title}</div>
          <div class="next-track-artist">${s.artist}</div>
        </div>`;
      container.appendChild(div);
    });
  } catch (e) {
    container.innerHTML = `<div class="tab-placeholder">관련 항목을 불러올 수 없습니다.</div>`;
  }
}

function refreshNextTrackList() {
  if (activeBottomTab === 'next') {
    const content = document.getElementById('full-bottom-content');
    if (content) renderNextTracks(content);
  }
}

/* ══════════════ PROGRESS BAR ══════════════ */
function initProgressBar() {
  const bar = document.getElementById('progress-bar');
  if (!bar) return;
  bar.addEventListener('input', e => {
    isDraggingProgress = true;
    document.getElementById('time-current').textContent = formatTime(+e.target.value);
  });
  bar.addEventListener('change', e => {
    if (ytPlayer?.seekTo) ytPlayer.seekTo(+e.target.value, true);
    isDraggingProgress = false;
  });
}

function startProgressTimer() {
  stopProgressTimer();
  progressTimer = setInterval(updateProgress, 500);
}
function stopProgressTimer() {
  if (progressTimer) clearInterval(progressTimer);
  progressTimer = null;
}
function updateProgress() {
  if (!ytPlayer?.getCurrentTime) return;
  const cur   = ytPlayer.getCurrentTime() || 0;
  const total = ytPlayer.getDuration()    || 0;
  const bar   = document.getElementById('progress-bar');
  if (total > 0 && !isDraggingProgress && bar) {
    bar.max   = total;
    bar.value = cur;
    // Dynamic track fill color
    const pct = (cur / total) * 100;
    bar.style.background = `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.2) ${pct}%)`;
  }
  document.getElementById('time-current').textContent = formatTime(cur);
  document.getElementById('time-total').textContent   = formatTime(total);
}

function formatTime(sec) {
  if (isNaN(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s < 10 ? '0' + s : s}`;
}

/* ══════════════ BOTTOM SHEET INTERACTION ══════════════ */
function initBottomSheet() {
  const sheet = document.getElementById('bottom-sheet');
  const tabs = document.getElementById('full-bottom-tabs');
  if (!sheet) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;
  let sheetHeight = 0;
  const collapsedHeight = 48; // Height of tabs

  const dragTargets = [tabs];

  dragTargets.forEach(target => {
    if (!target) return;
    target.addEventListener('touchstart', e => {
      // Prevent interference if scrolling content
      if (e.target.closest('.full-bottom-content')) return;
      
      startY = e.touches[0].clientY;
      sheetHeight = sheet.getBoundingClientRect().height;
      isDragging = true;
      sheet.classList.add('dragging');
    });

    target.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const deltaY = e.touches[0].clientY - startY;
      
      const isExpanded = sheet.classList.contains('expanded');
      const maxTranslate = sheetHeight - collapsedHeight;
      let newTranslateY = 0;

      if (isExpanded) {
        newTranslateY = Math.max(0, deltaY); // drag down
      } else {
        newTranslateY = Math.max(0, maxTranslate + deltaY); // drag up (deltaY is negative)
      }

      newTranslateY = Math.min(Math.max(0, newTranslateY), maxTranslate);
      sheet.style.transform = `translateY(${newTranslateY}px)`;
    });

    target.addEventListener('touchend', e => {
      if (!isDragging) return;
      isDragging = false;
      sheet.classList.remove('dragging');
      
      const currentTranslateY = parseFloat(sheet.style.transform.replace('translateY(', '').replace('px)', '')) || 0;
      const maxTranslate = sheetHeight - collapsedHeight;
      const threshold = maxTranslate * 0.25; // 25% to trigger state change

      if (sheet.classList.contains('expanded')) {
        if (currentTranslateY > threshold) sheet.classList.remove('expanded');
      } else {
        if (currentTranslateY < maxTranslate - threshold) sheet.classList.add('expanded');
      }
      sheet.style.transform = ''; // Clear inline style
    });
  });

  // Tap tabs area to toggle when collapsed
  if (tabs) {
    tabs.addEventListener('click', (e) => {
      if (!sheet.classList.contains('expanded') && !e.target.closest('button')) {
        sheet.classList.add('expanded');
      }
    });
  }
}

/* ══════════════ PLAYLIST DRAWER ══════════════ */
function toggleDrawer() {
  const drawer  = document.getElementById('playlist-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer) return;
  const opening = drawer.classList.contains('hidden');
  if (opening) {
    renderDrawerList();
    drawer.classList.remove('hidden');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
    overlay.classList.add('hidden');
  }
}

function renderDrawerList() {
  const list = document.getElementById('drawer-list');
  if (!list) return;
  list.innerHTML = '';
  if (!currentPlaylist.length) {
    list.innerHTML = `<div style="padding:24px; text-align:center; color:#555; font-size:13px;">재생 목록이 없습니다.</div>`;
    return;
  }
  currentPlaylist.forEach((song, idx) => {
    const div = document.createElement('div');
    div.className = 'playlist-item' + (idx === currentIndex ? ' current' : '');
    div.onclick = () => {
      playMusic(song, idx);
      toggleDrawer();
    };
    div.innerHTML = `
      <span class="playlist-item-num">${idx + 1}</span>
      <img src="${song.thumb}" class="playlist-item-thumb" alt="" onerror="this.src=''">
      <div class="playlist-item-info">
        <div class="playlist-item-title">${song.title}</div>
        <div class="playlist-item-artist">${song.artist}</div>
      </div>`;
    list.appendChild(div);
  });
  // Scroll current into view
  const cur = list.querySelector('.current');
  if (cur) cur.scrollIntoView({ block: 'nearest' });
}

/* ══════════════ OPEN IN YOUTUBE ══════════════ */
function openInYouTube(event) {
  if (event) event.stopPropagation();
  if (currentVideoId) window.open(`https://music.youtube.com/watch?v=${currentVideoId}`, '_blank');
}

/* ══════════════ INFINITE SCROLL ══════════════ */
function initInfiniteScroll() {
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !isSearchLoading && currentSearchQuery) {
      searchPageCount++;
      const suffixes = [' 추천', ' 모음', ' 핫라인', ' 플레이리스트', ' 라이브', ' 베스트', ' 모음집'];
      const nextQuery = currentSearchQuery + suffixes[(searchPageCount - 1) % suffixes.length];
      searchMusic(nextQuery, false, true);
    }
  }, { rootMargin: '400px' });
  
  const anchor = document.getElementById('scroll-anchor');
  if (anchor) observer.observe(anchor);

  // Periodically refresh list
  setInterval(() => {
    if (window.scrollY < 100 && !isPlaying && currentSearchQuery) {
      searchMusic(currentSearchQuery, false, false);
    }
  }, 5 * 60 * 1000); // 5 minutes
}
