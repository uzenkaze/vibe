async function testSearch() {
  const channelId = 'UChlgI3UHCOnwUGzWzbJ3H5w'; // YTN
  const url = `https://inv.thepixora.com/api/v1/search?q=live&channel=${channelId}`;
  try {
    const res = await fetch(url);
    console.log('Search Status:', res.status);
    const data = await res.json();
    const videos = Array.isArray(data) ? data : (data.videos || []);
    console.log('Search results count:', videos.length);
    for (const v of videos.slice(0, 10)) {
      console.log(`VideoId: ${v.videoId} | Title: "${v.title}" | LiveNow: ${v.liveNow} | Length: ${v.lengthSeconds} | Type: ${v.type}`);
    }
  } catch(e) {
    console.error(e);
  }
}
testSearch();
