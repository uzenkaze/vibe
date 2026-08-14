import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';

// 초기 샘플 아티클 데이터
const DEFAULT_ARTICLES = [
  {
    id: 'art-1',
    title: '2026 연말정산 환급금 극대화 핵심 체크리스트',
    category: '연말정산',
    summary: '인적공제부터 신용카드 소득공제, 연금저축/IRP 세액공제 한도까지 한눈에 정리하는 2026 연말정산 필수 가이드입니다.',
    tags: ['연말정산', '소득공제', '세액공제', '연금저축', '환급금'],
    createdAt: '2026-01-15',
    updatedAt: '2026-01-15',
    content: `
<div className="article-body">
  <h2>1. 연말정산 핵심 개요</h2>
  <p>연말정산은 1년 동안 납부한 근로소득세를 정산하여 실제 부담해야 할 세액보다 많이 낸 경우 환급받고, 적게 낸 경우 추징하는 절차입니다.</p>
  
  <div className="article-callout tip">
    💡 <strong>핵심 팁:</strong> 총급여의 25% 이상을 소비한 시점부터 신용카드(15%), 체크카드/현금영수증(30%), 대중교통/전통시장(40%) 공제율이 차등 적용됩니다.
  </div>

  <h2>2. 주요 공제 항목 및 한도</h2>
  <table>
    <thead>
      <tr>
        <th>공제 항목</th>
        <th>공제율 / 조건</th>
        <th>최대 한도</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>연금저축 + IRP</strong></td>
        <td>12% ~ 15% 세액공제</td>
        <td>최대 900만 원 (연금저축 600만 원)</td>
      </tr>
      <tr>
        <td><strong>신용·체크카드</strong></td>
        <td>15% ~ 40% 소득공제</td>
        <td>총급여 기준 200만~300만 원</td>
      </tr>
      <tr>
        <td><strong>월세 세액공제</strong></td>
        <td>15% ~ 17% 세액공제</td>
        <td>월세액 750만 원 한도</td>
      </tr>
      <tr>
        <td><strong>보장성 보험료</strong></td>
        <td>12% 세액공제</td>
        <td>연 100만 원 한도 (최대 12만 원)</td>
      </tr>
    </tbody>
  </table>

  <h2>3. 환급금을 늘리는 실전 전략</h2>
  <ul>
    <li><strong>맞벌이 부부:</strong> 부양가족 인적공제는 기본소율 및 과세표준 구간이 높은 배우자 쪽에 몰아주는 것이 유리합니다.</li>
    <li><strong>안경/렌즈 구입비:</strong> 시력 교정용 안경 및 콘택트렌즈 구입비는 연 50만 원까지 의료비 세액공제 대상입니다.</li>
    <li><strong>기부금 공제:</strong> 고향사랑기부금 10만 원까지는 100% 전액 세액공제되며, 10만 원 초과분은 15% 공제됩니다.</li>
  </ul>
</div>
    `
  },
  {
    id: 'art-2',
    title: '종합소득세 신고 대상자 구분 및 필수 세금 절약 가이드',
    category: '종합소득세',
    summary: '프리랜서(3.3%), 부업 소득자, 자영업자 및 금융소득 2,000만 원 초과자를 위한 5월 종합소득세 신고 절세 팁입니다.',
    tags: ['종합소득세', '3.3%', '프리랜서', '경비처리', '세무신고'],
    createdAt: '2026-05-02',
    updatedAt: '2026-05-02',
    content: `
<div className="article-body">
  <h2>1. 종합소득세 신고 대상자</h2>
  <p>당해 연도에 근로소득 외에 사업소득, 배당소득, 이자소득, 연금소득, 기타소득이 있는 개인은 매년 5월 1일부터 5월 31일까지 종합소득세를 신고·납부해야 합니다.</p>

  <h2>2. 프리랜서(3.3%) 단순경비율 vs 기준경비율</h2>
  <p>수입금액 규모에 따라 장부 작성 의무 및 경비율 적용 기준이 달라집니다.</p>

  <div className="article-callout warning">
    ⚠️ <strong>주의 사항:</strong> 직전 연도 수입금액이 2,400만 원 이상인 경우 기준경비율 대상이 되며, 증빙 서류(세금계산서, 현금영수증, 신용카드 매출전표)를 반드시 갖춰야 유리합니다.
  </div>

  <h2>3. 인정되는 대표적인 사업 경비 항목</h2>
  <ol>
    <li><strong>통신비 및 인터넷 비용:</strong> 사업용으로 사용한 휴대폰 요금 및 사무실 인터넷 비용</li>
    <li><strong>접대비 및 경조사비:</strong> 청첩장, 부고장 등 1건당 20만 원까지 경비 인정</li>
    <li><strong>차량 유지비:</strong> 업무용 승용차 관련 기름값, 보험료, 통행료</li>
    <li><strong>장비 및 소모품비:</strong> 업무용 노트북, 태블릿, 소프트웨어 구독료</li>
  </ol>
</div>
    `
  },
  {
    id: 'art-3',
    title: '개인사업자 및 간이과세자를 위한 부가가치세 신고 기초',
    category: '부가가치세',
    summary: '1월과 7월에 진행되는 부가가치세 신고 일정, 매입세액 공제 항목 및 절세 노하우를 정리하였습니다.',
    tags: ['부가가치세', 'VAT', '간이과세자', '매입세액공제', '사업자'],
    createdAt: '2026-07-05',
    updatedAt: '2026-07-05',
    content: `
<div className="article-body">
  <h2>1. 부가가치세 신고 일정</h2>
  <p>일반과세자는 연 2회(1월, 7월), 간이과세자는 연 1회(1월) 부가가치세를 신고 및 납부합니다.</p>

  <h2>2. 매입세액 공제 핵심 절목</h2>
  <p>사업과 관련하여 지출한 내역 중 적격증빙을 수취한 경우 부가가치세 매입세액 공제를 받을 수 있습니다.</p>

  <div className="article-callout info">
    ℹ️ <strong>적격증빙 4가지:</strong> 세금계산서, 계산서, 현금영수증(지출증빙용), 신용·체크카드 매출전표
  </div>
</div>
    `
  },
  {
    id: 'art-4',
    title: 'ISA 계좌 절세 활용법 & 비과세 한도 100% 활용 전략',
    category: '자산/절세',
    summary: '개인자산관리계좌(ISA)를 통한 주식, ETF 투자 시 손익통산 및 비과세 혜택 활용 가이드입니다.',
    tags: ['ISA계좌', '비과세', '절세', 'ETF', '자산관리'],
    createdAt: '2026-08-01',
    updatedAt: '2026-08-01',
    content: `
<div className="article-body">
  <h2>1. ISA(개인종합자산관리계좌)란?</h2>
  <p>하나의 계좌에서 예·적금, 펀드, ETF, 국내주식 등 다양한 금융상품을 운용하면서 절세 혜택을 누릴 수 있는 만능 자산관리 계좌입니다.</p>

  <h2>2. ISA 주요 절세 혜택</h2>
  <ul>
    <li><strong>손익통산:</strong> 이익과 손실을 상계하여 순이익에 대해서만 과세합니다.</li>
    <li><strong>비과세 한도:</strong> 일반형 200만 원, 서민형 400만 원까지 이자·배당소득 비과세</li>
    <li><strong>분리과세:</strong> 비과세 한도 초과분은 9.9% 저율 분리과세 (기존 15.4% 대비 절세)</li>
  </ul>
</div>
    `
  }
];

