import type { AppData, Category, Article, Memo, MemoFolder, MindmapStore } from '../types';

const STORAGE_KEY = 'learnVaultData';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function loadData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        categories: Array.isArray(parsed.categories) ? parsed.categories : [],
        articles: Array.isArray(parsed.articles) ? parsed.articles : [],
        memos: Array.isArray(parsed.memos) ? parsed.memos.map((m: any) => ({
          ...m,
          folderId: m.folderId || 'folder_default'
        })) : [],
        trash: Array.isArray(parsed.trash) ? parsed.trash.map((m: any) => ({
          ...m,
          folderId: m.folderId || 'folder_default'
        })) : [],
        memoFolders: (() => {
          const folders = Array.isArray(parsed.memoFolders) ? parsed.memoFolders : [];
          if (!folders.some((f: MemoFolder) => f.id === 'folder_default')) {
            folders.unshift({ id: 'folder_default', name: '내 메모', color: '#fbbf24', createdAt: new Date().toISOString() });
          }
          return folders;
        })(),
        mindmap: parsed.mindmap || {
          version: 2,
          activeId: 1,
          nextPageId: 2,
          pages: [
            { id: 1, title: 'Main Page', nodes: [{ id: 1, type: 'group', label: 'Main Group', x: 0, y: 0, color: 0, memo: '' }], edges: [], nextId: 2 }
          ]
        },
      };
    } catch { /* ignore */ }
  }
  return { 
    categories: [], 
    articles: [], 
    memos: [],
    trash: [],
    memoFolders: [
      { id: 'folder_default', name: '내 메모', color: '#fbbf24', createdAt: new Date().toISOString() }
    ],
    mindmap: {
      version: 2,
      activeId: 1,
      nextPageId: 2,
      pages: [
        { id: 1, title: 'Main Page', nodes: [{ id: 1, type: 'group', label: 'Main Group', x: 0, y: 0, color: 0, memo: '' }], edges: [], nextId: 2 }
      ]
    }
  };
}

export function updateMindmap(data: AppData, mindmap: MindmapStore): AppData {
  return { ...data, mindmap };
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Category CRUD
export function createCategory(data: AppData, input: Omit<Category, 'id' | 'createdAt' | 'order'>): AppData {
  const category: Category = {
    ...input,
    id: generateId('cat'),
    createdAt: new Date().toISOString(),
    order: data.categories.length,
  };
  return { ...data, categories: [...data.categories, category] };
}

export function updateCategory(data: AppData, id: string, updates: Partial<Category>): AppData {
  return {
    ...data,
    categories: data.categories.map(c => c.id === id ? { ...c, ...updates } : c),
  };
}

export function deleteCategory(data: AppData, id: string): AppData {
  return {
    ...data,
    categories: data.categories.filter(c => c.id !== id),
    articles: data.articles.filter(a => a.categoryId !== id),
  };
}

export function updateCategories(data: AppData, categories: Category[]): AppData {
  return { ...data, categories };
}

// Article CRUD
export function createArticle(data: AppData, input: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): AppData {
  const now = new Date().toISOString();
  const article: Article = {
    ...input,
    id: generateId('art'),
    createdAt: now,
    updatedAt: now,
  };
  return { ...data, articles: [...data.articles, article] };
}

export function updateArticle(data: AppData, id: string, updates: Partial<Article>): AppData {
  return {
    ...data,
    articles: data.articles.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a),
  };
}

export function deleteArticle(data: AppData, id: string): AppData {
  return {
    ...data,
    articles: data.articles.filter(a => a.id !== id),
  };
}

// Query helpers
export function getArticlesByCategory(data: AppData, categoryId: string): Article[] {
  return data.articles
    .filter(a => a.categoryId === categoryId)
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
}

export function getRecentArticles(data: AppData, limit: number = 5): Article[] {
  return [...data.articles]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
}

export type SearchResult = 
  | { type: 'article', data: Article }
  | { type: 'category', data: Category }
  | { type: 'memo', data: Memo };

// 한-영 동적 키워드 사전 정의
const BILINGUAL_MAP: Record<string, string> = {
  '디자인': 'design',
  'design': '디자인',
  '개발': 'dev',
  'dev': '개발',
  'development': '개발',
  '코딩': 'code',
  'code': '코딩',
  '마인드맵': 'mind',
  'mind': '마인드맵',
  '메모': 'memo',
  'memo': '메모',
};

