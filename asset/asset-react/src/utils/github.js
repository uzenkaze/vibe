/**
 * GitHub Repository 동기화 유틸리티 (기존 기능 복원)
 */

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem('assetGitHubConfig');
    return raw ? JSON.parse(raw) : { token: '', repo: '', branch: 'main', autoSync: false };
  } catch {
    return { token: '', repo: '', branch: 'main', autoSync: false };
  }
}

export function saveGithubConfig(config) {
  localStorage.setItem('assetGitHubConfig', JSON.stringify(config));
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
  const url = `https://api.github.com/repos/${config.repo}/contents/${filePath}?ref=${config.branch}`;
  const headers = {
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json'
  };

  try {
    if (action === 'download') {
      const res = await fetch(url, { headers });
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
          const checkRes = await fetch(url, {
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
        } catch (e) {
          console.warn("Failed to fetch SHA", e);
        }
        return null;
      };

      let retries = 3;
      let success = false;
      let lastError = null;

      while (retries > 0 && !success) {
        const sha = await getLatestSha();
        const body = {
          message: `Update asset data: ${yearKey}`,
          content: b64EncodeUnicode(dataStr),
          branch: config.branch
        };
        if (sha) body.sha = sha;

        try {
          const putRes = await fetch(url, {
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
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json'
  };

  try {
    const res = await fetch(url, { headers });
    return res.ok;
  } catch (err) {
    return false;
  }
}
