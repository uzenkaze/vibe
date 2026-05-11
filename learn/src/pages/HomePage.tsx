import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, FolderOpen, Sparkles } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getRecentArticles } from '../services/storage';
import CategoryCard from '../components/CategoryCard';
import ArticleCard from '../components/ArticleCard';
import CategoryModal from '../components/CategoryModal';

export default function HomePage() {
  const navigate = useNavigate();
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { data, addCategory, reorderCategories } = useStore();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const recentArticles = getRecentArticles(data, 6);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
    e.dataTransfer.effectAllowed = 'move';

    const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
    ghost.style.opacity = '0.5';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);

    if (sourceIndex === targetIndex) return;

    const sortedCats = [...data.categories].sort((a, b) => a.order - b.order);
    const [movedItem] = sortedCats.splice(sourceIndex, 1);
    sortedCats.splice(targetIndex, 0, movedItem);

    const reordered = sortedCats.map((cat, i) => ({ ...cat, order: i }));
    reorderCategories(reordered);
  };

  const totalArticles = data.articles.length;
  const totalCategories = data.categories.length;

  // Gradients for stacked cards matching the attached image vibe
  const cardGradients = [
    'from-[#1e293b] to-[#0f172a]', // Slate dark
    'from-[#312e81] to-[#1e1b4b]', // Indigo dark
    'from-[#4c1d95] to-[#2e1065]', // Violet dark
    'from-[#701a75] to-[#4a044e]', // Fuchsia dark
    'from-[#be185d] to-[#831843]', // Pink dark
    'from-[#e11d48] to-[#881337]', // Rose dark
    'from-[#f43f5e] to-[#9f1239]', // Rose bright
  ];

  // 카테고리만 히어로 스택에 표시
  const stackItems = data.categories
    .sort((a, b) => a.order - b.order)
    .slice(0, 6)
    .map(c => ({ id: c.id, title: c.name, type: 'Category', icon: c.icon, color: c.color }));

  // Fallback items if empty
  const displayItems = stackItems.length > 0 ? stackItems : [
    { id: '1', title: 'Knowledge Base', type: 'Category', icon: '📚', color: '#6366f1' },
    { id: '2', title: 'Development', type: 'Category', icon: '💻', color: '#8b5cf6' },
    { id: '3', title: 'Design', type: 'Category', icon: '🎨', color: '#a855f7' },
    { id: '4', title: 'Architecture', type: 'Category', icon: '🏗️', color: '#ec4899' },
  ];


  return (
    <div className="pb-16 space-y-16">
      {/* Hero Section (2-Column Layout) */}
      <section className="relative pt-12 lg:pt-20 pb-12 flex flex-col lg:flex-row items-center gap-16 lg:gap-8 animate-fade-in overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Left Side: Hero Text */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10 w-full">
          {/* ── Badge ── */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(6,182,212,0.10))',
              border: '1px solid rgba(139,92,246,0.30)',
              color: '#a78bfa',
              letterSpacing: '0.10em',
            }}
          >
            <Sparkles size={12} style={{ color: '#06b6d4' }} />
            <span>Your Personal Knowledge OS</span>
          </div>

          {/* ── Heading ── */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
            <span className="text-text-primary">Organize one's</span><br />
            <span
              style={{
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 40%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              learning and knowledge.
            </span>
          </h1>

          {/* ── Subtext ── */}
          <p className="text-base sm:text-lg text-text-muted max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Turn scattered notes into a structured knowledge base.<br className="hidden sm:block" />
            Search instantly. Learn deliberately. Own your growth.
          </p>

          {/* ── CTA Buttons ── */}
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-4">
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold hover:scale-105 transition-all w-full sm:w-auto justify-center"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(139,92,246,0.4)',
              }}
            >
              <Plus size={16} /> New Category
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl font-bold transition-all w-full sm:w-auto justify-center"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'var(--color-text-primary)',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.10)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(139,92,246,0.30)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >
              <BookOpen size={15} /> Browse Docs
            </button>
          </div>

          {/* Stats — vivid pill cards */}
          <div className="flex justify-center lg:justify-start gap-3 pt-8 flex-wrap">
            {/* 카테고리 */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[150px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
            >
              {/* Gloss */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                🗂️
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-bold">카테고리</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.25)' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <span className="text-white/80 text-xl font-black block leading-tight">{totalCategories}</span>
                {/* Progress bar */}
                <div className="mt-1.5 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-1 rounded-full" style={{ width: `${Math.min(100, totalCategories * 10)}%`, background: 'rgba(255,255,255,0.7)' }} />
                </div>
              </div>
            </div>

            {/* 아티클 */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[150px] relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 8px 24px rgba(6,182,212,0.4)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 60%)' }} />
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                📄
              </div>
              <div className="flex-1 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-bold">아티클</span>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.25)' }}>
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
                <span className="text-white/80 text-xl font-black block leading-tight">{totalArticles}</span>
                <div className="mt-1.5 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <div className="h-1 rounded-full" style={{ width: `${Math.min(100, totalArticles * 5)}%`, background: 'rgba(255,255,255,0.7)' }} />
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Right Side: Stacked Cards Animation */}
        <div className="flex-1 flex justify-center items-center w-full min-h-[440px] z-10" style={{ perspective: '1400px' }}>
          <div
            className="relative"
            style={{
              width: '360px',
              height: '400px',
              transformStyle: 'preserve-3d',
              transform: 'rotateX(52deg) rotateZ(-44deg)',
              transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Base platform */}
            <div style={{
              position: 'absolute',
              inset: '-40px',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '36px',
              background: 'rgba(255,255,255,0.03)',
              backdropFilter: 'blur(8px)',
              transform: 'translateZ(-10px)',
            }} />

            {/* Cards */}
            {displayItems.map((item, visualIndex) => {
              const total = displayItems.length;
              const spreadStep = 48;
              const tx = (total - 1 - visualIndex) * -spreadStep * 0.6;
              const ty = (total - 1 - visualIndex) * spreadStep * 0.6;
              const tz = visualIndex * 12;
              const isHovered = hoveredCard === visualIndex;
              const hoverTz = 260;
              const hoverTx = tx - 20;
              const hoverTy = ty + 10;

              // 카테고리 고유 색상 사용
              const cardColor = (item as { color?: string }).color || cardGradients[visualIndex % cardGradients.length];
              const hasOwnColor = !!(item as { color?: string }).color;
              const cardIcon = (item as { icon?: string }).icon;

              return (
                <div
                  key={item.id + visualIndex}
                  onMouseEnter={() => setHoveredCard(visualIndex)}
                  onMouseLeave={() => setHoveredCard(null)}
                  onClick={() => navigate(`/category/${item.id}`)}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '20px',
                    cursor: 'pointer',
                    zIndex: isHovered ? 100 : visualIndex + 5,
                    background: hasOwnColor
                      ? `linear-gradient(145deg, ${cardColor} 0%, ${cardColor}bb 100%)`
                      : undefined,
                    transform: isHovered
                      ? `translate3d(${hoverTx}px, ${hoverTy}px, ${hoverTz}px) rotateX(-52deg) rotateZ(44deg) scale(1.1)`
                      : `translate3d(${tx}px, ${ty}px, ${tz}px)`,
                    transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.3s ease',
                    boxShadow: isHovered
                      ? `0 40px 80px ${hasOwnColor ? cardColor + '80' : 'rgba(0,0,0,0.5)'}, 0 0 0 1px rgba(255,255,255,0.15)`
                      : '-8px 8px 24px rgba(0,0,0,0.25)',
                    filter: isHovered ? 'brightness(1.15)' : 'none',
                  }}
                  className={`${!hasOwnColor ? `bg-gradient-to-br ${cardColor}` : ''} border border-white/10 flex flex-col justify-between p-5 sm:p-6 overflow-hidden`}
                >
                  {/* Sheen overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-transparent pointer-events-none rounded-[20px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none rounded-[20px]" />
                  {/* Decorative circle */}
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'rgba(255,255,255,0.5)' }} />

                  {/* Top row: index number */}
                  <div className="w-full flex justify-between items-start z-10 relative">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-white/30" />
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                    </div>
                    <span className="text-white/30 text-[10px] font-mono font-bold tracking-widest">
                      {String(visualIndex + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Bottom row: icon + title */}
                  <div className="z-10 relative">
                    {cardIcon && (
                      <span className="text-2xl mb-1.5 block" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
                        {cardIcon}
                      </span>
                    )}
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-[0.15em] mb-0.5">
                      Category
                    </div>
                    <div className="text-white text-xl sm:text-2xl font-black leading-tight tracking-tight"
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                      {item.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="animate-slide-up">
        {/* Section container with light card-like panel */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(248, 249, 255, 0.6)',
            border: '1px solid rgba(0,0,0,0.05)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #a78bfa, #06b6d4)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <h2 className="text-base font-bold" style={{ color: '#111827' }}>전체 카테고리</h2>
            </div>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #ede9fe, #e0f2fe)',
                color: '#7c3aed',
                border: '1px solid rgba(139,92,246,0.15)',
              }}
            >
              <Plus size={13} />
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children">
              {data.categories
                .sort((a, b) => a.order - b.order)
                .map((cat, index) => (
                  <div
                    key={cat.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`transition-all duration-200 ${dragOverIndex === index ? 'scale-105 ring-2 ring-accent ring-offset-4 ring-offset-bg-primary' : ''}`}
                  >
                    <CategoryCard category={cat} />
                  </div>
                ))}
            </div>
          )}
        </div>
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
