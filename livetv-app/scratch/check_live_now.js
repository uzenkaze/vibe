async function checkLive(videoId, label) {
  const url = `https://inv.thepixora.com/api/v1/videos/${videoId}`;
  try {
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      console.log(`${label} (${videoId}): liveNow = ${data.liveNow}, lengthSeconds = ${data.lengthSeconds}`);
    } else {
      console.log(`${label} (${videoId}): Failed to fetch (${res.status})`);
    }
  } catch(e) {
    console.error(e);
  }
}

async function main() {
  await checkLive('f5zI6QOt_1o', 'YTN Science');
  await checkLive('A8vTwdm61AQ', 'YTN');
  await checkLive('E_SUvc-Tg-I', '연합뉴스TV');
}
main();
