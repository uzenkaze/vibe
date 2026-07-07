const endpoints = [
  { name: 'YTN 사이언스 HLS', url: 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=https%3A%2F%2Fytnscience-hls.gcdn.ntruss.com%2Fytnscience%2Fytnsciencehd%2Fplaylist.m3u8' },
  { name: 'JTBC On-air API', url: 'https://vibe-eight-iota.vercel.app/api/jtbc' },
  { name: 'TV조선 HLS', url: 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=https%3A%2F%2Ftvchosun-hls.gcdn.ntruss.com%2Ftvchosun%2Ftvchosunhd%2Fplaylist.m3u8' },
  { name: '채널A HLS', url: 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=https%3A%2F%2Fichannela-hls.gcdn.ntruss.com%2Fichannela%2Fichannelahd%2Fplaylist.m3u8' },
  { name: 'MBN HLS', url: 'https://vibe-eight-iota.vercel.app/api/stream-proxy?url=https%3A%2F%2Fmbn-hls.gcdn.ntruss.com%2Fmbn%2Fmbnhd%2Fplaylist.m3u8' }
];

async function run() {
  for (const ep of endpoints) {
    console.log(`Checking ${ep.name}...`);
    try {
      const res = await fetch(ep.url);
      console.log(`  Vercel Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`  Response Preview (first 200 chars):`, text.substring(0, 200).replace(/\n/g, ' '));
      } else {
        const errText = await res.text();
        console.log(`  Error body:`, errText);
      }
    } catch(e) {
      console.error(`  Fetch error:`, e.message);
    }
    console.log('----------------------------------------------------');
  }
}

run();
