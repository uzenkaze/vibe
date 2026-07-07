import fs from 'fs';

async function downloadEmbed() {
  const url = 'https://www.youtube.com/embed/live_stream?channel=UCWlV3Lz_55UaX4JsMj-z__Q';
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    const html = await res.text();
    fs.writeFileSync('scratch/chosun_embed.html', html, 'utf8');
    console.log('Saved to scratch/chosun_embed.html. Length:', html.length);
    
    // Check some keywords
    console.log('Contains "liveStreamability"?', html.includes('liveStreamability'));
    console.log('Contains "playabilityStatus"?', html.includes('playabilityStatus'));
    console.log('Contains "reason"?', html.includes('reason'));
    console.log('Contains "error"?', html.includes('error'));
    console.log('Contains "disabled"?', html.includes('disabled'));
  } catch (e) {
    console.error(e);
  }
}

downloadEmbed();
