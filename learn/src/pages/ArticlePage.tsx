import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit3, Trash2, ExternalLink, Pin, Tag, Clock, Calendar } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getArticleById, getCategoryById } from '../services/storage';
import MarkdownRenderer from '../components/MarkdownRenderer';
import ArticleEditor from '../components/ArticleEditor';

function darken(hex: string, amount = 0.22): string {
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

/** YouTube URL → 비디오 ID (없으면 null) */
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    if (u.hostname.includes('youtube.com')) {
      return u.searchParams.get('v');
    }
    // youtu.be/ID
    if (u.hostname === 'youtu.be') {
      return u.pathname.replace('/', '');
    }
    // youtube.com/embed/ID
    if (u.pathname.startsWith('/embed/')) {
      return u.pathname.split('/embed/')[1].split('/')[0];
    }
  } catch { /* invalid URL */ }
  return null;
}

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, removeArticle, editArticle } = useStore();
  const [showEditor, setShowEditor] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);

  const article = id ? getArticleById(data, id) : undefined;
  const category = article ? getCategoryById(data, article.categoryId) : undefined;

  if (!article) {
    return (
      <div className="text-center py-20">
        <p className="text-text-muted">아티클을 찾을 수 없습니다</p>
        <button onClick={() => navigate('/')} className="mt-4 text-accent hover:text-accent-hover text-sm font-semibold">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('이 아티클을 삭제하시겠습니까?')) {
      removeArticle(article.id);
      navigate(category ? `/category/${category.id}` : '/');
    }
  };

  const togglePin = () => editArticle(article.id, { isPinned: !article.isPinned });

  // Hero color: article color → category color → default indigo
  const heroColor = article.color || category?.color || '#6366f1';
  const textMode = getTextColor(heroColor);
  const isLight = textMode === 'dark';
  const textPrimary = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)';

  return (
    <div className="py-8 w-full space-y-6 overflow-hidden">

      {/* Back */}
      <button
        onClick={() => navigate(category ? `/category/${category.id}` : '/')}
        className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors animate-fade-in"
      >
        <ArrowLeft size={14} />
        <span>{category ? `${category.icon} ${category.name}` : '홈'}</span>
      </button>

      {/* ── Hero Banner ── */}
      <div
        className="relative rounded-3xl overflow-hidden animate-fade-in"
        style={{
          background: `linear-gradient(145deg, ${heroColor} 0%, ${darken(heroColor, 0.22)} 100%)`,
          boxShadow: `0 12px 40px ${darken(heroColor, 0.1)}60`,
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

        <div className="relative p-8">
          {/* Category + Pin badges */}
          <div className="flex items-center gap-2 mb-4">
            {category && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(6px)', color: textPrimary }}
              >
                {category.icon} {category.name}
              </span>
            )}
            {article.isPinned && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.2)', color: textPrimary }}>
                📌 고정됨
              </span>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-2xl sm:text-3xl font-black leading-tight tracking-tight mb-4"
            style={{ color: textPrimary, textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
          >
            {article.title}
          </h1>

          {/* Meta row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: textMuted }}>
              <Calendar size={11} />
              <span>작성 {new Date(article.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: textMuted }}>
              <Clock size={11} />
              <span>수정 {new Date(article.updatedAt).toLocaleDateString('ko-KR')}</span>
            </div>
          </div>

          {/* ← 버튼은 하단 고정 플로팅으로 이동 */}
        </div>
      </div>

      {/* ── Content ── */}
      <div
        className="animate-slide-up rounded-3xl border border-border p-6 sm:p-10"
        style={{ background: 'var(--color-bg-elevated)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}
      >
        {article.content ? (
          <MarkdownRenderer content={article.content} />
        ) : (
          <div className="text-center py-12">
            <p className="text-text-muted text-sm italic">내용이 없습니다.</p>
            <button
              onClick={() => setShowEditor(true)}
              className="mt-3 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${heroColor}, ${darken(heroColor, 0.2)})`, boxShadow: `0 6px 20px ${heroColor}40` }}
            >
              내용 작성하기
            </button>
          </div>
        )}
      </div>

      {/* ── Tags ── */}
      {article.tags.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">태그</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all"
                style={{
                  background: `${heroColor}15`,
                  color: heroColor,
                  border: `1px solid ${heroColor}30`,
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── References ── */}
      {article.references.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-4 bg-accent rounded-full" />
            <h2 className="text-lg font-bold text-text-primary">사이트</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {article.references.map((ref, idx) => {
              const ytId = getYouTubeId(ref.url);
              if (ytId) {
                // ── YouTube 인라인 플레이어 ──
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-bg-elevated)',
                      border: `1px solid ${heroColor}25`,
                      boxShadow: `0 4px 24px ${heroColor}18`,
                      borderRadius: '24px',
                      padding: '14px',
                      overflow: 'hidden',       /* 카드 밖으로 절대 이탈 불가 */
                      boxSizing: 'border-box',
                    }}
                  >
                    {/* 제목 헤더 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '10px', flexShrink: 0,
                        background: heroColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                          <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ref.title || 'YouTube 영상'}
                        </div>
                        <a href={ref.url} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '11px', color: heroColor, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          onClick={e => e.stopPropagation()}
                        >
                          {ref.url}
                        </a>
                      </div>
                    </div>

                    {/* ── 16:9 비율 iframe 컨테이너 (padding-bottom 기법 — 가장 안정적) ── */}
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '56.25%',  /* 9/16 = 56.25% → 16:9 비율 */
                      height: 0,
                      borderRadius: '14px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
                    }}>
                      <iframe
                        style={{
                          position: 'absolute',
                          top: 0, left: 0,
                          width: '100%', height: '100%',
                          border: 'none', display: 'block',
                        }}
                        src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                        title={ref.title || 'YouTube video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        loading="lazy"
                      />
                    </div>
                  </div>
                );
              }

              // ── 일반 링크 ──
              return (
                <a
                  key={idx}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col rounded-2xl transition-all group hover:-translate-y-1 overflow-hidden"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: `1px solid ${heroColor}25`,
                    boxShadow: `0 4px 12px ${heroColor}15`,
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: `${heroColor}15` }}
                      >
                        <ExternalLink size={14} style={{ color: heroColor }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-text-muted uppercase tracking-tight truncate">
                          {new URL(ref.url).hostname}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors line-clamp-2 min-h-[40px] leading-snug">
                      {ref.title || ref.url}
                    </div>
                    <div className="text-[11px] text-text-muted truncate mt-3 opacity-60 flex items-center gap-1.5">
                      <div className="w-1 h-1 rounded-full bg-text-muted opacity-40" />
                      {ref.url}
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FAB: 카드 영역 우측 추적 ── */}
      <div
        className="fixed z-50 animate-fade-in transition-all duration-500"
        style={{ 
          top: '200px', 
          right: 'max(16px, calc(50% - 610px))'
        }}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
      >
        {/* 배경 컨테이너 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '10px',
            borderRadius: '20px',
            background: fabHovered ? 'var(--glass-bg)' : 'transparent',
            backdropFilter: fabHovered ? 'blur(20px)' : 'none',
            border: fabHovered ? `1px solid ${heroColor}30` : '1px solid transparent',
            boxShadow: fabHovered ? `0 12px 40px ${heroColor}20, 0 0 0 1px rgba(255,255,255,0.05)` : 'none',
            transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >

          {/* ── 고정 버튼 ── */}
          <button
            onClick={togglePin}
            title={article.isPinned ? '고정 해제' : '상단 고정'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: fabHovered ? '8px' : '0px',
              justifyContent: fabHovered ? 'flex-start' : 'center',
              paddingLeft: fabHovered ? '12px' : '0',
              width: fabHovered ? '110px' : '36px',
              height: '36px',
              borderRadius: '12px',
              border: fabHovered ? 'none' : `1.5px solid ${heroColor}55`,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              background: fabHovered
                ? article.isPinned ? `${heroColor}20` : `rgba(255,255,255,0.08)`
                : `${heroColor}12`,
              color: article.isPinned || fabHovered ? heroColor : heroColor,
              boxShadow: fabHovered ? 'none' : `0 4px 14px ${heroColor}30`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Pin size={13} style={{ flexShrink: 0 }} />
            {fabHovered && <span>{article.isPinned ? '고정됨' : '고정'}</span>}
          </button>

          {/* ── 수정 버튼 ── */}
          <button
            onClick={() => setShowEditor(true)}
            title="아티클 수정"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: fabHovered ? '8px' : '0px',
              justifyContent: fabHovered ? 'flex-start' : 'center',
              paddingLeft: fabHovered ? '12px' : '0',
              width: fabHovered ? '110px' : '36px',
              height: '36px',
              borderRadius: '12px',
              border: fabHovered ? 'none' : `1.5px solid ${heroColor}55`,
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              background: fabHovered ? `${heroColor}18` : `${heroColor}12`,
              color: heroColor,
              boxShadow: fabHovered ? 'none' : `0 4px 14px ${heroColor}30`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <Edit3 size={13} style={{ flexShrink: 0 }} />
            {fabHovered && <span>수정</span>}
          </button>

          {/* ── 삭제 버튼 ── */}
          <button
            onClick={handleDelete}
            title="아티클 삭제"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: fabHovered ? '8px' : '0px',
              justifyContent: fabHovered ? 'flex-start' : 'center',
              paddingLeft: fabHovered ? '12px' : '0',
              width: fabHovered ? '110px' : '36px',
              height: '36px',
              borderRadius: '12px',
              border: fabHovered ? 'none' : '1.5px solid rgba(239,68,68,0.45)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 700,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
              background: fabHovered ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
              color: '#ef4444',
              boxShadow: fabHovered ? 'none' : '0 4px 14px rgba(239,68,68,0.20)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <Trash2 size={13} style={{ flexShrink: 0 }} />
            {fabHovered && <span>삭제</span>}
          </button>

        </div>
      </div>


      {/* Editor */}
      <ArticleEditor
        isOpen={showEditor}
        onClose={() => setShowEditor(false)}
        categoryId={article.categoryId}
        initial={article}
      />
    </div>
  );
}
