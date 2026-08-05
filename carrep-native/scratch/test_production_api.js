async function testApi(name, url) {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`[FAIL] ${name}: Status ${res.status}`);
      return;
    }
    const data = await res.json();
    console.log(`[OK] ${name}: videoId = ${data.videoId}`);
  } catch (err) {
    console.log(`[ERROR] ${name}: ${err.message}`);
  }
}

async function run() {
  console.log('Testing production YouTube live scrapers on Vercel...');
  await testApi('TV조선', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=tvchosunnews&channelId=UCWlV3Lz_55UaX4JsMj-z__Q');
  await testApi('채널A', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=channelA-news&channelId=UCfq4V1DAuaojnr2ryvWNysw');
  await testApi('MBN', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=mbn&channelId=UCG9aFJTZ-lMCHAiO1KJsirg');
  await testApi('매일경제TV', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=MKeconomy_TV&channelId=UCnfwIKyFYRuqZzzKBDt6JOA');
  await testApi('MTN 머니투데이', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=mtn&channelId=UCaQREsefLy-W8ruWcJ7IDtg');
  await testApi('YTN 사이언스', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=YTNSC&channelId=UCZdBJIbJz0P9xyFipgOj1fA');
  await testApi('JTBC', 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=jtbc_news&channelId=UCsU-I-vHLiaMfV_ceaYz5rQ');
}

run();
