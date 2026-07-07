import https from 'https';

const channels = [
  { id: 'ytn', channelId: 'UChlgI3UHCOnwUGzWzbJ3H5w' },
  { id: 'yonhap', channelId: 'UCTHCOPwqNfZ0uiKOvFyhGwg' },
  { id: 'sbsbiz', channelId: 'UCbMjg2EvXs_RUGW-KrdM3pw' },
  { id: 'ytn_science', channelId: 'UCZdBJIbJz0P9xyFipgOj1fA' }
];

function fetchRSS(ch) {
  return new Promise((resolve) => {
    https.get(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.channelId}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[${ch.id}] Status:`, res.statusCode);
        // Find all yt:videoId tags
        const regex = /<yt:videoId>(.*?)<\/yt:videoId>/g;
        let match;
        let ids = [];
        while ((match = regex.exec(data)) !== null) {
          ids.push(match[1]);
        }
        console.log(`  Video IDs in RSS:`, ids.join(', '));
        resolve();
      });
    }).on('error', () => {
      console.log(`[${ch.id}] failed to fetch`);
      resolve();
    });
  });
}

async function main() {
  for (const ch of channels) {
    await fetchRSS(ch);
  }
}

main();
