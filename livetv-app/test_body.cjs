const https = require('https');

const channelId = 'UCsJ6RuBi65JHJkZYO1MECIA';
const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
  }
};

https.get(url, options, (res) => {
  let data = '';
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Body Length: ${data.length} bytes`);
    console.log(`Body Content:\n`, data);
  });
}).on('error', (err) => {
  console.error('Error:', err.message);
});
