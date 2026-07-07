import https from 'https';

function checkVideo(videoId) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const ownerMatch = data.match(/"ownerChannelName":"(.*?)"/);
        const channelIdMatch = data.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
        console.log(`[Video: ${videoId}]`);
        console.log(`  Title: ${titleMatch ? titleMatch[1] : 'Not found'}`);
        console.log(`  Owner: ${ownerMatch ? ownerMatch[1] : 'Not found'}`);
        console.log(`  Channel ID: ${channelIdMatch ? channelIdMatch[1] : 'Not found'}`);
        resolve();
      });
    }).on('error', () => {
      console.log(`[Video: ${videoId}] Fetch error`);
      resolve();
    });
  });
}

async function main() {
  await checkVideo('mukwdTwn-1g'); // SBS News 8
  await checkVideo('OM7p5leX7hA'); // SBS Biz
  await checkVideo('0ATLXbnRSrY'); // 매일경제TV
}

main();
