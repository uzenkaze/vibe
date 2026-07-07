// ytmusic.js

/* =================== SMART FETCH (CORS BYPASS FOR MOBILE) =================== */
async function smartFetch(url, options = {}) {
  const isNative = typeof window !== 'undefined' && 
                   (!!window.Capacitor || (window.location.hostname === 'localhost' && window.location.port === '') || window.location.protocol === 'capacitor:');
  
  if (isNative && window.Capacitor?.Plugins?.CapacitorHttp) {
    try {
      const headers = options.headers || {};
      if (!headers['User-Agent']) {
        headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
      }
      if (!headers['Accept']) {
        headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7';
      }
      if (!headers['Accept-Language']) {
        headers['Accept-Language'] = 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7';
      }
      const capOptions = {
        url: url,
        method: options.method || 'GET',
        headers: headers,
        connectTimeout: options.timeout || 5000,
        readTimeout: options.timeout || 5000
      };
      if (options.body) {
        capOptions.data = options.body;
      }
      
      const response = await window.Capacitor.Plugins.CapacitorHttp.request(capOptions);
      return {
        ok: response.status >= 200 && response.status < 300,
        status: response.status,
        headers: {
          get: (name) => {
            const keys = Object.keys(response.headers || {});
            const key = keys.find(k => k.toLowerCase() === name.toLowerCase());
            return key ? response.headers[key] : '';
          }
        },
        text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
        json: async () => typeof response.data === 'object' ? response.data : JSON.parse(response.data)
      };
    } catch (e) {
      console.error('[SmartFetch] Native request failed, falling back to standard fetch:', e);
    }
  }
  
  let controller = null;
  let timeoutId = null;
  const fetchOptions = { ...options };
  
  if (options.timeout) {
    controller = new AbortController();
    fetchOptions.signal = controller.signal;
    delete fetchOptions.timeout;
    timeoutId = setTimeout(() => controller.abort(), options.timeout);
  }
  
  try {
    const res = await fetch(url, fetchOptions);
    if (timeoutId) clearTimeout(timeoutId);
    return res;
  } catch (e) {
    if (timeoutId) clearTimeout(timeoutId);
    throw e;
  }
}

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
let activeBottomTab = '';
let currentSearchQuery = '';
let searchPageCount = 0;
let isSearchLoading = false;

/* ══════════════ YT IFRAME API ══════════════ */
function initPlayer() {
  if (ytPlayer) return;
  ytPlayer = new YT.Player('yt-player', {
    height: '100%', width: '100%',
    videoId: '',
    playerVars: { playsinline: 1, autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
    events: {
      onReady: () => { isPlayerReady = true; },
      onStateChange: onPlayerStateChange
    }
  });
}

window.onYouTubeIframeAPIReady = function () {
  initPlayer();
};

if (window.YT && window.YT.Player) {
  initPlayer();
}

function notifyAndroidNative(playing) {
  if (window.AndroidNative && typeof window.AndroidNative.updateMetadata === 'function') {
    try {
      const song = currentPlaylist[currentIndex];
      if (song) {
        window.AndroidNative.updateMetadata(song.title || '', song.artist || 'Unknown', song.thumb || '', playing);
      } else {
        window.AndroidNative.onMusicStateChanged(playing);
      }
    } catch (e) {
      console.error('[Background Audio] updateMetadata error:', e);
    }
  } else if (window.AndroidNative && typeof window.AndroidNative.onMusicStateChanged === 'function') {
    try {
      window.AndroidNative.onMusicStateChanged(playing);
    } catch (e) {}
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayPauseIcon();
    startProgressTimer();
    notifyAndroidNative(true);
    try {
      if (ytPlayer.setPlaybackQuality) ytPlayer.setPlaybackQuality('highres');
    } catch(e) {}
  } else if (event.data === YT.PlayerState.PAUSED) {
    isPlaying = false;
    updatePlayPauseIcon();
    stopProgressTimer();
    notifyAndroidNative(false);
  } else if (event.data === YT.PlayerState.ENDED) {
    notifyAndroidNative(false);
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
  initPullToRefresh();
});

// ── 당겨서 새로고침 (Pull-to-Refresh) ────────────────────────────────────────
function initPullToRefresh() {
  const indicator = document.getElementById('pull-refresh-indicator');
  if (!indicator) return;

  let startY = 0;
  let pulling = false;
  let triggered = false;
  const THRESHOLD = 70;

  document.addEventListener('touchstart', e => {
    if (window.scrollY > 5) return;
    startY = e.touches[0].clientY;
    pulling = true;
    triggered = false;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!pulling) return;
    const dist = e.touches[0].clientY - startY;
    if (dist <= 0) { pulling = false; return; }

    const progress = Math.min(dist / THRESHOLD, 1);
    indicator.style.opacity = progress;
    
    // 화면 중앙 기준
    const offset = 60 - Math.min(dist * 0.4, 60);
    indicator.style.transform = `translateX(-50%) translateY(calc(-50% + ${offset}px))`;

    if (dist >= THRESHOLD && !triggered) {
      triggered = true;
      indicator.classList.add('ready');
    } else if (dist < THRESHOLD) {
      indicator.classList.remove('ready');
    }
  }, { passive: true });

  document.addEventListener('touchend', async () => {
    if (!pulling) return;
    pulling = false;

    if (triggered) {
      indicator.classList.add('refreshing');
      indicator.style.transform = 'translateX(-50%) translateY(-50%)'; // 정중앙 고정
      
      // 새로고침 로직
      // 현재 활성화된 카테고리를 찾아서 클릭 발생 또는 함수 호출
      const activeBtn = document.querySelector('.yt-cat.active');
      if (activeBtn) {
        activeBtn.click();
      } else {
        await loadTrending();
      }

      setTimeout(() => {
        indicator.classList.remove('refreshing', 'ready');
        indicator.style.opacity = '0';
        indicator.style.transform = 'translateX(-50%) translateY(calc(-50% + 60px))';
      }, 500);
    } else {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateX(-50%) translateY(calc(-50% + 60px))';
    }
    triggered = false;
  });
}

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

