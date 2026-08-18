// api/youtube/search.js
// Vercel Serverless Function: CORS 및 429 차단 우회를 위해 백엔드 서버 단에서 고성능 병렬 유튜브 동영상 검색 지원

const INVIDIOUS_INSTANCES = [
  'https://inv.thepixora.com',
  'https://invidious.fdn.fr',
  'https://vid.puffyan.us',
  'https://invidious.projectsegfau.lt',
  'https://invidious.lunar.icu',
  'https://yewtu.be',
  'https://invidious.nerdvpn.de',
  'https://invidious.no-logs.com'
];

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q, page } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const queryPage = parseInt(page, 10) || 1;
  const decodedQuery = decodeURIComponent(q);

  console.log(`[Vercel YouTube Search API] Searching for: "${decodedQuery}", page: ${queryPage}`);

  let instances = [...INVIDIOUS_INSTANCES];
  try {
    const instRes = await fetch('https://api.invidious.io/instances.json', { signal: AbortSignal.timeout(1800) });
    if (instRes.ok) {
      const data = await instRes.json();
      if (Array.isArray(data)) {
        const active = data
          .filter(item => {
            const inst = item[1];
            const hasCors = inst.cors !== false;
            const hasApi = inst.api !== false;
            const isHttps = inst.type === 'https';
            const isUp = inst.monitor?.last_status === 200 || (inst.monitor?.uptime || 0) > 80;
            return inst && isHttps && hasCors && hasApi && isUp;
          })
          .map(item => `https://${item[0]}`);
        if (active.length > 0) {
          instances = active;
        }
      }
    }
  } catch (e) {
    console.warn('[Vercel YouTube Search API] Failed to fetch dynamic instances, using default list.');
  }

  // 상위 가용한 인스턴스 추출
  const targetInstances = instances.slice(0, 8);
  const promises = targetInstances.map(async (instance) => {
    const searchUrl = `${instance}/api/v1/search?q=${encodeURIComponent(decodedQuery)}&page=${queryPage}&type=video`;
    const response = await fetch(searchUrl, { signal: AbortSignal.timeout(2800) });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const json = await response.json();
    if (Array.isArray(json) && json.length > 0) {
      const videos = json.map(item => {
        if (item.type !== 'video' && item.type !== undefined) return null;
        const videoId = item.videoId;
        if (!videoId) return null;
        let durationStr = '';
        if (item.lengthSeconds) {
          const m = Math.floor(item.lengthSeconds / 60);
          const s = item.lengthSeconds % 60;
          durationStr = `${m}:${String(s).padStart(2, '0')}`;
        }
        return {
          title: item.title || '(제목 없음)',
          videoId: videoId,
          channelName: item.author || 'Unknown',
          channelId: item.authorId || '',
          duration: durationStr,
          publishedText: item.publishedText || '',
          thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
        };
      }).filter(Boolean);
      
      if (videos.length > 0) {
        return videos;
      }
    }
    throw new Error('Empty result');
  });

  try {
    const videos = await new Promise((resolve, reject) => {
      let resolved = false;
      let failedCount = 0;

      promises.forEach(p => {
        p.then(result => {
          if (!resolved) {
            resolved = true;
            resolve(result);
          }
        }).catch(() => {
          failedCount++;
          if (failedCount === promises.length && !resolved) {
            resolved = true;
            reject(new Error('All instances failed'));
          }
        });
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Timeout'));
        }
      }, 3500);
    });

    return res.status(200).json({ ok: true, videos });
  } catch (err) {
    console.error('[Vercel YouTube Search API] Race search failed:', err.message);
    return res.status(502).json({ ok: false, error: err.message });
  }
}
