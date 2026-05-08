import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AppData, Category, Article, GitHubConfig, DataSource } from '../types';
import { loadData, saveData, createCategory, updateCategory, deleteCategory, createArticle, updateArticle, deleteArticle } from '../services/storage';
import { getGitHubConfig, saveGitHubConfig, downloadFromGitHub, uploadToGitHub } from '../services/github';

interface StoreContextType {
  data: AppData;
  dataSource: DataSource;
  ghConfig: GitHubConfig;
  // Category actions
  addCategory: (input: Omit<Category, 'id' | 'createdAt' | 'order'>) => void;
  editCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  // Article actions
  addArticle: (input: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  // GitHub actions
  updateGhConfig: (config: GitHubConfig) => void;
  syncDown: () => Promise<void>;
  syncUp: () => Promise<void>;
  // Toast
  toast: string | null;
  showToast: (msg: string) => void;
  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadData);
  const [ghConfig, setGhConfig] = useState<GitHubConfig>(getGitHubConfig);
  const [dataSource, setDataSource] = useState<DataSource>('local');
  const [toast, setToast] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('learnVaultTheme') as 'dark' | 'light') || 'dark';
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('learnVaultTheme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  // Persist to localStorage on change
  const persistAndSync = useCallback((newData: AppData) => {
    setData(newData);
    saveData(newData);
    // Auto upload in background
    if (ghConfig.token && ghConfig.autoSync) {
      uploadToGitHub(ghConfig, newData).then(ok => {
        if (ok) setDataSource('github');
      }).catch(console.error);
    }
  }, [ghConfig]);

  // Category actions
  const addCategory = useCallback((input: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    const newData = createCategory(data, input);
    persistAndSync(newData);
    showToast('카테고리가 추가되었습니다');
  }, [data, persistAndSync, showToast]);

  const editCategory = useCallback((id: string, updates: Partial<Category>) => {
    const newData = updateCategory(data, id, updates);
    persistAndSync(newData);
    showToast('카테고리가 수정되었습니다');
  }, [data, persistAndSync, showToast]);

  const removeCategory = useCallback((id: string) => {
    const newData = deleteCategory(data, id);
    persistAndSync(newData);
    showToast('카테고리가 삭제되었습니다');
  }, [data, persistAndSync, showToast]);

  // Article actions
  const addArticle = useCallback((input: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newData = createArticle(data, input);
    persistAndSync(newData);
    showToast('아티클이 저장되었습니다');
  }, [data, persistAndSync, showToast]);

  const editArticle = useCallback((id: string, updates: Partial<Article>) => {
    const newData = updateArticle(data, id, updates);
    persistAndSync(newData);
    showToast('아티클이 수정되었습니다');
  }, [data, persistAndSync, showToast]);

  const removeArticle = useCallback((id: string) => {
    const newData = deleteArticle(data, id);
    persistAndSync(newData);
    showToast('아티클이 삭제되었습니다');
  }, [data, persistAndSync, showToast]);

  // GitHub actions
  const updateGhConfig = useCallback((config: GitHubConfig) => {
    setGhConfig(config);
    saveGitHubConfig(config);
    showToast('GitHub 설정이 저장되었습니다');
  }, [showToast]);

  const syncDown = useCallback(async () => {
    setDataSource('syncing');
    const result = await downloadFromGitHub<AppData>(ghConfig);
    if (result && result.categories && result.articles) {
      setData(result);
      saveData(result);
      setDataSource('github');
      showToast('GitHub에서 데이터를 불러왔습니다');
    } else {
      setDataSource('local');
      showToast('GitHub 데이터가 없거나 불러오기에 실패했습니다');
    }
  }, [ghConfig, showToast]);

  const syncUp = useCallback(async () => {
    setDataSource('syncing');
    const ok = await uploadToGitHub(ghConfig, data);
    setDataSource(ok ? 'github' : 'local');
    showToast(ok ? 'GitHub에 업로드 완료' : '업로드 실패');
  }, [ghConfig, data, showToast]);

  // Initial background sync
  useEffect(() => {
    if (ghConfig.token && ghConfig.autoSync) {
      setDataSource('syncing');
      downloadFromGitHub<AppData>(ghConfig).then(result => {
        if (result && result.categories && result.articles) {
          setData(result);
          saveData(result);
          setDataSource('github');
        } else {
          setDataSource('local');
        }
      }).catch(() => setDataSource('local'));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoreContext.Provider value={{
      data, dataSource, ghConfig,
      addCategory, editCategory, removeCategory,
      addArticle, editArticle, removeArticle,
      updateGhConfig, syncDown, syncUp,
      toast, showToast,
      theme, toggleTheme,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
