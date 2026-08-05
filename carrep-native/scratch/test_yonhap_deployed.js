const channels = [
  { name: 'YTN 사이언스', handle: 'YTNSC', id: 'UCZdBJIbJz0P9xyFipgOj1fA' },
  { name: 'YTN', handle: 'ytnnews24', id: 'UChlgI3UHCOnwUGzWzbJ3H5w' },
  { name: '연합뉴스TV', handle: 'yonhapnewstv23', id: 'UCTHCOPwqNfZ0uiKOvFyhGwg' },
  { name: 'SBS Biz', handle: 'SBSBiz2021', id: 'UCbMjg2EvXs_RUGW-KrdM3pw' },
  { name: '매일경제TV', handle: 'MKeconomy_TV', id: 'UCW_rE_QzXm5b7w7O21tE22A' },
  { name: 'MTN 머니투데이', handle: 'mtn', id: 'UCaQREsefLy-W8ruWcJ7IDtg' }
];

async function checkChannel(ch) {
  const url = `https://vibe-eight-iota.vercel.app/api/youtube/live?handle=${ch.handle}&channelId=${ch.id}&cb=${Date.now()}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`Channel: ${ch.name} (@${ch.handle})`);
    console.log(`  Scraper Output:`, data);
  } catch (e) {
    console.error(`  Error for ${ch.name}:`, e.message);
  }
}

async function main() {
  for (const ch of channels) {
    await checkChannel(ch);
  }
}

main();
