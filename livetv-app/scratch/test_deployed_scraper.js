// Native fetch is available in Node 18+


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
  console.log('Testing uncached handles on deployed Vercel scraper (with Channel ID validation):');
  await checkHandle('MBCNEWS', 'UCF4Wxdo3inmxP-Y59wXDsFw');
  await checkHandle('SBSnews8', 'UCkinYTS9IHqOEFMlZ0VXKSA');
  await checkHandle('SBSBiz2021', 'UCbMjg2EvXs_RUGW-KrdM3pw');
  await checkHandle('MKeconomy_TV', 'UCW_rE_QzXm5b7w7O21tE22A');
}

main();
