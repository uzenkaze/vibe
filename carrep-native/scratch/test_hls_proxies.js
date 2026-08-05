async function testProxy(name, targetUrl) {
  try {
    const proxyUrl = `https://vibe-eight-iota.vercel.app/api/stream-proxy?url=${encodeURIComponent(targetUrl)}`;
    console.log(`Testing ${name} HLS Proxy: ${proxyUrl.substring(0, 100)}...`);
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const text = await res.text();
      console.log(`[OK] ${name}: Status 200. First 150 chars:`);
      console.log(text.substring(0, 150));
    } else {
      console.log(`[FAIL] ${name}: HTTP ${res.status}`);
      try {
        const errJson = await res.json();
        console.log(`Error Reason:`, errJson);
      } catch(e) {
        const txt = await res.text();
        console.log(`Error Text:`, txt.substring(0, 150));
      }
    }
  } catch (err) {
    console.error(`[ERROR] ${name}: ${err.message}`);
  }
  console.log(`-----------------------------------`);
}

async function run() {
  await testProxy('TV조선', 'http://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8');
  await testProxy('채널A', 'http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8');
  await testProxy('MBN (고화질)', 'https://hls-live.mbn.co.kr/mbn-on-air/1000k/playlist.m3u8');
}

run();
