export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  try {
    const jtbcRes = await fetch('https://api.jtbc.co.kr/v1/onair', {
      headers: {
        'Origin': 'https://onair.jtbc.co.kr',
        'Referer': 'https://onair.jtbc.co.kr/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
      }
    });
    
    if (!jtbcRes.ok) {
      throw new Error(`JTBC API returned ${jtbcRes.status}`);
    }

    const data = await jtbcRes.json();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.status(200).json(data);
  } catch (err) {
    console.error(`[JTBC Error]:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
// Trigger rebuild v2
