import https from 'https';

https.get('https://www.youtube.com/watch?v=C3aa-Vv4Fzw', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    let titleMatch = data.match(/<title>(.*?)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
    let isLive = data.includes('"isLive":true') || data.includes('"liveStreamability"');
    console.log('Is Live Stream:', isLive);
  });
});
