// Han's Play - Ultimate Live TV Engine (Restored & Enhanced)

/* =================== CHANNELS DATA (100+ Channels) =================== */
const CHANNELS = [
  // 지상파 (KBS, MBC, SBS, EBS)
  { id: 'kbs1', name: 'KBS 1TV', network: 'KBS1', category: '지상파', kbsApiCode: '11', ytHandle: '@kbs1tv', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbs1hd/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbs1/live/playlist.m3u8',
    'http://203.251.91.122:1935/on-air-Backup/kbs1hd/playlist.m3u8'
  ] },
  { id: 'kbs2', name: 'KBS 2TV', network: 'KBS2', category: '지상파', kbsApiCode: '12', ytHandle: '@kbs2tv', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbs2hd/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbs2/live/playlist.m3u8',
    'http://203.251.91.122:1935/on-air-Backup/kbs2hd/playlist.m3u8'
  ] },
  { id: 'mbc', name: 'MBC', network: 'MBC', category: '지상파', ytHandle: '@MBCNEWS', urls: [
    'https://stream.bsmbc.com/livetv/BusanMBC_TV_onairstream/playlist.m3u8',
    'https://ns1.tjmbc.co.kr/live/myStream.sdp/playlist.m3u8',
    'https://stream.chmbc.co.kr/TV/myStream/playlist.m3u8',
    'https://wowza.jejumbc.com/live/tv_jejumbc/playlist.m3u8',
    'https://5c3639aa99149.streamlock.net/live_TV/tv/playlist.m3u8'
  ] },
  { id: 'sbs', name: 'SBS', network: 'SBS', category: '지상파', ytHandle: '@SBSnews8', urls: [
    'https://cjsbshls.gcdn.ntruss.com/cjb/cjb_1080p/playlist.m3u8',
    'https://knnhls.gcdn.ntruss.com/knn/knn_1080p/playlist.m3u8',
    'http://203.251.91.122:1935/on-air-Backup/tv/playlist.m3u8'
  ] },
  { id: 'ebs1', name: 'EBS 1', network: 'EBS1', category: '지상파', ytHandle: '@ebskorea', urls: ['https://ebsonair.ebs.co.kr/ebs1familypc/familypc1m/playlist.m3u8'] },
  { id: 'ebs2', name: 'EBS 2', network: 'EBS2', category: '지상파', urls: ['https://ebsonair.ebs.co.kr/ebs2familypc/familypc1m/playlist.m3u8'] },
  { id: 'obs', name: 'OBS 경인TV', network: 'OBS', category: '지상파', ytHandle: '@OBSKyungIn', urls: [
    'https://vod3.obs.co.kr:444/live/obsstream1/tv.stream/playlist.m3u8',
    'https://vod.obs.co.kr:444/live/obsstream1/tv.stream/playlist.m3u8'
  ] },

  // 종합편성
  { id: 'jtbc', name: 'JTBC', network: 'JTBC', category: '종합편성', ytHandle: '@jtbc_news', ytChannelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ', officialUrl: 'https://onair.jtbc.co.kr/', noPlayableHls: true, urls: [] },
  { id: 'tv_chosun', name: 'TV조선', network: 'TV_CHOSUN', category: '종합편성', ytHandle: '@tvchosunnews', ytChannelId: 'UCWlV3Lz_55UaX4JsMj-z__Q', officialUrl: 'http://broadcast.tvchosun.com/onair/on.cstv', noPlayableHls: true, urls: [] },
  { id: 'channel_a', name: '채널A', network: 'CHANNEL_A', category: '종합편성', ytHandle: '@channelA-news', officialUrl: 'https://www.ichannela.com/com/onair.do', noPlayableHls: true, urls: [] },
  { id: 'mbn', name: 'MBN', network: 'MBN', category: '종합편성', ytHandle: '@MBN_NEWS', ytChannelId: 'UCG9aFJTZ-lMCHAiO1KJsirg', officialUrl: 'https://www.mbn.co.kr/onair/', noPlayableHls: true, urls: [] },
  { id: 'jtbc2', name: 'JTBC2', network: 'JTBC', category: '종합편성', officialUrl: 'https://onair.jtbc.co.kr/', noPlayableHls: true, urls: [] },
  { id: 'jtbc4', name: 'JTBC4', network: 'JTBC', category: '종합편성', officialUrl: 'https://onair.jtbc.co.kr/', noPlayableHls: true, urls: [] },

  // 뉴스/경제
  { id: 'ytn', name: 'YTN', network: 'YTN', category: '뉴스/경제', ytHandle: '@ytnnews24', ytChannelId: 'UChLGqe01qeG0QnPsJXLTojg', urls: [
    'https://ytn-live.akamaized.net/hls/live/2038573/ytn/playlist.m3u8',
    'https://ytnlive-lh.akamaihd.net/i/ytn_1@300295/master.m3u8',
    'http://ytndmb.ytn.co.kr:1935/live/ytn/playlist.m3u8'
  ]},
  { id: 'yonhap', name: '연합뉴스TV', network: 'YONHAP', category: '뉴스/경제', ytHandle: '@yonhapnewstv23', ytChannelId: 'UCTHCOPwqNfZ0uiKOvFyhGwg', urls: [
    'https://yonhapnewstv.akamaized.net/hls/live/2039234/yonhapnewstv/playlist.m3u8',
    'https://yonhapnewstv-lh.akamaihd.net/i/yonhapnewstv_1@300303/master.m3u8'
  ]},
  { id: 'mtn', name: 'MTN 머니투데이', network: 'MTN', category: '뉴스/경제', ytChannelId: 'UC34z1u3F9Z8_q1QJ6g_8-Xw', urls: [
    'http://183.110.27.87/mtnlive/720/playlist.m3u8',
    'http://live.mtn.co.kr/hls/mtn/playlist.m3u8'
  ]},
  { id: 'ktv', name: 'KTV 국민방송', network: 'KTV', category: '뉴스/경제', ytHandle: '@KTVKorea', ytChannelId: 'UCj8Snyrs1y-wnBQiUmGrTjw', urls: [
    'https://hlive.ktv.go.kr/live/klive_h.stream/playlist.m3u8',
    'https://hlive.ktv.go.kr/live/klive_l.stream/playlist.m3u8'
  ]},
  { id: 'arirang', name: 'Arirang TV', network: 'ARIRANG', category: '뉴스/경제', ytHandle: '@arirangnews', ytChannelId: 'UCV2R_C_c4Xp8k-L1qT7_hSw', urls: [
    'https://amdlive-ch01.ctnd.com.edgesuite.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8',
    'http://amdlive-ch01.ctnd.com.edgesuite.net/arirang_1ch/smil:arirang_1ch.smil/playlist.m3u8'
  ]},
  { id: 'tbs', name: 'TBS 교통방송', network: 'TBS', category: '뉴스/경제', ytHandle: '@tbsnews', ytChannelId: 'UCF_yO86W0-S06z1L299OqYQ', urls: [
    'https://cdntv.tbs.seoul.kr/tbs/tbs_tv_web.smil/playlist.m3u8',
    'https://tbslive.tbs.seoul.kr/tbs/tbs_tv_web.smil/playlist.m3u8'
  ]},

  // 쇼핑
  { id: 'cj_shop', name: 'CJ 온스타일', network: 'CJ_SHOP', category: '쇼핑', urls: [
    'https://live-ch1.cjonstyle.net/cjmalllive/stream2/playlist.m3u8',
    'https://live-ch1.cjonstyle.net/cjmalllive/stream1/playlist.m3u8'
  ]},
  { id: 'gs_shop', name: 'GS SHOP', network: 'GS_SHOP', category: '쇼핑', urls: [
    'https://gstv-gsshop.gsshop.com/gsshop_hd/gsshop_hd.stream/playlist.m3u8',
    'https://gstv-gsshop.gsshop.com/gsshop_sd/gsshop_sd.stream/playlist.m3u8'
  ]},
  { id: 'lotte_shop', name: '롯데홈쇼핑', network: 'LOTTE_SHOP', category: '쇼핑', urls: [
    'https://pchlslivesw.lotteimall.com/live/livestream/lotteimalllive_mp4.m3u8',
    'https://pchlslive.lotteimall.com/live/livestream/lotteimalllive_mp4.m3u8'
  ]},
  { id: 'hyundai_shop', name: '현대홈쇼핑', network: 'HYUNDAI_SHOP', category: '쇼핑', urls: [
    'https://livejj.hyundaihmall.com:8443/live/ngrp:hmall.stream_pc/playlist.m3u8',
    'https://livejj.hyundaihmall.com:8443/live/ngrp:hmall.stream/playlist.m3u8'
  ]},
  { id: 'ns_shop', name: 'NS홈쇼핑', network: 'NS_SHOP', category: '쇼핑', urls: [
    'https://livestream.nsmall.com/IPHONE/nsmallMobile.m3u8',
    'https://livestream.nsmall.com/PC/nsmallPC.m3u8'
  ]},
  { id: 'shinsegae_shop', name: '신세계쇼핑', network: 'SHINSEGAE_SHOP', category: '쇼핑', urls: [
    'https://liveout.catenoid.net/live-02-shinsegaetvshopping/shinsegaetvshopping_720p/playlist.m3u8',
    'https://liveout.catenoid.net/live-02-shinsegaetvshopping/shinsegaetvshopping_480p/playlist.m3u8'
  ]},
  { id: 'w_shop', name: 'W쇼핑', network: 'W_SHOP', category: '쇼핑', urls: [
    'https://liveout.catenoid.net/live-05-wshopping/wshopping_1500k/playlist.m3u8',
    'https://liveout.catenoid.net/live-05-wshopping/wshopping_900k/playlist.m3u8'
  ]},

  // 방송/오락
  { id: 'tvn', name: 'tvN', network: 'TVN', category: '방송/오락', urls: [
    'http://moatv.net/live/tvn.m3u8',
    'https://tvn-live.akamaized.net/hls/live/2039202/tvn/playlist.m3u8'
  ]},
  { id: 'mnet', name: 'Mnet', network: 'MNET', category: '방송/오락', urls: [
    'http://moatv.net/live/mnet.m3u8',
    'https://mnet-live.akamaized.net/hls/live/2039204/mnet/playlist.m3u8'
  ]},
  { id: 'kbs_joy', name: 'KBS Joy', network: 'KBS_JOY', category: '방송/오락', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbsjoy/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbsjoy/live/playlist.m3u8'
  ]},
  { id: 'kbs_drama', name: 'KBS Drama', network: 'KBS_DRAMA', category: '방송/오락', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbsdrama/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbsdrama/live/playlist.m3u8'
  ]},
  // 스포츠
  { id: 'kbs_n_sports', name: 'KBS N Sports', network: 'KBS_SPORTS', category: '스포츠', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbsnplus/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbsnplus/live/playlist.m3u8'
  ]},
  { id: 'kbaduk', name: 'K바둑', network: 'KBADUK', category: '스포츠', ytChannelId: 'UCfC7lLfshm-GGKengvBm_HQ', urls: [
    'https://kbaduk.gscdn.com/kbaduk/live/playlist.m3u8'
  ]},
  { id: 'pba_tv', name: 'PBA 프로당구', network: 'PBA', category: '스포츠', ytChannelId: 'UC19P201D07j96D94y-uT1hQ', urls: [] },
  { id: 'golfzone_tv', name: '골프존 TV', network: 'GOLFZON', category: '스포츠', ytChannelId: 'UCp3E0T2049e6f_1G-mFvX_Q', urls: [] },
  { id: 'lck_esports', name: 'LCK e스포츠', network: 'LCK', category: '스포츠', ytChannelId: 'UC112c3fDqJqB-aYfH_QO1zQ', urls: [] },
  { id: 'fishing_tv', name: '한국낚시방송', network: 'FISHING', category: '스포츠', urls: [
    'https://fishingtv.gscdn.com/fishingtv/live/playlist.m3u8'
  ]},
  // 교육/교양
  { id: 'job_plus', name: '한국직업방송', network: 'JOB_PLUS', category: '교육/교양', urls: [
    'https://live.jobplustv.or.kr/live/wowtvlive1.sdp/playlist.m3u8',
    'http://live.jobplustv.or.kr/live/wowtvlive1.sdp/playlist.m3u8'
  ]},
  { id: 'oun', name: '방송대학TV', network: 'OUN', category: '교육/교양', urls: [
    'https://live.knou.ac.kr/knou1/live1/playlist.m3u8',
    'http://live.knou.ac.kr/knou1/live1/playlist.m3u8'
  ]},
  { id: 'gugak_tv', name: '국악방송', network: 'GUGAK_TV', category: '교육/교양', urls: [
    'https://mgugaklive.nowcdn.co.kr/gugakvideo/gugakvideo.stream/playlist.m3u8',
    'http://mgugaklive.nowcdn.co.kr/gugakvideo/gugakvideo.stream/playlist.m3u8'
  ]},
];

