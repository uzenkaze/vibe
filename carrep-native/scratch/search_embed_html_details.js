async function inspectEmbed() {
  const liveVideoId = 'f5zI6QOt_1o'; // YTN Science live video
  const regularVideoId = 'pTqN3MX6XEk'; // Regular video
  
  async function search(videoId, label) {
    const url = `https://www.youtube.com/embed/${videoId}`;
    try {
      const res = await fetch(url);
      const html = await res.text();
      console.log(`\n=== ${label} (${videoId}) ===`);
      
      const keywords = [
        'isLive', 'liveStream', 'liveStreamability', 'liveNow', 'dvr', 
        'LIVE_DVR', 'isLiveDvr', 'hlsManifestUrl', 'dashManifestUrl', 
        'hlsvp', 'captionTracks', 'isPlayable'
      ];
      
      for (const kw of keywords) {
        const count = (html.match(new RegExp(kw, 'gi')) || []).length;
        console.log(`  "${kw}": ${count}`);
      }
      
      // Let's print occurrences of matches
      const hlsMatch = html.match(/"hlsManifestUrl":"(.*?)"/);
      console.log(`  hlsManifestUrl present:`, !!hlsMatch);
    } catch(e) {
      console.error(e);
    }
  }
  
  await search(liveVideoId, 'LIVE');
  await search(regularVideoId, 'REGULAR');
}
inspectEmbed();
