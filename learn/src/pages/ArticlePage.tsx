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

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, removeArticle, editArticle } = useStore();
  const [showEditor, setShowEditor] = useState(false);

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
    <div className="py-8 max-w-3xl mx-auto space-y-6">

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

          {/* Action buttons — bottom right */}
          <div className="absolute top-6 right-6 flex items-center gap-2">
            <button
              onClick={togglePin}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{
                background: article.isPinned ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)',
                color: textPrimary,
              }}
            >
              <Pin size={13} />
              {article.isPinned ? '고정됨' : '고정'}
            </button>
            <button
              onClick={() => setShowEditor(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: textPrimary }}
            >
              <Edit3 size={13} />
              수정
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:bg-red-500/40"
              style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)', color: textPrimary }}
            >
              <Trash2 size={13} />
              삭제
            </button>
          </div>
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
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink size={14} className="text-text-muted" />
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">참고 사이트</span>
          </div>
          <div className="space-y-2">
            {article.references.map((ref, idx) => (
              <a
                key={idx}
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-2xl transition-all group hover:-translate-y-0.5"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: `1px solid ${heroColor}25`,
                  boxShadow: `0 2px 8px ${heroColor}10`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ background: `${heroColor}18` }}
                >
                  <ExternalLink size={14} style={{ color: heroColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-text-primary group-hover:text-accent transition-colors truncate">
                    {ref.title || ref.url}
                  </div>
                  <div className="text-xs text-text-muted truncate mt-0.5">{ref.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

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
