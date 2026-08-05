const https = require('https');

const urls = [
  'https://vibe-50egur0yr-uzenkazes-projects.vercel.app/index.html',
  'https://vibe-eight-iota.vercel.app/index.html'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let html = '';
    res.on('data', chunk => html += chunk);
    res.on('end', () => {
      console.log(`URL: ${url}`);
      console.log(`  HTML Length: ${html.length} bytes`);
      
      const scriptRegex = /src="([^"]+)"/g;
      let match;
      const scripts = [];
      while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
      }
      console.log(`  Scripts:`, scripts);
      
      // Fetch the main script and check if it contains the fix
      const mainScript = scripts.find(s => s.includes('main'));
      if (mainScript) {
        const scriptUrl = new URL(mainScript, url).href;
        https.get(scriptUrl, (res2) => {
          let js = '';
          res2.on('data', chunk => js += chunk);
          res2.on('end', () => {
            console.log(`  JS URL: ${scriptUrl}`);
            console.log(`    JS Length: ${js.length} bytes`);
            
            // Check for key components of the fix
            const hasRegional = js.includes('icn1') || js.includes('api-proxy'); // Wait, icn1 is in vercel.json, not JS.
            const hasProxyUrlCheck = js.includes('stream-proxy?url=');
            const hasLocalCheck = js.includes('localhost') && js.includes('capacitor');
            
            // Find context
            const idx = js.indexOf('stream-proxy');
            let context = 'not found';
            if (idx !== -1) {
              context = js.substring(idx - 100, idx + 100);
            }
            
            console.log(`    Has proxy URL check: ${hasProxyUrlCheck}`);
            console.log(`    Has local check: ${hasLocalCheck}`);
            console.log(`    Context: ${context}`);
          });
        });
      }
    });
  }).on('error', (err) => console.error(url, err));
});
