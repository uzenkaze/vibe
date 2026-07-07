import https from 'https';

function inspect(useCookie) {
  return new Promise((resolve) => {
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
    };
    if (useCookie) {
      headers['Cookie'] = 'SOCS=CAESEwgDEgk0ODE3Nzk3MjQaAmtvIAEaBgiA_K2bBg; CONSENT=YES+cb.20210328-17-p0.en+FX+916';
    }

    https.get('https://www.youtube.com/@YTNSC/live', { headers, timeout: 6000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const titleMatch = data.match(/<title>(.*?)<\/title>/);
        console.log(`\n--- UseCookie: ${useCookie} (Status: ${res.statusCode}) ---`);
        console.log(`Title: ${titleMatch ? titleMatch[1] : 'Not found'}`);
        
        const isLiveRedirect = data.includes('"liveStreamability"');
        console.log(`Has liveStreamability: ${isLiveRedirect}`);
        
        // Find all unique videoIds
        const videoIds = [];
        const regex = /"videoId":"([a-zA-Z0-9_-]{11})"/g;
        let match;
        while ((match = regex.exec(data)) !== null) {
          if (!videoIds.includes(match[1])) {
            videoIds.push(match[1]);
          }
        }
        console.log(`Found Video IDs:`, videoIds.slice(0, 15));

        // Find watch?v= links
        const watchIds = [];
        const watchRegex = /watch\?v=([a-zA-Z0-9_-]{11})/g;
        while ((match = watchRegex.exec(data)) !== null) {
          if (!watchIds.includes(match[1])) {
            watchIds.push(match[1]);
          }
        }
        console.log(`Found watch?v= IDs:`, watchIds.slice(0, 15));

        // Print segment of liveStreamability if found
        const liveMatch = data.match(/"liveStreamability"[\s\S]*?"videoId":"([a-zA-Z0-9_-]{11})"/);
        console.log(`liveStreamability videoId:`, liveMatch ? liveMatch[1] : 'Not found');

        resolve();
      });
    }).on('error', (err) => {
      console.log(`Error with useCookie=${useCookie}: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  await inspect(false);
  await inspect(true);
}

main();
