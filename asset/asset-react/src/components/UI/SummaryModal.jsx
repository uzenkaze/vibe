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
          <th style={{ width: 200 }}>분류</th>
          <th>내용</th>
          <th style={{ textAlign: 'right', width: 160 }}>금액</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <td>{r.category || '—'}</td>
            <td>{r.content || '—'}</td>
            <td style={{ textAlign: 'right', fontWeight: 700 }} className="num">
              {formatKRW(r.amount)}
            </td>
          </tr>
        ))}
        <tr className="total-row">
          <td colSpan={2} style={{ fontWeight: 900 }}>{totalLabel}</td>
          <td style={{ textAlign: 'right', color, fontWeight: 900 }} className="num">
            {formatKRW(totalValue)}
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
        { key: 'cash', label: '현금성 자산', color: 'var(--teal)' },
        { key: 'non-cash', label: '비현금성 자산', color: '#5B6BF8' },
        { key: 'real-estate', label: '부동산', color: 'var(--gold)' },
        { key: 'retirement', label: '연금·보험', color: '#a78bfa' },
        { key: 'income', label: '수입', color: 'var(--teal)' },
      ];
      let grandTotal = 0;
      const processedGroups = groups.map(g => {
        const rows = sections[g.key] || [];
        const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
        grandTotal += (g.key === 'income' ? 0 : total);
        return { ...g, rows, total };
      });
      return { groups: processedGroups, grandTotal, grandLabel: '총 자산 (순자산 기준)', type: 'assets' };
    } else {
      const groups = [
        { key: 'debt', label: '부채 (잔여금)', color: 'var(--coral)', useRem: true },
        { key: 'v-expense', label: '변동 지출', color: 'var(--gold)' },
        { key: 'f-expense', label: '고정 지출', color: '#5B6BF8' },
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

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            {type === 'assets' ? '자산 · 수입 요약' : '부채 · 지출 요약'}
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {data.groups.map(g => (
          <div key={g.key}>
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
              <div className="empty-state">항목 없음</div>
            )}
          </div>
        ))}

        <div className="summary-grand-total">
          <span>{data.grandLabel}</span>
          <span className="num" style={{ color: type === 'assets' ? 'var(--teal)' : 'var(--coral)', fontSize: '1.25rem' }}>
            {formatKRW(data.grandTotal)}원
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-dark" onClick={onClose} style={{ padding: '0.6rem 2rem' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
