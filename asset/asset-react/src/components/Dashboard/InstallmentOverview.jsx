import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

function InstallmentStatCard({ label, value, color, accent, icon, tooltipContent }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (supportsHover && window.innerWidth > 768) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className="installment-stat"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ '--stat-accent': accent, position: 'relative', zIndex: isHovered ? 100 : 1 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '8px',
          background: accent + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: accent, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div className="installment-stat-label" style={{ margin: 0 }}>{label}</div>
      </div>
      <div className="installment-stat-value num" style={{ color: color }}>
        {formatKRW(value)}
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', marginLeft: 3 }}>원</span>
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
          minWidth: '260px',
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


export default function InstallmentOverview() {
  const { getCurrentSections, year, month } = useApp();

  const sections = getCurrentSections();
  const installments = sections.installment || [];

  const currentMonthStr = useMemo(() => {
    return `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
  }, [year, month]);

  // 선택 연월 기준 활성 할부 필터링 (완납이거나 선택 월 이전에 만료된 할부 제외)
  const activeInstallments = useMemo(() => {
    return installments.filter(r => {
      if (r.repayStatus === 'full') return false;
      
      // 동적으로 종료월 계산 (데이터 오염 및 r.endDate 오연산 방어 위해 r.date 우선 연산)
      let calculatedEndDate = '';
      if (r.date && r.totalMonths) {
        const p = r.date.split(/[-./ ]/);
        if (p.length >= 2) {
          let y = parseInt(p[0]), m = parseInt(p[1]) + (parseInt(r.totalMonths) || 1);
          y += Math.floor((m - 1) / 12);
          m = (m - 1) % 12 + 1;
          calculatedEndDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
        }
      }
      if (!calculatedEndDate) {
        calculatedEndDate = r.endDate;
      }

      // 종료 월이 조회 월보다 과거인 경우 제외
      if (calculatedEndDate && calculatedEndDate < currentMonthStr) return false;
      
      // 현재 회차가 총 회차를 초과한 항목 제외
      if (Number(r.currentMonth) > Number(r.totalMonths)) return false;
      
      // 현재 회차가 총 회차와 같은 경우 중, 종료 월이 조회 월과 다른 과거 이력 복제본 제외
      if (Number(r.currentMonth) >= Number(r.totalMonths)) {
        if (calculatedEndDate && calculatedEndDate !== currentMonthStr) {
          return false;
        }
        // 날짜/종료월 정보조차 없는 비정상 데이터인데 회차가 다 찼다면 이미 끝난 건이므로 제외
        if (!calculatedEndDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [installments, currentMonthStr]);

  const { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal } = useMemo(() => {
    const totalAmount = activeInstallments.reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const thisMonthTotal = activeInstallments.reduce((a, r) => {
      return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
    }, 0);
    const nextMonthTotal = activeInstallments.reduce((a, r) => {
      const remaining = (Number(r.totalMonths) || 0) - (Number(r.currentMonth) || 0);
      if (remaining > 1) return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
      return a;
    }, 0);
    const remainTotal = activeInstallments.reduce((a, r) => a + (Number(r.remAmount) || 0), 0);
    return { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal };
  }, [activeInstallments]);

  const stats = [
    {
      label: '전체 결제 원금',
      value: totalAmount,
      color: 'var(--text-primary)',
      accent: '#5B6BF8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          현재 청구 진행 중인 모든 할부 건의 <strong>최초 결제 총 원금</strong> 합계입니다.
        </div>
      )
    },
    {
      label: '남은 잔액',
      value: remainTotal,
      color: 'var(--coral)',
      accent: '#FF6B6B',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', minWidth: '260px' }}>
          <div style={{ marginBottom: '8px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            이번 달 납부액을 제외한 다음 달부터 최종 만기까지 납부해야 할 <strong>남은 할부 잔액</strong>입니다.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>내용 (카드)</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>남은 잔액</th>
              </tr>
            </thead>
            <tbody>
              {activeInstallments?.length > 0 ? activeInstallments.map(i => (
                <tr key={i.id}>
                  <td style={{ padding: '4px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.content || '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({i.card})</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)', fontWeight: 600 }}>
                    {formatKRW(i.remAmount)}원
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '4px', opacity: 0.5 }}>내역 없음</td></tr>
              )}
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>총합</td>
                <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(remainTotal)}원</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '이번 달 납부',
      value: thisMonthTotal,
      color: 'var(--teal)',
      accent: '#2DC9A0',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          이번 달(선택 연월)에 청구되어 납부해야 하는 <strong>할부 원금 및 수수료의 총합계</strong> 금액입니다.
        </div>
      )
    },
    {
      label: '다음 달 예정',
      value: nextMonthTotal,
      color: '#5B6BF8',
      accent: '#5B6BF8',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          다음 달에 청구 예정인 <strong>할부 원금 및 수수료의 총합계</strong> 금액입니다 (잔여 회차가 2회 이상 남은 항목 기준).
        </div>
      )
    },
  ];

  return (
    <div className="section-card installment-overview-card" style={{ marginBottom: '1.5rem' }}>
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-dot" style={{ background: '#5B6BF8' }} />
          카드 할부 현황
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Card Installment Overview
          </span>
        </div>
      </div>

      <div className="installment-grid">
        {stats.map(s => (
          <InstallmentStatCard key={s.label} {...s} />
        ))}
      </div>

      {activeInstallments.length > 0 ? (
        <div className="installment-overview-table-wrapper" style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>내용</th>
                <th>카드</th>
                <th style={{ textAlign: 'right' }}>총금액</th>
                <th style={{ textAlign: 'center' }}>회차</th>
                <th style={{ textAlign: 'right' }}>월납부</th>
                <th style={{ textAlign: 'right' }}>잔액</th>
                <th style={{ textAlign: 'right' }}>종료</th>
              </tr>
            </thead>
            <tbody>
              {activeInstallments.map(r => (
                <tr key={r.id} style={{ opacity: r.currentMonth >= r.totalMonths ? 0.6 : 1 }}>
                  <td>{r.content}</td>
                  <td><span className="tag">{r.card || '—'}</span></td>
                  <td className="amount-cell num">{formatKRW(r.amount)}</td>
                  <td style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.currentMonth}/{r.totalMonths}
                  </td>
                  <td className="amount-cell num" style={{ color: 'var(--teal)' }}>
                    {formatKRW((Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0))}
                  </td>
                  <td className="amount-cell num" style={{ color: 'var(--coral)' }}>
                    {formatKRW(r.remAmount)}
                  </td>
                  <td className="amount-cell" style={{ fontSize: '0.8rem' }}>
                    {r.endDate || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          선택한 연월에 청구 중인 할부 내역이 없습니다.
        </div>
      )}
    </div>
  );
}
