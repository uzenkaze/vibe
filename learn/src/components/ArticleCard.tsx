import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pin, ExternalLink, Palette, Check, Clock, X } from 'lucide-react';
import type { Article } from '../types';
import { useStore } from '../hooks/useStore';

interface ArticleCardProps {
  article: Article;
  showCategory?: boolean;
}

// Vibrant preset palette (same as CategoryCard)
const CARD_COLORS = [
  '',          // Reset / no color
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
];

function darken(hex: string, amount = 0.2): string {
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

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString('ko-KR');
}

export default function ArticleCard({ article, showCategory = false }: ArticleCardProps) {
  const navigate = useNavigate();
  const { data, editArticle } = useStore();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerColor, setPickerColor] = useState(article.color || '');
  const nativeRef = useRef<HTMLInputElement>(null);

  const category = data.categories.find(c => c.id === article.categoryId);

  const cardColor = article.color || category?.color || '#6366f1';
  const isLight = cardColor.startsWith('#') ? getTextColor(cardColor) === 'dark' : false;
  const textColor = isLight ? '#111827' : '#ffffff';
  const textMutedColor = isLight ? 'rgba(17, 24, 39, 0.72)' : 'rgba(255, 255, 255, 0.75)';
  const textSubtleColor = isLight ? 'rgba(17, 24, 39, 0.55)' : 'rgba(255, 255, 255, 0.6)';
  const badgeBg = isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.2)';
  const tagBg = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.18)';

  const preview = article.content
    .replace(/<[^>]+>/g, '')
    .replace(/@@[^:]+:([^@]+)@@/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  const handleColorSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    editArticle(article.id, { color: pickerColor });
    setShowColorPicker(false);
  };

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerColor(article.color || '');
    setShowColorPicker(true);
  };

  const cancelPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(false);
  };

  return (
    <div className="relative group" style={{ isolation: 'isolate' }}>
      <div
        onClick={() => navigate(`/article/${article.id}`)}
        className="w-full text-left rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer block"
        style={{
          background: `linear-gradient(145deg, ${cardColor} 0%, ${darken(cardColor, 0.2)} 100%)`,
          boxShadow: `0 8px 30px ${darken(cardColor, 0.1)}55`,
        }}
      >
        {/* Gloss overlay */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.06) 100%)' }}
        />
        {/* Decorative circle */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        />

        <div className="relative p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {article.isPinned && (
                <Pin size={12} className="flex-shrink-0" style={{ color: textMutedColor }} />
              )}
              <h3
                className="text-sm font-black leading-snug tracking-tight line-clamp-2"
                style={{ color: textColor }}
              >
                {article.title}
              </h3>
            </div>
            {article.references.length > 0 && (
              <ExternalLink size={12} className="flex-shrink-0 mt-0.5" style={{ color: textSubtleColor }} />
            )}
          </div>

          {/* Preview text */}
          {preview && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mb-4"
              style={{ color: textMutedColor }}
            >
              {preview}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Category badge */}
              {showCategory && category && (
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ background: badgeBg, color: textColor }}
                >
                  {category.icon} {category.name}
                </span>
              )}

              {/* Tags */}
              {article.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: tagBg, color: textMutedColor }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Time */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <Clock size={10} style={{ color: textSubtleColor }} />
              <span
                className="text-[10px] font-medium"
                style={{ color: textMutedColor }}
              >
                {getTimeAgo(article.updatedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Color change trigger */}
      <button
        onClick={openPicker}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', color: '#fff' }}
        title="색상 변경"
      >
        <Palette size={13} />
      </button>

      {/* ── Inline Color Picker ── */}
      {showColorPicker && (
        <div
          className="absolute top-0 left-0 right-0 z-50 rounded-3xl p-4 shadow-2xl animate-scale-in"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-primary">아티클 색상</span>
            <button onClick={cancelPicker} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
          </div>

          {/* Swatches grid */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {/* Reset button */}
            <button
              onClick={e => { e.stopPropagation(); setPickerColor(''); }}
              className="w-8 h-8 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-text-muted text-xs hover:border-accent hover:text-accent transition-all"
            >✕</button>

            {CARD_COLORS.filter(Boolean).map(c => (
              <button
                key={c}
                onClick={e => { e.stopPropagation(); setPickerColor(c); }}
                className="w-8 h-8 rounded-xl transition-all hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: c,
                  outline: pickerColor === c ? `3px solid ${c}` : undefined,
                  outlineOffset: pickerColor === c ? '2px' : undefined,
                }}
              >
                {pickerColor === c && <Check size={12} className="text-white drop-shadow" />}
              </button>
            ))}

            {/* Native color picker */}
            <button
              onClick={e => { e.stopPropagation(); nativeRef.current?.click(); }}
              className="w-8 h-8 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-base hover:border-accent transition-all"
            >+</button>
            <input ref={nativeRef} type="color" value={pickerColor || '#6366f1'} onChange={e => setPickerColor(e.target.value)} className="sr-only" />
          </div>

          {/* Preview strip */}
          <div
            className="h-8 rounded-xl mb-3 transition-all"
            style={pickerColor
              ? { background: `linear-gradient(135deg, ${pickerColor}, ${darken(pickerColor, 0.2)})` }
              : { background: 'var(--color-bg-secondary)', border: '1px dashed var(--color-border)' }
            }
          />

          <div className="flex gap-2">
            <button onClick={cancelPicker} className="flex-1 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg-hover transition-all">취소</button>
            <button
              onClick={handleColorSave}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: pickerColor || '#6366f1', boxShadow: `0 4px 12px ${pickerColor || '#6366f1'}55` }}
            >적용</button>
          </div>
        </div>
      )}
    </div>
  );
}
