/**
 * GitHub Repository 동기화 유틸리티 (기존 기능 복원)
 */

export function getGithubConfig() {
  try {
    const raw = localStorage.getItem('assetGitHubConfig');
    if (!raw) return { token: '', repo: 'uzenkaze/vibe', branch: 'master', autoSync: false };
    const parsed = JSON.parse(raw);
    return {
      token: (parsed.token || '').trim(),
      repo: (parsed.repo || 'uzenkaze/vibe').trim(),
      branch: (parsed.branch || 'master').trim(),
      autoSync: !!parsed.autoSync
    };
  } catch {
    return { token: '', repo: 'uzenkaze/vibe', branch: 'master', autoSync: false };
  }
}

export function saveGithubConfig(config) {
  const trimmed = {
    token: (config.token || '').trim(),
    repo: (config.repo || 'uzenkaze/vibe').trim(),
    branch: (config.branch || 'master').trim(),
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

let globalUploadQueue = Promise.resolve();

export async function syncWithGitHub(action = 'upload', yearKey, dataStr) {
  if (action === 'upload') {
    // 모든 GitHub 커밋은 브랜치(master)의 HEAD를 갱신하므로 직렬(Sequential) 큐로 실행하여 409 Conflict 방지
    const runTask = () => _executeSyncWithGitHub(action, yearKey, dataStr);
    const nextQueue = globalUploadQueue.then(runTask, runTask);
    globalUploadQueue = nextQueue;
    return nextQueue;
  }
  return _executeSyncWithGitHub(action, yearKey, dataStr);
}

async function _executeSyncWithGitHub(action = 'upload', yearKey, dataStr) {
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
      const timestamp = Date.now();
      const rand = Math.random().toString(36).substring(2, 8);
      const getUrlWithCacheBuster = `${getUrl}&_t=${timestamp}&_r=${rand}`;
      const res = await fetch(getUrlWithCacheBuster, { headers, cache: 'no-store' });
      if (res.status === 404) {
        console.log("GitHub data not found for:", filePath);
        return null;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const content = decodeURIComponent(escape(atob(json.content)));
      return JSON.parse(content);
    } else {
      // Upload
      if (!dataStr) return false;

      // 헬퍼: 캐시 무효화 적용된 최신 SHA 가져오기
      const getLatestSha = async () => {
        try {
          const timestamp = Date.now();
          const rand = Math.random().toString(36).substring(2, 8);
          const getUrlWithCacheBuster = `${getUrl}&_t=${timestamp}&_r=${rand}`;
          
          const checkRes = await fetch(getUrlWithCacheBuster, {
            headers,
            cache: 'no-store'
          });
          if (checkRes.ok) {
            const checkJson = await checkRes.json();
            return checkJson.sha;
          }
          if (checkRes.status === 404) {
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
            console.warn(`GitHub Sync Attempt Failed (HTTP ${putRes.status}, Retries left: ${retries - 1}):`, err);
            lastError = new Error(err.message || '알 수 없는 오류');

            // 409 Conflict 발생 시 에러 메시지("is at <sha>")에서 실제 최신 SHA 추출 시도
            if (putRes.status === 409) {
              retries--;
              if (err.message && typeof err.message === 'string') {
                const match = err.message.match(/is at ([a-f0-9]{40})/i);
                if (match && match[1]) {
                  const actualSha = match[1];
                  console.log(`[GitHub API] 409 Conflict auto-resolved! Extracted latest SHA: ${actualSha}`);
                  // 바로 최신 SHA로 재시도
                  const retryBody = { ...body, sha: actualSha };
                  const retryRes = await fetch(putUrl, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(retryBody)
                  });
                  if (retryRes.ok) {
                    console.log("[GitHub API] Retry with extracted SHA succeeded!");
                    success = true;
                    break;
                  }
                }
              }
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 800));
              }
            } else if (putRes.status === 412 || putRes.status === 423) {
              retries--;
              if (retries > 0) {
                await new Promise(resolve => setTimeout(resolve, 800));
              }
            } else {
              throw lastError;
            }
          }
        } catch (fetchErr) {
          console.error("Fetch Exception during PUT, retrying...", fetchErr);
          lastError = fetchErr;
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 800));
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
