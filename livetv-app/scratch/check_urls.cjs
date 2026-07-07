const https = require('https');

const urls = [
  'https://livetv-ijfiy4n24-uzenkazes-projects.vercel.app/assets/main-onRFHVPJ.js',
  'https://vibe-eight-iota.vercel.app/assets/main-onRFHVPJ.js',
  'https://livetv-app-teal.vercel.app/assets/main-onRFHVPJ.js'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let js = '';
    res.on('data', chunk => js += chunk);
    res.on('end', () => {
      console.log(`URL: ${url}`);
      console.log(`  Length: ${js.length} bytes`);
      console.log(`  Has fix: ${js.includes('isLocal && !isCapacitor') || js.includes('stream-proxy?url=')}`);
    });
  }).on('error', (err) => console.error(url, err));
});
