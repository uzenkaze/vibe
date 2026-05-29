const fs = require('fs');

async function testFetch() {
  const query = '아이브';
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  const res = await fetch(url);
  const html = await res.text();

  const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
  if (match) {
    const jsonStr = match[1];
    console.log("JSON Length:", jsonStr.length);
    console.log("Ends with:", jsonStr.substring(jsonStr.length - 20));
    try {
        JSON.parse(jsonStr);
        console.log("JSON Parse: SUCCESS");
    } catch (e) {
        console.log("JSON Parse Error:", e.message);
        // Try new Function
        try {
            const data = new Function('return ' + jsonStr)();
            console.log("new Function: SUCCESS");
        } catch (err) {
            console.log("new Function Error:", err.message);
        }
    }
  } else {
      console.log("Regex no match");
  }
}
testFetch();
