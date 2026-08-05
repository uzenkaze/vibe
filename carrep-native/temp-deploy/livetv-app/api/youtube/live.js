import https from 'https';
import http from 'http';

const ytLiveCache = new Map();
const YT_LIVE_CACHE_TTL = 1 * 60 * 1000; // 1분 캐시

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
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
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

async function getYoutubeLiveVideoIdFallback(handle, channelId) {
  if (!channelId) {
    throw new Error('Fallback requires channelId');
  }
  
  console.log(`[YT Live Fallback] Running fallback for channel: ${channelId} (${handle})`);
  const candidates = new Set();
  
  // 1. Fetch RSS feed candidates
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
    console.warn(`[YT Live Fallback] RSS fetch failed:`, e.message);
  }
  
  // 2. Fetch Invidious search candidates
  const invidiousInstances = [
    'https://invidious.flokinet.to',
    'https://invidious.no-logs.com',
    'https://invidious.projectsegfau.lt',
    'https://yewtu.be',
    'https://inv.thepixora.com'
  ];
  
  for (const instance of invidiousInstances) {
    try {
      const searchUrl = `${instance}/api/v1/search?q=live&channel=${channelId}`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
      if (searchRes.ok) {
        const data = await searchRes.json();
        const videos = Array.isArray(data) ? data : (data.videos || []);
        for (const v of videos) {
          if (v.videoId) candidates.add(v.videoId);
        }
        break; // Stop after first successful Invidious instance search
      }
    } catch (e) {
      console.warn(`[YT Live Fallback] Invidious search failed on ${instance}:`, e.message);
    }
  }
  
  const candList = [...candidates].slice(0, 5); // Limit to top 5 candidates to keep it fast
  console.log(`[YT Live Fallback] Found candidate video IDs:`, candList);
  
  if (candList.length === 0) {
    throw new Error('No live candidates found in RSS or Invidious search');
  }
  
  // 3. Test candidates in parallel to see if any is liveNow
  const testCandidate = async (videoId) => {
    // 1. 유튜브 공식 watch 페이지 직접 검증 (가장 빠르고 정확)
    try {
      const check = await verifyVideoIsLive(videoId);
      if (check.success && check.isLive) {
        return { videoId, isLive: true };
      }
    } catch (e) {
      console.warn(`[Fallback Scraper] Direct check failed for ${videoId}:`, e.message);
    }

    // 2. Invidious API 폴백 검증
    for (const instance of invidiousInstances) {
      try {
        const detailUrl = `${instance}/api/v1/videos/${videoId}`;
        const res = await fetch(detailUrl, { signal: AbortSignal.timeout(2500) });
        if (res.ok) {
          const data = await res.json();
          if (data.liveNow === true || (data.lengthSeconds === 0 && data.title?.toLowerCase().includes('live'))) {
            return { videoId, isLive: true };
          }
        }
      } catch (e) {
        // Try next instance
      }
    }
    return { videoId, isLive: false };
  };
  
  try {
    const results = await Promise.all(candList.map(testCandidate));
    const activeLive = results.find(r => r.isLive);
    if (activeLive) {
      console.log(`[YT Live Fallback] Found active live stream: ${activeLive.videoId}`);
      return activeLive.videoId;
    }
  } catch (e) {
    console.warn(`[YT Live Fallback] Parallel testing failed:`, e.message);
  }
  
  throw new Error('All live stream candidates are offline');
}

const PRIORITY_LIVE_IDS = {
  'UChlgI3UHCOnwUGzWzbJ3H5w': 'KpqUNcP9968', // YTN (7월 2일 최신화)
  'UCTHCOPwqNfZ0uiKOvFyhGwg': '-7GBocwrFkk', // 연합뉴스TV (7월 2일 최신화)
  'UCsU-I-vHLiaMfV_ceaYz5rQ': 'eEulvqfma-4',  // JTBC (7월 2일 최신화)
  'UCWlV3Lz_55UaX4JsMj-z__Q': 'Mxe8Csgr-04',  // TV조선 (7월 2일 최신화)
  'UCfq4V1DAuaojnr2ryvWNysw': 'eDgVLPEneuc',  // 채널A (7월 2일 최신화)
  'UCG9aFJTZ-lMCHAiO1KJsirg': 'hczsD8uvX1Q',  // MBN (7월 2일 최신화)
  'UCnfwIKyFYRuqZzzKBDt6JOA': 's9xL1DpBsfQ',  // 매일경제TV
  'UCaQREsefLy-W8ruWcJ7IDtg': 'lb1oB2feqkQ',  // MTN 머니투데이
  'UC-VbFgagk6GJGDJgRQIMpZw': 'qJ9ihwW18hU',   // MBC every1
  'UCF4Wxdo3inmxP-Y59wXDsFw': 'cLZVMDtqqr4'    // MBC 지상파
};

