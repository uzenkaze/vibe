const http = require('http');

const url = 'http://localhost:5174/api/rss?channelId=UCsJ6RuBi65JHJkZYO1MECIA';

http.get(url, (res) => {
  let data = '';
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Data Length: ${data.length} bytes`);
    console.log(`Sample Data:\n`, data.substring(0, 500));
  });
}).on('error', (err) => {
  console.error('Error fetching from proxy:', err.message);
});
