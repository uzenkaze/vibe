import { useState } from 'react';
import { Plus, Trash2, StickyNote, X, RotateCcw, Trash, GripVertical, Check } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const MEMO_COLORS = [
  '#fef9c3', // Yellow
  '#fee2e2', // Red/Pink
  '#dcfce7', // Green
  '#dbeafe', // Blue
  '#f3e8ff', // Purple
  '#ffedd5', // Orange
];

export default function MemoPage() {
  const { data, addMemo, removeMemo, editMemo, restoreMemo, permanentlyDeleteMemo, emptyTrash, reorderMemos } = useStore();
  const [isAdding, setIsAdding] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMO_COLORS[0]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const activeMemos = data.memos || [];
  const trashMemos = data.trash || [];

  const handleAdd = () => {
    if (!newContent.trim()) return;
    addMemo(newContent.trim(), selectedColor);
    setNewContent('');
    setIsAdding(false);
  };

  const handleStartEdit = (memo: { id: string, content: string }) => {
    setEditingId(memo.id);
    setEditingContent(memo.content);
  };

  const handleSaveEdit = () => {
    if (editingId && editingContent.trim()) {
      editMemo(editingId, editingContent.trim());
    }
    setEditingId(null);
  };

  // Drag and Drop Logic
  const onDragStart = (idx: number) => {
    if (editingId) return; // Disable drag while editing
    setDraggedIndex(idx);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    
    const newMemos = [...activeMemos];
    const [draggedItem] = newMemos.splice(draggedIndex, 1);
    newMemos.splice(targetIdx, 0, draggedItem);
    
    reorderMemos(newMemos);
    setDraggedIndex(null);
  };

  return (
    <div className="py-8 space-y-8 animate-fade-in">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
              <StickyNote size={22} />
            </div>
            <h1 className="text-3xl font-black text-text-primary tracking-tight">Quick Memos</h1>
          </div>
          
          <div className="flex p-1 bg-bg-secondary rounded-xl border border-border">
            <button
              onClick={() => setShowTrash(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!showTrash ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              활성 메모 ({activeMemos.length})
            </button>
            <button
              onClick={() => setShowTrash(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${showTrash ? 'bg-bg-card text-accent shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
            >
              휴지통 ({trashMemos.length})
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {showTrash ? (
            <button
              onClick={() => { if (window.confirm('휴지통을 비우시겠습니까?')) emptyTrash(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash size={16} />
              휴지통 비우기
            </button>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-accent text-white font-bold hover:bg-accent-hover transition-all shadow-lg shadow-accent/25 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              새 메모 추가
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {!showTrash ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Add Form Card */}
          {isAdding && (
            <div 
              className="relative flex flex-col p-6 rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 animate-scale-in"
              style={{ minHeight: '240px' }}
            >
              <button 
                onClick={() => setIsAdding(false)}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 text-text-muted"
              >
                <X size={16} />
              </button>
              <textarea
                autoFocus
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="여기에 내용을 입력하세요..."
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm text-text-primary font-sans leading-relaxed placeholder:text-text-muted/50"
              />
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-1.5">
                  {MEMO_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${selectedColor === c ? 'border-accent' : 'border-transparent'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <button
                  onClick={handleAdd}
                  disabled={!newContent.trim()}
                  className="px-4 py-1.5 rounded-xl bg-accent text-white text-xs font-bold disabled:opacity-50 transition-all"
                >
                  저장
                </button>
              </div>
            </div>
          )}

          {/* Active Memos */}
          {activeMemos.map((memo, idx) => (
            <div
              key={memo.id}
              draggable={!editingId}
              onDragStart={() => onDragStart(idx)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(idx)}
              className={`group relative p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-scale-in ${draggedIndex === idx ? 'opacity-30 scale-95' : ''} ${!editingId ? 'cursor-move' : ''}`}
              style={{
                backgroundColor: memo.color,
                minHeight: '200px',
                transform: `rotate(${(idx % 3 - 1) * 0.8}deg)`,
                color: '#1e293b'
              }}
            >
              <div className="absolute inset-0 pointer-events-none rounded-2xl" 
                   style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
              
              {!editingId && (
                <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-30 transition-opacity">
                  <GripVertical size={14} />
                </div>
              )}

              {editingId === memo.id ? (
                <div className="flex flex-col h-full">
                  <textarea
                    autoFocus
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    onBlur={handleSaveEdit}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="flex-1 bg-white/30 rounded-xl p-2 border-none outline-none resize-none text-sm font-sans leading-relaxed text-slate-800"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-[10px] opacity-40 font-bold">Ctrl + Enter to save</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleSaveEdit(); }}
                      className="p-1.5 rounded-lg bg-black/10 hover:bg-black/20 text-slate-800 transition-all"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (window.confirm('메모를 휴지통으로 이동하시겠습니까?')) removeMemo(memo.id); }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 text-black/40 hover:text-red-500 transition-all z-10"
                  >
                    <Trash2 size={14} />
                  </button>

                  <div 
                    onClick={() => handleStartEdit(memo)}
                    className="relative text-sm font-medium leading-relaxed whitespace-pre-wrap break-words mt-2 cursor-text h-full"
                  >
                    {memo.content}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                       <div className="bg-black/5 px-2 py-1 rounded text-[10px] font-bold">Click to edit</div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-4 left-6 text-[10px] font-bold opacity-30 uppercase tracking-widest">
                    {new Date(memo.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </>
              )}
            </div>
          ))}

          {activeMemos.length === 0 && !isAdding && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-text-muted opacity-50">
              <StickyNote size={48} className="mb-4" strokeWidth={1} />
              <p className="text-sm font-medium">아직 메모가 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Trash Memos */}
          {trashMemos.map((memo, idx) => (
            <div
              key={memo.id}
              className="group relative p-6 rounded-2xl shadow-sm transition-all duration-300 animate-scale-in grayscale-[0.3]"
              style={{
                backgroundColor: memo.color,
                minHeight: '200px',
                transform: `rotate(${(idx % 3 - 1) * 0.8}deg)`,
                color: '#475569',
                opacity: 0.8
              }}
            >
              <div className="flex absolute top-3 right-3 gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={() => restoreMemo(memo.id)}
                  title="복구"
                  className="p-1.5 rounded-lg hover:bg-black/10 text-green-600 transition-all"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => { if (window.confirm('영구 삭제하시겠습니까?')) permanentlyDeleteMemo(memo.id); }}
                  title="영구 삭제"
                  className="p-1.5 rounded-lg hover:bg-black/10 text-red-600 transition-all"
                >
                  <Trash size={14} />
                </button>
              </div>

              <div className="relative text-sm font-medium leading-relaxed whitespace-pre-wrap break-words pr-8">
                {memo.content}
              </div>
              
              <div className="absolute bottom-4 left-6 text-[10px] font-bold opacity-30 uppercase tracking-widest">
                삭제됨
              </div>
            </div>
          ))}

          {trashMemos.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-text-muted opacity-50">
              <Trash size={48} className="mb-4" strokeWidth={1} />
              <p className="text-sm font-medium">휴지통이 비어있습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
