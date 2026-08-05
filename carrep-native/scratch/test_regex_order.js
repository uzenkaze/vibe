import https from 'https';

const channels = [
  { id: 'ytn', handle: 'ytnnews24' },
  { id: 'yonhap', handle: 'yonhapnewstv23' },
  { id: 'sbsbiz', handle: 'SBSBiz2021' },
  { id: 'ytn_science', handle: 'YTNSC' }
];

function fetchLiveId(ch) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/@${ch.handle}/live`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let videoId = null;
        
        // Prioritize "videoId":"..." pattern (usually inside ytInitialPlayerResponse or ytInitialData)
        // especially looking for the one with liveStreamability
        let match = data.match(/"liveStreamability".*?"videoId":"([a-zA-Z0-9_-]{11})"/);
        if (match?.[1]) {
          videoId = match[1];
          console.log(`[${ch.id}] Method 1 (liveStreamability): ${videoId}`);
        }
        
        if (!videoId) {
          match = data.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
          if (match?.[1]) {
            videoId = match[1];
            console.log(`[${ch.id}] Method 2 ("videoId"): ${videoId}`);
          }
        }
        
        if (!videoId) {
          match = data.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
          if (match?.[1]) {
            videoId = match[1];
            console.log(`[${ch.id}] Method 3 (watch?v=): ${videoId}`);
          }
        }
        
        resolve();
      });
    });
  });
}

async function main() {
  for (const ch of channels) {
    await fetchLiveId(ch);
  }
}

main();