const CATEGORIES = ['전체', '연말정산', '종합소득세', '부가가치세', '자산/절세', '기타'];

// 서식 HTML 템플릿
const HTML_TEMPLATES = {
  template1: `<div className="article-body">
  <h2>제목을 입력하세요</h2>
  <p>여기에 요약 내용을 입력하세요.</p>

  <div className="article-callout tip">
    💡 <strong>핵심 요약:</strong> 강조하고 싶은 핵심 팁을 여기에 적으세요.
  </div>

  <h2>주요 내용 및 항목</h2>
  <table>
    <thead>
      <tr>
        <th>항목</th>
        <th>설명</th>
        <th>비고</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>항목 1</strong></td>
        <td>상세 설명 1</td>
        <td>비고 1</td>
      </tr>
    </tbody>
  </table>
</div>`,

  template2: `<div className="article-body">
  <h2>세금 신고 체크리스트</h2>
  <ul>
    <li><strong>체크 1:</strong> 서류 구비 완료</li>
    <li><strong>체크 2:</strong> 공제 항목 검토</li>
  </ul>

  <div className="article-callout warning">
    ⚠️ <strong>주의:</strong> 신고 기한을 준수해야 가산세를 피할 수 있습니다.
  </div>
</div>`
};

// 통글/일반 텍스트도 가독성 높은 블로그/매거진 형태로 스마트 자동 파싱하는 헬퍼 함수
function formatSmartArticleContent(rawContent) {
  if (!rawContent) return '';
  
  const trimmed = rawContent.trim();
  // 이미 표준 HTML 구조(<h2>, <h3>, <p>, <table>, <ul/ol>, <div class="article-callout">)를 갖추고 있는 경우
  const hasHtmlStructure = /<(h[1-6]|p|table|ul|ol|div)/i.test(trimmed);
  if (hasHtmlStructure) {
    return trimmed;
  }

  // 빽빽하게 이어진 텍스트를 문단, 이모티콘, 목록 단위로 스마트 분리
  let formatted = trimmed;

  // 1. 주요 이모티콘 및 구분 지점 앞부분 개행 자동 확보
  const emojiPattern = /(?<!\n)([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|👉|💡|⚠️|📅|🗓️|📌|✅|💰|📊|⭐|❓)/gu;
  formatted = formatted.replace(emojiPattern, '\n\n$1');

  // 2. 숫자로 시작하는 예시/항목 (예시 1), 1), 2), 1.) 앞부분 개행 자동 삽입
  const numberItemPattern = /(?<!\n)(예시\s*\d+[\)\.:]?|\b\d+[\)\.])/gi;
  formatted = formatted.replace(numberItemPattern, '\n\n$1');

  // 3. 줄바꿈 문단 단위 분리 및 콜아웃 상자 자동 변환
  const lines = formatted.split('\n').map(l => l.trim()).filter(Boolean);
  
  if (lines.length === 0) return `<p>${trimmed}</p>`;

  let htmlResult = lines.map(line => {
    if (line.startsWith('💡') || line.startsWith('👉')) {
      return `<div class="article-callout tip" style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-radius: 12px; border-left: 4px solid #3b82f6;">${line}</div>`;
    } else if (line.startsWith('⚠️')) {
      return `<div class="article-callout warning" style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-radius: 12px; border-left: 4px solid #ef4444;">${line}</div>`;
    } else if (line.startsWith('ℹ️') || line.startsWith('📌')) {
      return `<div class="article-callout info" style="margin: 1.25rem 0; padding: 1rem 1.25rem; border-radius: 12px; border-left: 4px solid #10b981;">${line}</div>`;
    } else if (line.startsWith('📅') || line.startsWith('🗓️')) {
      return `<div class="article-callout info" style="margin: 1.25rem 0; padding: 0.85rem 1.25rem; border-radius: 12px; border-left: 4px solid #8b5cf6;"><strong>${line}</strong></div>`;
    } else if (/^\d+[\)\.]/.test(line) || /^예시\s*\d+/i.test(line)) {
      return `<p style="margin-left: 0.25rem; margin-bottom: 0.85rem; font-weight: 700; font-size: 1rem;">${line}</p>`;
    }
    return `<p style="margin-bottom: 1.15rem; line-height: 1.8;">${line}</p>`;
  }).join('');

  return htmlResult;
}

