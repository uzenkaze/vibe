const channelId = 'UCZdBJIbJz0P9xyFipgOj1fA'; // YTN 사이언스

async function testRedirect() {
  const url = `https://www.youtube.com/embed/live_stream?channel=${channelId}`;
  console.log(`Fetching embed URL with manual redirect tracking: ${url}...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      },
      redirect: 'manual' // Do not follow redirects automatically
    });
    
    console.log(`Response Status: ${res.status}`);
    console.log(`Response Headers:`, res.headers);
    const location = res.headers.get('location');
    console.log(`Redirect Location:`, location);
    
    if (location) {
      const match = location.match(/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        console.log(`SUCCESS! Extracted Video ID: ${match[1]}`);
      } else {
        const watchMatch = location.match(/watch\?v=([a-zA-Z0-9_-]{11})/);
        if (watchMatch) {
          console.log(`SUCCESS! Extracted Video ID: ${watchMatch[1]}`);
        } else {
          console.log(`Failed to extract Video ID from location: ${location}`);
        }
      }
    } else {
      // If no redirect, check if videoId is in the HTML body
      const html = await res.text();
      console.log(`HTML Length: ${html.length}`);
      const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
      console.log(`Extracted Video ID from body:`, videoIdMatch ? videoIdMatch[1] : 'Not found');
    }
  } catch (e) {
    console.error(e);
  }
}

testRedirect();
