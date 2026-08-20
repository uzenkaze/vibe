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

// Is running in local development environment
export function isLocalDev() {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

// Unified Get Data (Local Server API -> GitHub API with Token -> Fast Raw GitHub -> Static Data)
export async function getGithubJson(path, token) {
  const timestamp = Date.now();
  const rand = Math.random().toString(36).substring(2, 7);

  // 1. Local Vite Dev Server API (Reads direct from local disk files)
  if (isLocalDev()) {
    try {
      const localRes = await fetch(`/api/carrep-data?path=${encodeURIComponent(path)}&_t=${timestamp}`, {
        cache: 'no-store'
      });
      if (localRes.ok) {
        const content = await localRes.json();
        return { content, sha: null, resolvedPath: path, source: 'local-disk' };
      }
    } catch (e) {
      console.warn('[CarRep] Local API read failed, fallback to GitHub...', e);
    }
  }

  // 2. If token is provided, use GitHub Contents API (authenticated real-time master branch)
  if (token) {
    try {
      const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${token}`
      };
      const res = await fetch(`${url}?ref=master&_t=${timestamp}&_r=${rand}`, { 
        headers, 
        cache: 'no-store' 
      });
      if (res.ok) {
        const data = await res.json();
        const decoded = decodeBase64Utf8(data.content);
        return {
          content: JSON.parse(decoded),
          sha: data.sha,
          resolvedPath: path,
          source: 'github-api'
        };
      }
      if (res.status === 404) return null;
    } catch (e) {
      // Fall through to raw
    }
  }

  // 3. Fast Raw GitHub fetch (Real-time master branch fetch without auth)
  try {
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/master/${path}?_t=${timestamp}&_r=${rand}`;
    const rawRes = await fetch(rawUrl, { cache: 'no-store' });
    if (rawRes.ok) {
      const content = await rawRes.json();
      return { content, sha: null, resolvedPath: path, source: 'github-raw' };
    }
    if (rawRes.status === 404) return null;
  } catch (err) {
    // Raw fetch failed
  }

  return null;
}

// Unified Save Data (Local Server Disk Write + GitHub Master Branch Commit)
export async function saveGithubJson(path, content, token, commitMessage) {
  let localSaved = false;

  // 1. If in Local Dev, write directly to local disk files via Vite Middleware
  if (isLocalDev()) {
    try {
      const localRes = await fetch(`/api/carrep-data?path=${encodeURIComponent(path)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (localRes.ok) {
        localSaved = true;
        console.log(`[CarRep] Local disk file saved: ${path}`);
      }
    } catch (e) {
      console.warn('[CarRep] Local API write failed:', e);
    }
  }

  // 2. If GitHub Token is present, commit directly to GitHub repository
  if (token) {
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
          const getRes = await fetch(`${url}?ref=master&_t=${Date.now()}`, {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3+json'
            },
            cache: 'no-store'
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
        } else if (targetPath === path && !localSaved) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `GitHub API PUT returned status ${res.status}`);
        }
      } catch (err) {
        if (targetPath === path && !localSaved) throw err;
      }
    }

    return lastResult || { success: true };
  }

  if (localSaved) {
    return { success: true, mode: 'local' };
  }

  // If neither local nor token
  return { success: false, warning: 'No token configured and not on localhost' };
}