export default function TaxArticlePage() {
  const { dark } = useApp();
  const contentTextareaRef = useRef(null);

  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_tax_articles');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_ARTICLES;
  });

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeArticle, setActiveArticle] = useState(null); // 읽기 모달 레이어
  const [editorModal, setEditorModal] = useState(false); // 등록/수정 모달
  const [editTarget, setEditTarget] = useState(null); // 수정 대상

  // 폼 필드
  const [formData, setFormData] = useState({
    title: '',
    category: '연말정산',
    summary: '',
    tags: '',
    content: ''
  });

  const [editorTab, setEditorTab] = useState('write'); // 'write' | 'preview'

  // 에디터 서식 툴바 삽입 헬퍼 함수 (스크롤 위치 및 커서 완전 보존)
  const handleInsertFormat = (e, prefix, suffix = '') => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }

    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setFormData(prev => ({ ...prev, content: prev.content + prefix + suffix }));
      return;
    }

    const savedScrollTop = textarea.scrollTop;
    const modalContainer = textarea.closest('.modal-container');
    const savedModalScrollTop = modalContainer ? modalContainer.scrollTop : 0;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.content;
    const selectedText = text.substring(start, end);

    const replacement = prefix + (selectedText || '') + suffix;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    setFormData(prev => ({ ...prev, content: newContent }));

    // 포커스 복원 및 스크롤 튀는 현상 원천 차단 (preventScroll 사용)
    requestAnimationFrame(() => {
      textarea.focus({ preventScroll: true });
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.scrollTop = savedScrollTop;
      if (modalContainer) {
        modalContainer.scrollTop = savedModalScrollTop;
      }
    });
  };

  // 상단 타이틀 & 설명 설정 (localStorage 동기화)
  const [pageTitle, setPageTitle] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_tax_article_title');
      if (saved) return saved;
    } catch (e) {}
    return '세금 & 자산 지식 아티클';
  });

  const [pageDesc, setPageDesc] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_tax_article_desc');
      if (saved) return saved;
    } catch (e) {}
    return '연말정산, 종합소득세, 부가가치세 및 주요 자산 관리 지식을 블로그 기사처럼 편리하게 스크랩하고 관리하세요.';
  });

  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [tempTitle, setTempTitle] = useState(pageTitle);
  const [tempDesc, setTempDesc] = useState(pageDesc);

  const handleSaveHeader = () => {
    const nextTitle = tempTitle.trim() || '세금 & 자산 지식 아티클';
    const nextDesc = tempDesc.trim() || '연말정산, 종합소득세, 부가가치세 및 주요 자산 관리 지식을 블로그 기사처럼 편리하게 스크랩하고 관리하세요.';
    setPageTitle(nextTitle);
    setPageDesc(nextDesc);
    try {
      localStorage.setItem('asset_tax_article_title', nextTitle);
      localStorage.setItem('asset_tax_article_desc', nextDesc);
    } catch (e) {}
    setIsEditingHeader(false);
  };

  // 동적 카테고리 목록 상태 (localStorage 동기화)
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_tax_article_categories');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return ['연말정산', '종합소득세', '부가가치세', '자산/절세', '기타'];
  });

  const [categoryModal, setCategoryModal] = useState(false); // 카테고리 관리 모달
  const [newCategoryInput, setNewCategoryInput] = useState('');

  // 카테고리 변경 시 저장
  useEffect(() => {
    try {
      localStorage.setItem('asset_tax_article_categories', JSON.stringify(categories));
    } catch (e) {}
  }, [categories]);

  // 카테고리 추가
  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    if (trimmed === '전체') {
      alert("'전체'는 기본 예약어입니다.");
      return;
    }
    if (categories.includes(trimmed)) {
      alert("이미 존재하는 카테고리입니다.");
      return;
    }
    setCategories(prev => [...prev, trimmed]);
    setNewCategoryInput('');
  };

  // 카테고리 삭제
  const handleDeleteCategory = (catName) => {
    if (categories.length <= 1) {
      alert("최소 1개 이상의 카테고리가 존재해야 합니다.");
      return;
    }
    if (confirm(`'${catName}' 카테고리를 삭제하시겠습니까?\n해당 카테고리의 기존 글들은 '기타' 카테고리로 변경됩니다.`)) {
      setCategories(prev => prev.filter(c => c !== catName));
      // 해당 카테고리를 사용하는 아티클 '기타'로 전환
      setArticles(prev => prev.map(art => art.category === catName ? { ...art, category: '기타' } : art));
      if (selectedCategory === catName) {
        setSelectedCategory('전체');
      }
    }
  };

  // articles 변경 시 저장
  useEffect(() => {
    try {
      localStorage.setItem('asset_tax_articles', JSON.stringify(articles));
    } catch (e) {
      console.error(e);
    }
  }, [articles]);

  // 필터링된 아티클 목록
  const filteredArticles = useMemo(() => {
    return articles.filter(art => {
      const matchCat = selectedCategory === '전체' || art.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchCat;

      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = (art.summary || '').toLowerCase().includes(q);
      const matchContent = (art.content || '').toLowerCase().includes(q);
      const matchTags = (art.tags || []).some(t => t.toLowerCase().includes(q));

      return matchCat && (matchTitle || matchSummary || matchContent || matchTags);
    });
  }, [articles, selectedCategory, searchQuery]);

  // 등록/수정 모달 열기
  const handleOpenEditor = (article = null) => {
    if (article) {
      setEditTarget(article);
      setFormData({
        title: article.title || '',
        category: article.category || '기타',
        summary: article.summary || '',
        tags: Array.isArray(article.tags) ? article.tags.join(', ') : '',
        content: article.content || ''
      });
    } else {
      setEditTarget(null);
      setFormData({
        title: '',
        category: '연말정산',
        summary: '',
        tags: '',
        content: HTML_TEMPLATES.template1
      });
    }
    setEditorTab('write');
    setEditorModal(true);
  };

  // 아티클 저장
  const handleSaveArticle = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.content.trim()) {
      alert('본문 HTML 내용을 입력해주세요.');
      return;
    }

    const tagArray = formData.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const today = new Date().toISOString().split('T')[0];

    if (editTarget) {
      // 수정
      setArticles(prev => prev.map(a => a.id === editTarget.id ? {
        ...a,
        title: formData.title,
        category: formData.category,
        summary: formData.summary,
        tags: tagArray,
        content: formData.content,
        updatedAt: today
      } : a));
    } else {
      // 신규
      const newArt = {
        id: `art-${Date.now()}`,
        title: formData.title,
        category: formData.category,
        summary: formData.summary,
        tags: tagArray,
        content: formData.content,
        createdAt: today,
        updatedAt: today
      };
      setArticles(prev => [newArt, ...prev]);
    }

    setEditorModal(false);
  };

  // 아티클 삭제
  const handleDeleteArticle = (id, title) => {
    if (confirm(`'${title}' 아티클을 삭제하시겠습니까?`)) {
      setArticles(prev => prev.filter(a => a.id !== id));
      if (activeArticle && activeArticle.id === id) {
        setActiveArticle(null);
      }
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* 스타일 정의 */}
      <style>{`
        @keyframes modalCenterPop {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .article-card-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
          margin-top: 1.25rem;
        }

        .article-card {
          background: ${dark ? 'rgba(15, 23, 42, 0.75)' : '#ffffff'};
          border: 1px solid ${dark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'};
          border-radius: 18px;
          padding: 1.35rem;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: ${dark ? '0 10px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.03)'};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .article-card:hover {
          transform: translateY(-4px);
          border-color: ${dark ? '#38bdf8' : '#2563eb'};
          box-shadow: ${dark ? '0 15px 35px rgba(56, 189, 248, 0.15)' : '0 12px 30px rgba(37, 99, 235, 0.12)'};
        }

        .article-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .article-badge.연말정산 { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
        .article-badge.종합소득세 { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        .article-badge.부가가치세 { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .article-badge.자산절세 { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .article-badge.기타 { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }

        /* 블로그 기사 렌더링 스타일 (HTML 및 일반 엔터 줄바꿈 완벽 지원) */
        .article-body {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.7;
          color: ${dark ? '#e2e8f0' : '#1e293b'};
          font-size: 0.98rem;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .article-body h1, .article-body h2, .article-body h3 {
          color: ${dark ? '#ffffff' : '#0f172a'};
          font-weight: 800;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }
        .article-body h2 {
          font-size: 1.3rem;
          padding-bottom: 0.4rem;
          border-bottom: 2px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'};
        }
        .article-body p {
          margin-bottom: 1rem;
        }
        .article-body ul, .article-body ol {
          margin-bottom: 1.2rem;
          padding-left: 1.5rem;
        }
        .article-body li {
          margin-bottom: 0.4rem;
        }
        .article-body table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.25rem 0;
          font-size: 0.88rem;
        }
        .article-body th, .article-body td {
          padding: 10px 14px;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          text-align: left;
        }
        .article-body th {
          background: ${dark ? 'rgba(255,255,255,0.05)' : '#f8fafc'};
          color: ${dark ? '#38bdf8' : '#2563eb'};
          font-weight: 800;
        }
        .article-body img {
          max-width: 100%;
          border-radius: 12px;
          margin: 1rem 0;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .article-callout {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin: 1.25rem 0;
          font-size: 0.9rem;
        }
        .article-callout.tip { background: ${dark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff'}; border-left: 4px solid #3b82f6; }
        .article-callout.warning { background: ${dark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'}; border-left: 4px solid #ef4444; }
        .article-callout.info { background: ${dark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5'}; border-left: 4px solid #10b981; }
      `}</style>

      {/* 상단 헤더 섹션 */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem 1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            {!isEditingHeader ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#a855f7', boxShadow: '0 0 12px #a855f7', flexShrink: 0 }} />
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {pageTitle}
                    <button
                      onClick={() => {
                        setTempTitle(pageTitle);
                        setTempDesc(pageDesc);
                        setIsEditingHeader(true);
                      }}
                      title="타이틀 & 설명 수정"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        opacity: 0.6,
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = 1}
                      onMouseLeave={e => e.currentTarget.style.opacity = 0.6}
                    >
                      ✏️
                    </button>
                  </h1>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                  {pageDesc}
                </p>
              </div>
            ) : (
              /* 타이틀/설명 편집 폼 */
              <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>페이지 타이틀</label>
                  <input
                    type="text"
                    value={tempTitle}
                    onChange={e => setTempTitle(e.target.value)}
                    placeholder="타이틀 입력..."
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 800 }}
                  />
                </div>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>페이지 설명</label>
                  <textarea
                    rows={2}
                    value={tempDesc}
                    onChange={e => setTempDesc(e.target.value)}
                    placeholder="설명 입력..."
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleSaveHeader}
                    style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: '#a855f7', color: '#ffffff', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    저장
                  </button>
                  <button
                    onClick={() => setIsEditingHeader(false)}
                    style={{ padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => handleOpenEditor()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              borderRadius: '99px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
              transition: 'transform 0.2s ease',
              flexShrink: 0
            }}
          >
            ✏️ 신규 아티클 등록
          </button>
        </div>

        {/* 검색 및 카테고리 필터 */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* 동적 카테고리 필터 칩스 + 관리 버튼 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
            {['전체', ...categories].map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '99px',
                    border: `1px solid ${isActive ? '#a855f7' : (dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                    background: isActive ? (dark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff') : (dark ? 'rgba(255,255,255,0.03)' : '#ffffff'),
                    color: isActive ? (dark ? '#ffffff' : '#7e22ce') : (dark ? 'rgba(255,255,255,0.6)' : '#64748b'),
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}

            {/* ⚙️ 카테고리 관리 버튼 */}
            <button
              onClick={() => setCategoryModal(true)}
              title="카테고리 추가/삭제 설정"
              style={{
                padding: '5px 12px',
                borderRadius: '99px',
                border: dark ? '1px dashed rgba(168, 85, 247, 0.4)' : '1px dashed #c084fc',
                background: dark ? 'rgba(168, 85, 247, 0.08)' : '#faf5ff',
                color: dark ? '#c084fc' : '#9333ea',
                fontSize: '0.75rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              ⚙️ 카테고리 설정
            </button>
          </div>

          {/* 검색창 */}
          <div style={{ position: 'relative', width: '240px' }}>
            <input
              type="text"
              placeholder="제목, 내용, 태그 검색..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '99px',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#cbd5e1'}`,
                background: dark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* 아티클 목록 카드 그리드 */}
      {filteredArticles.length === 0 ? (
        <div style={{ textTransform: 'center', padding: '3rem 1rem', background: dark ? 'rgba(15,23,42,0.4)' : '#f8fafc', borderRadius: '18px', border: '1px stroke var(--border)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📑</div>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>등록된 아티클이 없습니다.</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>우측 상단의 '신규 아티클 등록' 버튼을 눌러 세금 정보나 자산 상식을 추가해보세요.</div>
        </div>
      ) : (
        <div className="article-card-grid">
          {filteredArticles.map(art => {
            const badgeClass = art.category === '자산/절세' ? '자산절세' : art.category;
            return (
              <div
                key={art.id}
                className="article-card"
                onClick={() => setActiveArticle(art)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className={`article-badge ${badgeClass}`}>
                      {art.category}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {art.createdAt}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: dark ? '#ffffff' : '#0f172a', lineHeight: 1.4, marginBottom: '0.5rem' }}>
                    {art.title}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: dark ? 'rgba(255,255,255,0.65)' : '#475569', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {art.summary}
                  </p>
                </div>

                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: `1px stroke ${dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {/* 태그 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(art.tags || []).slice(0, 3).map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.68rem', color: dark ? '#38bdf8' : '#2563eb', background: dark ? 'rgba(56,189,248,0.1)' : '#eff6ff', padding: '1px 6px', borderRadius: '4px' }}>
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#a855f7', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    읽기 ➔
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- 아티클 상세 열람 모달 (화면 중앙 정렬 블로그/뉴스 레이어) --- */}
      {activeArticle && (
        <div 
          className="modal-overlay" 
          onClick={() => setActiveArticle(null)} 
          style={{ 
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2000, 
            background: 'rgba(0,0,0,0.75)', 
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem',
            overflow: 'hidden'
          }}
        >
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '850px',
              maxHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              background: dark ? '#0f172a' : '#ffffff',
              borderRadius: '24px',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168, 85, 247, 0.15)',
              position: 'relative',
              margin: 'auto',
              animation: 'modalCenterPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            {/* 상단 닫기 & 관리 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span className={`article-badge ${activeArticle.category === '자산/절세' ? '자산절세' : activeArticle.category}`}>
                {activeArticle.category}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    handleOpenEditor(activeArticle);
                    setActiveArticle(null);
                  }}
                  style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✏️ 수정
                </button>
                <button
                  onClick={() => handleDeleteArticle(activeArticle.id, activeArticle.title)}
                  style={{ fontSize: '0.78rem', padding: '4px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', cursor: 'pointer' }}
                >
                  🗑️ 삭제
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 타이틀 및 메타 */}
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: dark ? '#ffffff' : '#0f172a', lineHeight: 1.35, marginBottom: '0.75rem' }}>
              {activeArticle.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <span>📅 작성일: {activeArticle.createdAt}</span>
              {activeArticle.updatedAt !== activeArticle.createdAt && (
                <span>(수정: {activeArticle.updatedAt})</span>
              )}
            </div>

            {/* HTML 본문 콘텐츠 (스마트 자동 정돈 & 블로그 스타일 프리미엄 뷰) */}
            <div
              className="article-body"
              dangerouslySetInnerHTML={{ __html: formatSmartArticleContent(activeArticle.content) }}
            />

            {/* 태그 보람 및 하단 닫기 */}
            <div style={{ marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {(activeArticle.tags || []).map((t, idx) => (
                  <span key={idx} style={{ fontSize: '0.75rem', background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', color: '#a855f7', padding: '3px 10px', borderRadius: '99px', fontWeight: 700 }}>
                    #{t}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setActiveArticle(null)}
                style={{ padding: '8px 24px', borderRadius: '99px', border: 'none', background: dark ? '#334155' : '#0f172a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- 아티클 등록 / 수정 모달 (화면 중앙 정렬 HTML 에디터 & 프리뷰) --- */}
      {editorModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setEditorModal(false)} 
          style={{ 
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2100, 
            background: 'rgba(0,0,0,0.75)', 
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem',
            overflow: 'hidden'
          }}
        >
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '800px',
              maxHeight: 'calc(100vh - 3rem)',
              overflowY: 'auto',
              background: dark ? '#0f172a' : '#ffffff',
              borderRadius: '24px',
              padding: '1.75rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(168, 85, 247, 0.15)',
              position: 'relative',
              margin: 'auto',
              animation: 'modalCenterPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {editTarget ? '✏️ 아티클 수정' : '📝 신규 아티클 등록'}
              </h2>
              <button
                onClick={() => setEditorModal(false)}
                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveArticle}>
              {/* 카테고리 & 제목 */}
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>카테고리</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>아티클 제목</label>
                  <input
                    type="text"
                    placeholder="예: 2026 연말정산 환급금 극대화 가이드"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {/* 요약문 & 태그 */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>요약 설명</label>
                <input
                  type="text"
                  placeholder="목록에 표시될 간략한 설명을 적어주세요."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="예: 연말정산, 소득공제, 절세"
                  value={formData.tags}
                  onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              {/* 본문 입력 및 프리뷰 탭 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setEditorTab('write')}
                      style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: editorTab === 'write' ? '#a855f7' : 'var(--surface)', color: editorTab === 'write' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      ✏️ 글 작성 / 서식 에디터
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab('preview')}
                      style={{ padding: '4px 12px', borderRadius: '6px', border: 'none', background: editorTab === 'preview' ? '#a855f7' : 'var(--surface)', color: editorTab === 'preview' ? '#ffffff' : 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      👁️ 미리보기
                    </button>
                  </div>

                  {/* 템플릿 빠르게 삽입 버튼 */}
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: HTML_TEMPLATES.template1 })}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      + 표 템플릿
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: HTML_TEMPLATES.template2 })}
                      style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      + 체크리스트 템플릿
                    </button>
                  </div>
                </div>

                {editorTab === 'write' ? (
                  <div>
                    {/* 편리한 서식 & 이모티콘 편집 툴바 */}
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '4px',
                      alignItems: 'center',
                      marginBottom: '8px',
                      padding: '6px 10px',
                      background: dark ? 'rgba(255,255,255,0.04)' : '#f1f5f9',
                      borderRadius: '10px',
                      border: '1px solid var(--border)'
                    }}>
                      <button type="button" onClick={e => handleInsertFormat(e, '\n\n')} title="줄바꿈 (엔터)" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        ↵ 줄바꿈
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '<b>', '</b>')} title="굵게" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 900, cursor: 'pointer' }}>
                        B
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '<h2>', '</h2>\n')} title="큰 제목 H2" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        H2 제목
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '<h3>', '</h3>\n')} title="소제목 H3" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        H3 소제목
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '1. ')} title="숫자 목록" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        1. 번호
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '• ')} title="불릿 목록" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        • 불릿
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '\n💡 ')} title="💡 팁 문단" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        💡 팁
                      </button>
                      <button type="button" onClick={e => handleInsertFormat(e, '\n⚠️ ')} title="⚠️ 주의 문단" style={{ padding: '3px 8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}>
                        ⚠️ 주의
                      </button>

                      <span style={{ borderLeft: '1px solid var(--border)', height: '16px', margin: '0 4px' }} />

                      {/* 이모티콘 퀵 버튼들 */}
                      {['💡', '⚠️', '👉', '📅', '🗓️', '📌', '✅', '💰', '📊', '⭐', '❓'].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={e => handleInsertFormat(e, ` ${emoji} `)}
                          style={{ padding: '2px 5px', fontSize: '0.9rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <textarea
                      ref={contentTextareaRef}
                      rows={13}
                      value={formData.content}
                      onChange={e => setFormData({ ...formData, content: e.target.value })}
                      placeholder="글 내용을 자유롭게 작성하거나 툴바 버튼을 이용해 서식, 이모티콘, 줄바꿈을 손쉽게 입력하세요."
                      style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: dark ? '#090d16' : '#f8fafc', color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '0.9rem', lineHeight: 1.6 }}
                      required
                    />
                  </div>
                ) : (
                  <div
                    style={{ minHeight: '280px', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border)', background: dark ? '#090d16' : '#f8fafc', overflowY: 'auto' }}
                  >
                    <div className="article-body" dangerouslySetInnerHTML={{ __html: formatSmartArticleContent(formData.content) }} />
                  </div>
                )}
              </div>

              {/* 하단 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditorModal(false)}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 카테고리 추가 / 삭제 관리 팝업 모달 --- */}
      {categoryModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setCategoryModal(false)} 
          style={{ 
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 2200, 
            background: 'rgba(0,0,0,0.75)', 
            backdropFilter: 'blur(10px)', 
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem',
            overflow: 'hidden'
          }}
        >
          <div
            className="modal-container"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '480px',
              background: dark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 35px rgba(168, 85, 247, 0.15)',
              position: 'relative',
              margin: 'auto',
              animation: 'modalCenterPop 0.2s ease forwards'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                ⚙️ 카테고리 추가 / 삭제 관리
              </h3>
              <button
                onClick={() => setCategoryModal(false)}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            {/* 신규 카테고리 추가 입력 */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem' }}>
              <input
                type="text"
                placeholder="새 카테고리명 입력 (예: 부동산, 주식)"
                value={newCategoryInput}
                onChange={e => setNewCategoryInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCategory(); } }}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                + 추가
              </button>
            </div>

            {/* 기존 카테고리 목록 & 삭제 */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '8px' }}>
                현재 등록된 카테고리 ({categories.length}개)
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                {categories.map(cat => (
                  <div
                    key={cat}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px 5px 12px',
                      borderRadius: '99px',
                      background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9',
                      border: '1px solid var(--border)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span>{cat}</span>
                    <button
                      onClick={() => handleDeleteCategory(cat)}
                      title={`${cat} 카테고리 삭제`}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 900,
                        padding: '0 2px',
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 완료 닫기 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setCategoryModal(false)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: dark ? '#334155' : '#0f172a', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
              >
                확인 / 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
