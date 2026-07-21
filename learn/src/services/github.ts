import type { GitHubConfig } from '../types';

const GH_CONFIG_KEY = 'learnGitHubConfig';
const DATA_PATH = 'learn/data.json';

export function getGitHubConfig(): GitHubConfig {
  // 먼저 learn 전용 설정 확인, 없으면 task-manager 설정에서 토큰만 가져옴
  const stored = localStorage.getItem(GH_CONFIG_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch { /* ignore */ }
  }
  // task-manager 설정에서 공유
  const taskConfig = localStorage.getItem('taskGitHubConfig');
  if (taskConfig) {
    try {
      const parsed = JSON.parse(taskConfig);
      return {
        token: parsed.token || '',
        repo: parsed.repo || 'uzenkaze/vibe',
        branch: parsed.branch || 'main',
        autoSync: parsed.autoSync ?? true,
      };
    } catch { /* ignore */ }
  }
  return { token: '', repo: 'uzenkaze/vibe', branch: 'main', autoSync: true };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  localStorage.setItem(GH_CONFIG_KEY, JSON.stringify(config));
}

export async function downloadFromGitHub<T>(config: GitHubConfig, path: string = DATA_PATH): Promise<T | null> {
  if (!config.repo) return null;

  const url = `https://api.github.com/repos/${config.repo}/contents/${path}?ref=${config.branch || 'main'}&t=${Date.now()}`;
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
  };
  if (config.token) {
    headers['Authorization'] = `token ${config.token}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (res.ok) {
      const json = await res.json();
      if (!Array.isArray(json)) {
        let base64 = '';
        if (!json.content || json.size > 1000000) {
          if (json.sha) {
            const blobUrl = `https://api.github.com/repos/${config.repo}/git/blobs/${json.sha}`;
            const blobHeaders: Record<string, string> = {};
            if (config.token) blobHeaders['Authorization'] = `token ${config.token}`;
            const blobRes = await fetch(blobUrl, { headers: blobHeaders });
            if (blobRes.ok) {
              const blobJson = await blobRes.json();
              base64 = blobJson.content;
            }
          }
        } else {
          base64 = json.content;
        }

        if (base64) {
          const cleanBase64 = base64.replace(/[\s\r\n\t]/g, '');
          const binString = atob(cleanBase64);
          const bytes = new Uint8Array(binString.length);
          for (let i = 0; i < binString.length; i++) {
            bytes[i] = binString.charCodeAt(i);
          }
          const content = new TextDecoder().decode(bytes);
          return JSON.parse(content) as T;
        }
      }
    }
  } catch (e) {
    console.warn('GitHub API Download warn, trying raw fallback:', e);
  }

  // Fallback: raw.githubusercontent.com 퍼블릭 URL로 시도
  try {
    const rawUrl = `https://raw.githubusercontent.com/${config.repo}/${config.branch || 'main'}/${path}?t=${Date.now()}`;
    const rawRes = await fetch(rawUrl, { cache: 'no-store' });
    if (rawRes.ok) {
      const data = await rawRes.json();
      return data as T;
    }
  } catch (e) {
    console.error('GitHub Raw Download Error:', e);
  }

  return null;
}

export async function uploadToGitHub(config: GitHubConfig, data: unknown, path: string = DATA_PATH, message: string = 'Update learn data'): Promise<boolean> {
  if (!config.token || !config.repo) return false;

  const url = `https://api.github.com/repos/${config.repo}/contents/${path}?ref=${config.branch}`;
  const headers: Record<string, string> = {
    'Authorization': `token ${config.token}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    let sha: string | null = null;
    const checkRes = await fetch(url, { headers });
    if (checkRes.ok) {
      const checkJson = await checkRes.json();
      sha = checkJson.sha;
    }

    const jsonStr = JSON.stringify(data, null, 2);
    const bytes = new TextEncoder().encode(jsonStr);
    const binString = Array.from(bytes, (byte: number) => String.fromCharCode(byte)).join('');
    const base64 = btoa(binString);

    const body: Record<string, unknown> = {
      message,
      content: base64,
      branch: config.branch,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });

    return putRes.ok;
  } catch (e) {
    console.error('GitHub Upload Error:', e);
    return false;
  }
}
