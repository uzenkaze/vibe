import https from 'https';

function fetchUrl(targetUrl, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    https.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
      },
      timeout: 8000,
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        const loc = res.headers.location;
        if (loc) {
          const absoluteUrl = loc.startsWith('http') ? loc : new URL(loc, targetUrl).toString();
          return resolve(fetchUrl(absoluteUrl, redirectCount + 1));
        }
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, html: data, url: targetUrl }));
    }).on('error', reject);
  });
}

async function main() {
  try {
    const res = await fetchUrl('https://www.youtube.com/@SBSnews8/live');
    console.log('Final URL:', res.url);
    console.log('Status Code:', res.status);
    const titleMatch = res.html.match(/<title>(.*?)<\/title>/);
    console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Includes "sbsnews8" (lowercase):', res.html.toLowerCase().includes('sbsnews8'));
    console.log('Includes "sbs" (lowercase):', res.html.toLowerCase().includes('sbs'));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

main();