/* ══════════════ INVIDIOUS INSTANCE FALLBACK ══════════════ */
const INVIDIOUS_INSTANCES = [
  'https://inv.thepixora.com',
  'https://invidious.fdn.fr',
  'https://vid.puffyan.us',
  'https://invidious.projectsegfau.lt',
  'https://invidious.lunar.icu',
  'https://yewtu.be',
  'https://invidious.nerdvpn.de',
  'https://invidious.no-logs.com'
];

let dynamicInvidiousInstances = [];
let isInvidiousInitialized = false;

async function ensureInvidiousInstances() {
  if (isInvidiousInitialized) return;
  isInvidiousInitialized = true;
  try {
    const res = await smartFetch('https://api.invidious.io/instances.json', { timeout: 3000 });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        const active = data
          .filter(item => {
            const inst = item[1];
            const hasCors = inst.cors !== false;
            const hasApi = inst.api !== false;
            const isHttps = inst.type === 'https';
            const isUp = inst.monitor?.last_status === 200 || (inst.monitor?.uptime || 0) > 80;
            return inst && isHttps && hasCors && hasApi && isUp;
          })
          .map(item => `https://${item[0]}`);
        if (active.length > 0) {
          dynamicInvidiousInstances = active;
          console.log('[Invidious API] Loaded dynamic instances for Music:', dynamicInvidiousInstances);
        }
      }
    }
  } catch (e) {
    console.warn('[Invidious API] Failed to fetch dynamic instances for Music, using defaults:', e);
  }
  if (dynamicInvidiousInstances.length === 0) {
    dynamicInvidiousInstances = [...INVIDIOUS_INSTANCES];
  }
}

