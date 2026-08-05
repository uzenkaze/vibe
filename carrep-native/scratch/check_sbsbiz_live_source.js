import https from 'https';

const url = 'https://www.youtube.com/@SBSBiz2021/live';
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
    console.log('Includes DglIMLKd878:', data.includes('DglIMLKd878'));
    console.log('Includes UCbMjg2EvXs_RUGW-KrdM3pw:', data.includes('UCbMjg2EvXs_RUGW-KrdM3pw'));
    const isLive = data.includes('"liveStreamability"');
    console.log('Has liveStreamability:', isLive);
    
    // Find where DglIMLKd878 is located in the HTML
    const idx = data.indexOf('DglIMLKd878');
    if (idx !== -1) {
      console.log('Snippet around DglIMLKd878:', data.substring(idx - 100, idx + 100).replace(/\s+/g, ' '));
    }
  });
});