/* =================== STATE =================== */
let hls = null;
let activeChannelId = null;
let activeCategoryFilter = null;
let playbackTimeout = null;
let currentUrlIdx = 0;
let isYouTubeMode = false;
let lastIsPC = window.innerWidth >= 1024;
const isPC = () => window.innerWidth >= 1024;


/* =================== DOM REFS =================== */
const videoEl        = document.getElementById('main-video');
const videoElMob     = document.getElementById('main-video-mobile');
const placeholder    = document.getElementById('player-placeholder');
const placeholderMob = document.getElementById('player-placeholder-mobile');
const loadingOverlay = document.getElementById('loading-overlay');
const nowPlayingPC   = document.getElementById('now-playing-title');
const nowPlayingMob  = document.getElementById('now-playing-title-mobile');
const catContainerPC = document.getElementById('category-tabs-pc');
const catContainerMob = document.getElementById('category-tabs-mobile');
const gridPC         = document.getElementById('channel-grid');
const gridMob        = document.getElementById('channel-grid-mobile');
const ytIframePC     = document.getElementById('youtube-iframe-pc');
const ytIframeMob    = document.getElementById('youtube-iframe-mobile');

/* =================== UTILS =================== */
function showLoading(show, msg = '연결 중...') {
  if (!loadingOverlay) return;
  const t = loadingOverlay.querySelector('span');
  if (t) t.textContent = msg;
  loadingOverlay.classList.toggle('hidden', !show);
  loadingOverlay.style.display = show ? 'flex' : 'none';
}

