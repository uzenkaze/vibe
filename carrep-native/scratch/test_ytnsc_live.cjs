const https = require('https');

const url = 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=YTNSC';

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Body:', body);
  });
}).on('error', (err) => console.error(err));
