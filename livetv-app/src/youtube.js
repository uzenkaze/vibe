// PlayTime - YouTube Page Logic (v4 - Keyword Search)

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

// ── 카테고리별 채널 목록 ───────────────────────────────────────────────────
const DEFAULT_CHANNELS = [
  // 뉴스
  { id: 'UCsU-I-vHLiaMfV_ceaYz5rQ', name: 'JTBC 뉴스', cat: 'news' },
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN', cat: 'news' },
  { id: 'UC83AqmaH33x59139C7C5CXA', name: 'SBS 뉴스', cat: 'news' },
  { id: 'UCi5Z9HKuiEHHFClY8XZKQKg', name: 'MBC 뉴스', cat: 'news' },
  { id: 'UCsW2CSEICjFKFKBxBi1TVOQ', name: 'KBS 뉴스', cat: 'news' },
  { id: 'UCl-9BzBJWuIJfNqEt93QaCg', name: '채널A 뉴스', cat: 'news' },
  { id: 'UCjnJk72zk6MmMWwEWDNJGcQ', name: 'TV조선', cat: 'news' },
  { id: 'UCU4HdJNI5Q9vkErE6Ri9hYw', name: 'MBN 뉴스', cat: 'news' },
  // 시사
  { id: 'UCsJ6RuBi65JHJkZYO1MECIA', name: '슈카월드', cat: 'opinion' },
  { id: 'UCO850F-GqB3hSpR3M7z182A', name: '삼프로TV', cat: 'opinion' },
  { id: 'UCkWiTa4Aas_sFGRe9kExU0A', name: 'KBS 시사기획창', cat: 'opinion' },
  { id: 'UClCRJiWJWtGUt_MMTHoWJaw', name: '사피엔스스튜디오', cat: 'opinion' },
  { id: 'UCOuTh3vT1wEpV5pPIFwxriw', name: '체인지그라운드', cat: 'opinion' },
  // 영화
  { id: 'UC3K0_A1vpyN8SLeJ_0S5yfg', name: '지무비', cat: 'movie' },
  { id: 'UCaHGGHs_R54KGDpy7IdFmew', name: '고몽', cat: 'movie' },
  { id: 'UCQ27n_iHn0D2c5kH5vms_qA', name: '비밀', cat: 'movie' },
  { id: 'UCajR8oiGnwh1ggHAuYgQ75Q', name: '씨네리와인드', cat: 'movie' },
  { id: 'UCp9vy5JK2nzs5AFWgMV1Jzw', name: '와썹맨', cat: 'movie' },
  // 오락/예능
  { id: 'UCja972fEZg2w3RLs20wS58A', name: 'MBC 예능', cat: 'entertainment' },
  { id: 'UCRSFXXw8xaS1YVHf28mKMWg', name: 'SBS 예능', cat: 'entertainment' },
  { id: 'UCBPBM6H7Iu9nYE17wqFoFWw', name: 'KBS 예능', cat: 'entertainment' },
  { id: 'UCsw9H2x4ZfnbK7L1D61f0LQ', name: '워크맨', cat: 'entertainment' },
  { id: 'UCg__zD5FrXzTch_5T-j8LpA', name: '식사하셨어요', cat: 'entertainment' },
  { id: 'UCjGzKC-9JxIBdR4OFkzHQdA', name: '피식대학', cat: 'entertainment' },
  { id: 'UC_zBdZ0_H_jn7WGGM6-7b0Q', name: '놀면뭐하니', cat: 'entertainment' },
  // 음악
  { id: 'UC51C_fIOXpxGZk6L34sJb8g', name: '딩고 뮤직', cat: 'music' },
  { id: 'UC3IZKseVpdzPSBaWxBxundA', name: 'Stone Music', cat: 'music' },
  { id: 'UCpGDZUXVpP9vsp6gP21Fk-w', name: 'KBS Kpop', cat: 'music' },
  { id: 'UCvAckOthxV8TRBsb5bGJHfQ', name: 'M2', cat: 'music' },
  { id: 'UCNPNLV-MFAlzHvA2hMU5b8g', name: '1theK', cat: 'music' },
  { id: 'UCaWT7FJKbcsMJBqUicb5v_w', name: 'HYBE LABELS', cat: 'music' },
  { id: 'UCTOe4j3r2JX1dE2sSzTvGJA', name: 'SMTOWN', cat: 'music' },
  { id: 'UCQhSqy2fVQMhXJv1oMLKlXA', name: 'JYP Entertainment', cat: 'music' },
  // 교양
  { id: 'UC-mOecNEMHGAE-3U1TzQpEQ', name: 'EBS 교양', cat: 'documentary' },
  { id: 'UCW_oMms-7eJ_zW7VjBte9bA', name: 'KBS 교양', cat: 'documentary' },
  { id: 'UCbYmH6LdD4L-sBqMhC40B8Q', name: '지식채널e', cat: 'documentary' },
  { id: 'UC7Fv2yCQrBUvCXBCaRV12Iw', name: '사물궁이', cat: 'documentary' },
];

const CAT_MAP = {
  all: '전체',
  recent: '최근 재생',
  custom: '내 채널',
  news: '뉴스',
  opinion: '시사',
  movie: '영화',
  documentary: '교양',
  entertainment: '오락/예능',
  music: '음악',
};

// ── 상태 ─────────────────────────────────────────────────────────────────
let loadedVideos   = [];
let renderedCount  = 0;
const PAGE_SIZE    = 12;
let currentFilter  = 'all';
let isFetchingMore = false;
let scrollObserver = null;
let playerHistoryPushed = false;
let seenVideoIds   = new Set();

const searchState = {};
const channelQueue = {};

// 차단된 채널 가져오기
function getIgnoredChannels() {
  try {
    const raw = localStorage.getItem('ignored_yt_channels');
    return raw ? JSON.parse(raw) : [];
  } catch(e) { return []; }
}

// 채널 차단 (관심없음 -> 삭제처리)
window.ignoreChannel = function(channelId, channelName, event) {
  if (event) event.stopPropagation();
  if (!channelId) return;
  if (!confirm(`유튜브 목록에서 "${channelName || '해당'}" 채널을 삭제하시겠습니까?\n(삭제 후에는 조회 대상에서 영구적으로 제외됩니다)`)) return;
  
  const list = getIgnoredChannels();
  if (!list.includes(channelId)) {
    list.push(channelId);
    localStorage.setItem('ignored_yt_channels', JSON.stringify(list));
  }
  
  // 현재 화면에서 해당 채널 카드 삭제
  document.querySelectorAll('.yt-card').forEach(card => {
    if (card.dataset.channelId === channelId) {
      card.remove();
    }
  });
  
  // loadedVideos 배열에서도 제거
  loadedVideos = loadedVideos.filter(v => v.channelId !== channelId);
  
  alert(`"${channelName || '해당'}" 채널이 삭제되었으며, 앞으로 조회 대상에서 완전히 제외됩니다.`);
};

