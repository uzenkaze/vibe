// PlayTime - YouTube Page Logic

const DEFAULT_CHANNELS = [
  { id: 'UCsU-I-vHLiaMfV_ceaYz5rQ', name: 'JTBC News', handle: '@jtbc_news', cat: 'news' },
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN News', handle: '@ytnnews24', cat: 'news' },
  { id: 'UC83AqmaH33x59139C7C5CXA', name: 'SBS \ub274\uc2a4', handle: '@sbsnews8', cat: 'news' },
  { id: 'UCsJ6RuBi65JHJkZYO1MECIA', name: '\uc288\uce74\uc6d4\ub4dc', handle: '@syukaworld', cat: 'opinion' },
  { id: 'UCO850F-GqB3hSpR3M7z182A', name: '\uc0bc\ud504\ub85cTV', handle: '@3proTV', cat: 'opinion' },
  { id: 'UC3K0_A1vpyN8SLeJ_0S5yfg', name: '\uc9c0\ubb34\ube44', handle: '@G-Movie', cat: 'movie' },
  { id: 'UCaHGGHs_R54KGDpy7IdFmew', name: '\uace0\ubabd', handle: '@gomong', cat: 'movie' },
  { id: 'UCQ27n_iHn0D2c5kH5vms_qA', name: '\ube44\ubc00', handle: '@bbiman', cat: 'movie' },
  { id: 'UCja972fEZg2w3RLs20wS58A', name: 'MBC \uc608\ub2a5', handle: '@MBCentertain', cat: 'entertainment' },
  { id: 'UCsw9H2x4ZfnbK7L1D61f0LQ', name: '\uc6cc\ud06c\ub9e8', handle: '@workman', cat: 'entertainment' },
  { id: 'UCg__zD5FrXzTch_5T-j8LpA', name: '\uc2dd\uc0ac\ub300', handle: '@psickuniv', cat: 'entertainment' },
  { id: 'UC51C_fIOXpxGZk6L34sJb8g', name: '\ub529\uace0 \ubba4\uc9c1', handle: '@dingo.music', cat: 'music' },
  { id: 'UC3IZKseVpdzPSBaWxBxundA', name: 'Stone Music', handle: '@stonemusicdev', cat: 'music' },
  { id: 'UCpGDZUXVpP9vsp6gP21Fk-w', name: 'KBS Kpop', handle: '@kbskpop', cat: 'music' }
];

