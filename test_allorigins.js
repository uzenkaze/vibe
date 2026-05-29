const fs = require('fs');

async function testFetch() {
  const query = '아이브';
  const targetUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  const allOriginsUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
  
  console.log("Fetching from allorigins:", allOriginsUrl);
  try {
      const res = await fetch(allOriginsUrl);
      console.log("res.ok:", res.ok);
      const json = await res.json();
      const html = json.contents;
      
      console.log("HTML length:", html ? html.length : 'null');
      if (html) {
          const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
          console.log("Match success?", !!match);
      }
  } catch (e) {
      console.log("Fetch Error:", e.message);
  }
}
testFetch();
