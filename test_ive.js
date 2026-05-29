const fs = require('fs');

async function testFetch() {
  const query = '아이브';
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+official+audio&sp=EgIQAQ%253D%253D`;
  console.log("Fetching:", url);
  try {
      const res = await fetch(url);
      const html = await res.text();

      console.log("HTML length:", html.length);
      console.log("Includes ytInitialData?", html.includes('ytInitialData'));

      const match = html.match(/(?:var\s+ytInitialData\s*=|window\["ytInitialData"\]\s*=)\s*({[\s\S]+?})\s*;</);
      console.log("Match success?", !!match);

      if (match) {
        const jsonStr = match[1];
        try {
            const data = JSON.parse(jsonStr);
            console.log("JSON Parse: SUCCESS");
            
            const contents = data.contents.twoColumnSearchResultsRenderer
                .primaryContents.sectionListRenderer.contents[0]
                .itemSectionRenderer.contents;
            
            console.log("Parsed contents length:", contents.length);
            let hasVideo = false;
            for (const item of contents) {
                if (item.videoRenderer) {
                    hasVideo = true;
                    console.log("Found video:", item.videoRenderer.title.runs[0].text);
                    break;
                }
            }
            console.log("Has videoRenderer?", hasVideo);
        } catch (e) {
            console.log("Error processing JSON:", e.message);
        }
      } else {
        // Find where ytInitialData is
        const idx = html.indexOf('ytInitialData');
        if (idx !== -1) {
            console.log("Context around ytInitialData:");
            console.log(html.substring(Math.max(0, idx - 50), idx + 100));
        } else {
            console.log("No ytInitialData found in HTML at all.");
        }
      }
  } catch (e) {
      console.log("Fetch Error:", e);
  }
}
testFetch();
