async function testHeaders(name, url, headers) {
  try {
    const res = await fetch(url, { headers });
    if (res.ok) {
      const text = await res.text();
      console.log(`[SUCCESS] ${name} with headers:`, Object.keys(headers));
      console.log(text.substring(0, 120));
      return true;
    } else {
      console.log(`[FAIL] ${name} with headers:`, Object.keys(headers), `-> HTTP ${res.status}`);
      return false;
    }
  } catch(e) {
    console.log(`[ERROR] ${name}:`, e.message);
    return false;
  }
}

async function run() {
  const channelAUrl = 'http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8';
  const mbnUrl = 'https://hls-live.mbn.co.kr/mbn-on-air/1000k/playlist.m3u8';

  console.log('--- TESTING CHANNEL A ---');
  // 1. 기본 브라우저 모방 헤더
  await testHeaders('Channel A (Base)', channelAUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://ichannela.com/'
  });

  // 2. Origin 추가
  await testHeaders('Channel A (+Origin)', channelAUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://ichannela.com/',
    'Origin': 'https://ichannela.com'
  });

  // 3. www subdomain 포함
  await testHeaders('Channel A (www.ichannela.com)', channelAUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.ichannela.com/',
    'Origin': 'https://www.ichannela.com'
  });

  console.log('\n--- TESTING MBN ---');
  // 1. 기본 Referer
  await testHeaders('MBN (Base)', mbnUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.mbn.co.kr/'
  });

  // 2. Origin 추가
  await testHeaders('MBN (+Origin)', mbnUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://www.mbn.co.kr/',
    'Origin': 'https://www.mbn.co.kr'
  });

  // 3. no subdomain
  await testHeaders('MBN (mbn.co.kr)', mbnUrl, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Referer': 'https://mbn.co.kr/',
    'Origin': 'https://mbn.co.kr'
  });
}

run();
