import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { loadData, emptyMonthSections } from '../../utils/storage';

// Custom Dropdown for premium selection UI (matching the TopBar dropdown style)
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
        style={{
          border: '1.5px solid var(--card-border)',
          background: 'var(--card)',
          borderRadius: 12,
          padding: '0.4rem 0.8rem',
          height: '42px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          outline: 'none'
        }}
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
        <div className="custom-dropdown-menu" style={{ zIndex: 2100, maxHeight: 200, overflowY: 'auto' }}>
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


export default function DataModal({ onClose }) {
  const {
    year, month, yearData, showToast, loadYearData, persistYearData,
    persistSections, setYear, setMonth, accounts, saveAccountsAndUpdate
  } = useApp();

  // Selected year and month inside Monthly Operations section
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [importText, setImportText] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // Years options generation (2024 to currentYear+2)
  const currentYearNum = new Date().getFullYear();
  const startYear = 2024;
  const endYear = Math.max(startYear, currentYearNum + 2, parseInt(year));
  const yearsArray = [];
  for (let y = startYear; y <= endYear; y++) {
    yearsArray.push(y);
  }

  // Months options generation (01 to 12)
  const monthsArray = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  // --- 1. Backup & Export ---
  const handleDownload = () => {
    const backupData = JSON.parse(JSON.stringify(yearData[selectedYear] || { year: String(selectedYear), months: {} }));
    
    // Encrypt and append accountsData (Option A)
    if (accounts && accounts.length > 0) {
      try {
        backupData._secureAccounts = btoa(encodeURIComponent(JSON.stringify(accounts)));
      } catch (e) {
        console.error("Encryption failed", e);
      }
    }

    const json = JSON.stringify(backupData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assetData_${selectedYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터 파일을 성공적으로 내보냈습니다.', 'success');
  };

  const handleCopyClipboard = () => {
    const backupData = JSON.parse(JSON.stringify(yearData[selectedYear] || { year: String(selectedYear), months: {} }));

    if (accounts && accounts.length > 0) {
      try {
        backupData._secureAccounts = btoa(encodeURIComponent(JSON.stringify(accounts)));
      } catch (e) {
        console.error("Encryption failed", e);
      }
    }

    const json = JSON.stringify(backupData, null, 2);
    navigator.clipboard.writeText(json)
      .then(() => {
        alert('연도 데이터가 클립보드에 복사되었습니다. (JSON 형식)');
      })
      .catch(err => {
        alert('복사 실패: ' + err);
      });
  };

  // --- 2. Monthly Operations ---
  const handleCopyMonthToNext = async () => {
    const targetMonthStr = String(selectedMonth).padStart(2, '0');
    let targetYearData = null;

    try {
      targetYearData = await loadData(selectedYear);
    } catch (e) {
      alert('보안 암호화 상태입니다. 먼저 로그인해주세요.');
      return;
    }

    if (!targetYearData || !targetYearData.months || !targetYearData.months[targetMonthStr]) {
      alert(`${selectedYear}년 ${parseInt(selectedMonth)}월 데이터가 없습니다.`);
      return;
    }

    // Calculate next month
    let nextY = parseInt(selectedYear);
    let nextM = parseInt(selectedMonth) + 1;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    }
    const nextMonthStr = String(nextM).padStart(2, '0');

    let nextYearData = null;
    try {
      nextYearData = await loadData(nextY);
    } catch (e) {}

    if (!nextYearData) {
      nextYearData = { year: String(nextY), months: {} };
    }

    if (nextYearData.months && nextYearData.months[nextMonthStr]) {
      if (!window.confirm(`${nextY}년 ${nextM}월에 이미 데이터가 있습니다. ${selectedYear}년 ${parseInt(selectedMonth)}월 데이터로 덮어쓰시겠습니까?`)) {
        return;
      }
    }

    if (!nextYearData.months) nextYearData.months = {};
    nextYearData.months[nextMonthStr] = JSON.parse(JSON.stringify(targetYearData.months[targetMonthStr]));

    const res = await persistYearData(nextY, nextYearData);
    if (res.success) {
      alert(`${selectedYear}년 ${parseInt(selectedMonth)}월 데이터를 ${nextY}년 ${nextM}월로 성공적으로 복사했습니다.`);
      // If we copied into the currently viewed year, reload the current year data state
      if (String(nextY) === String(year)) {
        await loadYearData(year);
      }
    } else {
      alert('데이터 복사 실패: ' + (res.error?.message || '알 수 없는 오류'));
    }
  };

  const handleDeleteMonthData = async () => {
    const targetMonthStr = String(selectedMonth).padStart(2, '0');

    if (!window.confirm(`정말 ${selectedYear}년 ${parseInt(selectedMonth)}월 데이터를 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    let targetYearData = null;
    try {
      targetYearData = await loadData(selectedYear);
    } catch (e) {
      alert('보안 암호화 상태입니다. 먼저 로그인해주세요.');
      return;
    }

    if (targetYearData && targetYearData.months && targetYearData.months[targetMonthStr]) {
      delete targetYearData.months[targetMonthStr];
      const res = await persistYearData(selectedYear, targetYearData);
      if (!res.success) {
        alert('데이터 삭제 실패: ' + (res.error?.message || '알 수 없는 오류'));
        return;
      }
    }

    // Legacy file compatibility cleanup
    localStorage.removeItem(`assetData_${selectedYear}-${targetMonthStr}`);

    // If active month/year matches deleted target, empty current view state
    if (String(selectedYear) === String(year) && String(targetMonthStr) === String(month)) {
      await persistSections(emptyMonthSections());
      await loadYearData(selectedYear);
    }

    alert(`${selectedYear}년 ${parseInt(selectedMonth)}월 데이터가 완전히 삭제되었습니다.`);
    onClose();
  };

  // --- 3. Import Data ---
  const handleImport = async () => {
    const jsonText = importText.trim();
    if (!jsonText) {
      alert('가져올 JSON 데이터를 입력해주세요.');
      return;
    }

    if (!window.confirm('현재 연도의 데이터를 덮어쓰고 새로운 데이터를 가져오시겠습니까?\n(기존 데이터는 삭제됩니다.)')) {
      return;
    }

    try {
      const uploaded = JSON.parse(jsonText);

      // Simple structures validation
      if (!uploaded.months && !uploaded.sections) {
        throw new Error('올바른 데이터 형식이 아닙니다. (months 또는 sections 필드 필요)');
      }

      // Restore accounts
      if (uploaded._secureAccounts) {
        try {
          const accs = JSON.parse(decodeURIComponent(atob(uploaded._secureAccounts)));
          if (Array.isArray(accs)) {
            saveAccountsAndUpdate(accs);
          }
        } catch (e) {
          console.warn("계정 복원 실패", e);
        }
      }

      let targetYear = "";
      let targetMonth = "";
      let updatedYearData = null;

      if (uploaded.months) {
        targetYear = String(uploaded.year || year);
        const months = Object.keys(uploaded.months).sort();
        targetMonth = months.length > 0 ? String(months[months.length - 1]).padStart(2, '0') : "01";
        updatedYearData = uploaded;
      } else {
        const tempDate = new Date();
        targetYear = String(uploaded.baseDate ? uploaded.baseDate.split('-')[0] : year);
        targetMonth = String(uploaded.baseDate ? uploaded.baseDate.split('-')[1] : (tempDate.getMonth() + 1)).padStart(2, '0');
        
        let existingData = null;
        try {
          existingData = await loadData(targetYear);
        } catch (e) {}

        updatedYearData = existingData || { year: targetYear, months: {} };
        if (!updatedYearData.months) updatedYearData.months = {};
        updatedYearData.months[targetMonth] = mergeState(uploaded);
      }

      // Save full year data structure
      const res = await persistYearData(targetYear, updatedYearData);
      if (!res.success) {
        throw new Error(res.error?.message || '저장 실패');
      }

      // UI Sync
      setYear(targetYear);
      setMonth(targetMonth);
      await loadYearData(targetYear);

      alert(`${targetYear}년 데이터를 성공적으로 가져왔습니다.`);
      onClose();
    } catch (err) {
      alert("가져오기 실패: " + err.message);
    }
  };

  const mergeState = (uploaded) => {
    const base = {
      sections: emptyMonthSections(),
      pension: { beforeTax: '', afterTax: '', startDate: '', totalPaid: '', totalPeriod: '' }
    };
    if (!uploaded || typeof uploaded !== 'object') return base;

    let src = uploaded.sections || uploaded;
    for (let k in base.sections) {
      if (Array.isArray(src[k])) {
        base.sections[k] = src[k].map(item => ({
          ...item,
          id: item.id || (Date.now() + Math.random()),
          details: Array.isArray(item.details) ? item.details : [],
          amount: parseFloat(String(item.amount || '0').replace(/,/g, '')) || 0,
          remAmount: parseFloat(String(item.remAmount || '0').replace(/,/g, '')) || 0
        }));
      }
    }

    if (uploaded.pension) {
      base.pension = { ...base.pension, ...uploaded.pension };
    }
    return base;
  };

  // Drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal-box data-modal-box" 
        style={{ 
          maxWidth: 560, 
          width: '92%',
          padding: 0, 
          overflow: 'hidden', 
          borderRadius: '24px',
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          boxShadow: 'var(--shadow-lg)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="data-modal-header" style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34,
              height: 34,
              background: 'var(--teal-dim)',
              color: 'var(--teal)',
              borderRadius: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>⚙️</div>
            <span className="data-modal-title" style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
              데이터 관리 (백업 및 복구)
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              width: 34,
              height: 34,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'background-color 0.2s'
            }}
            className="close-hover-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="data-modal-body" style={{ padding: '0 1.5rem 1.5rem', maxHeight: '65vh', overflowY: 'auto' }}>
          
          {/* Section: Backup & Export */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '0.6rem'
            }}>
              Backup & Export
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button 
                onClick={handleDownload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 0.5rem',
                  borderRadius: 14,
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                className="btn-backup-item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6, color: 'var(--teal)' }}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                파일 다운로드
              </button>
              <button 
                onClick={handleCopyClipboard}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 0.5rem',
                  borderRadius: 14,
                  border: '1px solid var(--input-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--text-primary)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                className="btn-backup-item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6, color: 'var(--teal)' }}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                JSON 복사
              </button>
            </div>
          </div>

          {/* Section: Monthly Operations */}
          <div style={{
            marginBottom: '1.5rem',
            padding: '1.1rem 1.25rem',
            background: 'var(--input-bg)',
            borderRadius: 18,
            border: '1.5px dashed var(--teal-dim)'
          }}>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '0.75rem'
            }}>
              Monthly Operations
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'center' }}>
              <CustomDropdown 
                value={selectedYear} 
                onChange={setSelectedYear} 
                options={yearsArray} 
                suffix="년" 
              />
              <span style={{ color: 'var(--text-muted)', fontWeight: 400, userSelect: 'none' }}>·</span>
              <CustomDropdown 
                value={parseInt(selectedMonth, 10)} 
                onChange={setSelectedMonth} 
                options={monthsArray.map(m => parseInt(m, 10))} 
                suffix="월" 
              />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button 
                onClick={handleCopyMonthToNext}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.8rem',
                  borderRadius: 12,
                  border: 'none',
                  background: 'var(--teal)',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
                className="btn-teal-hover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
                선택 월 데이터를 다음 달로 복사
              </button>
              <button 
                onClick={handleDeleteMonthData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.8rem',
                  borderRadius: 12,
                  border: '1.5px solid var(--coral)',
                  background: 'var(--coral-dim)',
                  color: 'var(--coral)',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  transition: 'background-color 0.2s, color 0.2s'
                }}
                className="btn-danger-hover"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: 6 }}>
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </svg>
                선택 월 데이터 전체 삭제
              </button>
            </div>
          </div>

          {/* Section: Import Data */}
          <div>
            <h4 style={{
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-secondary)',
              marginBottom: '0.6rem'
            }}>
              Import Data
            </h4>
            
            {/* File Drag Box */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? 'var(--teal)' : 'var(--text-muted)'}`,
                borderRadius: 14,
                padding: '1rem 0.75rem',
                textAlign: 'center',
                cursor: 'pointer',
                marginBottom: '0.75rem',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                background: isDragging ? 'var(--teal-dim)' : 'var(--input-bg)',
                transition: 'border-color 0.2s, background-color 0.2s'
              }}
            >
              <input 
                type="file" 
                accept=".json" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                id="modal-file-input" 
              />
              <label htmlFor="modal-file-input" style={{ cursor: 'pointer', display: 'block', fontWeight: 'bold' }}>
                📂 JSON 파일 드래그 또는 선택
              </label>
            </div>

            <textarea 
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="JSON 데이터를 여기에 붙여넣거나 파일을 선택하세요..."
              style={{
                width: '100%',
                height: 90,
                padding: '0.75rem',
                borderRadius: 12,
                border: '1.5px solid var(--input-border)',
                background: 'var(--card)',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                resize: 'vertical',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

        </div>

        {/* Footer */}
        <div className="data-modal-footer" style={{
          padding: '1rem 1.5rem',
          background: 'var(--bg)',
          display: 'flex',
          justify: 'flex-end',
          gap: '0.5rem',
          borderTop: '1px solid var(--card-border)'
        }}>
          <button 
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 10,
              border: '1.5px solid var(--card-border)',
              background: 'var(--card)',
              color: 'var(--text-primary)',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            className="btn-cancel"
          >
            닫기
          </button>
          <button 
            onClick={handleImport}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: 10,
              border: 'none',
              background: 'var(--teal)',
              color: '#FFFFFF',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            className="btn-apply"
          >
            가져오기 적용
          </button>
        </div>

      </div>
    </div>
  );
}
