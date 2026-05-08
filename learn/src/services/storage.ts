import type { AppData, Category, Article } from '../types';

const STORAGE_KEY = 'learnVaultData';

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export function loadData(): AppData {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch { /* ignore */ }
  }
  return { categories: [], articles: [] };
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

export function searchArticles(data: AppData, query: string): Article[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return data.articles.filter(a =>
    a.title.toLowerCase().includes(q) ||
    a.content.toLowerCase().includes(q) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function getCategoryById(data: AppData, id: string): Category | undefined {
  return data.categories.find(c => c.id === id);
}

export function getArticleById(data: AppData, id: string): Article | undefined {
  return data.articles.find(a => a.id === id);
}
