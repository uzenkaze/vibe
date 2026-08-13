import { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW, genId } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

// 행 편집 컴포넌트
function EditableRow({ row, sectionKey, columns, onUpdate, onDelete, onHoverDetail }) {
  return (
    <tr>
      {columns.map(col => (
        <td key={col.key} className={`${col.right ? 'amount-cell' : ''} ${(col.key === 'content' || col.key === 'desc') ? 'col-hide-mobile' : ''}`}>
          {col.readonly ? (
            <span className="num" style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              {col.format ? col.format(row[col.key]) : row[col.key]}
            </span>
          ) : col.type === 'select' ? (
            <CustomDropdown
              value={row[col.key] || ''}
              onChange={val => onUpdate(sectionKey, row.id, col.key, val)}
              options={col.options || []}
            />
          ) : col.type === 'number' ? (
            <NumberInput
              value={row[col.key] ?? ''}
              placeholder={col.placeholder || ''}
              onChange={val => onUpdate(sectionKey, row.id, col.key, val)}
              rightAlign={col.right}
            />
          ) : (
            <input
              type={col.type || 'text'}
              value={row[col.key] ?? ''}
              placeholder={col.placeholder || ''}
              onChange={e => onUpdate(sectionKey, row.id, col.key, e.target.value)}
              style={col.right ? { textAlign: 'right' } : {}}
            />
          )}
        </td>
      ))}
      <td>
        <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center', alignItems: 'center' }}>
          {onHoverDetail && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => onHoverDetail(row)}
              title="상세"
              style={{ fontSize: '0.75rem', width: 26, height: 26 }}
            >
              ⋯
            </button>
          )}
          <button
            className="table-delete-btn"
            onClick={() => onDelete(sectionKey, row.id)}
            title="삭제"
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  );
}

// 섹션 서브컴포넌트
function DataSection({ title, sectionKey, columns, showSummaryModal, detailModal }) {
  const { getCurrentSections, addRow, updateRow, deleteRow } = useApp();
  const sections = getCurrentSections();
  const rows = sections[sectionKey] || [];

  const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  const remTotal = rows.reduce((a, r) => a + (Number(r.remAmount) || 0), 0);

  const [detailTarget, setDetailTarget] = useState(null);

  return (
    <div className={`data-section ${sectionKey}`}>
      <div className="data-section-header">
        <div className="data-section-title">
          <span className="data-section-dot" />
          {title}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {showSummaryModal && (
            <button className="btn btn-ghost btn-sm" onClick={showSummaryModal}>
              요약
            </button>
          )}
          <button
            className="btn btn-teal btn-sm"
            onClick={() => addRow(sectionKey)}
          >
            + 추가
          </button>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">항목이 없습니다</div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} className={(col.key === 'content' || col.key === 'desc') ? 'col-hide-mobile' : ''} style={{ textAlign: 'center', width: col.width }}>
                  {col.label}
                </th>
              ))}
              <th style={{ width: 60, textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <EditableRow
                key={row.id}
                row={row}
                sectionKey={sectionKey}
                columns={columns}
                onUpdate={updateRow}
                onDelete={deleteRow}
                onHoverDetail={detailModal ? (r) => setDetailTarget(r) : null}
              />
            ))}
          </tbody>
        </table>
      )}

      <div className="section-subtotal">
        <span>{sectionKey === 'debt' ? '총 부채' : '소계'}</span>
        <div className="subtotal-right">
          <span className="subtotal-value num">
            {formatKRW(sectionKey === 'debt' ? remTotal : total)}
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>원</span>
        </div>
      </div>
    </div>
  );
}

/* ===================== 자산·수입 메인 섹션 ===================== */
export default function AssetSection({ onSummary }) {
  const CASH_COLS = [
    { key: 'category', label: '분류', width: 135, placeholder: '예금/주식' },
    { key: 'content', label: '내용', width: 200, placeholder: '계좌명' },
    { key: 'amount', label: '금액', type: 'number', right: true, width: 140, format: formatKRW, placeholder: '0' },
    { key: 'desc', label: '비고', width: 160, placeholder: '' },
  ];

  const NON_CASH_COLS = [
    { key: 'category', label: '분류', width: 135 },
    { key: 'content', label: '내용', width: 200 },
    { key: 'amount', label: '금액', type: 'number', right: true, width: 140, format: formatKRW },
    { key: 'desc', label: '비고', width: 160 },
  ];

  const INCOME_COLS = [
    { key: 'category', label: '분류', width: 135 },
    { key: 'content', label: '내용', width: 200 },
    { key: 'amount', label: '금액', type: 'number', right: true, width: 140, format: formatKRW },
    { key: 'desc', label: '비고', width: 160 },
  ];

  const REALESTATE_COLS = [
    { key: 'category', label: '분류', width: 135 },
    { key: 'content', label: '내용', width: 200 },
    { key: 'amount', label: '평가금액', type: 'number', right: true, width: 150, format: formatKRW },
    { key: 'desc', label: '비고', width: 160 },
  ];

  const RETIREMENT_COLS = [
    { key: 'category', label: '종류', width: 135 },
    { key: 'content', label: '내용', width: 200 },
    { key: 'amount', label: '금액', type: 'number', right: true, width: 150, format: formatKRW },
    { key: 'desc', label: '비고', width: 160 },
  ];

  return (
    <div className="section-card">
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-dot" style={{ background: 'var(--teal)' }} />
          자산 · 수입
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginLeft: 2 }}>
            Assets &amp; Income
          </span>
        </div>
        <button
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
            padding: '0.45rem 1.05rem', borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)',
            fontSize: '0.82rem', fontWeight: 800, letterSpacing: '0.02em',
            cursor: 'pointer', boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px) scale(1.02)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(99, 102, 241, 0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 4px 14px rgba(99, 102, 241, 0.35)'; }}
          onClick={() => onSummary('assets')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          요약 보고서
        </button>
      </div>

      <DataSection title="현금성 자산" sectionKey="cash" columns={CASH_COLS} />
      <div className="divider" style={{ margin: '0 1.5rem' }} />
      <DataSection title="비현금성 자산" sectionKey="non-cash" columns={NON_CASH_COLS} />
      <div className="divider" style={{ margin: '0 1.5rem' }} />
      <DataSection title="연금·보험" sectionKey="retirement" columns={RETIREMENT_COLS} />
      <div className="divider" style={{ margin: '0 1.5rem' }} />
      <DataSection title="수입 내역" sectionKey="income" columns={INCOME_COLS} />
    </div>
  );
}
