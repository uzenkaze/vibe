async function run() {
  const url = 'https://vibe-eight-iota.vercel.app/api/youtube/live?handle=SBSBiz2021&channelId=UCbMjg2EvXs_RUGW-KrdM3pw';
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log('Body:', text);
  } catch(e) {
    console.error(e);
  }
}
run();
