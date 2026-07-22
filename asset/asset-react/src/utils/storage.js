/**
 * 로컬 스토리지 기반 데이터 저장/불러오기
 */

import { decryptData } from './crypto';

const DATA_KEY_PREFIX = 'assetData_';

export function getDataKey(year) {
  return `${DATA_KEY_PREFIX}${year}`;
}

// 타임아웃이 적용된 fetch 헬퍼 (네트워크 지연 방지)
async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 1500 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 특정 연도 데이터 저장
export async function saveData(year, plainData) {
  try {
    const password = sessionStorage.getItem('temp_master_pw');

    // 최종 수정 시간 기록
    const updatedAt = plainData.updatedAt || Date.now();
    const dataWithTs = { ...plainData, updatedAt };

    // 1. 로컬 스토리지 백업 — 암호화 적용
    let dataToSave = dataWithTs;
    if (password) {
      try {
        const { encryptData } = await import('./crypto');
        dataToSave = await encryptData(dataWithTs, password);
        dataToSave.updatedAt = updatedAt;
      } catch (encErr) {
        console.warn('[Storage] Encryption failed, storing plain to localStorage', encErr);
        dataToSave = dataWithTs;
      }
    }
    localStorage.setItem(getDataKey(year), JSON.stringify(dataToSave));
    localStorage.setItem(`${getDataKey(year)}_updatedAt`, String(updatedAt));

    // 2. GitHub API 자동 동기화 (설정된 경우 저장 즉시 백그라운드 자동 업로드)
    try {
      const { getGithubConfig, syncWithGitHub } = await import('./github');
      const ghConfig = getGithubConfig();
      if (ghConfig.token && ghConfig.repo) {
        const yearKey = getDataKey(year);
        // 비동기로 GitHub 업로드 시도 (백그라운드 진행)
        syncWithGitHub('upload', yearKey, JSON.stringify(dataWithTs))
          .then(res => {
            if (res) console.log(`[Storage] Auto-synced data to GitHub: ${yearKey}`);
          })
          .catch(err => {
            console.warn('[Storage] Auto-sync to GitHub failed silently', err);
          });
      }
    } catch (ghErr) {
      console.warn('[Storage] GitHub auto-sync import failed', ghErr);
    }

    // 3. 서버 API — 반드시 평문(plainData) 전달 (암호화 제외)
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrls = ['/api/save-asset'];
    if (isLocalhost) {
      apiUrls.push(
        'http://localhost:5500/api/save-asset',
        'http://127.0.0.1:5500/api/save-asset'
      );
    }

    let apiSaved = false;
    for (const url of apiUrls) {
      try {
        const response = await fetchWithTimeout(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ year, data: dataWithTs }),
          timeout: 1000
        });
        if (response.ok) {
          console.log(`[Storage] Successfully saved data to server via API: ${url}`);
          apiSaved = true;
          break;
        }
      } catch (err) {
        // Silent fallback — 서버가 꺼져 있거나 GitHub Pages 환경에서는 정상
      }
    }

    if (!apiSaved) {
      console.warn('[Storage] Server API not reachable. Data saved to localStorage & GitHub auto-sync.');
    }
    return apiSaved;
  } catch (e) {
    console.error('Failed to save data', e);
    return false;
  }
}