async function searchInvidiousMusic(query) {
  await ensureInvidiousInstances();
  
  // 가용한 인스턴스 중 상위 최대 7개 추출
  const instances = dynamicInvidiousInstances.slice(0, 7);
  if (instances.length === 0) return [];

  console.log(`[YT Music Parallel] Starting parallel race search across ${instances.length} instances for: ${query}`);

  // 병렬 요청들을 담은 Promise 배열 생성
  const promises = instances.map(async (instance) => {
    const invidiousUrl = `${instance}/api/v1/search?q=${encodeURIComponent(query)}+official+audio&type=video`;
    try {
      const res = await smartFetch(invidiousUrl, { timeout: 2500 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        const songs = json.map(item => {
          if (item.type !== 'video' && item.type !== undefined) return null;
          const videoId = item.videoId;
          if (!videoId) return null;
          let durationStr = '';
          if (item.lengthSeconds) {
            const m = Math.floor(item.lengthSeconds / 60);
            const s = item.lengthSeconds % 60;
            durationStr = `${m}:${String(s).padStart(2, '0')}`;
          }
          return {
            title: item.title || '(제목 없음)',
            videoId: videoId,
            artist: item.author || 'Unknown',
            duration: durationStr,
            thumb: `https://i.ytimg.com/vi/${videoId}/default.jpg`
          };
        }).filter(Boolean);
        
        if (songs.length > 0) {
          console.log(`[YT Music Parallel] Instance succeeded first: ${instance}`);
          return { songs, instance };
        }
      }
      throw new Error('Empty result');
    } catch (e) {
      throw e;
    }
  });

  // 병렬 레이싱용 Promise 커스텀 구현 (Promise.any가 없는 구형 디바이스 웹뷰 대응 폴백 포함)
  return new Promise((resolve) => {
    let resolved = false;
    let failedCount = 0;
    
    promises.forEach(p => {
      p.then(result => {
        if (!resolved) {
          resolved = true;
          resolve(result.songs);
        }
      }).catch(() => {
        failedCount++;
        if (failedCount === promises.length && !resolved) {
          resolved = true;
          resolve([]); // 모든 인스턴스 실패 시 빈 배열 반환
        }
      });
    });

    // 전체 세이프가드 타임아웃 (3초 내 무조건 응답 보장)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[YT Music Parallel] Race timeout triggered.');
        resolve([]);
      }
    }, 3000);
  });
}

