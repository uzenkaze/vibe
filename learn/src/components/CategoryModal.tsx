import { useState } from 'react';
import { X } from 'lucide-react';
import type { Category } from '../types';

const ICON_OPTIONS = ['📚', '💻', '🎨', '🔧', '📊', '🧪', '🌐', '📝', '🎯', '⚡', '🔬', '🏗️', '📱', '📲', '🤖', '🧠', '🎓', '💡', '🔒', '📈', '🛠️', '👨‍💻', '👩‍💻', '⌨️', '🖥️', '🔗', '☁️', '🗂️', '📡'];
const COLOR_OPTIONS = ['#8b5cf6', '#06b6d4', '#22c55e', '#f59e0b', '#f43f5e', '#ec4899', '#3b82f6', '#14b8a6', '#a855f7', '#ef4444'];

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Category, 'id' | 'createdAt' | 'order'>) => void;
  initial?: Category;
}

const ICON_LABELS: Record<string, string> = {
  '📚': '책/학습', '💻': '컴퓨터/개발', '🎨': '디자인/예술', '🔧': '설정/도구',
  '📊': '통계/데이터', '🧪': '과학/실험', '🌐': '웹/네트워크', '📝': '노트/기록',
  '🎯': '목표/성과', '⚡': '빠른팁/에너지', '🔬': '연구/분석', '🏗️': '아키텍처/구조',
  '📱': '모바일/앱', '📲': '모바일 알림', '🤖': 'AI/로봇', '🧠': '지능/생각',
  '🎓': '교육/졸업', '💡': '아이디어', '🔒': '보안', '📈': '성장/차트',
  '🛠️': '유지보수/작업', '👨‍💻': '개발자(남)', '👩‍💻': '개발자(여)', '⌨️': '키보드',
  '🖥️': '데스크탑', '🔗': '링크/연결', '☁️': '클라우드', '🗂️': '파일/정리', '📡': '통신/신호'
};

export default function CategoryModal({ isOpen, onClose, onSave, initial }: CategoryModalProps) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [icon, setIcon] = useState(initial?.icon || '📚');
  const [color, setColor] = useState(initial?.color || '#8b5cf6');

  if (!isOpen) return null;

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
      <div className="relative w-full max-w-lg mx-4 rounded-3xl bg-bg-card border border-border shadow-2xl animate-scale-in overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">
              {initial ? '카테고리 수정' : '새 카테고리'}
            </h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-bg-hover transition-colors text-text-muted">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Icon */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">아이콘</label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setIcon(opt)}
                    title={ICON_LABELS[opt] || opt}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${icon === opt ? 'bg-accent/20 ring-2 ring-accent scale-110' : 'bg-bg-secondary hover:bg-bg-hover'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">색상</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-bg-card ring-white scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">카테고리 이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: React, TypeScript, DevOps..."
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

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
                취소
              </button>
              <button type="submit" className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-lg shadow-accent/20">
                {initial ? '수정' : '추가'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
