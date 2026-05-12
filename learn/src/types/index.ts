export interface Reference {
  title: string;
  url: string;
}

export interface Article {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  references: Reference[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  createdAt: string;
  order: number;
}

export interface Memo {
  id: string;
  title?: string;
  content: string;
  color: string;
  isPinned?: boolean;
  isFavorite?: boolean;
  folderId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MemoFolder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface MindmapNode {
  id: number;
  type: 'group' | 'node' | 'memo';
  label: string;
  x: number;
  y: number;
  color: number;
  memo?: string;
  customColor?: string | null;
  customBgColor?: string | null;
  customBorderColor?: string | null;
  _w?: number;
  _h?: number;
}

export interface MindmapEdge {
  from: number;
  to: number;
  label?: string;
  lineStyle?: string;
  bridge?: boolean;
  customColor?: string | null;
}

export interface MindmapPageData {
  id: number;
  title: string;
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  nextId: number;
  zoom?: number;
  pan?: { x: number; y: number };
}

export interface MindmapStore {
  version: number;
  activeId: number;
  nextPageId: number;
  pages: MindmapPageData[];
}

export interface AppData {
  categories: Category[];
  articles: Article[];
  memos: Memo[];
  trash: Memo[];
  memoFolders?: MemoFolder[];
  mindmap?: MindmapStore;
}

export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
  autoSync: boolean;
}

export type DataSource = 'local' | 'github' | 'syncing';
