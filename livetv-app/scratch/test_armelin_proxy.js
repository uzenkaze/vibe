const channels = [
  { name: 'YTN Science', url: 'https://ythls.armelin.one/channel/UCZdBJIbJz0P9xyFipgOj1fA.m3u8' },
  { name: 'YTN', url: 'https://ythls.armelin.one/channel/UChlgI3UHCOnwUGzWzbJ3H5w.m3u8' },
  { name: 'TV조선', url: 'https://ythls.armelin.one/channel/UCWlV3Lz_55UaX4JsMj-z__Q.m3u8' },
  { name: '채널A', url: 'https://ythls.armelin.one/channel/UCfq4V1DAuaojnr2ryvWNysw.m3u8' },
  { name: 'MBN', url: 'https://ythls.armelin.one/channel/UCG9aFJTZ-lMCHAiO1KJsirg.m3u8' },
  { name: 'JTBC', url: 'https://ythls.armelin.one/channel/UCsU-I-vHLiaMfV_ceaYz5rQ.m3u8' },
  { name: '연합뉴스TV', url: 'https://ythls.armelin.one/channel/UCTHCOPwqNfZ0uiKOvFyhGwg.m3u8' },
  { name: 'SBS Biz', url: 'https://ythls.armelin.one/channel/UCbMjg2EvXs_RUGW-KrdM3pw.m3u8' }
];

async function testChannel(ch) {
  console.log(`Testing ${ch.name} via Armelin Proxy...`);
  try {
    const res = await fetch(ch.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000
    });
    console.log(`  Status: ${res.status}`);
    if (res.ok) {
      const text = await res.text();
      console.log(`  Manifest (first 100 chars):`, text.substring(0, 100).replace(/\n/g, ' '));
    } else {
      console.log(`  Failed:`, await res.text());
    }
  } catch(e) {
    console.error(`  Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  for (const ch of channels) {
    await testChannel(ch);
  }
}

run();
