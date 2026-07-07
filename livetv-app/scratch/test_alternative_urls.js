const streams = [
  { name: 'TV조선 Alt 1', url: 'http://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8', referer: 'http://broadcast.tvchosun.com/' },
  { name: 'TV조선 Alt 2', url: 'http://onair2.cdn.tvchosun.com/origin2/_definst_/tvchosun_s3/playlist.m3u8', referer: 'http://broadcast.tvchosun.com/' },
  { name: '채널A Alt 1', url: 'http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8', referer: 'https://ichannela.com/' },
  { name: 'YTN Alt 1', url: 'http://202.60.106.14:8080/214/playlist.m3u8', referer: 'https://www.ytn.co.kr/' }
];

async function testStream(stream) {
  console.log(`Testing ${stream.name}: ${stream.url}...`);
  try {
    const res = await fetch(stream.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': stream.referer
      }
    });
    console.log(`  Status: ${res.status}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`  Manifest:`, text.substring(0, 100).replace(/\n/g, ' '));
    }
  } catch(e) {
    console.error(`  Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  for (const stream of streams) {
    await testStream(stream);
  }
}

run();