function updateTitle(title) {
  if (nowPlayingPC) nowPlayingPC.textContent = title;
  if (nowPlayingMob) nowPlayingMob.textContent = title;
}

/* =================== DYNAMIC FETCHERS =================== */
async function fetchWithProxy(url) {
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    const data = await res.json();
    return data.contents;
  } catch(e) { return null; }
}

/* =================== IPTV M3U AUTO-LOADER =================== */
async function loadExternalPlaylist() {
  try {
    const m3uData = await fetchWithProxy('https://iptv-org.github.io/iptv/countries/kr.m3u');
    if (!m3uData) return;
    const lines = m3uData.split('\n');
    let currentName = '';
    let currentCat = '기타';
    for (const line of lines) {
      if (line.startsWith('#EXTINF')) {
        const nameMatch = line.match(/tvg-name="([^"]+)"/) || line.match(/,(.+)$/);
        currentName = nameMatch ? nameMatch[1].trim() : 'Unknown';
        const catMatch = line.match(/group-title="([^"]+)"/);
        currentCat = catMatch ? catMatch[1] : '기타';
      } else if (line.startsWith('http')) {
        const url = line.trim();
        if (!CHANNELS.find(c => c.name === currentName)) {
          CHANNELS.push({ id: `ext_${Date.now()}_${Math.random()}`, name: currentName, category: currentCat, url: url, network: 'EXTERNAL' });
        }
      }
    }
    renderCategories();
    renderChannels();
  } catch (e) { console.warn('M3U Load Error'); }
}

