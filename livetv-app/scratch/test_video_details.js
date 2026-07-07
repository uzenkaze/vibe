async function testVideo(videoId) {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept': 'text/html'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
      const isPlayable = !html.includes('동영상을 재생할 수 없습니다') && !html.includes('PlayabilityStatus');
      const reasonMatch = html.match(/"playabilityStatus":[\s\S]*?"reason":"([^"]+)"/);
      
      console.log(`Video ID: ${videoId}`);
      console.log(`Title: ${titleMatch ? titleMatch[1] : 'Unknown'}`);
      console.log(`isLive: ${isLive}`);
      console.log(`Reason: ${reasonMatch ? reasonMatch[1] : 'None (Probably playable)'}`);
      console.log(`-----------------------------------`);
    } else {
      console.log(`Failed to fetch watch page: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function run() {
  await testVideo('rznrNvH9iHE'); // TV조선 현재 비디오 ID
  await testVideo('XuFVxv-SH7c'); // 채널A 현재 비디오 ID
}

run();
