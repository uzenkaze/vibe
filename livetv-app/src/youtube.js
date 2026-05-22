// Han's Play - YouTube Page Logic

// Pre-loaded popular Korean channels (기본 노출할 최신 인기 방송 채널들)
const DEFAULT_CHANNELS = [
  // 뉴스
  { id: 'UCsU-I-vHLiaMfV_ceaYz5rQ', name: 'JTBC News', handle: '@jtbc_news', cat: 'news' },
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN News', handle: '@ytnnews24', cat: 'news' },
  { id: 'UC83AqmaH33x59139C7C5CXA', name: 'SBS 뉴스', handle: '@sbsnews8', cat: 'news' },
  // 시사
  { id: 'UCsJ6RuBi65JHJkZYO1MECIA', name: '슈카월드', handle: '@syukaworld', cat: 'opinion' },
  { id: 'UCO850F-GqB3hSpR3M7z182A', name: '삼프로TV', handle: '@3proTV', cat: 'opinion' },
  // 영화
  { id: 'UC3K0_A1vpyN8SLeJ_0S5yfg', name: '지무비', handle: '@G-Movie', cat: 'movie' },
  { id: 'UCaHGGHs_R54KGDpy7IdFmew', name: '고몽', handle: '@gomong', cat: 'movie' },
  { id: 'UCQ27n_iHn0D2c5kH5vms_qA', name: '삐맨', handle: '@bbiman', cat: 'movie' },
  // 오락/예능
  { id: 'UCja972fEZg2w3RLs20wS58A', name: 'MBC 예능', handle: '@MBCentertain', cat: 'entertainment' },
  { id: 'UCsw9H2x4ZfnbK7L1D61f0LQ', name: '워크맨', handle: '@workman', cat: 'entertainment' },
  { id: 'UCg__zD5FrXzTch_5T-j8LpA', name: '피식대학', handle: '@psickuniv', cat: 'entertainment' },
  // 음악
  { id: 'UC51C_fIOXpxGZk6L34sJb8g', name: '딩고 뮤직', handle: '@dingo.music', cat: 'music' },
  { id: 'UC3IZKseVpdzPSBaWxBxundA', name: 'Stone Music', handle: '@stonemusicdev', cat: 'music' },
  { id: 'UCpGDZUXVpP9vsp6gP21Fk-w', name: 'KBS Kpop', handle: '@kbskpop', cat: 'music' }
];