/* =================== UI RENDERERS =================== */
function renderCategories() {
  const cats = ['전체', ...new Set(CHANNELS.map(c => c.category))];
  [catContainerPC, catContainerMob].forEach(c => {
    if (!c) return;
    c.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      const active = (activeCategoryFilter === cat) || (!activeCategoryFilter && cat === '전체');
      btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'
      }`;
      btn.onclick = () => { activeCategoryFilter = cat === '전체' ? null : cat; renderCategories(); renderChannels(); };
      c.appendChild(btn);
    });
  });
}

/* =================== DRAG SCROLL LOGIC (PC) =================== */
function initDragScroll(el) {
  if (!el || window.matchMedia('(pointer: coarse)').matches) return;

  let isDown = false;
  let startX;
  let scrollLeft;
  let moved = false;

  el.addEventListener('mousedown', (e) => {
    isDown = true;
    el.classList.add('active');
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
    moved = false;
    el.style.cursor = 'grabbing';
  });

  el.addEventListener('mouseleave', () => {
    isDown = false;
    el.style.cursor = 'grab';
  });

  el.addEventListener('mouseup', (e) => {
    isDown = false;
    el.style.cursor = 'grab';
    // 많이 움직였으면 클릭 이벤트 무시
    if (moved) {
      const preventClick = (e) => {
        e.stopImmediatePropagation();
        el.removeEventListener('click', preventClick, true);
      };
      el.addEventListener('click', preventClick, true);
    }
  });

  el.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2;
    if (Math.abs(walk) > 5) moved = true;
    el.scrollLeft = scrollLeft - walk;
  });

  el.style.cursor = 'grab';
}

function renderChannels() {
  // 1. 현재 스크롤 위치 저장 (카테고리별로 저장)
  const scrollPositions = {};
  document.querySelectorAll('.channel-row').forEach((row, idx) => {
    const catTitle = row.parentElement.querySelector('h3')?.textContent;
    if (catTitle) scrollPositions[catTitle] = row.scrollLeft;
  });

  const filtered = activeCategoryFilter ? CHANNELS.filter(c => c.category === activeCategoryFilter) : CHANNELS;
  
  [gridPC, gridMob].forEach(container => {
    if (!container) return;
    container.innerHTML = '';
    const groups = {};
    filtered.forEach(c => {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    });

    Object.entries(groups).forEach(([cat, chs]) => {
      const section = document.createElement('div');
      section.className = 'mb-8';
      section.innerHTML = `<h3 class="text-white/40 text-[11px] font-bold px-4 mb-3 uppercase tracking-widest">${cat}</h3>`;
      const row = document.createElement('div');
      row.className = 'channel-row no-scrollbar';
      row.style.cssText = 'display:flex; flex-wrap:nowrap; gap:12px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding:0 14px 15px; touch-action: pan-x;';
      chs.forEach(ch => row.appendChild(createCard(ch)));
      section.appendChild(row);
      container.appendChild(section);

      // PC 드래그 스크롤 활성화
      initDragScroll(row);

      // 2. 저장된 스크롤 위치 복구
      if (scrollPositions[cat]) {
        requestAnimationFrame(() => {
          row.scrollLeft = scrollPositions[cat];
        });
      }
    });
  });
}

function updateActiveUI() {
  document.querySelectorAll('.channel-card-inner').forEach(el => {
    const isMatched = el.dataset.id === activeChannelId;
    el.classList.toggle('border-indigo-500', isMatched);
    el.classList.toggle('border-white/5', !isMatched);
    // 텍스트 색상 업데이트
    const text = el.parentElement.querySelector('.channel-name-text');
    if (text) {
      text.classList.toggle('text-indigo-400', isMatched);
      text.classList.toggle('text-gray-400', !isMatched);
    }
  });
}

function createCard(ch) {
  const active = activeChannelId === ch.id;
  const net = getNetStyle(ch.network);
  const card = document.createElement('div');
  card.className = 'flex-shrink-0 w-32 cursor-pointer group channel-card';
  card.onclick = () => playChannel(ch);
  card.innerHTML = `
    <div data-id="${ch.id}" style="background:${net.bg};color:${net.color};" class="channel-card-inner relative rounded-2xl aspect-[3/4] flex items-center justify-center border-2 ${active ? 'border-indigo-500' : 'border-white/5'} transition-all group-hover:border-white/20 shadow-lg">
      <div class="font-black text-lg text-center leading-tight drop-shadow-md">${getNetName(ch)}</div>
      <div class="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-[8px] font-bold rounded shadow-sm">LIVE</div>
    </div>
    <div class="channel-name-text mt-2 text-[11px] font-bold truncate px-1 ${active ? 'text-indigo-400' : 'text-gray-400 group-hover:text-white'}">${ch.name}</div>
  `;
  return card;
}

function getNetStyle(n) {
  const m = { 
    'KBS1': { bg: '#005596', color: '#fff' }, 
    'KBS2': { bg: '#e4002b', color: '#fff' }, 
    'MBC': { bg: '#111', color: '#fff' }, 
    'SBS': { bg: '#222', color: '#fff' }, 
    'TVN': { bg: '#e4002b', color: '#fff' }, 
    'MNET': { bg: '#000', color: '#fff' },
    'KBADUK': { bg: '#1A362B', color: '#3CD070' },
    'PBA': { bg: '#0B2046', color: '#FFD700' },
    'GOLFZON': { bg: '#0A5C36', color: '#8CE08C' },
    'LCK': { bg: '#0F172A', color: '#E2E8F0' },
    'FISHING': { bg: '#0F3A5F', color: '#68B6EF' }
  };
  return m[n] || { bg: '#1e1e28', color: '#888' };
}

function getNetName(ch) {
  const m = { 
    'TV_CHOSUN': 'TV\n조선', 
    'CHANNEL_A': '채널A', 
    'YONHAP': '연합\n뉴스', 
    'GS_SHOP': 'GS\nSHOP', 
    'CJ_SHOP': 'CJ\n온스타일', 
    'JOB_PLUS': '직업\nTV', 
    'OUN': '방송대\nTV', 
    'GUGAK_TV': '국악\nTV',
    'KBADUK': 'K\n바둑',
    'PBA': 'PBA\n당구',
    'GOLFZON': '골프존\nTV',
    'LCK': 'LCK\ne스포츠',
    'FISHING': '낚시\n방송'
  };
  return m[ch.network] || ch.name.substring(0, 5);
}

/* =================== PLAYBACK ENGINE =================== */
async function playChannel(ch, urlIdx = 0, startTime = 0) {
  activeChannelId = ch.id;
  currentUrlIdx = urlIdx;
  isYouTubeMode = false;

  updateActiveUI();

  if (ch.noPlayableHls) {
    showYouTubeFallback(ch);
    return;
  }

  showLoading(true, `${ch.name} 연결 중...`);
  updateTitle(ch.name);

  if (hls) { hls.destroy(); hls = null; }
  if (playbackTimeout) clearTimeout(playbackTimeout);

  // YouTube IFrame 리셋 및 숨기기
  [ytIframePC, ytIframeMob].forEach(iframe => {
    if (iframe) {
      iframe.src = '';
      iframe.classList.add('hidden');
    }
  });

  const target = isPC() ? videoEl : videoElMob;
  [videoEl, videoElMob, placeholder, placeholderMob].forEach(el => el?.classList.add('hidden'));

  // 기존 YouTube fallback UI 숨기기 - 인라인 style 직접 제어
  ['yt-fallback-pc', 'yt-fallback-mobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // 유튜브 재생은 HLS URL들이 모두 실패한 뒤 tryNextUrl에서 폴백 처리됩니다.
  target.classList.remove('hidden');


  // url(단수) 필드를 urls 배열로 정규화 (최초 1회)
  if (!ch.urls || ch.urls.length === 0) {
    if (ch.url) ch.urls = [ch.url];
    else ch.urls = [];
  }

  // KBS API는 동적으로 URL을 앞에 추가
  if (ch.kbsApiCode && urlIdx === 0) {
    try {
      const api = `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${ch.kbsApiCode}`;
      const res = await fetch(api);
      const data = await res.json();
      const apiUrl = data.channel_item?.find(i => i.service_url)?.service_url;
      if (apiUrl && !ch.urls.includes(apiUrl)) ch.urls.unshift(apiUrl);
    } catch (e) { /* KBS API 실패 시 기존 urls 사용 */ }
  }

  const url = ch.urls[urlIdx % ch.urls.length];

  if (!url) { showLoading(true, '재생 주소를 찾는 중입니다...'); tryNextUrl(ch, urlIdx); return; }

  const startPlayback = () => {
    target.play().catch(() => {});
  };

  target.onplaying = () => {
    if (playbackTimeout) clearTimeout(playbackTimeout);
    showLoading(false);
  };

  if (Hls.isSupported()) {
    hls = new Hls({ 
      manifestLoadingTimeOut: 3000, 
      manifestLoadingMaxRetry: 0,
      capLevelToPlayerSize: true, 
      startLevel: -1,             
      abrEwmaDefaultEstimate: isPC() ? 4000000 : 1500000, 
      testBandwidth: true
    });
    hls.loadSource(url);
    hls.attachMedia(target);
    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (startTime > 0) target.currentTime = startTime;
      startPlayback();
    });

    hls.on(Hls.Events.ERROR, (e, data) => { 
      if (data.fatal || data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        tryNextUrl(ch, urlIdx); 
      }
    });
  } else if (target.canPlayType('application/vnd.apple.mpegurl')) {
    target.src = url;
    target.onloadedmetadata = startPlayback;
    target.onerror = () => tryNextUrl(ch, urlIdx);
  }

  // 3초 내에 playing 이벤트가 발생하지 않으면 다음 URL로 전환
  playbackTimeout = setTimeout(() => {
    if (target.paused || target.currentTime === 0) {
      console.warn(`3초 타임아웃 - 다음 URL 시도: ${ch.name} (index: ${urlIdx})`);
      tryNextUrl(ch, urlIdx);
    }
  }, 3000);
}

function tryNextUrl(ch, currentIdx) {
  if (playbackTimeout) clearTimeout(playbackTimeout);
  const urlList = ch.urls || (ch.url ? [ch.url] : []);
  if (currentIdx < urlList.length - 1) {
    playChannel(ch, currentIdx + 1);
  } else if (ch.ytChannelId) {
    // 모든 HLS URL 실패 및 유튜브 채널 ID 존재 → 유튜브 라이브 iframe 즉시 노출 및 재생
    showYouTubeIframePlayback(ch);
  } else if (ch.ytHandle) {
    // 모든 HLS URL 실패 및 핸들만 존재 → 기존 YouTube 외부 링크 폴백 UI
    showYouTubeFallback(ch);
  } else {
    showLoading(true, '현재 채널 접속이 불안정합니다. 다른 채널을 선택해 주세요.');
  }
}

function showYouTubeIframePlayback(ch) {
  showLoading(false);
  if (hls) { hls.destroy(); hls = null; }
  if (playbackTimeout) clearTimeout(playbackTimeout);

  // 비디오 요소 숨기기
  [videoEl, videoElMob, placeholder, placeholderMob].forEach(el => el?.classList.add('hidden'));

  // 기존 YouTube fallback UI 숨기기 - 인라인 style 직접 제어
  ['yt-fallback-pc', 'yt-fallback-mobile'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  const ytIframe = isPC() ? ytIframePC : ytIframeMob;
  if (ytIframe) {
    ytIframe.classList.remove('hidden');
    ytIframe.src = `https://www.youtube.com/embed/live_stream?channel=${ch.ytChannelId}&autoplay=1&mute=0`;
  }
  updateTitle(`${ch.name} · YouTube Live`);
}

