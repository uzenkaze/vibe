const https = require('https');

const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/kbs?channel_code=11';
https.get(proxyUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', body);
  });
}).on('error', (err) => console.error('Proxy API error:', err));
