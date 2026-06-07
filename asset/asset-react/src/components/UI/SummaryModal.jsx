import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

const SECTION_LABELS = {
  cash: '현금성 자산',
  'non-cash': '비현금성 자산',
  income: '수입',
  'real-estate': '부동산',
  retirement: '연금·보험',
  debt: '부채',
  'v-expense': '변동 지출',
  'f-expense': '고정 지출',
  installment: '할부',
};

function SummaryTable({ rows, totalLabel, totalValue, color }) {
  return (
    <table className="summary-table">
      <thead>
        <tr>
          <th style={{ width: '30%' }}>분류</th>
          <th style={{ width: '45%' }}>내용</th>
          <th style={{ textAlign: 'right', width: '25%' }}>금액</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={{ color: 'var(--text-secondary)' }}>{r.category || '—'}</td>
            <td>{r.content || '—'}</td>
            <td style={{ textAlign: 'right', fontWeight: 700 }} className="num">
              {formatKRW(r.amount)}
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '2px' }}>원</span>
            </td>
          </tr>
        ))}
        <tr className="total-row">
          <td colSpan={2} style={{ fontWeight: 800 }}>{totalLabel}</td>
          <td style={{ textAlign: 'right', color, fontWeight: 900 }} className="num">
            {formatKRW(totalValue)}
            <span style={{ fontSize: '0.8rem', fontWeight: 700, marginLeft: '2px' }}>원</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function SummaryModal({ type, onClose }) {
  const { getCurrentSections } = useApp();
  const sections = getCurrentSections();

  const data = useMemo(() => {
    if (type === 'assets') {
      const groups = [
        { key: 'cash', label: '현금성 자산', color: 'var(--teal)', span2: false },
        { key: 'non-cash', label: '비현금성 자산', color: '#5B6BF8', span2: false },
        { key: 'real-estate', label: '부동산', color: 'var(--gold)', span2: false },
        { key: 'retirement', label: '연금·보험', color: '#a78bfa', span2: false },
        { key: 'income', label: '수입', color: '#2DC9A0', span2: true }, // 마지막 수입을 span2로 넓게 배치
      ];
      let grandTotal = 0;
      const processedGroups = groups.map(g => {
        const rows = sections[g.key] || [];
        const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
        grandTotal += (g.key === 'income' ? 0 : total); // 수입은 순자산 합계에서 제외
        return { ...g, rows, total };
      });
      return { groups: processedGroups, grandTotal, grandLabel: '총 자산 (순자산 기준)', type: 'assets' };
    } else {
      const groups = [
        { key: 'debt', label: '부채 (잔여금)', color: 'var(--coral)', useRem: true, span2: true }, // 부채 테이블을 span2로 넓게 배치
        { key: 'v-expense', label: '변동 지출', color: 'var(--gold)', span2: false },
        { key: 'f-expense', label: '고정 지출', color: '#5B6BF8', span2: false },
      ];
      let grandTotal = 0;
      const processedGroups = groups.map(g => {
        const rows = sections[g.key] || [];
        const total = g.useRem
          ? rows.reduce((a, r) => a + (Number(r.remAmount) || 0), 0)
          : rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
        grandTotal += total;
        return { ...g, rows, total };
      });
      return { groups: processedGroups, grandTotal, grandLabel: '총 부채 + 지출', type: 'expenses' };
    }
  }, [sections, type]);

  // 자산/지출 유형별 대합계 그라데이션 및 섀도우 정의
  const grandTotalBg = type === 'assets'
    ? 'linear-gradient(135deg, #2DC9A0 0%, #1A9F7C 100%)'
    : 'linear-gradient(135deg, #FF6B6B 0%, #D84B4B 100%)';
  const grandTotalShadow = type === 'assets'
    ? '0 10px 25px rgba(45, 201, 160, 0.25)'
    : '0 10px 25px rgba(255, 107, 107, 0.25)';

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: '1000px', width: '95%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '1rem' }}>
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: type === 'assets' ? 'var(--teal)' : 'var(--coral)',
              boxShadow: type === 'assets' ? '0 0 10px rgba(45,201,160,0.5)' : '0 0 10px rgba(255,107,107,0.5)'
            }} />
            {type === 'assets' ? '자산 · 수입 요약 현황' : '부채 · 지출 요약 현황'}
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="summary-modal-grid">
          {data.groups.map(g => (
            <div
              key={g.key}
              className={`summary-card ${g.span2 ? 'span-2' : ''}`}
              style={{ borderTop: `4px solid ${g.color}` }}
            >
              <div className="summary-section-label" style={{ color: g.color }}>
                {g.label}
              </div>
              {g.rows.length > 0 ? (
                <SummaryTable
                  rows={g.rows}
                  totalLabel={`${g.label} 합계`}
                  totalValue={g.total}
                  color={g.color}
                />
              ) : (
                <div className="summary-empty-state">
                  <span className="summary-empty-icon">🔍</span>
                  <span>등록된 {g.label} 내역이 없습니다.</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div
          className="summary-grand-total-premium"
          style={{
            background: grandTotalBg,
            boxShadow: grandTotalShadow
          }}
        >
          <span>{data.grandLabel}</span>
          <span className="num-total">
            {formatKRW(data.grandTotal)}<span>원</span>
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button className="btn btn-dark" onClick={onClose} style={{ padding: '0.75rem 2.5rem', borderRadius: '12px', fontWeight: 600 }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
