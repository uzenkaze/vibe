import https from 'https';
import http from 'http';

function fetchUrlNatively(targetUrl, headers = {}) {
  return new Promise((resolve, reject) => {
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': targetUrl.includes('ichannela') ? 'https://ichannela.com/' : 'https://www.mbn.co.kr/',
        'Accept': '*/*',
        ...headers
      },
      timeout: 8000,
    }, (res) => {
      console.log(`[HTTP GET] ${targetUrl.substring(0, 60)} -> Status ${res.statusCode}`);
      if (res.statusCode === 200) {
        let data = '';
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ ok: true, text: data }));
      } else {
        resolve({ ok: false, status: res.statusCode });
      }
    });
    req.on('error', reject);
  });
}

async function run() {
  const channelAUrl = 'http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8';
  const mbnUrl = 'https://hls-live.mbn.co.kr/mbn-on-air/1000k/playlist.m3u8';

  console.log('Testing channel A with native http.get...');
  const resA = await fetchUrlNatively(channelAUrl);
  if (resA.ok) {
    console.log('[SUCCESS] Channel A content length:', resA.text.length);
    console.log(resA.text.substring(0, 100));
  } else {
    console.log('[FAIL] Channel A code:', resA.status);
  }

  console.log('\nTesting MBN with native https.get...');
  const resM = await fetchUrlNatively(mbnUrl);
  if (resM.ok) {
    console.log('[SUCCESS] MBN content length:', resM.text.length);
    console.log(resM.text.substring(0, 100));
  } else {
    console.log('[FAIL] MBN code:', resM.status);
  }
}

run();
