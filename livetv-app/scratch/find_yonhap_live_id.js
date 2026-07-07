const instances = [
  'https://inv.tux.pizza',
  'https://invidious.nerdvpn.de',
  'https://invidious.slipfox.xyz',
  'https://invidious.privacydev.net',
  'https://inv.thepixora.com',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be'
];

async function run() {
  const channelId = 'UCTHCOPwqNfZ0uiKOvFyhGwg';
  console.log(`Searching active live videos for Yonhap News TV (${channelId})...`);
  
  for (const instance of instances) {
    try {
      const url = `${instance}/api/v1/search?q=live&channel=${channelId}`;
      console.log(`Checking ${instance}...`);
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const videos = Array.isArray(data) ? data : (data.videos || []);
        console.log(`Success! Found ${videos.length} videos from ${instance}:`);
        for (const v of videos) {
          console.log(`- [${v.videoId}] Title: "${v.title}" (LiveNow: ${v.liveNow})`);
        }
        return;
      }
    } catch(e) {
      console.log(`  Failed: ${e.message}`);
    }
  }
  console.log("All instances failed to return search results.");
}

run();
