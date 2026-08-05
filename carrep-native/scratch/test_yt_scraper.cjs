const https = require('https');

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Fetching YTN current live video ID...');
    const ytn = await getJson('https://vibe-eight-iota.vercel.app/api/youtube/live?handle=ytnnews24');
    console.log('YTN Scraped videoId:', ytn.videoId);
    console.log('YTN Hardcoded videoId was: aZyD6EPl6KU');
    console.log('Is YTN hardcoded outdated?', ytn.videoId !== 'aZyD6EPl6KU');

    console.log('\nFetching Yonhap current live video ID...');
    const yonhap = await getJson('https://vibe-eight-iota.vercel.app/api/youtube/live?handle=yonhapnewstv23');
    console.log('Yonhap Scraped videoId:', yonhap.videoId);
    console.log('Yonhap Hardcoded videoId was: Hdw_2AlFCog');
    console.log('Is Yonhap hardcoded outdated?', yonhap.videoId !== 'Hdw_2AlFCog');

    console.log('\nFetching YTN Science current live video ID...');
    const science = await getJson('https://vibe-eight-iota.vercel.app/api/youtube/live?handle=YTNSCIENCE');
    console.log('YTN Science Scraped videoId:', science.videoId);
    console.log('YTN Science Hardcoded videoId was: L8MwdIz2Iw4');
    console.log('Is YTN Science hardcoded outdated?', science.videoId !== 'L8MwdIz2Iw4');

  } catch(e) {
    console.error('Error fetching live IDs:', e.message);
  }
}

run();
