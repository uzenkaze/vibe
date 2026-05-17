import { useState, useEffect } from 'react';
import { X, Star, Pin, Trash2, Folder } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import type { Memo } from '../types';

interface MemoModalProps {
  memo: Memo;
  onClose: () => void;
  onSave: (content: string, title: string, updates?: Partial<Memo>) => void;
  onDelete: (id: string) => void;
}

export default function MemoModal({ memo, onClose, onSave, onDelete }: MemoModalProps) {
  const { data } = useStore();
  const [title, setTitle] = useState(memo.title || '');
  const [content, setContent] = useState(memo.content);
  const [isClosing, setIsClosing] = useState(false);
  const [showFolderList, setShowFolderList] = useState(false);

  const folders = data.memoFolders || [];
  const currentFolder = folders.find(f => f.id === (memo.folderId || 'folder_default'));

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
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
        onClick={handleClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full max-w-4xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden transition-all duration-300 ease-out ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}
           style={{ height: '90vh', maxHeight: '900px' }}>
        
        {/* Header Icons */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="flex items-center gap-1 sm:gap-2">
            {memo.isPinned && (
              <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] sm:text-xs font-bold whitespace-nowrap">
                <Pin size={10} className="sm:size-[12px]" />
                <span className="hidden xs:inline">고정됨</span>
              </div>
            )}
            
            {/* Folder Selector */}
            <div className="relative">
              <button 
                onClick={() => setShowFolderList(!showFolderList)}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-full hover:bg-gray-100 text-gray-500 text-[10px] sm:text-xs font-bold transition-colors"
              >
                <Folder size={10} className="sm:size-[12px]" style={{ color: currentFolder?.color }} />
                <span className="max-w-[60px] sm:max-w-none truncate">{currentFolder?.name || '폴더'}</span>
              </button>
              
              {showFolderList && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-scale-in">
                  {folders.map(f => (
                    <button
                      key={f.id}
                      onClick={() => {
                        onSave(content, title, { folderId: f.id });
                        setShowFolderList(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${memo.folderId === f.id ? 'bg-accent/5 text-accent' : 'hover:bg-gray-50 text-gray-600'}`}
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                      {f.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1.5 mr-2 sm:mr-4 border-r border-gray-100 pr-2 sm:pr-4">
              <button 
                onClick={() => onSave(content, title, { isFavorite: !memo.isFavorite })}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${memo.isFavorite ? 'bg-amber-50 text-amber-500' : 'hover:bg-gray-100 text-gray-400'}`}
                title={memo.isFavorite ? "중요 표시 해제" : "중요 표시"}
              >
                <Star size={16} className="sm:size-[18px]" fill={memo.isFavorite ? "currentColor" : "none"} />
              </button>
              
              <button 
                onClick={() => onSave(content, title, { isPinned: !memo.isPinned })}
                className={`p-1.5 sm:p-2 rounded-lg transition-colors ${memo.isPinned ? 'bg-accent/10 text-accent' : 'hover:bg-gray-100 text-gray-400'}`}
                title={memo.isPinned ? "고정 해제" : "상단 고정"}
              >
                <Pin size={16} className="sm:size-[18px]" fill={memo.isPinned ? "currentColor" : "none"} />
              </button>

              <button 
                onClick={() => { if(window.confirm('삭제하시겠습니까?')) { onDelete(memo.id); handleClose(); } }}
                className="p-1.5 sm:p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                title="삭제"
              >
                <Trash2 size={16} className="sm:size-[18px]" />
              </button>
            </div>
            
            <button 
              onClick={handleClose}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              title="닫기"
            >
              <X size={20} className="sm:size-[24px]" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-between text-[10px] sm:text-xs font-bold">
             <div className="flex items-center gap-2" style={{ color: currentFolder?.color }}>
               <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentFolder?.color }} />
               {currentFolder?.name}
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
            className="w-full text-2xl sm:text-4xl font-bold text-gray-300 placeholder:text-gray-200 border-none outline-none focus:text-gray-900 transition-colors"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleSave}
            placeholder="내용을 입력하세요..."
            className="w-full flex-1 min-h-[300px] sm:min-h-[400px] text-base sm:text-lg text-gray-600 placeholder:text-gray-200 border-none outline-none resize-none leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
}
