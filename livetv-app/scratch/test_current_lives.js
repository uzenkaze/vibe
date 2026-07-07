import https from 'https';
import http from 'http';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Connection': 'keep-alive',
      },
      timeout: 8000,
    }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function scrapeLiveVideoId(handle, channelId) {
  try {
    const url = `https://www.youtube.com/@${handle}/live`;
    const html = await fetchUrl(url);
    if (html) {
      let match = html.match(/"liveStreamability"[\s\S]*?"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match?.[1]) {
        return { handle, success: true, method: 'scrape', videoId: match[1] };
      }
    }
  } catch (err) {
    // console.log(`Scraper failed for ${handle}:`, err.message);
  }

  // Fallback using RSS
  if (channelId) {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const rssRes = await fetch(rssUrl);
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
        let m;
        const candidates = [];
        while ((m = regex.exec(xml)) !== null) {
          candidates.push(m[1]);
        }
        if (candidates.length > 0) {
          return { handle, success: true, method: 'rss', candidates };
        }
      }
    } catch (e) {
      // console.log(`RSS failed for ${handle}:`, e.message);
    }
  }

  return { handle, success: false };
}

async function run() {
  const targets = [
    { handle: 'tvchosunnews', channelId: 'UCWlV3Lz_55UaX4JsMj-z__Q', name: 'TV조선' },
    { handle: 'channelA-news', channelId: 'UCfq4V1DAuaojnr2ryvWNysw', name: '채널A' },
    { handle: 'mbn', channelId: 'UCG9aFJTZ-lMCHAiO1KJsirg', name: 'MBN' },
    { handle: 'MKeconomy_TV', channelId: 'UCnfwIKyFYRuqZzzKBDt6JOA', name: '매일경제TV' },
    { handle: 'mtn', channelId: 'UCaQREsefLy-W8ruWcJ7IDtg', name: 'MTN 머니투데이' },
    { handle: 'YTNSC', channelId: 'UCZdBJIbJz0P9xyFipgOj1fA', name: 'YTN 사이언스' },
    { handle: 'jtbc_news', channelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ', name: 'JTBC' },
    { handle: 'ytnnews24', channelId: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN' },
    { handle: 'yonhapnewstv23', channelId: 'UCTHCOPwqNfZ0uiKOvFyhGwg', name: '연합뉴스TV' }
  ];

  for (const t of targets) {
    console.log(`Checking ${t.name} (@${t.handle})...`);
    const res = await scrapeLiveVideoId(t.handle, t.channelId);
    console.log(JSON.stringify(res, null, 2));
  }
}

run();
