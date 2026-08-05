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
  | { type: 'memo', data: Memo }
  | { type: 'mindmap', data: { id: string; pageId: number; nodeId?: number; title: string; content: string } };

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
  
  // 공백으로 단어 분리 (AND 검색 지원)
  const words = q.split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const isMatched = (text: string | undefined | null) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    
    // 입력한 모든 키워드가 텍스트 내에 포함되어야 함 (AND 검색)
    return words.every(word => {
      if (lowerText.includes(word)) return true;
      
      // Bilingual mapping 검사
      const mappedKeywords = Object.entries(BILINGUAL_MAP)
        .filter(([key]) => key.includes(word) || word.includes(key))
        .map(([, val]) => val);
        
      return mappedKeywords.some(kw => lowerText.includes(kw));
    });
  };
  
  const results: SearchResult[] = [];
  
  // Search Categories
  const matchedCategoryIds = new Set<string>();
  const categories = Array.isArray(data?.categories) ? data.categories : [];
  categories.forEach(c => {
    if (isMatched(c.name) || isMatched(c.description)) {
      results.push({ type: 'category', data: c });
      matchedCategoryIds.add(c.id);
    }
  });

  // Search Articles
  const articles = Array.isArray(data?.articles) ? data.articles : [];
  articles.forEach(a => {
    const contentMatch = isMatched(a.title) || isMatched(a.content);
    const categoryMatch = matchedCategoryIds.has(a.categoryId) || (() => {
      const cat = categories.find(c => c.id === a.categoryId);
      return cat ? isMatched(cat.name) : false;
    })();

    if (contentMatch || categoryMatch) {
      results.push({ type: 'article', data: a });
    }
  });
  
  // Search Memos
  const memos = Array.isArray(data?.memos) ? data.memos : [];
  memos.forEach(m => {
    if (isMatched(m.title) || isMatched(m.content)) {
      results.push({ type: 'memo', data: m });
    }
  });

  // Search Mindmap Nodes and Pages
  const mindmap = data?.mindmap;
  if (mindmap && Array.isArray(mindmap.pages)) {
    mindmap.pages.forEach(page => {
      // 페이지 제목 검색
      if (isMatched(page.title)) {
        results.push({
          type: 'mindmap',
          data: {
            id: `mind-${page.id}`,
            pageId: page.id,
            title: `마인드맵 • ${page.title}`,
            content: `마인드맵 페이지: ${page.title}`
          }
        });
      }
      
      // 페이지 노드 검색
      if (Array.isArray(page.nodes)) {
        page.nodes.forEach(node => {
          if (isMatched(node.label) || isMatched(node.memo)) {
            results.push({
              type: 'mindmap',
              data: {
                id: `mind-${page.id}-${node.id}`,
                pageId: page.id,
                nodeId: node.id,
                title: `마인드맵 • ${node.label || '노드'}`,
                content: node.memo || `마인드맵 ${page.title} 내 노드`
              }
            });
          }
        });
      }
    });
  }
  
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
