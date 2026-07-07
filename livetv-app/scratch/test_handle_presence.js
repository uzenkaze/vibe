import https from 'https';

const handles = [
  'ytnnews24',
  'yonhapnewstv23',
  'SBSBiz2021',
  'YTNSC',
  'MKeconomy_TV',
  'mtn',
  'MBCNEWS',
  'SBSnews8',
  'kbs1tv',
  'kbs2tv',
  'jtbc_news',
  'tvchosunnews',
  'channelA-news',
  'mbn'
];

function checkHandle(handle) {
  return new Promise((resolve) => {
    const url = `https://www.youtube.com/@${handle}/live`;
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Cookie': 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916',
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const lowerHtml = data.toLowerCase();
        const lowerHandle = handle.toLowerCase();
        const hasHandle = lowerHtml.includes(lowerHandle);
        console.log(`[${handle}] Has handle in HTML: ${hasHandle}`);
        resolve();
      });
    }).on('error', () => {
      console.log(`[${handle}] Fetch error`);
      resolve();
    });
  });
}

async function main() {
  for (const h of handles) {
    await checkHandle(h);
  }
}

main();
