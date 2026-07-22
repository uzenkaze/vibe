import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  const saveTimeoutRef = useRef(null);

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

  // Active nav section ('dashboard' 기본 세팅 및 URL 파라미터 지원)
  const [navSection, setNavSection] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const nav = params.get('nav') || params.get('tab');
    if (nav && ['dashboard', 'assets', 'expenses', 'installment', 'cardPayments', 'pension'].includes(nav)) {
      return nav;
    }
    return 'dashboard';
  });

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

  const login = useCallback((userId, userName, masterPw, isAdmin, keepLoggedIn = false) => {
    setSession({ userId, userName, masterPw, isAdmin }, keepLoggedIn);
    setSessionState({ loggedIn: true, userId, userName, masterPw, isAdmin });
    setScreen('dashboard');
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState({ loggedIn: false });
    setScreen('landing');
  }, []);

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
      // 전년도 데이터도 미리 캐싱해둠 (전월대비 1월 연산을 위함)
      const prevYear = String(parseInt(year) - 1);
      loadYearData(prevYear);
    }
  }, [screen, year, loadYearData]);

  // --- Persist ---
  const persistSections = useCallback(async (sections, isManual = false) => {
    const yd = JSON.parse(JSON.stringify(yearData[year] || { year, months: {} }));
    yd.year = year;
    if (!yd.months) yd.months = {};
    if (!yd.months[month]) yd.months[month] = {};
    yd.months[month].sections = sections;

    // 1. 화면 즉시 반영 (React State)
    setYearData(prev => ({ ...prev, [year]: yd }));

    // 2. 로컬 스토리지 즉시 백업 (유실 방지)
    const password = sessionStorage.getItem('temp_master_pw');
    const updatedAt = Date.now();
    yd.updatedAt = updatedAt;

    // 항상 원본(복호화 가능) 데이터를 plainYd로 보관
    const plainYd = JSON.parse(JSON.stringify(yd));

    let dataToSave = yd;
    try {
      if (password) {
        const { encryptData } = await import('../utils/crypto');
        dataToSave = await encryptData(yd, password);
        dataToSave.updatedAt = updatedAt;
      } else {
        dataToSave.updatedAt = updatedAt;
      }
      localStorage.setItem(`assetData_${year}`, JSON.stringify(dataToSave));
      localStorage.setItem(`assetData_${year}_updatedAt`, String(updatedAt));
    } catch (err) {
      console.error('[AppContext] Failed to update localStorage backing store', err);
    }

    // 3. 디바운스 타이머 처리
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (isManual) {
      // 수동 저장(저장 버튼) 클릭 시: 즉시 서버/GitHub 동기화
      try {
        // 3-1. 로컬 서버 API 저장 시도 (plainYd 원본 전달)
        const apiSaved = await saveData(year, plainYd);

        // 3-2. GitHub PAT 설정이 있으면 GitHub에도 동기화
        const ghConfig = getGithubConfig();
        if (ghConfig.token && ghConfig.repo) {
          try {
            // 반드시 평문(plain) 데이터를 GitHub에 업로드
            const syncSuccess = await syncWithGitHub(
              'upload',
              `assetData_${year}`,
              JSON.stringify(plainYd)
            );
            if (syncSuccess) {
              return { success: true, target: 'github' };
            } else {
              return { success: true, target: 'local_only_sync_fail', error: '동기화 응답 실패' };
            }
          } catch (syncErr) {
            console.error('[AppContext] GitHub Sync failed:', syncErr);
            return { success: true, target: 'local_only_sync_fail', error: syncErr.message || String(syncErr) };
          }
        }

        // 3-3. GitHub 미설정 → 서버 API 저장 결과 반환
        return { success: true, target: apiSaved ? 'server' : 'local' };
      } catch (e) {
        console.error('Failed to save sections manually', e);
        return { success: false, error: e };
      }
    } else {
      // 자동 저장(수정/타이핑 등): 2초 디바운싱 후 백그라운드 동기화
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          console.log('[AppContext] Auto saving via debounce...');
          await saveData(year, plainYd);
          const ghConfig = getGithubConfig();
          if (ghConfig.autoSync && ghConfig.token && ghConfig.repo) {
            const syncSuccess = await syncWithGitHub(
              'upload',
              `assetData_${year}`,
              JSON.stringify(plainYd)
            );
            if (syncSuccess) {
              showToast('☁️ 자동 저장 및 GitHub 동기화 완료', 'success');
            }
          }
        } catch (e) {
          console.error('[AppContext] Background auto-save failed', e);
        }
      }, 2000);

      return { success: true, target: 'local_pending_sync' };
    }
  }, [year, month, yearData, showToast]);


  const persistPension = useCallback(async (pensionData) => {
    const yd = JSON.parse(JSON.stringify(yearData[year] || { year, months: {} }));
    yd.year = year;
    if (!yd.months) yd.months = {};
    if (!yd.months[month]) yd.months[month] = {};
    yd.months[month].pension = pensionData;
    yd.updatedAt = Date.now();

    // 원본 데이터 보관
    const plainYd = JSON.parse(JSON.stringify(yd));

    setYearData(prev => ({ ...prev, [year]: yd }));

    try {
      const apiSaved = await saveData(year, plainYd);
      const ghConfig = getGithubConfig();
      if (ghConfig.token && ghConfig.repo) {
        const syncSuccess = await syncWithGitHub(
          'upload',
          `assetData_${year}`,
          JSON.stringify(plainYd)
        );
        return { success: true, target: syncSuccess ? 'github' : 'local_only_sync_fail' };
      }
      return { success: true, target: apiSaved ? 'server' : 'local' };
    } catch (e) {
      console.error('Failed to save pension', e);
      return { success: false, error: e };
    }
  }, [year, month, yearData]);

  const persistYearData = useCallback(async (targetYear, data) => {
    const plainData = JSON.parse(JSON.stringify({ ...data, updatedAt: Date.now() }));
    setYearData(prev => ({ ...prev, [targetYear]: plainData }));

    try {
      const apiSaved = await saveData(targetYear, plainData);
      const ghConfig = getGithubConfig();
      if (ghConfig.token && ghConfig.repo) {
        const syncSuccess = await syncWithGitHub(
          'upload',
          `assetData_${targetYear}`,
          JSON.stringify(plainData)
        );
        return { success: true, target: syncSuccess ? 'github' : 'local_only_sync_fail' };
      }
      return { success: true, target: apiSaved ? 'server' : 'local' };
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



  const getPrevMonthCompareData = useCallback(() => {
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevYearStr = String(prevYear);
    const prevMonthStr = String(prevMonth).padStart(2, '0');

    const currentSections = getCurrentSections();
    const currentDebtList = currentSections.debt || [];
    const currentFExpense = currentSections['f-expense'] || [];
    const currentVExpense = currentSections['v-expense'] || [];
    const currentInstallments = currentSections.installment || [];

    const curDebtTotal = currentDebtList.reduce((sum, item) => sum + (Number(item.remAmount) || 0), 0);
    
    const curInstallmentTotal = currentInstallments.reduce((sum, item) => {
      if (item.repayStatus === 'full') return sum;
      let calculatedEndDate = '';
      if (item.date && item.totalMonths) {
        const p = item.date.split(/[-./ ]/);
        if (p.length >= 2) {
          let y = parseInt(p[0]), m = parseInt(p[1]) + (parseInt(item.totalMonths) || 1);
          y += Math.floor((m - 1) / 12);
          m = (m - 1) % 12 + 1;
          calculatedEndDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
        }
      }
      if (!calculatedEndDate) calculatedEndDate = item.endDate;
      const currentMonthStr = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
      if (calculatedEndDate && calculatedEndDate < currentMonthStr) return sum;
      
      if (item.date) {
        const p = item.date.split(/[-./ ]/);
        if (p.length >= 2) {
          const startY = parseInt(p[0]), startM = parseInt(p[1]);
          const elapsed = (parseInt(year) - startY) * 12 + (parseInt(month) - startM) + 1;
          if (elapsed >= 1 && elapsed <= (parseInt(item.totalMonths) || 1)) {
            const isPaid = item.paidMonths && item.paidMonths.includes(elapsed);
            if (!isPaid) {
              const base = Math.floor((Number(item.amount) || 0) / (Number(item.totalMonths) || 1));
              const monthlyFee = Number(item.fee) || 0;
              return sum + base + monthlyFee;
            }
          }
        }
      }
      return sum;
    }, 0);

    const curFExpTotal = currentFExpense.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const curVExpTotal = currentVExpense.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const curExpenseTotal = curFExpTotal + curVExpTotal + curInstallmentTotal;

    const curCardTotal = curInstallmentTotal + 
      [...currentFExpense, ...currentVExpense].reduce((sum, item) => {
        const cat = String(item.category || '').toLowerCase();
        const dsc = String(item.desc || '').toLowerCase();
        if (cat.includes('카드') || cat.includes('신용') || cat.includes('체크') || dsc.includes('카드')) {
          return sum + (Number(item.amount) || 0);
        }
        return sum;
      }, 0);

    const prevYd = yearData[prevYearStr] || {};
    const prevMonths = prevYd.months || {};
    const prevMonthData = prevMonths[prevMonthStr] || {};
    const prevSections = prevMonthData.sections;

    if (!prevSections) {
      return {
        hasPrev: false,
        debtDiff: 0, debtRate: 0,
        expenseDiff: 0, expenseRate: 0,
        cardDiff: 0, cardRate: 0
      };
    }

    const prevDebtList = prevSections.debt || [];
    const prevFExpense = prevSections['f-expense'] || [];
    const prevVExpense = prevSections['v-expense'] || [];
    const prevInstallments = prevSections.installment || [];

    const prevDebtTotal = prevDebtList.reduce((sum, item) => sum + (Number(item.remAmount) || 0), 0);
    
    const prevInstallmentTotal = prevInstallments.reduce((sum, item) => {
      if (item.repayStatus === 'full') return sum;
      let calculatedEndDate = '';
      if (item.date && item.totalMonths) {
        const p = item.date.split(/[-./ ]/);
        if (p.length >= 2) {
          let y = parseInt(p[0]), m = parseInt(p[1]) + (parseInt(item.totalMonths) || 1);
          y += Math.floor((m - 1) / 12);
          m = (m - 1) % 12 + 1;
          calculatedEndDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
        }
      }
      if (!calculatedEndDate) calculatedEndDate = item.endDate;
      const prevMonthStrVal = `${String(prevYear).substring(2)}.${String(prevMonth).padStart(2, '0')}`;
      if (calculatedEndDate && calculatedEndDate < prevMonthStrVal) return sum;
      
      if (item.date) {
        const p = item.date.split(/[-./ ]/);
        if (p.length >= 2) {
          const startY = parseInt(p[0]), startM = parseInt(p[1]);
          const elapsed = (parseInt(prevYear) - startY) * 12 + (parseInt(prevMonth) - startM) + 1;
          if (elapsed >= 1 && elapsed <= (parseInt(item.totalMonths) || 1)) {
            const isPaid = item.paidMonths && item.paidMonths.includes(elapsed);
            if (!isPaid) {
              const base = Math.floor((Number(item.amount) || 0) / (Number(item.totalMonths) || 1));
              const monthlyFee = Number(item.fee) || 0;
              return sum + base + monthlyFee;
            }
          }
        }
      }
      return sum;
    }, 0);

    const prevFExpTotal = prevFExpense.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const prevVExpTotal = prevVExpense.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const prevExpenseTotal = prevFExpTotal + prevVExpTotal + prevInstallmentTotal;

    const prevCardTotal = prevInstallmentTotal + 
      [...prevFExpense, ...prevVExpense].reduce((sum, item) => {
        const cat = String(item.category || '').toLowerCase();
        const dsc = String(item.desc || '').toLowerCase();
        if (cat.includes('카드') || cat.includes('신용') || cat.includes('체크') || dsc.includes('카드')) {
          return sum + (Number(item.amount) || 0);
        }
        return sum;
      }, 0);

    const calcDiffAndRate = (cur, prev) => {
      const diff = cur - prev;
      const rate = prev === 0 ? (cur === 0 ? 0 : 100) : (diff / prev) * 100;
      return { diff, rate };
    };

    const debtStats = calcDiffAndRate(curDebtTotal, prevDebtTotal);
    const expenseStats = calcDiffAndRate(curExpenseTotal, prevExpenseTotal);
    const cardStats = calcDiffAndRate(curCardTotal, prevCardTotal);

    return {
      hasPrev: true,
      curDebtTotal, prevDebtTotal,
      debtDiff: debtStats.diff, debtRate: debtStats.rate,
      curExpenseTotal, prevExpenseTotal,
      expenseDiff: expenseStats.diff, expenseRate: expenseStats.rate,
      curCardTotal, prevCardTotal,
      cardDiff: cardStats.diff, cardRate: cardStats.rate
    };
  }, [year, month, yearData, getCurrentSections]);

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
      getPrevMonthCompareData,
    }}>
      {children}
    </AppContext.Provider>
  );
}
