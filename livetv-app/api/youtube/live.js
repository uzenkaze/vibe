import https from 'https';
import http from 'http';

const ytLiveCache = new Map();
const YT_LIVE_CACHE_TTL = 10 * 60 * 1000; // 10분 캐시

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

async function getYoutubeLiveVideoId(handle) {
  const cached = ytLiveCache.get(handle);
  if (cached && Date.now() - cached.timestamp < YT_LIVE_CACHE_TTL) {
    return cached.videoId;
  }

  const url = `https://www.youtube.com/@${handle}/live`;
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
  return videoId;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { handle } = req.query;

  if (!handle || !/^@?[\w\.-]+$/.test(handle)) {
    return res.status(400).json({ error: 'Invalid handle' });
  }

  try {
    const cleanHandle = handle.replace('@', '');
    const videoId = await getYoutubeLiveVideoId(cleanHandle);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ ok: true, videoId });
  } catch (err) {
    console.error(`[YT Live Error] ${handle}:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