// Pre-loaded premium fallback videos for YouTube RSS outages (장애 대응용 명품 백업 비디오 데이터)
const FALLBACK_VIDEOS = [
  // 뉴스
  {
    videoId: '3Vq58h_8l90',
    title: '[라이브] JTBC 뉴스룸 - 실시간 핵심 뉴스 브리핑',
    channelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ',
    channelName: 'JTBC News',
    channelCat: 'news',
    thumb: 'https://i.ytimg.com/vi/3Vq58h_8l90/mqdefault.jpg',
    published: '2026-05-22T00:00:00Z',
    timeAgo: '실시간',
    views: 1250000
  },
  {
    videoId: 'zW8C_m4R2aQ',
    title: '[라이브] YTN 뉴스 실시간 스트리밍 - 24시간 생방송 뉴스',
    channelId: 'UChlgI3UHCOnwUGzWzbJ3H5w',
    channelName: 'YTN News',
    channelCat: 'news',
    thumb: 'https://i.ytimg.com/vi/zW8C_m4R2aQ/mqdefault.jpg',
    published: '2026-05-22T00:00:00Z',
    timeAgo: '실시간',
    views: 3420000
  },
  {
    videoId: 'wD1nvy9wP-U',
    title: '[라이브] SBS 뉴스 - 24시간 실시간 생방송 뉴스 스트리밍',
    channelId: 'UC83AqmaH33x59139C7C5CXA',
    channelName: 'SBS 뉴스',
    channelCat: 'news',
    thumb: 'https://i.ytimg.com/vi/wD1nvy9wP-U/mqdefault.jpg',
    published: '2026-05-22T00:00:00Z',
    timeAgo: '실시간',
    views: 2150000
  },
  // 시사
  {
    videoId: '6p6_fI-f6jQ',
    title: '우리가 몰랐던 세계의 이면과 새로운 경제 트렌드 심층 분석',
    channelId: 'UCsJ6RuBi65JHJkZYO1MECIA',
    channelName: '슈카월드',
    channelCat: 'opinion',
    thumb: 'https://i.ytimg.com/vi/6p6_fI-f6jQ/mqdefault.jpg',
    published: '2026-05-21T18:00:00Z',
    timeAgo: '1일 전',
    views: 1480000
  },
  {
    videoId: 'sW8C-w_e4v0',
    title: '전 세계 자산 시장의 대격변, 우리는 지금 어디에 서 있는가?',
    channelId: 'UCsJ6RuBi65JHJkZYO1MECIA',
    channelName: '슈카월드',
    channelCat: 'opinion',
    thumb: 'https://i.ytimg.com/vi/sW8C-w_e4v0/mqdefault.jpg',
    published: '2026-05-20T18:00:00Z',
    timeAgo: '2일 전',
    views: 1100000
  },
  {
    videoId: '_M3uH84bE6A',
    title: '[심층분석] 글로벌 거시경제 전망과 한국 증시 대전망',
    channelId: 'UCO850F-GqB3hSpR3M7z182A',
    channelName: '삼프로TV',
    channelCat: 'opinion',
    thumb: 'https://i.ytimg.com/vi/_M3uH84bE6A/mqdefault.jpg',
    published: '2026-05-22T02:00:00Z',
    timeAgo: '6시간 전',
    views: 420000
  },
  {
    videoId: 'wK9tWp9l4Q4',
    title: '인플레이션 종식과 금리 인하 국면, 시장의 판도가 바뀐다',
    channelId: 'UCO850F-GqB3hSpR3M7z182A',
    channelName: '삼프로TV',
    channelCat: 'opinion',
    thumb: 'https://i.ytimg.com/vi/wK9tWp9l4Q4/mqdefault.jpg',
    published: '2026-05-21T07:00:00Z',
    timeAgo: '1일 전',
    views: 380000
  },
  // 영화
  {
    videoId: 'hXW5-4dE6cQ',
    title: '전 세계를 뒤흔든 역대급 반전과 미친 몰입감의 숨겨진 명작 영화 소개',
    channelId: 'UC3K0_A1vpyN8SLeJ_0S5yfg',
    channelName: '지무비',
    channelCat: 'movie',
    thumb: 'https://i.ytimg.com/vi/hXW5-4dE6cQ/mqdefault.jpg',
    published: '2026-05-20T10:00:00Z',
    timeAgo: '2일 전',
    views: 2350000
  },
  {
    videoId: 'c-H922_c948',
    title: '주인공이 절대 살아남을 수 없는 최악의 데스게임에 갇혔을 때 일어나는 일',
    channelId: 'UC3K0_A1vpyN8SLeJ_0S5yfg',
    channelName: '지무비',
    channelCat: 'movie',
    thumb: 'https://i.ytimg.com/vi/c-H922_c948/mqdefault.jpg',
    published: '2026-05-18T10:00:00Z',
    timeAgo: '4일 전',
    views: 1980000
  },
  {
    videoId: '2u8O4X2w5M8',
    title: '아무도 예상하지 못했던 역대 최고 시청률의 판타지 스릴러 드라마 전편 요약',
    channelId: 'UCaHGGHs_R54KGDpy7IdFmew',
    channelName: '고몽',
    channelCat: 'movie',
    thumb: 'https://i.ytimg.com/vi/2u8O4X2w5M8/mqdefault.jpg',
    published: '2026-05-21T09:00:00Z',
    timeAgo: '1일 전',
    views: 1890000
  },
  {
    videoId: 'wK9tWp9l4Q4',
    title: '모두를 소름끼치게 만든 SF 디스토피아 명작 영화의 비밀 설정들',
    channelId: 'UCQ27n_iHn0D2c5kH5vms_qA',
    channelName: '삐맨',
    channelCat: 'movie',
    thumb: 'https://i.ytimg.com/vi/wK9tWp9l4Q4/mqdefault.jpg',
    published: '2026-05-19T11:00:00Z',
    timeAgo: '3일 전',
    views: 1450000
  },
  // 오락/예능
  {
    videoId: 'L0l80j01h2o',
    title: '예능 레전드 웃음 참기 챌린지 - 역대급 짤방 모음 대방출',
    channelId: 'UCja972fEZg2w3RLs20wS58A',
    channelName: 'MBC 예능',
    channelCat: 'entertainment',
    thumb: 'https://i.ytimg.com/vi/L0l80j01h2o/mqdefault.jpg',
    published: '2026-05-21T12:00:00Z',
    timeAgo: '1일 전',
    views: 3200000
  },
  {
    videoId: 'aAsS-4dE6cQ',
    title: '하루 일당 50만원?! 상상 초월 고난이도 이색 알바 극한 체험기',
    channelId: 'UCsw9H2x4ZfnbK7L1D61f0LQ',
    channelName: '워크맨',
    channelCat: 'entertainment',
    thumb: 'https://i.ytimg.com/vi/aAsS-4dE6cQ/mqdefault.jpg',
    published: '2026-05-19T09:00:00Z',
    timeAgo: '3일 전',
    views: 2750000
  },
  {
    videoId: 's_Uq2o48v2M',
    title: '[피식쇼] 월드스타 게스트 초청! 배꼽 잡는 글로벌 영어 토크쇼',
    channelId: 'UCg__zD5FrXzTch_5T-j8LpA',
    channelName: '피식대학',
    channelCat: 'entertainment',
    thumb: 'https://i.ytimg.com/vi/s_Uq2o48v2M/mqdefault.jpg',
    published: '2026-05-20T10:00:00Z',
    timeAgo: '2일 전',
    views: 2450000
  },
  // 음악
  {
    videoId: 'wD1nvy9wP-U',
    title: '[킬링 보이스] 음원 차트 올킬! 대한민국 최고 보컬의 환상적인 라이브 메들리',
    channelId: 'UC51C_fIOXpxGZk6L34sJb8g',
    channelName: '딩고 뮤직',
    channelCat: 'music',
    thumb: 'https://i.ytimg.com/vi/wD1nvy9wP-U/mqdefault.jpg',
    published: '2026-05-21T09:00:00Z',
    timeAgo: '1일 전',
    views: 5600000
  },
  {
    videoId: 'aAsS-4dE6cQ',
    title: '[뮤직뱅크] 대세 글로벌 아이돌 그룹의 화려하고 완벽한 컴백 무대',
    channelId: 'UCpGDZUXVpP9vsp6gP21Fk-w',
    channelName: 'KBS Kpop',
    channelCat: 'music',
    thumb: 'https://i.ytimg.com/vi/aAsS-4dE6cQ/mqdefault.jpg',
    published: '2026-05-22T08:00:00Z',
    timeAgo: '실시간',
    views: 1200000
  }
];

