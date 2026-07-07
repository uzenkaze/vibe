import https from 'https';

function fetchWithCookie(useCookie) {
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    };
    if (useCookie) {
      headers['Cookie'] = 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916';
    }
    
    https.get('https://www.youtube.com/@YTNSC/live', { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        const hasLive = data.includes('"liveStreamability"');
        console.log(`UseCookie: ${useCookie}`);
        console.log(`  Title: ${titleMatch ? titleMatch[1] : 'Not found'}`);
        console.log(`  Has Live stream info: ${hasLive}`);
        resolve();
      });
    });
  });
}

async function main() {
  await fetchWithCookie(false);
  await fetchWithCookie(true);
}

main();