// 특정 연도 데이터 불러오기
export async function loadData(year) {
  try {
    let data = null;
    const timestamp = Date.now();
    const yearKey = getDataKey(year);

    // 0. GitHub API 자동 다운로드 시도 (설정된 경우 최신 데이터 불러오기)
    try {
      const { getGithubConfig, syncWithGitHub } = await import('./github');
      const ghConfig = getGithubConfig();
      if (ghConfig.token && ghConfig.repo) {
        const ghData = await syncWithGitHub('download', yearKey);
        if (ghData) {
          const localRaw = localStorage.getItem(yearKey);
          let useGhData = true;
          if (localRaw) {
            try {
              const localData = JSON.parse(localRaw);
              const localTs = localData.updatedAt || parseInt(localStorage.getItem(`${yearKey}_updatedAt`) || '0', 10);
              const ghTs = ghData.updatedAt || 0;
              if (ghTs < localTs) {
                useGhData = false;
                data = localData;
                console.log('[Storage] Local data is newer than GitHub data. Using local data.');
              }
            } catch (pErr) {
              console.warn('[Storage] Error parsing local data for GH comparison', pErr);
            }
          }

          if (useGhData) {
            data = ghData;
            localStorage.setItem(yearKey, JSON.stringify(ghData));
            if (ghData.updatedAt) {
              localStorage.setItem(`${yearKey}_updatedAt`, String(ghData.updatedAt));
            }
            console.log('[Storage] Successfully loaded & synced latest data from GitHub.');
          }
        }
      }
    } catch (ghLoadErr) {
      console.warn('[Storage] GitHub auto-download failed, falling back to server/local', ghLoadErr);
    }

    // 1. 서버의 JSON 파일들로부터 데이터 로드 시도 (GitHub 데이터가 없는 경우)
    if (!data) {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const urls = [
        `/asset/data/assetData_${year}.json?t=${timestamp}`,
        `../../data/assetData_${year}.json?t=${timestamp}`
      ];
      if (isLocalhost) {
        urls.push(
          `http://localhost:5500/asset/data/assetData_${year}.json?t=${timestamp}`,
          `http://127.0.0.1:5500/asset/data/assetData_${year}.json?t=${timestamp}`
        );
      }

      for (const url of urls) {
        try {
          const res = await fetchWithTimeout(url, { timeout: 1200 });
          if (res.ok) {
            const serverData = await res.json();
            if (!serverData) continue;
            
            console.log(`[Storage] Loaded data from server: ${url}`);
            
            const localRaw = localStorage.getItem(getDataKey(year));
            let shouldOverwrite = true;
            
            if (localRaw) {
              try {
                const localData = JSON.parse(localRaw);
                const localUpdatedAt = localData.updatedAt || parseInt(localStorage.getItem(`${getDataKey(year)}_updatedAt`) || '0', 10);
                const serverUpdatedAt = serverData.updatedAt || 0;
                
                if (serverUpdatedAt < localUpdatedAt) {
                  console.warn(`[Storage] Server data is older. Keeping local changes.`);
                  shouldOverwrite = false;
                  data = localData;
                }
              } catch (err) {
                console.error('[Storage] Error comparing timestamps', err);
              }
            }
            
            if (shouldOverwrite) {
              data = serverData;
              localStorage.setItem(getDataKey(year), JSON.stringify(serverData));
              if (serverData.updatedAt) {
                localStorage.setItem(`${getDataKey(year)}_updatedAt`, String(serverData.updatedAt));
              }
            }
            break;
          }
        } catch (err) {
          // Silent fallback
        }
      }
    }

    // 2. 로컬 스토리지에서 데이터 로드
    if (!data) {
      let raw = localStorage.getItem(getDataKey(year));
      if (raw) {
        data = JSON.parse(raw);
      }
    }

    if (!data) return null;

    if (data._isEncrypted) {
      const password = sessionStorage.getItem('temp_master_pw');
      if (!password) {
        throw new Error("Data is encrypted but no password in session.");
      }
      const decrypted = await decryptData(data, password);
      if (!decrypted) {
        throw new Error("Decryption failed. Invalid password or corrupted data.");
      }
      data = decrypted;
    }
    
    // Restore accounts from data backup if present
    if (data && data._secureAccounts) {
      try {
        const accs = JSON.parse(decodeURIComponent(atob(data._secureAccounts)));
        if (Array.isArray(accs) && accs.length > 0) {
          localStorage.setItem('assetAccounts', JSON.stringify(accs));
        }
      } catch (err) {
        console.warn('Failed to restore accounts from backup', err);
      }
    }
    
    return data;
  } catch (e) {
    console.error('Failed to load data', e);
    throw e; // Propagate error
  }
}

// 빈 월 데이터 구조 반환
export function emptyMonthSections() {
  return {
    cash: [],
    'non-cash': [],
    income: [],
    'real-estate': [],
    retirement: [],
    debt: [],
    'v-expense': [],
    'f-expense': [],
    'y-expense': [],
    installment: [],
  };
}