// Invidious 공개 인스턴스 목록 (우수 업타임 인스턴스 보강)
const INVIDIOUS_INSTANCES = [
  'https://inv.tux.pizza',
  'https://invidious.fdn.fr',
  'https://vid.puffyan.us',
  'https://invidious.projectsegfau.lt',
  'https://invidious.lunar.icu'
];

// ── 유튜브 직접 검색 API 파서 (Invidious 차단 우회 및 한글 완벽 대응) ───
async function searchInvidious(query, page = 1) {
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  const pathUrl = `/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%253D%253D`;
  
  let html = '';
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.() || 
                      (window.location.hostname === 'localhost' && window.location.port === '') || 
                      window.location.protocol === 'capacitor:';
  const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !isCapacitor;

  // 1. Try direct fetch first
  try {
    if (isCapacitor) {
      const res = await smartFetch(targetUrl);
      if (res.ok) html = await res.text();
    } else if (isLocal) {
      const res = await smartFetch('/yt-proxy' + pathUrl);
      if (res.ok) html = await res.text();
    }
  } catch (e) {
    console.error('[YouTube Search] Direct local fetch failed:', e);
  }

  // Helper to parse search results safely
  function parseSearchResults(htmlContent) {
    if (!htmlContent || !htmlContent.includes('ytInitialData')) return null;
    try {
      const prefix = 'var ytInitialData = ';
      const si = htmlContent.indexOf(prefix);
      if (si === -1) return null;
      const ei = htmlContent.indexOf(';</script>', si);
      if (ei === -1) return null;
      const jsonStr = htmlContent.substring(si + prefix.length, ei);
      
      let data;
      try { data = JSON.parse(jsonStr); }
      catch { data = new Function('return ' + jsonStr)(); }

      const contents = data?.contents
        ?.twoColumnSearchResultsRenderer
        ?.primaryContents
        ?.sectionListRenderer
        ?.contents?.[0]
        ?.itemSectionRenderer
        ?.contents;

      if (!contents || !Array.isArray(contents)) return null;

      const videos = [];
      for (const item of contents) {
        if (!item.videoRenderer) continue;
        const v = item.videoRenderer;
        
        let lengthSec = 0;
        const durationText = v.lengthText?.simpleText || '';
        if (durationText) {
          const parts = durationText.split(':').map(Number);
          if (parts.length === 2) lengthSec = parts[0] * 60 + parts[1];
          else if (parts.length === 3) lengthSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }

        let views = 0;
        const viewsText = v.viewCountText?.simpleText || '';
        if (viewsText) {
          const matched = viewsText.match(/[\d.]+/);
          if (matched) views = parseFloat(matched[0]);
        }

        let channelId = v.ownerText?.runs?.[0]?.navigationApi?.browseEndpoint?.browseId || '';
        let channelAvatar = v.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails?.[0]?.url || '';
        if (channelAvatar && channelAvatar.startsWith('//')) channelAvatar = 'https:' + channelAvatar;
        if (!channelAvatar && channelId && channelId.startsWith('UC')) channelAvatar = 'https://unavatar.io/youtube/' + channelId;

        videos.push({
          videoId: v.videoId,
          title: v.title?.runs?.[0]?.text || '(제목 없음)',
          channelId: v.ownerText?.runs?.[0]?.navigationApi?.browseEndpoint?.browseId || '',
          channelName: v.ownerText?.runs?.[0]?.text || 'Unknown',
          channelAvatar: channelAvatar,
          channelCat: 'search',
          searchQuery: query, // 검색 원본 키워드 기록
          published: '',
          timeAgo: v.publishedTimeText?.simpleText || '',
          views: views,
          lengthSec: lengthSec
        });
      }
      // 필터링 적용 (관심없음 채널 제외 및 채널당 최대 2개)
      const ignored = getIgnoredChannels();
      const channelCounts = {};
      return videos.filter(v => {
        if (ignored.includes(v.channelId)) return false;
        channelCounts[v.channelId] = (channelCounts[v.channelId] || 0) + 1;
        return channelCounts[v.channelId] <= 2;
      });
    } catch (e) {
      console.warn('[YouTube Search] Parsing failed within helper:', e);
      return null;
    }
  }

  // 2. Validate direct fetch results
  let results = parseSearchResults(html);
  if (results && results.length > 0) {
    return results;
  }

  // 3. Fallback to proxies if direct fetch failed or returned consent/bot-blocked HTML
  console.log('[YouTube Search] Direct fetch failed or returned invalid results. Trying proxies...');
  const proxies = makeProxies(targetUrl);
  for (const proxy of proxies) {
    try {
      const res = await smartFetch(proxy, { timeout: 4000 });
      if (!res.ok) continue;
      const proxyHtml = proxy.includes('allorigins')
        ? ((await res.json()).contents || '')
        : await res.text();
        
      results = parseSearchResults(proxyHtml);
      if (results && results.length > 0) {
        console.log(`[YouTube Search] Successfully retrieved search results using proxy: ${proxy.split('?')[0]}`);
        return results;
      }
    } catch (_) {}
  }

  console.error('[YouTube Search] All proxies and direct fetch failed to return valid search results');
  return [];
}

function invidiousToVideo(item) {
  if (item.type !== 'video' && item.type !== undefined && item.type !== 'shortVideo') return null;
  const videoId = item.videoId;
  if (!videoId) return null;
  // 썸네일: Invidious가 제공하는 것 or ytimg 직접
  const published = item.published
    ? new Date(item.published * 1000).toISOString()
    : '';
  let channelId = item.authorId || '';
  let channelAvatar = '';
  if (item.authorThumbnails && item.authorThumbnails.length > 0) {
    channelAvatar = item.authorThumbnails[0].url || '';
    if (channelAvatar && channelAvatar.startsWith('//')) channelAvatar = 'https:' + channelAvatar;
  }
  if (!channelAvatar && channelId && channelId.startsWith('UC')) channelAvatar = 'https://unavatar.io/youtube/' + channelId;
  return {
    videoId,
    title:       item.title || '(제목 없음)',
    channelId:   item.authorId || '',
    channelName: item.author  || '',
    channelAvatar: channelAvatar,
    channelCat:  currentFilter,
    published,
    timeAgo:     relativeTime(published),
    views:       item.viewCount || 0,
    lengthSec:   item.lengthSeconds || 0,
  };
}

// ── 내 채널 (RSS) ─────────────────────────────────────────────────────────
// 캐시 유효 기간 설정
const FRESH_CACHE_TTL = 15 * 60 * 1000;     // 15분 (이 안에는 완전히 캐시로만 서비스)
const STALE_CACHE_TTL = 6 * 60 * 60 * 1000; // 6시간 (캐시 데이터를 화면에 일단 보여주고, 백그라운드 갱신)

