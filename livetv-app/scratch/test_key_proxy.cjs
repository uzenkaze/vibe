const https = require('https');

const keyUrl = 'https://hls-key.play.kbs.co.kr/1tv/8cddc906-1c2a-4bbb-80aa-bef916ec4ef9';
const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=' + encodeURIComponent(keyUrl);

https.get(proxyUrl, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = [];
  res.on('data', chunk => body.push(chunk));
  res.on('end', () => {
    const data = Buffer.concat(body);
    console.log('Returned binary data length:', data.length);
    console.log('Hex representation:', data.toString('hex'));
  });
}).on('error', (err) => {
  console.error('Error fetching key:', err);
});
