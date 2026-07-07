const OWNER = 'uzenkaze';
const REPO = 'vibe';

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

// Fetch JSON from GitHub Contents API
export async function getGithubJson(path, token) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
    const headers = {
      'Accept': 'application/vnd.github.v3+json'
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    
    const res = await fetch(`${url}?t=${Date.now()}`, { headers });
    if (!res.ok) {
      if (res.status === 404) return null; // File doesn't exist yet
      throw new Error(`GitHub API returned status ${res.status}`);
    }
    
    const data = await res.json();
    const decoded = decodeURIComponent(atob(data.content).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return {
      content: JSON.parse(decoded),
      sha: data.sha
    };
  } catch (err) {
    console.error(`Failed to fetch ${path} from GitHub API:`, err);
    throw err;
  }
}

// Write/Update JSON to GitHub Contents API
export async function saveGithubJson(path, content, token, commitMessage) {
  if (!token) {
    throw new Error('GitHub Personal Access Token is required.');
  }
  
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const serialized = JSON.stringify(content, null, 2);
  
  const bytes = new TextEncoder().encode(serialized);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const base64Content = btoa(binString);

  // Obtain SHA hash
  let sha = null;
  try {
    const getRes = await fetch(`${url}?t=${Date.now()}`, {
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
    console.log('File SHA retrieval skipped. Creating new file.');
  }

  const body = {
    message: commitMessage || 'chore(data): sync carrep JSON database',
    content: base64Content
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

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `GitHub API PUT returned status ${res.status}`);
  }

  return await res.json();
}
