async function checkInvidiousJson() {
  const channelId = 'UCsU-I-vHLiaMfV_ceaYz5rQ'; // JTBC
  const url = `https://inv.thepixora.com/api/v1/channels/${channelId}/videos`;
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Videos count:', data.videos ? data.videos.length : (Array.isArray(data) ? data.length : 'none'));
    const videos = data.videos || (Array.isArray(data) ? data : []);
    for (const v of videos.slice(0, 10)) {
      console.log(`VideoId: ${v.videoId} | Title: "${v.title}" | LiveNow: ${v.liveNow} | Length: ${v.lengthSeconds} | Type: ${v.type}`);
    }
  } catch(e) {
    console.error(e);
  }
}
checkInvidiousJson();
