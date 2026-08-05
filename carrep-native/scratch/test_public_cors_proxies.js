const targetUrl = 'https://tvchosun-hls.gcdn.ntruss.com/tvchosun/tvchosunhd/playlist.m3u8';
const referer = 'http://broadcast.tvchosun.com/';

const proxies = [
  { name: 'AllOrigins Raw', url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}` },
  { name: 'CorsProxy.io', url: `https://corsproxy.io/?${encodeURIComponent(targetUrl)}` },
  { name: 'CodeTabs', url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}` }
];

async function run() {
  for (const proxy of proxies) {
    console.log(`Testing proxy: ${proxy.name}...`);
    try {
      const res = await fetch(proxy.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          // Note: Browser headers like Referer cannot be set when fetching via proxy from browser,
          // but some proxies might pass through or not require it, or the CDN might not check it if it comes from the proxy's IP.
        }
      });
      console.log(`  Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`  Response (first 100 chars):`, text.substring(0, 100).replace(/\n/g, ' '));
      }
    } catch(e) {
      console.error(`  Error:`, e.message);
    }
    console.log('----------------------------------------------------');
  }
}

run();
