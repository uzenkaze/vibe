import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
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

  // Persist to localStorage and trigger background sync
  const persistAndSync = useCallback(async (newData: AppData) => {
    setData(newData);
    saveData(newData);
    
    if (ghConfig.token && ghConfig.autoSync) {
      setDataSource('syncing');
      const uploadOk = await uploadToGitHub(ghConfig, newData);
      
      if (uploadOk) {
        // As requested: "서버에 저장하고 저장된 데이터를 조회해서 보여줘"
        // After successful upload, we fetch back to ensure 100% consistency
        const verifiedData = await downloadFromGitHub<AppData>(ghConfig);
        if (verifiedData) {
          setData(verifiedData);
          saveData(verifiedData);
          setDataSource('github');
          return;
        }
      }
      setDataSource(uploadOk ? 'github' : 'local');
    } else {
      setDataSource('local');
    }
  }, [ghConfig]);

  // functional helper for state updates
  const updateData = useCallback(async (fn: (prev: AppData) => AppData) => {
    const next = fn(data); // Using current 'data' state
    await persistAndSync(next);
  }, [data, persistAndSync]);

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

  const reorderCategories = useCallback((categories: Category[]) => {
    const newData = updateCategories(data, categories);
    persistAndSync(newData);
  }, [data, persistAndSync]);

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

  // Memo actions
  const addMemo = useCallback((content: string, color: string, title: string = '', folderId?: string) => {
    const newData = createMemo(data, content, color, title, folderId);
    persistAndSync(newData);
  }, [data, persistAndSync]);

  const removeMemo = useCallback((id: string) => {
    const newData = deleteMemo(data, id);
    persistAndSync(newData);
    showToast('메모가 삭제되었습니다');
  }, [data, persistAndSync, showToast]);

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
      showToast('GitHub에서 데이터를 불러왔습니다');
    } else {
      setDataSource('local');
      showToast('GitHub 데이터가 없거나 불러오기에 실패했습니다');
    }
  }, [ghConfig, data, showToast]);

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
      }).catch(() => setDataSource('local'));
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
