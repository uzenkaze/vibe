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
    <div className="relative w-full max-w-md">
      <div className={`flex items-center gap-2 rounded-2xl border transition-all duration-300 ${isOpen ? 'border-accent/40 bg-bg-card shadow-lg shadow-accent/5' : 'border-border bg-bg-secondary'}`}>
        <Search size={16} className="ml-4 text-text-muted flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          placeholder="지식 검색..."
          className="flex-1 bg-transparent py-2.5 pr-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
        {query && (
          <button onClick={() => { setQuery(''); setIsOpen(false); }} className="mr-3 text-text-muted hover:text-text-primary transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-border bg-bg-card shadow-2xl z-50 overflow-hidden animate-scale-in">
          <div className="max-h-72 overflow-y-auto">
            {results.slice(0, 8).map(article => {
              const category = data.categories.find(c => c.id === article.categoryId);
              return (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article.id)}
                  className="w-full text-left px-4 py-3 hover:bg-bg-hover transition-colors flex items-start gap-3 border-b border-border/50 last:border-b-0"
                >
                  <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: category?.color || '#8b5cf6' }} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-text-primary truncate">{article.title}</div>
                    <div className="text-xs text-text-muted mt-0.5">{category?.name || '미분류'}</div>
                  </div>
                </button>
              );
            })}
          </div>
          {results.length > 8 && (
            <div className="px-4 py-2 text-xs text-text-muted text-center border-t border-border">
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
