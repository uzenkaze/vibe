import { useState } from 'react';
import { Plus, BookOpen, FolderOpen, Sparkles } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getRecentArticles } from '../services/storage';
import CategoryCard from '../components/CategoryCard';
import ArticleCard from '../components/ArticleCard';
import CategoryModal from '../components/CategoryModal';

export default function HomePage() {
  const { data, addCategory } = useStore();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const recentArticles = getRecentArticles(data, 6);

  const totalArticles = data.articles.length;
  const totalCategories = data.categories.length;

  return (
    <div className="py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-3xl bg-accent/10 flex items-center justify-center">
            <BookOpen size={28} className="text-accent" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
          <span className="gradient-text">Learn</span>Vault
        </h1>
        <p className="text-text-muted text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          배움과 지식을 체계적으로 정리하고, 필요할 때 빠르게 찾아보세요.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-8 mt-8">
          {[
            { label: '카테고리', value: totalCategories, icon: FolderOpen },
            { label: '아티클', value: totalArticles, icon: BookOpen },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <stat.icon size={14} className="text-accent" />
                <span className="text-2xl font-black text-text-primary">{stat.value}</span>
              </div>
              <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Sparkles size={16} className="text-accent" />
            <h2 className="text-lg font-bold text-text-primary">카테고리</h2>
          </div>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-accent/10 text-accent hover:bg-accent/20 transition-all"
          >
            <Plus size={14} />
            새 카테고리
          </button>
        </div>

        {totalCategories === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <FolderOpen size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-muted mb-4">아직 카테고리가 없습니다</p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all"
            >
              첫 카테고리 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-children">
            {data.categories
              .sort((a, b) => a.order - b.order)
              .map(cat => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
          </div>
        )}
      </section>

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6">
            <BookOpen size={16} className="text-accent-cyan" />
            <h2 className="text-lg font-bold text-text-primary">최근 아티클</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {recentArticles.map(article => (
              <ArticleCard key={article.id} article={article} showCategory />
            ))}
          </div>
        </section>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={addCategory}
      />
    </div>
  );
}
