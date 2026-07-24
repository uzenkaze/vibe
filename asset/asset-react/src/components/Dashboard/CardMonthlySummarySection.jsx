import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

export default function CardMonthlySummarySection() {
  const { getCurrentSections, persistSections, year, month } = useApp();
  const sections = getCurrentSections();
  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleAddCardSummary = () => {
    const newItem = {
      id: Date.now(),
      cardName: '신한카드',
      payDate: '14일',
      currentMonthTotal: 0,
      nextMonthExpected: 0,
      note: ''
    };
    persistSections({
      ...sections,
      cardMonthlySummaries: [newItem, ...cardMonthlySummaries]
    });
  };

  const handleCardSummaryChange = (id, field, value) => {
    const updated = cardMonthlySummaries.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    persistSections({
      ...sections,
      cardMonthlySummaries: updated
    });
  };

  const handleDeleteCardSummary = (id) => {
    if (!confirm('해당 카드 결제금액 관리 항목을 삭제하시겠습니까?')) return;
    const updated = cardMonthlySummaries.filter(item => item.id !== id);
    persistSections({
      ...sections,
      cardMonthlySummaries: updated
    });
  };

  const { totalCurrentMonthUsage, totalNextMonthPayment } = useMemo(() => {
    let currentSum = 0;
    let nextSum = 0;
    cardMonthlySummaries.forEach(item => {
      currentSum += Number(item.currentMonthTotal) || 0;
      nextSum += Number(item.nextMonthExpected) || 0;
    });
    return { totalCurrentMonthUsage: currentSum, totalNextMonthPayment: nextSum };
  }, [cardMonthlySummaries]);

  return (
    <div className="section-card card-monthly-summary-card">
      {/* 헤더 타이틀 및 추가 버튼 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.25rem',
        padding: '0 0.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          <span style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--orange)'
          }} />
          결제금액
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px' }}>
            ({year}년 {month}월 기준)
          </span>
        </div>
      </div>

      {/* 요약 현황 카드 (Dribbble 16586448 Top Volume in Market Style) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        {/* 이달 결제금액 카드 */}
        <div className="top-volume-card top-volume-card-current">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--teal)',
                border: '1px solid rgba(6, 182, 212, 0.3)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Current Billing
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  이번달
                </div>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
            fontWeight: 900,
            color: 'var(--text-primary)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em',
            marginBottom: '0.6rem',
            lineHeight: 1.1,
            textAlign: 'right'
          }}>
            {formatKRW(totalCurrentMonthUsage)} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          {/* 하단 미니 트렌드 게이지 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
            <span>등록 카드 총 {cardMonthlySummaries.length}건</span>
            <span style={{ color: 'var(--teal)', fontWeight: 700 }}>이달 청구 확정</span>
          </div>
        </div>

        {/* 다음달 결제금액 카드 */}
        <div className="top-volume-card top-volume-card-next">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Next Expected
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  다음달
                </div>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 'clamp(1.5rem, 4vw, 1.9rem)',
            fontWeight: 900,
            color: '#f59e0b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em',
            marginBottom: '0.6rem',
            lineHeight: 1.1,
            textAlign: 'right'
          }}>
            {formatKRW(totalNextMonthPayment)} <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>

          {/* 하단 미니 트렌드 게이지 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '0.6rem', borderTop: '1px solid var(--border)' }}>
            <span>익월 예상 결제액</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>이월 예정</span>
          </div>
        </div>
      </div>

      {/* 하단 data-table 상단 바 (우측 상단 결제금액 추가 버튼) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          카드별 결제금액 상세
        </div>
        <button 
          className="btn btn-teal btn-sm" 
          onClick={handleAddCardSummary}
        >
          + 결제금액 추가
        </button>
      </div>

      {/* 인라인 입력/수정/삭제 테이블 */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '140px', textAlign: 'center' }}>카드</th>
              <th style={{ width: '75px', textAlign: 'center' }}>결제일</th>
              <th style={{ textAlign: 'right', width: '120px' }}>이달 결제액</th>
              <th style={{ textAlign: 'right', width: '120px' }}>다음달 결제액</th>
              <th className="hide-on-mobile" style={{ textAlign: 'center' }}>비고</th>
              <th style={{ width: '50px', textAlign: 'center' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {cardMonthlySummaries.length === 0 ? (
              <tr>
                <td colSpan={isMobile ? 5 : 6} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <div className="desktop-only-text">
                    등록된 카드별 결제금액 내역이 없습니다.<br />
                    [+ 결제금액 추가] 버튼을 클릭해 카드를 입력해보세요.
                  </div>
                  <div className="mobile-only-text">
                    등록된 카드별 결제금액 내역이 없습니다.
                  </div>
                </td>
              </tr>
            ) : (
              cardMonthlySummaries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <select
                      value={item.cardName || '신한카드'}
                      onChange={(e) => handleCardSummaryChange(item.id, 'cardName', e.target.value)}
                      style={{
                        fontWeight: 700,
                        padding: '6px 8px',
                        borderRadius: '6px',
                        border: '1px solid var(--card-border)',
                        background: 'var(--card)',
                        color: 'var(--text-primary)',
                        width: '100%',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="신한카드">신한카드</option>
                      <option value="KB국민카드">KB국민카드</option>
                      <option value="롯데카드">롯데카드</option>
                      <option value="NH농협카드">NH농협카드</option>
                      <option value="현대카드">현대카드</option>
                      <option value="삼성카드">삼성카드</option>
                      <option value="우리카드">우리카드</option>
                      <option value="하나카드">하나카드</option>
                      <option value="BC카드">BC카드</option>
                      <option value="카카오뱅크">카카오뱅크</option>
                      <option value="기타">기타</option>
                    </select>
                  </td>
                  <td>
                    <select
                      value={item.payDate || '14일'}
                      onChange={(e) => handleCardSummaryChange(item.id, 'payDate', e.target.value)}
                      style={{
                        fontWeight: 600,
                        padding: '6px 4px',
                        borderRadius: '6px',
                        border: '1px solid var(--card-border)',
                        background: 'var(--card)',
                        color: 'var(--text-primary)',
                        width: '100%',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      {Array.from({ length: 31 }, (_, i) => `${i + 1}일`).map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="말일">말일</option>
                    </select>
                  </td>
                  <td className="amount-cell">
                    <NumberInput
                      value={item.currentMonthTotal || 0}
                      onChange={(val) => handleCardSummaryChange(item.id, 'currentMonthTotal', val)}
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    />
                  </td>
                  <td className="amount-cell">
                    <NumberInput
                      value={item.nextMonthExpected || 0}
                      onChange={(val) => handleCardSummaryChange(item.id, 'nextMonthExpected', val)}
                      style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--orange)' }}
                    />
                  </td>
                  <td className="hide-on-mobile">
                    <input
                      type="text"
                      value={item.note || ''}
                      placeholder="메모 입력"
                      onChange={(e) => handleCardSummaryChange(item.id, 'note', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <button
                        className="table-delete-btn"
                        onClick={() => handleDeleteCardSummary(item.id)}
                        title="삭제"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