export function globalSearch(data: AppData, query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  // 연관 영문/한글 매핑 키워드 획득
  const mappedKeywords = Object.entries(BILINGUAL_MAP)
    .filter(([key]) => key.includes(q) || q.includes(key))
    .map(([, val]) => val);

  const isMatched = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes(q)) return true;
    return mappedKeywords.some(kw => lowerText.includes(kw));
  };
  
  const results: SearchResult[] = [];
  
  // Search Categories first (so we can associate articles later)
  const matchedCategoryIds = new Set<string>();
  data.categories.forEach(c => {
    if (isMatched(c.name) || isMatched(c.description || '')) {
      results.push({ type: 'category', data: c });
      matchedCategoryIds.add(c.id);
    }
  });

  // Search Articles
  data.articles.forEach(a => {
    // 제목, 내용 매칭 검사
    const contentMatch = isMatched(a.title) || isMatched(a.content);
    // 아티클의 카테고리가 이미 매칭되었거나, 카테고리명 자체가 매칭되는지 검사
    const categoryMatch = matchedCategoryIds.has(a.categoryId) || (() => {
      const cat = data.categories.find(c => c.id === a.categoryId);
      return cat ? isMatched(cat.name) : false;
    })();

    if (contentMatch || categoryMatch) {
      results.push({ type: 'article', data: a });
    }
  });
  
  // Search Memos
  data.memos.forEach(m => {
    if (isMatched(m.title || '') || isMatched(m.content)) {
      results.push({ type: 'memo', data: m });
    }
  });
  
  return results;
}

export function getCategoryById(data: AppData, id: string): Category | undefined {
  return data.categories.find(c => c.id === id);
}

export function getArticleById(data: AppData, id: string): Article | undefined {
  return data.articles.find(a => a.id === id);
}

// Memo CRUD
export function createMemo(data: AppData, content: string, color: string, title: string = '', folderId?: string): AppData {
  const now = new Date().toISOString();
  const memo: Memo = {
    id: generateId('memo'),
    title,
    content,
    color,
    folderId: folderId || 'folder_default',
    createdAt: now,
    updatedAt: now,
  };
  const memos = data.memos || [];
  return { ...data, memos: [memo, ...memos] };
}

export function deleteMemo(data: AppData, id: string): AppData {
  const currentMemos = Array.isArray(data.memos) ? data.memos : [];
  const memo = currentMemos.find(m => m.id === id);
  if (!memo) return data;
  
  return {
    ...data,
    memos: currentMemos.filter(m => m.id !== id),
    trash: [memo, ...(data.trash || [])],
  };
}

export function restoreMemo(data: AppData, id: string): AppData {
  const currentTrash = Array.isArray(data.trash) ? data.trash : [];
  const currentMemos = Array.isArray(data.memos) ? data.memos : [];
  
  const memoIndex = currentTrash.findIndex(m => m.id === id);
  if (memoIndex === -1) return data;

  const memo = currentTrash[memoIndex];
  const newTrash = [...currentTrash];
  newTrash.splice(memoIndex, 1);

  return {
    ...data,
    trash: newTrash,
    memos: [memo, ...currentMemos],
  };
}

export function permanentlyDeleteMemo(data: AppData, id: string): AppData {
  return {
    ...data,
    trash: (data.trash || []).filter(m => m.id !== id),
  };
}

export function emptyTrash(data: AppData): AppData {
  return { ...data, trash: [] };
}

export function reorderMemos(data: AppData, memos: Memo[]): AppData {
  return { ...data, memos };
}

export function updateMemo(data: AppData, id: string, content: string, title?: string, updates: Partial<Memo> = {}): AppData {
  let memos = Array.isArray(data.memos) ? [...data.memos] : [];
  
  const index = memos.findIndex(m => m.id === id);
  if (index === -1) return data;

  const updatedMemo = { 
    ...memos[index], 
    content, 
    title: title !== undefined ? title : memos[index].title,
    ...updates,
    updatedAt: new Date().toISOString() 
  };

  // If it's being pinned, move to front. If unpinned, stay where it is but updated.
  if (updates.isPinned === true) {
    memos.splice(index, 1);
    memos = [updatedMemo, ...memos];
  } else {
    memos[index] = updatedMemo;
  }

  return {
    ...data,
    memos,
  };
}

// MemoFolder CRUD
export function createMemoFolder(data: AppData, name: string, color: string): AppData {
  const folder: MemoFolder = {
    id: generateId('fld'),
    name,
    color,
    createdAt: new Date().toISOString(),
  };
  return {
    ...data,
    memoFolders: [...(data.memoFolders || []), folder]
  };
}

export function deleteMemoFolder(data: AppData, id: string): AppData {
  if (id === 'folder_default') return data;
  return {
    ...data,
    memoFolders: (data.memoFolders || []).filter(f => f.id !== id),
    memos: (data.memos || []).map(m => m.folderId === id ? { ...m, folderId: 'folder_default' } : m)
  };
}

export function updateMemoFolder(data: AppData, id: string, name: string, color: string): AppData {
  return {
    ...data,
    memoFolders: (data.memoFolders || []).map((f: MemoFolder) => 
      f.id === id ? { ...f, name, color } : f
    ),
  };
}
