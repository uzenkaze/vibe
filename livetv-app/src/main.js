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

  // 방송/오락
  { id: 'kbs_joy', name: 'KBS Joy', network: 'KBS_JOY', category: '방송/오락', kbsApiCode: 'N92', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=N92&ch_type=globalList', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbsjoy/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbsjoy/live/playlist.m3u8'
  ]},
  { id: 'kbs_drama', name: 'KBS Drama', network: 'KBS_DRAMA', category: '방송/오락', kbsApiCode: 'N91', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=N91&ch_type=globalList', urls: [
    'https://kbs-hls.gcdn.ntruss.com/kbs/kbsdrama/playlist.m3u8',
    'https://624a79c87201d.streamlock.net/kbsdrama/live/playlist.m3u8'
  ]},
  { id: 'kbs_story', name: 'KBS Story', network: 'KBS_STORY', category: '방송/오락', kbsApiCode: 'N94', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=N94&ch_type=globalList', urls: [] },
  { id: 'kbs_life', name: 'KBS Life', network: 'KBS_LIFE', category: '방송/오락', kbsApiCode: 'N93', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=N93&ch_type=globalList', urls: [] },
  { id: 'kbs_kids', name: 'KBS Kids', network: 'KBS_KIDS', category: '방송/오락', kbsApiCode: 'N96', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=N96&ch_type=globalList', urls: [] },
  { id: 'kbs_world', name: 'KBS World', network: 'KBS_WORLD', category: '방송/오락', kbsApiCode: '14', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=14&ch_type=globalList', urls: [
    'https://liveh12.vtvprime.vn/hls/KBS/03.m3u8'
  ]},
  { id: 'mbc_every1', name: 'MBC every1', network: 'MBC', category: '방송/오락', officialUrl: 'https://m.mbcplus.com/web/onair.do?categoryid=2', ytHandle: '@MBCevery1', noPlayableHls: true, urls: [
    'https://live2.mbcmpp.co.kr/etc2/_definst_/every1/playlist.m3u8'
  ] },
  { id: 'mbc_drama', name: 'MBC Drama', network: 'MBC', category: '방송/오락', officialUrl: 'https://m.mbcplus.com/web/onair.do?categoryid=1', ytHandle: '@mbc_drama', urls: [
    'https://live2.mbcmpp.co.kr/etc1/_definst_/drama/playlist.m3u8'
  ] },
  { id: 'mbc_on', name: 'MBC On', network: 'MBC', category: '방송/오락', officialUrl: 'https://m.mbcplus.com/web/onair.do?categoryid=3', urls: [
    'https://live3.mbcmpp.co.kr/etc3/_definst_/on/playlist.m3u8'
  ] },
  { id: 'mbc_m', name: 'MBC M', network: 'MBC', category: '방송/오락', officialUrl: 'https://m.mbcplus.com/web/onair.do?categoryid=4', urls: [
    'https://live3.mbcmpp.co.kr/etc4/_definst_/m/playlist.m3u8'
  ] },

  // 정주행 24
  { id: 'ssam_my_way', name: '쌈, 마이웨이', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod1', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod1&ch_type=globalList', urls: [] },
  { id: 'taejo_wanggeon', name: '태조 왕건', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod2', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod2&ch_type=globalList', urls: [] },
  { id: 'queen_of_office', name: '직장의 신', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod3', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod3&ch_type=globalList', urls: [] },
  { id: 'five_enough', name: '아이가 다섯', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod4', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod4&ch_type=globalList', urls: [] },
  { id: 'king_of_baking', name: '제빵왕 김탁구', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod5', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod5&ch_type=globalList', urls: [] },
  { id: 'one_night_two_days_24', name: '1박 2일', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod6', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod6&ch_type=globalList', urls: [] },
  { id: 'my_daughter_seoyoung', name: '내 딸 서영이', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod7', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod7&ch_type=globalList', urls: [] },
  { id: 'history_journal', name: '역사저널 그날', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod8', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod8&ch_type=globalList', urls: [] },
  { id: 'screening_humanity', name: '인간극장', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod9', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod9&ch_type=globalList', urls: [] },
  { id: 'kids_cartoon', name: '어린이 만화동산', network: 'KBS', category: '정주행 24', kbsApiCode: 'nvod10', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=nvod10&ch_type=globalList', urls: [] },

  // 종합편성
  { id: 'kbs_24', name: 'KBS24', network: 'KBS', category: '종합편성', kbsApiCode: '81', officialUrl: 'https://onair.kbs.co.kr/index.html?sname=onair&stype=live&ch_code=81&ch_type=globalList', urls: [] },
  { id: 'jtbc', name: 'JTBC', network: 'JTBC', category: '종합편성', ytHandle: '@jtbc_news', ytChannelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ', officialUrl: 'https://onair.jtbc.co.kr/', noPlayableHls: true, urls: [] },
  { id: 'tv_chosun', name: 'TV조선', network: 'TV_CHOSUN', category: '종합편성', ytHandle: '@tvchosunnews', ytChannelId: 'UCWlV3Lz_55UaX4JsMj-z__Q', officialUrl: 'https://broadcast.tvchosun.com/onair/on.cstv', noPlayableHls: true, urls: [] },
  { id: 'channel_a', name: '채널A', network: 'CHANNEL_A', category: '종합편성', ytHandle: '@channelA-news', ytChannelId: 'UCfq4V1DAuaojnr2ryvWNysw', officialUrl: 'https://ichannela.com/com/cmm/onair.do', noPlayableHls: true, urls: [] },
  { id: 'mbn', name: 'MBN', network: 'MBN', category: '종합편성', ytHandle: '@mbn', ytChannelId: 'UCG9aFJTZ-lMCHAiO1KJsirg', officialUrl: 'https://www.mbn.co.kr/vod/onair', noPlayableHls: true, urls: [] },

  // 뉴스/경제
  { id: 'ytn', name: 'YTN', network: 'YTN', category: '뉴스/경제', ytHandle: '@ytnnews24', ytChannelId: 'UChlgI3UHCOnwUGzWzbJ3H5w', ytVideoId: 'aZyD6EPl6KU', officialUrl: 'https://www.ytn.co.kr/live/', noPlayableHls: true, urls: [] },
  { id: 'yonhap', name: '연합뉴스TV', network: 'YONHAP', category: '뉴스/경제', ytHandle: '@yonhapnewstv23', ytChannelId: 'UCTHCOPwqNfZ0uiKOvFyhGwg', ytVideoId: 'Hdw_2AlFCog', officialUrl: 'https://www.yonhapnewstv.co.kr/ext/live/', noPlayableHls: true, urls: [] },
  { id: 'sbsbiz', name: 'SBS Biz', network: 'SBS_BIZ', category: '뉴스/경제', ytHandle: '@SBSBiz2021', ytChannelId: 'UCbMjg2EvXs_RUGW-KrdM3pw', officialUrl: 'https://biz.sbs.co.kr/onair.html', urls: [
    'https://onair.sbs.co.kr/media/sbsbiz/playlist.m3u8'
  ]},
  { id: 'mk', name: '매일경제TV', network: 'MK', category: '뉴스/경제', ytHandle: '@MKeconomy_TV', ytChannelId: 'UCW_rE_QzXm5b7w7O21tE22A', officialUrl: 'https://www.mk.co.kr/', noPlayableHls: true, urls: [] },
  { id: 'mtn', name: 'MTN 머니투데이', network: 'MTN', category: '뉴스/경제', ytHandle: '@mtn', ytChannelId: 'UCaQREsefLy-W8ruWcJ7IDtg', officialUrl: 'https://www.mtn.co.kr/tv-live', urls: [
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
];

/* =================== STATE =================== */
let hls = null;
let activeChannelId = null;
let activeCategoryFilter = null;
let playbackTimeout = null;
let currentUrlIdx = 0;
let isYouTubeMode = false;

// TV/빔프로젝터 환경 감지 (index.html의 인라인 스크립트가 먼저 실행됨)
// window.__IS_TV__: TV 환경 감지 플래그 (HTML 파싱 전에 설정됨)
const IS_TV_ENV = window.__IS_TV__ === true || document.documentElement.classList.contains('tv-mode');

// PC 레이아웃 감지: TV 환경이거나 뷰포트 너비 1024px 이상
let lastIsPC = IS_TV_ENV || window.innerWidth >= 1024;
const isPC = () => IS_TV_ENV || window.innerWidth >= 1024;



/* =================== DOM REFS =================== */
const videoEl        = document.getElementById('main-video');
const videoElMob     = document.getElementById('main-video-mobile');
const placeholder    = document.getElementById('player-placeholder');
const placeholderMob = document.getElementById('player-placeholder-mobile');
const loadingOverlay = document.getElementById('loading-overlay');
const loadingOverlayMob = document.getElementById('loading-overlay-mobile');
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
  [loadingOverlay, loadingOverlayMob].forEach(overlay => {
    if (!overlay) return;
    const t = overlay.querySelector('span');
    if (t) t.textContent = msg;
    overlay.classList.toggle('hidden', !show);
    overlay.style.display = show ? 'flex' : 'none';
  });
}

function updateTitle(title) {
  if (nowPlayingPC) nowPlayingPC.textContent = title;
  if (nowPlayingMob) nowPlayingMob.textContent = title;
}

/* =================== DYNAMIC FETCHERS =================== */
async function fetchWithProxy(url) {
  try {
    const proxy = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
    const res = await fetch(proxy);
    if (!res.ok) return null;
    return await res.text();
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
      btn.className = `whitespace-nowrap px-4 py-2 rounded-full text-[13px] transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] text-white font-bold shadow-md shadow-purple-600/30' 
          : 'bg-[#1A1A1A] border border-white/5 text-gray-400 font-medium hover:text-white hover:bg-[#222222]'
      }`;
      btn.onclick = () => { 
        activeCategoryFilter = cat === '전체' ? null : cat; 
        if (typeof updateBottomBarActiveState === 'function') {
          updateBottomBarActiveState('live');
        }
        renderCategories(); 
        renderChannels(); 
      };
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

  let filtered = activeCategoryFilter ? CHANNELS.filter(c => c.category === activeCategoryFilter) : CHANNELS;

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
      section.className = 'mb-10';
      section.innerHTML = `
        <div class="flex items-center px-4 mb-4">
          <h3 class="text-white text-[15px] font-bold tracking-tight">${cat}</h3>
        </div>
      `;
      const row = document.createElement('div');
      row.className = 'channel-row no-scrollbar';
      row.style.cssText = 'display:flex; flex-wrap:nowrap; gap:12px; overflow-x:auto; -webkit-overflow-scrolling:touch; padding:0 14px 15px; touch-action: pan-x pan-y;';
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

function getChannelCardStyleAndContent(ch, active) {
  const m = {
    'kbs1': {
      bg: 'linear-gradient(135deg, #0b457e 0%, #002244 100%)',
      html: `<span class="font-extrabold text-white text-base tracking-tight drop-shadow-md">KBS <span class="text-sky-400">1TV</span></span>`
    },
    'kbs2': {
      bg: 'linear-gradient(135deg, #d3001e 0%, #7a000d 100%)',
      html: `<span class="font-extrabold text-white text-base tracking-tight drop-shadow-md">KBS <span class="text-yellow-300">2TV</span></span>`
    },
    'kbs_24': {
      bg: 'linear-gradient(135deg, #02235c 0%, #000c24 100%)',
      html: `
        <div class="absolute inset-0 opacity-10 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-24 h-24 rounded-full border border-white -top-6 -right-6"></div>
          <div class="absolute w-36 h-36 rounded-full border border-white -bottom-10 -left-10"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-lg tracking-tighter drop-shadow-md">KBS <span class="font-light">24</span></span></div>
      `
    },
    'kbs_joy': {
      bg: 'linear-gradient(135deg, #ffc03d 0%, #ff8c00 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-40 h-2 bg-white/30 rotate-12 top-6 -left-10"></div>
          <div class="absolute w-40 h-3 bg-white/30 rotate-12 top-12 -left-10"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-[#1a2c5b] text-lg tracking-tighter drop-shadow-md">KBS <span class="text-[#f43f5e] italic">joy</span></span></div>
      `
    },
    'kbs_drama': {
      bg: 'linear-gradient(135deg, #ff94b8 0%, #ff527b 100%)',
      html: `
        <div class="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-20 h-20 rounded-full bg-white/20 -top-8 -left-8"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-base tracking-tighter drop-shadow-md">KBS <span class="font-light">drama</span></span></div>
      `
    },
    'kbs_story': {
      bg: 'linear-gradient(135deg, #f43f5e 0%, #881337 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-24 h-24 rounded-full border border-white -top-6 -right-6"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-base tracking-tighter drop-shadow-md">KBS <span class="font-light text-rose-300">story</span></span></div>
      `
    },
    'kbs_life': {
      bg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-36 h-2 bg-white/10 rotate-12 -top-2 -left-2"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-base tracking-tighter drop-shadow-md">KBS <span class="font-light text-teal-300">life</span></span></div>
      `
    },
    'kbs_kids': {
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
      html: `
        <div class="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-16 h-16 rounded-full bg-white/20 -bottom-6 -right-6"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-base tracking-tighter drop-shadow-md">KBS <span class="font-light text-yellow-300">kids</span></span></div>
      `
    },
    'kbs_world': {
      bg: 'linear-gradient(135deg, #4f46e5 0%, #1e1b4b 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-24 h-24 rounded-full border border-white/20 -top-10 -right-10"></div>
          <div class="absolute w-24 h-24 rounded-full border border-white/20 -bottom-10 -left-10"></div>
        </div>
        <div class="flex items-center gap-1 z-10"><span class="font-black text-white text-base tracking-tighter drop-shadow-md">KBS <span class="font-light text-sky-300">world</span></span></div>
      `
    },
    'mbc': {
      bg: 'linear-gradient(135deg, #222222 0%, #000000 100%)',
      html: `<span class="font-black text-white text-xl tracking-widest italic drop-shadow-md">MBC</span>`
    },
    'mbc_every1': {
      bg: 'linear-gradient(135deg, #e11d48 0%, #881337 100%)',
      html: `<div class="text-center drop-shadow-md"><div class="text-[9px] text-white/70 font-extrabold uppercase tracking-widest">MBC</div><div class="text-[15px] font-black text-white italic">every1</div></div>`
    },
    'mbc_drama': {
      bg: 'linear-gradient(135deg, #ec4899 0%, #500724 100%)',
      html: `<div class="text-center drop-shadow-md"><div class="text-[9px] text-white/70 font-extrabold uppercase tracking-widest">MBC</div><div class="text-[15px] font-black text-white italic">Drama</div></div>`
    },
    'mbc_on': {
      bg: 'linear-gradient(135deg, #2563eb 0%, #1e3a8a 100%)',
      html: `<div class="text-center drop-shadow-md"><div class="text-[9px] text-white/70 font-extrabold uppercase tracking-widest">MBC</div><div class="text-[15px] font-black text-white italic">On</div></div>`
    },
    'mbc_m': {
      bg: 'linear-gradient(135deg, #a855f7 0%, #3b0764 100%)',
      html: `<div class="text-center drop-shadow-md"><div class="text-[9px] text-white/70 font-extrabold uppercase tracking-widest">MBC</div><div class="text-[18px] font-black text-white italic tracking-tighter">M</div></div>`
    },
    'sbs': {
      bg: 'linear-gradient(135deg, #111115 0%, #252530 100%)',
      html: `
        <div class="flex items-center gap-1.5 drop-shadow-md">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffcc00"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.53c-.26-.81-1-1.4-1.9-1.4h-1v-3c0-.55-.45-1-1-1h-6v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
          <span class="font-extrabold text-white text-[16px] tracking-wider">SBS</span>
        </div>
      `
    },
    'tvn': {
      bg: '#e11d48',
      html: `<span class="font-black text-white text-[20px] tracking-tighter italic drop-shadow-md">tvN</span>`
    },
    'mnet': {
      bg: '#000000',
      html: `<span class="font-black text-[#ff007f] text-[18px] tracking-widest uppercase drop-shadow-md">Mnet</span>`
    },
    'jtbc': {
      bg: 'linear-gradient(135deg, #1a1a24 0%, #0e0e12 100%)',
      html: `<div class="flex flex-col items-center drop-shadow-md"><span class="font-black text-white text-[16px] tracking-tighter">JTBC</span><div class="h-1 w-8 bg-gradient-to-r from-red-500 via-yellow-400 to-blue-500 mt-1 rounded"></div></div>`
    },
    'tv_chosun': {
      bg: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)',
      html: `<span class="font-black text-white text-[16px] tracking-tighter drop-shadow-md">TV조선</span>`
    },
    'channel_a': {
      bg: 'linear-gradient(135deg, #0284c7 0%, #0c4a6e 100%)',
      html: `<span class="font-black text-white text-[16px] tracking-tighter drop-shadow-md">채널A</span>`
    },
    'mbn': {
      bg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
      html: `<span class="font-black text-white text-[18px] tracking-tighter drop-shadow-md">MBN</span>`
    },
    'ssam_my_way': {
      bg: 'linear-gradient(135deg, #fda4af 0%, #e11d48 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-24 h-24 rounded-full border border-white -top-6 -right-6"></div>
          <div class="absolute w-36 h-36 rounded-full border border-white -bottom-10 -left-10"></div>
        </div>
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 정주행</div><div class="text-[14px] font-black text-white leading-tight">쌈, 마이웨이</div></div>
      `
    },
    'taejo_wanggeon': {
      bg: 'linear-gradient(135deg, #d97706 0%, #451a03 100%)',
      html: `
        <div class="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-40 h-2 bg-yellow-400/20 rotate-45 top-6 -left-10"></div>
        </div>
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-yellow-300/80 font-extrabold tracking-widest uppercase">KBS 대하사극</div><div class="text-[15px] font-black text-yellow-100 leading-tight">태조 왕건</div></div>
      `
    },
    'queen_of_office': {
      bg: 'linear-gradient(135deg, #3b82f6 0%, #1e3a8a 100%)',
      html: `
        <div class="absolute inset-0 opacity-15 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-32 h-32 rounded-full border border-white/20 -top-10 -left-10"></div>
        </div>
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 월화드라마</div><div class="text-[15px] font-black text-white leading-tight">직장의 신</div></div>
      `
    },
    'five_enough': {
      bg: 'linear-gradient(135deg, #fbbf24 0%, #b45309 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 주말드라마</div><div class="text-[15px] font-black text-white leading-tight">아이가 다섯</div></div>
      `
    },
    'king_of_baking': {
      bg: 'linear-gradient(135deg, #f97316 0%, #7c2d12 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 수목드라마</div><div class="text-[15px] font-black text-white leading-tight">제빵왕 김탁구</div></div>
      `
    },
    'one_night_two_days_24': {
      bg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
      html: `
        <div class="absolute inset-0 opacity-20 overflow-hidden pointer-events-none rounded-2xl">
          <div class="absolute w-40 h-3 bg-white/20 -rotate-12 top-6 -left-10"></div>
          <div class="absolute w-40 h-2 bg-white/20 -rotate-12 top-12 -left-10"></div>
        </div>
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/80 font-extrabold tracking-widest uppercase">국민 예능</div><div class="text-[17px] font-black text-yellow-300 italic tracking-tighter">1박 2일</div></div>
      `
    },
    'my_daughter_seoyoung': {
      bg: 'linear-gradient(135deg, #c084fc 0%, #581c87 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 명품드라마</div><div class="text-[14px] font-black text-white leading-tight">내 딸 서영이</div></div>
      `
    },
    'history_journal': {
      bg: 'linear-gradient(135deg, #ef4444 0%, #7f1d1d 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 역사교양</div><div class="text-[14px] font-black text-white leading-tight">역사저널 그날</div></div>
      `
    },
    'screening_humanity': {
      bg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/70 font-extrabold tracking-widest uppercase">KBS 휴먼다큐</div><div class="text-[15px] font-black text-white leading-tight">인간극장</div></div>
      `
    },
    'kids_cartoon': {
      bg: 'linear-gradient(135deg, #4ade80 0%, #15803d 100%)',
      html: `
        <div class="text-center z-10 drop-shadow-lg"><div class="text-[9px] text-white/80 font-extrabold tracking-widest uppercase">어린이 명작 만화</div><div class="text-[14px] font-black text-yellow-200 leading-tight">만화동산</div></div>
      `
    }
  };

  const matched = m[ch.id];
  if (matched) return matched;

  // Fallback hash-based gradients for any other channels
  const hash = ch.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    'linear-gradient(135deg, #4f46e5 0%, #2e2a85 100%)',
    'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #78350f 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #164e63 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #4c1d95 100%)'
  ];
  const bg = colors[hash % colors.length];
  const html = `<span class="font-extrabold text-white text-sm text-center px-2 drop-shadow-md truncate w-full">${ch.name}</span>`;
  return { bg, html };
}

function createCard(ch) {
  const active = activeChannelId === ch.id;
  const cardStyle = getChannelCardStyleAndContent(ch, active);
  const isRealtime = !ch.noPlayableHls && ((ch.urls && ch.urls.length > 0) || ch.kbsApiCode || ch.url);
  
  // 1. Futuristic ON AIR Badge (Neon Glow)
  const onAirBadgeHtml = isRealtime ? `
    <div class="absolute top-2 right-2 px-1.5 py-0.5 bg-red-600/90 text-white border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.8)] backdrop-blur-md rounded-full text-[8px] font-black flex items-center gap-1 uppercase tracking-widest z-20">
      <span class="w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,1)] animate-pulse"></span>ON AIR
    </div>
  ` : '';

  // 2. Main Card Construction
  const card = document.createElement('div');
  card.className = 'flex-shrink-0 w-36 sm:w-40 cursor-pointer group channel-card';
  card.onclick = () => playChannel(ch);
  card.innerHTML = `
    <div data-id="${ch.id}" style="background: ${cardStyle.bg === '#1e1e28' ? '#111111' : cardStyle.bg};" class="channel-card-inner relative rounded-[24px] aspect-video flex items-center justify-center border border-white/5 ${active ? 'ring-2 ring-[#8B5CF6] ring-offset-2 ring-offset-[#0A0A0A] shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'shadow-lg shadow-black/40'} transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,0,0,0.6)] overflow-hidden bg-[#111111]">
      ${cardStyle.html}
      ${onAirBadgeHtml}
      
      <!-- Hover / Active Play Button Overlay -->
      <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 ${active ? 'opacity-100 bg-black/20 backdrop-blur-none' : ''} transition-all duration-300 z-10">
        <div class="w-10 h-10 rounded-full bg-[#8B5CF6]/90 border border-white/20 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white" class="ml-1"><path d="M8 5v14l11-7z"/></svg>
        </div>
      </div>
    </div>
    <div class="channel-name-text mt-3 text-[13px] font-semibold tracking-tight truncate px-1 text-center transition-colors duration-300 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}">${ch.name}</div>
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
  if (typeof isWebPiPActive !== 'undefined' && isWebPiPActive) {
    disableWebPiP(!isPC());
  }
  activeChannelId = ch.id;
  currentUrlIdx = urlIdx;
  isYouTubeMode = false;

  // 화질 선택 버튼 초기 상태는 숨김 처리
  const qualWrapperPC = document.getElementById('quality-select-pc-wrapper');
  const qualWrapperMob = document.getElementById('quality-select-mob-wrapper');
  if (qualWrapperPC) qualWrapperPC.style.display = 'none';
  if (qualWrapperMob) qualWrapperMob.style.display = 'none';



  updateActiveUI();

  if (ch.noPlayableHls) {
    if (ch.ytChannelId || ch.ytHandle) {
      showYouTubeIframePlayback(ch);
    } else {
      showYouTubeFallback(ch);
    }
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


  // url(단수) 필드를 urls 배열로 정규화 (최초 1회)
  if (!ch.urls || ch.urls.length === 0) {
    if (ch.url) ch.urls = [ch.url];
    else ch.urls = [];
  }

  // KBS API는 동적으로 URL을 앞에 추가
  if (ch.kbsApiCode && urlIdx === 0) {
    try {
      const api = `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${ch.kbsApiCode}?_=${Date.now()}`;
      let res;
      try {
        res = await fetch(api);
      } catch(err) {
        // CORS error fallback
        res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(api)}`);
      }
      const data = await res.json();
      const apiUrl = data.channel_item?.find(i => i.service_url)?.service_url;
      if (apiUrl) {
        // 이전에 추가된 동적 토큰 URL 제거
        ch.urls = ch.urls.filter(u => !u.includes('gscdn.kbs.co.kr'));
        ch.urls.unshift(apiUrl);
      }
    } catch (e) { 
      console.warn('KBS API load failed', e);
    }
  }

  const url = ch.urls[urlIdx % ch.urls.length];

  if (!url) { showLoading(true, '재생 주소를 찾는 중입니다...'); tryNextUrl(ch, urlIdx); return; }

  const startPlayback = () => {
    target.play().catch(() => {});
  };

  target.onplaying = () => {
    if (playbackTimeout) clearTimeout(playbackTimeout);
    target.classList.remove('hidden');
    showLoading(false);
  };

  if (Hls.isSupported()) {
    // HLS 재생 가능 시 화질 선택 버튼 활성화
    const qualWrapperPC = document.getElementById('quality-select-pc-wrapper');
    const qualWrapperMob = document.getElementById('quality-select-mob-wrapper');
    if (qualWrapperPC) qualWrapperPC.style.display = 'block';
    if (qualWrapperMob) qualWrapperMob.style.display = 'block';

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
      // 화질 메뉴 로드 및 리스트 파싱
      updateQualitySelector(isPC());
    });

    hls.on(Hls.Events.LEVEL_LOADED, () => {
      // 비동기로 화질 높이 해상도 메타데이터가 파싱/로딩되면 리스트 실시간 업데이트
      updateQualitySelector(isPC());
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

  // 8초 내에 playing 이벤트가 발생하지 않으면 다음 URL로 전환
  playbackTimeout = setTimeout(() => {
    if (target.paused || target.currentTime === 0) {
      console.warn(`8초 타임아웃 - 다음 URL 시도: ${ch.name} (index: ${urlIdx})`);
      tryNextUrl(ch, urlIdx);
    }
  }, 8000);
}

let isFetchingStreams = false;
let lastFetchTime = 0;

async function fetchLatestStreams() {
  if (isFetchingStreams || Date.now() - lastFetchTime < 60000) return;
  isFetchingStreams = true;
  try {
    const res = await fetch('https://raw.githubusercontent.com/iptv-org/iptv/master/streams/kr.m3u');
    if (!res.ok) throw new Error('Network error');
    const text = await res.text();
    const lines = text.split('\n');
    let currentId = null;
    let urlMap = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('#EXTINF:')) {
        const name = line.substring(line.indexOf(',') + 1).toUpperCase();
        if (name.includes('MBC') && !name.includes('DRAMA') && !name.includes('NET') && !name.includes('EVERY') && !name.includes('M') && !name.includes('ON')) currentId = 'mbc';
        else if (name.includes('SBS') && !name.includes('BIZ') && !name.includes('MTV') && !name.includes('PLUS')) currentId = 'sbs';
        else if (name.includes('EBS 1') || name.includes('EBS1')) currentId = 'ebs1';
        else if (name.includes('EBS 2') || name.includes('EBS2')) currentId = 'ebs2';
        else if (name.includes('KBS 1') || name.includes('KBS1')) currentId = 'kbs1';
        else if (name.includes('KBS 2') || name.includes('KBS2')) currentId = 'kbs2';
        else if (name.includes('YTN') && !name.includes('SCIENCE') && !name.includes('LIFE')) currentId = 'ytn';
        else if (name.includes('YONHAP') || name.includes('연합뉴스')) currentId = 'yonhap';
        else currentId = null;
      } else if (line.startsWith('http') && currentId) {
        if (!urlMap[currentId]) urlMap[currentId] = [];
        urlMap[currentId].push(line);
        currentId = null;
      }
    }

    CHANNELS.forEach(ch => {
      if (urlMap[ch.id]) {
        // Add new URLs to the front to prioritize them
        const newUrls = urlMap[ch.id].filter(u => !ch.urls.includes(u));
        ch.urls.unshift(...newUrls);
      }
    });
    lastFetchTime = Date.now();
    console.log('[LiveTV] Updated channels with latest streams from iptv-org');
  } catch (err) {
    console.error('[LiveTV] Failed to fetch latest streams:', err);
  } finally {
    isFetchingStreams = false;
  }
}

