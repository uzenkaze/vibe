const https = require('https');

const urls = [
  'https://vibe-eight-iota.vercel.app/assets/main-onRFHVPJ.js',
  'https://livetv-app-teal.vercel.app/assets/main-onRFHVPJ.js'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let js = '';
    res.on('data', chunk => js += chunk);
    res.on('end', () => {
      console.log(`URL: ${url}`);
      // Find where stream-proxy is and print the surrounding characters
      const idx = js.indexOf('stream-proxy');
      if (idx !== -1) {
        console.log('Context:', js.substring(idx - 150, idx + 100));
      } else {
        console.log('stream-proxy not found');
      }
    });
  }).on('error', (err) => console.error(url, err));
});
