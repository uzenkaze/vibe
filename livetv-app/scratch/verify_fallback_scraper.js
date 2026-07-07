import handler from '../api/youtube/live.js';

class MockResponse {
  constructor() {
    this.headers = {};
    this.statusCode = 200;
    this.sentBody = null;
  }
  
  status(code) {
    this.statusCode = code;
    return this;
  }
  
  setHeader(name, val) {
    this.headers[name] = val;
  }
  
  send(content) {
    this.sentBody = content;
    return this;
  }
  
  json(obj) {
    this.sentBody = obj;
    return this;
  }
}

async function testScraper(handle, channelId, label) {
  console.log(`[TEST] Scraper for ${label} (@${handle}, ID: ${channelId})...`);
  const req = {
    method: 'GET',
    query: { handle, channelId }
  };
  const res = new MockResponse();
  
  try {
    await handler(req, res);
    console.log(`  Status: ${res.statusCode}`);
    console.log(`  Response:`, res.sentBody);
  } catch(e) {
    console.error(`  Handler threw error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  console.log('--- STARTING BACKEND SCRAPER VERIFICATION ---\n');
  
  // YTN Science (known to be in RSS and scrapeable)
  await testScraper('YTNSC', 'UCZdBJIbJz0P9xyFipgOj1fA', 'YTN 사이언스');
  
  // MBN (highly frequent uploads, should trigger Invidious search fallback)
  await testScraper('mbn', 'UCG9aFJTZ-lMCHAiO1KJsirg', 'MBN');
  
  // YTN
  await testScraper('ytnnews24', 'UChlgI3UHCOnwUGzWzbJ3H5w', 'YTN');

  // 연합뉴스TV
  await testScraper('yonhapnewstv23', 'UCTHCOPwqNfZ0uiKOvFyhGwg', '연합뉴스TV');

  // JTBC
  await testScraper('jtbc_news', 'UCsU-I-vHLiaMfV_ceaYz5rQ', 'JTBC');

  // SBS Biz
  await testScraper('SBSBiz2021', 'UCbMjg2EvXs_RUGW-KrdM3pw', 'SBS Biz');

  // 매일경제TV
  await testScraper('MKeconomy_TV', 'UCnfwIKyFYRuqZzzKBDt6JOA', '매일경제TV');

  // MTN 머니투데이
  await testScraper('mtn', 'UCaQREsefLy-W8ruWcJ7IDtg', 'MTN 머니투데이');

  console.log('\n--- VERIFICATION COMPLETED ---');
}

run();