// YT Music 캐싱 SWR 시스템
function getMusicCache(query) {
  try {
    const raw = localStorage.getItem(`ytm_search_cache_${query}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch(e) { return null; }
}

function setMusicCache(query, songs) {
  try {
    if (Array.isArray(songs)) {
      localStorage.setItem(`ytm_search_cache_${query}`, JSON.stringify(songs));
    }
  } catch(e) {}
}

/* ══════════════ SEARCH ══════════════ */
async function searchMusic(query, setInput = true, isAppend = false) {
  if (isSearchLoading) return;
  
  const isCustomSearch = !query;
  
  if (!query) query = document.getElementById('search-input').value.trim();
  else if (setInput) document.getElementById('search-input').value = query;
  if (!query) return;

  if (!isAppend) {
    currentSearchQuery = query;
    searchPageCount = 0;
    if (isCustomSearch) {
      document.querySelectorAll('.yt-cat').forEach(p => p.classList.remove('active'));
    }
    document.getElementById('music-list').innerHTML = '';

    // SWR 캐시 즉각 사용 (0초 로딩 체감!)
    const cached = getMusicCache(query);
    if (cached && cached.length > 0) {
      console.log(`[YT Music SWR] 로컬 캐시 즉시 렌더링: ${query}`);
      currentPlaylist = cached;
      renderMusicList(cached, false);
      
      // 백그라운드 갱신 (UI 블록킹 해제)
      setTimeout(() => executeSearchNetwork(query, isAppend), 100);
      return;
    }
  }

  await executeSearchNetwork(query, isAppend);
}

async function executeSearchNetwork(query, isAppend = false) {
  isSearchLoading = true;
  const listEl = document.getElementById('music-list');
  const loadEl = isAppend ? document.getElementById('bottom-loading') : document.getElementById('loading-indicator');
  
  if (loadEl) {
    if (isAppend) loadEl.style.display = 'block';
    else loadEl.classList.add('active');
  }

  try {
    const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D&app=desktop`;
    const pathUrl = `/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D&app=desktop`;
    
    let html = '';
    const isCapacitor = !!window.Capacitor?.isNativePlatform?.() || 
                        (window.location.hostname === 'localhost' && window.location.port === '') || 
                        window.location.protocol === 'capacitor:';
    const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !isCapacitor;

    // On production browser, query Vercel backend proxy API (avoids CORS blocks 100%!)
    if (!isCapacitor && !isLocal) {
      console.log('[YT Music] Production website detected. Fetching via Vercel Backend Proxy API...');
      try {
        const base = window.location.hostname.includes('github.io') ? 'https://vibe-eight-iota.vercel.app' : '';
        const res = await smartFetch(`${base}/api/youtube/music?q=${encodeURIComponent(query)}`, { timeout: 4500 });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && Array.isArray(data.songs) && data.songs.length > 0) {
            const fallbackSongs = data.songs;
            if (isAppend) {
              const newSongs = fallbackSongs.filter(s => !currentPlaylist.find(p => p.videoId === s.videoId));
              currentPlaylist = currentPlaylist.concat(newSongs);
              renderMusicList(newSongs, true);
            } else {
              currentPlaylist = fallbackSongs;
              renderMusicList(fallbackSongs, false);
            }
            if (!isAppend && currentPlaylist.length > 0) {
              setMusicCache(query, currentPlaylist.slice(0, 50));
            }
            if (loadEl) {
              if (isAppend) loadEl.style.display = 'none';
              else loadEl.classList.remove('active');
            }
            isSearchLoading = false;
            return;
          }
        }
      } catch (e) {
        console.warn('[YT Music] Vercel proxy fetch failed, trying local client-side Invidious search...', e);
      }

      // Vercel 프록시가 실패했을 경우 클라이언트 단에서 직접 병렬 Invidious 레이싱 시도
      const fallbackSongs = await searchInvidiousMusic(query);
      if (fallbackSongs && fallbackSongs.length > 0) {
        if (isAppend) {
          const newSongs = fallbackSongs.filter(s => !currentPlaylist.find(p => p.videoId === s.videoId));
          currentPlaylist = currentPlaylist.concat(newSongs);
          renderMusicList(newSongs, true);
        } else {
          currentPlaylist = fallbackSongs;
          renderMusicList(fallbackSongs, false);
        }
        if (!isAppend && currentPlaylist.length > 0) {
          setMusicCache(query, currentPlaylist.slice(0, 50));
        }
        if (loadEl) {
          if (isAppend) loadEl.style.display = 'none';
          else loadEl.classList.remove('active');
        }
        isSearchLoading = false;
        return;
      }
    }

    try {
      if (isCapacitor) {
        const res = await smartFetch(targetUrl);
        if (res.ok) html = await res.text();
      } else if (isLocal) {
        const res = await smartFetch('/yt-proxy' + pathUrl);
        if (res.ok) html = await res.text();
      }
    } catch (e) {}

    if (!html || !html.includes('ytInitialData')) {
      const proxies = [
        u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
        u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        u => `https://corsproxy.io/?${encodeURIComponent(u)}`
      ];
      for (const makeProxy of proxies) {
        try {
          const res = await smartFetch(makeProxy(targetUrl), { timeout: 4000 });
          if (!res.ok) continue;
          if (makeProxy(targetUrl).includes('allorigins')) {
            html = (await res.json()).contents;
          } else {
            html = await res.text();
          }
          if (html && html.includes('ytInitialData')) break;
        } catch (e) { /* try next */ }
      }
    }

    const handleInvidiousFallback = async () => {
      console.log('[YT Music] Direct fetch and CORS proxies failed. Trying Invidious fallback...');
      const fallbackSongs = await searchInvidiousMusic(query);
      if (fallbackSongs && fallbackSongs.length > 0) {
        if (isAppend) {
          const newSongs = fallbackSongs.filter(s => !currentPlaylist.find(p => p.videoId === s.videoId));
          currentPlaylist = currentPlaylist.concat(newSongs);
          renderMusicList(newSongs, true);
        } else {
          currentPlaylist = fallbackSongs;
          renderMusicList(fallbackSongs, false);
        }
        if (!isAppend && currentPlaylist.length > 0) {
          setMusicCache(query, currentPlaylist.slice(0, 50));
        }
        return true;
      }
      return false;
    };

    if (!html) {
      const ok = await handleInvidiousFallback();
      if (ok) return;
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">검색 결과를 불러올 수 없습니다.<br>잠시 후 다시 시도해 주세요.</div>`;
      return;
    }

    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*(.*?)\s*;</);
    if (match) {
      jsonStr = match[1];
    } else {
      const ok = await handleInvidiousFallback();
      if (ok) return;
      if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">데이터 구조가 변경되었습니다.</div>`;
      return;
    }

    let data;
    try {
      try { data = JSON.parse(jsonStr); }
      catch { data = new Function('return ' + jsonStr)(); }
      if (typeof data === 'string') data = JSON.parse(data);

      let contents = [];
      if (data.contents?.twoColumnSearchResultsRenderer) {
        contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
      } else if (data.contents?.sectionListRenderer) {
        contents = data.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
      }

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
      if (!isAppend && currentPlaylist.length > 0) {
        setMusicCache(query, currentPlaylist.slice(0, 50));
      }
    } catch (e) {
      console.error('Parse error', e);
      const ok = await handleInvidiousFallback();
      if (!ok) {
        if (!isAppend) listEl.innerHTML = `<div class="tab-placeholder">결과 분석 중 오류가 발생했습니다.</div>`;
      }
    }
  } catch (err) {
    console.error('[YT Music Fetch Network Error]:', err);
  } finally {
    if (loadEl) {
      if (isAppend) loadEl.style.display = 'none';
      else loadEl.classList.remove('active');
    }
    isSearchLoading = false;
  }
}

