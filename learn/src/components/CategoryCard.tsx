import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Palette, Check, X } from 'lucide-react';
import type { Category } from '../types';
import { useStore } from '../hooks/useStore';
import { getArticlesByCategory } from '../services/storage';

interface CategoryCardProps {
  category: Category;
}

// Vibrant preset palette
const CARD_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#10b981', '#0ea5e9', '#84cc16', '#ff6b35',
];

// Get perceptual luminance and decide text color
function getTextColor(hex: string): 'white' | 'dark' {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return 'white';
  const [r, g, b] = m.map(v => parseInt(v, 16));
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? 'dark' : 'white';
}

// Darken hex by a factor (0..1)
function darken(hex: string, amount = 0.25): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  return '#' + m.map(v => Math.max(0, Math.round(parseInt(v, 16) * (1 - amount))).toString(16).padStart(2, '0')).join('');
}

// Lighten hex
function lighten(hex: string, amount = 0.35): string {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return hex;
  return '#' + m.map(v => Math.min(255, Math.round(parseInt(v, 16) + (255 - parseInt(v, 16)) * amount)).toString(16).padStart(2, '0')).join('');
}

export default function CategoryCard({ category }: CategoryCardProps) {
  const navigate = useNavigate();
  const { data, editCategory } = useStore();
  const articles = getArticlesByCategory(data, category.id);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerHex, setPickerHex] = useState(category.color);
  const nativeRef = useRef<HTMLInputElement>(null);

  const textMode = getTextColor(category.color);
  const isLight = textMode === 'dark';
  const textPrimary = isLight ? '#111827' : '#ffffff';
  const textMuted = isLight ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.72)';
  const badgeBg = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.18)';
  const shadowColor = darken(category.color, 0.15);

  const handleColorSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    editCategory(category.id, { color: pickerHex });
    setShowColorPicker(false);
  };

  const openPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPickerHex(category.color);
    setShowColorPicker(true);
  };

  const cancelPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowColorPicker(false);
  };

  return (
    <div className="relative group" style={{ isolation: 'isolate' }}>
      <button
        onClick={() => navigate(`/category/${category.id}`)}
        className="w-full text-left rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 block"
        style={{
          background: `linear-gradient(145deg, ${category.color} 0%, ${darken(category.color, 0.18)} 100%)`,
          boxShadow: `0 8px 30px ${shadowColor}55, 0 2px 8px ${shadowColor}30`,
        }}
      >
        {/* Noise / gloss overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)',
            borderRadius: 'inherit',
          }}
        />

        {/* Decorative circle (background) */}
        <div
          className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 pointer-events-none"
          style={{ background: lighten(category.color, 0.5) }}
        />
        <div
          className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full opacity-15 pointer-events-none"
          style={{ background: lighten(category.color, 0.4) }}
        />

        <div className="relative p-6">
          {/* Icon + article count */}
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
            >
              <span style={{ fontSize: '28px', lineHeight: 1 }}>{category.icon}</span>
            </div>

            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{ background: badgeBg, color: textPrimary }}
            >
              <FileText size={11} />
              <span>{articles.length}</span>
            </div>
          </div>

          {/* Name */}
          <h3
            className="text-lg font-black leading-snug mb-1.5 tracking-tight"
            style={{ color: textPrimary }}
          >
            {category.name}
          </h3>

          {/* Description */}
          <p
            className="text-xs leading-relaxed line-clamp-2"
            style={{ color: textMuted }}
          >
            {category.description || '아직 설명이 없습니다'}
          </p>
        </div>
      </button>

      {/* ── Color Picker Trigger ── */}
      <button
        onClick={openPicker}
        className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 z-10"
        style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)', color: '#ffffff' }}
        title="색상 변경"
      >
        <Palette size={13} />
      </button>

      {/* ── Color Picker Panel ── */}
      {showColorPicker && (
        <div
          className="absolute top-0 left-0 right-0 z-50 rounded-3xl p-4 shadow-2xl animate-scale-in"
          style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)' }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-text-primary">카드 색상 변경</span>
            <button onClick={cancelPicker} className="text-text-muted hover:text-text-primary"><X size={14} /></button>
          </div>

          {/* Preset swatches */}
          <div className="grid grid-cols-8 gap-1.5 mb-3">
            {CARD_COLORS.map(c => (
              <button
                key={c}
                onClick={e => { e.stopPropagation(); setPickerHex(c); }}
                className="w-8 h-8 rounded-xl transition-all hover:scale-110 flex items-center justify-center"
                style={{
                  backgroundColor: c,
                  outline: pickerHex === c ? `3px solid ${c}` : undefined,
                  outlineOffset: pickerHex === c ? '2px' : undefined,
                }}
              >
                {pickerHex === c && <Check size={12} className="text-white drop-shadow" />}
              </button>
            ))}
          </div>

          {/* Hex + native picker */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 border border-border" style={{ backgroundColor: pickerHex }} />
            <input
              type="text"
              value={pickerHex}
              onChange={e => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setPickerHex(e.target.value); }}
              className="flex-1 bg-bg-secondary border border-border rounded-xl px-3 py-1.5 text-xs font-mono text-text-primary outline-none"
              maxLength={7}
              onClick={e => e.stopPropagation()}
            />
            <button
              onClick={e => { e.stopPropagation(); nativeRef.current?.click(); }}
              className="text-xs px-2 py-1.5 rounded-lg bg-bg-secondary border border-border text-text-muted hover:text-accent transition-colors"
            >
              🎨
            </button>
            <input
              ref={nativeRef}
              type="color"
              value={pickerHex}
              onChange={e => setPickerHex(e.target.value)}
              className="sr-only"
            />
          </div>

          {/* Preview strip */}
          <div className="h-10 rounded-xl mb-3 transition-all" style={{ background: `linear-gradient(135deg, ${pickerHex}, ${darken(pickerHex, 0.2)})` }} />

          {/* Save / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={cancelPicker}
              className="flex-1 py-2 rounded-xl text-xs font-semibold text-text-muted hover:bg-bg-hover transition-all"
            >취소</button>
            <button
              onClick={handleColorSave}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white transition-all"
              style={{ background: pickerHex, boxShadow: `0 4px 12px ${pickerHex}55` }}
            >적용</button>
          </div>
        </div>
      )}
    </div>
  );
}