const rssCache = new Map(); // 메모리 세션 캐시

// CORS 프록시 목록 (우수 업타임 및 응답 속도순 정렬)
const RSS_CORS_PROXIES = [
  { name: 'corsproxy', getUrl: (url) => `https://corsproxy.io/?${encodeURIComponent(url)}` },
  { name: 'codetabs', getUrl: (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}` },
  { name: 'allorigins', getUrl: (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}` }
];
let workingProxyIdx = 0; // 최근 성공한 프록시 인덱스 저장 (속도 극대화)

function getRssCache(chId) {
  // 1. 메모리 캐시 확인 (현재 페이지 생명주기 동안 메모리 접근)
  if (rssCache.has(chId)) {
    return rssCache.get(chId);
  }
  
  // 2. 로컬 스토리지 캐시 확인
  try {
    const raw = localStorage.getItem(`yt_rss_cache_${chId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.videos)) {
        const age = Date.now() - (parsed.timestamp || 0);
        return { videos: parsed.videos, age };
      }
    }
  } catch (e) {
    console.error('[RSS Cache] Error reading cache:', e);
  }
  return null;
}

function setRssCache(chId, videos) {
  // 메모리 캐시 저장
  rssCache.set(chId, videos);
  
  // 로컬 스토리지 캐시 저장
  try {
    localStorage.setItem(`yt_rss_cache_${chId}`, JSON.stringify({
      videos,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('[RSS Cache] Error writing cache:', e);
  }
}

function makeProxies(url) {
  const list = [];
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.() || 
                      (window.location.hostname === 'localhost' && window.location.port === '') || 
                      window.location.protocol === 'capacitor:';
  const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !isCapacitor;

  if (isCapacitor) {
    list.push(url);
  } else if (isLocal) {
    if (url.includes('https://www.youtube.com')) {
      list.push(url.replace('https://www.youtube.com', '/yt-proxy'));
    } else {
      list.push(url);
    }
  }

  // CORS 프록시 리스트 추가 (속도 및 신뢰도 우선 정렬)
  list.push(`https://corsproxy.io/?${encodeURIComponent(url)}`);
  list.push(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`);
  list.push(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);

  return list;
}

async function fetchOneProxy(proxyUrl) {
  const res = await smartFetch(proxyUrl, { timeout: 3000 });
  if (!res.ok) throw new Error('not ok');
  const text = proxyUrl.includes('allorigins')
    ? ((await res.json()).contents || '')
    : await res.text();
  if (!text.includes('<entry>') && !text.includes('&lt;entry&gt;')) throw new Error('no entries');
  return text;
}

function parseRss(text, ch) {
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  const entries = [...(xml.querySelectorAll('entry').length
    ? xml.querySelectorAll('entry')
    : xml.getElementsByTagName('entry'))].slice(0, 10);
  return entries.map(e => {
    const videoId =
      e.querySelector('videoId')?.textContent ||
      e.getElementsByTagName('yt:videoId')?.[0]?.textContent ||
      e.querySelector('yt\\:videoId')?.textContent || '';
    if (!videoId) return null;
    const published = e.querySelector('published')?.textContent || '';
    let views = 0;
    try {
      const stat = e.querySelector('statistics') ||
        e.getElementsByTagName('media:statistics')?.[0] ||
        e.querySelector('media\\:statistics');
      if (stat) views = parseInt(stat.getAttribute('views'), 10) || 0;
    } catch (_) {}
    
    let channelAvatar = (ch.id && ch.id.startsWith('UC')) ? 'https://unavatar.io/youtube/' + ch.id : '';
    return {
      videoId,
      title: e.querySelector('title')?.textContent || '(제목 없음)',
      channelId: ch.id,
      channelName: ch.name,
      channelAvatar: channelAvatar,
      channelCat: 'custom',
      published,
      timeAgo: relativeTime(published),
      views,
    };
  }).filter(Boolean);
}

async function fetchChannelInvidious(ch) {
  const params = new URLSearchParams({ sort_by: 'newest' });
  const instance = INVIDIOUS_INSTANCES[0]; // 탑 1순위 우수 인스턴스 단일 검사로 극강의 속도 확보
  const url = `${instance}/api/v1/channels/${ch.id}/videos?${params}`;
  const tryUrls = [url, `https://corsproxy.io/?${encodeURIComponent(url)}`];
  
  for (const fetchUrl of tryUrls) {
    try {
      const res = await smartFetch(fetchUrl, { timeout: 3000 });
      if (!res.ok) continue;
      const data = await res.json();
      
      let videos = [];
      if (Array.isArray(data)) {
        videos = data;
      } else if (data && Array.isArray(data.videos)) {
        videos = data.videos;
      }
      
      if (videos.length > 0) {
        return videos.map(item => {
          const videoId = item.videoId;
          if (!videoId) return null;
          let published = '';
          if (item.published) {
            try {
              if (typeof item.published === 'number') {
                published = new Date(item.published * 1000).toISOString();
              } else {
                published = new Date(item.published).toISOString();
              }
            } catch (_) {}
          }
          return {
            videoId,
            title: item.title || '(제목 없음)',
            channelId: ch.id,
            channelName: ch.name,
            channelCat: 'custom',
            published,
            timeAgo: relativeTime(published) || item.publishedText || '',
            views: item.viewCount || 0,
            lengthSec: item.lengthSeconds || 0,
          };
        }).filter(Boolean);
      }
    } catch (_) {}
  }
  return [];
}

async function fetchChannelBySearch(ch) {
  try {
    console.log(`[YouTube Scraper] Fetching videos for channel: ${ch.name} via direct search`);
    const searchResults = await searchInvidious(ch.name);
    if (!searchResults || searchResults.length === 0) return [];

    // Filter search results to keep only videos from the target channel if possible
    const filtered = searchResults.filter(v => 
      v.channelId === ch.id || 
      v.channelName.toLowerCase().includes(ch.name.toLowerCase()) ||
      ch.name.toLowerCase().includes(v.channelName.toLowerCase())
    );

    // Fallback: if no matching videos found, use the unfiltered search results
    const finalVideos = filtered.length > 0 ? filtered : searchResults;

    return finalVideos.map(v => ({
      videoId: v.videoId,
      title: v.title,
      channelId: ch.id,
      channelName: ch.name,
      channelCat: ch.cat || 'search',
      published: v.published || new Date().toISOString(),
      timeAgo: v.timeAgo || '',
      views: v.views || 0,
      lengthSec: v.lengthSec || 0
    }));
  } catch (e) {
    console.error(`[YouTube Scraper] Search fetch failed for ${ch.name}:`, e);
    return [];
  }
}

// 백그라운드 갱신 잠금용 집합 (중복 갱신 방지)
const backgroundSyncingChannels = new Set();

async function fetchChannelRssFromNetwork(ch) {
  if (getIgnoredChannels().includes(ch.id)) return [];

  // 1. Try official YouTube RSS feed first (highly efficient, lightweight, and official)
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`;
  
  const isCapacitor = !!window.Capacitor?.isNativePlatform?.() || 
                      (window.location.hostname === 'localhost' && window.location.port === '') || 
                      window.location.protocol === 'capacitor:';
  const isLocal = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && !isCapacitor;

  // 1.1 Local/Native direct bypass
  if (isCapacitor) {
    try {
      const text = await fetchOneProxy(rssUrl);
      const videos = parseRss(text, ch);
      if (videos && videos.length > 0) return videos;
    } catch (_) {}
  } else if (isLocal) {
    try {
      const localProxyUrl = rssUrl.replace('https://www.youtube.com', '/yt-proxy');
      const text = await fetchOneProxy(localProxyUrl);
      const videos = parseRss(text, ch);
      if (videos && videos.length > 0) return videos;
    } catch (_) {}
  }

  // 1.2 CORS proxies (using workingProxyIdx first)
  const proxyIndices = [workingProxyIdx];
  for (let i = 0; i < RSS_CORS_PROXIES.length; i++) {
    if (i !== workingProxyIdx) proxyIndices.push(i);
  }

  for (const idx of proxyIndices) {
    const proxy = RSS_CORS_PROXIES[idx];
    const proxyUrl = proxy.getUrl(rssUrl);
    try {
      const text = await fetchOneProxy(proxyUrl);
      const videos = parseRss(text, ch);
      if (videos && videos.length > 0) {
        workingProxyIdx = idx; // Pin the successful proxy
        return videos;
      }
    } catch (_) {}
  }

  // 2. Fallback to direct search-based scraper if RSS fails (e.g. if channel ID is not UC-based)
  const searchVideos = await fetchChannelBySearch(ch);
  if (searchVideos && searchVideos.length > 0) return searchVideos;

  // 3. Fallback to Invidious API if all RSS proxies and searches fail
  console.log(`[YouTube RSS] falling back to Invidious API for channel: ${ch.name}`);
  const invidiousVideos = await fetchChannelInvidious(ch);
  if (invidiousVideos && invidiousVideos.length > 0) return invidiousVideos;

  return [];
}

async function fetchChannelRss(ch) {
  if (getIgnoredChannels().includes(ch.id)) return [];

  // 캐시 상태 점검
  const cachedData = getRssCache(ch.id);

  if (cachedData) {
    // 메모리 캐시인 경우 age가 없으므로 즉시 반환
    if (typeof cachedData.age === 'undefined') {
      return cachedData;
    }

    const { videos, age } = cachedData;

    // 신선한 캐시인 경우 (15분 이내) 바로 반환
    if (age < FRESH_CACHE_TTL) {
      rssCache.set(ch.id, videos);
      return videos;
    }

    // Stale 캐시인 경우 (15분 ~ 6시간) 캐시 반환 후 백그라운드 갱신
    if (age < STALE_CACHE_TTL) {
      if (!backgroundSyncingChannels.has(ch.id)) {
        backgroundSyncingChannels.add(ch.id);
        
        setTimeout(() => {
          fetchChannelRssFromNetwork(ch)
            .then(freshVideos => {
              if (freshVideos && freshVideos.length > 0) {
                const limited = freshVideos.slice(0, 2);
                setRssCache(ch.id, limited);
              }
            })
            .catch(err => {
              console.warn(`[RSS Cache Sync] Background refresh failed for ${ch.name}:`, err);
            })
            .finally(() => {
              backgroundSyncingChannels.delete(ch.id);
            });
        }, 200);
      }
      
      rssCache.set(ch.id, videos);
      return videos;
    }
  }

  // 캐시가 없거나 6시간 초과된 경우: 포그라운드 네트워크 패치 진행
  try {
    const freshVideos = await fetchChannelRssFromNetwork(ch);
    if (freshVideos && freshVideos.length > 0) {
      const limited = freshVideos.slice(0, 2);
      setRssCache(ch.id, limited);
      return limited;
    }
  } catch (err) {
    console.error(`[RSS Fetch Error] Foreground fetch failed for ${ch.name}:`, err);
  }

  // 네트워크 실패 시 기 보유중인 캐시가 있으면 반환
  if (cachedData && cachedData.videos) {
    return cachedData.videos;
  }

  return [];
}

// ── 도우미 ────────────────────────────────────────────────────────────────
function relativeTime(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso)) / 1000;
  if (s < 60) return '방금 전';
  if (s < 3600) return `${Math.floor(s / 60)}분 전`;
  if (s < 86400) return `${Math.floor(s / 3600)}시간 전`;
  if (s < 2592000) return `${Math.floor(s / 86400)}일 전`;
  return `${Math.floor(s / 2592000)}개월 전`;
}

// 채널별 영상 중복 지배 현상을 막고 다양한 채널의 영상을 골고루 섞어주는(인터리빙) 도우미
function interleaveVideos(videos) {
  if (!videos || videos.length === 0) return [];
  
  // 1. 채널별로 그룹화
  const groups = {};
  videos.forEach(v => {
    const key = v.channelId || v.channelName || 'unknown';
    if (!groups[key]) groups[key] = [];
    groups[key].push(v);
  });
  
  // 2. 각 채널 내부의 비디오는 최신순으로 정렬
  const keys = Object.keys(groups);
  keys.forEach(key => {
    groups[key].sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0));
  });
  
  // 3. 각 채널에서 번갈아가며 비디오를 하나씩 꺼내 교차로(Round-Robin) 결합
  const interleaved = [];
  let maxLen = 0;
  keys.forEach(key => {
    if (groups[key].length > maxLen) maxLen = groups[key].length;
  });
  
  for (let i = 0; i < maxLen; i++) {
    keys.forEach(key => {
      if (groups[key][i]) {
        interleaved.push(groups[key][i]);
      }
    });
  }
  
  return interleaved;
}

// 검색 키워드 기반 추천 시스템 도우미
function trackWatchedKeyword(keyword) {
  if (!keyword) return;
  const query = keyword.trim().toLowerCase();
  if (!query) return;
  try {
    const watched = JSON.parse(localStorage.getItem('yt_watched_keywords') || '{}');
    const existingKey = Object.keys(watched).find(k => k.toLowerCase() === query);
    if (existingKey) {
      watched[existingKey].count += 1;
    } else {
      watched[keyword] = { query: keyword, count: 1 };
    }
    localStorage.setItem('yt_watched_keywords', JSON.stringify(watched));
    console.log(`[YouTube History] Tracked keyword "${keyword}". New state:`, watched);
  } catch (e) {
    console.error('[YouTube History] Failed to track keyword:', e);
  }
}

function getTopWatchedKeywords(limit = 2) {
  try {
    const watched = JSON.parse(localStorage.getItem('yt_watched_keywords') || '{}');
    const items = Object.values(watched)
      .filter(item => item.count >= 2) // 자주 시청한 기준: 클릭수 2회 이상
      .sort((a, b) => b.count - a.count);
    return items.slice(0, limit).map(item => item.query);
  } catch (e) {
    console.error('[YouTube History] Failed to get top keywords:', e);
    return [];
  }
}

// 자주 시청하는 검색 키워드 기반 채널 추적 및 리턴 시스템
function getWatchedSearchChannels() {
  try {
    return JSON.parse(localStorage.getItem('yt_watched_search_channels') || '[]');
  } catch (e) {
    return [];
  }
}

function trackWatchedChannel(channelId, channelName) {
  if (!channelId || !channelName) return;
  try {
    let list = getWatchedSearchChannels();
    // 중복 제거하여 최신 채널을 가장 위로 정렬
    list = list.filter(c => c.id !== channelId);
    list.unshift({ id: channelId, name: channelName, cat: 'watched_search' });
    
    // 최대 5개 채널까지만 보관하여 부하 방지
    if (list.length > 5) list = list.slice(0, 5);
    
    localStorage.setItem('yt_watched_search_channels', JSON.stringify(list));
    console.log(`[YouTube History] Tracked watched search channel "${channelName}" (${channelId})`);
  } catch (e) {
    console.error('[YouTube History] Failed to track watched channel:', e);
  }
}

// 유튜브 시청 히스토리 저장 및 불러오기 시스템 (최대 20개 보관)
function getWatchHistory() {
  try {
    return JSON.parse(localStorage.getItem('yt_watch_history') || '[]');
  } catch (e) {
    return [];
  }
}

function saveToWatchHistory(video) {
  if (!video || !video.videoId) return;
  try {
    let history = getWatchHistory();
    // 중복 제거하여 가장 최신 영상을 최상단으로 정렬
    history = history.filter(v => v.videoId !== video.videoId);
    history.unshift(video);
    
    // 최대 20개까지만 보관
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    
    localStorage.setItem('yt_watch_history', JSON.stringify(history));
    console.log(`[YouTube History] Saved video to watch history: "${video.title}"`);
  } catch (e) {
    console.error('[YouTube History] Failed to save watch history:', e);
  }
}

function fmtViews(n) {
  if (!n) return '';
  if (n >= 1e8) return `${+(n / 1e8).toFixed(1)}억 회`;
  if (n >= 1e4) return `${+(n / 1e4).toFixed(1)}만 회`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(1)}천 회`;
  return `${n}회`;
}

function fmtDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function strColor(s) {
  const p = ['#7c3aed','#1d4ed8','#059669','#b45309','#be185d','#0891b2','#dc2626','#6d28d9','#0f766e'];
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) & 0xffffffff;
  return p[Math.abs(h) % p.length];
}

// ── 카드 생성 ─────────────────────────────────────────────────────────────
function makeCard(v) {
  const card = document.createElement('div');
  card.className = 'yt-card';
  card.dataset.channelId = v.channelId;
  card.onclick = () => playVideo(v.videoId, v.title, v.searchQuery, v.channelId, v.channelName);

  const viewStr  = fmtViews(v.views);
  const durStr   = fmtDuration(v.lengthSec);
  const meta     = [viewStr, v.timeAgo].filter(Boolean).join(' · ');

  const hq = `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
  const mq = `https://i.ytimg.com/vi/${v.videoId}/mqdefault.jpg`;
  const sd = `https://i.ytimg.com/vi/${v.videoId}/sddefault.jpg`;

  const displayName = v.channelName || '?';
  const avatarChar = displayName.startsWith('[★추천]') 
    ? displayName.replace('[★추천]', '').trim().charAt(0) 
    : displayName.charAt(0);

  card.innerHTML = `
    <div class="yt-thumb">
      <div class="yt-thumb-fallback">
        <svg width="28" height="28" fill="none" stroke="#818cf8" stroke-width="2" viewBox="0 0 24 24">
          <polygon points="6 3 20 12 6 21 6 3" fill="rgba(129,140,248,0.15)"/>
        </svg>
        <span>PlayTime</span>
      </div>
      <img class="yt-thumb-img" src="${hq}" alt="" loading="lazy"
        onerror="if(this.src.includes('hqdefault')){this.src='${mq}';}else if(this.src.includes('mqdefault')){this.src='${sd}';}else{this.style.display='none';}">
      ${durStr ? `<div class="yt-duration">${durStr}</div>` : ''}
      <div class="yt-play-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="6 3 20 12 6 21 6 3"/></svg>
      </div>
      ${currentFilter === 'recent' ? `
        <button class="yt-card-delete-btn" title="기록에서 삭제" onclick="event.stopPropagation(); window.removeHistoryVideo('${v.videoId}')" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);border:1.5px solid rgba(255,255,255,0.8);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.5);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      ` : `
        <button class="yt-card-delete-btn" title="채널 삭제" onclick="window.ignoreChannel('${v.channelId}', '${displayName.replace(/'/g, "\\'")}', event)" style="position:absolute;top:10px;right:10px;background:rgba(0,0,0,0.6);border:1.5px solid rgba(255,255,255,0.8);border-radius:50%;width:30px;height:30px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;color:#fff;box-shadow:0 2px 4px rgba(0,0,0,0.5);">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `}
    </div>
    <div class="yt-card-info">
      ${v.channelAvatar 
        ? `<img class="yt-avatar" src="${v.channelAvatar}" style="border-radius:50%;object-fit:cover;background:#333;" onerror="this.outerHTML='<div class=\\'yt-avatar\\' style=\\'background:${strColor(displayName)}\\'>${avatarChar.toUpperCase()}</div>'">`
        : `<div class="yt-avatar" style="background:${strColor(displayName)}">${avatarChar.toUpperCase()}</div>`
      }
      <div class="yt-meta">
        <div class="yt-title">${v.title}</div>
        <div class="yt-ch-name">${displayName}</div>
        <div class="yt-info-row">${meta}</div>
      </div>
    </div>`;
  return card;
}

// ── 그리드 렌더링 ─────────────────────────────────────────────────────────
function appendCards(videos) {
  const grid = document.getElementById('yt-grid-container');
  if (!grid) return;
  videos.forEach(v => grid.appendChild(makeCard(v)));
  renderedCount += videos.length;
}

// ── 다음 배치 로드 (RSS / 검색) ───────────────────────────────────────
async function fetchNextPage(filter) {
  if (filter === 'recent') {
    const history = getWatchHistory();
    if (history.length === 0) {
      const grid = document.getElementById('yt-grid-container');
      if (grid) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #555;">
            <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" style="margin: 0 auto 12px; color: #555;"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            최근 재생한 동영상이 없습니다.
          </div>
        `;
      }
      const sentinel = document.getElementById('scroll-sentinel');
      if (sentinel) sentinel.style.display = 'none';
      return [];
    }
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) sentinel.style.display = 'none';
    return history;
  }

  if (filter === 'custom') {
    const saved = loadSavedChannels();
    if (!saved.length) return [];
    const results = await Promise.allSettled(saved.map(ch => fetchChannelRss(ch)));
    return results.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  }

  if (filter === 'search') {
    const st = searchState['search'];
    const p = st.page++;
    const items = await searchInvidious(st.query, p);
    return items || [];
  }

  // 일반 카테고리 (RSS 채널 피드)
  if (!channelQueue[filter]) {
    let arr = [];
    if (filter === 'all') {
      const defaultList = DEFAULT_CHANNELS.filter(c => c.cat !== 'music' && c.cat !== 'entertainment');
      const watchedChannels = getWatchedSearchChannels();
      // 기본 채널과 유저가 자주 본 검색 기반 채널을 안전하게 병합 (중복 방지)
      const combined = [...defaultList];
      watchedChannels.forEach(wc => {
        if (!combined.find(c => c.id === wc.id)) {
          combined.push(wc);
        }
      });
      arr = combined;
    } else {
      arr = DEFAULT_CHANNELS.filter(c => c.cat === filter);
    }
    // 셔플
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    channelQueue[filter] = arr;
  }

  const q = channelQueue[filter];
  if (!q.length) return [];

  // 한번에 여러 채널을 로딩하여 다양한 채널로 구성 (6개 채널 동시 로드)
  const batch = q.splice(0, 6);
  const rssPromises = batch.map(ch => fetchChannelRss(ch));

  let searchPromises = [];
  let topKeywords = [];
  if (filter === 'all') {
    topKeywords = getTopWatchedKeywords(1); // 추천 키워드를 1개로 축소하여 최초 로딩 속도를 극대화
    searchPromises = topKeywords.map(keyword => searchInvidious(keyword, 1));
  }

  // RSS와 키워드 추천 비디오 검색을 병렬로 동시에 로드
  const results = await Promise.allSettled([
    ...rssPromises,
    ...searchPromises
  ]);
  
  const rssVideos = [];
  const searchResultsList = [];

  results.forEach((r, idx) => {
    if (r.status !== 'fulfilled') return;
    if (idx < rssPromises.length) {
      rssVideos.push(...(r.value || []));
    } else {
      const keywordIdx = idx - rssPromises.length;
      const keyword = topKeywords[keywordIdx];
      searchResultsList.push({ keyword, items: r.value || [] });
    }
  });

  // 특정 대형 방송사/채널이 전체 피드를 독점하지 않도록 채널 교차(Interleave) 정렬하여 다양성 확보
  const interleavedRssVideos = interleaveVideos(rssVideos);

  // 검색한 추천 키워드 비디오를 목록에 자연스럽게 믹스인
  const finalVideos = [...interleavedRssVideos];
  searchResultsList.forEach(rec => {
    const recItems = rec.items.slice(0, 4).map(v => {
      return {
        ...v,
        channelCat: 'all',
        channelName: `[★추천] ${v.channelName}`,
        published: new Date().toISOString()
      };
    });
    recItems.forEach((item, index) => {
      // 4개 피드마다 1개씩 삽입하여 조화롭게 배치
      const insertIdx = Math.min(2 + index * 4, finalVideos.length);
      finalVideos.splice(insertIdx, 0, item);
    });
  });

  return finalVideos;
}

