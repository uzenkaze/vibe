const https = require('https');

https.get('https://www.youtube.com/@YTNSCIENCE/live', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
  }
}, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log(body);
  });
});
