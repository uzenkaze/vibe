const https = require('https');

const url = 'https://www.youtube.com/@YTNSCIENCE/live';

https.get(url, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
    'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8'
  }
}, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('HTML length:', html.length);
    
    // Check if live stream is running
    const isLive = html.includes('live') || html.includes('실시간') || html.includes('스트리밍');
    console.log('Contains live keywords:', isLive);

    // Try finding videoId
    let match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    console.log('Regex 1 (watch?v=):', match?.[0], match?.[1]);
    
    match = html.match(/embed\/([a-zA-Z0-9_-]{11})/);
    console.log('Regex 2 (embed/):', match?.[0], match?.[1]);

    match = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    console.log('Regex 3 ("videoId":):', match?.[0], match?.[1]);

    // Check if the channel is even correct
    const hasYtnSci = html.includes('YTN') && html.includes('science');
    console.log('Contains YTN Science keywords:', hasYtnSci);
  });
});
