async function checkYtnLive() {
  const ytnVideoId = 'N319dW5ARFc'; // YTN 24h live stream video ID
  const url = `https://inv.thepixora.com/api/v1/videos/${ytnVideoId}`;
  try {
    const res = await fetch(url);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('YTN liveNow:', data.liveNow);
      console.log('YTN lengthSeconds:', data.lengthSeconds);
    }
  } catch(e) {
    console.error(e);
  }
}
checkYtnLive();
