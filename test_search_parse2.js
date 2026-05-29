const fs = require('fs');

async function test() {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent('아이브')}&sp=EgIQAQ%253D%253D&app=desktop`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } });
  const html = await res.text();

  const prefix = 'var ytInitialData = ';
  const si = html.indexOf(prefix);
  const ei = html.indexOf(';</script>', si);
  const jsonStr = html.substring(si + prefix.length, ei);
  
  let data;
  try { data = JSON.parse(jsonStr); } catch { data = new Function('return ' + jsonStr)(); }

  const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;

  if (!contents) {
    console.log("No contents found");
    return;
  }

  for (let i = 0; i < contents.length; i++) {
    const item = contents[i];
    if (item.videoRenderer) {
      const v = item.videoRenderer;
      console.log(`Video ${i}:`);
      console.log("  videoId:", v.videoId);
      console.log("  title:", v.title?.runs?.[0]?.text);
      console.log("  ownerText:", v.ownerText?.runs?.[0]?.text);
      console.log("  longBylineText:", v.longBylineText?.runs?.[0]?.text);
      console.log("  shortBylineText:", v.shortBylineText?.runs?.[0]?.text);
      console.log("  lengthText:", v.lengthText?.simpleText);
      console.log("  thumbnail:", v.thumbnail?.thumbnails?.slice(-1)[0]?.url);
      break; // Just print the first valid video
    } else {
      console.log(`Item ${i} is NOT videoRenderer:`, Object.keys(item));
    }
  }
}
test();