const FALLBACK_VIDEOS = [
  { videoId: '3Vq58h_8l90', title: '[\ub77c\uc774\ube0c] JTBC \ub274\uc2a4\ub8f8', channelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ', channelName: 'JTBC News', channelCat: 'news', thumb: 'https://i.ytimg.com/vi/3Vq58h_8l90/mqdefault.jpg', published: '2026-05-22T00:00:00Z', timeAgo: '\uc2e4\uc2dc\uac04', views: 1250000 },
  { videoId: 'zW8C_m4R2aQ', title: '[\ub77c\uc774\ube0c] YTN \ub274\uc2a4', channelId: 'UChlgI3UHCOnwUGzWzbJ3H5w', channelName: 'YTN News', channelCat: 'news', thumb: 'https://i.ytimg.com/vi/zW8C_m4R2aQ/mqdefault.jpg', published: '2026-05-22T00:00:00Z', timeAgo: '\uc2e4\uc2dc\uac04', views: 3420000 },
  { videoId: '6p6_fI-f6jQ', title: '\uacbd\uc81c \ube0c\ub9ac\ud551', channelId: 'UCsJ6RuBi65JHJkZYO1MECIA', channelName: '\uc288\uce74\uc6d4\ub4dc', channelCat: 'opinion', thumb: 'https://i.ytimg.com/vi/6p6_fI-f6jQ/mqdefault.jpg', published: '2026-05-21T18:00:00Z', timeAgo: '1\uc77c \uc804', views: 1480000 },
  { videoId: 'hXW5-4dE6cQ', title: '\uc601\ud654 \ub9ac\ubdf0', channelId: 'UC3K0_A1vpyN8SLeJ_0S5yfg', channelName: '\uc9c0\ubb34\ube44', channelCat: 'movie', thumb: 'https://i.ytimg.com/vi/hXW5-4dE6cQ/mqdefault.jpg', published: '2026-05-20T10:00:00Z', timeAgo: '2\uc77c \uc804', views: 2350000 },
  { videoId: 'L0l80j01h2o', title: '\uc608\ub2a5 \ud558\uc774\ub77c\uc774\ud2b8', channelId: 'UCja972fEZg2w3RLs20wS58A', channelName: 'MBC \uc608\ub2a5', channelCat: 'entertainment', thumb: 'https://i.ytimg.com/vi/L0l80j01h2o/mqdefault.jpg', published: '2026-05-21T12:00:00Z', timeAgo: '1\uc77c \uc804', views: 3200000 },
  { videoId: 'wD1nvy9wP-U', title: 'K-Pop \uc2a4\ud14c\uc774\uc9c0', channelId: 'UC51C_fIOXpxGZk6L34sJb8g', channelName: '\ub529\uace0 \ubba4\uc9c1', channelCat: 'music', thumb: 'https://i.ytimg.com/vi/wD1nvy9wP-U/mqdefault.jpg', published: '2026-05-21T09:00:00Z', timeAgo: '1\uc77c \uc804', views: 5600000 }
];

let allChannels = [];
let allVideos = [];
let currentFilter = 'all';
let currentPlayingVideoId = null;
let playerHistoryPushed = false;
let currentFilteredVideos = [];
let renderedVideoCount = 0;
const ITEMS_PER_PAGE = 16;
let scrollObserver = null;

const CAT_MAP = {
  news: '\ub274\uc2a4',
  opinion: '\uc2dc\uc0ac',
  movie: '\uc601\ud654',
  entertainment: '\uc624\ub77d/\uc608\ub2a5',
  music: '\uc74c\uc545',
  custom: '\uc9c1\uc811 \ucd94\uac00'
};

async function fetchChannelVideos(channelId, channelName, channelCat) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const proxies = [
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of proxies) {
    try {
      const proxyUrl = getProxyUrl(rssUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      let contents = '';
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        contents = data.contents || '';
      } else {
        contents = await res.text();
      }

      if (!contents || (!contents.includes('<entry>') && !contents.includes('&lt;entry&gt;'))) continue;

      const parser = new DOMParser();
      const xml = parser.parseFromString(contents, 'text/xml');
      let entries = [...xml.querySelectorAll('entry')];
      if (!entries.length) entries = [...xml.getElementsByTagName('entry')];
      entries = entries.slice(0, 8);
      if (!entries.length) continue;

      const parsedVideos = entries.map(e => {
        try {
          const videoId =
            e.querySelector('videoId')?.textContent ||
            e.getElementsByTagName('yt:videoId')?.[0]?.textContent ||
            e.querySelector('yt\\:videoId')?.textContent ||
            '';
          if (!videoId) return null;
          const published = e.querySelector('published')?.textContent || '';
          let views = 0;
          try {
            const statistics =
              e.querySelector('statistics') ||
              e.getElementsByTagName('media:statistics')?.[0] ||
              e.querySelector('media\\:statistics');
            if (statistics) {
              const viewAttr = statistics.getAttribute('views');
              if (viewAttr) views = parseInt(viewAttr, 10) || 0;
            }
          } catch (_) { /* ignore */ }
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
        } catch {
          return null;
        }
      }).filter(v => v && v.videoId);

      parsedVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
      return parsedVideos;
    } catch (e) {
      console.warn('[YouTube RSS] \ud504\ub85d\uc2dc \uc2e4\ud328:', e);
    }
  }
  return [];
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const diff = (Date.now() - new Date(isoStr).getTime()) / 1000;
  if (diff < 3600) return Math.floor(diff / 60) + '\uBD84 \uC804';
  if (diff < 86400) return Math.floor(diff / 3600) + '\uC2DC\uAC04 \uC804';
  if (diff < 2592000) return Math.floor(diff / 86400) + '\uC77C \uC804';
  return Math.floor(diff / 2592000) + '\uAC1C\uC6D4 \uC804';
}

