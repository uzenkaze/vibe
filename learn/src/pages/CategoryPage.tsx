import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Trash2, Search, FileText } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getCategoryById, getArticlesByCategory } from '../services/storage';
import ArticleCard from '../components/ArticleCard';
import ArticleEditor from '../components/ArticleEditor';
import CategoryModal from '../components/CategoryModal';

function darken(hex: string, amount = 0.25): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  return '#' + m.map(v => Math.max(0, Math.round(parseInt(v, 16) * (1 - amount))).toString(16).padStart(2, '0')).join('');
}

function getTextColor(hex: string): 'white' | 'dark' {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return 'white';
  const [r, g, b] = m.map(v => parseInt(v, 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? 'dark' : 'white';
}

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, editCategory, removeCategory } = useStore();

  const [showEditor, setShowEditor] = useState(false);
  const [showCategoryEdit, setShowCategoryEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const category = id ? getCategoryById(data, id) : undefined;
  if (!category) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">카테고리를 찾을 수 없습니다</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent hover:text-accent-hover text-sm font-semibold">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  let articles = getArticlesByCategory(data, category.id);
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    articles = articles.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  const handleDeleteCategory = () => {
    if (window.confirm(`"${category.name}" 카테고리와 포함된 모든 아티클을 삭제하시겠습니까?`)) {
      removeCategory(category.id);
      navigate('/');
    }
  };

  const textMode = getTextColor(category.color);
  const isLight = textMode === 'dark';
  const textPrimary = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)';

  return (
    <div className="py-4 sm:py-8 space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors animate-fade-in"
      >
        <ArrowLeft size={14} />
        <span>홈으로</span>
      </button>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden animate-fade-in"
        style={{
          background: `linear-gradient(145deg, ${category.color} 0%, ${darken(category.color, 0.22)} 100%)`,
          boxShadow: `0 12px 40px ${darken(category.color, 0.1)}60`,
        }}
      >
        {/* Gloss */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%, rgba(0,0,0,0.08) 100%)' }} />
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.6)' }} />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.5)' }} />

        <div className="relative p-5 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Left: icon + info */}
          <div className="flex items-center gap-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: textPrimary }}>
                {category.name}
              </h1>
              <p className="text-sm mt-1" style={{ color: textMuted }}>
                {(category.description || '설명 없음').replace(/<[^>]+>/g, '').replace(/\n+/g, ' ').trim().slice(0, 80)}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <FileText size={11} style={{ color: textMuted }} />
                <span className="text-xs font-bold" style={{ color: textMuted }}>
                  {articles.length}개 아티클
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCategoryEdit(true)}
              className="p-2.5 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)', color: textPrimary }}
              title="카테고리 수정"
            >
              <Settings size={16} />
            </button>
            <button
              onClick={handleDeleteCategory}
              className="p-2.5 rounded-xl transition-colors hover:bg-red-500/30"
              style={{ background: 'rgba(255,255,255,0.15)', color: textPrimary }}
              title="카테고리 삭제"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'rgba(255,255,255,0.25)',
                backdropFilter: 'blur(8px)',
                color: textPrimary,
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Plus size={14} />
              새 아티클
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative animate-fade-in">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="이 카테고리에서 검색..."
          className="w-full bg-bg-elevated border border-border rounded-2xl pl-11 pr-4 py-3 text-sm text-text-primary outline-none focus:border-accent/40 transition-colors"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        />
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-20 rounded-3xl" style={{ border: '1px dashed var(--color-border)' }}>
          <span className="text-5xl block mb-4">{category.icon}</span>
          <p className="text-sm text-text-muted mb-4">
            {searchQuery ? '검색 결과가 없습니다' : '아직 아티클이 없습니다'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowEditor(true)}
              className="px-6 py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${category.color}, ${darken(category.color, 0.2)})`,
                boxShadow: `0 8px 24px ${category.color}40`,
              }}
            >
              첫 아티클 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Editor Modal */}
      <ArticleEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        categoryId={category.id}
      />

      {/* Category Edit Modal */}
      <CategoryModal
        isOpen={showCategoryEdit}
        onClose={() => setShowCategoryEdit(false)}
        onSave={(updates) => editCategory(category.id, updates)}
        initial={category}
      />
    </div>
  );
}
