import https from 'https';

async function testRss(name, channelId) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`[${name}] Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          const titleMatch = data.match(/<title>(.*?)<\/title>/);
          console.log(`  Title: ${titleMatch ? titleMatch[1] : 'Unknown'}`);
          const videoIdMatch = data.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
          console.log(`  First Video ID: ${videoIdMatch ? videoIdMatch[1] : 'None'}`);
        } else {
          console.log(`  URL: ${url}`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`[${name}] Error: ${err.message}`);
      resolve();
    });
  });
}

async function main() {
  // Try with the UC IDs we have
  await testRss('YTN', 'UChlgI3UHCOnwUGzWzbJ3H5w');
  await testRss('Yonhap', 'UCTHCOPwqNfZ0uiKOvFyhGwg');
  await testRss('SBS Biz', 'UCbMjg2EvXs_RUGW-KrdM3pw');
  await testRss('YTN Science', 'UCZdBJIbJz0P9xyFipgOj1fA');
}

main();
