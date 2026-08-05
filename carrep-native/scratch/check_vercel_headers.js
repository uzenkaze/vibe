import https from 'https';

const url = `https://vibe-eight-iota.vercel.app/api/youtube/live?handle=SBSBiz2021&channelId=UCbMjg2EvXs_RUGW-KrdM3pw&cb=${Date.now()}`;

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:');
  for (const [key, value] of Object.entries(res.headers)) {
    console.log(`  ${key}: ${value}`);
  }
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Body:', body);
  });
});
