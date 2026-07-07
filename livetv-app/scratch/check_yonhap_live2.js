async function run() {
  const videoId = '6QZ_qc75ihU';
  const url = `https://www.youtube.com/watch?v=\${videoId}`;
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
      console.log(`HTML Snippet (First 1000 chars):\n`, html.substring(0, 1000));
      const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';
      console.log(`Title: ${title}`);
      console.log(`IsLive: ${isLive}`);
      
      const snippetIdx = html.indexOf('isLive');
      if (snippetIdx !== -1) {
        const isLiveSnippet = html.substring(snippetIdx - 100, snippetIdx + 200);
        console.log(`Snippet around 'isLive':\n`, isLiveSnippet);
      }
    } else {
      console.log(`Fetch failed: ${res.status}`);
    }
  } catch(e) {
    console.error(e);
  }
}

run();
