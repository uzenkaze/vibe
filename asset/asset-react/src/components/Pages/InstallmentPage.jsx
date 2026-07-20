import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';
import CustomDropdown from '../UI/CustomDropdown';
import CardMonthlySummarySection from '../Dashboard/CardMonthlySummarySection';

function InstallmentStatCard({ label, value, color, accent, bgGradient, icon, tooltipContent }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="installment-stat"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        background: bgGradient || 'var(--card)', 
        '--stat-accent': bgGradient ? 'transparent' : accent,
        position: 'relative', 
        zIndex: isHovered ? 100 : 1,
        color: bgGradient ? '#ffffff' : 'inherit',
        border: bgGradient ? 'none' : '1px solid var(--card-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
        <div style={{
          width: 30, height: 30, borderRadius: '8px',
          background: bgGradient ? 'rgba(255, 255, 255, 0.2)' : accent + '15',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: bgGradient ? '#ffffff' : accent, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div 
          className="installment-stat-label" 
          style={{ 
            margin: 0,
            color: bgGradient ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)'
          }}
        >
          {label}
        </div>
      </div>
      <div 
        className="installment-stat-value num" 
        style={{ 
          color: bgGradient ? '#ffffff' : color 
        }}
      >
        {formatKRW(value)}
        <span 
          style={{ 
            fontSize: '0.7rem', 
            fontWeight: 600, 
            color: bgGradient ? 'rgba(255, 255, 255, 0.75)' : 'var(--text-muted)', 
            marginLeft: 3 
          }}
        >
          원
        </span>
      </div>

      {isHovered && tooltipContent && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card)',
          border: '1px solid var(--card-border)',
          borderRadius: '16px',
          padding: '0.875rem',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          zIndex: 1000,
          minWidth: '260px',
          color: 'var(--text-primary)',
          pointerEvents: 'none',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}


// 할부 계산 함수 (이율에 따라 수수료 자동 계산)
const calculateInstallment = (item) => {
  const amount = Number(item.amount) || 0;
  const totalMonths = Math.max(1, parseInt(item.totalMonths) || 1);
  
  let currentMonth = parseInt(item.currentMonth);
  if (isNaN(currentMonth)) {
    currentMonth = 1;
  } else {
    currentMonth = Math.max(0, Math.min(totalMonths, currentMonth));
  }

  const monthlyPrincipal = Math.floor(amount / totalMonths);
  const rate = parseFloat(item.rate) || 0;

  let monthlyFee = 0;
  let remAmount = 0;
  let endDate = '';

  if (currentMonth > 0) {
    const paidPrincipal = monthlyPrincipal * (currentMonth - 1);
    let remainingBalance = amount - paidPrincipal;

    if (item.repayStatus === 'partial' && item.repaidAmount) {
      remainingBalance -= parseFloat(item.repaidAmount) || 0;
      if (remainingBalance < 0) remainingBalance = 0;
    }

    // 이율이 0보다 큰 경우 수수료 자동 계산
    if (rate > 0) {
      if (item.date) {
        const pDate = new Date(item.date);
        let firstBillingDate = new Date(pDate.getFullYear(), pDate.getMonth() + 1, 14);
        let currentBillingDate = new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (currentMonth - 1), 14);
        let prevBillingDate = currentMonth === 1 ? pDate : new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (currentMonth - 2), 14);
        const diffTime = Math.abs(currentBillingDate - prevBillingDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        monthlyFee = Math.floor(remainingBalance * (rate / 100) * (diffDays / 365));
      } else {
        monthlyFee = Math.floor((remainingBalance * rate / 100) / 12);
      }
    } else {
      monthlyFee = Number(item.monthlyFee) || 0;
    }

    remAmount = Math.max(0, ((totalMonths - currentMonth) * monthlyPrincipal) - (item.repayStatus === 'partial' ? parseFloat(item.repaidAmount) || 0 : 0));
  } else {
    // 0회차일 때는 수수료, 원금(이번달 청구액), 잔액 모두 0원
    monthlyFee = 0;
    remAmount = 0;
  }

  if (item.date) {
    const p = item.date.split(/[-./ ]/);
    if (p.length >= 2) {
      let y = parseInt(p[0]), m = parseInt(p[1]) + totalMonths;
      y += Math.floor((m - 1) / 12);
      m = (m - 1) % 12 + 1;
      endDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
    }
  }

  return {
    ...item,
    amount,
    totalMonths,
    currentMonth,
    monthlyPrincipal,
    rate,
    monthlyFee,
    remAmount,
    endDate
  };
};

