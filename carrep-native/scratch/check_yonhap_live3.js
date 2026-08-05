async function run() {
  const videoId = '70f_RXPO3p4';
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  console.log(`Checking ${videoId} directly...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    if (res.ok) {
      const html = await res.text();
      const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';
      console.log(`Title: ${title}`);
      console.log(`IsLive: ${isLive}`);
    } else {
      console.log(`Fetch failed: ${res.status}`);
    }
  } catch(e) {
    console.error(e);
  }
}

run();