const HANDLE_TO_CHANNEL_ID = {
  'ytnnews24': 'UChlgI3UHCOnwUGzWzbJ3H5w',
  'yonhapnewstv23': 'UCTHCOPwqNfZ0uiKOvFyhGwg',
  'jtbc_news': 'UCsU-I-vHLiaMfV_ceaYz5rQ',
  'tvchosunnews': 'UCWlV3Lz_55UaX4JsMj-z__Q',
  'channelA-news': 'UCfq4V1DAuaojnr2ryvWNysw',
  'mbn': 'UCG9aFJTZ-lMCHAiO1KJsirg',
  'MKeconomy_TV': 'UCnfwIKyFYRuqZzzKBDt6JOA',
  'mtn': 'UCaQREsefLy-W8ruWcJ7IDtg',
  'MBCevery1': 'UC-VbFgagk6GJGDJgRQIMpZw',
  'ALLTHEKPOP': 'UCPde4guD9yFBRzkxk2PatoA',
  'MBCNEWS': 'UCF4Wxdo3inmxP-Y59wXDsFw'
};

async function verifyVideoIsLive(videoId) {
  // 1. 유튜브 공식 watch 페이지를 직접 fetch하여 실시간 여부 검사 (Vercel 백엔드 서버에서 호출)
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      const html = await res.text();
      const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
      console.log(`[Verify Live] Yt watch direct check for ${videoId}: isLive = ${isLive}`);
      return { success: true, isLive };
    }
  } catch (e) {
    console.warn(`[Verify Live] Yt watch direct fetch failed for ${videoId}:`, e.message);
  }

  // 2. 유튜브 직접 조회가 실패했을 때만 Invidious API 폴백 실행
  const invidiousInstances = [
    'https://invidious.flokinet.to',
    'https://invidious.no-logs.com',
    'https://invidious.projectsegfau.lt',
    'https://yewtu.be',
    'https://inv.thepixora.com'
  ];
  
  for (const instance of invidiousInstances) {
    try {
      const url = `${instance}/api/v1/videos/${videoId}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          isLive: data.liveNow === true || (data.lengthSeconds === 0 && data.title?.toLowerCase().includes('live'))
        };
      }
    } catch (e) {
      // Try next
    }
  }
  return { success: false, isLive: false }; // Assume offline if we cannot verify it
}

async function getLiveVideoIdFromInvidiousApi(channelId) {
  if (!channelId) return null;
  const instances = [
    'https://invidious.fdn.fr',
    'https://vid.puffyan.us',
    'https://invidious.projectsegfau.lt',
    'https://invidious.lunar.icu',
    'https://yewtu.be',
    'https://invidious.nerdvpn.de',
    'https://invidious.no-logs.com'
  ];
  console.log(`[Invidious Parallel Live Scraper] Starting live check for: ${channelId}`);
  const promises = instances.map(async (instance) => {
    const url = `${instance}/api/v1/channels/${channelId}/videos?sort_by=newest`;
    const res = await fetch(url, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      let liveVideo = json.find(v => v.liveNow === true);
      if (!liveVideo) {
        liveVideo = json.find(v => v.lengthSeconds === 0 && v.title?.toLowerCase().includes('live'));
      }
      if (liveVideo && liveVideo.videoId) {
        console.log(`[Invidious Parallel Live] Found live video: ${liveVideo.videoId} via ${instance}`);
        return liveVideo.videoId;
      }
    }
    throw new Error('No live stream detected');
  });

  return new Promise((resolve) => {
    let resolved = false;
    let failedCount = 0;
    promises.forEach(p => {
      p.then(videoId => {
        if (!resolved && videoId) {
          resolved = true;
          resolve(videoId);
        }
      }).catch(() => {
        failedCount++;
        if (failedCount === promises.length && !resolved) {
          resolved = true;
          resolve(null);
        }
      });
    });
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(null);
      }
    }, 3000);
  });
}

async function getYoutubeLiveVideoId(handle, channelId) {
  const cacheKey = `${handle}:${channelId || ''}`;
  const cached = ytLiveCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < YT_LIVE_CACHE_TTL) {
    return cached.videoId;
  }

  // 1순위: Invidious 병렬 실시간 라이브 검출기 작동 (CORS/Cookie Consent 100% 우회 실시간 감지)
  if (channelId) {
    try {
      const liveId = await getLiveVideoIdFromInvidiousApi(channelId);
      if (liveId) {
        console.log(`[YT Live Scraper] Successfully detected real-time live ID: ${liveId}`);
        ytLiveCache.set(cacheKey, { videoId: liveId, timestamp: Date.now() });
        return liveId;
      }
    } catch (e) {
      console.warn(`[YT Live Scraper] Real-time Invidious scraper failed:`, e.message);
    }
  }

  // 2순위: 실시간 검출 실패 시 정규 실시간 뉴스 고정 비디오 ID 우선 검증 폴백
  if (channelId && PRIORITY_LIVE_IDS[channelId]) {
    const priorityId = PRIORITY_LIVE_IDS[channelId];
    console.log(`[YT Live Scraper] Checking priority live ID for ${handle} (${channelId}): ${priorityId}`);
    const check = await verifyVideoIsLive(priorityId);
    if (check.isLive) {
      console.log(`[YT Live Scraper] Priority live ID ${priorityId} is ACTIVE. Returning immediately.`);
      ytLiveCache.set(cacheKey, { videoId: priorityId, timestamp: Date.now() });
      return priorityId;
    } else {
      console.warn(`[YT Live Scraper] Priority live ID ${priorityId} is OFFLINE. Proceeding to normal scrape.`);
    }
  }

  let videoId = null;
  let scrapeError = null;

  try {
    const url = `https://www.youtube.com/@${handle}/live`;
    const html = await fetchUrl(url);
    
    if (html) {
      const isConsentPage = html.includes('consent.youtube.com') || 
                            html.includes('consent.google.com') || 
                            html.includes('Before you continue') || 
                            html.includes('consent_cookie_conds');
      if (isConsentPage) {
        throw new Error('Redirected to YouTube cookie consent page');
      }

      const lowerHtml = html.toLowerCase();
      
      // Enforce channelId check if provided (foolproof against consent query redirects)
      if (channelId) {
        if (!lowerHtml.includes(channelId.toLowerCase())) {
          throw new Error(`Response HTML does not contain channel ID: ${channelId}`);
        }
      } else {
        const lowerHandle = handle.toLowerCase();
        if (!lowerHtml.includes(lowerHandle)) {
          throw new Error(`Response HTML does not contain channel handle: ${handle}`);
        }
      }
    }
    
    if (html) {
      // 1. liveStreamability 블록 내의 videoId 검색 (가장 정확하고 유일하게 유효한 실시간 라이브 ID)
      let match = html.match(/"liveStreamability"[\s\S]*?"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match?.[1]) {
        const tempId = match[1];
        console.log(`[YT Live Scraper] Main scraper found videoId: ${tempId}. Verifying live status...`);
        const check = await verifyVideoIsLive(tempId);
        if (check.isLive) {
          videoId = tempId;
          console.log(`[YT Live Scraper] Main scraper videoId verified: ${videoId}`);
        } else {
          console.warn(`[YT Live Scraper] Main scraper videoId ${tempId} is NOT live. Discarding.`);
        }
      } else {
        // liveStreamability 블록이 없으면 동의 페이지 우회, 차단, 또는 채널 오프라인 상태이므로 에러 발생시킴
        // 일반 동영상 ID를 임의로 긁어오는 폴백을 제거하여 엉뚱한 비디오(예: 삼프로TV)가 나오는 현상 방지
        throw new Error('liveStreamability block not found in page source (likely redirected to consent or offline)');
      }
    }
  } catch (err) {
    console.warn(`[YT Live Scraper] Main scraper failed for ${handle}:`, err.message);
    scrapeError = err;
  }

  if (!videoId || videoId === 'C3aa-Vv4Fzw') {
    const effectiveChannelId = channelId || HANDLE_TO_CHANNEL_ID[handle];
    if (effectiveChannelId) {
      try {
        videoId = await getYoutubeLiveVideoIdFallback(handle, effectiveChannelId);
      } catch (fallbackErr) {
        console.error(`[YT Live Scraper] Fallback failed for ${handle}:`, fallbackErr.message);
        if (PRIORITY_LIVE_IDS[effectiveChannelId]) {
          console.warn(`[YT Live Scraper] Fallback failed. Returning PRIORITY_LIVE_ID: ${PRIORITY_LIVE_IDS[effectiveChannelId]}`);
          videoId = PRIORITY_LIVE_IDS[effectiveChannelId];
        } else {
          throw scrapeError || fallbackErr;
        }
      }
    } else {
      throw scrapeError || new Error('Could not find live video ID in page source');
    }
  }

  ytLiveCache.set(cacheKey, { videoId, timestamp: Date.now() });
  return videoId;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { handle, channelId, debug } = req.query;

  if (!handle || !/^@?[\w\.-]+$/.test(handle)) {
    return res.status(400).json({ error: 'Invalid handle' });
  }

  if (channelId && !/^UC[a-zA-Z0-9_-]{22}$/.test(channelId)) {
    return res.status(400).json({ error: 'Invalid channel ID' });
  }

  if (debug === 'true') {
    try {
      const cleanHandle = handle.replace('@', '');
      const url = `https://www.youtube.com/@${cleanHandle}/live`;
      const html = await fetchUrl(url);
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const hasConsent = html.includes('consent') || html.includes('Before you continue') || html.includes('동의') || html.includes('redirect');
      const matches = [];
      let m;
      const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
      while ((m = regex.exec(html)) !== null) {
        if (!matches.includes(m[1])) matches.push(m[1]);
      }
      return res.status(200).json({
        title: titleMatch ? titleMatch[1] : 'Not found',
        hasConsent,
        url,
        videoIds: matches.slice(0, 10),
        htmlSnippet: html.substring(0, 1500)
      });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  try {
    const cleanHandle = handle.replace('@', '');
    const videoId = await getYoutubeLiveVideoId(cleanHandle, channelId);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600');
    return res.status(200).json({ ok: true, videoId });
  } catch (err) {
    console.error(`[YT Live Error] ${handle}:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
