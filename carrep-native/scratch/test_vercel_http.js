const proxyUrl = 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=http%3A%2F%2Fonair.cdn.tvchosun.com%2Forigin1%2F_definst_%2Ftvchosun_s1%2Fplaylist.m3u8';

async function testVercelHttp() {
  console.log(`Checking Vercel proxy with HTTP stream: ${proxyUrl}...`);
  try {
    const res = await fetch(proxyUrl);
    console.log(`Vercel Status: ${res.status}`);
    const text = await res.text();
    console.log(`Response Preview (first 200 chars):`, text.substring(0, 200).replace(/\n/g, ' '));
  } catch (e) {
    console.error(e);
  }
}

testVercelHttp();
