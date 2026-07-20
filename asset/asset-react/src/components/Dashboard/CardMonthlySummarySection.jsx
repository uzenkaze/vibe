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
    <div style={{
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: '2px dashed var(--card-border)'
    }}>
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
        <button 
          className="btn btn-dark btn-sm" 
          onClick={handleAddCardSummary}
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          + 카드 결제금액 추가
        </button>
      </div>

      {/* 요약 현황 카드 (이달 결제금액 & 다음달 결제금액) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          borderLeft: '4px solid var(--teal)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            이달 결제금액
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            {formatKRW(totalCurrentMonthUsage)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>

        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--card-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          borderLeft: '4px solid var(--orange)'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
            다음달 결제금액
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--orange)', fontFamily: 'Inter, sans-serif' }}>
            {formatKRW(totalNextMonthPayment)} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
          </div>
        </div>
      </div>

      {/* 인라인 입력/수정/삭제 테이블 */}
      <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid var(--card-border)' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>카드명</th>
              <th style={{ width: '100px', textAlign: 'center' }}>결제일</th>
              <th style={{ textAlign: 'right', width: '180px' }}>이번 달 결제금액 (원)</th>
              <th style={{ textAlign: 'right', width: '180px' }}>다음 달 청구예정액 (원)</th>
              <th>메모 / 비고</th>
              <th style={{ width: '80px', textAlign: 'center' }}>작업</th>
            </tr>
          </thead>
          <tbody>
            {cardMonthlySummaries.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  등록된 카드별 결제금액 내역이 없습니다. [+ 카드 결제금액 추가] 버튼을 클릭해 카드를 입력해보세요.
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
                      style={{ color: 'var(--coral)', padding: '4px 8px' }}
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
