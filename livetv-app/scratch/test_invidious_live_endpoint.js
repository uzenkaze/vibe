async function testInvidiousLive() {
  const channels = [
    { id: 'UCsU-I-vHLiaMfV_ceaYz5rQ', name: 'JTBC' },
    { id: 'UCZdBJIbJz0P9xyFipgOj1fA', name: 'YTN Science' }
  ];
  
  for (const ch of channels) {
    const url = `https://inv.thepixora.com/api/v1/channels/${ch.id}/live`;
    console.log(`Testing Invidious live endpoint for ${ch.name}...`);
    try {
      const res = await fetch(url);
      console.log(`  Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`  Raw Text:`, text.substring(0, 500));
      } else {
        console.log(`  Error:`, await res.text());
      }
    } catch(e) {
      console.error(`  Error:`, e.message);
    }
    console.log('----------------------------------------------------');
  }
}
testInvidiousLive();
