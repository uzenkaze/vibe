import fetch from 'node-fetch';

let cachedWorkingNum = 43; // 서버 메모리에 마지막 성공한 번호 보관

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. 메모리에 캐시된 마지막 성공 도메인을 1순위로 즉시 검사
  const checkUrl = (num) => `https://kr${num}.topgirl.co`;
  
  try {
    const testRes = await fetch(checkUrl(cachedWorkingNum), { method: 'HEAD' }).catch(() => null);
    if (testRes && testRes.ok) {
      console.log(`[Netflix API] Cache Hit: ${checkUrl(cachedWorkingNum)}`);
      return res.status(200).json({ ok: true, domain: checkUrl(cachedWorkingNum) });
    }
  } catch (e) {}

  // 2. 캐시가 실패했거나 없는 경우: 43번부터 시작해 상위 25개 번호를 병렬 레이싱 테스트!
  const startNum = 43;
  const maxRange = 25; // 43 ~ 68
  const controllers = [];
  
  const testDomain = (num) => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      controllers.push(controller);
      
      const url = checkUrl(num);
      
      // timeout 구현
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error('timeout'));
      }, 2000);

      fetch(url, {
        method: 'GET', // GET 시도 (HEAD는 차단되는 사이트가 많음)
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        signal: controller.signal
      })
      .then(response => {
        clearTimeout(timeoutId);
        // 200 이거나 302/301 이라도 접속이 되는 상태이면 유효 도메인으로 취급
        if (response.status >= 200 && response.status < 400) {
          resolve(num);
        } else {
          reject(new Error('status error'));
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        reject(err);
      });
    });
  };

  const promises = [];
  for (let i = 0; i < maxRange; i++) {
    promises.push(testDomain(startNum + i));
  }

  try {
    // Promise.any 수동 구현 (구버전 Node 호환)
    const winnerNum = await new Promise((resolve, reject) => {
      let resolved = false;
      let rejectedCount = 0;
      
      promises.forEach(p => {
        p.then(num => {
          if (!resolved) {
            resolved = true;
            resolve(num);
          }
        }).catch(() => {
          rejectedCount++;
          if (rejectedCount === promises.length && !resolved) {
            reject(new Error('All domains failed'));
          }
        });
      });

      // 전체 세이프가드 타임아웃
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          // 실패 시 최후 보루로 기존 캐시 번호 사용
          resolve(cachedWorkingNum);
        }
      }, 2500);
    });

    // 모든 다른 진행 중인 fetch 요청들 파괴
    controllers.forEach(c => c.abort());

    cachedWorkingNum = winnerNum; // 성공한 번호 갱신
    const finalDomain = checkUrl(winnerNum);
    console.log(`[Netflix API] New winner found: ${finalDomain}`);
    return res.status(200).json({ ok: true, domain: finalDomain });
  } catch (err) {
    controllers.forEach(c => c.abort());
    console.warn(`[Netflix API] All checks failed. Falling back to cached: ${checkUrl(cachedWorkingNum)}`);
    return res.status(200).json({ ok: true, domain: checkUrl(cachedWorkingNum) });
  }
}