function playVideo(videoId, title) {
  currentPlayingVideoId = videoId;
  const iframe = document.getElementById('yt-iframe');
  if (iframe) {
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  const titleEl = document.getElementById('player-title');
  if (titleEl) titleEl.textContent = title;
  const overlay = document.getElementById('player-overlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  if (!playerHistoryPushed) {
    history.pushState({ playerOpen: true }, '');
    playerHistoryPushed = true;
  }
}

function closePlayer(avoidPopState = false) {
  const iframe = document.getElementById('yt-iframe');
  if (iframe) iframe.src = '';
  const overlay = document.getElementById('player-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
  if (playerHistoryPushed && !avoidPopState) {
    history.back();
  }
  playerHistoryPushed = false;
}

window.addEventListener('popstate', () => {
  const overlay = document.getElementById('player-overlay');
  if (overlay?.classList.contains('open')) closePlayer(true);
});

function formatViews(views) {
  if (!views) return '\uc870\ud68c\uc218 \uc5c6\uc74c';
  if (views >= 100000000) return `\uc870\ud68c\uc218 ${(views / 100000000).toFixed(1).replace('.0', '')}\uc5b5\ud68c`;
  if (views >= 10000) return `\uc870\ud68c\uc218 ${(views / 10000).toFixed(1).replace('.0', '')}\ub9cc\ud68c`;
  if (views >= 1000) return `\uc870\ud68c\uc218 ${(views / 1000).toFixed(1).replace('.0', '')}\ucc9c\ud68c`;
  return `\uc870\ud68c\uc218 ${views}\ud68c`;
}

function strColor(str) {
  const colors = ['#7c3aed', '#1d4ed8', '#059669', '#b45309', '#be185d', '#0891b2', '#dc2626'];
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}

function makeCard(v) {
  const card = document.createElement('div');
  card.className = 'yt-card';
  card.onclick = () => playVideo(v.videoId, v.title);
  const viewStr = formatViews(v.views);
  const infoText = viewStr ? `${viewStr} ? ${v.timeAgo}` : v.timeAgo;
  card.innerHTML = `
    <div class="yt-thumb">
      <div class="yt-thumb-fallback">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color:#818cf8;opacity:0.85">
          <polygon points="6 3 20 12 6 21 6 3" fill="rgba(129,140,248,0.15)"/>
        </svg>
        <span style="opacity:0.7">PlayTime</span>
      </div>
      <img class="yt-thumb-img" src="${v.thumb}" alt="" loading="lazy" style="opacity:0;transition:opacity 0.3s ease" onload="this.style.opacity='1'" onerror="this.style.display='none'">
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

function renderGrid(videos, title) {
  const main = document.getElementById('yt-main');
  currentFilteredVideos = videos;
  renderedVideoCount = 0;
  main.innerHTML = title ? `<div class="section-title">${title}</div>` : '';
  if (!videos.length) {
    main.innerHTML += `<div class="empty-state"><svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg><h3>\uc601\uc0c1\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</h3><p>\ucc44\ub110\uc744 \ucd94\uac00\ud558\uba74 \ucd5c\uc2e0 \uc601\uc0c1\uc774 \ud45c\uc2dc\ub429\ub2c8\ub2e4</p></div>`;
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
  sentinel.innerHTML = `<div class="yt-spinner" style="width:28px;height:28px;border-width:2px"></div><span style="font-size:13px;color:#888">\ub354 \ubd88\ub7ec\uc624\ub294 \uc911...</span>`;
  main.appendChild(sentinel);
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) loadMoreVideos();
  }, { rootMargin: '200px' });
  scrollObserver.observe(sentinel);
  loadMoreVideos();
}

function loadMoreVideos() {
  const grid = document.getElementById('yt-grid-container');
  const sentinel = document.getElementById('scroll-sentinel');
  if (!grid || !sentinel) return;
  let nextBatch = currentFilteredVideos.slice(renderedVideoCount, renderedVideoCount + ITEMS_PER_PAGE);
  if (nextBatch.length === 0 && allVideos.length > 0) {
    const shuffled = [...allVideos].sort(() => 0.5 - Math.random());
    nextBatch = shuffled.slice(0, ITEMS_PER_PAGE);
  }
  if (!nextBatch.length) {
    sentinel.style.display = 'none';
    return;
  }
  sentinel.style.display = 'flex';
  nextBatch.forEach(v => grid.appendChild(makeCard(v)));
  renderedVideoCount += nextBatch.length;
  sentinel.style.display = renderedVideoCount < currentFilteredVideos.length ? 'flex' : 'none';
}

function renderChannelList() {
  const main = document.getElementById('yt-main');
  document.getElementById('custom-channel-list-section')?.remove();
  const customChannels = allChannels.filter(c => c.cat === 'custom');
  if (!customChannels.length) return;
  const section = document.createElement('div');
  section.id = 'custom-channel-list-section';
  section.style.cssText = 'margin-top:40px;padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);padding-bottom:40px';
  section.innerHTML = `
    <div class="section-title" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
      <span>\ub0b4\uac00 \ucd94\uac00\ud55c \ucc44\ub110</span>
      <span style="font-size:11px;color:#666;font-weight:normal">총 ${customChannels.length}개</span>
    </div>
    <div class="yt-ch-list" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px"></div>`;
  const list = section.querySelector('.yt-ch-list');
  customChannels.forEach(ch => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.05);padding:12px 16px;border-radius:12px';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;cursor:pointer;flex:1;min-width:0" onclick="filterByChannel('${ch.id}')">
        <div class="yt-avatar" style="background:${strColor(ch.name)}">${ch.name.charAt(0).toUpperCase()}</div>
        <div style="min-width:0">
          <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ch.name}</div>
          <div style="font-size:11px;color:#666;margin-top:2px">${ch.handle || '@' + ch.name}</div>
        </div>
      </div>
      <button type="button" onclick="removeChannel(event,'${ch.id}')" style="background:none;border:none;color:#ef4444;cursor:pointer;padding:6px" title="\ucc44\ub110 \uc0ad\uc81c">\u2715</button>`;
    list.appendChild(row);
  });
  main.appendChild(section);
}

function renderContent() {
  let filtered = currentFilter === 'all' ? allVideos : allVideos.filter(v => v.channelCat === currentFilter);
  if (currentFilter === 'all' || currentFilter === 'custom') {
    filtered.sort((a, b) => new Date(b.published) - new Date(a.published));
  } else {
    filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
  }
  if (!filtered.length && !allVideos.length) {
    document.getElementById('yt-main').innerHTML = `
      <div class="empty-state">
        <svg width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.2" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
        <h3>\ucc44\ub110\uc774 \uc5c6\uc2b5\ub2c8\ub2e4</h3>
        <p>\uc0c1\ub2e8 <strong>\ucc44\ub110 \ucd94\uac00</strong>\ub97c \ub20c\ub7ec YouTube \ucc44\ub110\uc744 \ucd94\uac00\ud574 \ubcf4\uc138\uc694</p>
      </div>`;
    renderChannelList();
    return;
  }
  renderGrid(filtered, currentFilter === 'all' ? '' : (CAT_MAP[currentFilter] || ''));
  renderChannelList();
}

function filterCat(cat, btn) {
  currentFilter = cat;
  document.querySelectorAll('.yt-cat').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderContent();
}

function doSearch() {
  const q = document.getElementById('search-input')?.value?.trim().toLowerCase();
  if (!q) { renderContent(); return; }
  const filtered = allVideos.filter(v =>
    v.title.toLowerCase().includes(q) || v.channelName.toLowerCase().includes(q)
  );
  renderGrid(filtered, `"${q}" \uac80\uc0c9 \uacb0\uacfc`);
  renderChannelList();
}

async function resolveChannelId(input) {
  input = input.trim();
  if (/^UC[\w-]{22}$/.test(input)) return { id: input, name: input };
  let targetUrl = '';
  let fallbackName = '';
  const channelIdMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/channel\/(UC[\w-]{22})/i);
  if (channelIdMatch?.[1]) {
    targetUrl = `https://www.youtube.com/channel/${channelIdMatch[1]}`;
    fallbackName = channelIdMatch[1];
  } else {
    const handleMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w.-]+)/i);
    const cMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/c\/([\w.-]+)/i);
    const userMatch = input.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/user\/([\w.-]+)/i);
    if (handleMatch?.[1]) {
      targetUrl = `https://www.youtube.com/@${handleMatch[1]}`;
      fallbackName = '@' + handleMatch[1];
    } else if (cMatch?.[1]) {
      targetUrl = `https://www.youtube.com/c/${cMatch[1]}`;
      fallbackName = cMatch[1];
    } else if (userMatch?.[1]) {
      targetUrl = `https://www.youtube.com/user/${userMatch[1]}`;
      fallbackName = userMatch[1];
    } else if (input.includes('youtube.com')) {
      return null;
    } else {
      const cleaned = input.replace('@', '').trim();
      if (!cleaned) return null;
      targetUrl = `https://www.youtube.com/@${cleaned}`;
      fallbackName = '@' + cleaned;
    }
  }
  if (!targetUrl) return null;
  const htmlProxies = [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];
  for (const getProxyUrl of htmlProxies) {
    try {
      const proxyUrl = getProxyUrl(targetUrl);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      let html = proxyUrl.includes('allorigins') ? (await res.json()).contents || '' : await res.text();
      if (!html) continue;
      let chName = html.match(/<meta property="og:title" content="([^"]+)">/)?.[1]?.trim() ||
        html.match(/<title>([^<]+) - YouTube<\/title>/)?.[1]?.trim() || '';
      chName = chName.replace(' - YouTube', '').trim();
      let channelId = html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] ||
        html.match(/channel\/(UC[\w-]{22})/)?.[1] ||
        html.match(/itemprop="channelId" content="(UC[\w-]{22})"/)?.[1] ||
        html.match(/"browseId":"(UC[\w-]{22})"/)?.[1] || '';
      if (channelId) return { id: channelId, name: chName || fallbackName };
    } catch (e) {
      console.warn('[YouTube Resolver]', e);
    }
  }
  if (targetUrl.includes('/channel/UC')) {
    const m = targetUrl.match(/channel\/(UC[\w-]{22})/);
    if (m?.[1]) return { id: m[1], name: fallbackName || m[1] };
  }
  return null;
}

