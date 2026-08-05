import https from 'https';
import http from 'http';

const invidiousInstances = [
  'https://inv.thepixora.com',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be'
];

async function verifyVideoIsLive(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept': 'text/html'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const html = await res.text();
      const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
      return { success: true, isLive };
    }
  } catch (e) {
    console.warn(`Direct verify failed for ${videoId}:`, e.message);
  }
  return { success: false, isLive: false };
}

async function getYoutubeLiveVideoIdFallback(handle, channelId) {
  console.log(`Running fallback for channel: ${channelId} (${handle})`);
  const candidates = new Set();
  
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const rssRes = await fetch(rssUrl, { signal: AbortSignal.timeout(3000) });
    if (rssRes.ok) {
      const xml = await rssRes.text();
      const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
      let m;
      while ((m = regex.exec(xml)) !== null) {
        candidates.add(m[1]);
      }
    }
  } catch (e) {
    console.warn(`RSS fetch failed:`, e.message);
  }
  
  const candList = [...candidates].slice(0, 5);
  console.log(`Candidates:`, candList);
  
  const testCandidate = async (videoId) => {
    // 1. Direct verify (our new optimization)
    try {
      const check = await verifyVideoIsLive(videoId);
      if (check.success && check.isLive) {
        console.log(`Candidate ${videoId} checked via DIRECT: LIVE!`);
        return { videoId, isLive: true };
      }
    } catch(e) {}

    // 2. Invidious fallback
    for (const instance of invidiousInstances) {
      try {
        const detailUrl = `${instance}/api/v1/videos/${videoId}`;
        const res = await fetch(detailUrl, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          if (data.liveNow === true || (data.lengthSeconds === 0 && data.title?.toLowerCase().includes('live'))) {
            console.log(`Candidate ${videoId} checked via Invidious (${instance}): LIVE!`);
            return { videoId, isLive: true };
          }
        }
      } catch (e) {
        // next
      }
    }
    return { videoId, isLive: false };
  };
  
  const results = await Promise.all(candList.map(testCandidate));
  const activeLive = results.find(r => r.isLive);
  if (activeLive) {
    return activeLive.videoId;
  }
  throw new Error('All candidates are offline');
}

async function run() {
  // YTN 사이언스 테스트
  try {
    const videoId = await getYoutubeLiveVideoIdFallback('YTNSC', 'UCZdBJIbJz0P9xyFipgOj1fA');
    console.log(`YTN Science Dynamic Live Video ID: ${videoId}`);
  } catch(e) {
    console.error(`YTN Science Failed:`, e.message);
  }

  // JTBC 테스트
  try {
    const videoId = await getYoutubeLiveVideoIdFallback('jtbc_news', 'UCsU-I-vHLiaMfV_ceaYz5rQ');
    console.log(`JTBC Dynamic Live Video ID: ${videoId}`);
  } catch(e) {
    console.error(`JTBC Failed:`, e.message);
  }
}

run();
