import https from 'https';

const url = 'https://tvchosun-hls.gcdn.ntruss.com/tvchosun/tvchosunhd/playlist.m3u8';
const proxies = [
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
  `https://corsproxy.io/?${encodeURIComponent(url)}`,
  `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

function testProxy(proxyUrl) {
  return new Promise((resolve) => {
    const start = Date.now();
    https.get(proxyUrl, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const time = Date.now() - start;
        console.log(`Proxy: ${proxyUrl.split('?')[0]} -> Status: ${res.statusCode}, Time: ${time}ms, Length: ${data.length}`);
        if (res.statusCode === 200 && data.includes('#EXTM3U')) {
          console.log('  SUCCESS: Valid M3U8 content retrieved!');
        } else {
          console.log(`  FAILED: Snippet: ${data.substring(0, 100).replace(/\n/g, '|')}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`Proxy: ${proxyUrl.split('?')[0]} -> ERROR: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  console.log('Testing TV Chosun HLS stream via public proxies:');
  for (const proxy of proxies) {
    await testProxy(proxy);
  }
}

main();
