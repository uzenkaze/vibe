const https = require('https');

const CHANNELS = [
  { id: 'UCsJ6RuBi65JHJkZYO1MECIA', name: '슈카월드', cat: 'opinion' },
  { id: 'UCO850F-GqB3hSpR3M7z182A', name: '삼프로TV', cat: 'opinion' },
  { id: 'UC3K0_A1vpyN8SLeJ_0S5yfg', name: '지무비', cat: 'movie' },
  { id: 'UCaHGGHs_R54KGDpy7IdFmew', name: '고몽', cat: 'movie' },
  { id: 'UCQ27n_iHn0D2c5kH5vms_qA', name: '삐맨', cat: 'movie' }
];

function fetchRSS(channelId) {
  return new Promise((resolve, reject) => {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', err => reject(err));
  });
}

async function test() {
  for (const ch of CHANNELS) {
    console.log(`\n==================================================`);
    console.log(`[TEST] Channel: ${ch.name} (${ch.id})`);
    try {
      const res = await fetchRSS(ch.id);
      console.log(`Status Code: ${res.statusCode}`);
      if (res.statusCode === 200) {
        console.log(`Data Length: ${res.data.length} bytes`);
        // entry 개수 세어보기
        const entryCount = (res.data.match(/<entry>/g) || []).length;
        console.log(`Entry Count: ${entryCount}`);
        
        // 첫 번째 entry 내용 일부 출력
        const firstEntryIndex = res.data.indexOf('<entry>');
        if (firstEntryIndex !== -1) {
          const firstEntryEnd = res.data.indexOf('</entry>', firstEntryIndex);
          const entryXml = res.data.substring(firstEntryIndex, firstEntryEnd + 8);
          console.log(`First Entry Sample:\n${entryXml.substring(0, 500)}...\n`);
        } else {
          console.log("No <entry> found! Sample data:\n" + res.data.substring(0, 500));
        }
      } else {
        console.log(`Failed to fetch RSS: HTTP ${res.statusCode}`);
      }
    } catch (err) {
      console.error(`Error fetching channel ${ch.name}:`, err.message);
    }
  }
}

test();
