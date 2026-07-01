import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getYearList, getMonthList } from '../../utils/format';

const PAGE_TITLES = {
  dashboard: '대시보드',
  assets: '자산 · 수입',
  expenses: '부채 · 지출',
  installment: '할부 관리',
  pension: '연금 정보',
};

// Custom Dropdown for premium selection UI (prevents native dropdown look)
function CustomDropdown({ value, onChange, options, suffix = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="custom-dropdown-menu">
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

export default function TopBar({ onHamburger, onSaveSync, onDataModal, onManual, onGithubModal }) {
  const { year, setYear, month, setMonth, dark, toggleTheme, navSection, isGithubConnected } = useApp();
  const years = getYearList();
  const months = getMonthList();

  return (
    <div className="topbar">
      <div className="topbar-left">
        {/* Hamburger (mobile) */}
        <button className="topbar-btn hamburger-btn" onClick={onHamburger} id="hamburger-btn" aria-label="메뉴">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="topbar-title">{PAGE_TITLES[navSection] || '대시보드'}</h1>
      </div>

      <div className="topbar-center">
        {/* Month Selector */}
        <div className="month-selector">
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

        {/* Actions (PC Center) */}
        <div className="topbar-actions">
          {/* Save */}
          <button className="topbar-btn save-btn" onClick={onSaveSync} title="저장 및 동기화" aria-label="저장">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
          </button>

          {/* GitHub */}
          <button className={`topbar-btn nav-action-btn github-sync-btn ${isGithubConnected ? 'connected' : ''}`} onClick={onGithubModal} title="GitHub 동기화" aria-label="GitHub">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
            </svg>
          </button>

          {/* Data */}
          <button className="topbar-btn nav-action-btn" onClick={onDataModal} title="데이터 관리" aria-label="데이터">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
          </button>

          {/* Manual */}
          <button className="topbar-btn nav-action-btn" onClick={onManual} title="사용 매뉴얼" aria-label="매뉴얼">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme */}
        <button className="topbar-btn theme-btn" onClick={toggleTheme} aria-label="테마 전환">
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
      </div>
    </div>
  );
}
