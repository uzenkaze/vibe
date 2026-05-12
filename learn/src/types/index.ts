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

export interface AppData {
  categories: Category[];
  articles: Article[];
  memos: Memo[];
  trash: Memo[];
  memoFolders?: MemoFolder[];
}

export interface GitHubConfig {
  token: string;
  repo: string;
  branch: string;
  autoSync: boolean;
}

export type DataSource = 'local' | 'github' | 'syncing';
