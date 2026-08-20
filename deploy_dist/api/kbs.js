export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const { channel_code } = req.query;
  if (!channel_code) {
    return res.status(400).json({ error: 'channel_code parameter is required' });
  }

  try {
    const kbsRes = await fetch(`https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/${channel_code}?_=${Date.now()}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Referer': 'https://onair.kbs.co.kr/'
      }
    });
    
    if (!kbsRes.ok) {
      throw new Error(`KBS API returned ${kbsRes.status}`);
    }

    const data = await kbsRes.json();
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).json(data);
  } catch (err) {
    console.error(`[KBS Error]:`, err.message);
    return res.status(502).json({ error: err.message });
  }
}
