import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

export default function PensionPage() {
  const { getCurrentPension, persistPension, year, month, dark } = useApp();
  
  // Active sub-tab: 'national' (국민연금) | 'retirement' (퇴직연금)
  const [activeTab, setActiveTab] = useState('national');

  const [formData, setFormData] = useState(() => {
    const p = getCurrentPension();
    return {
      beforeTax: '',
      afterTax: '',
      startDate: '',
      totalPaid: '',
      totalPeriod: '',
      retirementProducts: [],
      ...p
    };
  });

  useEffect(() => {
    const p = getCurrentPension();
    setFormData({
      beforeTax: '',
      afterTax: '',
      startDate: '',
      totalPaid: '',
      totalPeriod: '',
      retirementProducts: [],
      ...p
    });
  }, [getCurrentPension, year, month]);

  // --- 국민연금 연산 ---
  const { totalMonths, paidMonths, currentAmount, ratio } = useMemo(() => {
    const curY = Number(year);
    const curM = Number(month);
    let totalMonths = 0, paidMonths = 0, ratio = 1;

    const periodMatch = (formData.totalPeriod || '').match(/(\d{4})[.](\d{2})\s*~\s*(\d{4})[.](\d{2})/);
    if (periodMatch) {
      const startY = parseInt(periodMatch[1]), startM = parseInt(periodMatch[2]);
      const endY = parseInt(periodMatch[3]),   endM   = parseInt(periodMatch[4]);
      totalMonths = (endY - startY) * 12 + (endM - startM);
      paidMonths  = (curY - startY) * 12 + (curM - startM) + 1;
      if (paidMonths < 0) paidMonths = 0;
      if (paidMonths > totalMonths) paidMonths = totalMonths;
      ratio = totalMonths > 0 ? paidMonths / totalMonths : 0;
    }

    const targetAmount = Number(String(formData.afterTax).replace(/[^0-9]/g, '')) || 0;
    const currentAmount = Math.floor(targetAmount * ratio);
    return { totalMonths, paidMonths, currentAmount, ratio };
  }, [formData, year, month]);

  // --- 국민연금 폼 변경 ---
  const handleNationalChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    await persistPension(updated);
  };

  // --- 퇴직연금 제품 연산 ---
  const retirementProducts = formData.retirementProducts || [];

  const retirementSummary = useMemo(() => {
    let totalPrincipal = 0;
    let totalProfit = 0;

    const typeTotals = {};

    retirementProducts.forEach(prod => {
      const p = Number(prod.principal) || 0;
      const pr = Number(prod.profit) || 0;
      totalPrincipal += p;
      totalProfit += pr;

      const type = prod.type || '기타';
      typeTotals[type] = (typeTotals[type] || 0) + (p + pr);
    });

    const totalEvaluation = totalPrincipal + totalProfit;
    const overallReturnRate = totalPrincipal > 0 ? ((totalProfit / totalPrincipal) * 100) : 0;

    // 도넛 차트 비중 연산
    const segments = Object.entries(typeTotals).map(([type, evalAmt]) => {
      const pct = totalEvaluation > 0 ? Math.round((evalAmt / totalEvaluation) * 100) : 0;
      let color = '#3b82f6';
      if (type === 'ETF') color = '#8b5cf6';
      else if (type === 'TDF') color = '#ec4899';
      else if (type === '펀드') color = '#06b6d4';
      else if (type === '예금') color = '#10b981';
      else if (type === '채권') color = '#f59e0b';
      else if (type === '주식') color = '#6366f1';
      return { type, evalAmt, pct, color };
    });

    return { totalPrincipal, totalProfit, totalEvaluation, overallReturnRate, segments };
  }, [retirementProducts]);

  // --- 퇴직연금 상품 추가/수정/삭제 ---
  const handleAddRetirementProduct = async () => {
    const newProd = {
      id: Date.now() + Math.random().toString(36).substring(2, 5),
      name: '',
      type: 'ETF',
      principal: 0,
      profit: 0,
      returnRate: 0,
      quantity: 0,
      startDate: new Date().toISOString().slice(0, 10).replace(/-/g, '.')
    };
    const updatedList = [newProd, ...retirementProducts];
    const updatedForm = { ...formData, retirementProducts: updatedList };
    setFormData(updatedForm);
    await persistPension(updatedForm);
  };

  const handleUpdateRetirementProduct = async (id, field, val) => {
    const updatedList = retirementProducts.map(prod => {
      if (prod.id !== id) return prod;
      const updated = { ...prod, [field]: val };
      
      // 원금이나 수익이 변경될 때 수익률 자동 연산
      if (field === 'principal' || field === 'profit') {
        const p = field === 'principal' ? Number(val) || 0 : Number(prod.principal) || 0;
        const pr = field === 'profit' ? Number(val) || 0 : Number(prod.profit) || 0;
        updated.returnRate = p > 0 ? Number(((pr / p) * 100).toFixed(2)) : 0;
      }
      return updated;
    });

    const updatedForm = { ...formData, retirementProducts: updatedList };
    setFormData(updatedForm);
    await persistPension(updatedForm);
  };

  const handleDeleteRetirementProduct = async (id) => {
    if (!confirm('이 퇴직연금 상품 항목을 삭제하시겠습니까?')) return;
    const updatedList = retirementProducts.filter(prod => prod.id !== id);
    const updatedForm = { ...formData, retirementProducts: updatedList };
    setFormData(updatedForm);
    await persistPension(updatedForm);
  };

  const pct = (ratio * 100).toFixed(1);
  const afterTaxNum  = Number(String(formData.afterTax ).replace(/[^0-9]/g, '')) || 0;
  const beforeTaxNum = Number(String(formData.beforeTax).replace(/[^0-9]/g, '')) || 0;
  const totalPaidNum = Number(String(formData.totalPaid).replace(/[^0-9]/g, '')) || 0;

  return (
    <div style={{ marginBottom: '2rem' }}>

      {/* ── 상단 메인 타이틀 & 탭 네비게이션 ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              color: '#fff'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8A10 10 0 0 0 12 2v10z"/>
              </svg>
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                내 연금
              </h1>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                National & Corporate Retirement Pension Hub
              </div>
            </div>
          </div>
        </div>

        {/* 국민연금 / 퇴직연금 탭 스위처 */}
        <div style={{
          display: 'inline-flex',
          background: dark ? 'rgba(255, 255, 255, 0.05)' : '#e2e8f0',
          padding: '4px',
          borderRadius: '12px',
          border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #cbd5e1'
        }}>
          <button
            onClick={() => setActiveTab('national')}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'national' 
                ? (dark ? '#6366f1' : '#ffffff') 
                : 'transparent',
              color: activeTab === 'national' 
                ? (dark ? '#ffffff' : '#4f46e5') 
                : 'var(--text-muted)',
              boxShadow: activeTab === 'national' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            🏛️ 국민연금
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            style={{
              padding: '0.45rem 1.25rem',
              borderRadius: '9px',
              fontSize: '0.82rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: activeTab === 'retirement' 
                ? (dark ? '#6366f1' : '#ffffff') 
                : 'transparent',
              color: activeTab === 'retirement' 
                ? (dark ? '#ffffff' : '#4f46e5') 
                : 'var(--text-muted)',
              boxShadow: activeTab === 'retirement' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            📈 퇴직연금 (IRP/DC)
          </button>
        </div>
      </div>

      {/* =========================================================================
         TAB 1: 국민연금 관리 (National Pension)
         ========================================================================= */}
      {activeTab === 'national' && (
        <div style={{ animation: 'tabFadeIn 0.25s ease' }}>
          {/* ── Hero Highlight Card (section-card Style) ── */}
          <div className="section-card" style={{
            padding: '2rem 2rem',
            marginBottom: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '12px',
                background: 'linear-gradient(135deg, #F5A623, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(245,166,35,0.3)',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8A10 10 0 0 0 12 2v10z"/>
                </svg>
              </div>
              <div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>국민연금 수령 예상액</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>National Pension Simulation</div>
              </div>
            </div>

            {/* 메인 금액 */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                {formData.startDate ? `${formData.startDate}(65세)부터` : '연금 개시 시기(65세)부터'}&nbsp;받게 될 예상 연금액
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 700, marginBottom: '0.2rem' }}>매월</div>
              <div style={{
                color: 'var(--teal)',
                fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
                fontWeight: 900,
                letterSpacing: '-0.04em',
                lineHeight: 1.1,
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}>
                {formatKRW(currentAmount)}<span style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: 4, color: 'var(--text-secondary)' }}>원</span>
              </div>
            </div>

            {/* ── 연금 개시 시기 계기판 게이지 (Yellow Tick Gauge Style) ── */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px dashed var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} />
                  연금 개시 시기
                </span>
                <span style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>
                  {formData.startDate ? `${formData.startDate} (65세 개시)` : '2039년 03월 (65세부터 수령)'}
                </span>
              </div>

              {/* Yellow Tick Gauge 게이지 바 */}
              <div className="yellow-tick-gauge-track" style={{ height: '12px' }}>
                <div 
                  className="yellow-tick-gauge-fill-income"
                  style={{
                    width: totalMonths > 0 ? `${Math.min(ratio * 100, 100)}%` : '100%'
                  }} 
                />
              </div>

              {/* 하단 진행 달성률 서브 라벨 */}
              {totalMonths > 0 ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, marginTop: '0.5rem' }}>
                  <span>총 {totalMonths}개월 중 {paidMonths}개월 납부 완료</span>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>납부 진행률 {pct}%</span>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 600, marginTop: '0.4rem' }}>
                  <span>하단 정보 입력 시 진행률 및 수령 시기가 연동됩니다</span>
                  <span style={{ color: '#f59e0b', fontWeight: 700 }}>65세 수령</span>
                </div>
              )}
            </div>
          </div>

          {/* ── 인포 카드 그리드 ── */}
          <div className="pension-info-grid">
            {[
              { label: '세전 예상액', value: beforeTaxNum, color: '#5B6BF8', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              )},
              { label: '세후 예상액', value: afterTaxNum, color: '#2DC9A0', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              )},
              { label: '기납부 총액', value: totalPaidNum, color: '#F5A623', icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              )},
            ].map(item => (
              <div key={item.label} className="pension-info-card">
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 3, background: item.color, borderRadius: '0 0 3px 3px',
                }} />
                <div className="pension-info-card-header" style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  marginBottom: '0.5rem',
                }}>
                  <div className="pension-info-icon-wrapper" style={{
                    width: 26, height: 26, borderRadius: '7px',
                    background: item.color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: item.color,
                  }}>{item.icon}</div>
                  <div className="pension-info-label" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                    {item.label}
                  </div>
                </div>
                <div className="pension-info-value num" style={{ color: item.color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {formatKRW(item.value)}<span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>원</span>
                </div>
              </div>
            ))}
          </div>

          {/* ── 입력 폼 ── */}
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid var(--card-border)',
              display: 'flex', alignItems: 'center', gap: '0.625rem',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '9px',
                background: 'linear-gradient(135deg, #F5A623, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>국민연금 정보 입력</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>정보를 입력하면 예상 수령액이 자동 계산됩니다</div>
              </div>
            </div>

            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* 납입 기간 */}
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--teal)' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  납입 기간
                </label>
                <input
                  style={{
                    width: '100%', background: 'var(--card)', border: '1.5px solid rgba(45, 201, 160, 0.2)',
                    color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                    padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                    fontWeight: 600, outline: 'none', transition: 'all 0.2s ease',
                    boxSizing: 'border-box', textAlign: 'center',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,201,160,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(45, 201, 160, 0.2)'; e.target.style.boxShadow = 'none'; }}
                  placeholder="예: 2024.01 ~ 2034.12"
                  value={formData.totalPeriod}
                  onChange={e => handleNationalChange('totalPeriod', e.target.value)}
                />
              </div>

              {/* 세전/세후 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { key: 'beforeTax', label: '세전 예상 연금액', color: '#5B6BF8', placeholder: '예: 1000000' },
                  { key: 'afterTax',  label: '세후 예상 연금액', color: '#2DC9A0', placeholder: '예: 850000'  },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block', flexShrink: 0 }} />
                      {f.label}
                    </label>
                    <NumberInput
                      style={{
                        width: '100%', background: 'var(--card)', border: `1.5px solid ${f.color}30`,
                        color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                        padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                        fontWeight: 600, outline: 'none', textAlign: 'right',
                      }}
                      placeholder={f.placeholder}
                      value={formData[f.key]}
                      onChange={val => handleNationalChange(f.key, val)}
                    />
                  </div>
                ))}
              </div>

              {/* 기납부/개시 시기 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                    </svg>
                    기납부 총액 (원)
                  </label>
                  <NumberInput
                    style={{
                      width: '100%', background: 'var(--card)', border: '1.5px solid rgba(245,166,35,0.2)',
                      color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                      padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                      fontWeight: 600, outline: 'none', textAlign: 'right',
                    }}
                    placeholder="예: 5000000"
                    value={formData.totalPaid}
                    onChange={val => handleNationalChange('totalPaid', val)}
                  />
                </div>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    연금 개시 시기
                  </label>
                  <input
                    style={{
                      width: '100%', background: 'var(--card)', border: '1.5px solid var(--card-border)',
                      color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                      padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                      fontWeight: 600, outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,201,160,0.15)'; }}
                    onBlur={e => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                    placeholder="예: 2039년 03월"
                    value={formData.startDate}
                    onChange={e => handleNationalChange('startDate', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
         TAB 2: 퇴직연금 (IRP / DC) 관리 (Corporate Retirement Pension)
         ========================================================================= */}
      {activeTab === 'retirement' && (
        <div style={{ animation: 'tabFadeIn 0.25s ease' }}>

          {/* ── 비주얼 수익률 & 평가 현황 종합 차트 카드 ── */}
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* 요약 KPI 카드 */}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                  퇴직연금 총 평가 자산
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {formatKRW(retirementSummary.totalEvaluation)} <span style={{ fontSize: '1rem', fontWeight: 700 }}>원</span>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>납입 원금</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {formatKRW(retirementSummary.totalPrincipal)}원
                    </span>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>평가 손익</span>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: retirementSummary.totalProfit >= 0 ? '#10b981' : '#ef4444',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      {retirementSummary.totalProfit >= 0 ? '+' : ''}{formatKRW(retirementSummary.totalProfit)}원
                    </span>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>전체 수익률</span>
                    <span style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: retirementSummary.overallReturnRate >= 0 ? '#10b981' : '#ef4444',
                      fontFamily: "'Plus Jakarta Sans', sans-serif"
                    }}>
                      {retirementSummary.overallReturnRate >= 0 ? '+' : ''}{retirementSummary.overallReturnRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 상품 유형 분포 비중 바 & 범례 */}
              <div style={{ background: dark ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '1.25rem', borderRadius: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                  상품 유형별 포트폴리오 비중
                </div>
                
                {/* 프로그레스 바 */}
                <div style={{ height: '12px', background: dark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: 99, overflow: 'hidden', display: 'flex', marginBottom: '0.85rem' }}>
                  {retirementSummary.segments.length === 0 ? (
                    <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
                  ) : (
                    retirementSummary.segments.map((seg, idx) => (
                      <div key={idx} style={{ width: `${seg.pct}%`, height: '100%', background: seg.color }} title={`${seg.type}: ${seg.pct}%`} />
                    ))
                  )}
                </div>

                {/* 범례 */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem' }}>
                  {retirementSummary.segments.length === 0 ? (
                    <span style={{ color: 'var(--text-muted)' }}>등록된 상품이 없습니다.</span>
                  ) : (
                    retirementSummary.segments.map((seg, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color }} />
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{seg.type}</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{seg.pct}%</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ── 퇴직연금 투자 상품 관리 테이블 ── */}
          <div className="section-card" style={{ padding: '0', overflow: 'hidden' }}>
            <div className="section-card-header" style={{ padding: '1.25rem 1.5rem' }}>
              <div className="section-card-title">
                <span className="section-dot" style={{ background: '#8b5cf6' }} />
                퇴직연금 보유 상품 목록 ({retirementProducts.length}개)
              </div>
              <button className="btn btn-dark" onClick={handleAddRetirementProduct} style={{ fontSize: '0.8rem' }}>
                + 상품 추가
              </button>
            </div>

            <div className="card-payments-table-container" style={{ padding: '0 0.25rem 1.25rem', overflowX: 'auto' }}>
              <table className="data-table card-payments-compact-table" style={{ width: '100%', minWidth: '320px' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 120, textAlign: 'left', padding: '0.6rem 0.4rem' }}>상품명</th>
                    <th style={{ width: 68, textAlign: 'center', padding: '0.6rem 0.2rem' }}>유형</th>
                    <th style={{ width: 85, textAlign: 'right', padding: '0.6rem 0.3rem' }}>납입원금</th>
                    <th style={{ width: 80, textAlign: 'right', padding: '0.6rem 0.3rem' }}>평가손익</th>
                    <th style={{ width: 65, textAlign: 'right', padding: '0.6rem 0.2rem' }}>수익률</th>
                    <th className="pension-hide-mobile" style={{ width: 55, textAlign: 'right', padding: '0.6rem 0.2rem' }}>보유좌수</th>
                    <th className="pension-hide-mobile" style={{ width: 68, textAlign: 'center', padding: '0.6rem 0.2rem' }}>신규일</th>
                    <th style={{ width: 40, textAlign: 'center', padding: '0.6rem 0.2rem' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {retirementProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.5, fontSize: '0.85rem' }}>
                        등록된 퇴직연금 상품이 없습니다. 버튼을 눌러 추가해 보세요.
                      </td>
                    </tr>
                  ) : (
                    retirementProducts.map((prod) => {
                      const isPositive = (Number(prod.profit) || 0) >= 0;
                      return (
                        <tr key={prod.id}>
                          {/* 상품명 */}
                          <td style={{ minWidth: 120, padding: '0.3rem 0.3rem' }}>
                            <input
                              type="text"
                              value={prod.name || ''}
                              placeholder="상품명 (예: KODEX S&P500)"
                              onChange={(e) => handleUpdateRetirementProduct(prod.id, 'name', e.target.value)}
                              style={{ fontWeight: 800, width: '100%', padding: '0.25rem 0.3rem', fontSize: '0.8rem' }}
                            />
                          </td>

                          {/* 유형 */}
                          <td style={{ width: 68, padding: '0.3rem 0.1rem' }}>
                            <select
                              value={prod.type || 'ETF'}
                              onChange={(e) => handleUpdateRetirementProduct(prod.id, 'type', e.target.value)}
                              style={{ textAlign: 'center', fontWeight: 700, padding: '0.2rem 0.1rem', fontSize: '0.75rem', width: '100%' }}
                            >
                              <option value="ETF">ETF</option>
                              <option value="TDF">TDF</option>
                              <option value="펀드">펀드</option>
                              <option value="예금">예금</option>
                              <option value="채권">채권</option>
                              <option value="주식">주식</option>
                              <option value="기타">기타</option>
                            </select>
                          </td>

                          {/* 납입원금 */}
                          <td className="amount-cell" style={{ width: 85, padding: '0.3rem 0.2rem' }}>
                            <NumberInput
                              value={prod.principal || 0}
                              onChange={(val) => handleUpdateRetirementProduct(prod.id, 'principal', val)}
                              style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.8rem', padding: '0.25rem 0.2rem' }}
                            />
                          </td>

                          {/* 평가손익 */}
                          <td className="amount-cell" style={{ width: 80, padding: '0.3rem 0.2rem' }}>
                            <NumberInput
                              value={prod.profit || 0}
                              onChange={(val) => handleUpdateRetirementProduct(prod.id, 'profit', val)}
                              style={{
                                textAlign: 'right',
                                fontWeight: 800,
                                fontSize: '0.8rem',
                                padding: '0.25rem 0.2rem',
                                color: isPositive ? '#10b981' : '#ef4444'
                              }}
                            />
                          </td>

                          {/* 수익률 (%) */}
                          <td style={{ width: 65, textAlign: 'right', fontWeight: 800, fontSize: '0.75rem', color: isPositive ? '#10b981' : '#ef4444', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: '0.3rem 0.2rem' }}>
                            {isPositive ? '+' : ''}{(Number(prod.returnRate) || 0).toFixed(1)}%
                          </td>

                          {/* 보유좌수 (모바일 숨김) */}
                          <td className="pension-hide-mobile" style={{ width: 55, textAlign: 'right', padding: '0.3rem 0.2rem' }}>
                            <NumberInput
                              value={prod.quantity || 0}
                              onChange={(val) => handleUpdateRetirementProduct(prod.id, 'quantity', val)}
                              style={{ textAlign: 'right', fontWeight: 600, fontSize: '0.78rem', padding: '0.25rem 0.2rem' }}
                            />
                          </td>

                          {/* 신규일 (모바일 숨김) */}
                          <td className="pension-hide-mobile" style={{ width: 68, padding: '0.3rem 0.1rem' }}>
                            <input
                              type="text"
                              value={prod.startDate || ''}
                              placeholder="2026.01.01"
                              onChange={(e) => handleUpdateRetirementProduct(prod.id, 'startDate', e.target.value)}
                              style={{ textAlign: 'center', fontSize: '0.72rem', padding: '0.3rem 0.2rem' }}
                            />
                          </td>

                          {/* 삭제 */}
                          <td style={{ width: 45, textAlign: 'center', padding: '0.35rem 0.2rem' }}>
                            <button
                              className="btn btn-sm"
                              onClick={() => handleDeleteRetirementProduct(prod.id)}
                              style={{ padding: '2px 4px', fontSize: '0.68rem', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', background: 'transparent' }}
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
