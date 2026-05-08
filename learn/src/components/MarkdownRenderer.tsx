import { useEffect, useRef, useMemo, useState } from 'react';

/**
 * Minimal Markdown → HTML renderer (no external libraries)
 * Supports: headings, bold, italic, code, codeblocks, links, lists, blockquotes, hr, images
 */

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
        html.push(`<pre><code>${escapeHtml(codeContent.join('\n'))}</code></pre>`);
        codeContent = [];
        inCodeBlock = false;
      } else {
        closeList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(line);
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
    html.push(`<pre><code>${escapeHtml(codeContent.join('\n'))}</code></pre>`);
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
  
  const renderedHtml = useMemo(() => renderMarkdown(content), [content, version]);

  useEffect(() => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll('.og-link-preview:not(.processed)');
    
    if (elements.length === 0) return;

    const fetchAll = async () => {
      // 모든 요소를 병렬로 페칭하여 속도 향상
      const fetchPromises = Array.from(elements).map(async (el) => {
        const url = el.getAttribute('data-url');
        if (!url || ogCache[url]) return;
        
        try {
          // fetch 옵션에 우선순위나 캐시 설정을 추가할 수도 있으나, 기본 fetch도 충분합니다.
          const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
          const json = await res.json();
          if (json.status === 'success') {
            ogCache[url] = json.data;
            // 각 링크가 로드될 때마다 즉시 리렌더링하여 사용자에게 더 빠르게 보여줌
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

  return (
    <div
      ref={containerRef}
      className={`markdown-body ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