// 세션 스토리지 기반 로그인 상태 및 로컬 스토리지 기반 자동 로그인 (1개월 만료)
export function getSession() {
  let loggedIn = sessionStorage.getItem('assetLoginSession') === 'true';
  let userId = sessionStorage.getItem('assetUserId') || '';
  let userName = sessionStorage.getItem('assetUserName') || '';
  let masterPw = sessionStorage.getItem('temp_master_pw') || '';
  let isAdmin = sessionStorage.getItem('assetIsAdmin') === 'true';

  // 세션이 없고 자동로그인이 켜져 있는 경우 복원 처리
  if (!loggedIn && localStorage.getItem('assetAutoLogin') === 'true') {
    const expireStr = localStorage.getItem('assetAutoLoginExpire');
    if (expireStr) {
      const expireTime = parseInt(expireStr, 10);
      if (Date.now() < expireTime) {
        userId = localStorage.getItem('assetAutoLogin_userId') || '';
        userName = localStorage.getItem('assetAutoLogin_userName') || '';
        masterPw = localStorage.getItem('assetAutoLogin_masterPw') || '';
        isAdmin = localStorage.getItem('assetAutoLogin_isAdmin') === 'true';
        loggedIn = true;

        // sessionStorage에 복원 기입
        sessionStorage.setItem('assetLoginSession', 'true');
        sessionStorage.setItem('assetUserId', userId);
        sessionStorage.setItem('assetUserName', userName);
        sessionStorage.setItem('temp_master_pw', masterPw);
        sessionStorage.setItem('assetIsAdmin', String(isAdmin));
      } else {
        // 만료 시 정보 파기
        clearAutoLogin();
      }
    }
  }

  return { loggedIn, userId, userName, masterPw, isAdmin };
}

export function setSession(data, keepLoggedIn = false) {
  sessionStorage.setItem('assetLoginSession', 'true');
  sessionStorage.setItem('assetUserId', data.userId || '');
  sessionStorage.setItem('assetUserName', data.userName || '');
  sessionStorage.setItem('temp_master_pw', data.masterPw || '');
  sessionStorage.setItem('assetIsAdmin', String(!!data.isAdmin));

  if (keepLoggedIn) {
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    const expireTime = Date.now() + oneMonth;

    localStorage.setItem('assetAutoLogin', 'true');
    localStorage.setItem('assetAutoLoginExpire', String(expireTime));
    localStorage.setItem('assetAutoLogin_userId', data.userId || '');
    localStorage.setItem('assetAutoLogin_userName', data.userName || '');
    localStorage.setItem('assetAutoLogin_masterPw', data.masterPw || '');
    localStorage.setItem('assetAutoLogin_isAdmin', String(!!data.isAdmin));
  } else {
    clearAutoLogin();
  }
}

export function clearSession() {
  sessionStorage.removeItem('assetLoginSession');
  sessionStorage.removeItem('assetUserId');
  sessionStorage.removeItem('assetUserName');
  sessionStorage.removeItem('temp_master_pw');
  sessionStorage.removeItem('assetIsAdmin');

  clearAutoLogin();
}

function clearAutoLogin() {
  localStorage.removeItem('assetAutoLogin');
  localStorage.removeItem('assetAutoLoginExpire');
  localStorage.removeItem('assetAutoLogin_userId');
  localStorage.removeItem('assetAutoLogin_userName');
  localStorage.removeItem('assetAutoLogin_masterPw');
  localStorage.removeItem('assetAutoLogin_isAdmin');
}

// 계정 데이터 저장 (로컬스토리지)
export function getAccounts() {
  try {
    // Original asset.html used assetManagerAccounts sometimes but also assetAccounts.
    // The problem statement says data isn't loaded. Accounts seem to be there.
    const raw = localStorage.getItem('assetAccounts');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

export function saveAccounts(accounts) {
  localStorage.setItem('assetAccounts', JSON.stringify(accounts));
}
