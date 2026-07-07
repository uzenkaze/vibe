const channels = [
  { id: 'UCWlV3Lz_55UaX4JsMj-z__Q', name: 'TV조선' },
  { id: 'UCfq4V1DAuaojnr2ryvWNysw', name: '채널A' },
  { id: 'UCG9aFJTZ-lMCHAiO1KJsirg', name: 'MBN' },
  { id: 'UChlgI3UHCOnwUGzWzbJ3H5w', name: 'YTN' },
  { id: 'UCTHCOPwqNfZ0uiKOvFyhGwg', name: '연합뉴스TV' }
];

async function checkVideoLiveStatus(videoId) {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    if (!res.ok) return { isLive: false, title: 'Error' };
    const html = await res.text();
    
    // Check strictly for "isLive":true
    const isLive = html.includes('"isLive":true') || html.includes('"isLive": true');
    
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown';
    
    return { isLive, title };
  } catch (e) {
    return { isLive: false, title: e.message };
  }
}

async function checkRSS(ch) {
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`;
  console.log(`Checking RSS for ${ch.name}...`);
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.log(`  Failed to fetch RSS: ${res.status}`);
      return;
    }
    const xml = await res.text();
    
    const regex = /<entry>[\s\S]*?<yt:videoId>([a-zA-Z0-9_-]{11})<\/yt:videoId>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<\/entry>/g;
    let m;
    const entries = [];
    while ((m = regex.exec(xml)) !== null) {
      entries.push({ id: m[1], rssTitle: m[2].trim() });
    }
    
    console.log(`  Found ${entries.length} entries in RSS.`);
    
    let liveFound = false;
    for (const entry of entries) {
      const status = await checkVideoLiveStatus(entry.id);
      if (status.isLive) {
        console.log(`    - [${entry.id}] Title: "${status.title}" | Live: ${status.isLive}`);
        console.log(`      -> FOUND LIVE STREAM: https://www.youtube.com/watch?v=${entry.id}`);
        liveFound = true;
      }
    }
    
    if (!liveFound) {
      console.log(`  -> No live stream found in RSS feed.`);
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