// ── 무한 스크롤 ───────────────────────────────────────────────────────────
async function loadMore() {
  if (isFetchingMore) return;

  // 이미 로드된 것 중 미렌더된 것 먼저 표시
  const unrendered = loadedVideos.slice(renderedCount, renderedCount + PAGE_SIZE);
  if (unrendered.length >= PAGE_SIZE) {
    appendCards(unrendered);
    updateSentinel();
    setTimeout(() => prefetchNext(), 1500); // 남은 버퍼 확인 후 보충 (지연 실행)
    return;
  }

  isFetchingMore = true;
  showSentinel(true);

  const filterBefore = currentFilter;
  const raw = await fetchNextPage(currentFilter);
  
  // 비동기 요청 도중에 카테고리나 검색어가 바뀌었다면 즉시 파기하고 종료
  if (currentFilter !== filterBefore) return;

  const deduped = raw.filter(v => {
    if (seenVideoIds.has(v.videoId)) return false;
    seenVideoIds.add(v.videoId);
    return true;
  });

  loadedVideos.push(...deduped);
  
  // 방금 받아온 것까지 합쳐서 렌더링
  const toRender = loadedVideos.slice(renderedCount, renderedCount + PAGE_SIZE);
  appendCards(toRender);

  isFetchingMore = false;
  updateSentinel();
  setTimeout(() => prefetchNext(), 1500); // 지연 실행
}

