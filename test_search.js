const fs = require('fs');

async function testFetch() {
  try {
    const res = await fetch('https://www.youtube.com/results?search_query=newjeans+official+audio&sp=EgIQAQ%253D%253D');
    const html = await res.text();
    
    console.log("HTML length:", html.length);
    console.log("Includes ytInitialData?", html.includes('ytInitialData'));

    const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
    console.log("Match with .+?:", !!match);
    
    const match2 = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
    console.log("Match with [\\s\\S]+?:", !!match2);

    if (match) {
        try {
            const data = JSON.parse(match[1]);
            console.log("JSON Parse: SUCCESS");
        } catch (e) {
            console.log("JSON Parse Error:", e.message);
        }
    }
  } catch (e) {
      console.log("Fetch error:", e.message);
  }
}
testFetch();
