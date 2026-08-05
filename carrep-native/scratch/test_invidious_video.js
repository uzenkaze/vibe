async function testInvidiousVideo() {
  const liveVideoId = 'f5zI6QOt_1o'; // YTN Science live video
  const regularVideoId = 'pTqN3MX6XEk'; // Regular video
  
  try {
    const resLive = await fetch(`https://inv.thepixora.com/api/v1/videos/${liveVideoId}`);
    console.log('Live status:', resLive.status);
    if (resLive.ok) {
      const data = await resLive.json();
      console.log('Live video properties:');
      console.log(`  title: "${data.title}"`);
      console.log(`  liveNow: ${data.liveNow}`);
      console.log(`  isLive: ${data.isLive}`);
      console.log(`  lengthSeconds: ${data.lengthSeconds}`);
    }
    
    const resReg = await fetch(`https://inv.thepixora.com/api/v1/videos/${regularVideoId}`);
    console.log('Regular status:', resReg.status);
    if (resReg.ok) {
      const data = await resReg.json();
      console.log('Regular video properties:');
      console.log(`  title: "${data.title}"`);
      console.log(`  liveNow: ${data.liveNow}`);
      console.log(`  isLive: ${data.isLive}`);
      console.log(`  lengthSeconds: ${data.lengthSeconds}`);
    }
  } catch(e) {
    console.error(e);
  }
}
testInvidiousVideo();
