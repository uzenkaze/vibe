async function testEmbedHtml() {
  const liveVideoId = 'f5zI6QOt_1o'; // YTN Science live video
  const regularVideoId = 'pTqN3MX6XEk'; // Regular video
  
  async function check(videoId) {
    const url = `https://www.youtube.com/embed/${videoId}`;
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      console.log(`${videoId} embed status:`, res.status);
      if (res.ok) {
        const html = await res.text();
        const hasIsLive = html.includes('"isLive":true') || html.includes('"isLive": true');
        const hasLiveStreamability = html.includes('liveStreamability');
        console.log(`  hasIsLive: ${hasIsLive} | hasLiveStreamability: ${hasLiveStreamability}`);
        // Find any other indicators of live stream
        console.log(`  contains "LIVE":`, html.includes('LIVE'));
      }
    } catch(e) {
      console.error(e);
    }
  }
  
  await check(liveVideoId);
  console.log('---------------------------');
  await check(regularVideoId);
}
testEmbedHtml();
