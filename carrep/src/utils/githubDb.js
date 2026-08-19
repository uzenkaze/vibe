const OWNER = 'uzenkaze';
const REPO = 'vibe';

function decodeBase64Utf8(base64Str) {
  const cleanBase64 = base64Str.replace(/\s/g, '');
  const binaryString = atob(cleanBase64);
  const bytes = Uint8Array.from(binaryString, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binString = "";
  for (let i = 0; i < bytes.length; i++) {
    binString += String.fromCharCode(bytes[i]);
  }
  return btoa(binString);
}

// Check if the provided GitHub token is valid
export async function validateGithubToken(token) {
  if (!token) return false;
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    return res.ok;
  } catch (err) {
    console.error('Token validation request failed:', err);
    return false;
  }
}

// Fetch JSON from GitHub (Supports Contents API with token, or Raw GitHub without token)
export async function getGithubJson(path, token) {
  // 1. If token is provided, use GitHub Contents API (authenticated)
  if (token) {
    try {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`
      };
      const res = await fetch(`${url}?ref=master&t=${Date.now()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const decoded = decodeBase64Utf8(data.content);
        return {
          content: JSON.parse(decoded),
          sha: data.sha,
          resolvedPath: path
        };
      }
      if (res.status === 404) return null;
    } catch (e) {
      // Fall through to raw
    }
  }

  // 2. Fast Raw GitHub fetch (Real-time master branch fetch without auth)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/master/${path}?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      const content = await rawRes.json();
      return { content, sha: null, resolvedPath: path };
    }
    if (rawRes.status === 404) return null;
  } catch (err) {
    // Raw fetch failed
  }

  return null;
}

// Write/Update JSON to GitHub Contents API (Syncs both carrep/data and carrep/public/data)
export async function saveGithubJson(path, content, token, commitMessage) {
  if (!token) {
    throw new Error('GitHub Personal Access Token이 필요합니다.');
  }
  
  const serialized = JSON.stringify(content, null, 2);
  const base64Content = encodeBase64Utf8(serialized);

  const targets = [path];
  if (path.startsWith('carrep/data/')) {
    targets.push(path.replace('carrep/data/', 'carrep/public/data/'));
  } else if (path.startsWith('carrep/public/data/')) {
    targets.push(path.replace('carrep/public/data/', 'carrep/data/'));
  }

  let lastResult = null;
  for (const targetPath of targets) {
    try {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${targetPath}`;
      let sha = null;
      try {
        const getRes = await fetch(`${url}?ref=master&t=${Date.now()}`, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          sha = getData.sha;
        }
      } catch (e) {
        // Skip SHA
      }

      const body = {
        message: commitMessage || `chore(data): sync ${targetPath}`,
        content: base64Content,
        branch: 'master'
      };
      if (sha) {
        body.sha = sha;
      }

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        lastResult = await res.json();
      } else if (targetPath === path) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `GitHub API PUT returned status ${res.status}`);
      }
    } catch (err) {
      if (targetPath === path) throw err;
    }
  }

  return lastResult;
}
