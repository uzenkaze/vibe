import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';
import CustomDropdown from '../UI/CustomDropdown';

export default function CardPaymentsPage() {
  const { getCurrentSections, persistSections, year, month, dark } = useApp();

  const sections = getCurrentSections();
  const cardPayments = sections.cardPayments || [];

  // --- Drag & Drop State ---
  const [draggedIdx, setDraggedIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === index) return;
    setDragOverIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIndex) return;

    const newPayments = [...cardPayments];
    const draggedItem = newPayments[draggedIdx];
    
    // Remove the dragged item
    newPayments.splice(draggedIdx, 1);
    // Insert it at the target position
    newPayments.splice(targetIndex, 0, draggedItem);

    persistSections({ ...sections, cardPayments: newPayments });
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  // --- CRUD Handlers ---
  const displayPayDate = (payDate) => {
    if (!payDate) return '매달 1일';
    if (String(payDate).startsWith('매달')) return payDate;
    const parts = String(payDate).split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      return `매달 ${day}일`;
    }
    return payDate;
  };

  const handleAddPayment = () => {
    const now = new Date();
    const newPayment = {
      id: Date.now(),
      payDate: `매달 ${now.getDate()}일`,
      item: '',
      amount: 0
    };
    persistSections({ ...sections, cardPayments: [newPayment, ...cardPayments] });
  };

  const handleDeletePayment = (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const newArr = cardPayments.filter(p => p.id !== id);
    persistSections({ ...sections, cardPayments: newArr });
  };

  const handlePaymentFieldChange = (id, field, value) => {
    const newArr = cardPayments.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    persistSections({ ...sections, cardPayments: newArr });
  };

  const paymentsTotalAmount = useMemo(() => {
    return cardPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [cardPayments]);

  return (
    <div className="section-card" style={{ marginBottom: '1.5rem', minHeight: '80vh' }}>
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-dot" style={{ background: '#FF8A00' }} />
          카드 납부 내역 상세
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Card Payment History Detail Management
          </span>
        </div>
        <button className="btn btn-dark" onClick={handleAddPayment}>+ 납부 추가</button>
      </div>

      <div style={{ animation: 'tabFadeIn 0.2s ease', marginTop: '1.5rem' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 650 }}>
            <thead>
              <tr>
                <th style={{ width: 50, textAlign: 'center' }}></th>
                <th style={{ width: 180 }}>납부일</th>
                <th>항목</th>
                <th style={{ width: 220, textAlign: 'right' }}>금액</th>
                <th style={{ width: 90, textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {cardPayments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    등록된 납부(예정) 내역이 없습니다.
                  </td>
                </tr>
              )}
              {cardPayments.map((p, index) => {
                const isDragging = draggedIdx === index;
                const isDragOver = dragOverIdx === index;
                return (
                  <tr 
                    key={p.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    style={{ 
                      opacity: isDragging ? 0.4 : 1,
                      background: isDragOver ? 'rgba(91, 107, 248, 0.08)' : 'transparent',
                      borderTop: isDragOver && draggedIdx > index ? '2px solid var(--accent-blue, #5B6BF8)' : 'none',
                      borderBottom: isDragOver && draggedIdx < index ? '2px solid var(--accent-blue, #5B6BF8)' : 'none',
                      transition: 'background-color 0.2s ease, border 0.1s ease',
                    }}
                  >
                    <td style={{ textAlign: 'center', cursor: 'grab', verticalAlign: 'middle' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ opacity: 0.4, display: 'inline-block' }}>
                        <circle cx="9" cy="5" r="1.5"/>
                        <circle cx="9" cy="12" r="1.5"/>
                        <circle cx="9" cy="19" r="1.5"/>
                        <circle cx="15" cy="5" r="1.5"/>
                        <circle cx="15" cy="12" r="1.5"/>
                        <circle cx="15" cy="19" r="1.5"/>
                      </svg>
                    </td>
                    <td>
                      <CustomDropdown
                        value={displayPayDate(p.payDate)}
                        onChange={(val) => handlePaymentFieldChange(p.id, 'payDate', val)}
                        options={[
                          ...Array.from({ length: 31 }, (_, i) => {
                            const d = String(i + 1);
                            return { value: `매달 ${d}일`, label: `매달 ${d}일` };
                          }),
                          { value: '매달 말일', label: '매달 말일' }
                        ]}
                      />
                    </td>
                    <td>
                      <input 
                        type="text" 
                        value={p.item || ''} 
                        placeholder="항목 입력"
                        onChange={(e) => handlePaymentFieldChange(p.id, 'item', e.target.value)} 
                      />
                    </td>
                    <td className="amount-cell">
                      <NumberInput 
                        value={p.amount || 0} 
                        onChange={(val) => handlePaymentFieldChange(p.id, 'amount', val)} 
                        style={{ textAlign: 'right', fontWeight: 'bold' }}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button 
                          className="btn btn-ghost btn-sm" 
                          style={{ padding: '4px 8px', color: 'var(--coral)' }} 
                          onClick={() => handleDeletePayment(p.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Payments Total Summary */}
        <div style={{ 
          margin: '0 1.5rem 1.5rem', 
          paddingTop: '1.5rem', 
          borderTop: '1px solid var(--card-border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between' 
        }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
            이번 달 납부(예정) 합계
          </span>
          <span style={{ 
            fontSize: '1.8rem', 
            fontWeight: 900, 
            color: 'var(--text-primary)',
            fontFamily: 'Inter, sans-serif',
            letterSpacing: '-0.03em' 
          }}>
            {formatKRW(paymentsTotalAmount)}
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', marginLeft: '4px', color: 'var(--text-muted)' }}>
              원
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
