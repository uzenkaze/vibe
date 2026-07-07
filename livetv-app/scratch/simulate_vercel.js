import https from 'https';
import http from 'http';

function fetchUrl(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const lib = targetUrl.startsWith('https') ? https : http;
    const req = lib.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'identity',
        'Connection': 'keep-alive',
      },
      timeout: 8000,
    }, (res) => {
      console.log(`Redirect ${redirectCount}: URL=${targetUrl} Status=${res.statusCode}`);
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        console.log(`  Redirecting to: ${loc}`);
        if (loc) return resolve(fetchUrl(loc, redirectCount + 1));
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, finalUrl: targetUrl }));
    });
    req.on('error', reject);
  });
}

async function test() {
  try {
    const { html, finalUrl } = await fetchUrl('https://www.youtube.com/@SBSBiz2021/live');
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log('Final Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Final URL:', finalUrl);
  } catch (e) {
    console.error(e);
  }
}

test();
