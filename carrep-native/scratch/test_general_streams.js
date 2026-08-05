import handler from '../api/stream-proxy.js';

class MockResponse {
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.body = null;
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
    if (content instanceof Buffer) {
      this.body = content;
      this.sentText = `[Buffer: ${content.length} bytes]`;
    } else {
      this.sentText = content;
    }
    return this;
  }
  
  json(obj) {
    this.body = obj;
    this.sentText = JSON.stringify(obj);
    return this;
  }
}

async function testProxy(targetUrl, label) {
  const req = {
    method: 'GET',
    query: { url: targetUrl },
    headers: {}
  };
  const res = new MockResponse();
  
  console.log(`Testing ${label} proxy URL: ${targetUrl}...`);
  try {
    await handler(req, res);
    console.log(`  Response Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log(`  Manifest Preview: ${res.sentText.substring(0, 200).replace(/\n/g, ' ')}`);
    } else {
      console.log(`  Error body:`, res.sentText);
    }
  } catch (e) {
    console.error(`  Handler Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function testJtbcApi() {
  console.log('Testing JTBC live API...');
  try {
    const res = await fetch('https://api.jtbc.co.kr/v1/onair', {
      headers: {
        'Origin': 'https://onair.jtbc.co.kr',
        'Referer': 'https://onair.jtbc.co.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    console.log(`  JTBC API Status: ${res.status}`);
    if (res.ok) {
      const data = await res.json();
      console.log(`  JTBC HD file:`, data.sources?.HLS?.HD?.file);
    }
  } catch(e) {
    console.error(`  JTBC API Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  // 1. YTN 사이언스 HLS
  await testProxy(
    'https://ytnscience-hls.gcdn.ntruss.com/ytnscience/ytnsciencehd/playlist.m3u8',
    'YTN 사이언스'
  );
  
  // 2. JTBC HLS (via API)
  await testJtbcApi();
  
  // 3. TV조선 HLS
  await testProxy(
    'https://tvchosun-hls.gcdn.ntruss.com/tvchosun/tvchosunhd/playlist.m3u8',
    'TV조선'
  );
  
  // 4. 채널A HLS
  await testProxy(
    'https://ichannela-hls.gcdn.ntruss.com/ichannela/ichannelahd/playlist.m3u8',
    '채널A'
  );
  
  // 5. MBN HLS
  await testProxy(
    'https://mbn-hls.gcdn.ntruss.com/mbn/mbnhd/playlist.m3u8',
    'MBN'
  );
}

run();
