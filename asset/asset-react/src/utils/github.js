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
      let sha = null;
      const checkRes = await fetch(url, { headers });
      if (checkRes.ok) {
        const checkJson = await checkRes.json();
        sha = checkJson.sha;
      }

      if (!dataStr) return false;

      const body = {
        message: `Update asset data: ${yearKey}`,
        content: b64EncodeUnicode(dataStr),
        branch: config.branch
      };
      if (sha) body.sha = sha;

      const putRes = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
      });
      
      if (putRes.ok) {
        console.log("GitHub Sync Success!");
        return true;
      } else {
        const err = await putRes.json();
        console.error("GitHub Sync Error:", err);
        throw new Error(err.message || '알 수 없는 오류');
      }
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
