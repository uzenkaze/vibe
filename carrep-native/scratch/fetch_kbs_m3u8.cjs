const https = require('https');

// Get KBS1 stream URL
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
        // Fetch m3u8 content
        https.get(streamUrl, (res2) => {
          let m3u8 = '';
          res2.on('data', chunk => m3u8 += chunk);
          res2.on('end', () => {
            console.log('--- m3u8 Content ---');
            console.log(m3u8.substring(0, 800));
            
            // Extract unique hostnames from segment lines
            const hostnames = new Set();
            m3u8.split('\n').forEach(line => {
              line = line.trim();
              if (line && !line.startsWith('#') && line.startsWith('http')) {
                try {
                  hostnames.add(new URL(line).hostname);
                } catch(e) {}
              }
            });
            console.log('Segment hostnames:', Array.from(hostnames));
          });
        });
      }
    } catch(e) {
      console.error('Failed to parse KBS response:', e.message);
    }
  });
}).on('error', (err) => console.error(err));
