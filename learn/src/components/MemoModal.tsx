import { useState, useEffect } from 'react';
import { X, Star, Pin, Trash2 } from 'lucide-react';
import type { Memo } from '../types';

interface MemoModalProps {
  memo: Memo;
  onClose: () => void;
  onSave: (content: string, title: string, updates?: Partial<Memo>) => void;
  onDelete: (id: string) => void;
}

export default function MemoModal({ memo, onClose, onSave, onDelete }: MemoModalProps) {
  const [title, setTitle] = useState(memo.title || '');
  const [content, setContent] = useState(memo.content);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setTitle(memo.title || '');
    setContent(memo.content);
  }, [memo]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSave = () => {
    onSave(content, title);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `최종 수정: ${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}.`;
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      {/* Backdrop - fixed and full screen */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={handleClose}
      />
      
      {/* Modal Content - relative to fixed wrapper */}
      <div className={`relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-300 ease-out ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}
           style={{ height: '85vh', maxHeight: '900px' }}>
        
        {/* Header Icons */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {memo.isPinned && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold">
                <Pin size={12} />
                고정됨
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex items-center gap-1 md:gap-1.5 mr-4 border-r border-gray-100 pr-4">
              <button 
                onClick={() => onSave(content, title, { isFavorite: !memo.isFavorite })}
                className={`p-2 rounded-lg transition-colors ${memo.isFavorite ? 'bg-amber-50 text-amber-500' : 'hover:bg-gray-100 text-gray-400'}`}
                title={memo.isFavorite ? "중요 표시 해제" : "중요 표시"}
              >
                <Star size={18} fill={memo.isFavorite ? "currentColor" : "none"} />
              </button>
              
              <button 
                onClick={() => onSave(content, title, { isPinned: !memo.isPinned })}
                className={`p-2 rounded-lg transition-colors ${memo.isPinned ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100 text-gray-400'}`}
                title={memo.isPinned ? "고정 해제" : "상단 고정"}
              >
                <Pin size={18} fill={memo.isPinned ? "currentColor" : "none"} />
              </button>

              <button 
                onClick={() => { if(window.confirm('삭제하시겠습니까?')) { onDelete(memo.id); handleClose(); } }}
                className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <button 
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              title="닫기"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-8">
          <div className="flex items-center justify-between text-xs font-bold">
             <div className="flex items-center gap-2 text-amber-400">
               <span className="w-2 h-2 rounded-full bg-amber-400" />
               내 메모
             </div>
             <div className="text-gray-300">
               {formatDate(memo.updatedAt || memo.createdAt)}
             </div>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSave}
            placeholder="제목"
            className="w-full text-4xl font-bold text-gray-300 placeholder:text-gray-200 border-none outline-none focus:text-gray-900 transition-colors"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="내용을 입력하세요..."
            className="w-full flex-1 min-h-[400px] text-lg text-gray-600 placeholder:text-gray-200 border-none outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
