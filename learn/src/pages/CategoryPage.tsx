import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Settings, Trash2, Search } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getCategoryById, getArticlesByCategory } from '../services/storage';
import ArticleCard from '../components/ArticleCard';
import ArticleEditor from '../components/ArticleEditor';
import CategoryModal from '../components/CategoryModal';

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

  return (
    <div className="py-8 space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>홈으로</span>
        </button>

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: `${category.color}15` }}>
              {category.icon}
            </div>
            <div>
              <h1 className="text-2xl font-black text-text-primary">{category.name}</h1>
              <p className="text-sm text-text-muted mt-0.5">{category.description || '설명 없음'} · {articles.length}개 아티클</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowCategoryEdit(true)} className="p-2.5 rounded-xl border border-border hover:bg-bg-hover transition-colors text-text-muted hover:text-text-primary">
              <Settings size={16} />
            </button>
            <button onClick={handleDeleteCategory} className="p-2.5 rounded-xl border border-border hover:bg-accent-rose/10 hover:border-accent-rose/30 transition-colors text-text-muted hover:text-accent-rose">
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-lg shadow-accent/20"
            >
              <Plus size={14} />
              새 아티클
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="이 카테고리에서 검색..."
            className="w-full bg-bg-secondary border border-border rounded-2xl pl-11 pr-4 py-3 text-sm text-text-primary outline-none focus:border-accent/40 transition-colors"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-border animate-fade-in">
          <p className="text-3xl mb-3">{category.icon}</p>
          <p className="text-sm text-text-muted mb-4">
            {searchQuery ? '검색 결과가 없습니다' : '아직 아티클이 없습니다'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowEditor(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all"
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
