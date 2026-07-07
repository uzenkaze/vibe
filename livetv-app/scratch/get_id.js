import https from 'https';

https.get('https://www.youtube.com/@YTNSC', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let match = data.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (!match) match = data.match(/"externalId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (!match) match = data.match(/href="https:\/\/www\.youtube\.com\/channel\/(UC[a-zA-Z0-9_-]{22})"/);
    console.log('Channel ID:', match ? match[1] : 'Not found');
  });
});
