async function test() {
  try {
    const kbsApi = 'https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/11';
    const allOriginsUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(kbsApi)}`;
    
    console.log('Fetching via allorigins with User-Agent...');
    const res = await fetch(allOriginsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text.substring(0, 500));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