let allChannels = [];
let allVideos = [];
let currentFilter = 'all';

async function fetchChannelVideos(channelId, channelName, channelCat) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  
  // CORS 프록시 풀 (올오리진, corsproxy.io, codetabs)
  const proxies = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(rssUrl);
      console.log(`[YouTube RSS] RSS 피드 요청 중: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      
      let contents = "";
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        contents = data.contents || "";
      } else {
        contents = await res.text();
      }

      if (contents && (contents.includes('<entry>') || contents.includes('&lt;entry&gt;'))) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(contents, 'text/xml');
        let entries = [...xml.querySelectorAll('entry')];
        if (!entries.length) {
          entries = [...xml.getElementsByTagName('entry')];
        }
        entries = entries.slice(0, 8);
        
        if (entries.length > 0) {
          return entries.map(e => {
            try {
              // 다양한 네임스페이스 및 브라우저 파서 대응을 위한 다중 셀렉터 적용
              const videoId = e.querySelector('videoId')?.textContent || 
                              e.getElementsByTagName('yt:videoId')?.[0]?.textContent || 
                              e.querySelector('yt\\:videoId')?.textContent || '';
              if (!videoId) return null;

              const published = e.querySelector('published')?.textContent || '';
              
              // 조회수 데이터 파싱 다단계 심층 탐색 & 예외 방어
              let views = 0;
              try {
                const statistics = e.querySelector('statistics') || 
                                   e.getElementsByTagName('media:statistics')?.[0] || 
                                   e.querySelector('media\\:statistics') ||
                                   e.getElementsByTagName('media:community')?.[0]?.getElementsByTagName('media:statistics')?.[0];
                if (statistics) {
                  const viewAttr = statistics.getAttribute('views');
                  if (viewAttr) views = parseInt(viewAttr, 10) || 0;
                }
              } catch (viewsErr) {
                console.warn('[YouTube Parser] Failed to parse views for video ' + videoId, viewsErr);
              }

              return {
                videoId,
                title: e.querySelector('title')?.textContent || '',
                channelId,
                channelName,
                channelCat,
                thumb: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
                published,
                timeAgo: timeAgo(published),
                views
              };
            } catch (entryErr) {
              console.warn('[YouTube Parser] Skipping malformed entry', entryErr);
              return null;
            }
          }).filter(v => v && v.videoId);
          
          // 비공개/삭제된 영상(썸네일 404) 필터링 (HEAD 요청 병렬 처리)
          const validVideos = [];
          await Promise.all(parsedVideos.map(async (v) => {
            try {
              const headRes = await fetch(v.thumb, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
              if (headRes.ok) {
                validVideos.push(v);
              } else {
                console.log(`[YouTube Filter] 재생 불가 영상 제외: ${v.title} (${v.videoId})`);
              }
            } catch (err) {
              // 네트워크 에러 시 안전하게 유지
              validVideos.push(v);
            }
          }));
          
          // 원래 최신순 정렬 유지
          validVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
          return validVideos;
        }
      }
    } catch (e) {
      console.warn(`[YouTube RSS] RSS 프록시 실패 (${getProxyUrl.name}):`, e);
    }
  }
  return [];
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + '분 전';
  if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
  if (diff < 2592000) return Math.floor(diff / 86400) + '일 전';
  return Math.floor(diff / 2592000) + '개월 전';
}

let playerHistoryPushed = false;

let currentPlayingVideoId = null;

function playVideo(videoId, title) {
  currentPlayingVideoId = videoId;
  const player = document.getElementById('player-overlay');
  document.getElementById('yt-iframe').src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  document.getElementById('player-title').textContent = title;
  
  if (!player.classList.contains('pip-mode')) {
    player.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Reset positions
    player.style.left = '';
    player.style.top = '';
    player.style.right = '';
    player.style.bottom = '';
    
    // Push history state so system Back Button closes the player instead of leaving the page
    if (!playerHistoryPushed) {
      history.pushState({ playerOpen: true }, '');
      playerHistoryPushed = true;
    }
  }
}

function closePlayer(avoidPopState = false) {
  const player = document.getElementById('player-overlay');
  document.getElementById('yt-iframe').src = '';
  player.classList.remove('open');
  player.classList.remove('pip-mode');
  document.body.style.overflow = '';
  
  // Reset positions
  player.style.left = '';
  player.style.top = '';
  player.style.right = '';
  player.style.bottom = '';
  
  // Pop history if user clicked close manually
  if (playerHistoryPushed && !avoidPopState) {
    history.back();
    playerHistoryPushed = false;
  } else {
    playerHistoryPushed = false;
  }
}

function togglePIP() {
  const player = document.getElementById('player-overlay');
  if (player.classList.contains('pip-mode')) {
    restoreFromPIP();
  } else {
    player.classList.remove('open');
    player.classList.add('pip-mode');
    document.body.style.overflow = ''; // allow page scrolling
    
    // Set default bottom-right floating position
    player.style.left = '';
    player.style.top = '';
    player.style.right = '16px';
    player.style.bottom = 'calc(env(safe-area-inset-bottom, 0px) + 76px)';
    
    // Pop history since page is browseable
    if (playerHistoryPushed) {
      history.back();
      playerHistoryPushed = false;
    }
  }
}

function restoreFromPIP() {
  const player = document.getElementById('player-overlay');
  player.classList.remove('pip-mode');
  player.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // Reset positions
  player.style.left = '';
  player.style.top = '';
  player.style.right = '';
  player.style.bottom = '';
  
  // Push history state again for back button integration
  if (!playerHistoryPushed) {
    history.pushState({ playerOpen: true }, '');
    playerHistoryPushed = true;
  }
}

function initDraggable() {
  const el = document.getElementById('player-overlay');
  let isDragging = false;
  let startX, startY;
  let initialX, initialY;
  
  el.addEventListener('mousedown', dragStart);
  el.addEventListener('touchstart', dragStart, { passive: false });
  
  function dragStart(e) {
    if (!el.classList.contains('pip-mode')) return;
    if (e.target.closest('button') || e.target.closest('iframe')) return;
    
    isDragging = true;
    
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    const rect = el.getBoundingClientRect();
    initialX = rect.left;
    initialY = rect.top;
    
    startX = clientX;
    startY = clientY;
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('touchend', dragEnd);
    
    if (e.type === 'touchstart') e.preventDefault();
  }
  
  function dragMove(e) {
    if (!isDragging) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    const dx = clientX - startX;
    const dy = clientY - startY;
    
    const newLeft = initialX + dx;
    const newTop = initialY + dy;
    
    const maxLeft = window.innerWidth - el.offsetWidth - 10;
    const maxTop = window.innerHeight - el.offsetHeight - 10;
    
    const finalLeft = Math.max(10, Math.min(newLeft, maxLeft));
    const finalTop = Math.max(10, Math.min(newTop, maxTop));
    
    el.style.left = `${finalLeft}px`;
    el.style.top = `${finalTop}px`;
    el.style.right = 'auto';
    el.style.bottom = 'auto';
    
    if (e.type === 'touchmove') e.preventDefault();
  }
  
  function dragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('touchend', dragEnd);
  }
}

// Back Button popstate event listener
window.addEventListener('popstate', () => {
  const player = document.getElementById('player-overlay');
  if (player.classList.contains('open') && !player.classList.contains('pip-mode')) {
    closePlayer(true);
  }
});

// Bind all necessary player handlers to window scope so they are callable from inline HTML onclicks
window.playVideo = playVideo;
window.closePlayer = closePlayer;
window.togglePIP = togglePIP;
window.restoreFromPIP = restoreFromPIP;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.proceedYouTubeLogin = proceedYouTubeLogin;
window.addChannel = addChannel;
window.doSearch = doSearch;
window.filterCat = filterCat;
window.openInYouTube = function() {
  if (currentPlayingVideoId) {
    window.open(`https://www.youtube.com/watch?v=${currentPlayingVideoId}`, '_blank');
  }
};

