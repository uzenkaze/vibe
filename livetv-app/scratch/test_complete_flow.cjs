const https = require('https');

function getUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: Buffer.concat(data)
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  try {
    console.log('Step 1: Fetching KBS API through proxy...');
    const step1 = await getUrl('https://vibe-eight-iota.vercel.app/api/kbs?channel_code=11');
    console.log('  Status:', step1.statusCode);
    const data = JSON.parse(step1.body.toString());
    const streamUrl = data.channel_item?.find(i => i.service_url)?.service_url;
    console.log('  Stream URL:', streamUrl);
    
    if (!streamUrl) {
      console.log('  Error: streamUrl is empty!');
      return;
    }

    console.log('\nStep 2: Fetching the proxied m3u8 manifest...');
    const proxiedManifestUrl = 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=' + encodeURIComponent(streamUrl);
    console.log('  Proxy URL:', proxiedManifestUrl);
    const step2 = await getUrl(proxiedManifestUrl);
    console.log('  Status:', step2.statusCode);
    const manifestText = step2.body.toString();
    console.log('  Manifest Length:', manifestText.length);
    console.log('  Manifest Content Snippet:');
    console.log(manifestText.substring(0, 500));

    // Extract proxied key URL and segment URL
    const lines = manifestText.split('\n').map(l => l.trim());
    
    let keyUrl = null;
    const keyLine = lines.find(l => l.startsWith('#EXT-X-KEY:'));
    if (keyLine) {
      const match = keyLine.match(/URI="([^"]+)"/);
      if (match) {
        keyUrl = match[1];
      }
    }
    console.log('\nFound Key URL in manifest:', keyUrl);

    let segmentUrl = lines.find(l => l.startsWith('/api/stream-proxy?url='));
    console.log('Found Segment URL in manifest:', segmentUrl);

    if (keyUrl) {
      console.log('\nStep 3: Fetching the AES decryption key...');
      // Resolve relative path if needed
      const fullKeyUrl = keyUrl.startsWith('http') ? keyUrl : 'https://vibe-eight-iota.vercel.app' + keyUrl;
      console.log('  Fetching from:', fullKeyUrl);
      const step3 = await getUrl(fullKeyUrl);
      console.log('  Status:', step3.statusCode);
      console.log('  Headers:', step3.headers);
      console.log('  Key Length:', step3.body.length);
    }

    if (segmentUrl) {
      console.log('\nStep 4: Fetching the first video segment...');
      const fullSegmentUrl = 'https://vibe-eight-iota.vercel.app' + segmentUrl;
      console.log('  Fetching from:', fullSegmentUrl.substring(0, 120) + '...');
      const step4 = await getUrl(fullSegmentUrl);
      console.log('  Status:', step4.statusCode);
      console.log('  Headers:', step4.headers);
      console.log('  Segment Length:', step4.body.length);
    }

  } catch (err) {
    console.error('Error during flow test:', err);
  }
}

run();
