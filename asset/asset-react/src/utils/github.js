/**
 * GitHub Repository 동기화 유틸리티 (기존 기능 복원)
 */

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem('assetGitHubConfig');
    if (!raw) return { token: '', repo: '', branch: 'main', autoSync: false };
    const parsed = JSON.parse(raw);
    return {
      token: (parsed.token || '').trim(),
      repo: (parsed.repo || '').trim(),
      branch: (parsed.branch || 'main').trim(),
      autoSync: !!parsed.autoSync
    };
  } catch {
    return { token: '', repo: '', branch: 'main', autoSync: false };
  }
}

export function saveGithubConfig(config) {
  const trimmed = {
    token: (config.token || '').trim(),
    repo: (config.repo || '').trim(),
    branch: (config.branch || 'main').trim(),
    autoSync: !!config.autoSync
  };
  localStorage.setItem('assetGitHubConfig', JSON.stringify(trimmed));
}

// Unicode-safe base64 encoding standard helper
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode('0x' + p1);
  }));
}

export async function syncWithGitHub(action = 'upload', yearKey, dataStr) {
  const config = getGithubConfig();
  if (!config.token || !config.repo) return null;

  const filePath = `asset/data/${yearKey}.json`;
  const getUrl = `https://api.github.com/repos/${config.repo}/contents/${filePath}?ref=${config.branch}`;
  const putUrl = `https://api.github.com/repos/${config.repo}/contents/${filePath}`;
  
  const headers = {
    'Authorization': `Bearer ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    if (action === 'download') {
      const res = await fetch(getUrl, { headers });
      if (res.status === 404) {
        console.log("GitHub data not found.");
        return null;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const content = decodeURIComponent(escape(atob(json.content)));
      return JSON.parse(content);
    } else {
      // Upload
      if (!dataStr) return false;

      // 헬퍼: 캐시 없이 최신 SHA 가져오기
      const getLatestSha = async () => {
        try {
          const checkRes = await fetch(getUrl, {
            headers: {
              ...headers,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          if (checkRes.ok) {
            const checkJson = await checkRes.json();
            return checkJson.sha;
          }
          if (checkRes.status === 404) {
            // 파일이 존재하지 않는 경우 (처음 저장할 때)
            return null;
          }
          const checkErr = await checkRes.json().catch(() => ({}));
          throw new Error(`SHA 조회 실패 (HTTP ${checkRes.status}): ${checkErr.message || '알 수 없는 오류'}`);
        } catch (e) {
          console.error("SHA Fetch Exception:", e);
          throw e;
        }
      };

      let retries = 3;
      let success = false;
      let lastError = null;

      while (retries > 0 && !success) {
        let sha = null;
        try {
          sha = await getLatestSha();
        } catch (shaErr) {
          // SHA 조회 자체가 실패한 경우 더이상 진행하지 않고 실패 처리
          throw shaErr;
        }

        const body = {
          message: `Update asset data: ${yearKey}`,
          content: b64EncodeUnicode(dataStr),
          branch: config.branch
        };
        if (sha) body.sha = sha;

        try {
          const putRes = await fetch(putUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify(body)
          });

          if (putRes.ok) {
            console.log("GitHub Sync Success!");
            success = true;
          } else {
            const err = await putRes.json().catch(() => ({}));
            console.error(`GitHub Sync Attempt Failed (Retries left: ${retries - 1}):`, err);
            lastError = new Error(err.message || '알 수 없는 오류');

            // 409 Conflict, 412 Precondition Failed, 423 Locked 등 리트라이 가능 대상인 경우 대기 후 시도
            if (putRes.status === 409 || putRes.status === 412 || putRes.status === 423) {
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            } else {
              // 기타 복구 불가능한 에러는 즉시 에러 발생
              throw lastError;
            }
          }
        } catch (fetchErr) {
          console.error("Fetch Exception during PUT, retrying...", fetchErr);
          lastError = fetchErr;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      if (!success && lastError) {
        throw lastError;
      }
      return success;
    }
  } catch (e) {
    console.error("GitHub Sync Exception:", e);
    throw e;
  }
}

export async function testGithubConnection() {
  const config = getGithubConfig();
  if (!config.token || !config.repo) return false;

  const url = `https://api.github.com/repos/${config.repo}`;
  const headers = {
    'Authorization': `Bearer ${config.token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const res = await fetch(url, { headers });
    return res.ok;
  } catch (err) {
    return false;
  }
}
