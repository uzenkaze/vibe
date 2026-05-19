// Han's Play - YouTube Page Logic

// Pre-loaded popular Korean channels
const DEFAULT_CHANNELS = [
  { id: 'UCsJ6RuBiGBq6CmSGsajv2EA', name: 'JTBC News', handle: '@JTBC_news', cat: 'news' },
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN', handle: '@ytnnews24', cat: 'news' },
  { id: 'UCddiUEpeqJcYeBxX1IVBKvQ', name: 'MBC News', handle: '@mbcnews', cat: 'news' },
  { id: 'UCPNFgbGLbpLXMRWKPnZ5Ong', name: 'KBS News', handle: '@KBSnews', cat: 'news' },
  { id: 'UCWsVpQ3FNjDGcqrP0gkApfQ', name: 'SBS News', handle: '@SBSnews8', cat: 'news' },
  { id: 'UCFZj5R7KIBVeMEEvYFgHHTA', name: 'MBC Entertainment', handle: '@MBCentertain', cat: 'entertainment' },
  { id: 'UCPF2a3-_3kzLpqLepRb-Ueg', name: 'SBS Entertainment', handle: '@SBSentertain', cat: 'entertainment' },
];

let allChannels = [];
let allVideos = [];
let currentFilter = 'all';

async function fetchChannelVideos(channelId, channelName, channelCat) {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    const res = await fetch(proxy, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const parser = new DOMParser();
    const xml = parser.parseFromString(data.contents || '', 'text/xml');
    const entries = [...xml.querySelectorAll('entry')].slice(0, 8);
    return entries.map(e => {
      const videoId = e.querySelector('videoId')?.textContent || '';
      const published = e.querySelector('published')?.textContent || '';
      return {
        videoId,
        title: e.querySelector('title')?.textContent || '',
        channelId,
        channelName,
        channelCat,
        thumb: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        published,
        timeAgo: timeAgo(published),
      };
    }).filter(v => v.videoId);
  } catch { return []; }
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + '분 전';
  if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
  if (diff < 2592000) return Math.floor(diff / 86400) + '일 전';
  return Math.floor(diff / 2592000) + '개월 전';
}

function playVideo(videoId, title) {
  document.getElementById('yt-iframe').src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  document.getElementById('player-title').textContent = title;
  document.getElementById('player-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePlayer() {
  document.getElementById('yt-iframe').src = '';
  document.getElementById('player-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function openAddModal() { document.getElementById('add-modal').classList.add('open'); }
function closeAddModal() { document.getElementById('add-modal').classList.remove('open'); }

async function resolveChannelId(input) {
  input = input.trim();
  if (/^UC[\w-]{22}$/.test(input)) return input;
  
  const handle = input.replace('@', '');
  const url = `https://www.youtube.com/@${handle}`;
  
  // CORS 프록시 풀 (allorigins, corsproxy.io, codetabs)
  const proxies = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(url);
      console.log(`[YouTube Resolver] 시도 중인 프록시: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      let html = "";
      
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        html = data.contents || "";
      } else {
        html = await res.text();
      }

      if (html) {
        // 패턴 1: JSON channelId 매칭
        let match = html.match(/"channelId":"(UC[\w-]{22})"/);
        if (match?.[1]) return match[1];

        // 패턴 2: canonical 또는 og:url (/channel/UC...) 매칭
        match = html.match(/channel\/(UC[\w-]{22})/);
        if (match?.[1]) return match[1];

        // 패턴 3: itemprop="channelId" 매칭
        match = html.match(/itemprop="channelId" content="(UC[\w-]{22})"/);
        if (match?.[1]) return match[1];
      }
    } catch (e) {
      console.warn(`[YouTube Resolver] 프록시 실패:`, e);
    }
  }
  return null;
}

async function addChannel() {
  const input = document.getElementById('ch-input').value.trim();
  const statusEl = document.getElementById('add-status');
  if (!input) { statusEl.textContent = '채널명을 입력하세요.'; return; }
  statusEl.style.color = '#888'; statusEl.textContent = '🔍 채널을 검색 중...';
  const channelId = await resolveChannelId(input);
  if (!channelId) {
    statusEl.style.color = '#f87171'; statusEl.textContent = '❌ 채널을 찾을 수 없습니다.';
    return;
  }
  if (allChannels.find(c => c.id === channelId)) {
    statusEl.style.color = '#fbbf24'; statusEl.textContent = '이미 추가된 채널입니다.';
    return;
  }
  statusEl.textContent = '📡 영상을 가져오는 중...';
  const chName = input.replace(/^https?:\/\/.+\//, '').replace('@', '') || channelId;
  const newCh = { id: channelId, name: chName, handle: input, cat: 'custom' };
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

function makeCard(v) {
  const card = document.createElement('div');
  card.className = 'yt-card';
  card.onclick = () => playVideo(v.videoId, v.title);
  card.innerHTML = `
    <div class="yt-thumb">
      <img src="${v.thumb}" alt="${v.title}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="yt-card-info">
      <div class="yt-avatar" style="background:${strColor(v.channelName)}">${v.channelName.charAt(0)}</div>
      <div class="yt-meta">
        <div class="yt-title">${v.title}</div>
        <div class="yt-ch-name">${v.channelName}</div>
        <div class="yt-info-row">${v.timeAgo}</div>
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

const CAT_MAP = { news: '뉴스', entertainment: '오락/예능', sports: '스포츠', music: '음악', edu: '교육', custom: '직접 추가' };

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

function renderGrid(videos, title) {
  const main = document.getElementById('yt-main');
  main.innerHTML = title ? `<div class="section-title">${title}</div>` : '';
  if (!videos.length) {
    main.innerHTML += `<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><h3>영상이 없습니다</h3><p>채널을 추가하면 최신 영상이 표시됩니다</p></div>`;
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'yt-grid';
  videos.forEach(v => grid.appendChild(makeCard(v)));
  main.appendChild(grid);
}

function renderContent() {
  const filtered = currentFilter === 'all'
    ? allVideos
    : allVideos.filter(v => v.channelCat === currentFilter);

  if (!filtered.length && allVideos.length === 0) {
    document.getElementById('yt-main').innerHTML = `
      <div class="empty-state">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <h3>채널이 없습니다</h3>
        <p>우측 상단 <strong>채널 추가</strong>를 눌러<br>원하는 YouTube 채널을 추가해 보세요<br><br>예: @JTBC_news · @YTN_news24 · @MBCentertain</p>
      </div>`;
    return;
  }
  renderGrid(filtered, currentFilter === 'all' ? '' : (CAT_MAP[currentFilter] || ''));
}

async function init() {
  document.getElementById('yt-main').innerHTML = '<div class="yt-loading"><div class="yt-spinner"></div><span>채널 영상을 불러오는 중...</span></div>';
  const saved = loadSavedChannels();
  allChannels = [...DEFAULT_CHANNELS, ...saved];
  // Fetch all channels in parallel
  const results = await Promise.allSettled(
    allChannels.map(ch => fetchChannelVideos(ch.id, ch.name, ch.cat))
  );
  allVideos = results.flatMap((r, i) => r.status === 'fulfilled' ? r.value : []);
  // Sort by published date
  allVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
  renderContent();
}

// ESC to close player
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer(); });
init();
