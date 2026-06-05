import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

function SummaryCard({ label, value, sub, subPositive, accentColor, icon, tooltipContent }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="summary-card-outer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ zIndex: isHovered ? 100 : 1, position: 'relative' }}
    >
      <div className="summary-card-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
          <div style={{
            width: 28, height: 28,
            borderRadius: '50%',
            background: accentColor + '18',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: accentColor, flexShrink: 0,
          }}>
            {icon}
          </div>
          <div className="summary-card-label" style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'none', letterSpacing: 'normal' }}>
            {label}
          </div>
        </div>
        <div
          className="summary-card-value num"
          style={{ color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 800, marginBottom: 0, letterSpacing: '-0.02em', textAlign: 'right' }}
        >
          {formatKRW(value)}
        </div>
      </div>

      {isHovered && tooltipContent && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '0.875rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          zIndex: 1000,
          minWidth: '240px',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}

export default function SummaryCards() {
  const { getCurrentSections, year, month } = useApp();
  const sections = getCurrentSections();

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

    // 이번 달 할부 납부액 (만료된 할부 제외)
    const currentMonthStr = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
    const totalInstallThisMonth = (sections.installment || [])
      .filter(i => !i.endDate || i.endDate >= currentMonthStr)
      .reduce((a, r) => {
        return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
      }, 0);

    const totalExpense = totalVExp + totalFExp + totalInstallThisMonth;
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
      subPositive: true,
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
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>분류</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>금액</th>
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
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
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
      subPositive: false,
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
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>분류</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>고정 지출</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalFExp)}</td></tr>
              <tr><td style={{ padding: '4px' }}>변동 지출</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalVExp)}</td></tr>
              <tr><td style={{ padding: '4px' }}>할부 납부</td><td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(totalInstallThisMonth)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>총합</td>
                <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalExpense)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '월 손익 (P&L)',
      value: monthPnl,
      accentColor: monthPnl >= 0 ? 'var(--teal)' : 'var(--coral)',
      subPositive: monthPnl >= 0,
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
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>항목</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>총 수입</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--teal)' }}>{formatKRW(totalIncome)}</td></tr>
              <tr><td style={{ padding: '4px' }}>총 지출</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalExpense)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>월 손익</td>
                <td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(monthPnl)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '순자산 (Net Worth)',
      value: netWorth,
      accentColor: 'var(--gold)',
      subPositive: netWorth >= 0,
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>항목</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>금액</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '4px' }}>총 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--teal)' }}>{formatKRW(totalAsset)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 현금성 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumC)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 비현금성 자산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumNC)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 부동산</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumRE)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 연금·보험</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumR)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--card-border)' }}><td style={{ padding: '4px' }}>총 부채</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(totalDebt)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 일반 부채</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumD)}</td></tr>
              <tr><td style={{ padding: '4px', color: 'var(--text-muted)' }}>&nbsp; 할부 잔액</td><td style={{ textAlign: 'right', padding: '4px', color: 'var(--text-muted)' }}>{formatKRW(sumI)}</td></tr>
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>순자산</td>
                <td style={{ textAlign: 'right', padding: '4px' }}>{formatKRW(netWorth)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
  ];

  return (
    <div className="summary-grid">
      {cards.map((card, i) => (
        <SummaryCard key={i} {...card} sub={card.value} />
      ))}
    </div>
  );
}
