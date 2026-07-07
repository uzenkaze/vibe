async function checkJtbc() {
  const url = 'https://api.jtbc.co.kr/v1/onair';
  try {
    const res = await fetch(url, {
      headers: {
        'Origin': 'https://onair.jtbc.co.kr',
        'Referer': 'https://onair.jtbc.co.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    console.log('Headers:', Object.fromEntries(res.headers.entries()));
    const body = await res.text();
    console.log('Body:', body.substring(0, 1000));
  } catch (e) {
    console.error(e);
  }
}
checkJtbc();
