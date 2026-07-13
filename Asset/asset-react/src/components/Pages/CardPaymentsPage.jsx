import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';
import CustomDropdown from '../UI/CustomDropdown';

export default function CardPaymentsPage() {
  const { getCurrentSections, persistSections, year, month, dark } = useApp();

  const sections = getCurrentSections();
  const cardPayments = sections.cardPayments || [];

  // --- 날짜 오름차순 정렬을 위한 Day 파싱 헬퍼 ---
  const getDayValue = (payDate) => {
    if (!payDate) return 1;
    const str = String(payDate);
    if (str.includes('말일') || str === 'last') return 99;
    
    const match = str.match(/(\d+)일/);
    if (match) return parseInt(match[1], 10);
    
    const parts = str.split('-');
    if (parts.length === 3) return parseInt(parts[2], 10);
    
    const numMatch = str.match(/\d+/);
    if (numMatch) return parseInt(numMatch[0], 10);
    
    return 1;
  };

  const sortedCardPayments = useMemo(() => {
    return [...cardPayments].sort((a, b) => getDayValue(a.payDate) - getDayValue(b.payDate));
  }, [cardPayments]);

  // --- CRUD Handlers ---
  const displayPayDate = (payDate) => {
    if (!payDate) return '1일';
    const str = String(payDate);
    if (str.includes('말일')) return '말일';
    if (str.startsWith('매달 ')) {
      return str.replace('매달 ', '');
    }
    const parts = str.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      return `${day}일`;
    }
    return payDate;
  };

  const handleAddPayment = () => {
    const now = new Date();
    const newPayment = {
      id: Date.now(),
      payDate: `${now.getDate()}일`,
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
          금월 납부 내역
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Card Payments for This Month
          </span>
        </div>
        <button className="btn btn-dark" onClick={handleAddPayment}>+ 납부 추가</button>
      </div>

      <div style={{ animation: 'tabFadeIn 0.2s ease', marginTop: '1.5rem' }}>
        <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: 650 }}>
            <thead>
              <tr>
                <th style={{ width: 90, textAlign: 'center' }}>입금여부</th>
                <th style={{ width: 180 }}>납부일</th>
                <th>항목</th>
                <th style={{ width: 220, textAlign: 'right' }}>금액</th>
                <th style={{ width: 90, textAlign: 'center' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {sortedCardPayments.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    등록된 납부(예정) 내역이 없습니다.
                  </td>
                </tr>
              )}
              {sortedCardPayments.map((p) => {
                const isRowPaid = p.isPaid || false;
                return (
                  <tr 
                    key={p.id}
                    style={{
                      backgroundColor: isRowPaid 
                        ? (dark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.08)')
                        : 'transparent',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <input 
                        type="checkbox" 
                        checked={isRowPaid} 
                        onChange={(e) => handlePaymentFieldChange(p.id, 'isPaid', e.target.checked)}
                        style={{ 
                          width: '16px', 
                          height: '16px', 
                          cursor: 'pointer',
                          accentColor: 'var(--accent-blue, #5B6BF8)',
                          verticalAlign: 'middle',
                        }}
                      />
                    </td>
                    <td>
                      <CustomDropdown
                        value={displayPayDate(p.payDate)}
                        onChange={(val) => handlePaymentFieldChange(p.id, 'payDate', val)}
                        options={[
                          ...Array.from({ length: 31 }, (_, i) => {
                            const d = String(i + 1);
                            return { value: `${d}일`, label: `${d}일` };
                          }),
                          { value: '말일', label: '말일' }
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
