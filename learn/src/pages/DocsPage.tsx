import { useState, useMemo } from 'react';
import { Search, BookOpen, SlidersHorizontal, X, FolderOpen } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import ArticleCard from '../components/ArticleCard';

export default function DocsPage() {
  const { data } = useStore();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest' | 'title'>('latest');
  const [showFilters, setShowFilters] = useState(false);

  // All unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    data.articles.forEach(a => a.tags.forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [data.articles]);

  // Filter + sort
  const filtered = useMemo(() => {
    let list = [...data.articles];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        a => a.title.toLowerCase().includes(q) ||
             a.content.toLowerCase().includes(q) ||
             a.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') list = list.filter(a => a.categoryId === selectedCategory);
    if (selectedTag !== 'all') list = list.filter(a => a.tags.includes(selectedTag));

    if (sortBy === 'latest') list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    else list.sort((a, b) => a.title.localeCompare(b.title, 'ko'));

    return list;
  }, [data.articles, query, selectedCategory, selectedTag, sortBy]);

  const categoryMap = useMemo(() => {
    const m: Record<string, typeof data.categories[0]> = {};
    data.categories.forEach(c => { m[c.id] = c; });
    return m;
  }, [data.categories]);

  const hasFilters = !!(query || selectedCategory !== 'all' || selectedTag !== 'all');
  const clearFilters = () => { setQuery(''); setSelectedCategory('all'); setSelectedTag('all'); };

  const selectClass = "w-full px-3 py-2.5 rounded-2xl text-sm font-medium text-text-primary outline-none cursor-pointer transition-colors";
  const selectStyle = { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' };

  return (
    <div className="py-8 space-y-8 animate-fade-in">

      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)',
          boxShadow: '0 12px 40px rgba(6,182,212,0.35)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.6)' }} />
        <div className="relative p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <BookOpen size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">전체 문서</h1>
              <p className="text-sm text-white/70 mt-0.5">
                총 <span className="font-black text-white">{filtered.length}</span>개 아티클
                {data.articles.length !== filtered.length && (
                  <span className="text-white/50"> (전체 {data.articles.length}개)</span>
                )}
              </p>
            </div>
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all"
            style={showFilters
              ? { background: 'rgba(255,255,255,0.3)', color: '#ffffff', backdropFilter: 'blur(6px)' }
              : { background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(6px)' }
            }
          >
            <SlidersHorizontal size={15} />
            필터 / 정렬
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="제목, 내용, 태그 검색..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl text-sm font-medium text-text-primary placeholder-text-muted transition-all outline-none"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Filters Panel ── */}
      {showFilters && (
        <div className="rounded-3xl p-6 space-y-4 animate-scale-in"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">카테고리</label>
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={selectClass} style={selectStyle}>
                <option value="all">전체</option>
                {data.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">태그</label>
              <select value={selectedTag} onChange={e => setSelectedTag(e.target.value)} className={selectClass} style={selectStyle}>
                <option value="all">전체 태그</option>
                {allTags.map(t => <option key={t} value={t}>#{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block">정렬</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} className={selectClass} style={selectStyle}>
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
                <option value="title">제목순</option>
              </select>
            </div>
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
              <X size={12} /> 필터 초기화
            </button>
          )}
        </div>
      )}

      {/* ── Active filter chips ── */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
              검색: {query}
              <button onClick={() => setQuery('')}><X size={11} /></button>
            </span>
          )}
          {selectedCategory !== 'all' && categoryMap[selectedCategory] && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${categoryMap[selectedCategory].color}15`, color: categoryMap[selectedCategory].color }}>
              {categoryMap[selectedCategory].icon} {categoryMap[selectedCategory].name}
              <button onClick={() => setSelectedCategory('all')}><X size={11} /></button>
            </span>
          )}
          {selectedTag !== 'all' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(6,182,212,0.1)', color: '#06b6d4' }}>
              #{selectedTag}
              <button onClick={() => setSelectedTag('all')}><X size={11} /></button>
            </span>
          )}
        </div>
      )}

      {/* ── Article Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 rounded-3xl" style={{ border: '1px dashed var(--color-border)' }}>
          <FolderOpen size={44} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-1">검색 결과가 없습니다</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-all">
              필터 초기화
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {filtered.map(article => (
            <ArticleCard key={article.id} article={article} showCategory />
          ))}
        </div>
      )}
    </div>
  );
}
