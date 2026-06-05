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
    label: '할부',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    id: 'pension',
    label: '연금',
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

  return (
    <nav className="bottom-nav">
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
