import https from 'https';
import http from 'http';

// 메모리 내 30분 캐시 (단, 서버리스 인스턴스가 활성 상태인 동안만 유지됨)
const rssCache = new Map();
const CACHE_TTL = 30 * 60 * 1000;

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
  const cached = rssCache.get(channelId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return { data: cached.data, fromCache: true };
  }

  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const data = await fetchUrl(rssUrl);
  rssCache.set(channelId, { data, timestamp: Date.now() });

  return { data, fromCache: false };
}

export default async function handler(req, res) {
  // CORS 사전검사 대응
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { channelId } = req.query;

  if (!channelId || !/^UC[\w-]{22}$/.test(channelId)) {
    return res.status(400).json({ error: 'Invalid channelId' });
  }

  try {
    const { data, fromCache } = await getRss(channelId);
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.status(200).send(data);
  } catch (err) {
    console.error(`[Error] ${channelId}:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
