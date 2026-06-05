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
    if (password) {
      const encrypted = await encryptData(data, password);
      localStorage.setItem(getDataKey(year), JSON.stringify(encrypted));
    } else {
      localStorage.setItem(getDataKey(year), JSON.stringify(data));
    }
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

// 특정 연도 데이터 불러오기
export async function loadData(year) {
  try {
    const raw = localStorage.getItem(getDataKey(year));
    if (!raw) return null;
    
    let data = JSON.parse(raw);
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
          // If no accounts exist or we want to merge/overwrite. 
          // Original app overwrote it:
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
