/**
 * 로컬 스토리지 기반 데이터 저장/불러오기
 */

import { encryptData, decryptData } from './crypto';

const DATA_KEY_PREFIX = 'assetData_';

export function getDataKey(year) {
  return `${DATA_KEY_PREFIX}${year}`;
}

// 특정 연도 데이터 저장
export async function saveData(year, data) {
  try {
    const password = sessionStorage.getItem('temp_master_pw');
    let dataToSave = data;
    if (password) {
      dataToSave = await encryptData(data, password);
    }

    // 1. 항상 로컬 스토리지에 백업 저장
    localStorage.setItem(getDataKey(year), JSON.stringify(dataToSave));

    // 2. 서버 API를 호출하여 서버 파일에 저장 시도
    const apiUrls = [
      '/api/save-asset',
      'http://localhost:5500/api/save-asset',
      'http://127.0.0.1:5500/api/save-asset'
    ];

    let apiSaved = false;
    for (const url of apiUrls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ year, data: dataToSave }),
        });
        if (response.ok) {
          console.log(`[Storage] Successfully saved data to server via API: ${url}`);
          apiSaved = true;
          break;
        }
      } catch (err) {
        // Silent fallback
      }
    }

    if (!apiSaved) {
      console.warn('[Storage] Server save API failed. Data is saved in localStorage only.');
    }
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

// 특정 연도 데이터 불러오기
export async function loadData(year) {
  try {
    let data = null;
    const timestamp = Date.now();

    // 1. 서버의 JSON 파일들로부터 최신 데이터 로드 시도 (캐시 버스터 쿼리 추가)
    const urls = [
      `/asset/data/assetData_${year}.json?t=${timestamp}`,
      `../../data/assetData_${year}.json?t=${timestamp}`,
      `http://localhost:5500/asset/data/assetData_${year}.json?t=${timestamp}`,
      `http://127.0.0.1:5500/asset/data/assetData_${year}.json?t=${timestamp}`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url);
        if (res.ok) {
          data = await res.json();
          console.log(`[Storage] Loaded latest data directly from server: ${url}`);
          // 서버에서 받아온 최신 데이터를 로컬 스토리지에도 동기화
          localStorage.setItem(getDataKey(year), JSON.stringify(data));
          break;
        }
      } catch (err) {
        // Silent fallback
      }
    }

    // 2. 서버 로드 실패 시 로컬 스토리지에서 데이터 로드
    if (!data) {
      console.warn(`[Storage] Server data load failed. Falling back to localStorage.`);
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

// 세션 스토리지 기반 로그인 상태
export function getSession() {
  return {
    loggedIn: sessionStorage.getItem('assetLoginSession') === 'true',
    userId: sessionStorage.getItem('assetUserId') || '',
    userName: sessionStorage.getItem('assetUserName') || '',
    masterPw: sessionStorage.getItem('temp_master_pw') || '',
    isAdmin: sessionStorage.getItem('assetIsAdmin') === 'true',
  };
}

export function setSession(data) {
  sessionStorage.setItem('assetLoginSession', 'true');
  sessionStorage.setItem('assetUserId', data.userId || '');
  sessionStorage.setItem('assetUserName', data.userName || '');
  sessionStorage.setItem('temp_master_pw', data.masterPw || '');
  sessionStorage.setItem('assetIsAdmin', String(!!data.isAdmin));
}

export function clearSession() {
  sessionStorage.removeItem('assetLoginSession');
  sessionStorage.removeItem('assetUserId');
  sessionStorage.removeItem('assetUserName');
  sessionStorage.removeItem('temp_master_pw');
  sessionStorage.removeItem('assetIsAdmin');
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