async function addChannel() {
  const input = document.getElementById('ch-input').value.trim();
  const statusEl = document.getElementById('add-status');
  if (!input) { statusEl.textContent = '\ucc44\ub110\uba85\uc744 \uc785\ub825\ud558\uc138\uc694.'; return; }
  statusEl.style.color = '#888';
  statusEl.textContent = '\ucc44\ub110\uc744 \uac80\uc0c9 \uc911...';
  const result = await resolveChannelId(input);
  if (!result?.id) {
    statusEl.style.color = '#f87171';
    statusEl.textContent = '\ucc44\ub110\uc744 \ucc3e\uc744 \uc218 \uc5c6\uc2b5\ub2c8\ub2e4.';
    return;
  }
  if (allChannels.find(c => c.id === result.id)) {
    statusEl.style.color = '#fbbf24';
    statusEl.textContent = '\uc774\ubbf8 \ucd94\uac00\ub41c \ucc44\ub110\uc785\ub2c8\ub2e4.';
    return;
  }
  statusEl.textContent = '\uc601\uc0c1\uc744 \uac00\uc838\uc624\ub294 \uc911...';
  const newCh = { id: result.id, name: result.name || input, handle: input.startsWith('@') ? input : '@' + (result.name || input), cat: 'custom' };
  allChannels.push(newCh);
  saveChannels();
  const videos = await fetchChannelVideos(result.id, newCh.name, 'custom');
  allVideos = [...videos, ...allVideos];
  statusEl.style.color = '#4ade80';
  statusEl.textContent = `"${newCh.name}" \ucc44\ub110 \ucd94\uac00 \uc644\ub8cc!`;
  document.getElementById('ch-input').value = '';
  renderContent();
  setTimeout(closeAddModal, 1200);
}

