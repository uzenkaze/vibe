const url = 'http://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8';

async function checkReferer() {
  console.log(`Checking HTTP stream without Referer: ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
        // No Referer header!
      }
    });
    console.log(`Status: ${res.status}`);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
  } catch (e) {
    console.error(e);
  }
}

checkReferer();
