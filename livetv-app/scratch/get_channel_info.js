import https from 'https';

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function main() {
  const html = await fetchPage('https://www.youtube.com/@YTNSC');
  let channelId = null;
  const matches = [
    html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/),
    html.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/),
    html.match(/youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})/)
  ];
  for (const m of matches) {
    if (m?.[1]) {
      channelId = m[1];
      break;
    }
  }
  console.log('Detected YTNSC Channel ID:', channelId);
  
  if (channelId) {
    const rssHtml = await fetchPage(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`);
    const titleMatch = rssHtml.match(/<title>(.*?)<\/title>/);
    console.log('RSS Title:', titleMatch ? titleMatch[1] : 'Not found');
    const firstVideo = rssHtml.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    console.log('RSS First Video ID:', firstVideo ? firstVideo[1] : 'Not found');
  }
}

main();
