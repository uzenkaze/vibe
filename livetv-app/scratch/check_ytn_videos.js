

const invidiousInstances = [
  'https://inv.thepixora.com',
  'https://invidious.projectsegfau.lt',
  'https://yewtu.be'
];

async function checkVideo(videoId, label) {
  console.log(`\n=== Checking Video ${label} (${videoId}) ===`);
  for (const instance of invidiousInstances) {
    try {
      const url = `${instance}/api/v1/videos/${videoId}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        console.log(`  Instance: ${instance}`);
        console.log(`  Title: ${data.title}`);
        console.log(`  LiveNow: ${data.liveNow}`);
        console.log(`  LengthSeconds: ${data.lengthSeconds}`);
        console.log(`  Author: ${data.author}`);
        return;
      } else {
        console.warn(`  Instance ${instance} returned status ${res.status}`);
      }
    } catch (e) {
      console.warn(`  Instance ${instance} failed:`, e.message);
    }
  }
}

async function run() {
  // User's video ID
  await checkVideo('aZyD6EPl6KU', '사용자가 제시한 YTN 라이브');
  // Scraper's video ID
  await checkVideo('A8vTwdm61AQ', '스크래퍼가 가져온 YTN 라이브');
}

run();
