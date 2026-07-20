import { useState } from 'react';
import { formatKRW } from '../../utils/format';
import NumberInput from './NumberInput';

export default function ExpenseDetailModal({ item, sectionKey, onClose, onSave, isSaving = false }) {
  const [details, setDetails] = useState(() => {
    return item.details ? JSON.parse(JSON.stringify(item.details)) : [];
  });

  const handleAdd = () => {
    setDetails([...details, { content: '', amount: 0, remarks: '' }]);
  };

  const handleRemove = (index) => {
    setDetails(details.filter((_, idx) => idx !== index));
  };

  const handleChange = (index, field, value) => {
    const updated = [...details];
    updated[index][field] = value;
    setDetails(updated);
  };

  const handleSave = () => {
    onSave(sectionKey, item.id, details);
  };

  const total = details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

  return (
    <div className="modal-overlay" onClick={isSaving ? undefined : onClose}>
      <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            📋 지출 상세 내역 등록
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8, fontWeight: 500 }}>
              {item.category ? `[${item.category}] ` : ''}{item.content || item.desc || ''}
            </span>
          </div>
          <button className="btn-close" onClick={onClose} disabled={isSaving}>×</button>
        </div>

        <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: '1rem' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>분류 (내용)</th>
                <th style={{ width: 160, textAlign: 'right' }}>금액</th>
                <th>비고</th>
                <th style={{ width: 50, textAlign: 'center' }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {details.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    등록된 상세 내역이 없습니다. 하단의 추가 버튼을 눌러 등록하세요.
                  </td>
                </tr>
              ) : (
                details.map((d, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={d.content ?? ''}
                        placeholder="분류/내용 입력"
                        onChange={e => handleChange(index, 'content', e.target.value)}
                        disabled={isSaving}
                      />
                    </td>
                    <td>
                      <NumberInput
                        value={d.amount ?? ''}
                        placeholder="0"
                        onChange={val => handleChange(index, 'amount', val)}
                        rightAlign
                        disabled={isSaving}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={d.remarks ?? ''}
                        placeholder="비고"
                        onChange={e => handleChange(index, 'remarks', e.target.value)}
                        disabled={isSaving}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleRemove(index)}
                        disabled={isSaving}
                        style={{ width: 24, height: 24, padding: 0 }}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
          <div>
            <button className="btn btn-teal btn-sm" onClick={handleAdd} disabled={isSaving}>
              + 상세 항목 추가
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>총 금액 합계:</span>
            <span className="num" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--coral)' }}>
              {formatKRW(total)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>원</span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button className="btn btn-dark" onClick={onClose} disabled={isSaving}>취소</button>
          <button
            className="btn btn-teal"
            onClick={handleSave}
            disabled={isSaving}
            style={{ minWidth: 110, gap: '0.4rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {isSaving ? (
              <>
                <span style={{
                  width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block', animation: 'spin 0.7s linear infinite'
                }} />
                저장 중...
              </>
            ) : '💾 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}
