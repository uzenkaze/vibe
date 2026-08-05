const https = require('https');

const testUrl = 'https://hlive.ktv.go.kr/live/klive_h.stream/playlist.m3u8';
const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=' + encodeURIComponent(testUrl);

console.log('Testing proxy URL:', proxyUrl);

https.get(proxyUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Body snippet (first 300 chars):');
    console.log(body.substring(0, 300));
  });
}).on('error', (err) => {
  console.error('Error fetching proxy:', err);
});
