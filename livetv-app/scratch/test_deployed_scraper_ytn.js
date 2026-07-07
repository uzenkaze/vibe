async function checkHandle(handle, channelId) {
  const url = `https://vibe-eight-iota.vercel.app/api/youtube/live?handle=${handle}&channelId=${channelId || ''}&cb=${Date.now()}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Handle: @${handle} (Channel ID: ${channelId || 'none'})`);
    console.log(`  Scraper Output:`, data);
  } catch (e) {
    console.error(`  Error for @${handle}:`, e.message);
  }
}

async function main() {
  console.log('Testing 24/7 handles on deployed Vercel scraper:');
  await checkHandle('YTNSC', 'UCZdBJIbJz0P9xyFipgOj1fA');
  await checkHandle('ytnnews24', 'UChlgI3UHCOnwUGzWzbJ3H5w');
}

main();
