import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

function SummaryCard({ label, value, sub, accentColor, accentColorDim, icon, tooltipContent, compareDiff, compareRate, hasPrev, isOpen, onSelectCard, onClose }) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef(null);

  const handleMouseEnter = () => {
    if (window.innerWidth > 768) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.innerWidth > 768) {
      setIsHovered(false);
    }
  };

  const handleToggleClick = (e) => {
    e.stopPropagation();
    onSelectCard(label);
  };

  const { dark } = useApp();
  const isPositive = compareDiff > 0;
  // 지출의 경우 증가(Positive)하면 핑크(부정적), 수입/순자산의 경우 증가하면 그린(긍정적)으로 컬러매치
  const isGood = label === '총 지출' ? !isPositive : isPositive;
  const isBlue = (label === '순자산 (Net Worth)' || label === '월 손익 (P&L)') && !isPositive;

  const badgeBg = isBlue 
    ? (dark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)') 
    : (isGood ? 'rgba(0, 230, 118, 0.15)' : 'rgba(244, 63, 94, 0.15)');

  const badgeColor = isBlue 
    ? (dark ? '#818cf8' : '#4f46e5') 
    : (isGood ? 'var(--income-color)' : 'var(--expense-color)');

  const badgeShadow = isBlue 
    ? (dark ? '0 0 12px rgba(99, 102, 241, 0.3)' : '0 0 10px rgba(99, 102, 241, 0.15)') 
    : (isGood ? '0 0 12px rgba(0, 230, 118, 0.3)' : '0 0 12px rgba(244, 63, 94, 0.3)');

  const dataType = label.includes('수입') ? 'income' : label.includes('지출') ? 'expense' : label.includes('손익') ? 'balance' : 'asset';

  return (
    <div 
      className="summary-card-outer"
      data-type={dataType}
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleToggleClick}
      style={{ zIndex: isHovered || isOpen ? 100 : 1, position: 'relative', cursor: 'pointer' }}
    >
      <div className="summary-card-inner">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 34, height: 34,
              borderRadius: '10px',
              background: accentColorDim || 'rgba(59, 130, 246, 0.1)',
              border: `1px solid ${accentColor ? accentColor + '33' : 'rgba(59, 130, 246, 0.2)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: accentColor || 'var(--brand)', flexShrink: 0,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}>
              {icon}
            </div>
            <div className="summary-card-label" style={{ margin: 0, fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {label}
            </div>
          </div>

          {/* 전월대비 뱃지 칩 */}
          {hasPrev && compareDiff !== 0 && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              fontSize: '0.68rem',
              fontWeight: 800,
              color: badgeColor,
              background: badgeBg,
              padding: '3px 8px',
              borderRadius: '99px',
              border: `1px solid ${badgeColor}33`
            }}>
              <span>{isPositive ? '▲' : '▼'}</span>
              <span>{Math.abs(compareRate).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div
          className="summary-card-value num"
          style={{ color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.2rem', letterSpacing: '-0.03em', textAlign: 'right', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {formatKRW(value)}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 3, fontWeight: 700 }}>원</span>
        </div>

        {/* 증감액 세부 표시 */}
        {hasPrev && compareDiff !== 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            전월대비 {isPositive ? '+' : ''}{formatKRW(compareDiff)}원
          </div>
        )}
      </div>

      {/* PC 전용 호버 팝오버 툴팁 */}
      {isHovered && tooltipContent && (
        <div 
          className="pc-card-popover"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.82rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.4rem' }}>
            {label?.includes('수입') ? (
              <div style={{ width: 22, height: 22, borderRadius: '6px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
            ) : label?.includes('지출') ? (
              <div style={{ width: 22, height: 22, borderRadius: '6px', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.35)', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
            ) : label?.includes('손익') ? (
              <div style={{ width: 22, height: 22, borderRadius: '6px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.35)', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            ) : (
              <div style={{ width: 22, height: 22, borderRadius: '6px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.35)', flexShrink: 0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>
              </div>
            )}
            <span>{label} 세부 내역</span>
          </div>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

function SummaryModal({ label, content, onClose }) {
  if (!content) return null;

  return (
    <div 
      className="summary-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="summary-modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="summary-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, fontSize: '0.9rem' }}>
            {label?.includes('수입') ? (
              <div style={{ width: 24, height: 24, borderRadius: '7px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.35)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
            ) : label?.includes('지출') ? (
              <div style={{ width: 24, height: 24, borderRadius: '7px', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.35)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
            ) : label?.includes('손익') ? (
              <div style={{ width: 24, height: 24, borderRadius: '7px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.35)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            ) : (
              <div style={{ width: 24, height: 24, borderRadius: '7px', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(14, 165, 233, 0.2) 100%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.35)', flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/></svg>
              </div>
            )}
            <span>{label} 세부 내역</span>
          </div>
          <button 
            className="summary-modal-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="summary-modal-body">
          {content}
        </div>
      </div>
    </div>
  );
}

export default function SummaryCards() {
  const [activeCardLabel, setActiveCardLabel] = useState(null);
  const { getCurrentSections, year, month, yearData } = useApp();
  const sections = getCurrentSections();

  const prevMonthCompare = useMemo(() => {
    let prevYear = parseInt(year);
    let prevMonth = parseInt(month) - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    const prevYearStr = String(prevYear);
    const prevMonthStr = String(prevMonth).padStart(2, '0');

    // 1. 현재 데이터 집계
    const sum = arr => (arr || []).reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const sumRem = arr => (arr || []).reduce((a, r) => a + (Number(r.remAmount) || 0), 0);

    const sumC = sum(sections.cash);
    const sumNC = sum(sections['non-cash']);
    const sumR = sum(sections.retirement);
    const sumD = sumRem(sections.debt);
    const sumI = sumRem(sections.installment);

    const curIncome = sum(sections.income);
    const curAsset = sumC + sumNC + sumR;
    const curDebt = sumD + sumI;
    const curVExp = sum(sections['v-expense']);
    const curFExp = sum(sections['f-expense']);

    const currentMonthStr = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
    const curInstall = (sections.installment || [])
      .filter(i => (!i.endDate || i.endDate >= currentMonthStr) && Number(i.currentMonth) !== 0)
      .reduce((a, r) => a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0), 0);

    const curCashPayment = sum(sections.cardPayments);
    const curCardPayment = (sections.cardMonthlySummaries || []).reduce((a, r) => a + (Number(r.currentMonthTotal) || 0), 0);

    const curExpense = (curCashPayment + curCardPayment) > 0 ? (curCashPayment + curCardPayment) : (curVExp + curFExp + curInstall);
    const curNetWorth = curAsset - curDebt;
    const curPnl = curIncome - curExpense;

    // 2. 전월 데이터 집계
    const prevYd = yearData[prevYearStr] || {};
    const prevMonths = prevYd.months || {};
    const prevMonthData = prevMonths[prevMonthStr] || {};
    const prevSections = prevMonthData.sections;

    if (!prevSections) {
      return {
        hasPrev: false,
        income: { diff: 0, rate: 0 },
        expense: { diff: 0, rate: 0 },
        pnl: { diff: 0, rate: 0 },
        netWorth: { diff: 0, rate: 0 }
      };
    }

    const pC = sum(prevSections.cash);
    const pNC = sum(prevSections['non-cash']);
    const pR = sum(prevSections.retirement);
    const pD = sumRem(prevSections.debt);
    const pI = sumRem(prevSections.installment);

    const prevIncome = sum(prevSections.income);
    const prevAsset = pC + pNC + pR;
    const prevDebt = pD + pI;
    const prevVExp = sum(prevSections['v-expense']);
    const prevFExp = sum(prevSections['f-expense']);

    const prevMonthStrVal = `${String(prevYear).substring(2)}.${String(prevMonth).padStart(2, '0')}`;
    const prevInstall = (prevSections.installment || [])
      .filter(i => (!i.endDate || i.endDate >= prevMonthStrVal) && Number(i.currentMonth) !== 0)
      .reduce((a, r) => a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0), 0);

    const prevCashPayment = sum(prevSections.cardPayments);
    const prevCardPayment = (prevSections.cardMonthlySummaries || []).reduce((a, r) => a + (Number(r.currentMonthTotal) || 0), 0);

    const prevExpense = (prevCashPayment + prevCardPayment) > 0 ? (prevCashPayment + prevCardPayment) : (prevVExp + prevFExp + prevInstall);
    const prevNetWorth = prevAsset - prevDebt;
    const prevPnl = prevIncome - prevExpense;

    const calcStat = (cur, prev) => {
      const diff = cur - prev;
      const rate = prev === 0 ? (cur === 0 ? 0 : 100) : (diff / prev) * 100;
      return { diff, rate };
    };

    return {
      hasPrev: true,
      income: calcStat(curIncome, prevIncome),
      expense: calcStat(curExpense, prevExpense),
      pnl: calcStat(curPnl, prevPnl),
      netWorth: calcStat(curNetWorth, prevNetWorth)
    };
  }, [sections, year, month, yearData]);

  // 하위 계산용 변수 재지정
  const {
    sumC, sumNC, sumRE, sumR, sumD, sumI,
    totalIncome, totalAsset, totalDebt,
    totalVExp, totalFExp, totalInstallThisMonth,
    totalExpense, netWorth, monthPnl
  } = useMemo(() => {
    const sum = arr => (arr || []).reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const sumRem = arr => (arr || []).reduce((a, r) => a + (Number(r.remAmount) || 0), 0);

    const sumC = sum(sections.cash);
    const sumNC = sum(sections['non-cash']);
    const sumRE = sum(sections['real-estate']);
    const sumR = sum(sections.retirement);
    const sumD = sumRem(sections.debt);
    const sumI = sumRem(sections.installment);

    const totalIncome = sum(sections.income);
    const totalAsset = sumC + sumNC + sumRE + sumR;
    const totalDebt = sumD + sumI;
    const totalVExp = sum(sections['v-expense']);
    const totalFExp = sum(sections['f-expense']);

    const currentMonthStr = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
    const totalInstallThisMonth = (sections.installment || [])
      .filter(i => (!i.endDate || i.endDate >= currentMonthStr) && Number(i.currentMonth) !== 0)
      .reduce((a, r) => {
        return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
      }, 0);

    const curCashPayment = sum(sections.cardPayments);
    const curCardPayment = (sections.cardMonthlySummaries || []).reduce((a, r) => a + (Number(r.currentMonthTotal) || 0), 0);

    const totalExpense = (curCashPayment + curCardPayment) > 0 ? (curCashPayment + curCardPayment) : (totalVExp + totalFExp + totalInstallThisMonth);
    const netWorth = totalAsset - totalDebt;
    const monthPnl = totalIncome - totalExpense;

    return {
      sumC, sumNC, sumRE, sumR, sumD, sumI,
      totalIncome, totalAsset, totalDebt,
      totalVExp, totalFExp, totalInstallThisMonth,
      totalExpense, netWorth, monthPnl
    };
  }, [sections, year, month]);

  const cards = [
    {
      label: '월 수입',
      value: totalIncome,
      accentColor: 'var(--teal)',
      accentColorDim: 'var(--teal-dim)',
      compareDiff: prevMonthCompare.income.diff,
      compareRate: prevMonthCompare.income.rate,
      hasPrev: prevMonthCompare.hasPrev,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'center', padding: '4px' }}>분류</th>
                <th style={{ textAlign: 'center', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              {sections.income?.length > 0 ? sections.income.map(i => (
                <tr key={i.id}>
                  <td style={{ padding: '4px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.category || i.content || '-'}</td>
                  <td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(i.amount)}</td>
                </tr>
              )) : (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '4px', opacity: 0.5 }}>내역 없음</td></tr>
              )}
              <tr style={{ borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>총합</td>
                <td style={{ textAlign: 'right', padding: '4px', color: 'var(--teal)' }}>{formatKRW(totalIncome)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '총 지출',
      value: totalExpense,
      accentColor: 'var(--coral)',
      accentColorDim: 'var(--coral-dim)',
      compareDiff: prevMonthCompare.expense.diff,
      compareRate: prevMonthCompare.expense.rate,
      hasPrev: prevMonthCompare.hasPrev,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
          <polyline points="17 18 23 18 23 12" />
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'center', padding: '4px' }}>분류</th>
                <th style={{ textAlign: 'center', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>고정 지출</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalFExp)}</td></tr>
              <tr><td style={{ padding: '4px' }}>변동 지출</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalVExp)}</td></tr>
              <tr><td style={{ padding: '4px' }}>카드 할부</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalInstallThisMonth)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>총합</td>
                <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalExpense)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '월손익',
      value: monthPnl,
      accentColor: monthPnl >= 0 ? 'var(--teal)' : 'var(--coral)',
      accentColorDim: monthPnl >= 0 ? 'var(--teal-dim)' : 'var(--coral-dim)',
      compareDiff: prevMonthCompare.pnl.diff,
      compareRate: prevMonthCompare.pnl.rate,
      hasPrev: prevMonthCompare.hasPrev,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'center', padding: '4px' }}>항목</th>
                <th style={{ textAlign: 'center', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>총 수입</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--teal)' }}>{formatKRW(totalIncome)}</td></tr>
              <tr><td style={{ padding: '4px' }}>총 지출</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalExpense)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>월 손익</td>
                <td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(monthPnl)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '순자산',
      value: netWorth,
      accentColor: 'var(--gold)',
      accentColorDim: 'var(--gold-dim)',
      compareDiff: prevMonthCompare.netWorth.diff,
      compareRate: prevMonthCompare.netWorth.rate,
      hasPrev: prevMonthCompare.hasPrev,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ textAlign: 'center', padding: '4px' }}>항목</th>
                <th style={{ textAlign: 'center', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>총 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--teal)' }}>{formatKRW(totalAsset)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 현금성 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumC)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 비현금성 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumNC)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 연금·보험</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumR)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--border)' }}><td style={{ padding: '4px' }}>총 부채</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalDebt)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 일반 부채</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumD)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 할부 잔액</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumI)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>순자산</td>
                <td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(netWorth)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
  ];

  const activeCard = cards.find(c => c.label === activeCardLabel);

  return (
    <>
      <div className="summary-grid">
        {cards.map((card, i) => (
          <SummaryCard 
            key={i} 
            {...card} 
            isOpen={activeCardLabel === card.label}
            onSelectCard={(lbl) => setActiveCardLabel(lbl)}
            onClose={() => setActiveCardLabel(null)}
          />
        ))}
      </div>

      {activeCard && (
        <SummaryModal 
          label={activeCard.label}
          content={activeCard.tooltipContent}
          onClose={() => setActiveCardLabel(null)}
        />
      )}
    </>
  );
}
