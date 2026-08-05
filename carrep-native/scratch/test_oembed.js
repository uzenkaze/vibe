async function testOembed() {
  const liveVideoId = 'f5zI6QOt_1o'; // YTN Science live video ID
  const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${liveVideoId}&format=json`;
  try {
    const res = await fetch(url);
    console.log('oEmbed Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      console.log('oEmbed Data:', data);
    } else {
      console.log('oEmbed Error:', await res.text());
    }
  } catch(e) {
    console.error(e);
  }
}
testOembed();
