import https from 'https';

https.get('https://www.youtube.com/@yonhapnewstv23/live', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    // Let's find all videoId matches and their surrounding context
    const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
    let match;
    let count = 0;
    while ((match = regex.exec(data)) !== null && count < 20) {
      const id = match[1];
      const index = match.index;
      const context = data.substring(index - 100, index + 150);
      console.log(`Match ${count + 1}: ${id}`);
      console.log(`  IsLiveStreamable: ${context.includes('liveStreamability')}`);
      console.log(`  Context snippet: ${context.replace(/\s+/g, ' ').substring(0, 150)}`);
      count++;
    }
  });
});
