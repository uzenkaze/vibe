const http = require('http');
http.get('http://channelalive.ktcdn.co.kr/chalivepc/_definst_/atv2/playlist.m3u8', { headers: { 'Referer': 'https://www.ichannela.com/' } }, res => {
  console.log('Channel A =>', res.statusCode);
});