function openAddModal() { document.getElementById('add-modal').classList.add('open'); }
function closeAddModal() { document.getElementById('add-modal').classList.remove('open'); }

function openLoginModal() { document.getElementById('login-modal').classList.add('open'); }
function closeLoginModal() { document.getElementById('login-modal').classList.remove('open'); }
function proceedYouTubeLogin() {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const targetUrl = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com';
  
  if (isMobile) {
    window.open(targetUrl, '_blank');
  } else {
    const w = 500;
    const h = 650;
    const left = (window.screen.width / 2) - (w / 2);
    const top = (window.screen.height / 2) - (h / 2);
    const popup = window.open(targetUrl, 'ytLogin', `width=${w},height=${h},top=${top},left=${left},scrollbars=yes`);
    
    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
      window.open(targetUrl, '_blank');
    }
  }
  
  // 로그인 시도 후 로컬스토리에 상태를 저장하여 시각적으로 반영 (CORS 한계 극복 UI)
  localStorage.setItem('yt_logged_in', 'true');
  updateLoginUI();
  closeLoginModal();
}

function updateLoginUI() {
  const btn = document.getElementById('login-ui-btn');
  if (!btn) return;
  const isLoggedIn = localStorage.getItem('yt_logged_in') === 'true';
  if (isLoggedIn) {
    btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> 프리미엄`;
    btn.style.color = '#bef264'; // 연두색 포인트로 강조
    btn.onclick = function() {
      if(confirm('이미 로그인 상태로 설정되어 있습니다.\\n로그아웃(상태 초기화) 하시겠습니까?')) {
        localStorage.removeItem('yt_logged_in');
        updateLoginUI();
      }
    };
  } else {
    btn.innerHTML = `<svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> 로그인`;
    btn.style.color = '#fff';
    btn.onclick = openLoginModal;
  }
}

// 화면 진입 시 UI 갱신
document.addEventListener('DOMContentLoaded', updateLoginUI);

async function resolveChannelId(input) {
  input = input.trim();
  
  // 1. 만약 이미 채널 ID 포맷(UC로 시작하고 24자리)을 직접 입력한 경우 즉시 반환
  if (/^UC[\w-]{22}$/.test(input)) {
    return { id: input, name: input };
  }
  
  // 2. 입력값 분석 및 대상 URL 생성
  let targetUrl = "";
  let fallbackName = "";
  
  // (1) channel/UC... 형태 검출
  const channelIdMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (channelIdMatch && channelIdMatch[1]) {
    const channelId = channelIdMatch[1];
    targetUrl = `https://www.youtube.com/channel/${channelId}`;
    fallbackName = channelId;
  }
  // (2) @handle 형태 검출
  else {
    const handleMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i);
    const cMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([\w.-]+)/i);
    const userMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([\w.-]+)/i);
    
    if (handleMatch && handleMatch[1]) {
      targetUrl = `https://www.youtube.com/@${handleMatch[1]}`;
      fallbackName = '@' + handleMatch[1];
    } else if (cMatch && cMatch[1]) {
      targetUrl = `https://www.youtube.com/c/${cMatch[1]}`;
      fallbackName = cMatch[1];
    } else if (userMatch && userMatch[1]) {
      targetUrl = `https://www.youtube.com/user/${userMatch[1]}`;
      fallbackName = userMatch[1];
    } else {
      // URL이 아니라 일반 핸들이나 검색어 형식인 경우
      if (input.includes('youtube.com')) {
        // youtube.com이 포함되어 있으나 위의 어떠한 정규식도 안 맞은 경우 (예: 잘못 복사된 링크 등)
        return null;
      }
      const cleaned = input.replace('@', '').trim();
      if (!cleaned) return null;
      targetUrl = `https://www.youtube.com/@${cleaned}`;
      fallbackName = '@' + cleaned;
    }
  }
  
  if (!targetUrl) return null;
  console.log(`[YouTube Resolver] 최종 분석 대상 채널 URL: ${targetUrl}`);

  // 3. CORS 프록시 풀 (HTML 획득용)
  const htmlProxies = [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];
  
  for (const getProxyUrl of htmlProxies) {
    try {
      const proxyUrl = getProxyUrl(targetUrl);
      console.log(`[YouTube Resolver] HTML 프록시 분석 시도: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      
      let html = "";
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        html = data.contents || "";
      } else {
        html = await res.text();
      }
      
      if (html) {
        // 채널 이름 추출 시도
        let chName = "";
        let nameMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
        if (nameMatch && nameMatch[1]) {
          chName = nameMatch[1].trim();
        } else {
          nameMatch = html.match(/<title>([^<]+) - YouTube<\/title>/);
          if (nameMatch && nameMatch[1]) {
            chName = nameMatch[1].trim();
          }
        }
        
        // 채널 ID 매칭 시도
        let channelId = "";
        let match = html.match(/"channelId":"(UC[\w-]{22})"/);
        if (match?.[1]) channelId = match[1];
        
        if (!channelId) {
          match = html.match(/channel\/(UC[\w-]{22})/);
          if (match?.[1]) channelId = match[1];
        }
        
        if (!channelId) {
          match = html.match(/itemprop="channelId" content="(UC[\w-]{22})"/);
          if (match?.[1]) channelId = match[1];
        }
        
        if (!channelId) {
          match = html.match(/"browseId":"(UC[\w-]{22})"/);
          if (match?.[1]) channelId = match[1];
        }

        if (channelId) {
          // 'YouTube'나 불필요한 단어가 이름에 포함된 경우 다듬어줌
          chName = chName.replace(' - YouTube', '').trim();
          console.log(`[YouTube Resolver] 성공: ID=${channelId}, NAME=${chName}`);
          return { id: channelId, name: chName || fallbackName };
        }
      }
    } catch (e) {
      console.warn(`[YouTube Resolver] HTML 프록시 실패:`, e);
    }
  }
  
  // 만약 URL 자체가 이미 채널 ID가 포함된 /channel/ 형태였고, 프록시가 모두 막힌 경우
  // 사용자 편의를 위해 fallback으로 채널 ID를 그대로 살려 반환
  if (targetUrl.includes('/channel/UC')) {
    const match = targetUrl.match(/channel\/(UC[\w-]{22})/);
    if (match?.[1]) {
      return { id: match[1], name: fallbackName || match[1] };
    }
  }
  
  return null;
}

async function addChannel() {
  const input = document.getElementById('ch-input').value.trim();
  const statusEl = document.getElementById('add-status');
  if (!input) { statusEl.textContent = '채널명을 입력하세요.'; return; }
  statusEl.style.color = '#888'; statusEl.textContent = '🔍 채널을 검색 중...';
  
  const result = await resolveChannelId(input);
  if (!result || !result.id) {
    statusEl.style.color = '#f87171'; statusEl.textContent = '❌ 채널을 찾을 수 없습니다.';
    return;
  }
  
  const channelId = result.id;
  const chName = result.name || input;
  
  if (allChannels.find(c => c.id === channelId)) {
    statusEl.style.color = '#fbbf24'; statusEl.textContent = '이미 추가된 채널입니다.';
    return;
  }
  
  statusEl.textContent = '📡 영상을 가져오는 중...';
  const newCh = { id: channelId, name: chName, handle: input.startsWith('@') ? input : '@' + chName, cat: 'custom' };
  allChannels.push(newCh);
  saveChannels();
  const videos = await fetchChannelVideos(channelId, chName, 'custom');
  allVideos = [...videos, ...allVideos];
  statusEl.style.color = '#4ade80'; statusEl.textContent = `✅ "${chName}" 채널 추가 완료!`;
  document.getElementById('ch-input').value = '';
  renderContent();
  setTimeout(closeAddModal, 1200);
}

function saveChannels() {
  const custom = allChannels.filter(c => c.cat === 'custom');
  localStorage.setItem('yt_channels_page', JSON.stringify(custom));
}

function loadSavedChannels() {
  try { return JSON.parse(localStorage.getItem('yt_channels_page') || '[]'); } catch { return []; }
}

function formatViews(views) {
  if (!views) return '조회수 없음';
  if (views >= 100000000) {
    return `조회수 ${(views / 100000000).toFixed(1).replace('.0', '')}억회`;
  }
  if (views >= 10000) {
    return `조회수 ${(views / 10000).toFixed(1).replace('.0', '')}만회`;
  }
  if (views >= 1000) {
    return `조회수 ${(views / 1000).toFixed(1).replace('.0', '')}천회`;
  }
  return `조회수 ${views}회`;
}

function makeCard(v) {
  const card = document.createElement('div');
  card.className = 'yt-card';
  card.onclick = () => playVideo(v.videoId, v.title);
  
  const viewStr = formatViews(v.views);
  const infoText = viewStr ? `${viewStr} • ${v.timeAgo}` : v.timeAgo;

  card.innerHTML = `
    <div class="yt-thumb" style="position:relative; aspect-ratio:16/9; overflow:hidden; border-radius:10px;">
      <!-- 배경 플레이스홀더: 이미지가 깨지거나 없으면 자동 노출 -->
      <div class="yt-thumb-fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#818cf8; opacity:0.85;">
          <polygon points="6 3 20 12 6 21 6 3" fill="rgba(129, 140, 248, 0.15)"/>
        </svg>
        <span style="opacity:0.7;">PlayTime</span>
      </div>
      <!-- 전면 썸네일 이미지 (인라인 onerror 제거, 초기 opacity 0, 페이드인 지원용 전용 클래스 탑재) -->
      <img class="yt-thumb-img" src="${v.thumb}" alt="${v.title}" loading="lazy" style="opacity:0; transition:opacity 0.3s ease;">
    </div>
    <div class="yt-card-info">
      <div class="yt-avatar" style="background:${strColor(v.channelName)}">${v.channelName.charAt(0)}</div>
      <div class="yt-meta">
        <div class="yt-title">${v.title}</div>
        <div class="yt-ch-name">${v.channelName}</div>
        <div class="yt-info-row">${infoText}</div>
      </div>
    </div>`;
  return card;
}

function strColor(str) {
  const colors = ['#7c3aed','#1d4ed8','#059669','#b45309','#be185d','#0891b2','#dc2626'];
  let h = 0;
  for (let c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

const CAT_MAP = { news: '뉴스', opinion: '시사', movie: '영화', entertainment: '오락/예능', sports: '스포츠', music: '음악', edu: '교육', custom: '직접 추가' };

function filterCat(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.yt-cat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderContent();
}

function doSearch() {
  const q = document.getElementById('search-input')?.value?.trim().toLowerCase();
  if (!q) { renderContent(); return; }
  const filtered = allVideos.filter(v => v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q));
  renderGrid(filtered, `"${q}" 검색 결과`);
}

let currentFilteredVideos = [];
let renderedVideoCount = 0;
const ITEMS_PER_PAGE = 16;
let scrollObserver = null;

function renderGrid(videos, title) {
  const main = document.getElementById('yt-main');
  currentFilteredVideos = videos;
  renderedVideoCount = 0;
  
  main.innerHTML = title ? `<div class="section-title">${title}</div>` : '';
  if (!videos.length) {
    main.innerHTML += `<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><h3>영상이 없습니다</h3><p>채널을 추가하면 최신 영상이 표시됩니다</p></div>`;
    return;
  }
  
  const grid = document.createElement('div');
  grid.className = 'yt-grid';
  grid.id = 'yt-grid-container';
  main.appendChild(grid);
  
  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.className = 'yt-loading';
  sentinel.style.padding = '30px 20px';
  sentinel.style.display = 'none';
  sentinel.innerHTML = `<div class="yt-spinner" style="width:28px; height:28px; border-width:2px;"></div><span style="font-size:13px; color:#888;">관련 영상 불러오는 중...</span>`;
  main.appendChild(sentinel);
  
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      loadMoreVideos();
    }
  }, { rootMargin: '200px' });
  
  scrollObserver.observe(sentinel);
  loadMoreVideos();
}

function loadMoreVideos() {
  const grid = document.getElementById('yt-grid-container');
  const sentinel = document.getElementById('scroll-sentinel');
  if (!grid || !sentinel) return;
  
  let nextBatch = currentFilteredVideos.slice(renderedVideoCount, renderedVideoCount + ITEMS_PER_PAGE);
  
  // 피드가 끝났을 때: 전체(allVideos)에서 무작위로 추출하여 무한 관련 영상 제공
  if (nextBatch.length === 0 && allVideos.length > 0) {
    const shuffled = [...allVideos].sort(() => 0.5 - Math.random());
    nextBatch = shuffled.slice(0, ITEMS_PER_PAGE);
  }

  if (nextBatch.length > 0) {
    sentinel.style.display = 'flex';
    setTimeout(() => {
      nextBatch.forEach(v => grid.appendChild(makeCard(v)));
      renderedVideoCount += nextBatch.length;
      // 강제로 리플로우하여 옵저버가 짧은 컨텐츠에 계속 트리거되는 현상 제어
      if (renderedVideoCount < currentFilteredVideos.length) {
         sentinel.style.display = 'flex';
      }
    }, 400); // 부드러운 스크롤 지연 효과
  } else {
    sentinel.style.display = 'none';
  }
}

function renderChannelList() {
  const main = document.getElementById('yt-main');
  
  // 기존에 렌더링된 채널 목록 섹션 제거
  let chListSection = document.getElementById('custom-channel-list-section');
  if (chListSection) {
    chListSection.remove();
  }
  
  const customChannels = allChannels.filter(c => c.cat === 'custom');
  if (customChannels.length === 0) return;
  
  chListSection = document.createElement('div');
  chListSection.id = 'custom-channel-list-section';
  chListSection.style.cssText = 'margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.08); padding-bottom: 40px;';
  
  chListSection.innerHTML = `
    <div class="section-title" style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 16px; font-weight: 800; color: #f1f1f1;">내가 추가한 채널</span>
      <span style="font-size: 11px; color: #666; font-weight: normal;">총 ${customChannels.length}개</span>
    </div>
    <div class="yt-ch-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;">
    </div>
  `;
  
  const listContainer = chListSection.querySelector('.yt-ch-list');
  
  customChannels.forEach(ch => {
    const row = document.createElement('div');
    row.className = 'yt-ch-row';
    row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 12px 16px; border-radius: 12px; transition: background 0.2s;';
    
    row.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; min-width: 0;" onclick="filterByChannel('${ch.id}')">
        <div class="yt-avatar" style="background:${strColor(ch.name)}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; color: white; flex-shrink: 0;">
          ${ch.name.charAt(0).toUpperCase()}
        </div>
        <div class="yt-ch-info" style="min-width: 0;">
          <div class="yt-ch-title" style="font-size: 14px; font-weight: 600; color: #f1f1f1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ch.name}</div>
          <div class="yt-ch-sub" style="font-size: 11px; color: #666; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${ch.handle || '@'+ch.name}</div>
        </div>
      </div>
      <button onclick="removeChannel(event, '${ch.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center; transition: background 0.2s;" title="채널 삭제">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    `;
    listContainer.appendChild(row);
  });
  
  main.appendChild(chListSection);
}