async function tryNextUrl(ch, currentIdx) {
  if (playbackTimeout) clearTimeout(playbackTimeout);
  const urlList = ch.urls || (ch.url ? [ch.url] : []);
  if (currentIdx < urlList.length - 1) {
    playChannel(ch, currentIdx + 1);
  } else {
    // If all URLs failed, attempt to fetch fresh streams
    if (Date.now() - lastFetchTime > 10000) { // Allow refetch if 10 seconds passed
      showLoading(true, '새로운 라이브 주소를 찾는 중입니다...');
      const oldLen = ch.urls.length;
      await fetchLatestStreams();
      if (ch.urls.length > oldLen) {
        // Play with the newly discovered URL at index 0
        playChannel(ch, 0);
        return;
      }
    }

    if (ch.ytChannelId || ch.ytVideoId) {
      showYouTubeIframePlayback(ch);
    } else if (ch.ytHandle || ch.officialUrl) {
      showYouTubeFallback(ch);
    } else {
      showLoading(true, '현재 채널 접속이 불안정합니다. 다른 채널을 선택해 주세요.');
    }
  }
}

async function showYouTubeIframePlayback(ch) {
  showLoading(true, '유튜브 라이브 스트림 연결 중...');
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
    
    // 실시간 유튜브 라이브 비디오 ID 분석 (우선순위 기반 다중 레이어 분석)
    let liveVideoId = null;

    // 1순위: 로컬 백엔드 라이브 분석기 호출 (CORS 우회가 가능하고, 서버 측 파싱으로 가장 안정적이며 속도가 빠름)
    if (ch.ytHandle) {
      try {
        const handle = ch.ytHandle.replace('@', '');
        const proxyHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.'))
          ? `http://${window.location.hostname}:5174`
          : 'http://localhost:5174';
        
        const proxyApiUrl = `${proxyHost}/api/youtube/live?handle=${handle}`;
        console.log(`[YouTube Live Playback] 로컬 백엔드 라이브 분석기 호출: ${proxyApiUrl}`);
        
        const res = await fetch(proxyApiUrl, { signal: AbortSignal.timeout(4000) });
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.videoId) {
            liveVideoId = data.videoId;
            console.log(`[YouTube Live Playback] 백엔드 분석 성공: ${liveVideoId}`);
          }
        }
      } catch (e) {
        console.warn(`[YouTube Live Playback] 백엔드 분석기 실패:`, e);
      }
    }

    // 2순위: 하드코딩된 비디오 ID 사용
    if (!liveVideoId && ch.ytVideoId) {
      liveVideoId = ch.ytVideoId;
      console.log(`[YouTube Live Playback] 하드코딩된 비디오 ID 사용: ${liveVideoId}`);
    }

    // 3순위: 클라이언트 사이드 공용 CORS 프록시 스크래핑 폴백 (개발 서버가 구동 중이지 않은 정적 환경용)
    if (!liveVideoId && ch.ytHandle) {
      try {
        const handle = ch.ytHandle.replace('@', '');
        const url = `https://www.youtube.com/@${handle}/live`;
        const proxies = [
          u => {
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168.')) {
              return `/yt-proxy/@${handle}/live`;
            }
            return u;
          },
          u => u, // Direct fetch for CapacitorHttp
          u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
          u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
          u => `https://corsproxy.io/?${encodeURIComponent(u)}`
        ];

        for (const getProxyUrl of proxies) {
          try {
            const proxyUrl = getProxyUrl(url);
            console.log(`[YouTube Live Playback] 시도 프록시: ${proxyUrl}`);
            const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
            let html = "";
            if (proxyUrl.includes('allorigins')) {
              const data = await res.json();
              html = data.contents || "";
            } else {
              html = await res.text();
            }

            if (html) {
              let match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
              if (match?.[1]) { liveVideoId = match[1]; break; }

              match = html.match(/embed\/([a-zA-Z0-9_-]{11})/);
              if (match?.[1]) { liveVideoId = match[1]; break; }

              match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
              if (match?.[1]) { liveVideoId = match[1]; break; }
            }
          } catch (err) {
            console.warn(`[YouTube Live Playback] 프록시 실패:`, err);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Show the iframe immediately to prevent strict browser engines 
    // from suspending iframe loading inside hidden (display: none) frames.
    ytIframe.classList.remove('hidden');

    // Iframe 로드가 완료된 후에 로딩 오버레이를 숨김
    ytIframe.onload = () => {
      showLoading(false);
      ytIframe.onload = null;
    };

    if (liveVideoId) {
      console.log(`[YouTube Live Playback] 실시간 라이브 비디오 ID: ${liveVideoId}`);
      ytIframe.src = `https://www.youtube.com/embed/${liveVideoId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1`;
    } else {
      console.log(`[YouTube Live Playback] 동적 ID 분석 실패, 채널 ID 기반 라이브 스트림 주입`);
      ytIframe.src = `https://www.youtube.com/embed/live_stream?channel=${ch.ytChannelId}&autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1`;
    }
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
    fallbackEl.style.cssText = 'position:absolute;inset:0;z-index:50;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;padding:24px 24px 80px 24px;pointer-events:auto;';

    const parent = isPC()
      ? document.querySelector('#video-container .relative')
      : document.querySelector('.mobile-player-fixed');
    if (parent) parent.appendChild(fallbackEl);
  }

  let buttonsHtml = '';
  if (ch.officialUrl) {
    buttonsHtml += `
      <a href="${ch.officialUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#4F46E5;color:#fff;font-weight:700;font-size:0.8rem;padding:8px 20px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;margin-bottom:10px;width:200px;text-align:center;position:relative;z-index:60;"
         onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        🌐 공식 홈페이지 온에어 시청
      </a>
    `;
  }
  if (ch.ytHandle) {
    buttonsHtml += `
      <a href="${ytLiveUrl}" target="_blank" rel="noopener"
         style="display:inline-flex;align-items:center;justify-content:center;gap:6px;background:#FF0000;color:#fff;font-weight:700;font-size:0.8rem;padding:8px 20px;border-radius:9999px;text-decoration:none;transition:opacity 0.2s;margin-bottom:10px;width:200px;text-align:center;position:relative;z-index:60;"
         onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
        <svg width="18" height="12" viewBox="0 0 24 17" fill="white"><path d="M23.5 2.5a3 3 0 0 0-2.1-2.1C19.5 0 12 0 12 0S4.5 0 2.6.4A3 3 0 0 0 .5 2.5C0 4.4 0 8.5 0 8.5s0 4.1.5 6a3 3 0 0 0 2.1 2.1C4.5 17 12 17 12 17s7.5 0 9.4-.4a3 3 0 0 0 2.1-2.1C24 12.6 24 8.5 24 8.5s0-4.1-.5-6zM9.5 12V5l6.5 3.5L9.5 12z"/></svg>
        Youtube 라이브
      </a>
    `;
  }

  fallbackEl.innerHTML = `
    <div style="text-align:center;">
      <div style="font-size:2.5rem;margin-bottom:8px;">📺</div>
      <div style="color:#fff;font-weight:800;font-size:1.1rem;margin-bottom:6px;">${ch.name}</div>
      <div style="color:#9ca3af;font-size:0.8rem;margin-bottom:20px;line-height:1.5;">HLS 스트림 연결 실패 또는 방송사 보안 정책으로 인해<br>공식 홈페이지에서 안전하게 감상하실 수 있습니다.</div>
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





/* =================== TOAST NOTIFICATION SYSTEM =================== */
function showToast(message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none px-4 w-full max-w-sm';
    document.body.appendChild(toastContainer);
  }
  
  const toast = document.createElement('div');
  toast.className = 'bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 opacity-0';
  toast.innerHTML = `
    <div class="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
    <span class="flex-1 text-left">${message}</span>
  `;
  
  toastContainer.appendChild(toast);
  
  // Trigger reflow & animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
window.showToast = showToast;

/* =================== DYNAMIC QUALITY LEVEL SELECTOR =================== */
function updateQualitySelector(isPCPlatform) {
  const menu = document.getElementById(isPCPlatform ? 'quality-menu' : 'quality-menu-mobile');
  const label = document.getElementById(isPCPlatform ? 'quality-label' : 'quality-label-mobile');
  const wrapper = document.getElementById(isPCPlatform ? 'quality-select-pc-wrapper' : 'quality-select-mob-wrapper');
  if (!menu || !label) return;

  menu.innerHTML = '';

  if (!hls || !hls.levels || hls.levels.length === 0) {
    if (wrapper) wrapper.style.display = 'none';
    label.textContent = 'Auto';
    return;
  }

  // 1. 유효한 비디오 화질 해상도(height > 0 또는 attrs.RESOLUTION 파싱) 필터링
  const validLevels = hls.levels
    .map((level, index) => {
      let height = level.height;
      if ((!height || height <= 0) && level.attrs && level.attrs.RESOLUTION) {
        const parts = level.attrs.RESOLUTION.split('x');
        if (parts.length === 2) {
          height = parseInt(parts[1], 10);
        }
      }
      return { level, originalIndex: index, height };
    })
    .filter(({ height }) => height && height > 0);

  // 2. 해상도 기준 내림차순(고화질 -> 저화질) 정렬
  validLevels.sort((a, b) => b.height - a.height);

  // 3. 해상도(height) 중복 제거 (동일 해상도 다른 비트레이트 방지)
  const uniqueLevels = [];
  const seenHeights = new Set();
  for (const item of validLevels) {
    if (!seenHeights.has(item.height)) {
      seenHeights.add(item.height);
      uniqueLevels.push(item);
    }
  }

  // 4. 선택 가능한 화질 종류가 1개 이하인 경우 (선택의 여지가 없는 경우) 버튼 숨김
  if (uniqueLevels.length <= 1) {
    if (wrapper) wrapper.style.display = 'none';
    label.textContent = 'Auto';
    return;
  }

  // 선택 가능한 화질이 존재하므로 노출
  if (wrapper) wrapper.style.display = 'block';

  // 5. 현재 활성화된 화질 해상도 라벨 갱신
  if (hls.currentLevel === -1) {
    label.textContent = 'Auto';
  } else {
    const activeLevel = hls.levels[hls.currentLevel];
    let activeHeight = activeLevel ? activeLevel.height : 0;
    if ((!activeHeight || activeHeight <= 0) && activeLevel && activeLevel.attrs && activeLevel.attrs.RESOLUTION) {
      const parts = activeLevel.attrs.RESOLUTION.split('x');
      if (parts.length === 2) {
        activeHeight = parseInt(parts[1], 10);
      }
    }
    if (activeHeight && activeHeight > 0) {
      label.textContent = `${activeHeight}p`;
    } else {
      label.textContent = 'Auto';
    }
  }

  // 6. 자동 (Auto) 선택지 생성
  const autoBtn = document.createElement('button');
  autoBtn.className = 'w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-colors flex items-center justify-between ' +
    (hls.loadLevel === -1 ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5');
  autoBtn.innerHTML = `
    <span>자동 (Auto)</span>
    ${hls.loadLevel === -1 ? '<span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>' : ''}
  `;
  autoBtn.onclick = (e) => {
    e.stopPropagation();
    hls.currentLevel = -1;
    label.textContent = 'Auto';
    showToast('화질이 자동으로 변경되었습니다.');
    updateQualitySelector(isPCPlatform);
    menu.classList.add('hidden');
  };
  menu.appendChild(autoBtn);

  // 7. 해상도 기준 개별 버튼 생성 (1080p, 720p 등)
  uniqueLevels.forEach(({ level, originalIndex, height }) => {
    const labelText = `${height}p`;
    const isSelected = hls.currentLevel === originalIndex;
    
    const btn = document.createElement('button');
    btn.className = 'w-full text-left px-2.5 py-1.5 rounded-lg text-[10px] font-extrabold transition-colors flex items-center justify-between ' +
      (isSelected ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5');
    
    btn.innerHTML = `
      <span>${labelText}</span>
      ${isSelected ? '<span class="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>' : ''}
    `;
    btn.onclick = (e) => {
      e.stopPropagation();
      hls.currentLevel = originalIndex;
      label.textContent = labelText;
      showToast(`화질이 ${labelText}로 변경되었습니다.`);
      updateQualitySelector(isPCPlatform);
      menu.classList.add('hidden');
    };
    menu.appendChild(btn);
  });
}
window.updateQualitySelector = updateQualitySelector;

/* =================== WEB PAGE POPUP PLAY (PICTURE IN PICTURE) =================== */
async function toggleWebpagePiP(container, video, isMobile) {
  // 1. 브라우저가 최신 Document Picture-in-Picture API를 지원하는 경우 (Chrome, Edge, Whale 등)
  if ('documentPictureInPicture' in window) {
    // 이미 Document PiP 창이 열려 있는 경우 닫기
    if (window.documentPictureInPicture.window) {
      window.documentPictureInPicture.window.close();
      return;
    }

    try {
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 800,
        height: 450,
      });

      // 부모 창의 모든 스타일(Tailwind CSS 포함)을 복사
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.media = styleSheet.media;
          link.href = styleSheet.href;
          pipWindow.document.head.appendChild(link);
        }
      });

      // 태그 명시적 복사 (Tailwind CDN 스크립트 및 폰트)
      document.querySelectorAll('link[rel="stylesheet"], style, link[href*="fonts.googleapis.com"]').forEach((el) => {
        pipWindow.document.head.appendChild(el.cloneNode(true));
      });

      // Document PiP 창의 body 스타일링
      pipWindow.document.body.style.margin = '0';
      pipWindow.document.body.style.padding = '0';
      pipWindow.document.body.style.backgroundColor = '#000';
      pipWindow.document.body.style.overflow = 'hidden';
      pipWindow.document.body.style.width = '100vw';
      pipWindow.document.body.style.height = '100vh';

      // 원래 위치에 플레이스홀더 배치
      const placeholderId = isMobile ? 'player-placeholder-temp-mobile' : 'player-placeholder-temp';
      const oldPlaceholder = document.getElementById(placeholderId);
      if (oldPlaceholder) oldPlaceholder.remove();

      const tempPlaceholder = document.createElement('div');
      tempPlaceholder.id = placeholderId;
      tempPlaceholder.className = 'w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white/50 text-xs font-bold gap-3 relative border border-white/5';
      tempPlaceholder.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-12 h-12 rounded-full border border-indigo-500/30 flex items-center justify-center animate-pulse">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <rect x="13" y="11" width="7" height="5" rx="1" fill="#6366f1" />
            </svg>
          </div>
          <span class="absolute w-2 h-2 bg-indigo-500 rounded-full -top-1 -right-1 animate-ping"></span>
        </div>
        <span class="tracking-widest">영상이 팝업 플레이(PiP) 창에서 재생 중입니다.</span>
        <button onclick="window.closeDocumentPiP()" class="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-bold tracking-wider shadow-lg shadow-indigo-500/20 active:scale-95 transition-all">팝업 창 닫기</button>
      `;
      
      container.parentNode.insertBefore(tempPlaceholder, container);

      // 플레이어 컨테이너를 PiP 창으로 이동
      pipWindow.document.body.appendChild(container);

      // PiP 내부에서 화면에 가득 차도록 인라인 스타일 강제 설정
      container.style.width = '100vw';
      container.style.height = '100vh';
      container.style.maxWidth = 'none';
      container.style.maxHeight = 'none';
      container.style.borderRadius = '0';

      // 임시 글로벌 닫기 함수 제공
      window.closeDocumentPiP = () => {
        if (pipWindow) pipWindow.close();
      };

      showToast('웹페이지 팝업 플레이가 시작되었습니다.');

      // PiP 창이 닫힐 때 원래 위치로 복구
      pipWindow.addEventListener('pagehide', (event) => {
        container.style.width = '100%';
        container.style.height = '100%';
        container.style.maxWidth = '';
        container.style.maxHeight = '';
        container.style.borderRadius = '';

        const placeholderEl = document.getElementById(placeholderId);
        if (placeholderEl) {
          placeholderEl.parentNode.insertBefore(container, placeholderEl);
          placeholderEl.remove();
        }
        showToast('팝업 플레이가 종료되었습니다.');
      });

    } catch (err) {
      console.error('Document PiP Error:', err);
      // 권한 거부 등의 에러 시 표준 PiP로 폴백
      fallbackToStandardPiP(video, container, isMobile);
    }
  } else {
    // 2. Document PiP를 지원하지 않는 브라우저 (Firefox, Safari 등) 또는 모바일인 경우 표준 비디오 PiP 실행
    fallbackToStandardPiP(video, container, isMobile);
  }
}

