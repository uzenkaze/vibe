async function getChannelId(handle) {
  const url = `https://www.youtube.com/@${handle}`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (!res.ok) {
      console.log(`@${handle}: HTTP ${res.status}`);
      return;
    }
    const html = await res.text();
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    console.log(`@${handle} Page Title: "${titleMatch ? titleMatch[1] : 'none'}"`);
    
    // Look for channelId in various formats
    let match = html.match(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/);
    if (!match) match = html.match(/meta itemprop="channelId" content="(UC[a-zA-Z0-9_-]{22})"/);
    if (!match) match = html.match(/channel\/(UC[a-zA-Z0-9_-]{22})/);
    if (!match) match = html.match(/"browseId":"(UC[a-zA-Z0-9_-]{22})"/);
    
    if (match) {
      console.log(`@${handle} -> Channel ID: ${match[1]}`);
    } else {
      console.log(`@${handle} -> Channel ID not found`);
    }
  } catch(e) {
    console.error(`@${handle} Error:`, e.message);
  }
}

async function main() {
  await getChannelId('MKeconomy_TV');
  await getChannelId('mtn');
  await getChannelId('SBSBiz2021');
  await getChannelId('yonhapnewstv23');
}
main();