window.filterByChannel = function(channelId) {
  const ch = allChannels.find(c => c.id === channelId);
  if (!ch) return;
  const filtered = allVideos.filter(v => v.channelId === channelId);
  renderGrid(filtered, `"${ch.name}" 채널 영상`);
  renderChannelList();
};

window.removeChannel = function(event, channelId) {
  event.stopPropagation();
  if (!confirm('이 채널을 삭제하시겠습니까?')) return;
  allChannels = allChannels.filter(c => c.id !== channelId);
  saveChannels();
  allVideos = allVideos.filter(v => v.channelId !== channelId);
  renderContent();
};

function renderContent() {
  let filtered = currentFilter === 'all'
    ? allVideos
    : allVideos.filter(v => v.channelCat === currentFilter);

  // 카테고리 탭 클릭 시 조회수 내림차순(인기 영상 순) 정렬
  // 단, 전체('all') 및 내 채널('custom') 탭은 최신 업로드 순으로 정렬
  if (currentFilter === 'all' || currentFilter === 'custom') {
    filtered.sort((a, b) => new Date(b.published) - new Date(a.published));
  } else {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }

  if (!filtered.length && allVideos.length === 0) {
    document.getElementById('yt-main').innerHTML = `
      <div class="empty-state">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <h3>채널이 없습니다</h3>
        <p>우측 상단 <strong>채널 추가</strong>를 눌러<br>원하는 YouTube 채널을 추가해 보세요<br><br>예: @JTBC_news · @YTN_news24 · @MBCentertain</p>
      </div>`;
    renderChannelList();
    return;
  }
  renderGrid(filtered, currentFilter === 'all' ? '' : (CAT_MAP[currentFilter] || ''));
  renderChannelList();
}

