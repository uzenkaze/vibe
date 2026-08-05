const https = require('https');
const { URL } = require('url');

const url = 'https://vibe-eight-iota.vercel.app/index.html';

https.get(url, (res) => {
  let html = '';
  res.on('data', chunk => html += chunk);
  res.on('end', () => {
    console.log('--- HTML Length:', html.length);
    
    // Find script tags
    const scriptRegex = /src="([^"]+)"/g;
    let match;
    const scripts = [];
    while ((match = scriptRegex.exec(html)) !== null) {
      scripts.push(match[1]);
    }
    console.log('Found script tags:', scripts);

    // Let's find any script tag containing main or source
    const mainScript = scripts.find(s => s.includes('main') || s.includes('src/main.js'));
    if (mainScript) {
      const scriptUrl = new URL(mainScript, url).href;
      console.log('Fetching main script URL:', scriptUrl);
      https.get(scriptUrl, (res2) => {
        let js = '';
        res2.on('data', chunk => js += chunk);
        res2.on('end', () => {
          console.log('--- JS Length:', js.length);
          const hasFix = js.includes('getVercelStreamProxy') || js.includes('isLocal && !isCapacitor') || js.includes('isCapacitor');
          console.log('Has fix code inside deployed JS:', hasFix);
          
          // Print snippet
          const idx = js.indexOf('getVercelStreamProxy');
          if (idx !== -1) {
            console.log('Snippet:\n', js.substring(idx, idx + 300));
          } else {
            console.log('getVercelStreamProxy not found');
            // Maybe it is minified? Let's check for some signature
            console.log('Checking for capacitor check...');
            const hasCap = js.includes('capacitor') || js.includes('Capacitor');
            console.log('Has capacitor:', hasCap);
          }
        });
      });
    } else {
      console.log('Could not find main script.');
    }
  });
}).on('error', (err) => console.error(err));
