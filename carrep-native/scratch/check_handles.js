import https from 'https';

const channels = [
  { id: 'ytn', handle: 'ytnnews24' },
  { id: 'yonhap', handle: 'yonhapnewstv23' },
  { id: 'sbsbiz', handle: 'SBSBiz2021' },
  { id: 'ytn_science', handle: 'YTNSC' }
];

function fetchHandle(ch) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/@${ch.handle}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let channelIdMatch = data.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
        if (!channelIdMatch) channelIdMatch = data.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/);
        
        let videoIdMatch = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
        
        console.log(`[${ch.id}] handle: @${ch.handle}`);
        console.log(`  Channel ID: ${channelIdMatch ? channelIdMatch[1] : 'Not found'}`);
        console.log(`  Live Video ID: ${videoIdMatch ? videoIdMatch[1] : 'Not found'}`);
        resolve();
      });
    }).on('error', () => {
      console.log(`[${ch.id}] failed to fetch`);
      resolve();
    });
  });
}

async function main() {
  for (const ch of channels) {
    await fetchHandle(ch);
  }
}

main();
