const fs = require('fs');

async function testFetch() {
  const url = `https://www.youtube.com/results?search_query=아이브`;
  
  const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  };
  
  try {
      const res = await fetch(url, { headers });
      const html = await res.text();

      const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*(.*?)\s*;</);
      if (match) {
          let jsonStr = match[1];
          let data;
          try {
              data = JSON.parse(jsonStr);
          } catch {
              data = new Function('return ' + jsonStr)();
          }
          if (typeof data === 'string') {
              data = JSON.parse(data);
          }
          
          console.log("Parsed data type:", typeof data);
          console.log("Keys:", Object.keys(data));
          if (data.contents) {
              console.log("Success! Contents found.");
          }
      } else {
          console.log("No match found.");
      }
  } catch (e) {
      console.log("Error:", e);
  }
}
testFetch();
