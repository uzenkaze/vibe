import https from 'https';
import http from 'http';

// A helper to make HTTP requests
function request(url, headers = {}) {
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        ...headers
      },
      timeout: 5000
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    }).on('error', (err) => {
      resolve({ status: 500, error: err.message });
    });
  });
}

async function testKbsApi(code) {
  const url = `https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${code}?_=${Date.now()}`;
  const res = await request(url);
  try {
    const json = JSON.parse(res.data);
    const serviceUrl = json.channel_item?.find(i => i.service_url)?.service_url;
    return serviceUrl ? `OK (${serviceUrl.split('?')[0]})` : 'FAILED (No URL)';
  } catch (e) {
    return `FAILED (${e.message})`;
  }
}

async function testJtbcApi() {
  const url = `https://api.jtbc.co.kr/v1/onair`;
  const res = await request(url, { 'Referer': 'https://onair.jtbc.co.kr/', 'Origin': 'https://onair.jtbc.co.kr' });
  try {
    const json = JSON.parse(res.data);
    const serviceUrl = json.sources?.HLS?.HD?.file;
    return serviceUrl ? `OK (${serviceUrl.split('?')[0]})` : 'FAILED (No URL)';
  } catch (e) {
    return `FAILED (${e.message})`;
  }
}

async function testYtScraper(handle) {
  const url = `https://vibe-eight-iota.vercel.app/api/youtube/live?handle=${handle}`;
  const res = await request(url);
  try {
    const json = JSON.parse(res.data);
    return json.ok && json.videoId ? `OK (videoId: ${json.videoId})` : `FAILED (${res.data})`;
  } catch (e) {
    return `FAILED (${e.message})`;
  }
}

async function testHlsStream(url) {
  const res = await request(url);
  if (res.status === 200) {
    if (res.data?.includes('#EXTM3U')) return 'OK (Valid HLS Playlist)';
    return 'OK (HLS segment or raw file)';
  }
  return `FAILED (HTTP ${res.status})`;
}

async function runTests() {
  console.log('--- STARTING PROGRAMMATIC TV CHANNEL DIAGNOSTICS ---\n');

  console.log('[KBS Dynamic API Channels]');
  console.log('  KBS 1TV (Code 11):', await testKbsApi('11'));
  console.log('  KBS 2TV (Code 12):', await testKbsApi('12'));
  console.log('  KBS24 (Code 81):  ', await testKbsApi('81'));
  console.log('  KBS Joy (Code N92):', await testKbsApi('N92'));
  console.log('  KBS Drama (Code N91):', await testKbsApi('N91'));

  console.log('\n[JTBC Dynamic API Channel]');
  console.log('  JTBC OnAir API:    ', await testJtbcApi());

  console.log('\n[YouTube Live Scrapers]');
  console.log('  YTN (@ytnnews24):     ', await testYtScraper('ytnnews24'));
  console.log('  연합뉴스TV (@yonhapnewstv23):', await testYtScraper('yonhapnewstv23'));
  console.log('  SBS Biz (@SBSBiz2021): ', await testYtScraper('SBSBiz2021'));
  console.log('  YTN 사이언스 (@YTNSC):  ', await testYtScraper('YTNSC'));
  console.log('  매일경제TV (@MKeconomy_TV):', await testYtScraper('MKeconomy_TV'));
  console.log('  MTN 머니투데이 (@mtn):   ', await testYtScraper('mtn'));

  console.log('\n[Public HLS Streams (CORS Checks)]');
  console.log('  MBC (Taejeon):   ', await testHlsStream('https://ns1.tjmbc.co.kr/live/myStream.sdp/playlist.m3u8'));
  console.log('  SBS (KNN):       ', await testHlsStream('https://stream1.knn.co.kr/hls/9ly4534y7dm2xfa123r2_tv/index.m3u8'));
  console.log('  EBS 1:           ', await testHlsStream('https://ebsonair.ebs.co.kr/ebs1familypc/familypc1m/playlist.m3u8'));
  console.log('  TV조선 HLS:      ', await testHlsStream('https://tvchosun-hls.gcdn.ntruss.com/tvchosun/tvchosunhd/playlist.m3u8'));
  console.log('  채널A HLS:       ', await testHlsStream('https://ichannela-hls.gcdn.ntruss.com/ichannela/ichannelahd/playlist.m3u8'));
  console.log('  MBN HLS:         ', await testHlsStream('https://mbn-hls.gcdn.ntruss.com/mbn/mbnhd/playlist.m3u8'));
  console.log('  MBC every1 HLS:  ', await testHlsStream('https://live2.mbcmpp.co.kr/etc2/_definst_/every1/playlist.m3u8'));

  console.log('\n--- DIAGNOSTICS COMPLETED ---');
}

runTests();
