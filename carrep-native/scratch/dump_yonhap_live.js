const invidiousInstances = [
  'https://inv.thepixora.com',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be'
];

async function dumpYonhap() {
  const channelId = 'UCTHCOPwqNfZ0uiKOvFyhGwg'; // Yonhap News TV
  console.log(`Dumping live streams for Yonhap News TV (${channelId})...`);
  
  for (const instance of invidiousInstances) {
    try {
      const url = `${instance}/api/v1/search?q=live&channel=${channelId}`;
      console.log(`Trying ${instance}...`);
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        const videos = Array.isArray(data) ? data : (data.videos || []);
        console.log(`Found ${videos.length} videos:`);
        for (const v of videos) {
          console.log(`- VideoId: ${v.videoId}`);
          console.log(`  Title: ${v.title}`);
          console.log(`  LiveNow: ${v.liveNow}`);
          console.log(`  LengthSeconds: ${v.lengthSeconds}`);
        }
        return;
      }
    } catch(e) {
      console.warn(`Failed for ${instance}:`, e.message);
    }
  }
}

dumpYonhap();
