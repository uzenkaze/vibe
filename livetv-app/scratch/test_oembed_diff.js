async function compareOembed() {
  const liveVideoId = 'f5zI6QOt_1o'; // Live video
  const regularVideoId = 'pTqN3MX6XEk'; // Regular video
  
  try {
    const resLive = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${liveVideoId}&format=json`);
    const liveData = await resLive.json();
    
    const resReg = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${regularVideoId}&format=json`);
    const regData = await resReg.json();
    
    console.log('LIVE Video oEmbed:');
    console.log(liveData);
    console.log('\nREGULAR Video oEmbed:');
    console.log(regData);
  } catch(e) {
    console.error(e);
  }
}
compareOembed();