// 수수료를 수동 수정했을 때, 수수료 자동 계산 없이 나머지 항목만 계산
const calculateInstallmentWithoutFeeUpdate = (item) => {
  const amount = Number(item.amount) || 0;
  const totalMonths = Math.max(1, parseInt(item.totalMonths) || 1);
  
  let currentMonth = parseInt(item.currentMonth);
  if (isNaN(currentMonth)) {
    currentMonth = 1;
  } else {
    currentMonth = Math.max(0, Math.min(totalMonths, currentMonth));
  }

  const monthlyPrincipal = Math.floor(amount / totalMonths);

  let endDate = '';
  if (item.date) {
    const p = item.date.split(/[-./ ]/);
    if (p.length >= 2) {
      let y = parseInt(p[0]), m = parseInt(p[1]) + totalMonths;
      y += Math.floor((m - 1) / 12);
      m = (m - 1) % 12 + 1;
      endDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
    }
  }

  const remAmount = currentMonth === 0 ? 0 : Math.max(0, ((totalMonths - currentMonth) * monthlyPrincipal) - (item.repayStatus === 'partial' ? parseFloat(item.repaidAmount) || 0 : 0));

  return {
    ...item,
    amount,
    totalMonths,
    currentMonth,
    monthlyPrincipal,
    remAmount,
    endDate
  };
};