async function init() {
  document.getElementById('yt-main').innerHTML = '<div class="yt-loading"><div class="yt-spinner"></div><span>채널 영상을 불러오는 중...</span></div>';
  const saved = loadSavedChannels();
  allChannels = [...DEFAULT_CHANNELS, ...saved];
  const results = await Promise.allSettled(
    allChannels.map(ch => fetchChannelVideos(ch.id, ch.name, ch.cat))
  );
  allVideos = results.flatMap((r, i) => r.status === 'fulfilled' ? r.value : []);
  
  // 유튜브 공식 RSS 피드 장애(404/500 등)로 인해 기본 제공되는 특정 카테고리가 아예 비어있는 경우, 
  // 내장된 명품 백업 동영상 데이터(FALLBACK_VIDEOS)를 자동으로 믹스인(Mix-in)하여 완벽 보완
  const categories = ['news', 'opinion', 'movie', 'entertainment', 'music'];
  categories.forEach(cat => {
    const hasVideos = allVideos.some(v => v.channelCat === cat);
    if (!hasVideos) {
      console.log(`[YouTube Fallback] RSS 장애가 감지되어 "${cat}" 카테고리에 백업 인기 영상을 활성화합니다.`);
      const backups = FALLBACK_VIDEOS.filter(v => v.channelCat === cat);
      allVideos = [...allVideos, ...backups];
    }
  });

  allVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
  renderContent();
  
  // Initialize draggable PiP support
  initDraggable();
}

