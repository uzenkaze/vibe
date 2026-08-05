import https from 'https';

https.get('https://www.youtube.com/@YTNSC/live', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTTP Status:', res.statusCode);
    let match = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    console.log('Video ID in JSON:', match ? match[1] : 'Not found');
    
    match = data.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
    console.log('Video ID in watch link:', match ? match[1] : 'Not found');

    match = data.match(/"liveStreamability"/);
    console.log('Is live streamable found:', !!match);

    // print a snippet of HTML around videoId or liveStreamability
    const idx = data.indexOf('"liveStreamability"');
    if (idx !== -1) {
      console.log('Snippet:', data.substring(idx - 100, idx + 100));
    }
  });
});