export default function InstallmentPage() {
  const { getCurrentSections, persistSections, year, month } = useApp();
  const [activeDetailId, setActiveDetailId] = useState(null);

  // 모달 상태값 관리
  const [modalRepayStatus, setModalRepayStatus] = useState('active');
  const [modalRepaidAmount, setModalRepaidAmount] = useState(0);

  const sections = getCurrentSections();
  const installments = sections.installment || [];

  const activeDetailItem = useMemo(() => {
    return installments.find(i => i.id === activeDetailId) || null;
  }, [installments, activeDetailId]);

  const activeInstallments = useMemo(() => {
    const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
    return installments.filter(r => {
      const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
      return !isExpired;
    });
  }, [installments, year, month]);

  const { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal } = useMemo(() => {
    const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;

    const totalAmount = installments.reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const thisMonthTotal = installments.reduce((a, r) => {
      const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
      if (isExpired || Number(r.currentMonth) === 0) return a;
      return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
    }, 0);
    const nextMonthTotal = installments.reduce((a, r) => {
      const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
      if (isExpired) return a;
      const currentMonthVal = Number(r.currentMonth) || 0;
      if (currentMonthVal === 0) {
        return a + (Number(r.monthlyPrincipal) || 0);
      }
      const remaining = (Number(r.totalMonths) || 0) - currentMonthVal;
      if (remaining > 1) return a + (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);
      return a;
    }, 0);
    const remainTotal = installments.reduce((a, r) => {
      const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
      if (isExpired) return a;
      return a + (Number(r.remAmount) || 0);
    }, 0);
    return { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal };
  }, [installments, year, month]);

  const stats = [
    {
      label: '전체 결제 원금',
      value: totalAmount,
      color: 'var(--text-primary)',
      accent: '#5B6BF8',
      bgGradient: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2"/>
          <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          현재 청구 진행 중인 모든 할부 건의 <strong>최초 결제 총 원금</strong> 합계입니다.
        </div>
      )
    },
    {
      label: '남은 잔액',
      value: remainTotal,
      color: 'var(--coral)',
      accent: '#FF6B6B',
      bgGradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', minWidth: '260px' }}>
          <div style={{ marginBottom: '8px', borderBottom: '1px dashed var(--card-border)', paddingBottom: '6px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            이번 달 납부액을 제외한 다음 달부터 최종 만기까지 납부해야 할 <strong>남은 할부 잔액</strong>입니다.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ textAlign: 'left', padding: '4px' }}>내용 (카드)</th>
                <th style={{ textAlign: 'right', padding: '4px' }}>남은 잔액</th>
              </tr>
            </thead>
            <tbody>
              {activeInstallments?.length > 0 ? activeInstallments.map(i => (
                <tr key={i.id}>
                  <td style={{ padding: '4px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {i.content || '—'} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>({i.card})</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)', fontWeight: 600 }}>
                    {formatKRW(i.remAmount)}원
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="2" style={{ textAlign: 'center', padding: '4px', opacity: 0.5 }}>내역 없음</td></tr>
              )}
              <tr style={{ borderTop: '1px solid var(--card-border)', fontWeight: 'bold' }}>
                <td style={{ padding: '4px' }}>총합</td>
                <td style={{ textAlign: 'right', padding: '4px', color: 'var(--coral)' }}>{formatKRW(remainTotal)}원</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      label: '이번 달 납부',
      value: thisMonthTotal,
      color: 'var(--teal)',
      accent: '#2DC9A0',
      bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          이번 달(선택 연월)에 청구되어 납부해야 하는 <strong>할부 원금 및 수수료의 총합계</strong> 금액입니다.
        </div>
      )
    },
    {
      label: '다음 달 예정',
      value: nextMonthTotal,
      color: '#5B6BF8',
      accent: '#5B6BF8',
      bgGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          다음 달에 청구 예정인 <strong>할부 원금 및 수수료의 총합계</strong> 금액입니다 (잔여 회차가 2회 이상 남은 항목 기준).
        </div>
      )
    },
  ];


  const handleAdd = () => {
    const now = new Date();
    const newItem = {
      id: Date.now(),
      date: `${year}-${month.toString().padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`,
      card: '국민',
      content: '',
      amount: 0,
      rate: 0,
      totalMonths: 1,
      currentMonth: 1,
      monthlyPrincipal: 0,
      monthlyFee: 0,
      remAmount: 0,
      endDate: '',
      repayStatus: 'active',
      repaidAmount: 0
    };

    const calculated = calculateInstallment(newItem);
    persistSections({ ...sections, installment: [calculated, ...installments] });
  };

  const handleDelete = (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    const newArr = installments.filter(i => i.id !== id);
    persistSections({ ...sections, installment: newArr });
  };

  const handleFieldChange = (id, field, value) => {
    const newArr = installments.map(item => {
      if (item.id === id) {
        let updated = { ...item };
        if (field === 'monthlyFee') {
          updated.monthlyFee = Number(value) || 0;
          updated.rate = 0; // 수동 입력 시 이율은 0으로
          updated = calculateInstallmentWithoutFeeUpdate(updated);
        } else {
          updated[field] = value;
          updated = calculateInstallment(updated);
        }
        return updated;
      }
      return item;
    });
    persistSections({ ...sections, installment: newArr });
  };

  // 상세 모달 열기
  const openDetailModal = (item) => {
    setActiveDetailId(item.id);
    setModalRepayStatus(item.repayStatus || 'active');
    setModalRepaidAmount(item.repaidAmount || 0);
  };

  // 모달 상환 정보 적용
  const applyModalRepay = () => {
    if (!activeDetailId) return;

    const newArr = installments.map(item => {
      if (item.id === activeDetailId) {
        let updated = { 
          ...item, 
          repayStatus: modalRepayStatus,
          repaidAmount: modalRepayStatus === 'partial' ? Number(modalRepaidAmount) || 0 : 0
        };

        if (modalRepayStatus === 'full') {
          updated.remAmount = 0;
          updated.monthlyFee = 0;
          updated.monthlyPrincipal = 0;
          updated.endDate = "완납";
        } else {
          // 계산 적용
          updated = calculateInstallment(updated);
        }
        return updated;
      }
      return item;
    });

    persistSections({ ...sections, installment: newArr });
    setActiveDetailId(null);
  };

  // 상세 회차별 납부 상태 토글
  const handleTogglePaidMonth = (idx) => {
    if (!activeDetailId) return;
    const newArr = installments.map(item => {
      if (item.id === activeDetailId) {
        const currentPaid = item.paidMonths || [];
        const updatedPaid = currentPaid.includes(idx)
          ? currentPaid.filter(m => m !== idx)
          : [...currentPaid, idx];
        return {
          ...item,
          paidMonths: updatedPaid
        };
      }
      return item;
    });
    persistSections({ ...sections, installment: newArr });
  };

  // --- 월별 카드 사용합계 & 다음달 납부예정액 관리 ---
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


  // 상세 스케줄 계산 로직 (모달 노출용)
  const { calculatedSchedule, calculatedTotalFee } = useMemo(() => {
    if (!activeDetailItem) return { calculatedSchedule: [], calculatedTotalFee: 0 };

    const principal = Number(activeDetailItem.amount) || 0;
    const rate = Number(activeDetailItem.rate) || 0;
    const months = Number(activeDetailItem.totalMonths) || 1;
    const monthlyPrincipal = Math.floor(principal / months);

    if (activeDetailItem.repayStatus === 'full') {
      return { calculatedSchedule: [], calculatedTotalFee: 0 };
    }

    let totalFee = 0;
    const schedule = [];
    let baseDate = activeDetailItem.date ? new Date(activeDetailItem.date) : new Date();
    let firstBillingDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 14);

    for (let i = 1; i <= months; i++) {
      let remaining = principal - (monthlyPrincipal * (i - 1));
      if (activeDetailItem.repayStatus === 'partial' && activeDetailItem.repaidAmount && i >= activeDetailItem.currentMonth) {
        remaining -= Number(activeDetailItem.repaidAmount) || 0;
        if (remaining < 0) remaining = 0;
      }

      let monthlyFee = 0;
      if (rate > 0) {
        let currentBillingDate = new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (i - 1), 14);
        let prevBillingDate = i === 1 ? baseDate : new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (i - 2), 14);
        const diffTime = Math.abs(currentBillingDate - prevBillingDate);
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        monthlyFee = Math.floor(remaining * (rate / 100) * (diffDays / 365));
      } else {
        monthlyFee = Number(activeDetailItem.monthlyFee) || 0;
      }

      totalFee += monthlyFee;

      const payDate = new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (i - 1), 14);
      const dateStr = `${String(payDate.getFullYear()).slice(2)}.${String(payDate.getMonth() + 1).padStart(2, '0')}.${String(payDate.getDate()).padStart(2, '0')}`;

      let currentPrincipal = i === months ? principal - (monthlyPrincipal * (months - 1)) : monthlyPrincipal;
      schedule.push({ idx: i, date: dateStr, principal: currentPrincipal, fee: monthlyFee });
    }

    return { calculatedSchedule: schedule, calculatedTotalFee: totalFee };
  }, [activeDetailItem]);

  const cardsList = ['국민', '신한', '롯데', '현대', '삼성', '우리', '농협', '하나'];

  return (
    <div className="section-card" style={{ marginBottom: '1.5rem', minHeight: '80vh' }}>
      <div className="section-card-header">
        <div className="section-card-title">
          <span className="section-dot" style={{ background: '#5B6BF8' }} />
          카드 할부 상세
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Installment Detail Management
          </span>
        </div>
        <button className="btn btn-dark" onClick={handleAdd}>+ 할부 추가</button>
      </div>

      <div className="installment-grid" style={{ marginBottom: '2rem' }}>
        {stats.map(s => (
          <InstallmentStatCard key={s.label} {...s} />
        ))}
      </div>

      <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
        <table className="data-table" style={{ minWidth: 1000 }}>
          <thead>
            <tr>
              <th style={{ width: 140 }}>사용일</th>
              <th style={{ width: 110 }}>카드</th>
              <th>사용처</th>
              <th style={{ width: 130, textAlign: 'right' }}>총금액</th>
              <th style={{ width: 90, textAlign: 'center' }}>이율(%)</th>
              <th style={{ width: 110, textAlign: 'center' }}>회차</th>
              <th style={{ width: 110, textAlign: 'right' }}>원금</th>
              <th style={{ width: 110, textAlign: 'right' }}>수수료</th>
              <th style={{ width: 120, textAlign: 'right' }}>잔액</th>
              <th style={{ width: 80, textAlign: 'center' }}>종료</th>
              <th style={{ width: 90, textAlign: 'center' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {installments.length === 0 && (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  등록된 할부 내역이 없습니다.
                </td>
              </tr>
            )}
            {installments.map(r => {
              const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
              const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
              
              // 레거시 종료 월 표시 로직 스타일
              let endDateStyle = {};
              if (r.repayStatus === 'full') {
                endDateStyle = { color: 'var(--text-muted)' };
              } else {
                if (r.endDate && r.endDate < currentTag) {
                  endDateStyle = { color: 'var(--text-muted)', textDecoration: 'line-through' };
                } else if (r.endDate === currentTag) {
                  endDateStyle = { color: 'var(--teal)', fontWeight: 'bold' };
                }
              }

              return (
                <tr key={r.id} style={{ 
                  backgroundColor: isExpired ? 'rgba(120, 120, 120, 0.05)' : 'transparent',
                  opacity: isExpired ? 0.75 : 1 
                }}>
                  <td>
                    <input 
                      type="date" 
                      value={r.date || ''} 
                      onChange={(e) => handleFieldChange(r.id, 'date', e.target.value)} 
                      style={{ fontSize: '0.85rem' }}
                    />
                  </td>
                  <td>
                    <CustomDropdown
                      value={r.card || '국민'}
                      onChange={(val) => handleFieldChange(r.id, 'card', val)}
                      options={cardsList.map(c => ({ value: c, label: c }))}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={r.content || ''} 
                      placeholder="내용 입력"
                      onChange={(e) => handleFieldChange(r.id, 'content', e.target.value)} 
                    />
                  </td>
                  <td className="amount-cell">
                    <NumberInput 
                      value={r.amount || 0} 
                      onChange={(val) => handleFieldChange(r.id, 'amount', val)} 
                      style={{ textAlign: 'right', fontWeight: 'bold' }}
                    />
                  </td>
                  <td>
                    <NumberInput 
                      value={r.rate || 0} 
                      onChange={(val) => handleFieldChange(r.id, 'rate', val)} 
                      style={{ textAlign: 'center' }}
                    />
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <NumberInput 
                        min={0} 
                        max={r.totalMonths || 1} 
                        value={r.currentMonth === undefined ? 1 : r.currentMonth} 
                        onChange={(val) => handleFieldChange(r.id, 'currentMonth', val)} 
                        style={{ width: '40px', textAlign: 'center' }}
                      />
                      <span style={{ opacity: 0.3 }}>/</span>
                      <NumberInput 
                        min={1} 
                        value={r.totalMonths || 1} 
                        onChange={(val) => handleFieldChange(r.id, 'totalMonths', val)} 
                        style={{ width: '40px', textAlign: 'center' }}
                      />
                    </div>
                  </td>
                  <td className="amount-cell num" style={{ color: isExpired ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {formatKRW(isExpired || Number(r.currentMonth) === 0 ? 0 : r.monthlyPrincipal)}
                  </td>
                  <td className="amount-cell">
                    <NumberInput 
                      value={isExpired || Number(r.currentMonth) === 0 ? 0 : (r.monthlyFee || 0)} 
                      onChange={(val) => handleFieldChange(r.id, 'monthlyFee', val)} 
                      style={{ textAlign: 'right', color: isExpired ? 'var(--text-muted)' : 'var(--teal)', fontWeight: 'bold' }}
                      disabled={isExpired || Number(r.currentMonth) === 0}
                    />
                  </td>
                  <td 
                    className="amount-cell num" 
                    style={{ 
                      color: isExpired ? 'var(--text-muted)' : 'var(--coral)',
                      cursor: isExpired ? 'default' : 'help',
                      borderBottom: isExpired ? 'none' : '1px dashed rgba(255, 107, 107, 0.4)',
                      textDecoration: 'none',
                      display: 'table-cell'
                    }}
                    title={isExpired ? '만료된 할부 내역입니다.' : `[남은 잔액 상세 계산 내역]\n• 총 결제 금액: ${formatKRW(r.amount)}원\n• 매월 납부 원금: ${formatKRW(r.monthlyPrincipal)}원 x ${r.totalMonths}개월\n• 납부 완료 회차: ${Number(r.currentMonth) === 0 ? 0 : r.currentMonth - 1}회차 (${formatKRW(Math.max(0, Number(r.currentMonth) - 1) * r.monthlyPrincipal)}원)\n• 남은 납부 회차: ${r.totalMonths - (Number(r.currentMonth) || 0)}회차 (${formatKRW(Math.max(0, r.totalMonths - (Number(r.currentMonth) || 0)) * r.monthlyPrincipal)}원)\n${r.repayStatus === 'partial' ? `• 일부 상환 누적액: -${formatKRW(r.repaidAmount)}원\n` : ''}---------------------------------\n= 최종 남은 잔액: ${formatKRW(r.remAmount)}원`}
                  >
                    {formatKRW(isExpired ? 0 : r.remAmount)}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.8rem', ...endDateStyle }}>
                    {r.repayStatus === 'full' ? '완납' : (r.endDate || '—')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '4px 8px' }} 
                        onClick={() => openDetailModal(r)}
                        title="상세 스케줄 및 상환"
                      >
                        상세
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm" 
                        style={{ padding: '4px 8px', color: 'var(--coral)' }} 
                        onClick={() => handleDelete(r.id)}
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

      {/* 월별 카드 사용합계 & 다음달 납부예정액 관리 섹션 */}
      <CardMonthlySummarySection />
      {activeDetailItem && (
        <div className="modal-overlay" onClick={() => setActiveDetailId(null)}>
          <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">💳 할부 상세 정보 및 상환</div>
              <button className="btn-close" onClick={() => setActiveDetailId(null)}>×</button>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>총 상환 예정액 (원금 + 수수료)</h4>
              <p style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--teal)' }}>
                {activeDetailItem.repayStatus === 'full' 
                  ? '0원' 
                  : `${formatKRW((Number(activeDetailItem.amount) || 0) + calculatedTotalFee)}원`
                }
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
                <span>원금: {formatKRW(activeDetailItem.repayStatus === 'full' ? 0 : activeDetailItem.amount)}원</span>
                <span>수수료: {formatKRW(calculatedTotalFee)}원</span>
                <span>이율: {(activeDetailItem.rate || 0).toFixed(2)}%</span>
              </div>
            </div>

            {/* 상환 관리 */}
            <div style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>상환 구분</label>
                <CustomDropdown 
                  value={modalRepayStatus} 
                  onChange={setModalRepayStatus} 
                  options={[
                    { value: 'active', label: '정상 납부' },
                    { value: 'partial', label: '일부 상환' },
                    { value: 'full', label: '중도 완납' }
                  ]}
                />
              </div>

              {/* 상환 구분 설명 뱃지 */}
              <div style={{
                fontSize: '0.75rem',
                color: modalRepayStatus === 'full' ? 'var(--teal)' : modalRepayStatus === 'partial' ? '#F5A623' : 'var(--text-secondary)',
                background: modalRepayStatus === 'full' ? 'rgba(45,201,160,0.10)' : modalRepayStatus === 'partial' ? 'rgba(245,166,35,0.10)' : 'rgba(91,107,248,0.08)',
                border: `1px solid ${modalRepayStatus === 'full' ? 'rgba(45,201,160,0.25)' : modalRepayStatus === 'partial' ? 'rgba(245,166,35,0.25)' : 'rgba(91,107,248,0.15)'}`,
                borderRadius: '8px',
                padding: '0.4rem 0.75rem',
                marginBottom: '0.5rem',
                fontWeight: 600,
              }}>
                {modalRepayStatus === 'active' && '📅 현재 정상 납부 진행 중입니다.'}
                {modalRepayStatus === 'partial' && '💰 일부 금액을 미리 상환한 경우 아래에 입력해주세요.'}
                {modalRepayStatus === 'full' && '🎉 중도 완납 처리 시 잔액이 0원으로 변경됩니다.'}
              </div>

              {modalRepayStatus === 'partial' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem', borderTop: '1px dashed var(--card-border)', paddingTop: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>일부 상환 누적 금액 (원)</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ flex: 1 }}>
                      <NumberInput 
                        value={modalRepaidAmount} 
                        onChange={(val) => setModalRepaidAmount(val)} 
                      />
                    </div>
                    <button className="btn btn-teal btn-sm" onClick={applyModalRepay}>적용</button>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>* 입력한 금액만큼 남은 원금에서 차감되어 이후 수수료가 재계산됩니다.</span>
                </div>
              )}
              {modalRepayStatus !== 'partial' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button className="btn btn-teal btn-sm" onClick={applyModalRepay}>상태 적용</button>
                </div>
              )}
            </div>

            {/* 스케줄 리스트 */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem' }}>회차별 납부 스케줄</h4>
            {activeDetailItem.repayStatus === 'full' ? (
              <div style={{ 
                padding: '2rem', 
                background: 'rgba(45, 201, 160, 0.05)', 
                color: 'var(--teal)', 
                borderRadius: 'var(--radius-sm)', 
                textAlign: 'center', 
                fontWeight: 'bold',
                border: '1px solid rgba(45, 201, 160, 0.2)' 
              }}>
                🎉 완납된 할부 내역입니다.
              </div>
            ) : (
              <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem' }}>
                {calculatedSchedule.map(s => {
                  const isPaid = (activeDetailItem.paidMonths || []).includes(s.idx);
                  return (
                    <div 
                      key={s.idx} 
                      style={{ 
                        borderBottom: '1px solid var(--card-border)', 
                        paddingBottom: '0.5rem', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        opacity: isPaid ? 0.45 : 1,
                        textDecoration: isPaid ? 'line-through' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input 
                          type="checkbox" 
                          checked={isPaid}
                          onChange={() => handleTogglePaidMonth(s.idx)}
                          style={{ 
                            cursor: 'pointer', 
                            width: '15px', 
                            height: '15px',
                            accentColor: 'var(--teal)' 
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{s.idx}회차</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>예정일: {s.date}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{formatKRW(s.principal + s.fee)}원</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>원금 {formatKRW(s.principal)} / 수수료 {formatKRW(s.fee)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