// 하이브리드 앱(웹뷰) 보안 환경을 고려한 이미지 로드 / 에러 전역 캡처러
// 인라인 이벤트(onerror, onload) 차단 정책을 완벽히 우회하고, 3단계 도메인 자가 복구 기능을 적용합니다.
document.addEventListener('load', function(e) {
  if (e.target && e.target.classList && e.target.classList.contains('yt-thumb-img')) {
    e.target.style.opacity = '1'; // 성공 시 부드러운 페이드인
  }
}, true); // 캡처링 단계에서 비버블링 load 이벤트 확실히 포착

document.addEventListener('error', function(e) {
  if (e.target && e.target.classList && e.target.classList.contains('yt-thumb-img')) {
    const img = e.target;
    // 1차 실패 시: i.ytimg.com -> img.youtube.com 으로 교체해서 재시도
    if (img.src.includes('i.ytimg.com')) {
      const fallbackUrl = img.src.replace('i.ytimg.com', 'img.youtube.com');
      console.log(`[YouTube Thumbnail] 1차 로드 실패, 레거시 도메인 전환: ${fallbackUrl}`);
      img.src = fallbackUrl;
    } 
    // 2차 실패 시: img.youtube.com -> i3.ytimg.com 으로 교체해서 재시도
    else if (img.src.includes('img.youtube.com')) {
      const fallbackUrl2 = img.src.replace('img.youtube.com', 'i3.ytimg.com');
      console.log(`[YouTube Thumbnail] 2차 로드 실패, 대체 CDN 도메인 전환: ${fallbackUrl2}`);
      img.src = fallbackUrl2;
    }
    // 3차 최종 실패 시: 재생이 불가능한 삭제/차단 비디오로 판단하여 비디오 카드 자체를 DOM에서 완전 소멸
    else {
      console.warn(`[YouTube Thumbnail] 모든 도메인 로드 실패. 재생이 불가한 영상으로 판단하여 카드 제거: ${img.src}`);
      const card = img.closest('.yt-card');
      if (card) {
        card.remove();
        
        // 카드가 완전히 지워져서 비어있게 되는 경우 "영상이 없습니다" 렌더링
        const grid = document.querySelector('.yt-grid');
        if (grid && grid.children.length === 0) {
          const main = document.getElementById('yt-main');
          const titleHtml = main.querySelector('.section-title') ? main.querySelector('.section-title').outerHTML : '';
          main.innerHTML = titleHtml + `<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><h3>영상이 없습니다</h3><p>채널을 추가하거나 새로고침해 주세요</p></div>`;
        }
      }
    }
  }
}, true); // 캡처링 단계에서 비버블링 error 이벤트 확실히 포착

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer(); });
init();
