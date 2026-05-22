import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2, Link as LinkIcon, Check, Palette } from 'lucide-react';
import type { Article, Reference } from '../types';
import { useStore } from '../hooks/useStore';

const CARD_COLORS = [
  '',          // 기본 (카테고리 색상 적용)
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
];

function getTextColor(hex: string): 'white' | 'dark' {
  const m = hex.replace('#', '').match(/.{2}/g);
  if (!m) return 'white';
  const [r, g, b] = m.map(v => parseInt(v, 16));
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55 ? 'dark' : 'white';
}

function htmlToMarkdown(htmlStr: string): string {
  const parser = new DOMParser();
  let cleanHtml = htmlStr;
  if (cleanHtml.includes('<!--StartFragment-->')) {
    const start = cleanHtml.indexOf('<!--StartFragment-->') + 20;
    const end = cleanHtml.lastIndexOf('<!--EndFragment-->');
    if (start !== -1 && end !== -1) {
      cleanHtml = cleanHtml.substring(start, end);
    }
  }

  const doc = parser.parseFromString(cleanHtml, 'text/html');
  
  function traverse(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      const parent = node.parentElement;
      if (parent) {
        const hasBlockSibling = Array.from(parent.children).some(child =>
          /^(p|div|h[1-6]|ul|ol|li|blockquote|pre|hr|table|section|article)$/i.test(child.tagName)
        );
        if (hasBlockSibling && text.trim() === '') {
          return '';
        }
      }
      return text;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    
    let childrenMarkdown = '';
    element.childNodes.forEach(child => {
      childrenMarkdown += traverse(child);
    });

    const wrapInline = (mdTag: string, contentStr: string) => {
      if (!contentStr) return '';
      const leadingSpace = contentStr.match(/^\s*/)?.[0] || '';
      const trailingSpace = contentStr.match(/\s*$/)?.[0] || '';
      const trimmed = contentStr.trim();
      if (!trimmed) return contentStr;
      return `${leadingSpace}${mdTag}${trimmed}${mdTag}${trailingSpace}`;
    };

    switch (tagName) {
      case 'h1':
        return `\n\n# ${childrenMarkdown.trim()}\n\n`;
      case 'h2':
        return `\n\n## ${childrenMarkdown.trim()}\n\n`;
      case 'h3':
        return `\n\n### ${childrenMarkdown.trim()}\n\n`;
      case 'h4':
        return `\n\n#### ${childrenMarkdown.trim()}\n\n`;
      case 'h5':
        return `\n\n##### ${childrenMarkdown.trim()}\n\n`;
      case 'h6':
        return `\n\n###### ${childrenMarkdown.trim()}\n\n`;

      case 'p':
      case 'div': {
        const trimmed = childrenMarkdown.trim();
        if (!trimmed) {
          if (element.querySelector('br')) {
            return '\n';
          }
          return '';
        }
        return `${trimmed}\n`;
      }
      case 'br':
        return '\n';

      case 'strong':
      case 'b':
        return wrapInline('**', childrenMarkdown);
      case 'em':
      case 'i':
        return wrapInline('*', childrenMarkdown);
      case 'u':
        return wrapInline('++', childrenMarkdown);
      case 'mark':
        return wrapInline('==', childrenMarkdown);

      case 'span': {
        const style = element.getAttribute('style') || '';
        let result = childrenMarkdown;
        
        if (style.includes('font-weight:700') || style.includes('font-weight: 700') || style.includes('font-weight:bold') || style.includes('font-weight: bold')) {
          result = wrapInline('**', result);
        }
        if (style.includes('font-style:italic') || style.includes('font-style: italic')) {
          result = wrapInline('*', result);
        }
        if (style.includes('text-decoration:underline') || style.includes('text-decoration: underline')) {
          result = wrapInline('++', result);
        }
        if (style.includes('text-decoration:line-through') || style.includes('text-decoration: line-through')) {
          result = wrapInline('~~', result);
        }
        const colorMatch = style.match(/color:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/);
        if (colorMatch && !style.includes('color:#000000') && !style.includes('color: #000000') && !style.includes('color:rgb(0,0,0)') && !style.includes('color: rgb(0, 0, 0)')) {
          const color = colorMatch[1];
          const leadingSpace = result.match(/^\s*/)?.[0] || '';
          const trailingSpace = result.match(/\s*$/)?.[0] || '';
          const trimmed = result.trim();
          if (trimmed) {
            result = `${leadingSpace}@@${color}:${trimmed}@@${trailingSpace}`;
          }
        }
        const bgMatch = style.match(/background-color:\s*(#[0-9a-fA-F]{3,8}|[a-zA-Z]+)/);
        if (bgMatch && !style.includes('background-color:transparent') && !style.includes('background-color: transparent') && !style.includes('background-color:#ffffff') && !style.includes('background-color: #ffffff') && !style.includes('background-color:rgb(255,255,255)') && !style.includes('background-color: rgb(255, 255, 255)')) {
          result = wrapInline('==', result);
        }
        
        return result;
      }

      case 'a': {
        const href = element.getAttribute('href');
        if (href) {
          return `[${childrenMarkdown || href}](${href})`;
        }
        return childrenMarkdown;
      }

      case 'ul':
        return `\n${childrenMarkdown}\n`;
      case 'ol':
        return `\n${childrenMarkdown}\n`;
      case 'li': {
        const parentElement = element.parentElement;
        const parentTag = parentElement?.tagName.toLowerCase();
        if (parentElement && parentTag === 'ol') {
          const siblings = Array.from(parentElement.children);
          const index = siblings.indexOf(element) + 1;
          return `${index}. ${childrenMarkdown.trim()}\n`;
        }
        return `- ${childrenMarkdown.trim()}\n`;
      }

      case 'hr':
        return '\n\n---\n\n';

      case 'blockquote':
        return `\n\n> ${childrenMarkdown.trim().replace(/\n/g, '\n> ')}\n\n`;

      case 'img': {
        const src = element.getAttribute('src');
        const alt = element.getAttribute('alt') || '이미지';
        if (src) {
          return `![${alt}](${src})`;
        }
        return '';
      }

      case 'pre':
      case 'code':
        return `\n\`\`\`\n${element.textContent || ''}\n\`\`\`\n`;

      default:
        return childrenMarkdown;
    }
  }

  let markdown = traverse(doc.body);
  markdown = markdown
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return markdown;
}

interface ArticleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId?: string;
  initial?: Article;
}

export default function ArticleEditor({ isOpen, onClose, categoryId, initial }: ArticleEditorProps) {
  const { addArticle, editArticle, data } = useStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [references, setReferences] = useState<Reference[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [color, setColor] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const nativeColorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (initial) {
      setTitle(initial.title);
      setContent(initial.content);
      setTags(initial.tags.join(', '));
      setReferences([...initial.references]);
      setIsPinned(initial.isPinned);
      setColor(initial.color || '');
      setSelectedCategoryId(initial.categoryId);
    } else {
      setTitle('');
      setContent('');
      setTags('');
      setReferences([]);
      setIsPinned(false);
      setColor('');
      setSelectedCategoryId(categoryId || data.categories[0]?.id || '');
    }
  }, [initial, isOpen, categoryId, data.categories]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!title.trim() || !selectedCategoryId) return;
    const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    const articleData = {
      categoryId: selectedCategoryId,
      title: title.trim(),
      content,
      references,
      tags: parsedTags,
      isPinned,
      color: color || undefined,
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

  return createPortal(
    <div className="fixed inset-0 z-[5000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-5xl h-[85vh] max-h-[800px] rounded-3xl bg-bg-card border border-border shadow-2xl animate-scale-in flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-text-primary">
            {initial ? '아티클 수정' : '새 아티클 작성'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-bg-hover transition-colors text-text-muted">
            <X size={16} />
          </button>
        </div>

        {/* Content Area (Flexbox for Sidebar) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Form Fields */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Category & Title Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {!categoryId ? (
                <>
                  <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">카테고리</label>
                    <div className="relative">
                      <select
                        value={selectedCategoryId}
                        onChange={e => setSelectedCategoryId(e.target.value)}
                        className="w-full bg-bg-secondary border border-border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-text-primary outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                      >
                        {data.categories.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.icon} {c.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted text-[10px]">
                        ▼
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">제목</label>
                    <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="아티클 제목..."
                      className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-base font-semibold text-text-primary outline-none focus:border-accent transition-colors"
                      autoFocus
                    />
                  </div>
                </>
              ) : (
                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">제목</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="아티클 제목..."
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-base font-semibold text-text-primary outline-none focus:border-accent transition-colors"
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* Article Background Color & Live Preview */}
            {(() => {
              const category = data.categories.find(c => c.id === selectedCategoryId);
              const currentBannerColor = color || category?.color || '#6366f1';
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Color Picker Swatches */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      아티클 배경 색상 (배너 색상)
                    </label>
                    
                    <div className="flex flex-wrap gap-1.5 items-center bg-bg-secondary border border-border rounded-xl p-2.5 min-h-[76px]">
                      {/* Reset Swatch (No color / Category color) */}
                      <button
                        type="button"
                        onClick={() => setColor('')}
                        className="w-7 h-7 rounded-lg border border-dashed border-border flex items-center justify-center text-text-muted text-xs hover:border-accent hover:text-accent transition-all relative group"
                        title="기본 (카테고리 컬러 적용)"
                      >
                        {color === '' ? <Check size={12} className="text-accent" /> : '✕'}
                      </button>

                      {/* Color Swatches */}
                      {CARD_COLORS.filter(Boolean).map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-7 h-7 rounded-lg transition-all hover:scale-110 flex items-center justify-center relative shadow-sm"
                          style={{
                            backgroundColor: c,
                            boxShadow: color === c ? `0 0 8px ${c}88` : undefined,
                            border: color === c ? '2px solid var(--color-bg-card)' : '1px solid rgba(0,0,0,0.1)',
                          }}
                        >
                          {color === c && <Check size={11} className="text-white drop-shadow" />}
                        </button>
                      ))}

                      {/* Custom native color picker trigger */}
                      <button
                        type="button"
                        onClick={() => nativeColorRef.current?.click()}
                        className="w-7 h-7 rounded-lg border border-dashed border-border flex items-center justify-center hover:border-accent transition-all hover:scale-110 shadow-sm bg-bg-card text-text-muted hover:text-text-primary"
                        title="직접 색상 지정"
                      >
                        <Palette size={12} />
                      </button>
                      <input
                        ref={nativeColorRef}
                        type="color"
                        value={color && color.startsWith('#') ? color : '#6366f1'}
                        onChange={e => setColor(e.target.value)}
                        className="sr-only"
                      />
                    </div>
                  </div>

                  {/* Live Content Card Preview */}
                  <div>
                    <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1.5">
                      본문 내용 영역 배경 프리뷰
                    </label>
                    
                    {(() => {
                      const isContentBgLight = currentBannerColor.startsWith('#') ? getTextColor(currentBannerColor) === 'dark' : false;
                      const previewTextColor = currentBannerColor.startsWith('#')
                        ? (isContentBgLight ? '#111827' : '#ffffff')
                        : 'var(--color-text-primary)';
                      const previewMutedColor = currentBannerColor.startsWith('#')
                        ? (isContentBgLight ? 'rgba(17, 24, 39, 0.6)' : 'rgba(255, 255, 255, 0.7)')
                        : 'var(--color-text-muted)';
                      const previewBorderColor = currentBannerColor.startsWith('#')
                        ? (isContentBgLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)')
                        : 'var(--color-border)';

                      return (
                        <div 
                          className="rounded-xl overflow-hidden transition-all duration-300 relative select-none border p-3 flex flex-col justify-between"
                          style={{
                            background: currentBannerColor.startsWith('#') ? currentBannerColor : 'var(--color-bg-elevated)',
                            borderColor: previewBorderColor,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                            height: '76px',
                          }}
                        >
                          <div className="relative">
                            <h3 
                              className="text-xs font-black leading-tight tracking-tight line-clamp-1"
                              style={{ color: previewTextColor }}
                            >
                              {title.trim() || '아티클 제목 미리보기'}
                            </h3>
                            <span 
                              className="text-[8px] block mt-0.5"
                              style={{ color: previewMutedColor }}
                            >
                              마크다운 본문 배경 매칭 프리뷰
                            </span>
                          </div>

                          {/* Placeholder Text Block */}
                          <div className="space-y-1 mt-1">
                            <div className="h-1 w-full rounded-full opacity-40" style={{ backgroundColor: previewTextColor }}></div>
                            <div className="h-1 w-4/5 rounded-full opacity-40" style={{ backgroundColor: previewTextColor }}></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* Content */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-text-muted uppercase tracking-wider">내용 (Markdown 지원)</label>
                <span className="text-[9px] text-text-muted">문서나 웹사이트를 복사하면 마크다운 포맷으로 자동 정제되어 붙여넣어집니다.</span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onPaste={(e) => {
                  const htmlData = e.clipboardData.getData('text/html');
                  const textData = e.clipboardData.getData('text/plain');
                  
                  if (htmlData && htmlData.trim() !== '') {
                    // 글자 서식이나 문단 등 구조화된 HTML 태그가 있는지 검출
                    const hasFormatting = /<(p|div|span|b|strong|i|em|u|mark|h[1-6]|ul|ol|li|a|hr|blockquote|img|pre|code)\b/i.test(htmlData);
                    
                    if (hasFormatting) {
                      e.preventDefault();
                      const convertedMarkdown = htmlToMarkdown(htmlData);
                      
                      if (convertedMarkdown) {
                        const success = document.execCommand('insertText', false, convertedMarkdown);
                        if (success) return;
                        
                        // Fallback
                        const target = e.target as HTMLTextAreaElement;
                        const startPos = target.selectionStart;
                        const endPos = target.selectionEnd;
                        const newContent = content.substring(0, startPos) + convertedMarkdown + content.substring(endPos);
                        setContent(newContent);
                        setTimeout(() => {
                          target.selectionStart = target.selectionEnd = startPos + convertedMarkdown.length;
                        }, 0);
                        return;
                      }
                    }
                  }

                  if (textData) {
                    e.preventDefault();
                    const success = document.execCommand('insertText', false, textData);
                    
                    if (!success) {
                      const target = e.target as HTMLTextAreaElement;
                      const startPos = target.selectionStart;
                      const endPos = target.selectionEnd;
                      const newContent = content.substring(0, startPos) + textData + content.substring(endPos);
                      setContent(newContent);
                      setTimeout(() => {
                        target.selectionStart = target.selectionEnd = startPos + textData.length;
                      }, 0);
                    }
                  }
                }}
                placeholder="Markdown 형식으로 작성하세요..."
                rows={8}
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
          <div className="hidden md:block w-72 border-l border-border bg-bg-secondary/30 overflow-y-auto p-5 scrollbar-hide">
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
        <div className="flex justify-end gap-3 p-5 border-t border-border flex-shrink-0">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-muted hover:text-text-primary hover:bg-bg-hover transition-all">
            취소
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all shadow-lg shadow-accent/20">
            {initial ? '수정 완료' : '저장'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
