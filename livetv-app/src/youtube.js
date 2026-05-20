// Han's Play - YouTube Page Logic

// Pre-loaded popular Korean channels (Removed default channels to only show custom added channels)
const DEFAULT_CHANNELS = [];

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
        const entries = [...xml.querySelectorAll('entry')].slice(0, 8);
        
        if (entries.length > 0) {
          return entries.map(e => {
            // 다양한 네임스페이스 및 브라우저 파서 대응을 위한 다중 셀렉터 적용
            const videoId = e.querySelector('videoId')?.textContent || 
                            e.getElementsByTagName('yt:videoId')?.[0]?.textContent || 
                            e.querySelector('yt\\:videoId')?.textContent || '';
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
  
  // [1단계] 초고속 YouTube 공식 oEmbed 직접 요청 (무프록시, 100ms 미만)
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/@${handle}&format=json`;
    console.log(`[YouTube Resolver] oEmbed 직접 연결 시도: ${oembedUrl}`);
    const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      const authorUrl = json.author_url || "";
      const match = authorUrl.match(/channel\/(UC[\w-]{22})/);
      if (match?.[1]) {
        console.log(`[YouTube Resolver] oEmbed 직접 연결 대성공: ${match[1]}`);
        return match[1];
      }
    }
  } catch (e) {
    console.warn(`[YouTube Resolver] oEmbed 직접 연결 실패 (프록시 단계 전환):`, e);
  }

  // [2단계] 초경량 oEmbed JSON을 CORS 프록시로 우회 요청 (약 300~500ms)
  const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/@${handle}&format=json`;
  const fastProxies = [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of fastProxies) {
    try {
      const proxyUrl = getProxyUrl(oembedUrl);
      console.log(`[YouTube Resolver] oEmbed 프록시 시도: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
      let contents = "";
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        contents = data.contents || "";
      } else {
        contents = await res.text();
      }

      if (contents) {
        const json = typeof contents === 'string' ? JSON.parse(contents) : contents;
        const authorUrl = json.author_url || "";
        const match = authorUrl.match(/channel\/(UC[\w-]{22})/);
        if (match?.[1]) {
          console.log(`[YouTube Resolver] oEmbed 프록시 성공: ${match[1]}`);
          return match[1];
        }
      }
    } catch (e) {
      console.warn(`[YouTube Resolver] oEmbed 프록시 실패:`, e);
    }
  }

  // [3단계] 최후의 보루 - 채널 전체 HTML 획득 분석 (속도순 프록시 정렬: corsproxy.io 최우선)
  const htmlProxies = [
    u => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    u => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
    u => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`
  ];

  for (const getProxyUrl of htmlProxies) {
    try {
      const proxyUrl = getProxyUrl(url);
      console.log(`[YouTube Resolver] HTML 프록시 분석 시도: ${proxyUrl}`);
      const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(6000) });
      let html = "";
      
      if (proxyUrl.includes('allorigins')) {
        const data = await res.json();
        html = data.contents || "";
      } else {
        html = await res.text();
      }

      if (html) {
        let match = html.match(/"channelId":"(UC[\w-]{22})"/);
        if (match?.[1]) return match[1];

        match = html.match(/channel\/(UC[\w-]{22})/);
        if (match?.[1]) return match[1];

        match = html.match(/itemprop="channelId" content="(UC[\w-]{22})"/);
        if (match?.[1]) return match[1];
      }
    } catch (e) {
      console.warn(`[YouTube Resolver] HTML 프록시 실패:`, e);
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
  
  // 내가 추가한 채널(custom)은 최근 한 달 이내 컨텐츠만 노출
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  allVideos = allVideos.filter(v => {
    if (v.channelCat === 'custom') {
      return new Date(v.published) >= oneMonthAgo;
    }
    return true;
  });

  allVideos.sort((a, b) => new Date(b.published) - new Date(a.published));
  renderContent();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer(); });
init();
