async function run() {
  const channelId = 'UCTHCOPwqNfZ0uiKOvFyhGwg';
  const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  console.log(`Fetching RSS from ${url}...`);
  try {
    const res = await fetch(url);
    if (res.ok) {
      const xml = await res.text();
      console.log(`=== Yonhap RSS Raw XML (First 4000 chars) ===`);
      console.log(xml.substring(0, 4000));
    } else {
      console.log(`Failed: ${res.status}`);
    }
  } catch(e) {
    console.error(e);
  }
}

run();
