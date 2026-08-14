import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getYearList, getMonthList } from '../../utils/format';

const PAGE_TITLES = {
  dashboard: '대시보드',
  assets: '자산 · 수입',
  expenses: '부채 · 지출',
  installment: '카드 내역',
  cardPayments: '현금 납부',
  pension: '내 연금',
  insurance: '내 보험',
  taxArticles: '아티클',
};

// Custom Dropdown for premium selection UI (prevents native dropdown look)
function CustomDropdown({ value, onChange, options, suffix = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const activeItem = menuRef.current.querySelector('.custom-dropdown-item.active');
      if (activeItem) {
        const containerHeight = menuRef.current.clientHeight;
        const itemTop = activeItem.offsetTop;
        const itemHeight = activeItem.clientHeight;
        menuRef.current.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
      }
    }
  }, [isOpen]);

  return (
    <div className="custom-dropdown-container" ref={dropdownRef}>
      <button 
        className={`custom-dropdown-trigger ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{value}{suffix}</span>
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            transition: 'transform 0.2s ease', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' 
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="custom-dropdown-menu" ref={menuRef}>
          {options.map(opt => {
            const optVal = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            const isActive = String(optVal) === String(value);
            return (
              <button
                key={optVal}
                className={`custom-dropdown-item${isActive ? ' active' : ''}`}
                onClick={() => {
                  onChange(String(optVal).padStart(suffix === '월' ? 2 : 0, '0'));
                  setIsOpen(false);
                }}
                role="option"
                aria-selected={isActive}
              >
                {optLabel}{suffix}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ onHamburger, onSaveSync, onDataModal, onManual, onGithubModal, onCalcModal }) {
  const { year, setYear, month, setMonth, dark, toggleTheme, navSection, setNavSection, isGithubConnected, githubSyncStatus, isSaveSuccessBlink, logout } = useApp();
  const years = getYearList();
  const months = getMonthList();

  const handleMobileLogoClick = () => {
    setNavSection('dashboard');
  };

  return (
    <div className="topbar">
      <div className="topbar-left">

        {/* Mobile Header Logo (Icon Only for compact view) */}
        <div className="mobile-header-logo" onClick={handleMobileLogoClick} title="대시보드로 이동">
          <div className="sidebar-logo-icon" style={{ width: 28, height: 28, minWidth: 28 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: '#ffffff' }}>
              <path d="M12 2L20 12L12 22L4 12Z" />
            </svg>
          </div>
        </div>

        {/* Desktop Header Title */}
        <h1 className="topbar-title desktop-only-title">{PAGE_TITLES[navSection] || '대시보드'}</h1>
      </div>

      <div className="topbar-center">
        {/* Month Selector (아티클 메뉴 시 독립 관리 안내 툴팁) */}
        <div className="month-selector" title={navSection === 'taxArticles' ? "아티클 메뉴는 연월 조건과 상관없이 전체 아티클이 조회됩니다." : "조회 연월 선택"}>
          <CustomDropdown 
            value={year} 
            onChange={setYear} 
            options={years} 
            suffix="" 
          />
          <span className="month-separator-dot">·</span>
          <CustomDropdown 
            value={parseInt(month, 10)} 
            onChange={setMonth} 
            options={months.map(m => parseInt(m, 10))} 
            suffix="월" 
          />
        </div>

        {/* Actions (Compact list for both PC & Mobile) */}
        <div className="topbar-actions">
          {/* Save */}
          <button className={`topbar-btn save-btn ${isSaveSuccessBlink ? 'save-success-blink' : ''}`} onClick={onSaveSync} title="저장 및 동기화" aria-label="저장">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>

          {/* GitHub */}
          <button 
            className={`topbar-btn github-sync-btn ${githubSyncStatus === 'error' ? 'sync-error-blink' : (isGithubConnected ? 'connected' : '')}`} 
            onClick={onGithubModal} 
            title={githubSyncStatus === 'error' ? "⚠️ GitHub 서버 저장 실패! (데이터 유실 위험 - 클릭하여 확인)" : (isGithubConnected ? "GitHub 연결됨" : "GitHub 동기화")} 
            aria-label="GitHub"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </button>

          {/* Data Management */}
          <button className="topbar-btn data-modal-btn" onClick={onDataModal} title="데이터 관리" aria-label="데이터">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </button>

          {/* Manual */}
          <button className="topbar-btn manual-btn" onClick={onManual} title="사용 매뉴얼" aria-label="매뉴얼">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="topbar-right">
        {/* Calculator (PC Mode Only) */}
        <button className="topbar-btn calc-btn desktop-only-btn" onClick={onCalcModal} title="계산기" aria-label="계산기">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="18" />
            <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
          </svg>
        </button>

        {/* Theme */}
        <button className="topbar-btn theme-btn" onClick={toggleTheme} aria-label="테마 전환" title="테마 전환">
          {dark ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {/* Logout (Mobile & PC everywhere topbar) */}
        <button 
          className="topbar-btn logout-btn" 
          onClick={() => {
            if (window.confirm('로그아웃 하시겠습니까?')) {
              logout();
            }
          }} 
          title="로그아웃" 
          aria-label="로그아웃" 
          style={{ color: 'var(--coral)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
