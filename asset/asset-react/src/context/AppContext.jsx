import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loadData, saveData, emptyMonthSections,
  getSession, setSession, clearSession, getAccounts, saveAccounts
} from '../utils/storage';
import { getGithubConfig, syncWithGitHub, testGithubConnection } from '../utils/github';
import { getCurrentYearMonth, genId } from '../utils/format';

export const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const { year: curY, month: curM } = getCurrentYearMonth();

  // Auth
  const [session, setSessionState] = useState(getSession);
  const [screen, setScreen] = useState('landing'); // landing | dashboard

  // Date
  const [year, setYear] = useState(curY);
  const [month, setMonth] = useState(curM);

  // Data
  const [yearData, setYearData] = useState({});

  // Theme
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Toast
  const [toasts, setToasts] = useState([]);
  const [activeToastTimeout, setActiveToastTimeout] = useState(null);

  // Active nav section
  const [navSection, setNavSection] = useState('dashboard');

  // GitHub connection status
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  const checkGithubConnection = useCallback(async () => {
    try {
      const connected = await testGithubConnection();
      setIsGithubConnected(connected);
    } catch {
      setIsGithubConnected(false);
    }
  }, []);

  useEffect(() => {
    if (screen === 'dashboard') {
      checkGithubConnection();
    }
  }, [screen, checkGithubConnection]);

  // --- Theme ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(d => !d);

  // --- Auth ---
  useEffect(() => {
    const s = getSession();
    if (s.loggedIn && s.masterPw) {
      setSessionState(s);
      setScreen('dashboard');
    }
  }, []);

  const login = useCallback((userId, userName, masterPw, isAdmin) => {
    setSession({ userId, userName, masterPw, isAdmin });
    setSessionState({ loggedIn: true, userId, userName, masterPw, isAdmin });
    setScreen('dashboard');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState({ loggedIn: false });
    setScreen('landing');
  }, []);

  // --- Data Loading ---
  const getCurrentSections = useCallback(() => {
    const yd = yearData[year] || {};
    const months = yd.months || {};
    const monthData = months[month] || {};
    console.log(`[DEBUG] getCurrentSections for ${year}-${month}`, monthData.sections);
    return monthData.sections || emptyMonthSections();
  }, [yearData, year, month]);

  const getCurrentPension = useCallback(() => {
    const yd = yearData[year] || {};
    const months = yd.months || {};
    const monthData = months[month] || {};
    return monthData.pension || { beforeTax: '', afterTax: '', startDate: '', totalPaid: '', totalPeriod: '' };
  }, [yearData, year, month]);

  const loadYearData = useCallback(async (targetYear) => {
    try {
      const data = await loadData(targetYear);
      if (data) {
        setYearData(prev => ({ ...prev, [targetYear]: data }));
      }
    } catch (e) {
      console.error(`[DEBUG] loadYearData error for ${targetYear}`, e);
      // We can't easily showToast here without adding it to dependencies,
      // but we can alert or let the caller handle it.
      alert(`데이터 불러오기 실패: ${e.message}`);
    }
  }, []);

  // Initial Data Load
  useEffect(() => {
    if (screen === 'dashboard') {
      loadYearData(year);
    }
  }, [screen, year, loadYearData]);

  // --- Persist ---
  const persistSections = useCallback(async (sections) => {
    const yd = JSON.parse(JSON.stringify(yearData[year] || { year, months: {} }));
    yd.year = year;
    if (!yd.months) yd.months = {};
    if (!yd.months[month]) yd.months[month] = {};
    yd.months[month].sections = sections;
    
    setYearData(prev => ({ ...prev, [year]: yd }));

    try {
      await saveData(year, yd);
      const ghConfig = getGithubConfig();
      if (ghConfig.autoSync && ghConfig.token && ghConfig.repo) {
        const syncSuccess = await syncWithGitHub('upload', `assetData_${year}`, JSON.stringify(yd));
        return { success: true, target: syncSuccess ? 'github' : 'local_only_sync_fail' };
      }
      return { success: true, target: 'local' };
    } catch (e) {
      console.error('Failed to save sections', e);
      return { success: false, error: e };
    }
  }, [year, month, yearData]);

  const persistPension = useCallback(async (pensionData) => {
    const yd = JSON.parse(JSON.stringify(yearData[year] || { year, months: {} }));
    yd.year = year;
    if (!yd.months) yd.months = {};
    if (!yd.months[month]) yd.months[month] = {};
    yd.months[month].pension = pensionData;
    
    setYearData(prev => ({ ...prev, [year]: yd }));

    try {
      await saveData(year, yd);
      const ghConfig = getGithubConfig();
      if (ghConfig.autoSync && ghConfig.token && ghConfig.repo) {
        const syncSuccess = await syncWithGitHub('upload', `assetData_${year}`, JSON.stringify(yd));
        return { success: true, target: syncSuccess ? 'github' : 'local_only_sync_fail' };
      }
      return { success: true, target: 'local' };
    } catch (e) {
      console.error('Failed to save pension', e);
      return { success: false, error: e };
    }
  }, [year, month, yearData]);

  const persistYearData = useCallback(async (targetYear, data) => {
    setYearData(prev => ({ ...prev, [targetYear]: data }));

    try {
      await saveData(targetYear, data);
      const ghConfig = getGithubConfig();
      if (ghConfig.autoSync && ghConfig.token && ghConfig.repo) {
        const syncSuccess = await syncWithGitHub('upload', `assetData_${targetYear}`, JSON.stringify(data));
        return { success: true, target: syncSuccess ? 'github' : 'local_only_sync_fail' };
      }
      return { success: true, target: 'local' };
    } catch (e) {
      console.error(`Failed to persist year data for ${targetYear}`, e);
      return { success: false, error: e };
    }
  }, []);


  // --- CRUD ---
  const addRow = useCallback((sectionKey, defaults = {}) => {
    const sections = getCurrentSections();
    const newRow = {
      id: genId(),
      category: '',
      content: '',
      amount: 0,
      desc: '',
      remAmount: 0,
      rate: 0,
      details: [],
      ...defaults,
    };
    const updated = {
      ...sections,
      [sectionKey]: [...(sections[sectionKey] || []), newRow],
    };
    persistSections(updated);
    return newRow.id;
  }, [getCurrentSections, persistSections]);

  const updateRow = useCallback((sectionKey, id, field, value) => {
    const sections = getCurrentSections();
    const updated = {
      ...sections,
      [sectionKey]: (sections[sectionKey] || []).map(row =>
        row.id === id ? { ...row, [field]: value } : row
      ),
    };
    persistSections(updated);
  }, [getCurrentSections, persistSections]);

  const deleteRow = useCallback((sectionKey, id) => {
    const sections = getCurrentSections();
    const updated = {
      ...sections,
      [sectionKey]: (sections[sectionKey] || []).filter(r => r.id !== id),
    };
    persistSections(updated);
  }, [getCurrentSections, persistSections]);

  // --- Toast ---
  const showToast = useCallback((message, type = 'success') => {
    setToasts(prev => {
      if (prev.length > 0) {
        const updatedToast = { ...prev[0], message, type };
        setActiveToastTimeout(oldTimeout => {
          if (oldTimeout) clearTimeout(oldTimeout);
          return setTimeout(() => {
            setToasts(current => current.filter(t => t.id !== updatedToast.id));
          }, 3000);
        });
        return [updatedToast];
      }

      const id = genId();
      const newToast = { id, message, type };
      setActiveToastTimeout(oldTimeout => {
        if (oldTimeout) clearTimeout(oldTimeout);
        return setTimeout(() => {
          setToasts(current => current.filter(t => t.id !== id));
        }, 3000);
      });
      return [newToast];
    });
  }, []);

  // --- Accounts ---
  const [accounts, setAccounts] = useState(getAccounts);

  const saveAccountsAndUpdate = useCallback((accs) => {
    saveAccounts(accs);
    setAccounts(accs);
  }, []);

  return (
    <AppContext.Provider value={{
      session, screen, setScreen,
      year, setYear,
      month, setMonth,
      yearData,
      dark, toggleTheme,
      toasts, showToast,
      navSection, setNavSection,
      getCurrentSections, getCurrentPension,
      loadYearData,
      persistSections, persistPension, persistYearData,
      addRow, updateRow, deleteRow,
      login, logout,
      accounts, saveAccountsAndUpdate,
      isGithubConnected, checkGithubConnection,
    }}>
      {children}
    </AppContext.Provider>
  );
}
