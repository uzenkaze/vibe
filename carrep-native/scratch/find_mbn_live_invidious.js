async function findMbnLive() {
  const channelId = 'UCG9aFJTZ-lMCHAiO1KJsirg'; // MBN
  const searchUrl = `https://inv.thepixora.com/api/v1/search?q=live&channel=${channelId}`;
  
  try {
    const res = await fetch(searchUrl);
    console.log('Search Status:', res.status);
    const data = await res.json();
    const videos = Array.isArray(data) ? data : (data.videos || []);
    console.log(`Found ${videos.length} search results.`);
    
    // Check first 5 videos
    for (const v of videos.slice(0, 5)) {
      console.log(`Checking video: ${v.videoId} ("${v.title}")...`);
      try {
        const detailRes = await fetch(`https://inv.thepixora.com/api/v1/videos/${v.videoId}`);
        if (detailRes.ok) {
          const detailData = await detailRes.json();
          console.log(`  liveNow: ${detailData.liveNow} | lengthSeconds: ${detailData.lengthSeconds}`);
          if (detailData.liveNow) {
            console.log(`  -> FOUND ACTIVE LIVE STREAM: ${v.videoId}`);
            return;
          }
        }
      } catch(e) {
        console.error(`  Detail error:`, e.message);
      }
    }
    console.log('No active live stream found in search results.');
  } catch(e) {
    console.error(e);
  }
}
findMbnLive();