// Web-PiP 팝업 플레이 상태 변수
let isWebPiPActive = false;
let webPiPContainer = null;
let webPiPPlaceholder = null;
let webPiPOriginalStyles = {};

// 인앱 팝업 플레이(Web-PiP) 활성화 함수
function enableWebPiP(video, container, isMobile) {
  if (isWebPiPActive) {
    disableWebPiP(isMobile);
    return;
  }

  isWebPiPActive = true;
  webPiPContainer = container;

  // 1. 플레이스홀더 생성 및 원래 자리에 임시 삽입
  const placeholderId = isMobile ? 'player-placeholder-web-temp-mobile' : 'player-placeholder-web-temp';
  const oldPlaceholder = document.getElementById(placeholderId);
  if (oldPlaceholder) oldPlaceholder.remove();

  webPiPPlaceholder = document.createElement('div');
  webPiPPlaceholder.id = placeholderId;
  webPiPPlaceholder.className = 'w-full h-full bg-zinc-950 flex flex-col items-center justify-center text-white/50 text-[10px] font-bold gap-3 relative border border-white/5';
  webPiPPlaceholder.innerHTML = `
    <div class="relative flex items-center justify-center">
      <div class="w-10 h-10 rounded-full border border-indigo-500/30 flex items-center justify-center animate-pulse">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <rect x="13" y="11" width="7" height="5" rx="1" fill="#6366f1" />
        </svg>
      </div>
    </div>
    <span class="tracking-widest">인앱 팝업 플레이(Web-PiP)가 활성화되었습니다.</span>
    <button id="restore-web-pip-btn" class="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold tracking-wider shadow-lg active:scale-95 transition-all">팝업 창 닫기</button>
  `;

  container.parentNode.insertBefore(webPiPPlaceholder, container);

  webPiPPlaceholder.querySelector('#restore-web-pip-btn').onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    disableWebPiP(isMobile);
  };

  // 2. 오리지널 스타일 보관 및 우하단 fixed 플로팅 스타일링
  webPiPOriginalStyles = {
    position: container.style.position,
    bottom: container.style.bottom,
    right: container.style.right,
    width: container.style.width,
    height: container.style.height,
    zIndex: container.style.zIndex,
    boxShadow: container.style.boxShadow,
    border: container.style.border,
    borderRadius: container.style.borderRadius,
    overflow: container.style.overflow
  };

  const pipWidth = isMobile ? '200px' : '320px';
  const pipHeight = isMobile ? '112.5px' : '180px';

  container.style.setProperty('position', 'fixed', 'important');
  container.style.setProperty('bottom', '80px', 'important'); // 바텀 네비게이션 고려 높이 조정
  container.style.setProperty('right', '16px', 'important');
  container.style.setProperty('width', pipWidth, 'important');
  container.style.setProperty('height', pipHeight, 'important');
  container.style.setProperty('zIndex', '9999', 'important');
  container.style.setProperty('boxShadow', '0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.5)', 'important');
  container.style.setProperty('border', '1px solid rgba(255, 255, 255, 0.15)', 'important');
  container.style.setProperty('borderRadius', '12px', 'important');
  container.style.setProperty('overflow', 'hidden', 'important');

  // 3. 플로팅 창 내부 우상단 닫기 버튼 오버레이 추가
  const closeBtnId = 'web-pip-close-btn';
  const oldCloseBtn = document.getElementById(closeBtnId);
  if (oldCloseBtn) oldCloseBtn.remove();

  const closeBtn = document.createElement('button');
  closeBtn.id = closeBtnId;
  closeBtn.className = 'absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full z-50 transition-colors shadow-md';
  closeBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  `;
  closeBtn.onclick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    disableWebPiP(isMobile);
  };
  container.appendChild(closeBtn);

  showToast('인앱 팝업 플레이가 실행되었습니다.');
}

// 인앱 팝업 플레이(Web-PiP) 종료 및 복원 함수
function disableWebPiP(isMobile) {
  if (!isWebPiPActive || !webPiPContainer) return;

  if (webPiPOriginalStyles) {
    Object.keys(webPiPOriginalStyles).forEach(key => {
      webPiPContainer.style[key] = webPiPOriginalStyles[key];
    });
  }

  const closeBtn = document.getElementById('web-pip-close-btn');
  if (closeBtn) closeBtn.remove();

  if (webPiPPlaceholder) {
    webPiPPlaceholder.parentNode.insertBefore(webPiPContainer, webPiPPlaceholder);
    webPiPPlaceholder.remove();
  }

  isWebPiPActive = false;
  webPiPContainer = null;
  webPiPPlaceholder = null;
  webPiPOriginalStyles = {};

  showToast('팝업 플레이가 종료되었습니다.');
}

// 표준 PiP 및 별도 팝업창(유튜브 전용) 폴백 함수
async function fallbackToStandardPiP(video, container, isMobile) {
  if (isYouTubeMode) {
    // 유튜브인 경우 별도 팝업 창(window.open) 기동
    const activeCh = CHANNELS.find(c => c.id === activeChannelId);
    if (activeCh) {
      showToast('유튜브 채널은 전용 팝업 창으로 재생합니다.');
      const popupUrl = `https://www.youtube.com/embed/live_stream?channel=${activeCh.ytChannelId}&autoplay=1&mute=0`;
      window.open(
        popupUrl, 
        'LiveTVPopupPlayer', 
        'width=800,height=450,menubar=no,toolbar=no,location=no,status=no,resizable=yes'
      );
    } else {
      showToast('유튜브 재생 팝업을 실행할 수 없습니다.');
    }
    return;
  }

  // HLS/일반 비디오 재생의 경우 표준 requestPictureInPicture 호출
  if (!video) return;
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      showToast('팝업 플레이를 종료합니다.');
    } else {
      if (video.requestPictureInPicture) {
        await video.requestPictureInPicture();
        showToast('팝업 플레이를 시작합니다.');
      } else {
        // 비지원 모바일 브라우저인 경우 인앱 Web-PiP로 대응
        enableWebPiP(video, container, isMobile);
      }
    }
  } catch (err) {
    console.error('Standard PiP Error:', err);
    // 보안 문제(HTTP insecure origin) 등으로 네이티브 PiP 거부 시 인앱 Web-PiP로 완벽 폴백
    enableWebPiP(video, container, isMobile);
  }
}

