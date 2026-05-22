import { useState, useEffect } from 'react';
import { Search, Book, Folder, StickyNote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { globalSearch, type SearchResult } from '../services/storage';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useStore();
  const navigate = useNavigate();

  const results = query.trim().length > 0 ? globalSearch(data, query) : [];

  const handleSelect = (result: SearchResult) => {
    setQuery('');
    setIsOpen(false);
    if (result.type === 'article') navigate(`/article/${result.data.id}`);
    if (result.type === 'category') navigate(`/category/${result.data.id}`);
    if (result.type === 'memo') navigate(`/memos?id=${result.data.id}`);
  };

  const getResultIcon = (type: SearchResult['type']) => {
    if (type === 'article') return <Book size={12} />;
    if (type === 'category') return <Folder size={12} />;
    if (type === 'memo') return <StickyNote size={12} />;
    return null;
  };

  const getResultTitle = (result: SearchResult) => {
    if (result.type === 'article') return result.data.title;
    if (result.type === 'category') return result.data.name;
    if (result.type === 'memo') return result.data.title || result.data.content.slice(0, 20) + '...';
    return '';
  };

  const getResultSubtitle = (result: SearchResult) => {
    if (result.type === 'article') {
      const cat = data.categories.find(c => c.id === result.data.categoryId);
      return `아티클 • ${cat?.name || '미분류'}`;
    }
    if (result.type === 'category') return '카테고리';
    if (result.type === 'memo') return '메모';
    return '';
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setIsOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative w-full md:max-w-[220px] search-container">
      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-full transition-all duration-300 relative z-50"
        style={{
          background: isOpen
            ? 'rgba(139,92,246,0.10)'
            : 'rgba(255,255,255,0.06)',
          border: isOpen
            ? '1px solid rgba(139,92,246,0.35)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: isOpen ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
        }}
      >
        <Search
          size={13}
          className="ml-3 flex-shrink-0 transition-colors"
          style={{ color: isOpen ? '#8b5cf6' : 'var(--color-text-muted)' }}
        />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="통합 검색..."
          className="flex-1 bg-transparent py-2 pr-4 text-xs font-medium outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-[60] animate-scale-in"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          }}
        >
          {results.length > 0 ? (
            <>
              <div className="max-h-80 overflow-y-auto">
                {results.slice(0, 10).map((result, idx) => {
                  const id = result.type === 'article' ? result.data.id : 
                             result.type === 'category' ? result.data.id : result.data.id;
                  return (
                    <button
                      key={`${result.type}-${id}-${idx}`}
                      onClick={() => handleSelect(result)}
                      className="w-full text-left px-3 py-2.5 transition-all flex items-center gap-3 border-b last:border-b-0 hover:bg-white/5"
                      style={{ borderColor: 'var(--color-border)' }}
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-accent">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {getResultTitle(result)}
                        </div>
                        <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {getResultSubtitle(result)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {results.length > 10 && (
                <div
                  className="px-3 py-2 text-[10px] font-semibold text-center"
                  style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}
                >
                  +{results.length - 10}개 결과 더 있음
                </div>
              )}
            </>
          ) : (
            <div className="px-4 py-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-pulse">No Results Found</div>
              <p className="text-[11px] font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                앗! 매칭되는 콘텐츠가 없습니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
