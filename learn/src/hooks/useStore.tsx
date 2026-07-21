import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import type { AppData, Category, Article, GitHubConfig, DataSource, Memo } from '../types';
import { loadData, saveData, createCategory, updateCategory, deleteCategory, updateCategories, createArticle, updateArticle, deleteArticle, createMemo, deleteMemo, restoreMemo, permanentlyDeleteMemo, emptyTrash, reorderMemos, updateMemo, createMemoFolder, deleteMemoFolder, updateMemoFolder, updateMindmap } from '../services/storage';
import { getGitHubConfig, saveGitHubConfig, downloadFromGitHub, uploadToGitHub } from '../services/github';

interface StoreContextType {
  data: AppData;
  dataSource: DataSource;
  ghConfig: GitHubConfig;
  // Category actions
  addCategory: (input: Omit<Category, 'id' | 'createdAt' | 'order'>) => void;
  editCategory: (id: string, updates: Partial<Category>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (categories: Category[]) => void;
  // Article actions
  addArticle: (input: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editArticle: (id: string, updates: Partial<Article>) => void;
  removeArticle: (id: string) => void;
  // Memo actions
  addMemo: (content: string, color: string, title?: string, folderId?: string) => void;
  removeMemo: (id: string) => void;
  editMemo: (id: string, content: string, title?: string, updates?: Partial<Memo>) => void;
  restoreMemo: (id: string) => void;
  permanentlyDeleteMemo: (id: string) => void;
  emptyTrash: () => void;
  reorderMemos: (memos: Memo[]) => void;
  // Memo Folder actions
  addMemoFolder: (name: string, color: string) => void;
  removeMemoFolder: (id: string) => void;
  editMemoFolder: (id: string, name: string, color: string) => void;
  setMindmap: (mindmap: any) => void;
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
    return (localStorage.getItem('learnVaultTheme') as 'dark' | 'light') || 'light';
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
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  // Persist to localStorage and trigger background sync
  const persistAndSync = useCallback(async (newData: AppData) => {
    setData(newData);
    saveData(newData);
    dataRef.current = newData; // Update ref immediately
    
    if (ghConfig.token && ghConfig.autoSync) {
      setDataSource('syncing');
      const uploadOk = await uploadToGitHub(ghConfig, newData);
      
      if (uploadOk) {
        setDataSource('github');
        return;
      }
      // 실패 시에도 'local'로 영구 격하하지 않고 설정에 따라 'github' 모드를 유지하되 토스트 안내
      setDataSource('github');
      showToast('GitHub 자동 동기화 일시 지연 (나중에 재시도됨)');
    } else {
      setDataSource('local');
    }
  }, [ghConfig, showToast]);

  // functional helper for state updates
  const updateData = useCallback(async (fn: (prev: AppData) => AppData) => {
    const next = fn(dataRef.current); // Using ref to prevent infinite loops
    await persistAndSync(next);
  }, [persistAndSync]);

  // Category actions
  const addCategory = useCallback((input: Omit<Category, 'id' | 'createdAt' | 'order'>) => {
    updateData(prev => createCategory(prev, input));
    showToast('카테고리가 추가되었습니다');
  }, [updateData, showToast]);

  const editCategory = useCallback((id: string, updates: Partial<Category>) => {
    updateData(prev => updateCategory(prev, id, updates));
    showToast('카테고리가 수정되었습니다');
  }, [updateData, showToast]);

  const removeCategory = useCallback((id: string) => {
    updateData(prev => deleteCategory(prev, id));
    showToast('카테고리가 삭제되었습니다');
  }, [updateData, showToast]);

  const reorderCategories = useCallback((categories: Category[]) => {
    updateData(prev => updateCategories(prev, categories));
  }, [updateData]);

  // Article actions
  const addArticle = useCallback((input: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    updateData(prev => createArticle(prev, input));
    showToast('아티클이 저장되었습니다');
  }, [updateData, showToast]);

  const editArticle = useCallback((id: string, updates: Partial<Article>) => {
    updateData(prev => updateArticle(prev, id, updates));
    showToast('아티클이 수정되었습니다');
  }, [updateData, showToast]);

  const removeArticle = useCallback((id: string) => {
    updateData(prev => deleteArticle(prev, id));
    showToast('아티클이 삭제되었습니다');
  }, [updateData, showToast]);

  // Memo actions
  const addMemo = useCallback((content: string, color: string, title: string = '', folderId?: string) => {
    updateData(prev => createMemo(prev, content, color, title, folderId));
  }, [updateData]);

  const removeMemo = useCallback((id: string) => {
    updateData(prev => deleteMemo(prev, id));
    showToast('메모가 삭제되었습니다');
  }, [updateData, showToast]);

  const restoreMemoAction = useCallback((id: string) => {
    updateData(prev => restoreMemo(prev, id));
    showToast('메모가 복구되었습니다');
  }, [updateData, showToast]);

  const permanentlyDeleteMemoAction = useCallback((id: string) => {
    updateData(prev => permanentlyDeleteMemo(prev, id));
    showToast('메모가 영구 삭제되었습니다');
  }, [updateData, showToast]);

  const emptyTrashAction = useCallback(() => {
    updateData(prev => emptyTrash(prev));
    showToast('휴지통을 비웠습니다');
  }, [updateData, showToast]);

  const reorderMemosAction = useCallback((memos: any[]) => {
    updateData(prev => reorderMemos(prev, memos));
  }, [updateData]);

  const editMemo = useCallback((id: string, content: string, title?: string, updates?: Partial<Memo>) => {
    updateData(prev => updateMemo(prev, id, content, title, updates));
  }, [updateData]);

  const addMemoFolder = useCallback((name: string, color: string) => {
    updateData(prev => createMemoFolder(prev, name, color));
    showToast('폴더가 생성되었습니다');
  }, [updateData, showToast]);

  const removeMemoFolder = useCallback((id: string) => {
    updateData(prev => deleteMemoFolder(prev, id));
    showToast('폴더가 삭제되었습니다');
  }, [updateData, showToast]);

  const editMemoFolder = useCallback((id: string, name: string, color: string) => {
    updateData(prev => updateMemoFolder(prev, id, name, color));
    showToast('폴더가 수정되었습니다');
  }, [updateData, showToast]);

  const setMindmap = useCallback((mindmap: any) => {
    updateData(prev => updateMindmap(prev, mindmap));
  }, [updateData]);

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
      // Ensure we don't lose memos/trash if they are missing on GH
      const currentData = dataRef.current;
      const merged: AppData = {
        ...result,
        memos: result.memos || currentData.memos || [],
        trash: result.trash || currentData.trash || [],
        memoFolders: (() => {
          const f = result.memoFolders || currentData.memoFolders || [];
          if (!f.some(x => x.id === 'folder_default')) {
            f.unshift({ id: 'folder_default', name: '내 메모', color: '#fbbf24', createdAt: new Date().toISOString() });
          }
          return f;
        })(),
        mindmap: result.mindmap || currentData.mindmap,
      };
      setData(merged);
      saveData(merged);
      dataRef.current = merged;
      setDataSource('github');
      showToast('GitHub에서 데이터를 불러왔습니다');
    } else {
      setDataSource('local');
      showToast('GitHub 데이터가 없거나 불러오기에 실패했습니다');
    }
  }, [ghConfig, showToast]);

  const syncUp = useCallback(async () => {
    setDataSource('syncing');
    const ok = await uploadToGitHub(ghConfig, dataRef.current);
    setDataSource(ok ? 'github' : 'local');
    showToast(ok ? 'GitHub에 업로드 완료' : '업로드 실패');
  }, [ghConfig, showToast]);

  // Initial background sync
  useEffect(() => {
    if (ghConfig.repo) {
      setDataSource('syncing');
      downloadFromGitHub<AppData>(ghConfig).then(result => {
        if (result && result.categories && result.articles) {
          const merged: AppData = {
            ...result,
            memos: result.memos || data.memos || [],
            trash: result.trash || data.trash || [],
            memoFolders: (() => {
              const f = result.memoFolders || data.memoFolders || [];
              if (!f.some(x => x.id === 'folder_default')) {
                f.unshift({ id: 'folder_default', name: '내 메모', color: '#fbbf24', createdAt: new Date().toISOString() });
              }
              return f;
            })(),
            mindmap: result.mindmap || data.mindmap,
          };
          setData(merged);
          saveData(merged);
          setDataSource('github');
        } else {
          setDataSource('local');
        }
      }).catch(() => {
        setDataSource('local');
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StoreContext.Provider value={{
      data, dataSource, ghConfig,
      addCategory, editCategory, removeCategory, reorderCategories,
      addArticle, editArticle, removeArticle,
      addMemo, removeMemo, editMemo,
      restoreMemo: restoreMemoAction,
      permanentlyDeleteMemo: permanentlyDeleteMemoAction,
      emptyTrash: emptyTrashAction,
      reorderMemos: reorderMemosAction,
      addMemoFolder, removeMemoFolder, editMemoFolder,
      setMindmap,
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
