const https = require('https');

const ytnUrl = 'https://ytnscience-hls.gcdn.ntruss.com/ytnscience/ytnsciencehd/playlist.m3u8';
const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=' + encodeURIComponent(ytnUrl);

console.log('Testing YTN Science directly...');
https.get(ytnUrl, (res) => {
  console.log('Direct status:', res.statusCode);
}).on('error', (err) => console.log('Direct error:', err.message));

console.log('Testing YTN Science via Proxy:', proxyUrl);
https.get(proxyUrl, (res) => {
  console.log('Proxy status:', res.statusCode);
  console.log('Proxy headers:', res.headers);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Proxy body length:', body.length);
    console.log('Proxy body snippet:', body.substring(0, 300));
  });
}).on('error', (err) => console.log('Proxy error:', err.message));
