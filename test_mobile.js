const fs = require('fs');

async function testFetch() {
  const query = '아이브';
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  
  const headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
  };
  
  try {
      const res = await fetch(url, { headers });
      const html = await res.text();

      const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
      if (match) {
        const jsonStr = match[1];
        const data = JSON.parse(jsonStr);
        
        console.log("Keys in data.contents:", Object.keys(data.contents || {}));
        if (data.contents.twoColumnSearchResultsRenderer) {
            console.log("Has twoColumnSearchResultsRenderer!");
        } else if (data.contents.sectionListRenderer) {
            console.log("Has sectionListRenderer!");
        }
      }
  } catch (e) {
      console.log("Error:", e);
  }
}
testFetch();
