import { useState, useRef } from 'react';
import { X, Check } from 'lucide-react';
import type { Category } from '../types';

// ─── Curated Icon Set (섹션별) ────────────────────────────────────
const ICON_SECTIONS = [
  {
    label: '🖥️ 개발 & 기술',
    icons: ['⚛️','🔷','🐍','☕','🦀','🐘','🐳','🔥','💎','🦄','📦','🔌','🖧','🛰️','🧩','🔐','🗝️','🛡️','⚙️','🔩'],
  },
  {
    label: '📐 디자인 & UI',
    icons: ['🎨','✏️','🖌️','🎭','🖼️','🎞️','📐','📏','🌈','💄','🪄','🎬','📷','🔮','🪟','🔆'],
  },
  {
    label: '📊 데이터 & AI',
    icons: ['📊','📈','📉','🤖','🧠','🔬','🧬','🔭','🧪','🧮','📡','🌐','☁️','🗄️','💾','🔄'],
  },
  {
    label: '📖 학습 & 지식',
    icons: ['📚','📗','📘','📙','📕','🎓','📝','✍️','🗒️','📓','📔','📒','🗃️','📌','📎','🔖'],
  },
  {
    label: '🚀 프로젝트 & 운영',
    icons: ['🚀','🎯','⚡','🏆','🥇','🎖️','🗂️','📋','🗓️','⏱️','🔔','🚦','🛠️','⛏️','🪛','🧰'],
  },
  {
    label: '🌍 기타',
    icons: ['🌍','🏠','🏢','🌱','🌿','🍀','💡','🔆','🪐','⭐','🌙','☀️','🌊','🔗','🤝','💬'],
  },
];

// ─── Preset Colors ────────────────────────────────────────────────
const PRESET_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#10b981', '#06b6d4',
  '#3b82f6', '#0ea5e9', '#14b8a6', '#84cc16', '#ef4444',
];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'createdAt' | 'order'>) => void;
  initial?: Category;
}

// Convert hex to r,g,b integers
function hexToRgb(hex: string) {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return { r: 139, g: 92, b: 246 };
  return { r: parseInt(m[0], 16), g: parseInt(m[1], 16), b: parseInt(m[2], 16) };
}

function rgbToHex(r: number, g: number, b: number) {
  return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
}

