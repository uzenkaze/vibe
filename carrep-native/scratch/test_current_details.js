async function testVideo(name, videoId) {
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
      const isLiveStream = html.includes('"isLiveStream":true') || html.includes('"isLiveStream": true');
      const reasonMatch = html.match(/"playabilityStatus":[\s\S]*?"reason":"([^"]+)"/);
      
      console.log(`Channel: ${name} (${videoId})`);
      console.log(`Title: ${titleMatch ? titleMatch[1] : 'Unknown'}`);
      console.log(`isLive: ${isLive}`);
      console.log(`isLiveStream: ${isLiveStream}`);
      console.log(`Reason: ${reasonMatch ? reasonMatch[1] : 'None (Probably playable)'}`);
      console.log(`-----------------------------------`);
    } else {
      console.log(`Failed to fetch watch page for ${name}: HTTP ${res.status}`);
    }
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

async function run() {
  await testVideo('TV조선 (새 ID)', 'Y36Ly4GryO0');
  await testVideo('채널A (새 ID)', 'RnPBAwnedCw');
  await testVideo('TV조선 (구 ID)', 'rznrNvH9iHE');
  await testVideo('채널A (구 ID)', 'XuFVxv-SH7c');
}

run();
