const fs = require('fs');

async function testFetch() {
  const res = await fetch('https://www.youtube.com/results?search_query=newjeans+official+audio&sp=EgIQAQ%253D%253D');
  const html = await res.text();

  const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({.+?})\s*;</);
  if (match) {
    const jsonStr = match[1];
    console.log("JSON Length:", jsonStr.length);
    console.log("Ends with:", jsonStr.substring(jsonStr.length - 20));
    try {
        JSON.parse(jsonStr);
        console.log("JSON Parse: SUCCESS");
    } catch (e) {
        console.log("JSON Parse Error:", e.message);
    }
  }
}
testFetch();
