// api/youtube/music.js
// Vercel Serverless Function: CORS 우회를 위해 백엔드 서버 단에서 고성능 병렬 음악 검색 지원

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

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const decodedQuery = decodeURIComponent(q);
  console.log(`[Vercel Music API] Searching for: ${decodedQuery}`);

  // 1. Invidious 인스턴스에서 동적 인스턴스 긁어오기 시도
  let instances = [...INVIDIOUS_INSTANCES];
  try {
    const instRes = await fetch('https://api.invidious.io/instances.json', { signal: AbortSignal.timeout(2000) });
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
    console.warn('[Vercel Music API] Failed to fetch dynamic instances, using default list.');
  }

  const targetInstances = instances.slice(0, 8);

  // 2. 인스턴스 병렬 쾌속 레이싱 생성
  const promises = targetInstances.map(async (instance) => {
    const searchUrl = `${instance}/api/v1/search?q=${encodeURIComponent(decodedQuery)}+official+audio&type=video`;
    const response = await fetch(searchUrl, { signal: AbortSignal.timeout(2500) });
    if (!response.ok) throw new Error(`Status ${response.status}`);
    
    const json = await response.json();
    if (Array.isArray(json) && json.length > 0) {
      const songs = json.map(item => {
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
          artist: item.author || 'Unknown',
          duration: durationStr,
          thumb: `https://i.ytimg.com/vi/${videoId}/default.jpg`
        };
      }).filter(Boolean);
      
      if (songs.length > 0) {
        return songs;
      }
    }
    throw new Error('No songs in JSON');
  });

  try {
    const songs = await new Promise((resolve, reject) => {
      let resolved = false;
      let failedCount = 0;

      promises.forEach(p => {
        p.then(val => {
          if (!resolved) {
            resolved = true;
            resolve(val);
          }
        }).catch(() => {
          failedCount++;
          if (failedCount === promises.length && !resolved) {
            resolved = true;
            reject(new Error('All instances failed'));
          }
        });
      });

      // 강제 타임아웃 세이프가드
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject(new Error('Timeout racing'));
        }
      }, 3000);
    });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=600');
    return res.status(200).json({ ok: true, songs });
  } catch (err) {
    console.error('[Vercel Music API] All searches failed:', err.message);
    return res.status(502).json({ ok: false, error: 'Failed to retrieve music results' });
  }
}
