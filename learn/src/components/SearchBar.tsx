import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { searchArticles } from '../services/storage';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useStore();
  const navigate = useNavigate();

  const results = query.trim().length > 1 ? searchArticles(data, query) : [];

  const handleSelect = (articleId: string) => {
    setQuery('');
    setIsOpen(false);
    navigate(`/article/${articleId}`);
  };

  return (
    <div className="relative w-full max-w-[220px]">
      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-full transition-all duration-300"
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
          placeholder="지식 검색..."
          className="flex-1 bg-transparent py-2 pr-2 text-xs font-medium outline-none"
          style={{ color: 'var(--color-text-primary)' }}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); }}
            className="mr-2.5 transition-colors hover:text-text-primary"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50 animate-scale-in"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div className="max-h-72 overflow-y-auto">
            {results.slice(0, 8).map(article => {
              const category = data.categories.find(c => c.id === article.categoryId);
              const cardColor = article.color || category?.color || '#8b5cf6';
              return (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article.id)}
                  className="w-full text-left px-3 py-2.5 transition-all flex items-center gap-3 border-b last:border-b-0 hover:pl-4"
                  style={{ borderColor: 'var(--color-border)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${cardColor}10`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
                >
                  {/* Color dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: cardColor, boxShadow: `0 0 6px ${cardColor}60` }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold truncate" style={{ color: 'var(--color-text-primary)' }}>
                      {article.title}
                    </div>
                    <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      {category?.icon} {category?.name || '미분류'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {results.length > 8 && (
            <div
              className="px-3 py-2 text-[10px] font-semibold text-center"
              style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}
            >
              +{results.length - 8}개 더 있음
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
