const https = require('https');

const url = 'https://livetv-ijfiy4n24-uzenkazes-projects.vercel.app/index.html';

https.get(url, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log(html.substring(0, 1000));
  });
}).on('error', (err) => console.error(err));
