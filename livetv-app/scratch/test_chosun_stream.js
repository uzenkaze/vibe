import handler from '../api/stream-proxy.js';

class MockResponse {
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.sentText = '';
  }
  
  status(code) {
    this.statusCode = code;
    return this;
  }
  
  setHeader(name, val) {
    this.headers[name] = val;
  }
  
  send(content) {
    this.sentText = content instanceof Buffer ? `[Buffer: ${content.length} bytes]` : content;
    return this;
  }
  
  json(obj) {
    this.sentText = JSON.stringify(obj);
    return this;
  }
}

async function run() {
  const targetUrl = 'http://onair.cdn.tvchosun.com/origin1/_definst_/tvchosun_s1/playlist.m3u8';
  console.log(`Checking TV조선 CDN stream direct fetch...`);
  try {
    const res = await fetch(targetUrl, { signal: AbortSignal.timeout(3000) });
    console.log(`  Direct Fetch Status: ${res.status}`);
  } catch(e) {
    console.log(`  Direct Fetch Failed:`, e.message);
  }

  console.log(`\nChecking TV조선 CDN stream via Local Stream Proxy...`);
  const req = {
    method: 'GET',
    query: { url: targetUrl },
    headers: {}
  };
  const res = new MockResponse();
  try {
    await handler(req, res);
    console.log(`  Proxy Status: ${res.statusCode}`);
    console.log(`  Proxy Response Preview:`, res.sentText.substring(0, 250).replace(/\n/g, ' '));
  } catch(e) {
    console.error(`  Proxy Handler Error:`, e.message);
  }
}

run();