function saveChannels() {
  localStorage.setItem('yt_channels_page', JSON.stringify(allChannels.filter(c => c.cat === 'custom')));
}

function loadSavedChannels() {
  try { return JSON.parse(localStorage.getItem('yt_channels_page') || '[]'); } catch { return []; }
}

function openAddModal() { document.getElementById('add-modal')?.classList.add('open'); }
function closeAddModal() { document.getElementById('add-modal')?.classList.remove('open'); }
function openLoginModal() { document.getElementById('login-modal')?.classList.add('open'); }
function closeLoginModal() { document.getElementById('login-modal')?.classList.remove('open'); }

function proceedYouTubeLogin() {
  const targetUrl = 'https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com';
  window.open(targetUrl, '_blank');
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
    btn.setAttribute('aria-label', '\ud504\ub9ac\ubbf8\uc5c4');
    btn.onclick = () => {
      if (confirm('\ub85c\uadf8\uc544\uc6c3(\uc0c1\ud0dc \ucd08\uae30\ud654) \ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?')) {
        localStorage.removeItem('yt_logged_in');
        updateLoginUI();
      }
    };
  } else {
    btn.innerHTML = `<svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    btn.setAttribute('aria-label', '\ub85c\uadf8\uc778');
    btn.onclick = openLoginModal;
  }
}

async function init() {
  document.getElementById('yt-main').innerHTML = '<div class="yt-loading"><div class="yt-spinner"></div><span>\ucc44\ub110 \uc601\uc0c1\uc744 \ubd88\ub7ec\uc624\ub294 \uc911...</span></div>';
  const saved = loadSavedChannels();
  allChannels = [...DEFAULT_CHANNELS, ...saved];
  const results = await Promise.allSettled(allChannels.map(ch => fetchChannelVideos(ch.id, ch.name, ch.cat)));
  allVideos = results.flatMap(r => (r.status === 'fulfilled' ? r.value : []));
  ['news', 'opinion', 'movie', 'entertainment', 'music'].forEach(cat => {
    if (!allVideos.some(v => v.channelCat === cat)) {
      allVideos = [...allVideos, ...FALLBACK_VIDEOS.filter(v => v.channelCat === cat)];
    }
  });
  allVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
  renderContent();
}

window.filterByChannel = function (channelId) {
  const ch = allChannels.find(c => c.id === channelId);
  if (!ch) return;
  renderGrid(allVideos.filter(v => v.channelId === channelId), `"${ch.name}" \ucc44\ub110 \uc601\uc0c1`);
  renderChannelList();
};

window.removeChannel = function (event, channelId) {
  event.stopPropagation();
  if (!confirm('\uc774 \ucc44\ub110\uc744 \uc0ad\uc81c\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c?')) return;
  allChannels = allChannels.filter(c => c.id !== channelId);
  allVideos = allVideos.filter(v => v.channelId !== channelId);
  saveChannels();
  renderContent();
};

window.playVideo = playVideo;
window.closePlayer = closePlayer;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.proceedYouTubeLogin = proceedYouTubeLogin;
window.addChannel = addChannel;
window.doSearch = doSearch;
window.filterCat = filterCat;

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer(); });
document.addEventListener('DOMContentLoaded', updateLoginUI);
init();