let isPrefetching = false;
async function prefetchNext() {
  // 대기 시간 없이 즉시 프리페치 실행
  // 화면에 안 그려진 영상이 2페이지(24개) 미만이면 백그라운드 로드
  if (isPrefetching || (loadedVideos.length - renderedCount) >= PAGE_SIZE * 2) return;
  
  isPrefetching = true;
  const filterBefore = currentFilter;
  try {
    const raw = await fetchNextPage(currentFilter);
    if (currentFilter !== filterBefore) {
      isPrefetching = false;
      return;
    }
    const deduped = raw.filter(v => {
      if (seenVideoIds.has(v.videoId)) return false;
      seenVideoIds.add(v.videoId);
      return true;
    });
    loadedVideos.push(...deduped);
    updateSentinel();
  } catch (e) {}
  isPrefetching = false;
}

// ── 센티넬 ────────────────────────────────────────────────────────────────
function showSentinel(loading) {
  const el = document.getElementById('scroll-sentinel');
  if (!el) return;
  el.style.display = 'flex';
  el.style.opacity = loading ? '1' : '0';
  el.innerHTML = loading
    ? `<div class="yt-spinner" style="width:28px;height:28px;border-width:2px"></div>
       <span style="font-size:13px;color:#888">영상 불러오는 중...</span>`
    : ``;
}

