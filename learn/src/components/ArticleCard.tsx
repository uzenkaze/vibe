import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, ExternalLink, Palette } from 'lucide-react';
import type { Article } from '../types';
import { useStore } from '../hooks/useStore';

interface ArticleCardProps {
  article: Article;
  showCategory?: boolean;
}

const CARD_COLORS = [
  '', // Reset
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
];

export default function ArticleCard({ article, showCategory = false }: ArticleCardProps) {
  const navigate = useNavigate();
  const { data, editArticle } = useStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  const category = data.categories.find(c => c.id === article.categoryId);

  const timeAgo = getTimeAgo(article.updatedAt);
  const preview = article.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .slice(0, 120);

  const handleColorChange = (e: React.MouseEvent, color: string) => {
    e.stopPropagation();
    editArticle(article.id, { color });
    setShowColorPicker(false);
  };

  const toggleColorPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(!showColorPicker);
  };

  return (
    <div
      onClick={() => navigate(`/article/${article.id}`)}
      className="group relative w-full text-left rounded-2xl border border-border bg-card-bg p-5 transition-all duration-300 hover:border-border-light hover:bg-card-hover hover:-translate-y-0.5 hover:shadow-xl cursor-pointer"
      style={{ 
        background: article.color ? `linear-gradient(${article.color}15, ${article.color}15), var(--color-card-bg)` : undefined,
        borderColor: article.color ? `${article.color}40` : undefined
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 pr-6">
          {article.isPinned && (
            <Pin size={12} className="text-accent flex-shrink-0" />
          )}
          <h3 className="text-sm font-bold text-card-text-primary truncate transition-colors" style={{ color: article.color }}>
            {article.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 absolute right-4 top-4">
          <button 
            onClick={toggleColorPicker}
            className="text-card-text-muted hover:text-card-text-primary opacity-0 group-hover:opacity-100 transition-opacity p-1"
            title="카드 색상 변경"
          >
            <Palette size={14} />
          </button>
          {article.references.length > 0 && (
            <ExternalLink size={12} className="text-card-text-muted" />
          )}
        </div>
      </div>

      {showColorPicker && (
        <div 
          className="absolute right-4 top-10 z-10 flex gap-1.5 p-2 rounded-xl bg-card-bg border border-border shadow-lg"
          onClick={e => e.stopPropagation()}
        >
          {CARD_COLORS.map(c => (
            <button
              key={c || 'reset'}
              onClick={(e) => handleColorChange(e, c)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110 flex items-center justify-center border border-border"
              style={{ backgroundColor: c || 'transparent' }}
              title={c ? '색상 적용' : '색상 초기화'}
            >
              {!c && <span className="text-[10px] text-card-text-muted">✕</span>}
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-card-text-muted leading-relaxed line-clamp-2 mb-3">
        {preview || '내용이 없습니다'}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showCategory && category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: `${category.color}15`, color: category.color }}>
              {category.icon} {category.name}
            </span>
          )}
          {article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-2 py-0.5 rounded-full bg-black/5 text-[10px] font-semibold text-card-text-muted">
              #{tag}
            </span>
          ))}
        </div>
        <span className="text-[10px] text-card-text-muted">{timeAgo}</span>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}