/* =================== VIDEO CONTROLS =================== */
function initControls() {
  const setup = (video, fsBtn, volBtn, volSlider, container, pipBtn) => {
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

    // Picture-in-Picture (Popup Play)
    if (pipBtn) {
      pipBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isMobile = pipBtn.id === 'pip-btn-mobile';
        await toggleWebpagePiP(container, video, isMobile);
      };
    }
  };

  // PC
  setup(
    videoEl, 
    document.getElementById('fullscreen-btn'), 
    document.getElementById('vol-btn'), 
    document.getElementById('vol-slider'),
    document.getElementById('video-inner-screen'),
    document.getElementById('pip-btn')
  );

  // Mobile
  setup(
    videoElMob,
    document.getElementById('fullscreen-btn-mobile'),
    document.getElementById('vol-btn-mobile'),
    null,
    document.querySelector('.mobile-player-fixed'),
    document.getElementById('pip-btn-mobile')
  );

  // Quality Selection Toggle (PC)
  const qualityBtn = document.getElementById('quality-btn');
  const qualityMenu = document.getElementById('quality-menu');
  if (qualityBtn && qualityMenu) {
    qualityBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mobMenu = document.getElementById('quality-menu-mobile');
      if (mobMenu) mobMenu.classList.add('hidden');
      qualityMenu.classList.toggle('hidden');
      updateQualitySelector(true);
    };
  }

  // Quality Selection Toggle (Mobile)
  const qualityBtnMob = document.getElementById('quality-btn-mobile');
  const qualityMenuMob = document.getElementById('quality-menu-mobile');
  if (qualityBtnMob && qualityMenuMob) {
    qualityBtnMob.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const pcMenu = document.getElementById('quality-menu');
      if (pcMenu) pcMenu.classList.add('hidden');
      qualityMenuMob.classList.toggle('hidden');
      updateQualitySelector(false);
    };
  }

  // Close menus when clicking outside
  document.addEventListener('click', () => {
    if (qualityMenu) qualityMenu.classList.add('hidden');
    if (qualityMenuMob) qualityMenuMob.classList.add('hidden');
  });

  const setupAutoHide = (video, controls, wrapper) => {
    if (!video || !controls || !wrapper) return;
    let timeout = null;

    const show = () => {
      const isYtActive = !document.getElementById('youtube-iframe-pc').classList.contains('hidden') || 
                         !document.getElementById('youtube-iframe-mobile').classList.contains('hidden');
      
      // 영상 엘리먼트가 숨김 상태(재생 전/에러 상태)이고 유튜브 모드도 아니라면 컨트롤을 무조건 숨김
      if (video.classList.contains('hidden') && !isYtActive) {
        hide();
        return;
      }
      controls.classList.remove('opacity-0', 'pointer-events-none');
      controls.classList.add('opacity-100', 'pointer-events-auto');
      if (timeout) clearTimeout(timeout);
      
      // 일반 비디오 재생(HLS) 중일 때만 5초 뒤 자동 숨김 처리 적용
      if (!video.paused && !isYtActive) {
        timeout = setTimeout(hide, 5000);
      }
    };

    const hide = () => {
      controls.classList.remove('opacity-100', 'pointer-events-auto');
      controls.classList.add('opacity-0', 'pointer-events-none');
      if (timeout) clearTimeout(timeout);
    };

    wrapper.addEventListener('click', (e) => {
      if (controls.contains(e.target)) return;
      const isYtActive = !document.getElementById('youtube-iframe-pc').classList.contains('hidden') || 
                         !document.getElementById('youtube-iframe-mobile').classList.contains('hidden');
      
      // 재생 중이 아닐 때는 클릭 토글 방지
      if (video.classList.contains('hidden') && !isYtActive) return;

      const isVisible = controls.classList.contains('opacity-100');
      if (isVisible) {
        hide();
      } else {
        show();
      }
    });

    controls.addEventListener('click', (e) => {
      e.stopPropagation();
      show();
    });
    
    controls.addEventListener('mousemove', () => {
      show();
    });

    video.addEventListener('play', () => {
      show();
    });

    video.addEventListener('pause', () => {
      show();
    });

    // 최초 진입 시에는 완전히 숨김 처리
    hide();
  };

  setupAutoHide(
    videoEl,
    document.getElementById('video-controls'),
    document.getElementById('video-inner-screen')
  );

  setupAutoHide(
    videoElMob,
    document.getElementById('video-controls-mobile'),
    document.querySelector('.mobile-player-fixed')
  );
}