function updateSentinel() {
  const el = document.getElementById('scroll-sentinel');
  if (!el) return;
  const hasMore = currentFilter === 'recent' ? (renderedCount < loadedVideos.length) : true;
  
  if (!hasMore) {
    el.style.display = 'none';
  } else {
    el.style.display = 'flex';
    if (!isFetchingMore) {
      el.style.opacity = '0';
      el.innerHTML = ``;
    }
  }
}

// ── 그리드 초기화 ─────────────────────────────────────────────────────────
function initGrid(title) {
  const main = document.getElementById('yt-main');
  loadedVideos  = [];
  renderedCount = 0;
  isFetchingMore = false; // 진행 중인 이전 Fetch 상태 강제 해제
  isPrefetching = false;  // 진행 중인 프리페치 상태 강제 해제

  main.innerHTML = title ? `<div class="section-title">${title}</div>` : '';

  const grid = document.createElement('div');
  grid.className = 'yt-grid';
  grid.id = 'yt-grid-container';
  main.appendChild(grid);

  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.className = 'yt-loading';
  sentinel.style.cssText = 'display:flex;padding:28px 20px';
  sentinel.innerHTML = `<div class="yt-spinner" style="width:28px;height:28px;border-width:2px"></div>
                         <span style="font-size:13px;color:#888">영상을 불러오는 중...</span>`;
  main.appendChild(sentinel);

  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver(
    entries => { if (entries[0].isIntersecting) loadMore(); },
    { rootMargin: '1200px' }
  );
  scrollObserver.observe(sentinel);
}

