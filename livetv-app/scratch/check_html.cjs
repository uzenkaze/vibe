const https = require('https');

const urls = [
  'https://vibe-eight-iota.vercel.app/index.html',
  'https://livetv-ijfiy4n24-uzenkazes-projects.vercel.app/index.html'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      console.log(`URL: ${url}`);
      console.log(`  HTML Length: ${html.length} bytes`);
      // Find script tags
      const scriptRegex = /src="([^"]+)"/g;
      let match;
      const scripts = [];
      while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
      }
      console.log(`  Scripts:`, scripts);
    });
  }).on('error', (err) => console.error(url, err));
});