/* ══════════════ PILL / TABS ══════════════ */
function activatePill(el) {
  document.querySelectorAll('.yt-cat').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
}

async function loadTrending() {
  activatePill(document.querySelector('.yt-cat'));
  document.getElementById('search-input').value = '';
  
  const cacheKey = 'ytm_trending_cache';
  const cached = localStorage.getItem(cacheKey);
  let cachedSongs = null;
  let cacheAge = Infinity;
  
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.songs)) {
        cachedSongs = parsed.songs;
        cacheAge = Date.now() - (parsed.timestamp || 0);
      }
    } catch(e) {}
  }

  // 1. 캐시가 6시간 이내의 극 최신 상태인 경우: 네트워크 요청 없이 즉각 리턴 (0초 렌더)
  if (cachedSongs && cacheAge < 21600000) { // 6 hours
    currentSearchQuery = '인기곡 플레이리스트';
    searchPageCount = 0;
    currentPlaylist = cachedSongs;
    renderMusicList(cachedSongs, false);
    return;
  }
  
  // 2. 캐시가 6시간 초과 2.5일 이하인 경우 (Stale-While-Revalidate): 즉각 화면을 캐시로 그리고 백그라운드 갱신
  if (cachedSongs && cacheAge < 216000000) { // 2.5 days
    console.log('[YT Music Trending SWR] Stale 캐시 즉각 표출 및 백그라운드 갱신');
    currentSearchQuery = '인기곡 플레이리스트';
    searchPageCount = 0;
    currentPlaylist = cachedSongs;
    renderMusicList(cachedSongs, false);

    // 비동기 백그라운드 갱신 개시 (화면의 인디케이터나 로딩 스피너 작동 없이 부드럽게 갱신)
    setTimeout(async () => {
      try {
        const freshSongs = await searchInvidiousMusic('인기곡 플레이리스트');
        if (freshSongs && freshSongs.length > 0 && currentSearchQuery === '인기곡 플레이리스트') {
          currentPlaylist = freshSongs;
          renderMusicList(freshSongs, false);
          localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            songs: freshSongs.slice(0, 50)
          }));
        }
      } catch (err) {}
    }, 150);
    return;
  }
  
  // 3. 캐시가 없거나 너무 오래된 경우: 정상 다이렉트 네트워크 서치 개시
  await searchMusic('인기곡 플레이리스트', false);
  
  if (currentSearchQuery === '인기곡 플레이리스트' && currentPlaylist.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify({
      timestamp: Date.now(),
      songs: currentPlaylist.slice(0, 50)
    }));
  }
}

