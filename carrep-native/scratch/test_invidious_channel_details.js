async function testChannelDetails() {
  const channelId = 'UCZdBJIbJz0P9xyFipgOj1fA'; // YTN Science
  const url = `https://inv.thepixora.com/api/v1/channels/${channelId}`;
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('Channel keys:', Object.keys(data));
      const videos = data.latestVideos || [];
      console.log('latestVideos count:', videos.length);
      for (const v of videos.slice(0, 10)) {
        console.log(`VideoId: ${v.videoId} | Title: "${v.title}" | LiveNow: ${v.liveNow} | Length: ${v.lengthSeconds}`);
      }
    }
  } catch(e) {
    console.error(e);
  }
}
testChannelDetails();
