const https = require('https');

// Test 1: Direct KBS API
const directUrl = 'https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/11';
https.get(directUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('--- Direct KBS API Response ---');
    try {
      const data = JSON.parse(body);
      const apiUrl = data.channel_item?.find(i => i.service_url)?.service_url;
      console.log('Service URL:', apiUrl);
    } catch(e) {
      console.log('Failed to parse direct response:', e.message);
      console.log(body.substring(0, 500));
    }
  });
}).on('error', (err) => console.error('Direct API error:', err));

// Test 2: Vercel KBS API Proxy
const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/kbs?channel_code=11';
https.get(proxyUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('--- Proxy KBS API Response ---');
    try {
      const data = JSON.parse(body);
      const apiUrl = data.channel_item?.find(i => i.service_url)?.service_url;
      console.log('Proxy Service URL:', apiUrl);
    } catch(e) {
      console.log('Failed to parse proxy response:', e.message);
      console.log(body.substring(0, 500));
    }
  });
}).on('error', (err) => console.error('Proxy API error:', err));