function loadRecent() {
  currentSearchQuery = '';
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

function loadLikedSongs() {
  currentSearchQuery = '';
  const listEl = document.getElementById('music-list');
  document.getElementById('loading-indicator').classList.add('active');
  listEl.innerHTML = '';
  setTimeout(() => {
    let liked = [];
    try { liked = JSON.parse(localStorage.getItem('ytm_liked')) || []; } catch {}
    document.getElementById('loading-indicator').classList.remove('active');
    currentPlaylist = liked;
    renderMusicList(liked);
    if (!liked.length) {
      listEl.innerHTML = `<div class="tab-placeholder">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg><br>
        좋아요를 누른 음악이 없습니다.</div>`;
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
    ytPlayer.loadVideoById({
      videoId: song.videoId,
      suggestedQuality: 'highres'
    });
  } else {
    const iv = setInterval(() => {
      if (isPlayerReady && ytPlayer?.loadVideoById) {
        ytPlayer.loadVideoById({
          videoId: song.videoId,
          suggestedQuality: 'highres'
        });
        clearInterval(iv);
      }
    }, 200);
  }

  // Mini player
  const hqThumb = 'https://i.ytimg.com/vi/' + song.videoId + '/hqdefault.jpg';
  document.getElementById('mini-thumb').src  = song.thumb;
  document.getElementById('mini-title').textContent  = song.title;
  document.getElementById('mini-artist').textContent = song.artist;
  
  // 좋아요 상태 복원
  let liked = [];
  try { liked = JSON.parse(localStorage.getItem('ytm_liked')) || []; } catch {}
  isLiked = !!liked.find(s => s.videoId === song.videoId);
  const btn = document.getElementById('like-btn');
  if (btn) btn.classList.toggle('liked', isLiked);
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
  if (!currentVideoId) return;
  const song = currentPlaylist[currentIndex];
  if (!song) return;

  isLiked = !isLiked;
  const btn = document.getElementById('like-btn');
  if (btn) btn.classList.toggle('liked', isLiked);
  
  let liked = [];
  try { liked = JSON.parse(localStorage.getItem('ytm_liked')) || []; } catch {}
  
  if (isLiked) {
    if (!liked.find(s => s.videoId === song.videoId)) {
      liked.unshift(song);
    }
  } else {
    liked = liked.filter(s => s.videoId !== song.videoId);
  }
  localStorage.setItem('ytm_liked', JSON.stringify(liked));
}

/* ══════════════ OPEN / CLOSE FULL PLAYER ══════════════ */
function openFullPlayer() {
  document.getElementById('full-player').classList.add('open');
  const sheet = document.getElementById('bottom-sheet');
  if (sheet) {
    sheet.classList.remove('expanded', 'dragging');
    sheet.style.transform = '';
  }
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
function switchBottomTab(tab, expandSheet = false) {
  activeBottomTab = tab;
  document.querySelectorAll('.bottom-tab-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(`btab-${tab}`);
  if (btn) btn.classList.add('active');

  const content = document.getElementById('full-bottom-content');
  if (tab === 'next')    renderNextTracks(content);
  else if (tab === 'related') renderRelated(content);

  if (expandSheet) {
    const sheet = document.getElementById('bottom-sheet');
    if (sheet) {
      sheet.classList.add('expanded');
      sheet.classList.remove('dragging');
      sheet.style.transform = '';
    }
  }
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
  // Scroll to current only if the sheet is expanded
  const playing = container.querySelector('.next-track-playing');
  if (playing) {
    const sheet = document.getElementById('bottom-sheet');
    if (sheet && sheet.classList.contains('expanded')) {
      playing.scrollIntoView({ block: 'nearest' });
    }
  }
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
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D&app=desktop`;
  const pathUrl = `/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D&app=desktop`;
  
  let html = '';
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.() || 
                      (window.location.hostname === 'localhost' && window.location.port === '') || 
                      window.location.protocol === 'capacitor:';
  const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !isCapacitor;

  // On production browser, go straight to Invidious to avoid CORS proxy block timeouts (huge speed boost!)
  if (!isCapacitor && !isLocal) {
    console.log('[YT Music] Production website detected for Related. Going straight to Invidious search.');
    const fallbackSongs = await searchInvidiousMusic(query);
    if (fallbackSongs && fallbackSongs.length > 0) {
      container.innerHTML = '';
      fallbackSongs.slice(0, 10).forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = 'next-track-item';
        div.onclick = () => {
          currentPlaylist = [...currentPlaylist, ...fallbackSongs.filter(x => !currentPlaylist.find(c => c.videoId === x.videoId))];
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
      return;
    }
  }

  try {
    if (isCapacitor) {
      const res = await smartFetch(targetUrl);
      if (res.ok) html = await res.text();
    } else if (isLocal) {
      const res = await smartFetch('/yt-proxy' + pathUrl);
      if (res.ok) html = await res.text();
    }
  } catch (e) {}

  if (!html || !html.includes('ytInitialData')) {
    const proxies = [
      u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
      u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
      u => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];
    for (const makeProxy of proxies) {
      try {
        const res = await smartFetch(makeProxy(targetUrl), { timeout: 4000 });
        if (!res.ok) continue;
        if (makeProxy(targetUrl).includes('allorigins')) {
          html = (await res.json()).contents;
        } else {
          html = await res.text();
        }
        if (html && html.includes('ytInitialData')) break;
      } catch (e) { /* try next */ }
    }
  }

  const handleRelatedFallback = async () => {
    console.log('[YT Music] Related search failed. Trying Invidious fallback...');
    const fallbackSongs = await searchInvidiousMusic(query);
    if (fallbackSongs && fallbackSongs.length > 0) {
      container.innerHTML = '';
      fallbackSongs.slice(0, 10).forEach((s, idx) => {
        const div = document.createElement('div');
        div.className = 'next-track-item';
        div.onclick = () => {
          currentPlaylist = [...currentPlaylist, ...fallbackSongs.filter(x => !currentPlaylist.find(c => c.videoId === x.videoId))];
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
      return true;
    }
    return false;
  };

  if (!html) {
    const ok = await handleRelatedFallback();
    if (ok) return;
    container.innerHTML = `<div class="tab-placeholder">관련 항목을 불러올 수 없습니다.</div>`;
    return;
  }

  try {
    let jsonStr = '';
    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*(.*?)\s*;</);
    if (match) jsonStr = match[1];
    else throw new Error("No ytInitialData");
    let data;
    try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }
    if (typeof data === 'string') data = JSON.parse(data);

    let contents = [];
    if (data.contents?.twoColumnSearchResultsRenderer) {
      contents = data.contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    } else if (data.contents?.sectionListRenderer) {
      contents = data.contents.sectionListRenderer.contents[0].itemSectionRenderer.contents;
    }

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
    const ok = await handleRelatedFallback();
    if (!ok) {
      container.innerHTML = `<div class="tab-placeholder">관련 항목을 불러올 수 없습니다.</div>`;
    }
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
  
  // 남은 시간 표기 (예: -2:45)
  const remaining = total - cur;
  document.getElementById('time-total').textContent   = '-' + formatTime(remaining >= 0 ? remaining : 0);

  // 안드로이드 네이티브 상태바로 시간 위치 정보 전송
  if (window.AndroidNative && typeof window.AndroidNative.updatePlaybackPosition === 'function') {
    try {
      window.AndroidNative.updatePlaybackPosition(cur, total, isPlaying);
    } catch (e) {
      console.error('[Background Audio] updatePlaybackPosition error:', e);
    }
  }
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
    });

    target.addEventListener('touchmove', e => {
      if (!isDragging) return;
      const deltaY = e.touches[0].clientY - startY;
      
      // Add a small threshold (5px) to differentiate a tap from a drag
      if (Math.abs(deltaY) < 5) return;
      
      if (!sheet.classList.contains('dragging')) {
        sheet.classList.add('dragging');
      }

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
      
      if (!sheet.classList.contains('dragging')) {
        return; // It was a tap, let the click event proceed naturally
      }
      
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
let lastMusicLoadTime = 0;

function initInfiniteScroll() {
  const loadNextPage = () => {
    if (isSearchLoading || !currentSearchQuery) return;
    
    // 디바이스 연속 스크롤로 인한 API 연속 중복 찌르기 방지 (최소 1.2초 디바운스 락)
    const now = Date.now();
    if (now - lastMusicLoadTime < 1200) {
      console.log('[YT Music Scroll Guard] 너무 빠른 연속 로드 차단');
      return;
    }
    lastMusicLoadTime = Date.now();

    searchPageCount++;
    console.log(`[YT Music Infinite Scroll] Loading page ${searchPageCount} for query: ${currentSearchQuery}`);
    const suffixes = [' 인기곡', ' 히트곡', ' 베스트', ' 추천 플레이리스트', ' 노래모음', ' 최신 인기곡'];
    const nextQuery = currentSearchQuery + suffixes[(searchPageCount - 1) % suffixes.length];
    searchMusic(nextQuery, false, true);
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadNextPage();
    }
  }, { rootMargin: '400px' });
  
  const anchor = document.getElementById('scroll-anchor');
  if (anchor) observer.observe(anchor);

  // IntersectionObserver 오동작 대비 이중 백업 스크롤 리스너 탑재
  window.addEventListener('scroll', () => {
    if (isSearchLoading) return;
    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = window.scrollY || window.pageYOffset;
    const clientHeight = window.innerHeight;
    
    // 바닥 근처 180px 이내 도달 시 강제 무한 스크롤 구동
    if (scrollHeight - scrollTop - clientHeight < 180) {
      loadNextPage();
    }
  }, { passive: true });

  // Periodically refresh list
  setInterval(() => {
    if (window.scrollY < 100 && !isPlaying && currentSearchQuery) {
      searchMusic(currentSearchQuery, false, false);
    }
  }, 5 * 60 * 1000); // 5 minutes
}

// Export functions to window because this script is loaded as a module
Object.assign(window, {
  openFullPlayer,
  closeFullPlayer,
  togglePlay,
  playNext,
  playPrev,
  toggleShuffle,
  toggleRepeat,
  switchBottomTab,
  toggleDrawer,
  openLoginModal,
  closeLoginModal,
  proceedYouTubeLogin,
  activatePill,
  loadTrending,
  loadRecent,
  loadLikedSongs,
  searchMusic,
  toggleLike,
  switchMode,
  openNetflix
});

// 넷플릭스 앱 자동 실행 및 기기별 앱스토어 연동 런처 (우회 웹사이트 제거)
async function openNetflix() {
  const isCapacitor = typeof window !== 'undefined' && window.Capacitor && typeof window.Capacitor.getPlatform === 'function';
  let platform = 'web';
  if (isCapacitor) {
    platform = window.Capacitor.getPlatform(); // 'android', 'ios', or 'web'
  }

  const ua = navigator.userAgent || navigator.vendor || window.opera;
  
  // Capacitor 앱 내부 환경인 경우, 변조된 User Agent(Windows NT)에 상관없이 Capacitor 플랫폼을 신뢰합니다!
  const isAndroid = (platform === 'android') || (!isCapacitor && /android/i.test(ua));
  const isIOS = (platform === 'ios') || (!isCapacitor && /ipad|iphone|ipod/i.test(ua) && !window.MSStream);
  const isMac = !isIOS && (/macintosh|mac os x/i.test(ua));
  const isWindows = !isAndroid && !isIOS && /windows/i.test(ua);

  // 디바이스 플랫폼별 공식 넷플릭스 앱 스토어 주소 정의 (market:// Scheme은 이즐앱 가로채기 오류 방지를 위해 사용 차단)
  const storeUrls = {
    android: 'https://play.google.com/store/apps/details?id=com.netflix.mediaclient',
    ios: 'https://apps.apple.com/app/netflix/id363801352',
    windows: 'https://apps.microsoft.com/detail/9wzdncrfj3tj',
    mac: 'https://apps.apple.com/app/netflix/id363801352',
    fallback: 'https://play.google.com/store/apps/details?id=com.netflix.mediaclient'
  };

  // 1. Capacitor 하이브리드 앱 환경
  if (isCapacitor && (platform === 'android' || platform === 'ios')) {
    try {
      const { AppLauncher } = window.Capacitor.Plugins;
      const checkOptions = (platform === 'android')
        ? { packageName: 'com.netflix.mediaclient' }
        : { url: 'nflx://' };
        
      const canOpen = await AppLauncher.canOpenUrl(checkOptions).catch(() => ({ value: false }));
      if (canOpen.value) {
        await AppLauncher.openUrl({ url: 'nflx://' });
        return;
      } else {
        // 앱 미설치 시 사용자 친화적인 확인창 제공
        const goStore = confirm('넷플릭스 앱이 기기에 설치되어 있지 않습니다.\n설치를 위해 스토어로 이동하시겠습니까?');
        if (goStore) {
          if (platform === 'android') {
            await AppLauncher.openUrl({ url: storeUrls.android }).catch(() => {
              window.location.href = storeUrls.android;
            });
          } else if (platform === 'ios') {
            await AppLauncher.openUrl({ url: storeUrls.ios }).catch(() => {
              window.location.href = storeUrls.ios;
            });
          }
        }
        return;
      }
    } catch (e) {
      console.warn('[Netflix AppLauncher] Failed to open native netflix:', e);
    }
  }

  // 2. 모바일 브라우저 환경 딥링크 기동 (웹페이지로 시청 중일 때)
  if (isAndroid) {
    const intentUrl = `intent://#Intent;package=com.netflix.mediaclient;scheme=nflx;S.browser_fallback_url=${encodeURIComponent(storeUrls.android)};end`;
    window.location.href = intentUrl;
    return;
  } 
  
  if (isIOS) {
    const start = Date.now();
    window.location.href = 'nflx://';
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        const goStore = confirm('넷플릭스 앱이 설치되어 있지 않은 것 같습니다.\n설치 스토어로 이동하시겠습니까?');
        if (goStore) {
          window.location.href = storeUrls.ios;
        }
      }
    }, 1500);
    return;
  }

  // 3. PC 데스크톱 웹 환경: 디바이스 OS별 공식 앱스토어 다운로드 페이지로 직접 이동
  const goStore = confirm('넷플릭스 앱이 설치되어 있지 않습니다.\n다운로드 스토어 페이지로 이동하시겠습니까?');
  if (goStore) {
    if (isWindows) {
      window.open(storeUrls.windows, '_blank');
    } else if (isMac) {
      window.open(storeUrls.mac, '_blank');
    } else {
      window.open(storeUrls.fallback, '_blank');
    }
  }
}





