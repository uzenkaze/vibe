const playlists = [
  'https://iptv-org.github.io/iptv/countries/kr.m3u',
  'https://raw.githubusercontent.com/e52250/IPTV/main/korea.m3u'
];

function parseM3u(text) {
  const lines = text.split('\n');
  const result = [];
  let currentInfo = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#EXTINF:')) {
      currentInfo = trimmed;
    } else if (trimmed.startsWith('http')) {
      if (currentInfo) {
        const commaIdx = currentInfo.lastIndexOf(',');
        const name = commaIdx !== -1 ? currentInfo.substring(commaIdx + 1).trim() : 'Unknown';
        result.push({ name, url: trimmed });
        currentInfo = null;
      }
    }
  }
  return result;
}

async function search() {
  const targets = ['chosun', 'choson', 'mbn', 'channel a', '채널a', 'jtbc', 'ytn', 'science'];
  
  for (const playlistUrl of playlists) {
    console.log(`Fetching ${playlistUrl}...`);
    try {
      const res = await fetch(playlistUrl);
      if (!res.ok) {
        console.log(`  Failed to fetch: ${res.status}`);
        continue;
      }
      const text = await res.text();
      const items = parseM3u(text);
      console.log(`  Loaded ${items.length} channels.`);
      
      for (const item of items) {
        const lowerName = item.name.toLowerCase();
        for (const target of targets) {
          if (lowerName.includes(target)) {
            console.log(`  Match [${target}]: Name="${item.name}", URL="${item.url}"`);
            break;
          }
        }
      }
    } catch(e) {
      console.error(`  Error:`, e.message);
    }
    console.log('----------------------------------------------------');
  }
}

search();
