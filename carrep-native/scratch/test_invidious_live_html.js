async function testInvidiousLiveHtml() {
  const channelId = 'UChlgI3UHCOnwUGzWzbJ3H5w'; // YTN
  const url = `https://inv.thepixora.com/channel/${channelId}/live`;
  
  try {
    const res = await fetch(url, {
      redirect: 'manual'
    });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    if (res.status === 302 || res.status === 301 || res.status === 307) {
      console.log('Redirect location:', res.headers.get('location'));
    } else {
      const html = await res.text();
      console.log('HTML length:', html.length);
      console.log('HTML Preview (first 1000 chars):');
      console.log(html.substring(0, 1000));
      
      // Look for videoId
      const match = html.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
      console.log('Found video ID match:', match ? match[1] : 'none');
    }
  } catch(e) {
    console.error(e);
  }
}
testInvidiousLiveHtml();
