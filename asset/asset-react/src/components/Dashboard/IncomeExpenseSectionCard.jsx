import { useMemo, useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

export default function IncomeExpenseSectionCard() {
  const { getCurrentSections, month } = useApp();
  const sections = getCurrentSections();

  const incomeList = sections.income || [];
  const cardPayments = sections.cardPayments || [];
  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  const paymentsTotalAmount = useMemo(() => {
    return cardPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [cardPayments]);

  const totalIncome = useMemo(() => {
    return incomeList.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [incomeList]);

  const cardTotalAmount = useMemo(() => {
    return cardMonthlySummaries.reduce((a, r) => a + (Number(r.currentMonthTotal) || 0), 0);
  }, [cardMonthlySummaries]);

  const cardBreakdown = useMemo(() => {
    return cardMonthlySummaries.map(item => ({
      card: item.cardName || '카드',
      amount: Number(item.currentMonthTotal) || 0,
      isPaid: !!item.isPaid || !!item.isPrepaid
    })).filter(item => item.amount > 0);
  }, [cardMonthlySummaries]);

  const totalOutflow = paymentsTotalAmount + cardTotalAmount;
  const difference = totalIncome - totalOutflow;
  const isShortage = difference < 0;
  const absDifference = Math.abs(difference);

  const percent = totalIncome > 0 ? (totalOutflow / totalIncome) * 100 : (totalOutflow > 0 ? 100 : 0);
  const clampedPercent = Math.min(percent, 100);

  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isIncomeHovered, setIsIncomeHovered] = useState(false);
  const [isExpenseHovered, setIsExpenseHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);

  const incomeCardRef = useRef(null);
  const expenseCardRef = useRef(null);
  const cardCardRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (incomeCardRef.current && !incomeCardRef.current.contains(e.target)) {
        setIsIncomeHovered(false);
      }
      if (expenseCardRef.current && !expenseCardRef.current.contains(e.target)) {
        setIsExpenseHovered(false);
      }
      if (cardCardRef.current && !cardCardRef.current.contains(e.target)) {
        setIsCardHovered(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const displayPayDate = (payDate) => {
    if (!payDate) return '1일';
    const str = String(payDate);
    if (str.includes('말일')) return '말일';
    if (str.startsWith('매달 ')) return str.replace('매달 ', '');
    const parts = str.split('-');
    if (parts.length === 3) return `${parseInt(parts[2], 10)}일`;
    return payDate;
  };

  const headerNode = (
    <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
      <div className="section-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{
          width: 26, height: 26, borderRadius: '7px',
          background: isShortage 
            ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(244, 63, 94, 0.2) 100%)' 
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: isShortage ? 'var(--coral)' : 'var(--teal)',
          border: `1px solid ${isShortage ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          flexShrink: 0
        }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        </div>
        수입대비지출 현황
        <span className="col-hide-mobile" style={{
          fontSize: '0.65rem', color: 'var(--text-muted)',
          fontWeight: 600, letterSpacing: '0.05em',
          textTransform: 'uppercase', marginLeft: 4,
        }}>
          Income vs Expense
        </span>
      </div>

      {/* 상태 아이콘 뱃지 */}
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 26,
          height: 26,
          borderRadius: '7px',
          background: isShortage 
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.3) 100%)' 
            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.3) 100%)',
          color: isShortage ? '#f43f5e' : '#10b981',
          border: `1px solid ${isShortage ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          boxShadow: isShortage 
            ? '0 0 8px rgba(244, 63, 94, 0.25)' 
            : '0 0 8px rgba(16, 185, 129, 0.25)',
          flexShrink: 0
        }} 
        title={isShortage ? '지출 초과' : '수입 여유'}
      >
        {isShortage ? (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v3M4.93 4.93l2.12 2.12M19.07 4.93l-2.12 2.12M12 9a6 6 0 0 0-6 6v3h12v-3a6 6 0 0 0-6-6z" fill="rgba(244, 63, 94, 0.3)"/>
            <line x1="4" y1="21" x2="20" y2="21"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(16, 185, 129, 0.2)"/>
            <polyline points="9 12 11 14 15 10"/>
          </svg>
        )}
      </div>
    </div>
  );

  const bodyContent = (
    <div className="income-expense-body" style={{ padding: isMobile ? '0.75rem 0.25rem 0' : '0.75rem 0 0' }}>

      {/* 4대 주요 지표 카드 그리드 */}
      <div className="income-expense-summary-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: isMobile ? '0.5rem' : '1rem',
        marginBottom: '1rem',
        position: 'relative',
        zIndex: 10
      }}>
        {/* 1. 수입 카드 */}
        <div 
          ref={incomeCardRef}
          className="top-volume-card top-volume-card-current"
          onMouseEnter={() => {
            if (window.innerWidth > 768) {
              setIsExpenseHovered(false);
              setIsCardHovered(false);
              setIsIncomeHovered(true);
            }
          }}
          onMouseLeave={() => {
            if (window.innerWidth > 768) setIsIncomeHovered(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
              setIsExpenseHovered(false);
              setIsCardHovered(false);
              setIsIncomeHovered(prev => !prev);
            }
          }}
          style={{
            position: 'relative',
            zIndex: isIncomeHovered ? 50 : 1,
            cursor: 'pointer',
            padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, borderRadius: isMobile ? '6px' : '8px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--teal)', border: '1px solid rgba(6, 182, 212, 0.3)', flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '0.55rem' : '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>INCOME</div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>수입</div>
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: isMobile ? '1.05rem' : 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 900, color: 'var(--text-primary)', 
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: isMobile ? '0.25rem' : '0.4rem', lineHeight: 1.1, textAlign: 'right'
          }}>
            {formatKRW(totalIncome)} <span style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: isMobile ? '0.62rem' : '0.68rem', color: 'var(--text-muted)', paddingTop: isMobile ? '0.3rem' : '0.4rem', borderTop: '1px solid var(--border)' }}>
            <span>수입 {incomeList.length}건</span>
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>상세 보기</span>
          </div>

          {/* 수입 상세 레이어 */}
          {isIncomeHovered && (
            <div 
              className="income-expense-popover"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                backgroundColor: '#ffffff', background: '#ffffff', borderRadius: '14px', padding: '0.75rem 1rem',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.25)', zIndex: 1000, minWidth: '260px', maxWidth: 'calc(100vw - 32px)', color: '#0f172a',
                backdropFilter: 'none', WebkitBackdropFilter: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>수입 내역</span>
                <button onClick={() => setIsIncomeHovered(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {incomeList.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>등록된 수입이 없습니다.</div>
                ) : (
                  incomeList.map((inc, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '1rem', width: '100%', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>
                        {(inc.category && inc.content) 
                          ? (inc.category === inc.content ? inc.category : `${inc.category} (${inc.content})`) 
                          : (inc.category || inc.content || inc.item || '미지정')
                        }
                      </span>
                      <span style={{ fontWeight: 800, color: 'var(--teal)' }}>{formatKRW(inc.amount)}원</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 2. 총 지출 카드 (현금 + 카드 합산) */}
        <div className="top-volume-card" style={{
          borderTop: '3px solid var(--coral)',
          padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, borderRadius: isMobile ? '6px' : '8px',
                background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(225, 29, 72, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--coral)', border: '1px solid rgba(244, 63, 94, 0.3)', flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '0.55rem' : '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  EXPENSE
                </div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  지출
                </div>
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: isMobile ? '1.05rem' : 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 900, color: 'var(--coral)', 
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: isMobile ? '0.25rem' : '0.4rem', lineHeight: 1.1, textAlign: 'right'
          }}>
            {formatKRW(totalOutflow)} <span style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: isMobile ? '0.62rem' : '0.68rem', color: 'var(--text-muted)', paddingTop: isMobile ? '0.3rem' : '0.4rem', borderTop: '1px solid var(--border)' }}>
            <span>현금 + 카드</span>
            <span style={{ color: 'var(--coral)', fontWeight: 700 }}>
              {isShortage ? `${formatKRW(absDifference)}원 초과` : '수입 이내'}
            </span>
          </div>
        </div>

        {/* 3. 카드 결제 카드 */}
        <div 
          ref={cardCardRef}
          className="top-volume-card"
          onMouseEnter={() => {
            if (window.innerWidth > 768) {
              setIsIncomeHovered(false);
              setIsExpenseHovered(false);
              setIsCardHovered(true);
            }
          }}
          onMouseLeave={() => {
            if (window.innerWidth > 768) setIsCardHovered(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
              setIsIncomeHovered(false);
              setIsExpenseHovered(false);
              setIsCardHovered(prev => !prev);
            }
          }}
          style={{
            position: 'relative',
            zIndex: isCardHovered ? 50 : 1,
            cursor: 'pointer',
            borderTop: '3px solid #3b82f6',
            padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, borderRadius: isMobile ? '6px' : '8px',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)', flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '0.55rem' : '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CARD</div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>카드</div>
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: isMobile ? '1.05rem' : 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#3b82f6', 
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: isMobile ? '0.25rem' : '0.4rem', lineHeight: 1.1, textAlign: 'right'
          }}>
            {formatKRW(cardTotalAmount)} <span style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: isMobile ? '0.62rem' : '0.68rem', color: 'var(--text-muted)', paddingTop: isMobile ? '0.3rem' : '0.4rem', borderTop: '1px solid var(--border)' }}>
            <span>카드 {cardBreakdown.length}건</span>
            <span style={{ color: '#3b82f6', fontWeight: 700 }}>상세 보기</span>
          </div>

          {/* 카드별 결제 내역 상세 레이어 */}
          {isCardHovered && (
            <div 
              className="income-expense-popover"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 'auto',
                backgroundColor: '#ffffff', background: '#ffffff', borderRadius: '14px', padding: '0.75rem 1rem',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.25)', zIndex: 1000, minWidth: '260px', maxWidth: 'calc(100vw - 32px)', color: '#0f172a',
                backdropFilter: 'none', WebkitBackdropFilter: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>카드별 결제 내역</span>
                <button onClick={() => setIsCardHovered(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {cardBreakdown.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>이번 달 카드 결제 내역이 없습니다.</div>
                ) : (
                  cardBreakdown.map((b, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '1rem', width: '100%', whiteSpace: 'nowrap', opacity: b.isPaid ? 0.55 : 1 }}>
                      <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: b.isPaid ? 'line-through' : 'none' }}>
                        💳 {b.card}
                        {b.isPaid && (
                          <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'var(--teal-dim)', color: 'var(--teal)', fontWeight: 800, textDecoration: 'none' }}>
                            선결제
                          </span>
                        )}
                      </span>
                      <span style={{ fontWeight: 800, color: b.isPaid ? 'var(--text-muted)' : '#3b82f6', textDecoration: b.isPaid ? 'line-through' : 'none', fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(b.amount)}원</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. 현금 지출 카드 */}
        <div 
          ref={expenseCardRef}
          className="top-volume-card"
          onMouseEnter={() => {
            if (window.innerWidth > 768) {
              setIsIncomeHovered(false);
              setIsCardHovered(false);
              setIsExpenseHovered(true);
            }
          }}
          onMouseLeave={() => {
            if (window.innerWidth > 768) setIsExpenseHovered(false);
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (window.innerWidth <= 768) {
              setIsIncomeHovered(false);
              setIsCardHovered(false);
              setIsExpenseHovered(prev => !prev);
            }
          }}
          style={{
            position: 'relative',
            zIndex: isExpenseHovered ? 50 : 1,
            cursor: 'pointer',
            borderTop: '3px solid #ff8a00',
            padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 28, height: isMobile ? 22 : 28, borderRadius: isMobile ? '6px' : '8px',
                background: 'linear-gradient(135deg, rgba(255, 138, 0, 0.2) 0%, rgba(245, 158, 11, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#ff8a00', border: '1px solid rgba(255, 138, 0, 0.3)', flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 14} height={isMobile ? 12 : 14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: isMobile ? '0.55rem' : '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CASH</div>
                <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>현금</div>
              </div>
            </div>
          </div>

          <div style={{ 
            fontSize: isMobile ? '1.05rem' : 'clamp(1.2rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#ff8a00', 
            fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: isMobile ? '0.25rem' : '0.4rem', lineHeight: 1.1, textAlign: 'right'
          }}>
            {formatKRW(paymentsTotalAmount)} <span style={{ fontSize: isMobile ? '0.7rem' : '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: isMobile ? '0.62rem' : '0.68rem', color: 'var(--text-muted)', paddingTop: isMobile ? '0.3rem' : '0.4rem', borderTop: '1px solid var(--border)' }}>
            <span>현금 {cardPayments.length}건</span>
            <span style={{ color: '#ff8a00', fontWeight: 700 }}>필요 경비 상세</span>
          </div>

          {/* 현금 지출 상세 레이어 */}
          {isExpenseHovered && (
            <div 
              className="income-expense-popover popover-right"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, left: 'auto',
                backgroundColor: '#ffffff', background: '#ffffff', borderRadius: '14px', padding: '0.75rem 1rem',
                boxShadow: '0 14px 36px rgba(15, 23, 42, 0.25)', zIndex: 1000, minWidth: '260px', maxWidth: 'calc(100vw - 32px)', color: '#0f172a',
                backdropFilter: 'none', WebkitBackdropFilter: 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800 }}>현금 지출 내역</span>
                <button onClick={() => setIsExpenseHovered(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                {cardPayments.length === 0 ? (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>등록된 현금 경비 내역이 없습니다.</div>
                ) : (
                  cardPayments.map((p, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '1rem', width: '100%', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>{p.item || '미지정'} ({displayPayDate(p.payDate)})</span>
                      <span style={{ fontWeight: 800, color: '#ff8a00' }}>{formatKRW(p.amount)}원</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 영역 구분선 (hr 라인) */}
      <hr style={{
        border: 'none',
        borderTop: '1px solid var(--border)',
        margin: '1.1rem 0 0.85rem 0',
        opacity: 0.6
      }} />

      {/* 비주얼 프로그레스 바 영역 (yellow-tick-gauge-track 계기판 스타일) */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '0.85rem 1.1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.78rem', fontWeight: 800, gap: '0.5rem' }}>
          {/* 모바일/데스크톱 문구 분기 */}
          <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
            <span className="desktop-only-text">{parseInt(month, 10)}월 수입 대비 지출 비율</span>
            <span className="mobile-only-text">{parseInt(month, 10)}월 수입대비 지출</span>
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            {/* 데스크톱 전용 159.5% 퍼센트 표기 (모바일에서는 불필요하여 완전 제외) */}
            <span className="desktop-only-text" style={{ color: isShortage ? 'var(--coral)' : '#00e676', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', monospace" }}>
              {percent.toFixed(1)}%
            </span>

            {/* 초과금액 한 줄 수치 표기 */}
            {isShortage && (
              <span style={{ 
                fontSize: '0.68rem', 
                color: '#ffffff', 
                background: 'var(--coral)', 
                padding: '3px 9px', 
                borderRadius: '99px', 
                fontWeight: 900,
                whiteSpace: 'nowrap',
                display: 'inline-block',
                boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)'
              }}>
                🚨 +{formatKRW(absDifference)}원 초과
              </span>
            )}
          </div>
        </div>

        {/* 계기판 트랙 */}
        <div className="yellow-tick-gauge-track" style={{ height: '16px' }}>
          {/* 수입 이내 지출 바 (청록/에메랄드빛) */}
          <div 
            style={{
              height: '100%',
              width: `${Math.min(clampedPercent, 100)}%`,
              borderRadius: '99px',
              background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)',
              boxShadow: '0 0 14px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
              transition: 'width 0.4s ease',
              position: 'relative',
              zIndex: 1
            }} 
          />
          {/* 초과 지출 바 (크림슨 로즈 네온빛) */}
          {isShortage && (
            <div 
              style={{
                position: 'absolute', top: 0, bottom: 0, right: 0,
                width: `${Math.min(((totalOutflow - totalIncome) / (totalOutflow || 1)) * 100, 40)}%`,
                borderRadius: '0 99px 99px 0',
                background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
                boxShadow: '0 0 16px rgba(244, 63, 94, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                zIndex: 1
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="section-card income-expense-card" style={{ marginBottom: '1.5rem', position: 'relative', zIndex: 10, overflow: 'visible', padding: isMobile ? '0.6rem 0.75rem' : '0.75rem 1rem' }}>
      {headerNode}
      {bodyContent}
    </div>
  );
}
