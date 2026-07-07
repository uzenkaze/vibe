// scratch/test_live_ids.js
import https from 'https';

function fetchUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
      },
      timeout: 8000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function scrape(handle) {
  const url = `https://www.youtube.com/@${handle}/live`;
  try {
    const html = await fetchUrl(url);
    let videoId = null;
    
    // 1. liveStreamability 블록
    let match = html.match(/"liveStreamability"[\s\S]*?"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (match?.[1]) videoId = match[1];

    // 2. 일반 JSON 내의 videoId 검색
    if (!videoId) {
      match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      if (match?.[1]) videoId = match[1];
    }

    // 3. embed 주소 검색
    if (!videoId) {
      match = html.match(/embed\/([a-zA-Z0-9_-]{11})/);
      if (match?.[1]) videoId = match[1];
    }

    // 4. 일반 watch?v= 링크 검색
    if (!videoId) {
      match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
      if (match?.[1]) videoId = match[1];
    }

    console.log(`${handle} : ${videoId}`);
  } catch (e) {
    console.log(`${handle} error: ${e.message}`);
  }
}

async function main() {
  await scrape('jtbc_news');
  await scrape('ytnnews24');
  await scrape('yonhapnewstv23');
  await scrape('tvchosunnews');
  await scrape('channelA-news');
  await scrape('mbn');
  await scrape('MKeconomy_TV');
  await scrape('MTN');
  await scrape('MBCevery1');
  await scrape('MBCNEWS');
}

main();
