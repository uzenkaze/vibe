const url = 'https://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8';
const referer = 'http://broadcast.tvchosun.com/';

async function checkCors() {
  console.log(`Checking CORS headers for HTTPS: ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': referer,
        'Origin': 'https://vibe-eight-iota.vercel.app'
      }
    });
    
    console.log(`Status: ${res.status}`);
    console.log('Access-Control-Allow-Origin:', res.headers.get('access-control-allow-origin'));
    console.log('Cache-Control:', res.headers.get('cache-control'));
  } catch (e) {
    console.error(e);
  }
}

checkCors();
