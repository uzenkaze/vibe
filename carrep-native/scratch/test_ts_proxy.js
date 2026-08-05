async function testTsProxy() {
  try {
    // 1. Get m3u8 via proxy first
    const m3u8Url = 'http://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8';
    const proxyM3u8Url = `https://vibe-eight-iota.vercel.app/api/stream-proxy?url=${encodeURIComponent(m3u8Url)}`;
    console.log('Fetching m3u8 via proxy...');
    const m3u8Res = await fetch(proxyM3u8Url);
    if (!m3u8Res.ok) {
      console.log('Failed to fetch m3u8:', m3u8Res.status);
      return;
    }
    const text = await m3u8Res.text();
    console.log('m3u8 content fetched.');
    
    // Parse first segment URL (lines starting with /api/stream-proxy)
    const lines = text.split('\n');
    const segmentLine = lines.find(line => line.includes('/api/stream-proxy'));
    if (!segmentLine) {
      console.log('No segment URL found in m3u8 content.');
      console.log(text.substring(0, 300));
      return;
    }
    
    console.log('Found segment proxy URL:', segmentLine);
    
    // 2. Fetch the segment via proxy
    const segmentFullUrl = `https://vibe-eight-iota.vercel.app${segmentLine}`;
    console.log('Fetching segment via proxy:', segmentFullUrl.substring(0, 120));
    const tsRes = await fetch(segmentFullUrl);
    if (tsRes.ok) {
      const buffer = await tsRes.arrayBuffer();
      console.log(`[SUCCESS] TS Segment downloaded. Size: ${buffer.byteLength} bytes.`);
    } else {
      console.log(`[FAIL] TS Segment failed: HTTP ${tsRes.status}`);
      const errTxt = await tsRes.text();
      console.log('Reason:', errTxt.substring(0, 150));
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testTsProxy();