// ── 카테고리 전환 ─────────────────────────────────────────────────────────
async function switchCategory(filter, btnEl) {
  currentFilter = filter;
  seenVideoIds.clear();
  isPrefetching = false;

  // 카테고리 전환 시 채널 큐를 초기화하여 항상 첫 번째 채널들부터 빠르게 로드되도록 보장
  delete channelQueue[filter];

  document.querySelectorAll('.yt-cat').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // 검색 상태 초기화 (탭 클릭 시 처음부터)
  searchState[filter] = { keyIdx: 0, page: 1 };

  const title = filter === 'all' ? '' : (CAT_MAP[filter] || '');
  initGrid(title);
  await loadMore();
}

window.filterCat = (cat, btn) => switchCategory(cat, btn);

// ── 검색 ──────────────────────────────────────────────────────────────────
window.handleSearchInput = function () {
  const q = document.getElementById('search-input')?.value || '';
  const btn = document.querySelector('.yt-search-btn');
  if (!btn) return;
  if (q.length > 0) {
    btn.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>`;
    btn.onclick = window.clearSearch;
  } else {
    btn.innerHTML = `<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
    btn.onclick = window.doSearch;
  }
};

window.clearSearch = function () {
  const input = document.getElementById('search-input');
  if (input) input.value = '';
  window.handleSearchInput();
  window.doSearch();
};

window.doSearch = async function () {
  const q = document.getElementById('search-input')?.value?.trim();
  if (!q) { switchCategory('all'); return; }

  currentFilter = 'search';
  seenVideoIds.clear();
  isPrefetching = false;

  document.querySelectorAll('.yt-cat').forEach(b => b.classList.remove('active'));

  searchState['search'] = { query: q, page: 1 };
  
  initGrid(`"${q}" 검색 결과`);
  await loadMore();
};

