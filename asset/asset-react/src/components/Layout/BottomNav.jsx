import { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';

const BOTTOM_NAV_ITEMS = [
  {
    id: 'dashboard',
    label: '홈',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: 'assets',
    label: '자산',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6h-4z" />
      </svg>
    ),
  },
  {
    id: 'expenses',
    label: '지출',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
        <path d="M16 8H8M16 12H8M13 16H8" />
      </svg>
    ),
  },
  {
    id: 'installment',
    label: '카드 내역',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'cardPayments',
    label: '현금납부',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </svg>
    ),
  },
  {
    id: 'pension',
    label: '내 연금',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 10h8M8 13h8M12 7v9" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const { navSection, setNavSection } = useApp();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      // 상단 최상단 부근(40px 이내)일 때는 항상 표시
      if (currentScrollY < 40) {
        setVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // 위로 스크롤(currentScrollY가 감소) → 표시
      // 아래로 스크롤(currentScrollY가 증가) → 숨김
      if (currentScrollY < lastScrollY.current - 8) {
        setVisible(true);  // 위로 올리면 표시
      } else if (currentScrollY > lastScrollY.current + 8) {
        setVisible(false); // 아래로 내리면 숨김
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`bottom-nav ${visible ? '' : 'hide-scroll'}`}>
      {BOTTOM_NAV_ITEMS.map(item => (
        <button
          key={item.id}
          className={`bottom-nav-item${navSection === item.id ? ' active' : ''}`}
          onClick={() => setNavSection(item.id)}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
