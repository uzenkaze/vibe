$ErrorActionPreference = 'Stop'

$jsFile = 'livetv-app/src/youtube.js'
$jsContent = Get-Content $jsFile -Raw

# 1. Replace playVideo
$newPlayVideo = @"
function playVideo(videoId, title) {
  currentPlayingVideoId = videoId;
  const player = document.getElementById('full-player');
  document.getElementById('yt-iframe').src = `https://www.youtube.com/embed/` + videoId + `?autoplay=1&rel=0`;
  
  // Set UI elements
  document.getElementById('full-title').textContent = title;
  const v = allVideos.find(x => x.videoId === videoId);
  document.getElementById('full-artist').textContent = v ? v.channelName : 'YouTube';
  document.getElementById('full-art').src = `https://i.ytimg.com/vi/` + videoId + `/hqdefault.jpg`;
  
  player.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // Push history state so system Back Button closes the player instead of leaving the page
  if (!playerHistoryPushed) {
    history.pushState({ playerOpen: true }, '');
    playerHistoryPushed = true;
  }
}
"@

$jsContent = $jsContent -replace '(?s)function playVideo\(videoId, title\).*?function closePlayer', "$newPlayVideo`n`nfunction closePlayer"

# 2. Replace closePlayer
$newClosePlayer = @"
function closePlayer(avoidPopState = false) {
  const player = document.getElementById('full-player');
  if(player) {
      document.getElementById('yt-iframe').src = '';
      player.classList.remove('open');
      player.classList.remove('pip-mode');
  }
  document.body.style.overflow = '';
  
  // Pop history if user clicked close manually
  if (playerHistoryPushed && !avoidPopState) {
    history.back();
    playerHistoryPushed = false;
  } else {
    playerHistoryPushed = false;
  }
}

function closeFullPlayer() {
    closePlayer();
}

let isPlaying = true;
function togglePlay(e) {
    if(e) e.stopPropagation();
    isPlaying = !isPlaying;
    const btn = document.getElementById('full-play-btn');
    const svg = isPlaying ? `<svg width="44" height="44" fill="currentColor" viewBox="0 0 24 24" id="full-icon-pause"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>` 
                          : `<svg width="44" height="44" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`;
    if(btn) btn.innerHTML = svg;
    // For iframe without YT API, pause requires postMessage if possible, or just a dummy UI toggle
    const iframe = document.getElementById('yt-iframe');
    if(iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage('{"event":"command","func":"' + (isPlaying ? 'playVideo' : 'pauseVideo') + '","args":""}', '*');
    }
}

function playNext() {
    if(!allVideos || allVideos.length === 0) return;
    let idx = allVideos.findIndex(v => v.videoId === currentPlayingVideoId);
    if(idx >= 0 && idx < allVideos.length - 1) {
        const nextV = allVideos[idx + 1];
        playVideo(nextV.videoId, nextV.title);
    }
}

function playPrev() {
    if(!allVideos || allVideos.length === 0) return;
    let idx = allVideos.findIndex(v => v.videoId === currentPlayingVideoId);
    if(idx > 0) {
        const prevV = allVideos[idx - 1];
        playVideo(prevV.videoId, prevV.title);
    }
}

let isLiked = false;
function toggleLike() {
  isLiked = !isLiked;
  const btn = document.getElementById('like-btn');
  if (btn) btn.classList.toggle('liked', isLiked);
}

let isShuffle = false;
function toggleShuffle(event) {
  if (event) event.stopPropagation();
  isShuffle = !isShuffle;
  const btn = document.getElementById('shuffle-btn');
  if (btn) btn.classList.toggle('active', isShuffle);
}

let repeatMode = 0;
function toggleRepeat(event) {
  if (event) event.stopPropagation();
  repeatMode = (repeatMode + 1) % 3;
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
    if (icon) icon.innerHTML = `<path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="8" fill="currentColor" stroke="none">1</text>`;
  }
}

function switchMode(mode) {
  const tabSong  = document.getElementById('tab-song');
  const tabVideo = document.getElementById('tab-video');
  const img      = document.getElementById('full-art');
  const ytCon    = document.getElementById('yt-player-container');

  if (mode === 'song') {
    if(tabSong) tabSong.classList.add('active');
    if(tabVideo) tabVideo.classList.remove('active');
    if(img) img.style.display = 'block';
    if(ytCon) ytCon.className = 'video-mode-hidden';
  } else {
    if(tabVideo) tabVideo.classList.add('active');
    if(tabSong) tabSong.classList.remove('active');
    if(img) img.style.display = 'none';
    if(ytCon) ytCon.className = 'video-mode-active';
  }
}

function switchBottomTab(tab) {
  document.querySelectorAll('.bottom-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('btab-' + tab);
  if (btn) btn.classList.add('active');

  const container = document.getElementById('full-bottom-content');
  if(!container) return;
  
  if (tab === 'next') {
      container.innerHTML = `<div class="tab-placeholder">다음 영상 목록을 준비 중입니다.</div>`;
  } else if (tab === 'lyrics') {
      container.innerHTML = `<div class="tab-placeholder"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg><br>현재 가사 데이터를 지원하지 않습니다.<br><span style="font-size:12px; color:#444;">YouTube Music 앱에서 확인하실 수 있습니다.</span></div>`;
  } else if (tab === 'related') {
      container.innerHTML = `<div class="tab-placeholder"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8l4 4-4 4"/></svg><br>관련 영상 검색 중...<br><span style="font-size:12px; color:#444;">잠시 후 자동으로 로드됩니다.</span></div>`;
  }
}

function toggleDrawer() {
  const drawer  = document.getElementById('playlist-drawer');
  const overlay = document.getElementById('drawer-overlay');
  if (!drawer) return;
  const opening = drawer.classList.contains('hidden');
  if (opening) {
    drawer.classList.remove('hidden');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('hidden');
    overlay.classList.add('hidden');
  }
}
"@

$jsContent = $jsContent -replace '(?s)function closePlayer\(avoidPopState = false\).*?function togglePIP', "$newClosePlayer`n`nfunction togglePIP"

# Add bindings
$bindings = @"
window.closeFullPlayer = closeFullPlayer;
window.switchMode = switchMode;
window.toggleLike = toggleLike;
window.toggleShuffle = toggleShuffle;
window.toggleRepeat = toggleRepeat;
window.togglePlay = togglePlay;
window.playNext = playNext;
window.playPrev = playPrev;
window.switchBottomTab = switchBottomTab;
window.toggleDrawer = toggleDrawer;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize bottom sheet interaction
  const sheet = document.getElementById('bottom-sheet');
  const tabs = document.getElementById('full-bottom-tabs');
  if (sheet && tabs) {
      tabs.addEventListener('click', (e) => {
        if (!sheet.classList.contains('expanded') && !e.target.closest('button')) {
          sheet.classList.add('expanded');
        } else if (sheet.classList.contains('expanded') && !e.target.closest('button')) {
          sheet.classList.remove('expanded');
        }
      });
  }
});
"@

$jsContent = $jsContent -replace 'window\.playVideo = playVideo;', "$bindings`n`nwindow.playVideo = playVideo;"

Set-Content $jsFile $jsContent
Write-Host 'youtube.js updated successfully'
