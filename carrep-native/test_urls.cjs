const https = require('https');
const http = require('http');

const urls = [
  'http://onair2.cdn.tvchosun.com/origin2/_definst_/tvchosun_s3/playlist.m3u8',
  'http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8',
  'https://mbn-live.akamaized.net/hls/live/2039235/mbn/playlist.m3u8',
  'https://jtbc-hls.gcdn.ntruss.com/jtbc/jtbc_1080p/playlist.m3u8',
  'https://live-amagi.jtbc.co.kr/playlist.m3u8',
  'http://202.60.106.14:8080/214/playlist.m3u8',
  'https://yonhapnewstv.akamaized.net/hls/live/2039234/yonhapnewstv/playlist.m3u8',
  'https://ytn-live.akamaized.net/hls/live/2038573/ytn/playlist.m3u8',
  'https://ca-live.akamaized.net/hls/live/2039230/ca/playlist.m3u8',
  'https://tvchosun-live.akamaized.net/hls/live/2039304/tvchosun/playlist.m3u8'
];

urls.forEach(u => {
  const reqUrl = new URL(u);
  const client = reqUrl.protocol === 'https:' ? https : http;
  const req = client.get(u, { timeout: 3000 }, (res) => {
    console.log(u, '=>', res.statusCode);
  }).on('error', err => {
    console.log(u, '=> Error:', err.message);
  });
});
