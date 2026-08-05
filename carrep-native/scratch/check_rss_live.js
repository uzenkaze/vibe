const channels = [
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN', expectedIds: ['nauYXS9GahY', 'pAt7Gf844VQ'] },
  { id: 'UCTHCOPwqNfZ0uiKOvFyhGwg', name: '연합뉴스TV', expectedIds: ['3CtbtNzWHTw'] },
  { id: 'UCbMjg2EvXs_RUGW-KrdM3pw', name: 'SBS Biz', expectedIds: ['Fmd1zCO1zrU'] },
  { id: 'UCW_rE_QzXm5b7w7O21tE22A', name: '매일경제TV', expectedIds: ['s9xL1DpBsfQ'] },
  { id: 'UCZdBJIbJz0P9xyFipgOj1fA', name: 'YTN 사이언스', expectedIds: ['L8MwdIz2Iw4'] },
  { id: 'UCWlV3Lz_55UaX4JsMj-z__Q', name: 'TV조선', expectedIds: ['uy2tmerW3S8'] },
  { id: 'UCfq4V1DAuaojnr2ryvWNysw', name: '채널A', expectedIds: ['QAKdwa-1eKQ'] },
  { id: 'UCG9aFJTZ-lMCHAiO1KJsirg', name: 'MBN', expectedIds: ['c-pjWq_1CQM'] }
];

async function checkRSS(ch) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`;
  console.log(`Checking RSS for ${ch.name} (${ch.id})...`);
  
  try {
    const res = await fetch(url);
    console.log(`  Status: ${res.status}`);
    if (res.ok) {
      const xml = await res.text();
      
      // Parse all video IDs in the feed
      const videoIds = [];
      const regex = /<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>/g;
      let m;
      while ((m = regex.exec(xml)) !== null) {
        videoIds.push(m[1]);
      }
      
      console.log(`  Found Video IDs in RSS:`, videoIds);
      
      // Check if any expected ID is in the feed
      let matched = false;
      for (const eid of ch.expectedIds) {
        if (videoIds.includes(eid)) {
          console.log(`  -> SUCCESS! Matches expected ID: ${eid}`);
          matched = true;
          break;
        }
      }
      if (!matched) {
        console.log(`  -> Warning: Expected IDs not found. Checking if any video is live...`);
        // We can inspect the entries
      }
    }
  } catch (e) {
    console.error(`  Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  for (const ch of channels) {
    await checkRSS(ch);
  }
}

run();