/* =================== INIT =================== */
window.handleYouTubeLogin = () => { window.location.href = 'youtube.html'; };

function updateBottomBarActiveState(tabName) {
  const btns = {
    live: document.getElementById('tab-btn-live'),
    favorites: document.getElementById('tab-btn-favorites')
  };
  Object.entries(btns).forEach(([k, btn]) => {
    if (!btn) return;
    if (k === tabName) {
      btn.classList.add('text-indigo-400');
      btn.classList.remove('text-gray-500', 'hover:text-white');
    } else {
      btn.classList.remove('text-indigo-400');
      btn.classList.add('text-gray-500', 'hover:text-white');
    }
  });
}
window.updateBottomBarActiveState = updateBottomBarActiveState;


window.switchTab = function(tabName) {
  const btns = {
    live: document.getElementById('tab-btn-live'),
    favorites: document.getElementById('tab-btn-favorites')
  };

  Object.entries(btns).forEach(([k, btn]) => {
    if (!btn) return;
    if (k === tabName) {
      btn.classList.add('text-indigo-400');
      btn.classList.remove('text-gray-500', 'hover:text-white');
    } else {
      btn.classList.remove('text-indigo-400');
      btn.classList.add('text-gray-500', 'hover:text-white');
    }
  });

  if (tabName === 'live') {
    activeCategoryFilter = null;
    renderCategories();
    renderChannels();
  } else if (tabName === 'favorites') {
    activeCategoryFilter = '즐겨찾기';
    renderCategories();
    renderChannels();
  } else if (tabName === 'youtube') {
    window.location.href = 'youtube.html';
  }
};

