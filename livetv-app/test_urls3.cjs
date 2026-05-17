const https = require('https');

const urls = [
  'https://ythls.armelin.one/channel/UCnEf8KmOPMIbB0saJPMvA7A.m3u8',
  'https://ythls.armelin.one/channel/UCsJ6RuBiGBq6CmSGsajv2EA.m3u8'
];

urls.forEach(u => {
  https.get(u, { timeout: 3000 }, (res) => {
    console.log(u, '=>', res.statusCode);
  }).on('error', err => {
    console.log(u, '=> Error:', err.message);
  });
});
