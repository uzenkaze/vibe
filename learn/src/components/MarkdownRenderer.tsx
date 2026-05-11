import { useEffect, useRef, useMemo, useState, useCallback } from 'react';

/**
 * Minimal Markdown → HTML renderer (no external libraries)
 * Supports: headings, bold, italic, code, codeblocks, links, lists, blockquotes, hr, images
 */

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * <iframe> 태그를 반응형 16:9 래퍼로 변환
 * - width/height HTML 속성 제거
 * - position:absolute + 100% 크기로 재설정
 * - padding-bottom: 56.25% 컨테이너로 래핑
 */
function makeIframeResponsive(line: string): string {
  // width/height 속성 제거 (큰따옴표/작은따옴표 모두)
  let iframe = line
    .replace(/\s*width=["'][^"']*["']/gi, '')
    .replace(/\s*height=["'][^"']*["']/gi, '');

  // 기존 style 속성 제거 후 새 스타일 삽입
  iframe = iframe.replace(/<iframe(\s)/i,
    '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:block;"$1'
  );
  // style이 없어서 self-closing이 아닌 경우 처리
  if (!iframe.match(/style=/i)) {
    iframe = iframe.replace(/<iframe/i,
      '<iframe style="position:absolute;top:0;left:0;width:100%;height:100%;border:none;display:block;"'
    );
  }

  return [
    '<div style="position:relative;width:100%;padding-bottom:56.25%;height:0;',
    'overflow:hidden;border-radius:14px;',
    'box-shadow:0 2px 12px rgba(0,0,0,0.15);margin:12px 0;">',
    iframe,
    '</div>',
  ].join('');
}

function parseInline(text: string): string {
  let result = text; // 원본 HTML 태그 유지

  // task lists (목록 항목 시작부분)
  result = result.replace(/^\[ \]\s+/, '<input type="checkbox" disabled /> ');
  result = result.replace(/^\[x\]\s+/i, '<input type="checkbox" checked disabled /> ');

  // images ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  // links [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  // highlight ==text==
  result = result.replace(/==(.+?)==/g, '<mark>$1</mark>');
  // underline ++text++
  result = result.replace(/\+\+(.+?)\+\+/g, '<u>$1</u>');
  // bold **text** or __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');
  // italic *text* or _text_
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>');
  result = result.replace(/_(.+?)_/g, '<em>$1</em>');
  // color shortcuts @@color:text@@ (예: @@red:안녕@@, @@#ff0000:안녕@@)
  result = result.replace(/@@([^:]+):(.+?)@@/g, '<span style="color: $1">$2</span>');
  // inline code `text` - 인라인 코드 안의 HTML은 화면에 문자로 보여야 하므로 escape 처리
  result = result.replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);
  return result;
}

// 전역 캐시를 사용하여 중복 API 호출 방지
const ogCache: Record<string, any> = {};

