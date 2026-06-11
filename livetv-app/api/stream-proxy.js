/**
 * Vercel Serverless HLS Stream Proxy
 * CORS 문제로 재생 불가능한 HLS 스트림(m3u8, ts 등)을 서버 측에서 프록시하여 반환
 */
export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    return res.status(204).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'url parameter is required' });
  }

  let targetUrl;
  try {
    targetUrl = decodeURIComponent(url);
    new URL(targetUrl); // validate URL format
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // 허용된 도메인만 프록시 (방송사 CDN)
  const allowedHosts = [
    'kbs.co.kr', 'gscdn.kbs.co.kr', 'gcdn.ntruss.com',
    'jtbc.co.kr', 'jtbclive-cdn', 'akamaized.net',
    'mbc.co.kr', 'mbcmpp.co.kr', 'tjmbc.co.kr',
    'ebs.co.kr', 'ktv.go.kr', 'arirang.com', 'ctnd.com',
    'tbs.seoul.kr', 'obs.co.kr', 'knn.co.kr', 'ubc.co.kr',
    'cjonstyle.net', 'gsshop.com', 'lotteimall.com',
    'hyundaihmall.com', 'nsmall.com', 'catenoid.net',
    'tvchosun.com', 'ichannela.com', 'mbn.co.kr',
    'ytnscience.com', 'ntruss.com', 'streamlock.net',
    'vtvprime.vn', 'liveh12'
  ];

  const urlHost = new URL(targetUrl).hostname;
  const isAllowed = allowedHosts.some(h => urlHost.includes(h));
  if (!isAllowed) {
    return res.status(403).json({ error: 'Domain not allowed for proxying' });
  }

  try {
    // Referer 결정
    let referer = 'https://vibe-eight-iota.vercel.app/';
    if (urlHost.includes('kbs')) referer = 'https://onair.kbs.co.kr/';
    else if (urlHost.includes('jtbc')) referer = 'https://onair.jtbc.co.kr/';
    else if (urlHost.includes('mbc')) referer = 'https://www.mbc.co.kr/';
    else if (urlHost.includes('sbs')) referer = 'https://www.sbs.co.kr/';
    else if (urlHost.includes('tvchosun')) referer = 'http://broadcast.tvchosun.com/';
    else if (urlHost.includes('ichannela')) referer = 'https://ichannela.com/';
    else if (urlHost.includes('mbn')) referer = 'https://www.mbn.co.kr/';

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': referer,
      'Accept': '*/*',
    };

    if (req.headers['range']) {
      headers['Range'] = req.headers['range'];
    }

    const upstream = await fetch(targetUrl, { headers });

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: `Upstream returned ${upstream.status}` });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'no-cache, no-store');

    if (upstream.headers.get('content-length')) {
      res.setHeader('Content-Length', upstream.headers.get('content-length'));
    }

    // m3u8 파일의 경우 내부 URL을 프록시 URL로 교체
    const isM3u8 = targetUrl.split('?')[0].endsWith('.m3u8') || contentType.toLowerCase().includes('mpegurl');
    if (isM3u8) {
      const text = await upstream.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
      
      // 세그먼트 URL 및 AES 키 URL을 프록시를 통하도록 교체
      const proxied = text.split('\n').map(line => {
        line = line.trim();
        
        // #EXT-X-KEY 라인의 URI도 프록시 처리하여 CORS 회피
        if (line.startsWith('#EXT-X-KEY:')) {
          const keyRegex = /URI="([^"]+)"/;
          const match = line.match(keyRegex);
          if (match) {
            let keyUrl = match[1];
            if (!keyUrl.startsWith('http')) {
              keyUrl = baseUrl + keyUrl;
            }
            const proxiedKeyUrl = `/api/stream-proxy?url=${encodeURIComponent(keyUrl)}`;
            line = line.replace(keyRegex, `URI="${proxiedKeyUrl}"`);
          }
          return line;
        }

        if (!line || line.startsWith('#')) return line;
        
        let segmentUrl = line;
        // 상대 경로를 절대 경로로
        if (!segmentUrl.startsWith('http')) {
          segmentUrl = baseUrl + segmentUrl;
        }
        // 프록시 URL로 변환 (ts 세그먼트 및 중첩 m3u8)
        return `/api/stream-proxy?url=${encodeURIComponent(segmentUrl)}`;
      }).join('\n');
      
      return res.status(200).send(proxied);
    }

    // 바이너리(ts 세그먼트) 스트리밍
    const buffer = await upstream.arrayBuffer();
    return res.status(upstream.status).send(Buffer.from(buffer));
    
  } catch (err) {
    console.error('[Stream Proxy Error]', err.message);
    return res.status(502).json({ error: err.message });
  }
}
