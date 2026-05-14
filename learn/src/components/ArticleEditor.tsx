import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import type { Article, Reference } from '../types';
import { useStore } from '../hooks/useStore';

interface ArticleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  initial?: Article;
}

export default function ArticleEditor({ isOpen, onClose, categoryId, initial }: ArticleEditorProps) {
  const { addArticle, editArticle } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setContent(initial.content);
      setTags(initial.tags.join(', '));
      setReferences([...initial.references]);
      setIsPinned(initial.isPinned);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setReferences([]);
      setIsPinned(false);
    }
  }, [initial, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim()) return;
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const articleData = {
      categoryId,
      title: title.trim(),
      content,
      references,
      tags: parsedTags,
      isPinned,
    };

    if (initial) {
      editArticle(initial.id, articleData);
    } else {
      addArticle(articleData);
    }
    onClose();
  };

  const addReference = () => {
    setReferences([...references, { title: '', url: '' }]);
  };

  const updateReference = (idx: number, field: keyof Reference, value: string) => {
    const updated = [...references];
    updated[idx] = { ...updated[idx], [field]: value };
    setReferences(updated);
  };

  const removeReference = (idx: number) => {
    setReferences(references.filter((_, i) => i !== idx));
  };

  return (
    <div className="fixed inset-0 z-[5000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl mx-4 max-h-[90vh] rounded-3xl bg-bg-card border border-border shadow-2xl animate-scale-in flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary">
            {initial ? '아티클 수정' : '새 아티클 작성'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-bg-hover transition-colors text-text-muted">
            <X size={18} />
          </button>
        </div>

        {/* Content Area (Flexbox for Sidebar) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Form Fields */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="아티클 제목..."
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-base font-semibold text-text-primary outline-none focus:border-accent transition-colors"
                autoFocus
              />
            </div>

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">내용 (Markdown 지원)</label>
                <span className="text-[10px] text-text-muted">웹사이트 복사 시 HTML 태그 원문이 유지됩니다.</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={(e) => {
                  const htmlData = e.clipboardData.getData('text/html');
                  if (htmlData) {
                    e.preventDefault();
                    let htmlToPaste = htmlData;
                    if (htmlToPaste.includes('<!--StartFragment-->')) {
                      const start = htmlToPaste.indexOf('<!--StartFragment-->') + 20;
                      const end = htmlToPaste.lastIndexOf('<!--EndFragment-->');
                      if (start !== -1 && end !== -1) {
                        htmlToPaste = htmlToPaste.substring(start, end);
                      }
                    }
                    // 브라우저의 Undo(Ctrl+Z) 기록을 보존하기 위해 execCommand 사용
                    const success = document.execCommand('insertText', false, htmlToPaste);
                    
                    if (!success) {
                      // Fallback: execCommand가 실패할 경우 기존 방식으로 직접 상태 변경 (단, Undo는 깨짐)
                      const target = e.target as HTMLTextAreaElement;
                      const startPos = target.selectionStart;
                      const endPos = target.selectionEnd;
                      const newContent = content.substring(0, startPos) + htmlToPaste + content.substring(endPos);
                      setContent(newContent);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = startPos + htmlToPaste.length;
                      }, 0);
                    }
                  }
                }}
                placeholder="Markdown 형식으로 작성하세요..."
                rows={14}
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors resize-none font-mono leading-relaxed"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">태그 (쉼표로 구분)</label>
              <input
                type="text"
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="react, hooks, state..."
                className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* References */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">참고 사이트</label>
                <button onClick={addReference} className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover transition-colors">
                  <Plus size={12} /> 추가
                </button>
              </div>
              <div className="space-y-2">
                {references.map((ref, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <LinkIcon size={14} className="text-text-muted flex-shrink-0" />
                    <input
                      type="text"
                      value={ref.title}
                      onChange={e => updateReference(idx, 'title', e.target.value)}
                      placeholder="사이트명"
                      className="flex-1 bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent transition-colors"
                    />
                    <input
                      type="url"
                      value={ref.url}
                      onChange={e => updateReference(idx, 'url', e.target.value)}
                      placeholder="https://..."
                      className="flex-[2] bg-bg-secondary border border-border rounded-lg px-3 py-2 text-xs text-text-primary outline-none focus:border-accent transition-colors"
                    />
                    <button onClick={() => removeReference(idx)} className="p-1.5 rounded-lg hover:bg-accent-rose/10 text-text-muted hover:text-accent-rose transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pin */}
            <label className="flex items-center gap-3 cursor-pointer pb-4">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={e => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded accent-accent"
              />
              <span className="text-sm text-text-secondary">상단 고정</span>
            </label>
          </div>

          {/* Right: Help Sidebar */}
          <div className="hidden md:block w-72 border-l border-border bg-bg-secondary/30 overflow-y-auto p-6 scrollbar-hide">
            <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-accent rounded-full" />
              태그 도움말
            </h3>
            
            <div className="space-y-6">
              <section>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Typography & Effects</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded"># 제목1</code> <span className="text-text-muted">H1</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">**굵게**</code> <span className="text-text-muted">Bold</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">==강조==</code> <span className="text-text-muted">Highlight</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">++밑줄++</code> <span className="text-text-muted">Underline</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">---</code> <span className="text-text-muted">Solid</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">---.</code> <span className="text-text-muted">Dashed</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">---*</code> <span className="text-text-muted">Dotted</span></li>
                </ul>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Lists & Tasks</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">- 항목</code> <span className="text-text-muted">목록</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">- [ ]</code> <span className="text-text-muted">할 일</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">- [x]</code> <span className="text-text-muted">완료</span></li>
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">&gt; 인용</code> <span className="text-text-muted">인용구</span></li>
                </ul>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Custom Color</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex flex-col gap-1">
                    <div className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">@@색상:텍스트@@</code></div>
                    <code className="text-[10px] text-text-muted">@@red:빨강@@</code>
                    <code className="text-[10px] text-text-muted">@@#00ff00:그린@@</code>
                  </li>
                </ul>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-3">Links & Media</h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex justify-between items-center"><code className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">[명칭](URL)</code> <span className="text-text-muted">링크</span></li>
                  <li className="mt-1 p-2 rounded-lg bg-accent/5 border border-accent/10">
                    <p className="text-[10px] text-accent leading-relaxed">URL 단독 입력 시 <strong>카드 미리보기</strong> 자동 생성</p>
                  </li>
                </ul>
              </section>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
            취소
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-lg shadow-accent/20">
            {initial ? '수정 완료' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