function showYouTubeFallback(ch) {
  showLoading(false);
  isYouTubeMode = true;
  if (hls) { hls.destroy(); hls = null; }


  // video 요소 숨기기
  [videoEl, videoElMob].forEach(el => el?.classList.add('hidden'));

  const ytLiveUrl = `https://www.youtube.com/${ch.ytHandle}/live`;

  // PC/모바일 fallback 컨테이너 선택
  const containerId = isPC() ? 'yt-fallback-pc' : 'yt-fallback-mobile';
  let fallbackEl = document.getElementById(containerId);

  if (!fallbackEl) {
    fallbackEl = document.createElement('div');
    fallbackEl.id = containerId;
    fallbackEl.style.cssText = 'position:absolute;inset:0;z-index:30;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:24px;';

    const parent = isPC()
      ? document.querySelector('#video-container .relative')
      : document.querySelector('.mobile-player-fixed');
    if (parent) parent.appendChild(fallbackEl);
  }

  let buttonsHtml = '';
  if (ch.officialUrl) {
    buttonsHtml += `
      <a href="${ch.officialUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#4F46E5;color:#fff;font-weight:700;font-size:0.9rem;padding:12px 24px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;margin-bottom:10px;width:240px;text-align:center;"
         onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        🌐 공식 홈페이지 온에어 시청
      </a>
    `;
  }
  if (ch.ytHandle) {
    buttonsHtml += `
      <a href="${ytLiveUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#FF0000;color:#fff;font-weight:700;font-size:0.9rem;padding:12px 24px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;width:240px;text-align:center;"
         onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        <svg width="18" height="12" viewBox="0 0 24 17" fill="white"><path d="M23.5 2.5a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 0 0 .5 2.5C0 4.4 0 8.5 0 8.5s0 4.1.5 6a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 12.6 24 8.5 24 8.5s0-4.1-.5-6zM9.5 12V5l6.5 3.5L9.5 12z"/></svg>
        YouTube 실시간 라이브 시청
      </a>
    `;
  }

  fallbackEl.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">📺</div>
      <div style="color:#fff;font-weight:800;font-size:1.1rem;margin-bottom:6px;">${ch.name}</div>
      <div style="color:#9ca3af;font-size:0.8rem;margin-bottom:20px;">HLS 스트림 연결 실패 · 아래 경로로 시청해 보세요</div>
      <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
        ${buttonsHtml}
      </div>
      <div style="margin-top:20px;">
        <button onclick="hideFallback('${containerId}')"
          style="background:rgba(255,255,255,0.08);color:#9ca3af;font-size:0.75rem;padding:8px 16px;border:1px solid rgba(255,255,255,0.1);border-radius:9999px;cursor:pointer;">
          ✕ 다른 채널 선택하기
        </button>
      </div>
    </div>
  `;
  fallbackEl.style.display = 'flex';
  updateTitle(`${ch.name} · 외부 채널`);

  // 반대편 fallback 숨기기 - 인라인 style 직접 제어
  const otherId = isPC() ? 'yt-fallback-mobile' : 'yt-fallback-pc';
  const otherEl = document.getElementById(otherId);
  if (otherEl) otherEl.style.display = 'none';
}

window.hideFallback = (id) => {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
  [placeholder, placeholderMob].forEach(el => el?.classList.remove('hidden'));
  
  // YouTube IFrame 초기화
  [ytIframePC, ytIframeMob].forEach(iframe => {
    if (iframe) {
      iframe.src = '';
      iframe.classList.add('hidden');
    }
  });

  updateTitle('');
  activeChannelId = null;
  isYouTubeMode = false;
  updateActiveUI();
};

/* =================== SEAMLESS TRANSITION (Resize) =================== */
window.addEventListener('resize', () => {
  const currentIsPC = isPC();
  if (lastIsPC !== currentIsPC) {
    lastIsPC = currentIsPC;
    if (activeChannelId) {
      const ch = CHANNELS.find(c => c.id === activeChannelId);
      if (ch) {
        if (isYouTubeMode) {
          showYouTubeFallback(ch);
        } else {
          const oldTarget = !currentIsPC ? videoEl : videoElMob;
          const currentTime = oldTarget.currentTime;
          playChannel(ch, currentUrlIdx, currentTime);
        }
      }
    }
  }
});





/* =================== VIDEO CONTROLS =================== */
function initControls() {
  const setup = (video, fsBtn, volBtn, volSlider, container) => {
    if (!video || !fsBtn) return;
    
    // Fullscreen
    fsBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!document.fullscreenElement) {
        if (container && container.requestFullscreen) {
          container.requestFullscreen().catch(() => {
            if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
          });
        } else if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
      }
    };

    const updateVolIcon = () => {
      if (!volBtn) return;
      const size = volBtn.id === 'vol-btn-mobile' ? 18 : 20;
      if (video.muted || video.volume == 0) {
        volBtn.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;
      } else {
        volBtn.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;
      }
    };

    // Volume Slider
    if (volSlider) {
      volSlider.oninput = (e) => {
        video.volume = e.target.value;
        video.muted = (video.volume === 0);
        updateVolIcon();
      };
    }

    // Mute/Unmute Toggle
    if (volBtn) {
      volBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        video.muted = !video.muted;
        if (volSlider) volSlider.value = video.muted ? 0 : video.volume;
        updateVolIcon();
      };
    }
  };

  // PC
  setup(
    videoEl, 
    document.getElementById('fullscreen-btn'), 
    document.getElementById('vol-btn'), 
    document.getElementById('vol-slider'),
    document.getElementById('video-container')?.querySelector('.relative')
  );

  // Mobile
  setup(
    videoElMob,
    document.getElementById('fullscreen-btn-mobile'),
    document.getElementById('vol-btn-mobile'),
    null,
    document.querySelector('.mobile-player-fixed')
  );
}

/* =================== INIT =================== */
window.handleYouTubeLogin = () => { window.location.href = 'youtube.html'; };

async function preloadWorkingUrls() {
  const checkUrl = async (url) => {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 2500);
      const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(proxy, { signal: c.signal });
      clearTimeout(t);
      const data = await res.json();
      return data && data.contents && data.contents.includes('#EXTM3U');
    } catch (e) {
      return false;
    }
  };

  // urls가 여러 개인 모든 채널 대상으로 첫 번째 URL 사전 검증
  const multiUrlChannels = CHANNELS.filter(c => c.urls && c.urls.length > 1);
  for (const ch of multiUrlChannels) {
    checkUrl(ch.urls[0]).then(isOk => {
      if (!isOk) {
        // 첫 URL 실패 시 두 번째 URL 검증 후 순서 교체
        checkUrl(ch.urls[1]).then(isOk2 => {
          if (isOk2) {
            const temp = ch.urls[0];
            ch.urls[0] = ch.urls[1];
            ch.urls[1] = temp;
            console.log(`[Preload] URL 순서 교체: ${ch.name}`);
          }
        });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  renderCategories();
  renderChannels();
  initControls(); // 컨트롤 초기화
  preloadWorkingUrls(); // 접속가능한 지상파 URL 사전 확인
  // M3U 외부 리스트 로딩은 수천 개의 채널로 인해 렌더링 렉 및 브라우저 프리징을 유발하므로 자동 로드에서 제외
  // await loadExternalPlaylist();
});