function getPreviewHtml(url: string) {
  const data = ogCache[url];
  if (!data) {
    return `<div class="og-link-preview my-4" data-url="${escapeHtml(url)}"><a href="${escapeHtml(url)}" target="_blank" class="text-accent hover:underline break-all">${escapeHtml(url)}</a></div>`;
  }
  
  const { title, description, image, publisher, logo } = data;
  const hostname = new URL(url).hostname;
  return `
    <div class="og-link-preview processed my-4" data-url="${escapeHtml(url)}">
      <a href="${url}" target="_blank" rel="noopener noreferrer" class="block w-full max-w-md rounded-2xl border border-border bg-card-bg overflow-hidden hover:border-border-light hover:shadow-xl transition-all no-underline group my-2">
        ${image?.url ? `<div class="w-full h-48 bg-bg-secondary overflow-hidden flex items-center justify-center border-b border-border"><img src="${image.url}" alt="Preview" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onerror="this.style.display='none'" /></div>` : ''}
        <div class="p-4 bg-card-bg">
          <h4 class="text-sm font-bold text-card-text-primary line-clamp-2 mb-1 group-hover:text-accent transition-colors">${title || url}</h4>
          ${description ? `<p class="text-xs text-card-text-muted line-clamp-2 mb-3">${description}</p>` : ''}
          <div class="flex items-center gap-2 mt-2">
            ${logo?.url ? `<img src="${logo.url}" class="w-4 h-4 rounded" onerror="this.style.display='none'" />` : ''}
            <span class="text-[10px] text-card-text-muted font-semibold">${publisher || hostname}</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

export function renderMarkdown(markdown: string): string {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let inCodeBlock = false;
  let codeContent: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' = 'ul';

  function closeList() {
    if (inList) {
      html.push(`</${listType}>`);
      inList = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block
    if (line.trimStart().startsWith('```')) {
      if (inCodeBlock) {
        // ── 코드 블록 닫힘 ──
        const raw = codeContent.slice(1);           // __LANG__ 마커 제외
        const lang = (codeContent[0] || '').replace('__LANG__', '') || 'code';
        const blockId = `cb_${Math.random().toString(36).slice(2, 8)}`;
        html.push(
          `<pre data-lang="${escapeHtml(lang)}" data-id="${blockId}"><code>${escapeHtml(raw.join('\n'))}</code></pre>`
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        // ── 코드 블록 열림 ──
        const langLine = line.replace(/^```/, '').trim() || 'code';
        closeList();
        inCodeBlock = true;
        codeContent = [];
        codeContent.push(`__LANG__${langLine}`);
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // 0. <iframe> 태그가 포함된 줄 → 반응형 래퍼로 즉시 변환
    if (/<iframe/i.test(line)) {
      closeList();
      html.push(makeIframeResponsive(line));
      continue;
    }

    // 1. 단일 마크다운 링크인 경우 -> Link Preview Card
    const mdLinkMatch = line.trim().match(/^\[([^\]]*)\]\((https?:\/\/[^\s]+)\)$/);
    if (mdLinkMatch) {
      closeList();
      html.push(getPreviewHtml(mdLinkMatch[2]));
      continue;
    }

    // 2. HTML 태그가 포함되어 있더라도 텍스트 내용이 순수 URL 하나인 경우
    const stripped = line.replace(/<[^>]+>/g, '').trim();
    if (stripped.match(/^https?:\/\/[^\s]+$/)) {
      closeList();
      const hrefMatch = line.match(/href="([^"]+)"/);
      let url = hrefMatch ? hrefMatch[1] : stripped;
      url = url.replace(/&amp;/g, '&');
      html.push(getPreviewHtml(url));
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${parseInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // HR (Solid, Dashed, Dotted)
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      html.push('<hr />');
      continue;
    }
    if (/^-{3,}\.$/.test(line.trim())) {
      closeList();
      html.push('<hr class="dashed" />');
      continue;
    }
    if (/^-{3,}\*$/.test(line.trim())) {
      closeList();
      html.push('<hr class="dotted" />');
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith('> ')) {
      closeList();
      html.push(`<blockquote><p>${parseInline(line.replace(/^>\s*/, ''))}</p></blockquote>`);
      continue;
    }

    // Unordered list
    const ulMatch = line.match(/^(\s*)[-*+]\s+(.+)/);
    if (ulMatch) {
      if (!inList || listType !== 'ul') {
        closeList();
        html.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      html.push(`<li>${parseInline(ulMatch[2])}</li>`);
      continue;
    }

    // Ordered list
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)/);
    if (olMatch) {
      if (!inList || listType !== 'ol') {
        closeList();
        html.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      html.push(`<li>${parseInline(olMatch[2])}</li>`);
      continue;
    }

    // Close list if line doesn't match
    closeList();

    // Empty line
    if (line.trim() === '') {
      continue;
    }

    // Paragraph
    html.push(`<p>${parseInline(line)}</p>`);
  }

  // Close any open blocks
  if (inCodeBlock) {
    const raw = codeContent.slice(1); // skip __LANG__ marker
    const lang = (codeContent[0] || '').replace('__LANG__', '') || 'code';
    const blockId = `cb_${Math.random().toString(36).slice(2, 8)}`;
    html.push(`<pre data-lang="${escapeHtml(lang)}" data-id="${blockId}"><code>${escapeHtml(raw.join('\n'))}</code></pre>`);
  }
  closeList();

  return html.join('\n');
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [version, setVersion] = useState(0);
  const [fullscreenCode, setFullscreenCode] = useState<{ code: string; lang: string } | null>(null);

  const renderedHtml = useMemo(() => renderMarkdown(content), [content, version]);

  // OG 프리뷰 fetch
  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll('.og-link-preview:not(.processed)');
    if (elements.length === 0) return;
    const fetchAll = async () => {
      const fetchPromises = Array.from(elements).map(async (el) => {
        const url = el.getAttribute('data-url');
        if (!url || ogCache[url]) return;
        try {
          const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
          const json = await res.json();
          if (json.status === 'success') {
            ogCache[url] = json.data;
            setVersion(v => v + 1);
          }
        } catch (err) {
          console.error('Failed to fetch OG data for', url, err);
        }
      });
      await Promise.all(fetchPromises);
    };
    fetchAll();
  }, [renderedHtml]);

  // 코드 블록에 "전체보기" 버튼 주입
  const openFullscreen = useCallback((code: string, lang: string) => {
    setFullscreenCode({ code, lang });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const pres = containerRef.current.querySelectorAll<HTMLPreElement>('pre[data-id]');
    pres.forEach(pre => {
      // 이미 버튼 주입됐으면 skip
      if (pre.querySelector('.code-fullscreen-btn')) return;

      // overflow 스타일 강제 적용
      pre.style.overflow = 'hidden';
      pre.style.position = 'relative';

      const code = pre.querySelector('code');
      if (code) {
        code.style.display = 'block';
        code.style.overflowX = 'auto';
        code.style.maxWidth = '100%';
        code.style.boxSizing = 'border-box';
      }

      const lang = pre.getAttribute('data-lang') || 'code';
      const codeText = code?.textContent || '';

      // 상단 바 (언어 + 버튼)
      const bar = document.createElement('div');
      bar.className = 'code-header-bar';
      bar.style.cssText = [
        'display:flex', 'align-items:center', 'justify-content:space-between',
        'padding:6px 12px', 'background:rgba(0,0,0,0.35)', 'border-radius:12px 12px 0 0',
        'font-size:11px', 'font-weight:700', 'color:rgba(255,255,255,0.5)', 'letter-spacing:0.05em',
      ].join(';');

      const langSpan = document.createElement('span');
      langSpan.textContent = lang.toUpperCase();
      bar.appendChild(langSpan);

      const btn = document.createElement('button');
      btn.className = 'code-fullscreen-btn';
      btn.textContent = '⛶ 전체보기';
      btn.style.cssText = [
        'background:rgba(255,255,255,0.12)', 'border:none', 'border-radius:6px',
        'color:rgba(255,255,255,0.7)', 'cursor:pointer', 'padding:3px 8px',
        'font-size:10px', 'font-weight:700', 'transition:background 0.2s',
      ].join(';');
      btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(255,255,255,0.25)'; });
      btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(255,255,255,0.12)'; });
      btn.addEventListener('click', () => openFullscreen(codeText, lang));
      bar.appendChild(btn);

      pre.insertBefore(bar, pre.firstChild);

      // pre 자체 radius 조정
      pre.style.borderRadius = '12px';
      pre.style.padding = '0';
      if (code) {
        code.style.padding = '16px';
        code.style.borderRadius = '0 0 12px 12px';
      }
    });
  }, [renderedHtml, openFullscreen]);

  // ── 마크다운 본문의 <iframe> 태그를 반응형으로 변환 ──
  useEffect(() => {
    if (!containerRef.current) return;
    const iframes = containerRef.current.querySelectorAll<HTMLIFrameElement>('iframe');
    iframes.forEach(iframe => {
      // 이미 래핑됐으면 skip
      if (iframe.parentElement?.classList.contains('iframe-responsive-wrapper')) return;

      // 고정 width/height 속성 제거 후 100%로 설정
      iframe.removeAttribute('width');
      iframe.removeAttribute('height');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.display = 'block';
      iframe.style.border = 'none';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';

      // 16:9 반응형 래퍼 생성
      const wrapper = document.createElement('div');
      wrapper.className = 'iframe-responsive-wrapper';
      wrapper.style.cssText = [
        'position:relative',
        'width:100%',
        'padding-bottom:56.25%',  // 16:9
        'height:0',
        'overflow:hidden',
        'border-radius:14px',
        'box-shadow:0 2px 12px rgba(0,0,0,0.15)',
        'margin:12px 0',
      ].join(';');

      // iframe 앞에 wrapper 삽입 후 iframe을 wrapper 안으로 이동
      iframe.parentNode?.insertBefore(wrapper, iframe);
      wrapper.appendChild(iframe);
    });
  }, [renderedHtml]);

  return (
    <>
      <div
        ref={containerRef}
        className={`markdown-body ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />

      {/* ── 전체화면 코드 모달 ── */}
      {fullscreenCode && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col"
          style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)' }}
          onClick={() => setFullscreenCode(null)}
        >
          {/* 모달 헤더 */}
          <div
            className="flex items-center justify-between px-6 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f57' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#28ca41' }} />
              </div>
              <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {fullscreenCode.lang.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullscreenCode.code);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                복사
              </button>
              <button
                onClick={() => setFullscreenCode(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
              >
                ✕ 닫기
              </button>
            </div>
          </div>

          {/* 코드 영역 */}
          <div
            className="flex-1 overflow-auto p-6"
            onClick={e => e.stopPropagation()}
          >
            <pre
              style={{
                background: 'transparent',
                color: '#e2e8f0',
                fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
                fontSize: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre',
                margin: 0,
                padding: 0,
              }}
            >
              <code>{fullscreenCode.code}</code>
            </pre>
          </div>
        </div>
      )}
    </>
  );
}
