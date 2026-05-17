import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, FolderOpen, Sparkles, Database, FileText } from 'lucide-react';
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
    <div className="pb-16 space-y-12 sm:space-y-16">
      {/* Hero Section (2-Column Layout) */}
      <section className="relative pt-6 sm:pt-12 lg:pt-20 pb-8 sm:pb-12 flex flex-col lg:flex-row items-center gap-10 sm:gap-16 lg:gap-8 animate-fade-in px-4 sm:px-0">
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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.2] sm:leading-[1.12]">
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
              onClick={() => document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[150px] relative overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
            >
              {/* Gloss */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity group-hover:opacity-80"
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
              onClick={() => document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl min-w-[150px] relative overflow-hidden cursor-pointer hover:scale-105 active:scale-95 transition-all group"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)', boxShadow: '0 8px 24px rgba(6,182,212,0.4)' }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity group-hover:opacity-80"
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
        <div 
          className="flex-1 flex justify-center items-center w-full min-h-[380px] sm:min-h-[460px] z-10" 
          style={{ perspective: '1200px' }}
          onPointerDown={() => setHoveredCard(null)}
        >
          <div
            className="relative scale-[0.65] sm:scale-[0.85] lg:scale-100"
            style={{
              width: '320px',
              height: '360px',
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
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    // Just stop propagation to let onClick handle it, 
                    // or set it here if preferred.
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hoveredCard !== visualIndex) {
                      setHoveredCard(visualIndex);
                    } else {
                      navigate(`/category/${item.id}`);
                    }
                  }}
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
      <section id="categories-section" className="animate-slide-up px-0 sm:px-0">
        {/* Section container with light card-like panel */}
        <div
          className="sm:rounded-3xl p-4 sm:p-8 sm:border sm:border-black/5"
          style={{
            background: 'rgba(248, 249, 255, 0.6)',
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
        <section id="articles-section" className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-3 mb-6 px-4 sm:px-0">
            <BookOpen size={16} className="text-accent-cyan" />
            <h2 className="text-lg font-bold text-text-primary">최근 아티클</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children px-4 sm:px-0">
            {recentArticles.map(article => (
              <ArticleCard key={article.id} article={article} showCategory />
            ))}
          </div>
        </section>
      )}

      {/* ── AI Chat Quick Access ── */}
      <section className="animate-slide-up px-4 sm:px-0" style={{ animationDelay: '0.3s' }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary">AI 채팅 바로가기</h2>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}
          >
            NEW
          </span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* ── Gemini ── */}
          <a
            href="https://gemini.google.com/app"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(52,168,83,0.06))',
              border: '1px solid rgba(66,133,244,0.20)',
              boxShadow: '0 4px 20px rgba(66,133,244,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(66,133,244,0.22)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(66,133,244,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(66,133,244,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(66,133,244,0.20)'; }}
          >
            {/* Gemini logo */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4285f4, #34a853, #fbbc05, #ea4335)', padding: '2px' }}
            >
              <div className="w-full h-full rounded-[10px] bg-white dark:bg-[#1a1a2e] flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 192 192" fill="none">
                  <path d="M96 16C96 16 60 80 16 96C60 112 96 176 96 176C96 176 132 112 176 96C132 80 96 16 96 16Z" fill="url(#geminiGrad)" />
                  <defs>
                    <linearGradient id="geminiGrad" x1="16" y1="16" x2="176" y2="176" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#4285f4" />
                      <stop offset="0.5" stopColor="#34a853" />
                      <stop offset="1" stopColor="#fbbc05" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Gemini</div>
              <div className="text-xs text-text-muted mt-0.5">Google AI</div>
            </div>
          </a>

          {/* ── ChatGPT ── */}
          <a
            href="https://chatgpt.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(16,163,127,0.08), rgba(10,132,100,0.06))',
              border: '1px solid rgba(16,163,127,0.20)',
              boxShadow: '0 4px 20px rgba(16,163,127,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(16,163,127,0.22)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(16,163,127,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(16,163,127,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(16,163,127,0.20)'; }}
          >
            {/* ChatGPT logo */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #10a37f, #0a8463)' }}
            >
              <svg width="22" height="22" viewBox="0 0 41 41" fill="none">
                <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.211-2.614 10.079 10.079 0 0 0-9.614 6.977 9.967 9.967 0 0 0-6.664 4.834 10.08 10.08 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.212 2.614 10.079 10.079 0 0 0 9.617-6.981 9.967 9.967 0 0 0 6.663-4.834 10.079 10.079 0 0 0-1.243-11.814zM22.498 37.886a7.474 7.474 0 0 1-4.799-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.49 7.496zM6.392 31.006a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zM4.297 13.62A7.469 7.469 0 0 1 8.2 10.333c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L7.044 23.86a7.504 7.504 0 0 1-2.747-10.24zm27.658 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.998l-4.331 2.5-4.331-2.5V18z" fill="white" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">ChatGPT</div>
              <div className="text-xs text-text-muted mt-0.5">OpenAI</div>
            </div>
          </a>

          {/* ── Claude ── */}
          <a
            href="https://claude.ai/new"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(210,139,89,0.08), rgba(193,110,55,0.06))',
              border: '1px solid rgba(210,139,89,0.20)',
              boxShadow: '0 4px 20px rgba(210,139,89,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(210,139,89,0.25)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(210,139,89,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(210,139,89,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(210,139,89,0.20)'; }}
          >
            {/* Claude logo */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #d28b59, #c16e37)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                <path d="M11.999 1.5C6.2 1.5 1.5 6.2 1.5 12s4.7 10.5 10.499 10.5S22.5 17.8 22.5 12 17.8 1.5 12 1.5zm-.86 14.993l-1.23-3.454H6.92l-1.23 3.454H4.22l3.958-10.986h1.574l3.958 10.986h-1.572zm6.292 0l-1.23-3.454h-2.99l-1.23 3.454h-1.47l3.958-10.986h1.574l3.958 10.986H17.43zM9.6 9.067L8.12 13.26h2.958L9.6 9.067zm6.293 0l-1.48 4.193h2.958L15.893 9.067z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Claude</div>
              <div className="text-xs text-text-muted mt-0.5">Anthropic</div>
            </div>
          </a>

          {/* ── Cursor AI ── */}
          <a
            href="https://www.cursor.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.08), rgba(50,50,50,0.06))',
              border: '1px solid rgba(0,0,0,0.15)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,0,0,0.15)'; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #111, #333)' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Cursor AI</div>
              <div className="text-xs text-text-muted mt-0.5">Next Gen Editor</div>
            </div>
          </a>

          {/* ── Copilot ── */}
          <a
            href="https://copilot.microsoft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(0,102,214,0.08), rgba(0,120,212,0.06))',
              border: '1px solid rgba(0,102,214,0.20)',
              boxShadow: '0 4px 20px rgba(0,102,214,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(0,102,214,0.22)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,102,214,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(0,102,214,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(0,102,214,0.20)'; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #0066d6, #0078d4)' }}
            >
              <Database size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Copilot</div>
              <div className="text-xs text-text-muted mt-0.5">MS & GitHub AI</div>
            </div>
          </a>

          {/* ── Claude Code ── */}
          <a
            href="https://www.anthropic.com/claude"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(165,125,100,0.08), rgba(145,105,80,0.06))',
              border: '1px solid rgba(165,125,100,0.20)',
              boxShadow: '0 4px 20px rgba(165,125,100,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(165,125,100,0.22)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(165,125,100,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(165,125,100,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(165,125,100,0.20)'; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #a57d64, #916950)' }}
            >
              <FileText size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Claude Code</div>
              <div className="text-xs text-text-muted mt-0.5">Developer CLI</div>
            </div>
          </a>

          {/* ── DeepSeek ── */}
          <a
            href="https://chat.deepseek.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(45,115,255,0.08), rgba(0,224,255,0.06))',
              border: '1px solid rgba(45,115,255,0.20)',
              boxShadow: '0 4px 20px rgba(45,115,255,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(45,115,255,0.22)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(45,115,255,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(45,115,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(45,115,255,0.20)'; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #2d73ff, #00e0ff)' }}
            >
              <div className="text-white font-black text-lg italic">D</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">DeepSeek</div>
              <div className="text-xs text-text-muted mt-0.5">R1 / V3 Model</div>
            </div>
          </a>

          {/* ── Google AI Studio ── */}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, rgba(66,133,244,0.08), rgba(139,92,246,0.06))',
              border: '1px solid rgba(66,133,244,0.20)',
              boxShadow: '0 4px 20px rgba(66,133,244,0.08)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 8px 32px rgba(66,133,244,0.25)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(66,133,244,0.4)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(66,133,244,0.08)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(66,133,244,0.20)'; }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #4285f4, #8b5cf6)' }}
            >
              <Sparkles size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-sm text-text-primary">Google AI Studio</div>
              <div className="text-xs text-text-muted mt-0.5">Pro/Flash Models</div>
            </div>
          </a>

        </div>

      </section>

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSave={addCategory}
      />
    </div>
  );
}