// ── 플레이어 ──────────────────────────────────────────────────────────────
function playVideo(videoId, title, searchQuery = '', channelId = '', channelName = '') {
  if (searchQuery) {
    trackWatchedKeyword(searchQuery);
  }
  if (channelId && channelName) {
    trackWatchedChannel(channelId, channelName);
  }
  
  // 최근 재생한 동영상 목록에 저장 (최대 20개)
  const existingVideo = loadedVideos.find(v => v.videoId === videoId);
  const fallbackVideo = {
    videoId: videoId,
    title: title,
    channelId: channelId,
    channelName: channelName || 'Unknown',
    timeAgo: '방금 재생',
    views: 0,
    lengthSec: 0
  };
  window.currentlyPlayingVideo = existingVideo || fallbackVideo;
  if (window.watchTimer) clearTimeout(window.watchTimer);
  window.watchTimer = setTimeout(() => {
    if (window.currentlyPlayingVideo && window.currentlyPlayingVideo.videoId === videoId) {
      saveToWatchHistory(window.currentlyPlayingVideo);
    }
  }, 10000);
  const overlay  = document.getElementById('player-overlay');
  const iframe   = document.getElementById('yt-iframe');
  const loading  = document.getElementById('player-loading');
  const titleEl  = document.getElementById('player-title');
  if (titleEl) titleEl.textContent = title;
  if (loading) loading.style.display = 'flex';
  if (iframe) {
    iframe.style.opacity = '0';
    iframe.onload = () => {
      if (loading) loading.style.display = 'none';
      iframe.style.opacity = '1';
    };
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1&fs=0`;
  }
  if (overlay) { 
    overlay.classList.add('open'); 
    document.body.style.overflow = 'hidden'; 
    resetControlsTimer(); // 플레이어가 열릴 때 컨트롤 자동 타이머 기동
  }
  if (!playerHistoryPushed) { history.pushState({ playerOpen: true }, ''); playerHistoryPushed = true; }
}

function closePlayer(avoidPop = false) {
  if (window.watchTimer) { clearTimeout(window.watchTimer); window.watchTimer = null; }
  window.currentlyPlayingVideo = null;
  // 전체화면 모드 해제
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    try {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    } catch (e) {}
  }

  const iframe  = document.getElementById('yt-iframe');
  const loading = document.getElementById('player-loading');
  if (iframe) { iframe.onload = null; iframe.src = 'about:blank'; iframe.style.opacity = '0'; }
  if (loading) loading.style.display = 'flex';
  
  const overlay = document.getElementById('player-overlay');
  if (overlay) {
    overlay.classList.remove('open');
    overlay.classList.remove('hide-controls'); // 컨트롤 숨김 클래스 초기화
  }
  
  document.body.style.overflow = '';
  if (playerHistoryPushed && !avoidPop) history.back();
  playerHistoryPushed = false;
  
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
}

window.addEventListener('popstate', () => {
  if (document.getElementById('player-overlay')?.classList.contains('open')) closePlayer(true);
});

// ── 크게보기 (전체화면) 제어 ───────────────────────────────────────────────────
function toggleFullscreen() {
  const overlay = document.getElementById('player-overlay');
  if (!overlay) return;
  
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    // Enter fullscreen
    if (overlay.requestFullscreen) {
      overlay.requestFullscreen();
    } else if (overlay.webkitRequestFullscreen) {
      overlay.webkitRequestFullscreen();
    } else if (overlay.msRequestFullscreen) {
      overlay.msRequestFullscreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
}

function updateFullscreenUI() {
  const isFS = !!(document.fullscreenElement || document.webkitFullscreenElement);
  const enterIcon = document.getElementById('fs-icon-enter');
  const exitIcon = document.getElementById('fs-icon-exit');
  
  if (enterIcon && exitIcon) {
    if (isFS) {
      enterIcon.style.display = 'none';
      exitIcon.style.display = 'block';
    } else {
      enterIcon.style.display = 'block';
      exitIcon.style.display = 'none';
    }
  }
}

function initFullscreenHandler() {
  document.addEventListener('fullscreenchange', updateFullscreenUI);
  document.addEventListener('webkitfullscreenchange', updateFullscreenUI);
}

window.toggleFullscreen = toggleFullscreen;

// ── 내 채널 추가/삭제 ─────────────────────────────────────────────────────
async function resolveChannelId(input) {
  input = input.trim();
  if (/^UC[\w-]{22}$/.test(input)) return { id: input, name: input };
  let targetUrl = '', fallbackName = '';
  const m1 = input.match(/youtube\.com\/channel\/(UC[\w-]{22})/i);
  const m2 = input.match(/youtube\.com\/@([\w.-]+)/i);
  const m3 = input.match(/youtube\.com\/c\/([\w.-]+)/i);
  const m4 = input.match(/youtube\.com\/user\/([\w.-]+)/i);
  if (m1) { targetUrl = `https://www.youtube.com/channel/${m1[1]}`; fallbackName = m1[1]; }
  else if (m2) { targetUrl = `https://www.youtube.com/@${m2[1]}`; fallbackName = '@' + m2[1]; }
  else if (m3) { targetUrl = `https://www.youtube.com/c/${m3[1]}`; fallbackName = m3[1]; }
  else if (m4) { targetUrl = `https://www.youtube.com/user/${m4[1]}`; fallbackName = m4[1]; }
  else if (input.includes('youtube.com')) return null;
  else { const c = input.replace('@','').trim(); targetUrl = `https://www.youtube.com/@${c}`; fallbackName = '@' + c; }
  if (!targetUrl) return null;
  for (const proxy of makeProxies(targetUrl)) {
    try {
      const res = await smartFetch(proxy, { timeout: 6000 });
      if (!res.ok) continue;
      const html = proxy.includes('allorigins') ? (await res.json()).contents || '' : await res.text();
      if (!html) continue;
      const name = (html.match(/<meta property="og:title" content="([^"]+)">/)?.[1] || '').replace(' - YouTube','').trim();
      const id   = html.match(/"channelId":"(UC[\w-]{22})"/)?.[1] || html.match(/channel\/(UC[\w-]{22})/)?.[1] || '';
      if (id) return { id, name: name || fallbackName };
    } catch (_) {}
  }
  if (targetUrl.includes('/channel/UC')) {
    const m = targetUrl.match(/channel\/(UC[\w-]{22})/);
    if (m) return { id: m[1], name: fallbackName };
  }
  return null;
}

async function addChannel() {
  const input  = document.getElementById('ch-input').value.trim();
  const status = document.getElementById('add-status');
  if (!input) { status.textContent = '채널명을 입력하세요.'; return; }
  status.style.color = '#888'; status.textContent = '채널을 검색 중...';
  const result = await resolveChannelId(input);
  if (!result?.id) { status.style.color = '#f87171'; status.textContent = '채널을 찾을 수 없습니다.'; return; }
  const saved = loadSavedChannels();
  if (saved.find(c => c.id === result.id)) { status.style.color = '#fbbf24'; status.textContent = '이미 추가된 채널입니다.'; return; }
  const newCh = { id: result.id, name: result.name || input, handle: input.startsWith('@') ? input : '@' + (result.name || input) };
  saved.push(newCh);
  saveChannels(saved);
  status.style.color = '#4ade80'; status.textContent = `"${newCh.name}" 채널 추가 완료!`;
  document.getElementById('ch-input').value = '';
  setTimeout(closeAddModal, 1200);
}

function saveChannels(list)  { localStorage.setItem('yt_channels_page', JSON.stringify(list)); }
function loadSavedChannels() { try { return JSON.parse(localStorage.getItem('yt_channels_page') || '[]'); } catch { return []; } }

function openAddModal()   { document.getElementById('add-modal')?.classList.add('open'); }
function closeAddModal()  { document.getElementById('add-modal')?.classList.remove('open'); }
function openLoginModal() { document.getElementById('login-modal')?.classList.add('open'); }
function closeLoginModal(){ document.getElementById('login-modal')?.classList.remove('open'); }

function proceedYouTubeLogin() {
  window.open('https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com', '_blank');
  localStorage.setItem('yt_logged_in', 'true');
  updateLoginUI();
  closeLoginModal();
}

function updateLoginUI() {
  const btn = document.getElementById('login-ui-btn');
  if (!btn) return;
  const loggedIn = localStorage.getItem('yt_logged_in') === 'true';
  btn.innerHTML = loggedIn
    ? `<svg width="20" height="20" fill="none" stroke="#bef264" stroke-width="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
  btn.setAttribute('aria-label', loggedIn ? '프리미엄' : '로그인');
  btn.onclick = loggedIn
    ? () => { if (confirm('로그아웃 하시겠습니까?')) { localStorage.removeItem('yt_logged_in'); updateLoginUI(); } }
    : openLoginModal;
}

// ── 전역 노출 ─────────────────────────────────────────────────────────────
window.playVideo = playVideo;
window.closePlayer = closePlayer;
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.proceedYouTubeLogin = proceedYouTubeLogin;
window.addChannel = addChannel;

// ── 플레이어 자동 조작 컨트롤러 (3초 무반응 시 컨트롤 페이드아웃) ──────────────
let controlsTimeout = null;

function resetControlsTimer() {
  const overlay = document.getElementById('player-overlay');
  if (!overlay) return;
  
  overlay.classList.remove('hide-controls');
  
  if (controlsTimeout) clearTimeout(controlsTimeout);
  
  controlsTimeout = setTimeout(() => {
    if (overlay.classList.contains('open')) {
      overlay.classList.add('hide-controls');
    }
  }, 3000);
}

function initPlayerControls() {
  const overlay = document.getElementById('player-overlay');
  if (!overlay) return;
  
  // 무반응 감지를 위한 모션 및 터치/클릭 감지 등록
  overlay.addEventListener('mousemove', resetControlsTimer);
  overlay.addEventListener('click', resetControlsTimer);
  overlay.addEventListener('touchstart', resetControlsTimer);
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closePlayer(); });
document.addEventListener('DOMContentLoaded', () => {
  updateLoginUI();
  initPlayerControls();
  initFullscreenHandler();
});

// ── 초기화 ────────────────────────────────────────────────────────────────
switchCategory('all', document.querySelector('.yt-cat.active'));


window.removeHistoryVideo = function(videoId) {
  if (!confirm('최근 재생 목록에서 이 영상을 삭제하시겠습니까?')) return;
  try {
    let history = getWatchHistory();
    history = history.filter(v => v.videoId !== videoId);
    localStorage.setItem('yt_watch_history', JSON.stringify(history));
    if (currentFilter === 'recent') {
      const activeBtn = document.querySelector('.yt-cat.active');
      switchCategory('recent', activeBtn);
    }
  } catch (e) {
    console.error(e);
  }
};