function initHeaderStatus() {
  const timeEl = document.getElementById('status-time');
  const batteryBar = document.getElementById('battery-bar');
  const batteryText = document.getElementById('battery-text');

  function updateTime() {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    if (timeEl) timeEl.textContent = `${hrs}:${mins}`;
  }

  async function updateBattery() {
    try {
      const battery = await navigator.getBattery();
      function updateInfo() {
        const pct = Math.round(battery.level * 100);
        if (batteryBar) batteryBar.style.width = `${pct}%`;
        if (batteryText) batteryText.textContent = `${pct}%`;
      }
      updateInfo();
      battery.addEventListener('levelchange', updateInfo);
    } catch(e) {
      if (batteryBar) batteryBar.style.width = '88%';
      if (batteryText) batteryText.textContent = '88%';
    }
  }

  updateTime();
  setInterval(updateTime, 1000);
  updateBattery();
}

document.addEventListener('DOMContentLoaded', async () => {
  renderCategories();
  renderChannels();
  initControls(); // 컨트롤 초기화
  initHeaderStatus(); // 상단 헤더 시간/배터리 잔량 초기화

  // URL 파라미터 체크로 즐겨찾기 초기 활성화 지원
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab');
  if (initialTab === 'favorites') {
    window.switchTab('favorites');
  }

  // 페이지 진입 시 첫 번째 채널 자동 재생 방지 (사용자가 클릭할 때만 플레이 가능하게 수정)
  // if (!activeChannelId && CHANNELS.length > 0) {
  //   playChannel(CHANNELS[0]);
  // }
});
