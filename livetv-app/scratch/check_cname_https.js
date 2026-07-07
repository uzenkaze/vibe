const url = 'https://cvcgrwsd8291.edge.naverncp.com/origin1/_definst_/tvchosun_s1/playlist.m3u8';
const referer = 'http://broadcast.tvchosun.com/';

async function checkCors() {
  console.log(`Checking CORS headers for: ${url}...`);
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
    if (res.ok) {
      const text = await res.text();
      console.log('Manifest (first 100 chars):', text.substring(0, 100).replace(/\n/g, ' '));
    }
  } catch (e) {
    console.error(e);
  }
}

checkCors();
