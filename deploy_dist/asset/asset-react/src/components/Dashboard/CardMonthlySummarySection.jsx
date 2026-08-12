import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

export default function CardMonthlySummarySection({ hideTable = false }) {
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
      cardName: '신한',
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

  const { totalCurrentMonthUsage, tableCurrentMonthUsage, totalNextMonthPayment } = useMemo(() => {
    let currentSum = 0;
    let tableSum = 0;
    let nextSum = 0;
    cardMonthlySummaries.forEach(item => {
      const amt = Number(item.currentMonthTotal) || 0;
      currentSum += amt;
      if (!item.isPaid) {
        tableSum += amt;
      }
      nextSum += Number(item.nextMonthExpected) || 0;
    });
    return { totalCurrentMonthUsage: currentSum, tableCurrentMonthUsage: tableSum, totalNextMonthPayment: nextSum };
  }, [cardMonthlySummaries]);

  return (
    <div className="section-card card-monthly-summary-card">
      {/* 헤더 타이틀 및 추가 버튼 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: hideTable ? '0.5rem' : '1.25rem',
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

      {/* 요약 현황 카드 (이번달 / 다음달 결제금액 요약) */}
      <div className="card-summary-grid-container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: isMobile ? '0.5rem' : '0.85rem',
        marginBottom: hideTable ? 0 : (isMobile ? '0.85rem' : '1.25rem')
      }}>
        {/* 이달 결제금액 카드 */}
        <div className="top-volume-card top-volume-card-current" style={{ padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 26, height: isMobile ? 22 : 26, borderRadius: '7px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(16, 185, 129, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--teal)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 15} height={isMobile ? 12 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
                  <line x1="2" y1="10" x2="22" y2="10"/>
                  <circle cx="6" cy="15" r="1.2" fill="currentColor"/>
                  <circle cx="9.5" cy="15" r="1.2" fill="currentColor"/>
                </svg>
              </div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                이번달
              </div>
            </div>
          </div>

          <div style={{
            fontSize: isMobile ? '1.05rem' : '1.3rem',
            fontWeight: 900,
            color: 'var(--text-primary)',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textAlign: 'right'
          }}>
            {formatKRW(totalCurrentMonthUsage)} <span style={{ fontSize: isMobile ? '0.72rem' : '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>

        {/* 다음달 결제금액 카드 */}
        <div className="top-volume-card top-volume-card-next" style={{ padding: isMobile ? '0.55rem 0.75rem' : '0.85rem 1.1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '0.25rem' : '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                width: isMobile ? 22 : 26, height: isMobile ? 22 : 26, borderRadius: '7px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f59e0b',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                flexShrink: 0
              }}>
                <svg width={isMobile ? 12 : 15} height={isMobile ? 12 : 15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                  <path d="M12 14l3 3m0-3l-3 3"/>
                </svg>
              </div>
              <div style={{ fontSize: isMobile ? '0.75rem' : '0.82rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                다음달
              </div>
            </div>
          </div>

          <div style={{
            fontSize: isMobile ? '1.05rem' : '1.3rem',
            fontWeight: 900,
            color: '#f59e0b',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            textAlign: 'right'
          }}>
            {formatKRW(totalNextMonthPayment)} <span style={{ fontSize: isMobile ? '0.72rem' : '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>
      </div>

      {!hideTable && (
        <>
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

          {/* 가로 스크롤 가능한 결제금액 상세 테이블 */}
          <div className="card-payments-table-container" style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--card-border)', WebkitOverflowScrolling: 'touch' }}>
            <table className="data-table card-payments-compact-table" style={{ width: '100%', minWidth: '635px' }}>
              <thead>
                <tr>
                  <th style={{ width: '60px', minWidth: '60px', textAlign: 'center' }}>선결제</th>
                  <th style={{ width: '80px', minWidth: '80px', textAlign: 'center' }}>카드</th>
                  <th style={{ width: '75px', minWidth: '75px', textAlign: 'center' }}>결제일</th>
                  <th style={{ textAlign: 'right', width: '115px', minWidth: '115px' }}>이달 결제액</th>
                  <th style={{ textAlign: 'right', width: '115px', minWidth: '115px' }}>다음달 결제액</th>
                  <th style={{ textAlign: 'center', width: '160px', minWidth: '140px' }}>비고</th>
                  <th style={{ width: '50px', minWidth: '50px', textAlign: 'center' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {cardMonthlySummaries.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                      <div>
                        등록된 카드별 결제금액 내역이 없습니다.<br />
                        [+ 결제금액 추가] 버튼을 클릭해 카드를 입력해보세요.
                      </div>
                    </td>
                  </tr>
                ) : (
                  cardMonthlySummaries.map((item) => (
                    <tr key={item.id} style={{ opacity: item.isPaid ? 0.55 : 1, textDecoration: item.isPaid ? 'line-through' : 'none' }}>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input
                          type="checkbox"
                          checked={!!item.isPaid}
                          onChange={(e) => handleCardSummaryChange(item.id, 'isPaid', e.target.checked)}
                          style={{
                            width: '16px',
                            height: '16px',
                            cursor: 'pointer',
                            accentColor: 'var(--teal)'
                          }}
                          title="선결제/납부완료 체크 시 부족금액에서 자동 차감됩니다."
                        />
                      </td>
                      <td>
                        {(() => {
                          const CARD_COLORS = {
                            '국민': '#eab308',
                            'KB국민': '#eab308',
                            'KB국민카드': '#eab308',
                            '국민카드': '#eab308',
                            '신한': '#3b82f6',
                            '신한카드': '#3b82f6',
                            '롯데': '#ef4444',
                            '롯데카드': '#ef4444',
                            'NH농협': '#16a34a',
                            'NH농협카드': '#16a34a',
                            '농협': '#16a34a',
                            '농협카드': '#16a34a',
                            '현대': '#06b6d4',
                            '현대카드': '#06b6d4',
                            '삼성': '#2563eb',
                            '삼성카드': '#2563eb',
                            '우리': '#0284c7',
                            '우리카드': '#0284c7',
                            '하나': '#0d9488',
                            '하나카드': '#0d9488',
                            'BC': '#dc2626',
                            'BC카드': '#dc2626',
                            '카카오': '#facc15',
                            '카카오뱅크': '#facc15'
                          };

                          // 기존 저장 데이터('삼성카드', 'KB국민카드' 등)와 일치하는 약칭 선택값 자동 정규화
                          const normalizeCardName = (raw) => {
                            if (!raw) return '신한';
                            if (raw.includes('국민')) return '국민';
                            if (raw.includes('신한')) return '신한';
                            if (raw.includes('롯데')) return '롯데';
                            if (raw.includes('농협')) return 'NH농협';
                            if (raw.includes('현대')) return '현대';
                            if (raw.includes('삼성')) return '삼성';
                            if (raw.includes('우리')) return '우리';
                            if (raw.includes('하나')) return '하나';
                            if (raw.includes('BC')) return 'BC';
                            if (raw.includes('카카오')) return '카카오';
                            return raw;
                          };

                          const currentVal = normalizeCardName(item.cardName);
                          const selectedColor = CARD_COLORS[item.cardName] || CARD_COLORS[currentVal] || 'var(--text-primary)';
                          return (
                            <select
                              value={currentVal}
                              onChange={(e) => handleCardSummaryChange(item.id, 'cardName', e.target.value)}
                              style={{
                                fontWeight: 800,
                                padding: '6px 8px',
                                borderRadius: '6px',
                                border: '1px solid var(--card-border)',
                                background: 'var(--card)',
                                color: selectedColor,
                                width: '100%',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="신한" style={{ color: '#3b82f6', fontWeight: 700 }}>신한</option>
                              <option value="국민" style={{ color: '#eab308', fontWeight: 700 }}>국민</option>
                              <option value="롯데" style={{ color: '#ef4444', fontWeight: 700 }}>롯데</option>
                              <option value="NH농협" style={{ color: '#16a34a', fontWeight: 700 }}>NH농협</option>
                              <option value="현대" style={{ color: '#06b6d4', fontWeight: 700 }}>현대</option>
                              <option value="삼성" style={{ color: '#2563eb', fontWeight: 700 }}>삼성</option>
                              <option value="우리" style={{ color: '#0284c7', fontWeight: 700 }}>우리</option>
                              <option value="하나" style={{ color: '#0d9488', fontWeight: 700 }}>하나</option>
                              <option value="BC" style={{ color: '#dc2626', fontWeight: 700 }}>BC</option>
                              <option value="카카오" style={{ color: '#facc15', fontWeight: 700 }}>카카오</option>
                              <option value="기타" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>기타</option>
                            </select>
                          );
                        })()}
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
                      <td>
                        <input
                          type="text"
                          value={item.note || ''}
                          placeholder="메모 입력"
                          onChange={(e) => handleCardSummaryChange(item.id, 'note', e.target.value)}
                          style={{ width: '100%' }}
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
              {cardMonthlySummaries.length > 0 && (() => {
                const paidCardAmount = cardMonthlySummaries.filter(s => s.isPaid).reduce((sum, s) => sum + (Number(s.currentMonthTotal) || 0), 0);
                const netRemainingCard = totalCurrentMonthUsage - paidCardAmount;
                return (
                  <tfoot>
                    <tr style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      fontWeight: 'bold',
                      borderTop: '2px solid var(--border)'
                    }}>
                      <td colSpan={3} style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 800 }}>
                        합계
                      </td>
                      <td className="amount-cell num" style={{ padding: '10px 0.7rem 10px 6px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 900 }}>
                        {formatKRW(totalCurrentMonthUsage)}
                      </td>
                      <td className="amount-cell num" style={{ padding: '10px 0.7rem 10px 6px', textAlign: 'right', color: 'var(--orange)', fontWeight: 900 }}>
                        {formatKRW(totalNextMonthPayment)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 6px', whiteSpace: 'nowrap' }}>
                        <span 
                          style={{ 
                            fontSize: '0.78rem', 
                            color: netRemainingCard > 0 ? 'var(--teal)' : 'var(--emerald, #10b981)', 
                            fontWeight: 900,
                            display: 'inline-block',
                            padding: '2px 4px'
                          }}
                          title={`총 선결제완료: ${formatKRW(paidCardAmount)}원 / 선결제 차감 잔액: ${formatKRW(netRemainingCard)}원`}
                        >
                          {formatKRW(netRemainingCard)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}></td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>
        </>
      )}
    </div>
  );
}