export default function CategoryModal({ isOpen, onClose, onSave, initial }: CategoryModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [icon, setIcon] = useState(initial?.icon || '📚');
  const [color, setColor] = useState(initial?.color || '#6366f1');
  const [rgb, setRgb] = useState(() => hexToRgb(initial?.color || '#6366f1'));
  const [hexInput, setHexInput] = useState(initial?.color || '#6366f1');
  const [showRgb, setShowRgb] = useState(false);
  const nativeColorRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const applyHex = (hex: string) => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex)) {
      setColor(hex);
      setHexInput(hex);
      setRgb(hexToRgb(hex));
    }
  };

  const applyRgb = (r: number, g: number, b: number) => {
    const hex = rgbToHex(r, g, b);
    setRgb({ r, g, b });
    setColor(hex);
    setHexInput(hex);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), icon, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-xl mx-4 rounded-3xl bg-bg-card border border-border shadow-2xl animate-scale-in overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Live preview badge */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-md transition-all"
                style={{ backgroundColor: `${color}22`, border: `2px solid ${color}55` }}
              >
                {icon}
              </div>
              <div>
                <h2 className="text-lg font-black text-text-primary">{initial ? '카테고리 수정' : '새 카테고리'}</h2>
                <p className="text-xs text-text-muted">{name || '이름을 입력하세요'}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-bg-hover transition-colors text-text-muted">
              <X size={18} />
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">카테고리 이름 *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: React, DevOps, TypeScript..."
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors"
              autoFocus
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">설명</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="카테고리에 대한 간단한 설명..."
              rows={2}
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* ── Icon Picker ── */}
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-3">아이콘 선택</label>
            <div className="space-y-3">
              {ICON_SECTIONS.map(section => (
                <div key={section.label}>
                  <p className="text-[10px] font-bold text-text-muted mb-1.5 tracking-wide">{section.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {section.icons.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setIcon(opt)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all relative
                          ${icon === opt
                            ? 'ring-2 ring-offset-1 ring-offset-bg-card scale-110'
                            : 'bg-bg-secondary hover:bg-bg-hover hover:scale-105'
                          }`}
                        style={icon === opt ? { backgroundColor: `${color}20`, outline: `2px solid ${color}` } : {}}
                      >
                        {opt}
                        {icon === opt && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                            <Check size={8} className="text-white" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Color Picker ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider">색상</label>
              <button
                type="button"
                onClick={() => setShowRgb(v => !v)}
                className="text-xs font-bold px-3 py-1 rounded-lg transition-all"
                style={{
                  background: showRgb ? `${color}25` : 'rgba(0,0,0,0.05)',
                  color: showRgb ? color : '#9ca3af',
                }}
              >
                {showRgb ? 'RGB 슬라이더 ▲' : 'RGB 슬라이더 ▼'}
              </button>
            </div>

            {/* Preset swatches */}
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => applyHex(c)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110 flex items-center justify-center"
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 0 3px white, 0 0 0 5px ${c}` : undefined,
                    transform: color === c ? 'scale(1.15)' : undefined,
                  }}
                >
                  {color === c && <Check size={12} className="text-white" />}
                </button>
              ))}

              {/* Native color picker trigger */}
              <button
                type="button"
                onClick={() => nativeColorRef.current?.click()}
                className="w-8 h-8 rounded-full border-2 border-dashed border-border flex items-center justify-center text-text-muted hover:border-accent hover:text-accent transition-all text-sm"
                title="직접 선택"
              >
                +
              </button>
              <input
                ref={nativeColorRef}
                type="color"
                value={color}
                onChange={e => applyHex(e.target.value)}
                className="sr-only"
              />
            </div>

            {/* Hex input */}
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg border border-border flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                value={hexInput}
                onChange={e => { setHexInput(e.target.value); applyHex(e.target.value); }}
                placeholder="#6366f1"
                className="flex-1 bg-bg-secondary border border-border rounded-xl px-3 py-2 text-sm font-mono text-text-primary outline-none focus:border-accent transition-colors"
                maxLength={7}
              />
            </div>

            {/* RGB Sliders */}
            {showRgb && (
              <div className="space-y-3 p-4 rounded-2xl animate-scale-in" style={{ background: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
                {(['r', 'g', 'b'] as const).map((ch, idx) => {
                  const labels = ['R  빨강', 'G  초록', 'B  파랑'];
                  const trackColors = ['#ef4444', '#22c55e', '#3b82f6'];
                  return (
                    <div key={ch} className="flex items-center gap-3">
                      <span className="text-xs font-bold w-14 text-text-muted">{labels[idx]}</span>
                      <input
                        type="range"
                        min={0}
                        max={255}
                        value={rgb[ch]}
                        onChange={e => {
                          const newRgb = { ...rgb, [ch]: Number(e.target.value) };
                          applyRgb(newRgb.r, newRgb.g, newRgb.b);
                        }}
                        className="flex-1 h-2 rounded-full cursor-pointer appearance-none"
                        style={{
                          background: `linear-gradient(to right, #111 0%, ${trackColors[idx]} 100%)`,
                          accentColor: trackColors[idx],
                        }}
                      />
                      <span
                        className="text-xs font-mono font-bold w-8 text-right"
                        style={{ color: trackColors[idx] }}
                      >
                        {rgb[ch]}
                      </span>
                    </div>
                  );
                })}

                {/* Live preview */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="h-5 flex-1 rounded-lg" style={{ backgroundColor: color }} />
                  <span className="text-xs font-mono text-text-muted">{color.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-bg-card">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg"
            style={{ backgroundColor: color, boxShadow: `0 4px 14px ${color}55` }}
          >
            {initial ? '수정 완료' : '카테고리 추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
