import { useState, useMemo } from 'react';
import { 
  Plus, Trash2, StickyNote, X, RotateCcw, Trash, GripVertical, 
  Pin, Star, Folder, ChevronDown, ChevronUp, FolderPlus, 
  LayoutGrid, Search, Menu, ChevronLeft, Edit3
} from 'lucide-react';
import { useStore } from '../hooks/useStore';
import MemoModal from '../components/MemoModal';
import type { Memo } from '../types';

const MEMO_COLORS = [
  '#fef9c3', // Yellow
  '#fee2e2', // Red/Pink
  '#dcfce7', // Green
  '#dbeafe', // Blue
  '#f3e8ff', // Purple
  '#ffedd5', // Orange
];

interface MemoCardProps {
  memo: Memo;
  idx: number;
  draggedIndex: number | null;
  onDragStart: (idx: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (idx: number) => void;
  onOpen: (memo: Memo) => void;
  onRemove: (id: string) => void;
}

function MemoCard({ memo, idx, draggedIndex, onDragStart, onDragOver, onDrop, onOpen, onRemove }: MemoCardProps) {
  return (
    <div
      draggable={true}
      onDragStart={() => onDragStart(idx)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(idx)}
      className={`group relative p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 animate-scale-in ${draggedIndex === idx ? 'opacity-30 scale-95' : ''} cursor-move overflow-hidden`}
      style={{
        backgroundColor: memo.color,
        minHeight: '200px',
        transform: `rotate(${(idx % 3 - 1) * 0.8}deg)`,
        color: '#1e293b'
      }}
    >
      <div className="absolute inset-0 pointer-events-none rounded-2xl" 
           style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 60%)' }} />
      
      <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical size={14} />
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); if (window.confirm('메모를 휴지통으로 이동하시겠습니까?')) onRemove(memo.id); }}
        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/10 text-black/40 hover:text-red-500 transition-all z-10"
      >
        <Trash2 size={14} />
      </button>

      <div 
        onClick={() => onOpen(memo)}
        className="relative h-full flex flex-col pt-2 cursor-pointer"
      >
        {memo.title && (
          <h3 className="text-sm font-bold mb-2 line-clamp-1">{memo.title}</h3>
        )}
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap break-words line-clamp-6 flex-1">
          {memo.content}
        </p>
        
        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
          <span className="opacity-30">{new Date(memo.createdAt).toLocaleDateString('ko-KR')}</span>
          <div className="flex items-center gap-1.5">
            {memo.isPinned && (
              <Pin size={12} fill="currentColor" className="text-accent" />
            )}
            {memo.isFavorite && (
              <div className="relative">
                <Star size={14} fill="#f59e0b" className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              </div>
            )}
          </div>
        </div>

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-black/5 px-3 py-1.5 rounded-full text-[10px] font-bold backdrop-blur-sm">Click to expand</div>
        </div>
      </div>
    </div>
  );
}

