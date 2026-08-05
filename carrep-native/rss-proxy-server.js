/**
 * PlayTime YouTube RSS Proxy Server
 * - YouTube RSS 피드를 서버 측에서 가져와 CORS 문제 해결
 * - 30분 메모리 캐시로 Rate Limit 방지
 * - 브라우저에서 /api/rss?channelId=UC... 로 호출
 */

import http from 'http';
import https from 'https';
import url from 'url';

const PORT = 5174;
const CACHE_TTL = 30 * 60 * 1000; // 30분

// 채널별 캐시 저장소
const rssCache = new Map(); // channelId -> { data, timestamp }

// YouTube 라이브 비디오 ID 캐시 저장소 (CORS 없는 서버 측에서 실시간 비디오 ID를 스크래핑해 반환)
const ytLiveCache = new Map(); // handle -> { videoId, timestamp }
const YT_LIVE_CACHE_TTL = 10 * 60 * 1000; // 10분 캐시

async function getYoutubeLiveVideoId(handle) {
  const cached = ytLiveCache.get(handle);
  if (cached && Date.now() - cached.timestamp < YT_LIVE_CACHE_TTL) {
    console.log(`[YT Live Cache HIT] ${handle} -> ${cached.videoId}`);
    return cached.videoId;
  }

  const url = `https://www.youtube.com/@${handle}/live`;
  console.log(`[YT Live Fetch] ${handle} → ${url}`);
  
  const html = await fetchUrl(url);
  
  let videoId = null;
  if (html) {
    let match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    if (match?.[1]) videoId = match[1];
    
    if (!videoId) {
      match = html.match(/embed\/([a-zA-Z0-9_-]{11})/);
      if (match?.[1]) videoId = match[1];
    }
    
    if (!videoId) {
      match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match?.[1]) videoId = match[1];
    }
  }

  if (!videoId) {
    throw new Error('Could not find live video ID in page source');
  }

  ytLiveCache.set(handle, { videoId, timestamp: Date.now() });
  console.log(`[YT Live Cache SET] ${handle} -> ${videoId}`);
  return videoId;
}

function fetchUrl(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
      },
      timeout: 8000,
    }, (res) => {
      // 리다이렉트 처리
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        if (loc) return resolve(fetchUrl(loc, redirectCount + 1));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function getRss(channelId) {
  // 캐시 확인
  const cached = rssCache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache HIT] ${channelId}`);
    return { data: cached.data, fromCache: true };
  }

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log(`[Fetch] ${channelId} → ${rssUrl}`);

  const data = await fetchUrl(rssUrl);

  // 캐시 저장
  rssCache.set(channelId, { data, timestamp: Date.now() });
  console.log(`[Cache SET] ${channelId}`);

  return { data, fromCache: false };
}

const server = http.createServer(async (req, res) => {
  // CORS 허용 헤더
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsed = url.parse(req.url, true);

  // Health check
  if (parsed.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, cached: rssCache.size }));
    return;
  }

  // RSS API: GET /api/rss?channelId=UCxxxx
  if (parsed.pathname === '/api/rss') {
    const channelId = parsed.query.channelId;
    if (!channelId || !/^UC[\w-]{22}$/.test(channelId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid channelId' }));
      return;
    }

    try {
      const { data, fromCache } = await getRss(channelId);
      res.writeHead(200, {
        'Content-Type': 'application/xml; charset=utf-8',
        'X-Cache': fromCache ? 'HIT' : 'MISS',
        'Cache-Control': 'public, max-age=1800',
      });
      res.end(data);
    } catch (err) {
      console.error(`[Error] ${channelId}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Batch API: GET /api/rss/batch?ids=UC1,UC2,UC3 (최대 5개)
  if (parsed.pathname === '/api/rss/batch') {
    const ids = (parsed.query.ids || '').split(',').slice(0, 5).filter(id => /^UC[\w-]{22}$/.test(id));
    if (!ids.length) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'No valid channelIds' }));
      return;
    }

    const results = {};
    await Promise.allSettled(ids.map(async (id) => {
      try {
        const { data } = await getRss(id);
        results[id] = { ok: true, xml: data };
      } catch (e) {
        results[id] = { ok: false, error: e.message };
      }
    }));

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(results));
    return;
  }

  // YouTube Live API: GET /api/youtube/live?handle=handleName
  if (parsed.pathname === '/api/youtube/live') {
    const handle = parsed.query.handle;
    if (!handle || !/^@?[\w\.-]+$/.test(handle)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid handle' }));
      return;
    }

    try {
      const cleanHandle = handle.replace('@', '');
      const videoId = await getYoutubeLiveVideoId(cleanHandle);
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'public, max-age=600',
      });
      res.end(JSON.stringify({ ok: true, videoId }));
    } catch (err) {
      console.error(`[YT Live Error] ${handle}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`\n🚀 PlayTime RSS Proxy Server running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/rss?channelId=UCxxxxxx`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});
