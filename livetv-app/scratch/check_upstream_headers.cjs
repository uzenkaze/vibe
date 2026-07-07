const https = require('https');

const proxyKbsUrl = 'https://vibe-eight-iota.vercel.app/api/kbs?channel_code=11';

https.get(proxyKbsUrl, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      const streamUrl = data.channel_item?.find(i => i.service_url)?.service_url;
      console.log('Stream URL:', streamUrl);
      if (streamUrl) {
        https.get(streamUrl, (res2) => {
          console.log('Upstream Status:', res2.statusCode);
          console.log('Upstream Headers:', res2.headers);
        });
      }
    } catch(e) {
      console.error(e);
    }
  });
});
