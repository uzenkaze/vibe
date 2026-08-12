import { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';
import CustomDropdown from '../UI/CustomDropdown';
import CardMonthlySummarySection from '../Dashboard/CardMonthlySummarySection';
import CardManagementSection from '../Dashboard/CardManagementSection';




// 공통 1회차 청구일(결제일) 계산 헬퍼
// 사용일(date), 결제일(payDay: 기본 14일 또는 5일 등)을 기반으로 첫 청구 날짜(Date 객체)를 산출
const getInitialBillingDate = (dateStr, payDayVal = 14) => {
  const payDay = parseInt(payDayVal) || 14;
  let baseDate = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(baseDate.getTime())) baseDate = new Date();

  const useYear = baseDate.getFullYear();
  const useMonth = baseDate.getMonth(); // 0-indexed (0=1월, 6=7월)
  const useDay = baseDate.getDate();

  let billYear = useYear;
  let billMonth = useMonth;

  // 카드사별 이용기간 전형 기준:
  // 결제일이 5일인 경우 (예: 삼성카드 5일 결제분 -> 전전월 24일 ~ 전월 23일 이용분이 청구됨)
  // 사용일이 전월 24일 이후(예: 7/30)라면 익익월(9월 5일) 청구
  if (payDay <= 10) {
    if (useDay >= 24) {
      billMonth += 2; // 사용월 + 2달 (예: 7월 30일 -> 9월)
    } else {
      billMonth += 1; // 사용월 + 1달
    }
  } else {
    // 결제일 14일 기준 (전월 1일 ~ 전월 말일 이용분 -> 익월 14일 청구)
    billMonth += 1;
  }

  billYear += Math.floor(billMonth / 12);
  billMonth = (billMonth % 12 + 12) % 12;

  return new Date(billYear, billMonth, payDay);
};

