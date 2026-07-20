import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

export default function CardMonthlySummarySection() {
  const { getCurrentSections, persistSections, year, month } = useApp();
  const sections = getCurrentSections();
  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  const handleAddCardSummary = () => {
    const newItem = {
      id: Date.now(),
      cardName: '현대카드',
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
    if (!confirm('카드 사용합계 항목을 삭제하시겠습니까?')) return;
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
    <div className="section-card" style={{ marginTop: '1.5rem' }}>
      <div className="section-card-header" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="section-card-title">
          <span className="section-dot" style={{ background: 'var(--orange)' }} />
          월별 카드 사용합계 및 다음달 납부예정 관리
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>
            ({year}년 {month}월)
          </span>
        </div>
        <button className="btn btn-outline btn-sm" onClick={handleAddCardSummary}>
          + 카드 사용합계 항목 추가
        </button>
      </div>

      {/* 요약 현황 카드 (이번달 총 사용합계 & 다음달 납부예정액) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        padding: '1.25rem 1.5rem',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--card-border)'
      }}>
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          borderLeft: '4px solid var(--teal)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            이번 달 카드 총 사용합계
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            {formatKRW(totalCurrentMonthUsage)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>

        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          borderLeft: '4px solid var(--orange)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            다음 달 예상 총 납부금액
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--orange)', fontFamily: 'Inter, sans-serif' }}>
            {formatKRW(totalNextMonthPayment)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', padding: '0' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>카드명</th>
              <th style={{ width: '100px' }}>결제일</th>
              <th style={{ textAlign: 'right' }}>이번 달 사용 합계 (원)</th>
              <th style={{ textAlign: 'right' }}>다음 달 납부 예정액 (원)</th>
              <th>메모 / 비고</th>
              <th style={{ width: '80px', textAlign: 'center' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {cardMonthlySummaries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  등록된 카드별 사용합계 내역이 없습니다. [+ 카드 사용합계 항목 추가] 버튼을 눌러 관리할 카드를 등록해보세요.
                </td>
              </tr>
            ) : (
              cardMonthlySummaries.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      value={item.cardName || ''}
                      placeholder="예: 현대카드 M"
                      onChange={(e) => handleCardSummaryChange(item.id, 'cardName', e.target.value)}
                      style={{ fontWeight: 600 }}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.payDate || ''}
                      placeholder="예: 14일"
                      onChange={(e) => handleCardSummaryChange(item.id, 'payDate', e.target.value)}
                      style={{ textAlign: 'center' }}
                    />
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
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--coral)' }}
                      onClick={() => handleDeleteCardSummary(item.id)}
                    >
                      삭제
                    </button>
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
