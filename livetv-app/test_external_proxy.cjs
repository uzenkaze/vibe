const https = require('https');

const channelId = 'UCsJ6RuBi65JHJkZYO1MECIA'; // 슈카월드
const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
const enc = encodeURIComponent(rssUrl);

// 테스트할 프록시 리스트
const proxies = [
  { name: 'allorigins', url: `https://api.allorigins.win/get?url=${enc}` },
  { name: 'codetabs', url: `https://api.codetabs.com/v1/proxy?quest=${enc}` },
];

function fetchWithProxy(proxy) {
  return new Promise((resolve) => {
    console.log(`[TEST] Fetching via ${proxy.name}...`);
    https.get(proxy.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: proxy.name,
          statusCode: res.statusCode,
          length: data.length,
          sample: data.substring(0, 300)
        });
      });
    }).on('error', (err) => {
      resolve({
        name: proxy.name,
        error: err.message
      });
    });
  });
}

async function run() {
  for (const proxy of proxies) {
    const res = await fetchWithProxy(proxy);
    console.log(`Result for ${res.name}:`);
    if (res.error) {
      console.log(`  Error: ${res.error}`);
    } else {
      console.log(`  Status: ${res.statusCode}`);
      console.log(`  Length: ${res.length} bytes`);
      console.log(`  Sample:\n`, res.sample);
    }
    console.log('-----------------------------------------');
  }
}

run();