export default function MemoPage() {
  const { 
    data, addMemo, removeMemo, editMemo, restoreMemo, 
    permanentlyDeleteMemo, emptyTrash, reorderMemos,
    addMemoFolder, removeMemoFolder, editMemoFolder
  } = useStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMO_COLORS[0]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isRenamingFolderId, setIsRenamingFolderId] = useState<string | null>(null);
  const [editFolderName, setEditFolderName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit State
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null);

  const activeMemos = data.memos || [];
  const trashMemos = data.trash || [];
  const folders = data.memoFolders || [];

  // Filter Logic
  const filteredMemos = useMemo(() => {
    let result = [...activeMemos];
    
    if (selectedFolderId === 'important') {
      result = result.filter(m => m.isPinned || m.isFavorite);
    } else if (selectedFolderId === 'trash') {
      result = [...trashMemos];
    } else if (selectedFolderId !== 'all') {
      result = result.filter(m => m.folderId === selectedFolderId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.content.toLowerCase().includes(q) || 
        (m.title && m.title.toLowerCase().includes(q))
      );
    }

    return result;
  }, [activeMemos, trashMemos, selectedFolderId, searchQuery]);

  const pinnedMemos = filteredMemos.filter(m => m.isPinned && selectedFolderId !== 'trash');
  const otherMemos = filteredMemos.filter(m => !m.isPinned || selectedFolderId === 'trash');

  const handleAdd = () => {
    if (!newContent.trim()) return;
    const folderId = (selectedFolderId !== 'all' && selectedFolderId !== 'important' && selectedFolderId !== 'trash') 
      ? selectedFolderId 
      : 'folder_default';
    addMemo(newContent.trim(), selectedColor, '', folderId);
    setNewContent('');
    setIsAdding(false);
  };

  const handleAddFolder = () => {
    if (!newFolderName.trim()) return;
    addMemoFolder(newFolderName.trim(), MEMO_COLORS[Math.floor(Math.random() * MEMO_COLORS.length)]);
    setNewFolderName('');
    setIsAddingFolder(false);
  };

  const handleRenameFolder = (id: string) => {
    if (!editFolderName.trim()) return;
    const folder = folders.find(f => f.id === id);
    if (folder) {
      editMemoFolder(id, editFolderName.trim(), folder.color);
    }
    setIsRenamingFolderId(null);
  };

  const handleOpenModal = (memo: Memo) => {
    setSelectedMemo(memo);
  };

  const handleSaveModal = (content: string, title: string, updates?: Partial<Memo>) => {
    if (selectedMemo) {
      editMemo(selectedMemo.id, content, title, updates);
      if (updates) {
        setSelectedMemo({ ...selectedMemo, ...updates, content, title });
      }
    }
  };

  // Drag and Drop Logic
  const onDragStart = (idx: number) => {
    if (selectedFolderId === 'trash' || searchQuery) return;
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

  const getFolderMemoCount = (folderId: string) => {
    return activeMemos.filter(m => m.folderId === folderId).length;
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-bg-primary rounded-3xl overflow-hidden shadow-2xl border border-border animate-fade-in transition-all duration-300">
      {/* Sidebar */}
      <aside className={`bg-bg-secondary/50 backdrop-blur-xl border-r border-border flex flex-col p-4 space-y-6 overflow-y-auto transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        {/* Toggle Button */}
        <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] animate-fade-in">Menu</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2.5 rounded-xl hover:bg-bg-card text-text-secondary hover:text-accent transition-all duration-300 shadow-sm active:scale-95"
          >
            {isSidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <div className="space-y-1.5">
          <button 
            onClick={() => setSelectedFolderId('all')}
            className={`w-full flex items-center px-3 py-3 rounded-2xl font-bold transition-all ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedFolderId === 'all' ? 'bg-accent/10 text-accent shadow-sm' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'}`}
            title="전체 메모"
          >
            <div className="flex items-center gap-3">
              <LayoutGrid size={20} className={isSidebarCollapsed ? 'text-accent' : ''} />
              {!isSidebarCollapsed && <span className="animate-fade-in">전체</span>}
            </div>
            {!isSidebarCollapsed && <span className="text-xs opacity-60 animate-fade-in">{activeMemos.length}</span>}
          </button>

          <button 
            onClick={() => setSelectedFolderId('important')}
            className={`w-full flex items-center px-3 py-3 rounded-2xl font-bold transition-all ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedFolderId === 'important' ? 'bg-amber-500/10 text-amber-500 shadow-sm' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'}`}
            title="중요 메모"
          >
            <div className="flex items-center gap-3">
              <Star size={20} className={isSidebarCollapsed ? 'text-amber-500' : ''} />
              {!isSidebarCollapsed && <span className="animate-fade-in">중요</span>}
            </div>
            {!isSidebarCollapsed && <span className="text-xs opacity-60 animate-fade-in">{activeMemos.filter(m => m.isPinned || m.isFavorite).length}</span>}
          </button>
        </div>

        <div className="space-y-4">
          <div className={`flex items-center px-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
            <button 
              onClick={() => {
                if (isSidebarCollapsed) setIsSidebarCollapsed(false);
                setIsFoldersOpen(!isFoldersOpen);
              }}
              className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
            >
              <Folder size={16} className="text-accent" />
              {!isSidebarCollapsed && (
                <>
                  <span className="animate-fade-in">폴더</span>
                  {isFoldersOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </>
              )}
            </button>
            {!isSidebarCollapsed && (
              <button 
                onClick={() => setIsAddingFolder(true)}
                className="p-1 hover:bg-accent/10 rounded-lg text-accent transition-colors animate-fade-in"
              >
                <FolderPlus size={16} />
              </button>
            )}
          </div>

          {isFoldersOpen && !isSidebarCollapsed && (
            <div className="space-y-1 animate-slide-down">
              {isAddingFolder && (
                <div className="px-2 py-2">
                  <input
                    autoFocus
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddFolder()}
                    onBlur={() => !newFolderName && setIsAddingFolder(false)}
                    placeholder="폴더 이름..."
                    className="w-full bg-bg-card border border-accent/30 rounded-xl px-3 py-2 text-sm outline-none shadow-sm"
                  />
                </div>
              )}
              {folders
                .sort((a, b) => (a.id === 'folder_default' ? -1 : b.id === 'folder_default' ? 1 : 0))
                .map(folder => (
                <div key={folder.id} className="group relative px-1">
                  {isRenamingFolderId === folder.id ? (
                    <div className="px-2 py-1.5">
                      <input
                        autoFocus
                        value={editFolderName}
                        onChange={e => setEditFolderName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameFolder(folder.id);
                          else if (e.key === 'Escape') setIsRenamingFolderId(null);
                        }}
                        onBlur={() => handleRenameFolder(folder.id)}
                        className="w-full bg-bg-card border border-accent/30 rounded-xl px-3 py-2 text-sm outline-none shadow-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => setSelectedFolderId(folder.id)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl font-bold transition-all ${selectedFolderId === folder.id ? 'bg-bg-card text-text-primary shadow-sm' : 'text-text-secondary hover:bg-bg-card/50 hover:text-text-primary'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
                          <span className="truncate max-w-[120px]">{folder.name}</span>
                        </div>
                        <span className="text-[10px] opacity-40">{getFolderMemoCount(folder.id)}</span>
                      </button>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setIsRenamingFolderId(folder.id); 
                            setEditFolderName(folder.name); 
                          }}
                          className="p-1 hover:bg-accent/10 rounded-lg text-accent transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        {folder.id !== 'folder_default' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); if (window.confirm('폴더를 삭제하시겠습니까? 폴더 내 메모는 기본 폴더로 이동됩니다.')) removeMemoFolder(folder.id); }}
                            className="p-1 hover:bg-red-500/10 rounded-lg text-red-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 mt-auto border-t border-border/50">
          <button 
            onClick={() => setSelectedFolderId('trash')}
            className={`w-full flex items-center px-3 py-3 rounded-2xl font-bold transition-all ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} ${selectedFolderId === 'trash' ? 'bg-red-500/10 text-red-500 shadow-sm' : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'}`}
            title="삭제된 메모"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} className={isSidebarCollapsed ? 'text-red-500' : ''} />
              {!isSidebarCollapsed && <span className="animate-fade-in">휴지통</span>}
            </div>
            {!isSidebarCollapsed && <span className="text-xs opacity-60 animate-fade-in">{trashMemos.length}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-bg-card/30 overflow-hidden">
        {/* Header Section */}
        <header className="px-8 py-6 border-b border-border flex items-center justify-between gap-6 bg-bg-card/20 backdrop-blur-sm">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                placeholder="메모 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-bg-primary/50 border border-border rounded-2xl pl-12 pr-4 py-2.5 text-sm focus:border-accent focus:ring-4 focus:ring-accent/10 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {selectedFolderId === 'trash' ? (
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
        </header>

        {/* Memos Grid */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {/* Section Titles */}
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-black text-text-primary tracking-tight">
              {selectedFolderId === 'all' ? '전체 메모' : 
               selectedFolderId === 'important' ? '중요 메모' :
               selectedFolderId === 'trash' ? '휴지통' : 
               folders.find(f => f.id === selectedFolderId)?.name || '폴더'}
            </h1>
            <span className="px-2 py-0.5 rounded-lg bg-accent/10 text-accent text-xs font-black">
              {filteredMemos.length}
            </span>
          </div>

          {/* Pinned Memos */}
          {pinnedMemos.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-accent">
                <Pin size={18} fill="currentColor" />
                <h2 className="text-sm font-bold uppercase tracking-wider">고정됨</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pinnedMemos.map((memo) => {
                  const globalIdx = activeMemos.findIndex(m => m.id === memo.id);
                  return (
                    <MemoCard 
                      key={memo.id} 
                      memo={memo} 
                      idx={globalIdx} 
                      draggedIndex={draggedIndex}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      onOpen={handleOpenModal}
                      onRemove={removeMemo}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Regular Memos / Trash */}
          <div className="space-y-6">
            {pinnedMemos.length > 0 && (
              <div className="flex items-center gap-2 text-text-muted">
                <StickyNote size={18} />
                <h2 className="text-sm font-bold uppercase tracking-wider">메모</h2>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {/* Add Form Card */}
              {isAdding && selectedFolderId !== 'trash' && (
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
                    onBlur={handleAdd}
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
                  </div>
                </div>
              )}

              {selectedFolderId === 'trash' ? (
                otherMemos.map((memo, idx) => (
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
                ))
              ) : (
                otherMemos.map((memo) => {
                  const globalIdx = activeMemos.findIndex(m => m.id === memo.id);
                  return (
                    <MemoCard 
                      key={memo.id} 
                      memo={memo} 
                      idx={globalIdx} 
                      draggedIndex={draggedIndex}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      onOpen={handleOpenModal}
                      onRemove={removeMemo}
                    />
                  );
                })
              )}

              {filteredMemos.length === 0 && !isAdding && (
                <div className="col-span-full py-20 flex flex-col items-center justify-center text-text-muted opacity-50">
                  <LayoutGrid size={48} className="mb-4" strokeWidth={1} />
                  <p className="text-sm font-medium">표시할 메모가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Memo Modal */}
      {selectedMemo && (
        <MemoModal
          memo={selectedMemo}
          onClose={() => setSelectedMemo(null)}
          onSave={handleSaveModal}
          onDelete={removeMemo}
        />
      )}
    </div>
  );
}
