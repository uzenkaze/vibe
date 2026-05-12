import type { AppData, Category, Article, Memo } from '../types';

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
        memos: Array.isArray(parsed.memos) ? parsed.memos : [],
        trash: Array.isArray(parsed.trash) ? parsed.trash : [],
      };
    } catch { /* ignore */ }
  }
  return { 
    categories: [], 
    articles: [], 
    memos: [],
    trash: []
  };
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

export function globalSearch(data: AppData, query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  
  const results: SearchResult[] = [];
  
  // Search Articles
  data.articles.forEach(a => {
    if (a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)) {
      results.push({ type: 'article', data: a });
    }
  });
  
  // Search Categories
  data.categories.forEach(c => {
    if (c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)) {
      results.push({ type: 'category', data: c });
    }
  });
  
  // Search Memos
  data.memos.forEach(m => {
    if ((m.title?.toLowerCase().includes(q)) || m.content.toLowerCase().includes(q)) {
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
export function createMemo(data: AppData, content: string, color: string, title: string = ''): AppData {
  const now = new Date().toISOString();
  const memo: Memo = {
    id: generateId('memo'),
    title,
    content,
    color,
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