// 공통 종료월 계산 헬퍼 (현재 조회 연월 + 남은 개월 수 기준)
const computeEndDateByRound = (item, activeYear, activeMonth) => {
  const totalMonths = Math.max(1, parseInt(item.totalMonths) || 1);
  const currentMonth = Math.max(0, parseInt(item.currentMonth) || 0);

  if (currentMonth >= totalMonths) {
    return '완납';
  }

  // 남은 납부 개월 수 (현재 회차 납부 예정 포함, 차월부터 만기까지)
  const remainingMonths = Math.max(0, totalMonths - currentMonth);

  let y = parseInt(activeYear) || new Date().getFullYear();
  let m = (parseInt(activeMonth) || (new Date().getMonth() + 1)) + remainingMonths;

  y += Math.floor((m - 1) / 12);
  m = ((m - 1) % 12) + 1;

  return `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
};

// 할부 계산 함수 (이율에 따라 수수료 자동 계산)
const calculateInstallment = (item, activeYear, activeMonth) => {
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

  if (currentMonth > 0) {
    const paidPrincipal = monthlyPrincipal * (currentMonth - 1);
    let remainingBalance = amount - paidPrincipal;

    if (item.repayStatus === 'partial' && item.repaidAmount) {
      remainingBalance -= parseFloat(item.repaidAmount) || 0;
      if (remainingBalance < 0) remainingBalance = 0;
    }

    // 이율 입력값에 따라 수수료 자동 계산 (월할 계산: 잔액 * 연이율% / 12)
    monthlyFee = Math.floor((remainingBalance * rate / 100) / 12);

    remAmount = Math.max(0, ((totalMonths - currentMonth) * monthlyPrincipal) - (item.repayStatus === 'partial' ? parseFloat(item.repaidAmount) || 0 : 0));
  } else {
    // 0회차일 때는 수수료, 원금(이번달 청구액), 잔액 모두 0원
    monthlyFee = 0;
    remAmount = 0;
  }

  // 회차 및 조회 연월 기준 종료월 계산
  const endDate = item.repayStatus === 'full' ? '완납' : computeEndDateByRound(item, activeYear, activeMonth);

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
const calculateInstallmentWithoutFeeUpdate = (item, activeYear, activeMonth) => {
  const amount = Number(item.amount) || 0;
  const totalMonths = Math.max(1, parseInt(item.totalMonths) || 1);
  
  let currentMonth = parseInt(item.currentMonth);
  if (isNaN(currentMonth)) {
    currentMonth = 1;
  } else {
    currentMonth = Math.max(0, Math.min(totalMonths, currentMonth));
  }

  const monthlyPrincipal = Math.floor(amount / totalMonths);
  const endDate = item.repayStatus === 'full' ? '완납' : computeEndDateByRound(item, activeYear, activeMonth);
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
  const { getCurrentSections, persistSections, year, month, dark } = useApp();
  const [activeDetailId, setActiveDetailId] = useState(null);

  // 아코디언 상태 관리 (기본 닫힘)
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
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

    const calculated = calculateInstallment(newItem, year, month);
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
          updated = calculateInstallmentWithoutFeeUpdate(updated, year, month);
        } else if (field === 'currentMonth') {
          const newCurr = Math.max(0, Math.min(Number(updated.totalMonths) || 1, Number(value) || 0));
          updated.currentMonth = newCurr;
          // 회차 변경 시 1 ~ newCurr 회차까지 납부완료(paidMonths) 상태로 세팅
          const newPaid = [];
          for (let m = 1; m <= newCurr; m++) {
            newPaid.push(m);
          }
          updated.paidMonths = newPaid;
          updated = calculateInstallment(updated, year, month);
        } else {
          updated[field] = value;
          updated = calculateInstallment(updated, year, month);
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
          updated = calculateInstallment(updated, year, month);
        }
        return updated;
      }
      return item;
    });

    persistSections({ ...sections, installment: newArr });
    setActiveDetailId(null);
  };

  // 상세 회차별 납부 상태 토글 (체크시 해당 회차로 currentMonth 변경 및 paidMonths 재계산)
  const handleTogglePaidMonth = (idx) => {
    if (!activeDetailId) return;
    const newArr = installments.map(item => {
      if (item.id === activeDetailId) {
        const currentPaid = item.paidMonths || [];
        const isPaid = currentPaid.includes(idx);
        
        let newCurr = item.currentMonth;
        let updatedPaid = [];

        if (isPaid) {
          // 회차 체크 해제: idx-1 회차까지 완료로 처리 (회차는 idx-1)
          newCurr = Math.max(0, idx - 1);
          for (let m = 1; m <= newCurr; m++) {
            updatedPaid.push(m);
          }
        } else {
          // 회차 체크 설정: 해당 회차(idx)까지 납부 완료 처리 (회차는 idx)
          newCurr = idx;
          for (let m = 1; m <= idx; m++) {
            updatedPaid.push(m);
          }
        }

        let updated = {
          ...item,
          currentMonth: newCurr,
          paidMonths: updatedPaid
        };
        return calculateInstallment(updated, year, month);
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
    
    // 결제일(payDay)과 사용일(date)을 기반으로 정확한 1회차 청구일 계산
    const payDayVal = activeDetailItem.payDay || (activeDetailItem.card && activeDetailItem.card.includes('삼성') ? 5 : 14);
    const firstBillingDate = getInitialBillingDate(activeDetailItem.date, payDayVal);

    for (let i = 1; i <= months; i++) {
      let remaining = principal - (monthlyPrincipal * (i - 1));
      if (activeDetailItem.repayStatus === 'partial' && activeDetailItem.repaidAmount && i >= activeDetailItem.currentMonth) {
        remaining -= Number(activeDetailItem.repaidAmount) || 0;
        if (remaining < 0) remaining = 0;
      }

      let monthlyFee = Math.floor((remaining * rate / 100) / 12);

      totalFee += monthlyFee;

      const payDate = new Date(firstBillingDate.getFullYear(), firstBillingDate.getMonth() + (i - 1), payDayVal);
      const dateStr = `${String(payDate.getFullYear()).slice(2)}.${String(payDate.getMonth() + 1).padStart(2, '0')}.${String(payDate.getDate()).padStart(2, '0')}`;

      let currentPrincipal = i === months ? principal - (monthlyPrincipal * (months - 1)) : monthlyPrincipal;
      schedule.push({ idx: i, date: dateStr, principal: currentPrincipal, fee: monthlyFee });
    }

    return { calculatedSchedule: schedule, calculatedTotalFee: totalFee };
  }, [activeDetailItem]);

  // 카드 필터 상태 (기본값 '전체')
  const [selectedCardFilter, setSelectedCardFilter] = useState('전체');

  // 등록된 카드 목록 동적 추출 (전체 + 할부 항목에 존재하는 모든 카드사)
  const availableCards = useMemo(() => {
    const set = new Set();
    installments.forEach(i => {
      if (i.card && i.card.trim()) {
        set.add(i.card.trim());
      }
    });
    return ['전체', ...Array.from(set)];
  }, [installments]);

  // 선택된 카드 필터에 따라 할부 목록 필터링
  const filteredInstallments = useMemo(() => {
    if (selectedCardFilter === '전체') return installments;
    return installments.filter(i => (i.card || '').trim() === selectedCardFilter);
  }, [installments, selectedCardFilter]);

  const CARD_OPTIONS = [
    { value: '국민', label: '국민', color: '#eab308' },  // 노랑
    { value: '신한', label: '신한', color: '#3b82f6' },  // 파랑
    { value: '롯데', label: '롯데', color: '#ef4444' },  // 빨강
    { value: '현대', label: '현대', color: '#06b6d4' },  // 민트/청록
    { value: '삼성', label: '삼성', color: '#2563eb' },  // 딥블루
    { value: '우리', label: '우리', color: '#0284c7' },  // 하늘
    { value: '농협', label: '농협', color: '#16a34a' },  // 초록
    { value: '하나', label: '하나', color: '#0d9488' },  // 에메랄드
    { value: 'BC', label: 'BC', color: '#dc2626' },    // 진분홍/버건디
    { value: '카카오', label: '카카오', color: '#facc15' }, // 카카오 노랑
  ];

  const cardsList = CARD_OPTIONS;

  return (
    <>
      {/* 내 카드 관리 및 지난달 대비 지출 비교 섹션 */}
      <CardManagementSection />

      {/* 카드 할부 상세 관리 테이블 */}
      <div className="section-card" style={{ marginBottom: '1.5rem' }}>
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-dot" style={{ background: '#5B6BF8' }} />
            카드 할부
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

        {/* 종료일별 할부 완료 예정 알림 칩 바 (회차 기준 종료월 단위 그룹화) */}
        {(() => {
          const activeItems = installments.filter(r => {
            const calculatedEnd = r.repayStatus === 'full' ? '완납' : computeEndDateByRound(r, year, month);
            const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
            const isExpired = r.repayStatus === 'full' || (calculatedEnd && calculatedEnd < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
            return !isExpired && calculatedEnd && calculatedEnd !== '완납';
          });

          if (activeItems.length === 0) return null;

          // 종료일(computeEndDateByRound) 기준 그룹화
          const groupsMap = {};
          activeItems.forEach(item => {
            const key = computeEndDateByRound(item, year, month) || '미정';
            if (!groupsMap[key]) groupsMap[key] = [];
            groupsMap[key].push(item);
          });

          // 종료일 오름차순 정렬
          const sortedGroupKeys = Object.keys(groupsMap).sort();

          return (
            <div style={{
              padding: '0.85rem 1rem',
              margin: '0.75rem 0.75rem 0',
              background: dark 
                ? (isAccordionOpen ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.025)')
                : (isAccordionOpen ? 'rgba(0, 0, 0, 0.035)' : 'rgba(0, 0, 0, 0.015)'),
              borderRadius: '14px',
              border: isAccordionOpen ? '1px solid var(--border-active, rgba(120, 130, 160, 0.35))' : '1px solid var(--card-border)',
              boxShadow: isAccordionOpen ? '0 2px 10px rgba(0, 0, 0, 0.04)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}>
              <div 
                onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  <span>🎯</span>
                  <span>할부</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    (진행 중 할부 {activeItems.length}건)
                  </span>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    transition: 'transform 0.2s ease',
                    transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justify: 'center'
                  }}>
                    ▼
                  </div>
                </div>
              </div>

              {isAccordionOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.2rem' }}>
                {sortedGroupKeys.map(dateKey => {
                  const items = groupsMap[dateKey];
                  const sampleItem = items[0];
                  const remCount = Math.max(0, (Number(sampleItem.totalMonths) || 1) - (Number(sampleItem.currentMonth) || 0));

                  return (
                    <div 
                      key={dateKey}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.6rem',
                        padding: '0.45rem 0.75rem',
                        borderRadius: '10px',
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--shadow-sm)',
                        fontSize: '0.76rem',
                        flexWrap: 'wrap'
                      }}
                    >
                      {/* 종료월 뱃지 */}
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        fontWeight: 900,
                        color: 'var(--teal)',
                        fontFamily: "'Plus Jakarta Sans', monospace",
                        whiteSpace: 'nowrap',
                        background: 'var(--teal-dim)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.74rem'
                      }}>
                        <span>{dateKey}</span>
                      </div>

                      {/* 할부 사용처 항목들 구분선(/) 조합 */}
                      <div style={{ 
                        flex: 1, 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap'
                      }}>
                        {items.map((it, idx) => (
                          <span key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                            <span>{it.content || it.card || '할부항목'}</span>
                            {idx < items.length - 1 && <span style={{ color: 'var(--text-muted)', opacity: 0.5, fontWeight: 400 }}>/</span>}
                          </span>
                        ))}
                      </div>

                      {/* 그룹 잔여금 총 합계 및 남은 회차 뱃지 */}
                      {(() => {
                        const groupTotal = items.reduce((sum, it) => {
                          const calc = calculateInstallment(it, year, month);
                          return sum + (Number(calc.remAmount) || 0);
                        }, 0);

                        let bg = 'var(--border)';
                        let color = 'var(--text-muted)';
                        let border = 'none';
                        if (remCount === 1 || remCount === 0) {
                          bg = 'var(--coral-dim)';
                          color = 'var(--coral)';
                        } else if (remCount === 2) {
                          bg = 'rgba(1, 143, 40, 0.15)';
                          color = '#018f28';
                        } else if (remCount === 3) {
                          bg = 'rgba(123, 78, 173, 0.15)';
                          color = '#7b4ead';
                        }
                        return (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', monospace", fontSize: '0.74rem' }}>
                              {formatKRW(groupTotal)}원
                            </span>
                            <span style={{
                              fontSize: '0.65rem',
                              padding: '2px 7px',
                              borderRadius: '10px',
                              background: bg,
                              color: color,
                              border: border,
                              fontWeight: 800,
                              whiteSpace: 'nowrap'
                            }}>
                              {items.length > 1 ? `${items.length}건 / ` : ''}{remCount > 0 ? `잔여 ${remCount}회` : '이달 만료'}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          );
        })()}

      {/* card-payments-table-container 영역 상단 우측 카드 필터 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap', padding: '0.6rem 0.75rem 0.35rem' }}>
        {availableCards.map(cardName => {
          const isSelected = selectedCardFilter === cardName;
          const cardOpt = CARD_OPTIONS.find(c => c.value === cardName || c.label === cardName || cardName.includes(c.value));
          const cardBrandColor = cardOpt ? cardOpt.color : '#5B6BF8';
          return (
            <button
              key={cardName}
              onClick={() => setSelectedCardFilter(cardName)}
              style={{
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.73rem',
                fontWeight: isSelected ? 900 : 700,
                border: isSelected 
                  ? `1px solid ${cardBrandColor}` 
                  : (dark ? '1px solid rgba(255,255,255,0.15)' : '1px solid var(--border)'),
                background: isSelected 
                  ? cardBrandColor 
                  : (dark ? 'rgba(255,255,255,0.05)' : 'var(--card)'),
                color: isSelected 
                  ? (cardBrandColor === '#eab308' || cardBrandColor === '#facc15' ? '#000000' : '#ffffff') 
                  : cardBrandColor,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 2px 8px ${cardBrandColor}66` : 'none'
              }}
            >
              {cardName}
            </button>
          );
        })}
      </div>

      <div className="card-payments-table-container" style={{ padding: '0.75rem 0.75rem 1.5rem', overflowX: 'auto' }}>
        <table className="data-table card-payments-compact-table installment-table" style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: 110, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>사용일</th>
              <th style={{ width: 75, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>카드</th>
              <th style={{ padding: '6px 6px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>사용처</th>
              <th style={{ width: 100, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>총금액</th>
              <th style={{ width: 65, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>이율(%)</th>
              <th style={{ width: 80, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>회차</th>
              <th style={{ width: 90, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>원금</th>
              <th style={{ width: 85, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>수수료</th>
              <th style={{ width: 95, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>원금+수수료</th>
              <th style={{ width: 95, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>잔액</th>
              <th style={{ width: 60, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>종료</th>
              <th style={{ width: 75, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.length === 0 && (
              <tr>
                <td colSpan="12" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  {selectedCardFilter === '전체' ? '등록된 할부 내역이 없습니다.' : `'${selectedCardFilter}' 등록/해당되는 할부 내역이 없습니다.`}
                </td>
              </tr>
            )}
            {filteredInstallments.map(r => {
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
                      options={CARD_OPTIONS}
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
                      allowDecimal={true}
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
                  <td className="amount-cell num" style={{ color: isExpired ? 'var(--text-muted)' : 'var(--teal)', fontWeight: 'bold' }}>
                    {formatKRW(isExpired || Number(r.currentMonth) === 0 ? 0 : (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0))}
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
                    title={isExpired ? '만료된 할부 내역입니다.' : `[남은 잔액 상세 계산 내역]\n• 총 결제 금액: ${formatKRW(r.amount)}원\n• 매월 납부 원금: ${formatKRW(r.monthlyPrincipal)}원 x ${r.totalMonths}개월\n• 현재 진행 회차: ${r.currentMonth}/${r.totalMonths}회차\n• 남은 납부 회차: ${Math.max(0, (Number(r.totalMonths) || 0) - (Number(r.currentMonth) || 0))}회차 (${formatKRW(Math.max(0, (Number(r.totalMonths) || 0) - (Number(r.currentMonth) || 0)) * r.monthlyPrincipal)}원)\n${r.repayStatus === 'partial' ? `• 일부 상환 누적액: -${formatKRW(r.repaidAmount)}원\n` : ''}---------------------------------\n= 최종 남은 잔액: ${formatKRW(r.remAmount)}원`}
                  >
                    {formatKRW(isExpired ? 0 : r.remAmount)}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.8rem', ...endDateStyle }}>
                    {r.repayStatus === 'full' ? '완납' : (computeEndDateByRound(r, year, month) || r.endDate || '—')}
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
                        title="삭제"
                      >
                        <span className="desktop-only-text">삭제</span>
                        <span className="mobile-only-text" style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>×</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {filteredInstallments.length > 0 && (() => {
            const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
            const totals = filteredInstallments.reduce((acc, r) => {
              const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
              acc.amount += Number(r.amount) || 0;
              if (!isExpired && Number(r.currentMonth) !== 0) {
                const principal = Number(r.monthlyPrincipal) || 0;
                const fee = Number(r.monthlyFee) || 0;
                acc.monthlyPrincipal += principal;
                acc.monthlyFee += fee;
                acc.totalMonthly += (principal + fee);
              }
              if (!isExpired) {
                acc.remAmount += Number(r.remAmount) || 0;
              }
              return acc;
            }, { amount: 0, monthlyPrincipal: 0, monthlyFee: 0, totalMonthly: 0, remAmount: 0 });

            return (
              <tfoot>
                <tr style={{ 
                  backgroundColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                  fontWeight: 'bold',
                  borderTop: '2px solid var(--border)'
                }}>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 800 }}>
                    {selectedCardFilter === '전체' ? '합계' : `${selectedCardFilter} 합계`}
                  </td>
                  <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 900 }}>
                    {formatKRW(totals.amount)}
                  </td>
                  <td colSpan="2" style={{ textAlign: 'center' }}></td>
                  <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 900 }}>
                    {formatKRW(totals.monthlyPrincipal)}
                  </td>
                  <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--teal)', fontWeight: 900 }}>
                    {formatKRW(totals.monthlyFee)}
                  </td>
                  <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--teal)', fontWeight: 900 }}>
                    {formatKRW(totals.totalMonthly)}
                  </td>
                  <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--coral)', fontWeight: 900 }}>
                    {formatKRW(totals.remAmount)}
                  </td>
                  <td colSpan="2" style={{ textAlign: 'center' }}></td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>

      {/* 모바일 버전: 간소화 카드 리스트 */}
      <div className="mobile-installment-list" style={{ padding: '0 1rem 1rem' }}>
        {filteredInstallments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            {selectedCardFilter === '전체' ? '등록된 할부 내역이 없습니다.' : `'${selectedCardFilter}' 등록/해당되는 할부 내역이 없습니다.`}
          </div>
        ) : (
          filteredInstallments.map(r => {
            const currentTag = `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
            const isExpired = r.repayStatus === 'full' || (r.endDate && r.endDate < currentTag) || (Number(r.currentMonth) > Number(r.totalMonths));
            const monthlyAmt = (Number(r.monthlyPrincipal) || 0) + (Number(r.monthlyFee) || 0);

            return (
              <div 
                key={r.id}
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  opacity: isExpired ? 0.7 : 1,
                  position: 'relative'
                }}
              >
                {/* 상단: 사용일 및 카드사 배지 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    📅 {r.date || '—'}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {(() => {
                      const cName = (r.card || '').trim();
                      let bg = isExpired ? 'var(--border)' : 'var(--orange-dim)';
                      let color = isExpired ? 'var(--text-muted)' : 'var(--orange)';
                      let border = 'none';

                      if (!isExpired) {
                        if (cName.includes('신한')) {
                          bg = dark ? 'rgba(0, 70, 255, 0.25)' : 'rgba(0, 70, 255, 0.12)';
                          color = dark ? '#60a5fa' : '#0046ff';
                          border = dark ? '1px solid rgba(96, 165, 250, 0.35)' : '1px solid rgba(0, 70, 255, 0.25)';
                        } else if (cName.includes('국민') || cName.includes('KB')) {
                          bg = dark ? 'rgba(255, 188, 0, 0.22)' : 'rgba(230, 165, 0, 0.14)';
                          color = dark ? '#ffbc00' : '#d97706';
                          border = dark ? '1px solid rgba(255, 188, 0, 0.4)' : '1px solid rgba(217, 119, 6, 0.3)';
                        } else if (cName.includes('삼성')) {
                          bg = dark ? 'rgba(56, 189, 248, 0.22)' : 'rgba(11, 37, 69, 0.12)';
                          color = dark ? '#38bdf8' : '#0284c7';
                          border = dark ? '1px solid rgba(56, 189, 248, 0.38)' : '1px solid rgba(2, 132, 199, 0.28)';
                        } else if (cName.includes('현대')) {
                          bg = dark ? 'rgba(228, 228, 231, 0.18)' : 'rgba(24, 24, 27, 0.08)';
                          color = dark ? '#e4e4e7' : '#27272a';
                          border = dark ? '1px solid rgba(228, 228, 231, 0.3)' : '1px solid rgba(39, 39, 42, 0.2)';
                        } else if (cName.includes('롯데')) {
                          bg = dark ? 'rgba(252, 165, 165, 0.2)' : 'rgba(153, 27, 27, 0.1)';
                          color = dark ? '#fca5a5' : '#dc2626';
                          border = dark ? '1px solid rgba(252, 165, 165, 0.35)' : '1px solid rgba(220, 38, 38, 0.25)';
                        }
                      }

                      return (
                        <span style={{
                          fontSize: '0.65rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: bg,
                          color: color,
                          border: border,
                          fontWeight: 700
                        }}>
                          {r.card}
                        </span>
                      );
                    })()}
                    {isExpired && (
                      <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(120, 120, 120, 0.1)', color: 'var(--text-muted)', fontWeight: 700 }}>
                        종료
                      </span>
                    )}
                  </div>
                </div>

                {/* 중단: 사용처 및 총액 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.content || '할부 내역'}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                    총 {formatKRW(r.amount)}원
                  </div>
                </div>

                {/* 하단: 회차 / 이달 청구 금액 / 잔액 */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: '4px',
                  background: 'var(--bg)',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  marginTop: '4px'
                }}>
                  <div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>회차</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {r.currentMonth}/{r.totalMonths}회
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>이달 청구</div>
                    <div style={{ fontWeight: 800, color: isExpired ? 'var(--text-muted)' : 'var(--teal)' }}>
                      {isExpired ? '0원' : `${formatKRW(monthlyAmt)}원`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>남은 잔액</div>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {formatKRW(r.remAmount)}원
                    </div>
                  </div>
                </div>

                {/* 관리 버튼 */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
                  <button 
                    className="btn btn-ghost btn-xs"
                    style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                    onClick={() => handleDetail(r.id)}
                  >
                    상세보기
                  </button>
                  <button 
                    className="btn btn-dark btn-xs"
                    style={{ fontSize: '0.7rem', padding: '3px 8px', color: 'var(--coral)' }}
                    onClick={() => handleDelete(r.id)}
                    title="삭제"
                  >
                    <span className="desktop-only-text">삭제</span>
                    <span className="mobile-only-text" style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>×</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
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

            {/* 결제일 설정 및 상환 관리 */}
            <div style={{
              background: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>카드 청구 결제일</label>
                <CustomDropdown 
                  value={String(activeDetailItem.payDay || (activeDetailItem.card && activeDetailItem.card.includes('삼성') ? 5 : 14))} 
                  onChange={(val) => handleFieldChange(activeDetailItem.id, 'payDay', parseInt(val))} 
                  options={[
                    { value: '1', label: '매월 1일' },
                    { value: '5', label: '매월 5일 (삼성 등)' },
                    { value: '10', label: '매월 10일' },
                    { value: '14', label: '매월 14일 (기본)' },
                    { value: '15', label: '매월 15일' },
                    { value: '20', label: '매월 20일' },
                    { value: '25', label: '매월 25일' }
                  ]}
                />
              </div>

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
    </>
  );
}
