const fs = require('fs');

async function testFetch() {
  const url = `https://www.youtube.com/results?search_query=아이브`;
  
  const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  };
  
  try {
      const res = await fetch(url, { headers });
      const html = await res.text();

      const idx = html.indexOf('ytInitialData');
      if (idx !== -1) {
          console.log("Context:");
          console.log(html.substring(Math.max(0, idx - 50), idx + 100));
      } else {
          console.log("ytInitialData not found.");
      }
  } catch (e) {
      console.log("Error:", e);
  }
}
testFetch();
