const OWNER = 'uzenkaze';
const REPO = 'vibe';

// Fetch file from GitHub Repository (using token if available, else public fetch)
export async function getGithubJson(path, token) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }
    // To prevent caching
    headers['Accept'] = 'application/vnd.github.v3+json';
    
    const res = await fetch(`${url}?t=${Date.now()}`, { headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`GitHub API returned status ${res.status}`);
    }
    
    const data = await res.json();
    // decode base64 content
    const decoded = decodeURIComponent(atob(data.content).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return {
      content: JSON.parse(decoded),
      sha: data.sha
    };
  } catch (err) {
    console.error(`Failed to fetch ${path} from GitHub:`, err);
    throw err;
  }
}

// Update (Write) JSON file inside GitHub Repository
export async function saveGithubJson(path, content, token, commitMessage) {
  if (!token) {
    throw new Error('GitHub Personal Access Token is required to save data.');
  }
  
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const serialized = JSON.stringify(content, null, 2);
  
  // Convert string content to UTF-8 Base64
  const bytes = new TextEncoder().encode(serialized);
  const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  const base64Content = btoa(binString);

  // 1. Check if file already exists to obtain its SHA hash
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
    console.log('File does not exist yet or check failed. Proceeding with new creation.');
  }

  // 2. Put (Update or Create) content to GitHub
  const body = {
    message: commitMessage || 'chore(data): sync carrep database',
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
    throw new Error(errData.message || `GitHub PUT returned status ${res.status}`);
  }

  return await res.json();
}
