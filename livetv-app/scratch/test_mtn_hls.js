const directUrl = 'http://183.110.27.87/mtnlive/720/playlist.m3u8';
const proxyUrl = `https://vibe-eight-iota.vercel.app/api/stream-proxy?url=${encodeURIComponent(directUrl)}`;

async function run() {
  console.log(`Checking direct MTN: ${directUrl}...`);
  try {
    const res = await fetch(directUrl, { signal: AbortSignal.timeout(3000) });
    console.log(`  Direct Status: ${res.status}`);
    if (res.ok) console.log('  Direct Success (m3u8 retrieved)');
  } catch(e) {
    console.error(`  Direct Error:`, e.message);
  }
  
  console.log(`Checking proxied MTN: ${proxyUrl}...`);
  try {
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(4000) });
    console.log(`  Proxy Status: ${res.status}`);
    if (res.ok) {
      const text = await res.text();
      console.log('  Proxy Success, manifest first 100 chars:', text.substring(0, 100).replace(/\n/g, ' '));
    }
  } catch(e) {
    console.error(`  Proxy Error:`, e.message);
  }
}
run();
