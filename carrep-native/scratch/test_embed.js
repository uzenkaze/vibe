const channels = [
  { name: 'YTN 사이언스', channelId: 'UCZdBJIbJz0P9xyFipgOj1fA' },
  { name: 'JTBC', channelId: 'UCsU-I-vHLiaMfV_ceaYz5rQ' },
  { name: 'TV조선', channelId: 'UCWlV3Lz_55UaX4JsMj-z__Q' },
  { name: '채널A', channelId: 'UCfq4V1DAuaojnr2ryvWNysw' },
  { name: 'MBN', channelId: 'UCG9aFJTZ-lMCHAiO1KJsirg' },
  { name: 'YTN', channelId: 'UChlgI3UHCOnwUGzWzbJ3H5w' }
];

async function checkEmbedStatus(ch) {
  const url = `https://www.youtube.com/embed/live_stream?channel=${ch.channelId}`;
  console.log(`Checking ${ch.name} playability status...`);
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    const html = await res.text();
    
    // Find ytInitialPlayerResponse
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.*?});\s*(?:var|const|let|window|\n)/);
    let playerResponse = null;
    if (playerResponseMatch) {
      try {
        playerResponse = JSON.parse(playerResponseMatch[1]);
      } catch (e) {
        // Simple fallback extraction if JSON parse fails
        const statusIdx = playerResponseMatch[1].indexOf('"status"');
        if (statusIdx !== -1) {
          console.log(`    Raw status substring:`, playerResponseMatch[1].substring(statusIdx, statusIdx + 200));
        }
      }
    } else {
      // Try finding playabilityStatus directly
      const playabilityMatch = html.match(/"playabilityStatus"\s*:\s*({.*?})/);
      if (playabilityMatch) {
        console.log(`    Direct playability match:`, playabilityMatch[1].substring(0, 300));
      }
    }
    
    if (playerResponse) {
      const playabilityStatus = playerResponse.playabilityStatus || {};
      console.log(`  Playability Status:`, playabilityStatus.status);
      console.log(`  Reason:`, playabilityStatus.reason);
      console.log(`  Reason (Simple):`, playabilityStatus.errorScreen?.playerErrorMessageRenderer?.reason?.simpleText);
      console.log(`  Subreason:`, playabilityStatus.errorScreen?.playerErrorMessageRenderer?.subreason?.simpleText);
      console.log(`  Embeddable:`, playerResponse.videoDetails?.isOwnerViewing || playerResponse.videoDetails?.allowBindings !== false);
    } else {
      console.log('  ytInitialPlayerResponse not found!');
      // Check for generic error strings
      const errorScreenMatch = html.includes('embeds-error-screen');
      console.log('  Generic embeds-error-screen present?', errorScreenMatch);
    }
  } catch (e) {
    console.error(`  Error:`, e.message);
  }
  console.log('----------------------------------------------------');
}

async function run() {
  for (const ch of channels) {
    await checkEmbedStatus(ch);
  }
}

run();
