import { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';
import CustomDropdown from '../UI/CustomDropdown';

export default function CardPaymentsPage() {
  const { getCurrentSections, persistSections, year, month, dark, yearData } = useApp();

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

  // --- 드래그 앤 드롭 상태 및 핸들러 ---
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (e, idx) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', idx);
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetIdx) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    const reorderedPayments = [...cardPayments];
    const [removed] = reorderedPayments.splice(draggedIdx, 1);
    reorderedPayments.splice(targetIdx, 0, removed);

    persistSections({ ...sections, cardPayments: reorderedPayments });
    setDraggedIdx(null);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // --- 날짜순 정렬 헬퍼 ---
  const handleSortByDate = () => {
    if (!confirm('납부일을 기준으로 정렬하시겠습니까? 현재 임의 정렬 순서가 덮어씌워집니다.')) return;
    const sorted = [...cardPayments].sort((a, b) => getDayValue(a.payDate) - getDayValue(b.payDate));
    persistSections({ ...sections, cardPayments: sorted });
  };


  // --- 항목별 라인 설정 (첨부 이미지 스타일 색상 적용: 노랑, 주황-레드, 핑크, 보라, 파랑) ---
  const lineConfigs = {
    total: { label: '전체', color: '#ffb703', gradId: 'totalGrad', areaGradId: 'totalAreaGrad', dimColor: 'rgba(255, 183, 3, 0.15)' },
    cash: { label: '현금', color: '#f77f00', gradId: 'cashGrad', areaGradId: 'cashAreaGrad', dimColor: 'rgba(247, 127, 0, 0.15)' },
    card: { label: '카드', color: '#e63946', gradId: 'cardGrad', areaGradId: 'cardAreaGrad', dimColor: 'rgba(230, 57, 70, 0.15)' },
    jisan: { label: '지산', color: '#8a2be2', gradId: 'jisanGrad', areaGradId: 'jisanAreaGrad', dimColor: 'rgba(138, 43, 226, 0.15)' },
    kabank: { label: '카뱅', color: '#2563eb', gradId: 'kabankGrad', areaGradId: 'kabankAreaGrad', dimColor: 'rgba(37, 99, 235, 0.15)' }
  };

  // --- 라인 활성화 토글 상태 (기본값: '전체' 칩만 활성화) ---
  const [activeLines, setActiveLines] = useState({
    total: true,
    cash: false,
    card: false,
    jisan: false,
    kabank: false
  });

  const handleFilterToggle = (selectedKey) => {
    setHoveredPoint(null);
    setActiveLines(prev => {
      // 1. '전체(total)' 칩 클릭 시: 전체 칩만 단독 켜고 개별 칩은 끔 (그래프는 4개 항목 모두 표시됨)
      if (selectedKey === 'total') {
        return {
          total: true,
          cash: false,
          card: false,
          jisan: false,
          kabank: false
        };
      }

      // 2. 개별 항목(현금, 카드, 지산, 카뱅 등) 클릭 시:
      // 기존에 '전체(total)' 상태였다면, '전체' 칩을 끄고 클릭한 개별 항목만 켬 (예: 현금만 표시)
      // 이미 개별 필터 모드라면, 클릭한 개별 칩을 추가 토글 (예: 현금 켜진 상태에서 카드 클릭 시 현금+카드 표시)
      let nextState;
      if (prev.total) {
        nextState = {
          total: false,
          cash: false,
          card: false,
          jisan: false,
          kabank: false,
          [selectedKey]: true
        };
      } else {
        nextState = {
          ...prev,
          total: false,
          [selectedKey]: !prev[selectedKey]
        };
      }

      // 개별 항목(cash, card, jisan, kabank) 4개가 모두 켜진 경우 -> 자동으로 '전체' 칩만 켜는 기본 상태로 전환
      const individualKeys = ['cash', 'card', 'jisan', 'kabank'];
      const allIndividualActive = individualKeys.every(k => nextState[k]);
      if (allIndividualActive) {
        return {
          total: true,
          cash: false,
          card: false,
          jisan: false,
          kabank: false
        };
      }

      // 개별 항목이 모두 꺼진 경우 -> 다시 기본값인 '전체' 칩 선택 상태로 복구
      const hasAnyActive = individualKeys.some(k => nextState[k]);
      if (!hasAnyActive) {
        return {
          total: true,
          cash: false,
          card: false,
          jisan: false,
          kabank: false
        };
      }

      return nextState;
    });
  };

  // --- 12개월 변동 추이 데이터 집계 (카테고리별 분할) ---
  const chartData = useMemo(() => {
    const yd = yearData[year] || {};
    const monthsData = yd.months || {};
    return Array.from({ length: 12 }, (_, i) => {
      const mNum = i + 1;
      const mKeyPadded = String(mNum).padStart(2, '0');
      const mKeyUnpadded = String(mNum);
      const mData = monthsData[mKeyPadded] || monthsData[mKeyUnpadded] || {};
      const mSections = mData.sections || {};
      const payments = mSections.cardPayments || [];
      const cardSummaries = mSections.cardMonthlySummaries || [];
      
      let cashTotal = 0;
      let jisan = 0;
      let kabank = 0;

      // 현금 납부 항목 집계
      payments.forEach(p => {
        const amt = Number(p.amount) || 0;
        const name = String(p.item || '').toLowerCase();
        
        cashTotal += amt;
        if (name.includes('지산')) {
          jisan += amt;
        } else if (name.includes('카뱅') || name.includes('카카오')) {
          kabank += amt;
        }
      });

      // 해당 월의 카드 사용 금액 합계 (cardMonthlySummaries 의 이달 결제금액 합계)
      const card = cardSummaries.reduce((sum, item) => sum + (Number(item.currentMonthTotal) || 0), 0);

      // 전체 납부 필요 금액 (현금 납부 + 카드 사용 금액)
      const total = cashTotal + card;

      return {
        month: `${mNum}월`,
        total,
        cash: cashTotal,
        card,
        jisan,
        kabank
      };
    });
  }, [yearData, year]);

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isIncomeHovered, setIsIncomeHovered] = useState(false);
  const [isExpenseHovered, setIsExpenseHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isPrepaidHovered, setIsPrepaidHovered] = useState(false);

  // 수입 대비 지출 6개 카드의 순서 상태 (localStorage 동기화)
  const defaultCardOrder = ['income', 'cash', 'card', 'difference', 'totalExpense', 'prepaid'];
  const [cardOrder, setCardOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_summary_card_order');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) return parsed;
      }
    } catch(e) {}
    return defaultCardOrder;
  });

  const [draggedCardKey, setDraggedCardKey] = useState(null);
  const [dragOverCardKey, setDragOverCardKey] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const incomeCardRef = useRef(null);
  const expenseCardRef = useRef(null);
  const cardCardRef = useRef(null);
  const prepaidCardRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (incomeCardRef.current && !incomeCardRef.current.contains(e.target)) {
        setIsIncomeHovered(false);
      }
      if (expenseCardRef.current && !expenseCardRef.current.contains(e.target)) {
        setIsExpenseHovered(false);
      }
      if (cardCardRef.current && !cardCardRef.current.contains(e.target)) {
        setIsCardHovered(false);
      }
      if (prepaidCardRef.current && !prepaidCardRef.current.contains(e.target)) {
        setIsPrepaidHovered(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // --- SVG Chart Dimensions ---
  const width = 800;
  const height = 340;
  const paddingLeft = 55;
  const paddingRight = 15;
  const paddingTop = 25;
  const paddingBottom = 30;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // --- 활성화된 라인 중의 최댓값 탐색 (자동 스케일용) ---
  const maxVal = useMemo(() => {
    let vals = [1000000]; // 최소 기준 100만 원
    chartData.forEach(d => {
      if (activeLines.total) vals.push(d.total);
      if (activeLines.card) vals.push(d.card);
      if (activeLines.jisan) vals.push(d.jisan);
      if (activeLines.kabank) vals.push(d.kabank);
    });
    return Math.max(...vals);
  }, [chartData, activeLines]);

  // --- 라인별 경로 생성 헬퍼 ---
  const getLinePaths = (key) => {
    const pts = chartData.map((d, i) => {
      const x = paddingLeft + (i * (plotWidth / 11));
      const val = d[key] || 0;
      const y = paddingTop + plotHeight - (val / maxVal * plotHeight);
      return { x, y };
    });
    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaPath = `${linePath} L ${pts[11].x} ${paddingTop + plotHeight} L ${pts[0].x} ${paddingTop + plotHeight} Z`;
    return { linePath, areaPath, pts };
  };

  const columnWidth = plotWidth / 11;
  const hoverZones = Array.from({ length: 12 }, (_, i) => {
    const x = paddingLeft + (i * columnWidth) - (columnWidth / 2);
    const w = columnWidth;
    return { x, w, index: i, point: chartData[i] };
  });

  const gridLines = [0, 0.5, 1].map(ratio => {
    const y = paddingTop + plotHeight - (ratio * plotHeight);
    const val = ratio * maxVal;
    return { y, val };
  });

  const formatShorthand = (val) => {
    if (val >= 10000) {
      return `${(val / 10000).toLocaleString(undefined, { maximumFractionDigits: 0 })}만원`;
    }
    return `${val.toLocaleString()}원`;
  };

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
      amount: 0,
      details: []
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

  const handleCopyPrevMonthData = () => {
    let prevYearVal = parseInt(year);
    let prevMonthVal = parseInt(month) - 1;
    if (prevMonthVal === 0) {
      prevMonthVal = 12;
      prevYearVal -= 1;
    }
    const prevYearStr = String(prevYearVal);
    const prevMonthStrPadded = String(prevMonthVal).padStart(2, '0');
    const prevMonthStrUnpadded = String(prevMonthVal);

    const prevYd = yearData[prevYearStr] || {};
    const prevMonths = prevYd.months || {};
    const prevMonthData = prevMonths[prevMonthStrUnpadded] || prevMonths[prevMonthStrPadded] || {};
    const prevSections = prevMonthData.sections || {};
    const prevPayments = prevSections.cardPayments || [];

    const prevSummaries = prevSections.cardMonthlySummaries || [];

    if (prevPayments.length === 0 && prevSummaries.length === 0) {
      alert(`${prevYearVal}년 ${prevMonthVal}월(전월) 데이터가 없습니다.`);
      return;
    }

    const currentSummaries = sections.cardMonthlySummaries || [];
    if ((cardPayments.length > 0 || currentSummaries.length > 0) && !confirm(`현재 작성된 데이터가 모두 지워지고 ${prevYearVal}년 ${prevMonthVal}월 데이터로 대체/이월 복사됩니다. 계속하시겠습니까?`)) {
      return;
    }

    // 1) 현금 필수 자금 복사 (ID 재발행 및 입금여부 isPaid 초기화)
    const copiedPayments = prevPayments.map((p, idx) => {
      const copiedDetails = Array.isArray(p.details)
        ? p.details.map(d => ({
            content: d.content || '',
            card: d.card || '',
            amount: Number(d.amount) || 0
          }))
        : [];
      return {
        id: Date.now() + idx,
        payDate: p.payDate,
        item: p.item,
        amount: p.amount,
        isPaid: false,
        details: copiedDetails
      };
    });

    // 2) 카드별 결제금액 이월 복사
    // 전월(7월)의 "다음달 결제액(nextMonthExpected)" -> 당월(8월)의 "이달 결제액(currentMonthTotal)"으로 이월
    // 당월(8월)의 "다음달 결제액(nextMonthExpected)" -> 0원으로 초기화
    const copiedSummaries = prevSummaries.map((s, idx) => {
      const prevNextMonthExpected = Number(s.nextMonthExpected) || 0;
      return {
        id: Date.now() + 1000 + idx,
        cardName: s.cardName || '신한카드',
        payDate: s.payDate || '14일',
        currentMonthTotal: prevNextMonthExpected, // 전월 다음달 결제예정액이 이번달 결제액으로 이월
        nextMonthExpected: 0,                   // 새로운 이번달의 다음달 결제액은 0원으로 초기화
        note: s.note || ''
      };
    });

    persistSections({
      ...sections,
      cardPayments: copiedPayments,
      cardMonthlySummaries: copiedSummaries
    });
  };

  // --- 상세 내역 관리 모달 상태 및 핸들러 ---
  const [detailPayment, setDetailPayment] = useState(null);

  const handleOpenDetails = (p) => {
    setDetailPayment(JSON.parse(JSON.stringify(p)));
  };

  const handleAddDetailRow = () => {
    if (!detailPayment) return;
    const newDetails = [...(detailPayment.details || [])];
    newDetails.push({ content: '', card: '', amount: 0 });
    setDetailPayment({ ...detailPayment, details: newDetails });
  };

  const handleDeleteDetailRow = (idx) => {
    if (!detailPayment) return;
    const newDetails = (detailPayment.details || []).filter((_, i) => i !== idx);
    setDetailPayment({ ...detailPayment, details: newDetails });
  };

  const handleDetailFieldChange = (idx, field, value) => {
    if (!detailPayment) return;
    const newDetails = (detailPayment.details || []).map((d, i) => {
      if (i === idx) {
        return { ...d, [field]: value };
      }
      return d;
    });
    setDetailPayment({ ...detailPayment, details: newDetails });
  };

  const handleSaveDetails = () => {
    const updatedCardPayments = cardPayments.map(p => {
      if (p.id === detailPayment.id) {
        return {
          ...p,
          details: detailPayment.details || []
        };
      }
      return p;
    });
    persistSections({ ...sections, cardPayments: updatedCardPayments });
    setDetailPayment(null);
  };

  const detailsSum = useMemo(() => {
    if (!detailPayment) return 0;
    return (detailPayment.details || []).reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
  }, [detailPayment]);

  const paymentsTotalAmount = useMemo(() => {
    return cardPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [cardPayments]);

  // 수입 내역 합계 계산
  const totalIncome = useMemo(() => {
    return (sections.income || []).reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
  }, [sections.income]);

  // 메뉴 > 카드 내역 페이지 하단의 카드별 결제금액 내역(cardMonthlySummaries)의 이달 결제금액 기준 계산
  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  const cardTotalAmount = useMemo(() => {
    return cardMonthlySummaries.reduce((a, r) => {
      return a + (Number(r.currentMonthTotal) || 0);
    }, 0);
  }, [cardMonthlySummaries]);

  // 카드별 결제 내역 그룹핑
  const cardBreakdown = useMemo(() => {
    return cardMonthlySummaries.map(item => ({
      card: item.cardName || '카드',
      amount: Number(item.currentMonthTotal) || 0,
      isPaid: !!item.isPaid || !!item.isPrepaid
    })).filter(item => item.amount > 0);
  }, [cardMonthlySummaries]);

  // 선납/선결제 완료 총액 계산 (현금 완료 + 카드 완료)
  const totalPrepaidAmount = useMemo(() => {
    const cashPaidSum = cardPayments.filter(p => p.isPaid).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const cardPaidSum = cardMonthlySummaries.filter(s => s.isPaid).reduce((sum, s) => sum + (Number(s.currentMonthTotal) || 0), 0);
    return cashPaidSum + cardPaidSum;
  }, [cardPayments, cardMonthlySummaries]);

  // 부족금액 = 수입 - (현금 지출 + 카드 지출)
  const totalOutflow = paymentsTotalAmount + cardTotalAmount;
  const difference = totalIncome - totalOutflow;
  const isShortage = difference < 0;
  const absDifference = Math.abs(difference);

  // 퍼센트율 계산 (수입 대비 총지출(현금+카드) 비율)
  const percent = totalIncome > 0 ? (totalOutflow / totalIncome) * 100 : (totalOutflow > 0 ? 100 : 0);
  const clampedPercent = Math.min(percent, 100);

  return (
    <>
      {/* 12개월 필요 자금 변동 추이 차트 (Hyper Charts UI Kit Premium Edition) */}
      <div className="section-card" style={{
        marginBottom: '1.5rem',
        padding: '1.75rem 2rem',
        background: dark 
          ? 'linear-gradient(180deg, #090d16 0%, #05080f 100%)' 
          : '#ffffff',
        border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #e2e8f0',
        borderRadius: '24px',
        boxShadow: dark 
          ? '0 25px 60px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
          : '0 20px 40px -15px rgba(0, 0, 0, 0.05), inset 0 1px 0 #ffffff',
        position: 'relative',
        overflow: 'hidden',
        color: dark ? '#ffffff' : '#0f172a'
      }}>
        {/* Hyper Charts 메쉬 도트 배경 */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: dark 
            ? 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.03) 1.2px, transparent 1.2px)'
            : 'radial-gradient(circle at 50% 50%, rgba(148, 163, 184, 0.08) 1.2px, transparent 1.2px)',
          backgroundSize: '20px 20px',
          pointerEvents: 'none'
        }} />

        {/* --- 첨부 문서 100% 동일: 차트 상단 헤더 (타이틀 + 구분선 + 필터 칩스) --- */}
        <div style={{ position: 'relative', zIndex: 10, marginBottom: '1.25rem' }}>
          {/* 차트 타이틀 바 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            borderBottom: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#00f2fe',
              boxShadow: '0 0 12px #00f2fe, 0 0 20px #00f2fe',
              flexShrink: 0
            }} />
            <span style={{ 
              fontSize: '1.05rem', 
              fontWeight: 900, 
              letterSpacing: '-0.02em', 
              color: dark ? '#ffffff' : '#0f172a'
            }}>
              납부 변동 추이
            </span>
            <span style={{
              fontSize: '0.68rem', 
              color: dark ? 'rgba(255, 255, 255, 0.45)' : '#94a3b8',
              fontWeight: 700, 
              letterSpacing: '0.08em',
              textTransform: 'uppercase', 
              marginLeft: '6px'
            }}>
              PAYMENT TREND ANALYTICS
            </span>
          </div>

          {/* 필터 칩스 버튼 그룹 (첨부 문서 스타일) */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(lineConfigs).map(([key, cfg]) => {
              const isActive = activeLines[key];
              return (
                <button
                  key={key}
                  onClick={() => handleFilterToggle(key)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 14px',
                    borderRadius: '99px',
                    border: `1px solid ${isActive ? cfg.color : (dark ? 'rgba(255, 255, 255, 0.12)' : '#e2e8f0')}`,
                    background: isActive ? (dark ? `${cfg.color}25` : `${cfg.color}15`) : (dark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff'),
                    color: isActive ? (dark ? '#ffffff' : (key === 'total' ? '#d97706' : cfg.color)) : (dark ? 'rgba(255, 255, 255, 0.5)' : '#64748b'),
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? `0 2px 10px ${cfg.color}25` : 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.color, boxShadow: isActive ? `0 0 6px ${cfg.color}` : 'none', flexShrink: 0 }} />
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* --- Hyper Charts UI Kit: Hyper Smooth Spline Line & Area Glow Chart SVG --- */}
        {(() => {
          const svgW = 920;
          const svgH = 340;
          const paddingLeft = 60;
          const paddingRight = 35;
          const paddingTop = 30;
          const paddingBottom = 45;

          const chartW = svgW - paddingLeft - paddingRight;
          const chartH = svgH - paddingTop - paddingBottom;

          // 데이터 최대값 산출
          let maxVal = 0;
          chartData.forEach(d => {
            Object.keys(lineConfigs).forEach(key => {
              if (activeLines[key] && d[key] > maxVal) {
                maxVal = d[key];
              }
            });
          });
          if (maxVal === 0) maxVal = 1000000;
          maxVal = Math.ceil(maxVal * 1.15 / 100000) * 100000;

          // 12개월 X 좌표
          const pointsX = chartData.map((_, i) => paddingLeft + (i / 11) * chartW);

          // Hyper Charts 팔레트
          const hyperColors = {
            total: '#ffb703',
            cash: '#f97316',
            card: '#ef4444',
            jisan: '#8b5cf6',
            kabank: '#06b6d4'
          };

          return (
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
              <svg 
                width="100%" 
                height={svgH} 
                viewBox={`0 0 ${svgW} ${svgH}`} 
                style={{ overflow: 'visible', minWidth: '750px' }}
              >
                <defs>
                  {/* Hyper Area Glow 그라디언트 */}
                  {Object.entries(lineConfigs).map(([key, cfg]) => {
                    const c = hyperColors[key] || cfg.color;
                    return (
                      <linearGradient key={`hyperGrad-${key}`} id={`hyperGrad-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={c} stopOpacity={dark ? "0.45" : "0.28"} />
                        <stop offset="60%" stopColor={c} stopOpacity={dark ? "0.1" : "0.05"} />
                        <stop offset="100%" stopColor={c} stopOpacity="0.0" />
                      </linearGradient>
                    );
                  })}

                  {/* Hyper Soft Neon Filter */}
                  <filter id="hyperGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* 1. Y축 수평 점선 가이드선 & 수치 라벨 */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const val = maxVal * (1 - ratio);
                  const y = paddingTop + ratio * chartH;
                  return (
                    <g key={`y-grid-${idx}`}>
                      <line 
                        x1={paddingLeft} y1={y} 
                        x2={paddingLeft + chartW} y2={y} 
                        stroke={dark ? "rgba(255, 255, 255, 0.08)" : "#f1f5f9"} 
                        strokeDasharray="4 4" 
                      />
                      <text 
                        x={paddingLeft - 14} y={y + 4} 
                        textAnchor="end" 
                        fill={dark ? "rgba(255, 255, 255, 0.4)" : "#94a3b8"} 
                        fontSize="10" 
                        fontWeight="700" 
                        fontFamily="'Plus Jakarta Sans', monospace"
                      >
                        {val >= 10000 ? `${(val / 10000).toFixed(0)}만` : formatKRW(val)}
                      </text>
                    </g>
                  );
                })}

                {/* 2. X축 월 레이블 및 버티컬 가이드선 */}
                {pointsX.map((x, i) => {
                  const isCurMonth = month === (i + 1);
                  const isHovered = hoveredPoint && hoveredPoint.month === `${i + 1}월`;
                  return (
                    <g key={`x-axis-${i}`}>
                      <line 
                        x1={x} y1={paddingTop} 
                        x2={x} y2={paddingTop + chartH} 
                        stroke={isHovered ? (dark ? "#38bdf8" : "#2563eb") : "transparent"} 
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                      <text 
                        x={x} y={paddingTop + chartH + 22} 
                        textAnchor="middle" 
                        fill={dark ? (isCurMonth ? "#38bdf8" : "rgba(255, 255, 255, 0.5)") : (isCurMonth ? "#2563eb" : "#94a3b8")} 
                        fontSize={isCurMonth ? "12" : "11"} 
                        fontWeight={isCurMonth ? "900" : "700"}
                        fontFamily="'Plus Jakarta Sans', sans-serif"
                      >
                        {i + 1}월
                      </text>
                    </g>
                  );
                })}

                {/* X축 마우스 인터랙티브 힛박스 */}
                {pointsX.map((x, i) => {
                  const colW = chartW / 11;
                  const targetData = chartData[i];
                  return (
                    <rect
                      key={`hit-${i}`}
                      x={x - colW / 2}
                      y={0}
                      width={colW}
                      height={svgH}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setHoveredPoint(targetData)}
                      onMouseEnter={() => setHoveredPoint(targetData)}
                    />
                  );
                })}

                {/* 3. Hyper Spline Curved Line & Smooth Area Glow 렌더링 */}
                {Object.entries(lineConfigs).map(([key, cfg]) => {
                  if (key === 'total') return null;
                  const isLineVisible = activeLines.total || activeLines[key];
                  if (!isLineVisible) return null;

                  const linePoints = chartData.map((d, i) => {
                    const val = d[key] || 0;
                    const y = paddingTop + (1 - val / maxVal) * chartH;
                    return { x: pointsX[i], y, val, month: d.month };
                  });

                  // Cubic Bezier Spline 계산
                  let pathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
                  let areaD = `M ${linePoints[0].x} ${paddingTop + chartH} L ${linePoints[0].x} ${linePoints[0].y}`;

                  for (let i = 0; i < linePoints.length - 1; i++) {
                    const p0 = linePoints[i];
                    const p1 = linePoints[i + 1];
                    const cx1 = p0.x + (p1.x - p0.x) * 0.45;
                    const cy1 = p0.y;
                    const cx2 = p0.x + (p1.x - p0.x) * 0.55;
                    const cy2 = p1.y;

                    pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
                    areaD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1.y}`;
                  }

                  areaD += ` L ${linePoints[linePoints.length - 1].x} ${paddingTop + chartH} Z`;

                  const strokeColor = hyperColors[key] || cfg.color;

                  return (
                    <g key={`hyper-line-${key}`} style={{ pointerEvents: 'none' }}>
                      {/* Area Glow Fill */}
                      <path d={areaD} fill={`url(#hyperGrad-${key})`} />

                      {/* Smooth Spline Line */}
                      <path 
                        d={pathD} 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth={dark ? "3.5" : "4"} 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        filter={dark ? "url(#hyperGlow)" : "none"} 
                      />

                      {/* Node Circles (Hyper Ring Node) */}
                      {linePoints.map((p, idx) => {
                        const isHovered = hoveredPoint && hoveredPoint.month === p.month;
                        const isCurMonth = month === (idx + 1);
                        if (!isHovered && !isCurMonth) return null;

                        return (
                          <g key={`node-${idx}`}>
                            {/* Outer Glow Ring */}
                            <circle 
                              cx={p.x} cy={p.y} r={isHovered ? 8 : 6} 
                              fill={dark ? "#090d16" : "#ffffff"} 
                              stroke={strokeColor} 
                              strokeWidth="3" 
                              style={{ transition: 'all 0.2s ease' }} 
                            />
                            {/* Inner Dot */}
                            <circle 
                              cx={p.x} cy={p.y} r={isHovered ? 4 : 3} 
                              fill={strokeColor} 
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                })}

                {/* 4. Hyper Glassmorphism Floating Tooltip Card */}
                {hoveredPoint && (
                  (() => {
                    const idx = chartData.findIndex(d => d.month === hoveredPoint.month);
                    const hoverX = pointsX[idx];
                    const tooltipW = 200;
                    const tooltipH = 135;
                    const posX = Math.min(Math.max(hoverX - tooltipW / 2, 10), svgW - tooltipW - 10);

                    return (
                      <g transform={`translate(${posX}, 15)`} style={{ pointerEvents: 'none', transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                        <foreignObject width={tooltipW} height={tooltipH} style={{ overflow: 'visible' }}>
                          <div style={{
                            background: dark ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
                            border: dark ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid #bfdbfe',
                            borderRadius: '16px',
                            padding: '12px 14px',
                            boxShadow: dark 
                              ? '0 16px 40px rgba(0, 0, 0, 0.6), 0 0 25px rgba(56, 189, 248, 0.2)' 
                              : '0 12px 30px rgba(37, 99, 235, 0.12)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            color: dark ? '#ffffff' : '#0f172a',
                            animation: 'chartTooltipFadeIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #f1f5f9', paddingBottom: '6px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '0.82rem', fontWeight: 900, color: dark ? '#38bdf8' : '#2563eb' }}>
                                {hoveredPoint.month} 납부 분석
                              </span>
                              <span style={{ fontSize: '0.68rem', background: dark ? 'rgba(56, 189, 248, 0.15)' : '#eff6ff', color: dark ? '#38bdf8' : '#2563eb', padding: '2px 8px', borderRadius: '99px', fontWeight: 800 }}>
                                {hoveredPoint.total > 0 ? formatKRW(hoveredPoint.total) + '원' : '0원'}
                              </span>
                            </div>

                            {Object.entries(lineConfigs).map(([key, cfg]) => {
                              if (key === 'total') return null;
                              const isLineVisible = activeLines.total || activeLines[key];
                              if (!isLineVisible) return null;
                              const c = hyperColors[key] || cfg.color;
                              return (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', margin: '3px 0' }}>
                                  <span style={{ color: c, fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                                    {cfg.label}
                                  </span>
                                  <span style={{ fontWeight: 900, color: dark ? '#ffffff' : '#0f172a', fontFamily: "'Plus Jakarta Sans', monospace" }}>
                                    {formatKRW(hoveredPoint[key])}원
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </foreignObject>
                      </g>
                    );
                  })()
                )}
              </svg>
            </div>
          );
        })()}
      </div>

      {/* 수입 대비 지출 비교 영역 (수입, 현금, 카드, 부족/여유 4대 카드) */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem', position: 'relative', zIndex: 100, overflow: 'visible' }}>
        <div className="section-card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="section-card-title">
            <span className="section-dot" style={{ background: isShortage ? 'var(--coral)' : 'var(--teal)' }} />
            {parseInt(month, 10)}월 수입 대비 지출
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginLeft: 4,
            }}>
              Income vs Cash & Card Expense
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ✨ 카드를 끌어서 자유롭게 순서 배치
            </span>
            <button
              type="button"
              onClick={() => {
                const defaultOrder = ['income', 'cash', 'card', 'difference', 'totalExpense', 'prepaid'];
                setCardOrder(defaultOrder);
                try {
                  localStorage.removeItem('asset_summary_card_order');
                } catch(e) {}
              }}
              style={{
                fontSize: '0.68rem',
                padding: '2px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              정렬 초기화
            </button>
          </div>
        </div>

        <div className="income-expense-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.85rem', marginBottom: '1rem', position: 'relative', zIndex: 10 }}>
          {(() => {
            const cardMap = {
              income: (
                <div 
                  ref={incomeCardRef}
                  className="top-volume-card top-volume-card-income"
                  onMouseEnter={() => {
                    if (window.innerWidth > 768) {
                      setIsExpenseHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(false);
                      setIsIncomeHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth > 768) {
                      setIsIncomeHovered(false);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768) {
                      setIsExpenseHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(false);
                      setIsIncomeHovered(prev => !prev);
                    }
                  }}
                  style={{
                    position: 'relative',
                    zIndex: isIncomeHovered ? 50 : 1,
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#10b981', flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>INCOME</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>수입</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, color: '#10b981', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {formatKRW(totalIncome)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>수입 항목 {(sections.income || []).length}건</span>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>상세 보기</span>
                  </div>

                  {/* PC 수입 상세 툴팁 레이어 */}
                  {isIncomeHovered && window.innerWidth > 768 && (
                    <div 
                      className="summary-detail-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.65rem' }}>
                        수입 내역
                      </div>
                      <div className="summary-detail-modal-list">
                        {(sections.income || []).length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>등록된 수입 내역이 없습니다.</div>
                        ) : (
                          (sections.income || []).map((i, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '1rem', width: '100%', padding: '0.25rem 0', borderBottom: '1px dashed var(--border)' }}>
                              <span style={{ fontWeight: 600, textAlign: 'left' }}>
                                {(i.category && i.content) 
                                  ? (i.category === i.content ? i.category : `${i.category} (${i.content})`) 
                                  : (i.category || i.content || '미지정')
                                }
                              </span>
                              <span style={{ fontWeight: 800, color: '#10b981', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(i.amount)}원</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ),
              cash: (
                <div 
                  ref={expenseCardRef}
                  className="top-volume-card top-volume-card-cash"
                  onMouseEnter={() => {
                    if (window.innerWidth > 768) {
                      setIsIncomeHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(false);
                      setIsExpenseHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth > 768) {
                      setIsExpenseHovered(false);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768) {
                      setIsIncomeHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(false);
                      setIsExpenseHovered(prev => !prev);
                    }
                  }}
                  style={{
                    position: 'relative',
                    zIndex: isExpenseHovered ? 50 : 1,
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#f59e0b', flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>CASH</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>현금</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, color: '#f59e0b', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {formatKRW(paymentsTotalAmount)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>현금 지출 {cardPayments.length}건</span>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>상세 보기</span>
                  </div>

                  {/* PC 현금 상세 툴팁 레이어 */}
                  {isExpenseHovered && window.innerWidth > 768 && (
                    <div 
                      className="summary-detail-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.65rem' }}>
                        현금 지출 내역
                      </div>
                      <div className="summary-detail-modal-list">
                        {cardPayments.length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>등록된 지출 내역이 없습니다.</div>
                        ) : (
                          cardPayments.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '1rem', width: '100%', padding: '0.25rem 0', borderBottom: '1px dashed var(--border)', opacity: p.isPaid ? 0.5 : 1 }}>
                              <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', textDecoration: p.isPaid ? 'line-through' : 'none' }}>
                                {p.item || '미지정'}
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 500 }}>
                                  ({displayPayDate(p.payDate)})
                                </span>
                              </span>
                              <span style={{ fontWeight: 800, color: p.isPaid ? 'var(--text-muted)' : '#f59e0b', textAlign: 'right', flexShrink: 0, textDecoration: p.isPaid ? 'line-through' : 'none', fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(p.amount)}원</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ),
              card: (
                <div 
                  ref={cardCardRef}
                  className="top-volume-card top-volume-card-card"
                  onMouseEnter={() => {
                    if (window.innerWidth > 768) {
                      setIsIncomeHovered(false);
                      setIsExpenseHovered(false);
                      setIsPrepaidHovered(false);
                      setIsCardHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth > 768) {
                      setIsCardHovered(false);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768) {
                      setIsIncomeHovered(false);
                      setIsExpenseHovered(false);
                      setIsPrepaidHovered(false);
                      setIsCardHovered(prev => !prev);
                    }
                  }}
                  style={{
                    position: 'relative',
                    zIndex: isCardHovered ? 50 : 1,
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'rgba(59, 130, 246, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#3b82f6', flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                        <line x1="1" y1="10" x2="23" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>CARD</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>카드</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, color: '#3b82f6', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {formatKRW(cardTotalAmount)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>카드 결제 {cardBreakdown.length}건</span>
                    <span style={{ color: '#3b82f6', fontWeight: 700 }}>상세 보기</span>
                  </div>

                  {/* PC 카드 상세 툴팁 레이어 */}
                  {isCardHovered && window.innerWidth > 768 && (
                    <div 
                      className="summary-detail-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.65rem' }}>
                        카드별 결제 내역
                      </div>
                      <div className="summary-detail-modal-list">
                        {cardBreakdown.length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>이번 달 카드 결제 내역이 없습니다.</div>
                        ) : (
                          cardBreakdown.map((b, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '1rem', width: '100%', padding: '0.25rem 0', borderBottom: '1px dashed var(--border)', opacity: b.isPaid ? 0.5 : 1 }}>
                              <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', textDecoration: b.isPaid ? 'line-through' : 'none' }}>
                                💳 {b.card}
                                {b.isPaid && (
                                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--teal-dim)', color: 'var(--teal)', fontWeight: 800 }}>
                                    선결제
                                  </span>
                                )}
                              </span>
                              <span style={{ fontWeight: 800, color: b.isPaid ? 'var(--text-muted)' : '#3b82f6', textAlign: 'right', flexShrink: 0, textDecoration: b.isPaid ? 'line-through' : 'none', fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(b.amount)}원</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ),
              difference: (
                <div 
                  className={`top-volume-card ${isShortage ? 'top-volume-card-expense' : 'top-volume-card-income'}`}
                  style={{
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: isShortage ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: isShortage ? 'var(--coral)' : '#10b981', flexShrink: 0
                    }}>
                      {isShortage ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>DIFFERENCE</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>차액</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, 
                    color: isShortage ? 'var(--coral)' : '#10b981', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {isShortage ? `-${formatKRW(absDifference)}` : formatKRW(absDifference)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>{isShortage ? '지출 초과' : '수입 여유'}</span>
                    <span style={{ color: isShortage ? 'var(--coral)' : '#10b981', fontWeight: 700 }}>{isShortage ? '부족' : '여유'}</span>
                  </div>
                </div>
              ),
              totalExpense: (
                <div 
                  className="top-volume-card top-volume-card-expense"
                  style={{
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'rgba(244, 63, 94, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--coral)', flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>EXPENSE</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>총 지출</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, color: 'var(--coral)', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {formatKRW(totalOutflow)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>현금 + 카드 원금 합산</span>
                    <span style={{ color: 'var(--coral)', fontWeight: 700 }}>총 지출</span>
                  </div>
                </div>
              ),
              prepaid: (
                <div 
                  ref={prepaidCardRef}
                  className="top-volume-card"
                  onMouseEnter={() => {
                    if (window.innerWidth > 768) {
                      setIsIncomeHovered(false);
                      setIsExpenseHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(true);
                    }
                  }}
                  onMouseLeave={() => {
                    if (window.innerWidth > 768) {
                      setIsPrepaidHovered(false);
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.innerWidth <= 768) {
                      setIsIncomeHovered(false);
                      setIsExpenseHovered(false);
                      setIsCardHovered(false);
                      setIsPrepaidHovered(prev => !prev);
                    }
                  }}
                  style={{
                    position: 'relative',
                    zIndex: isPrepaidHovered ? 50 : 1,
                    borderLeft: '4px solid #8b5cf6',
                    height: '100%',
                    padding: '0.75rem 1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: '10px',
                      background: 'rgba(139, 92, 246, 0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#8b5cf6', flexShrink: 0
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>PAID</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>납부</div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.45rem)', fontWeight: 900, color: '#8b5cf6', 
                    fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.03em', marginBottom: '0.6rem', lineHeight: 1.1
                  }}>
                    {formatKRW(totalPrepaidAmount)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', paddingTop: '0.4rem', borderTop: '1px solid rgba(226, 232, 240, 0.7)' }}>
                    <span>현금 {cardPayments.filter(p => p.isPaid).length}건 · 카드 {cardMonthlySummaries.filter(s => s.isPaid).length}건</span>
                    <span style={{ color: '#8b5cf6', fontWeight: 700 }}>상세 보기</span>
                  </div>

                  {/* PC 선납/선결제 상세 툴팁 레이어 */}
                  {isPrepaidHovered && window.innerWidth > 768 && (
                    <div 
                      className="summary-detail-modal"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.65rem' }}>
                        선납 / 선결제 완료 내역
                      </div>
                      <div className="summary-detail-modal-list">
                        {cardPayments.filter(p => p.isPaid).length === 0 && cardMonthlySummaries.filter(s => s.isPaid).length === 0 ? (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>완료된 선납/선결제 내역이 없습니다.</div>
                        ) : (
                          <>
                            {cardPayments.filter(p => p.isPaid).map((p, idx) => (
                              <div key={`pre-cash-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '1rem', width: '100%', padding: '0.25rem 0', borderBottom: '1px dashed var(--border)' }}>
                                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left' }}>
                                  💵 {p.item || '현금'}
                                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 138, 0, 0.15)', color: '#ff8a00', fontWeight: 800 }}>현금납부</span>
                                </span>
                                <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(p.amount)}원</span>
                              </div>
                            ))}
                            {cardMonthlySummaries.filter(s => s.isPaid).map((s, idx) => (
                              <div key={`pre-card-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', gap: '1rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)' }}>
                                <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left' }}>
                                  💳 {s.cardName || '카드'}
                                  <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 800 }}>카드선결제</span>
                                </span>
                                <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(s.currentMonthTotal)}원</span>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            };

            return cardOrder.map((key, index) => {
              const isDraggingThis = draggedCardKey === key;
              const isHovered = (key === 'income' && isIncomeHovered) ||
                                (key === 'cash' && isExpenseHovered) ||
                                (key === 'card' && isCardHovered) ||
                                (key === 'prepaid' && isPrepaidHovered);

              const startDragHandler = (clientX, clientY, isTouch = false) => {
                const startX = clientX;
                const startY = clientY;

                const handleMove = (moveX, moveY, e) => {
                  const dx = moveX - startX;
                  const dy = moveY - startY;
                  if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
                    if (isTouch && e && e.cancelable) {
                      e.preventDefault();
                    }
                    setDraggedCardKey(key);
                    setDragOffset({ x: dx, y: dy });

                    const elem = document.elementFromPoint(moveX, moveY);
                    const cardWrapper = elem?.closest('[data-card-key]');
                    if (cardWrapper) {
                      const targetKey = cardWrapper.getAttribute('data-card-key');
                      if (targetKey && targetKey !== key) {
                        setCardOrder(prev => {
                          const fromIdx = prev.indexOf(key);
                          const toIdx = prev.indexOf(targetKey);
                          if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return prev;
                          const next = [...prev];
                          const [removed] = next.splice(fromIdx, 1);
                          next.splice(toIdx, 0, removed);
                          try { localStorage.setItem('asset_summary_card_order', JSON.stringify(next)); } catch(err){}
                          return next;
                        });
                      }
                    }
                  }
                };

                if (isTouch) {
                  const onTouchMove = (e) => {
                    if (e.touches && e.touches[0]) {
                      handleMove(e.touches[0].clientX, e.touches[0].clientY, e);
                    }
                  };
                  const onTouchEnd = () => {
                    window.removeEventListener('touchmove', onTouchMove);
                    window.removeEventListener('touchend', onTouchEnd);
                    setDraggedCardKey(null);
                    setDragOverCardKey(null);
                    setDragOffset({ x: 0, y: 0 });
                  };
                  window.addEventListener('touchmove', onTouchMove, { passive: false });
                  window.addEventListener('touchend', onTouchEnd);
                } else {
                  const onMouseMove = (e) => handleMove(e.clientX, e.clientY, e);
                  const onMouseUp = () => {
                    window.removeEventListener('mousemove', onMouseMove);
                    window.removeEventListener('mouseup', onMouseUp);
                    setDraggedCardKey(null);
                    setDragOverCardKey(null);
                    setDragOffset({ x: 0, y: 0 });
                  };
                  window.addEventListener('mousemove', onMouseMove);
                  window.addEventListener('mouseup', onMouseUp);
                }
              };

              return (
                <div
                  key={`wrapper-${key}`}
                  data-card-key={key}
                  onMouseDown={(e) => {
                    if (e.button !== 0) return;
                    startDragHandler(e.clientX, e.clientY, false);
                  }}
                  onTouchStart={(e) => {
                    if (e.touches && e.touches[0]) {
                      startDragHandler(e.touches[0].clientX, e.touches[0].clientY, true);
                    }
                  }}
                  style={{
                    position: 'relative',
                    borderRadius: '18px',
                    height: '100%',
                    cursor: isDraggingThis ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    touchAction: isDraggingThis ? 'none' : 'manipulation',
                    opacity: isDraggingThis ? 0.92 : 1,
                    transform: isDraggingThis 
                      ? `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.06) rotate(${Math.min(Math.max(dragOffset.x * 0.04, -8), 8)}deg)` 
                      : 'translate3d(0,0,0) scale(1)',
                    boxShadow: isDraggingThis 
                      ? '0 25px 50px rgba(0,0,0,0.45), 0 0 30px rgba(6, 182, 212, 0.6)' 
                      : 'none',
                    transition: isDraggingThis ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, opacity 0.2s ease',
                    zIndex: isDraggingThis ? 99999 : (isHovered ? 9999 : 1),
                    pointerEvents: isDraggingThis ? 'none' : 'auto',
                    willChange: 'transform'
                  }}
                >
                  {cardMap[key]}
                </div>
              );
            });
          })()}
        </div>

        {/* 비주얼 프로그레스 바 영역 (yellow-tick-gauge-track 계기판 스타일) */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1rem 1.25rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem', fontSize: '0.78rem', fontWeight: 800, gap: '0.5rem' }}>
            {/* 모바일/데스크톱 문구 분기 */}
            <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
              <span className="desktop-only-text">{parseInt(month, 10)}월 수입 대비 지출 비율</span>
              <span className="mobile-only-text">{parseInt(month, 10)}월 수입대비 지출</span>
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {/* 데스크톱 전용 159.5% 퍼센트 표기 (모바일에서는 불필요하여 미표시) */}
              <span className="desktop-only-text" style={{ color: isShortage ? 'var(--coral)' : '#00e676', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', monospace" }}>
                {percent.toFixed(1)}%
              </span>

              {/* 초과금액 한 줄 수치 표기 */}
              {isShortage && (
                <span style={{ 
                  fontSize: '0.68rem', 
                  color: '#ffffff', 
                  background: 'var(--coral)', 
                  padding: '3px 9px', 
                  borderRadius: '99px', 
                  fontWeight: 900,
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                  boxShadow: '0 2px 8px rgba(244, 63, 94, 0.35)'
                }}>
                  +{formatKRW(absDifference)}원 초과
                </span>
              )}
            </div>
          </div>
          
          {/* 프로그레스 트랙 계기판 */}
          <div className="yellow-tick-gauge-track" style={{ height: '16px' }}>
            {/* 1) 수입 범위 내 지출 바 (청록/에메랄드빛) */}
            <div 
              style={{
                height: '100%',
                width: `${Math.min(clampedPercent, 100)}%`,
                borderRadius: '99px',
                background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)',
                boxShadow: '0 0 14px rgba(6, 182, 212, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                transition: 'width 0.4s ease',
                position: 'relative',
                zIndex: 1
              }} 
            />

            {/* 2) 수입 100% 초과 지출 바 (크림슨 로즈 네온빛) */}
            {isShortage && (
              <div 
                style={{
                  position: 'absolute',
                  top: '0',
                  bottom: '0',
                  right: '0',
                  width: `${Math.min(((totalOutflow - totalIncome) / (totalOutflow || 1)) * 100, 40)}%`,
                  borderRadius: '0 99px 99px 0',
                  background: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 50%, #be123c 100%)',
                  boxShadow: '0 0 16px rgba(244, 63, 94, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
                  zIndex: 1
                }} 
              />
            )}
          </div>

        </div>
      </div>

      <div className="section-card" style={{ marginBottom: '1.5rem', minHeight: '60vh' }}>
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-dot" style={{ background: '#FF8A00' }} />
            {Number(month)}월 필수 자금
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginLeft: 4,
            }}>
              Required Funds for This Month
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
            <button className="btn btn-teal btn-sm" onClick={handleAddPayment} style={{ padding: '0.35rem 0.65rem', fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              <span className="desktop-only-text">+ 항목추가</span>
              <span className="mobile-only-text">+ 추가</span>
            </button>
          </div>
        </div>

        <div style={{ animation: 'tabFadeIn 0.2s ease', marginTop: '1rem' }}>
          {/* data-table 상단 우측 날짜순 정렬 & 전월 데이터 복사 버튼 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', padding: '0.6rem 0.75rem 0.25rem' }}>
            <button 
              className="btn btn-ghost" 
              onClick={handleSortByDate} 
              style={{ 
                padding: '0.35rem 0.65rem', 
                fontSize: '0.72rem', 
                whiteSpace: 'nowrap',
                border: dark ? '1px solid #ffffff' : '1px solid #895db5',
                color: dark ? '#ffffff' : '#895db5',
                fontWeight: 700
              }}
            >
              <span className="desktop-only-text">날짜순 정렬</span>
              <span className="mobile-only-text">날짜순</span>
            </button>
            <button 
              className="btn btn-ghost" 
              onClick={handleCopyPrevMonthData} 
              style={{ 
                padding: '0.35rem 0.65rem', 
                fontSize: '0.72rem', 
                whiteSpace: 'nowrap',
                border: dark ? '1px solid #ffffff' : '1px solid #895db5',
                color: dark ? '#ffffff' : '#895db5',
                fontWeight: 700
              }}
            >
              <span className="desktop-only-text">전월 데이터 복사</span>
              <span className="mobile-only-text">전월복사</span>
            </button>
          </div>

          <div className="card-payments-table-container" style={{ padding: '0.75rem 0.75rem 1.5rem', overflowX: 'auto' }}>
            <table className="data-table card-payments-compact-table" style={{ width: '100%', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: 24, padding: '6px 2px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}></th>
                  <th style={{ width: 65, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>입금여부</th>
                  <th style={{ width: 90, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>납부일</th>
                  <th style={{ padding: '6px 6px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>항목</th>
                  <th style={{ width: 105, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>금액(원)</th>
                  <th style={{ width: 95, padding: '6px 4px', textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {cardPayments.length === 0 && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.4, fontSize: '0.85rem' }}>
                      등록된 납부 내역이 없습니다.
                    </td>
                  </tr>
                )}
                {cardPayments.map((p, idx) => {
                  const isRowPaid = !!p.isPaid;
                  const hasDetails = p.details && p.details.length > 0;
                  const isDragging = draggedIdx === idx;
                  return (
                    <tr 
                      key={p.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      style={{ 
                        backgroundColor: isRowPaid 
                          ? (dark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.08)') 
                          : 'transparent',
                        opacity: isDragging ? 0.35 : 1,
                        cursor: 'grab',
                        transition: 'background-color 0.25s ease, opacity 0.15s ease'
                      }}
                    >
                      <td style={{ 
                        textAlign: 'center', 
                        verticalAlign: 'middle', 
                        cursor: 'grab', 
                        color: 'var(--text-muted)',
                        fontSize: '0.95rem',
                        userSelect: 'none',
                        padding: '0 8px'
                      }}>
                        ⠿
                      </td>
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <input 
                          type="checkbox" 
                          checked={isRowPaid} 
                          onChange={(e) => handlePaymentFieldChange(p.id, 'isPaid', e.target.checked)}
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
                          style={{ 
                            textAlign: 'right', 
                            fontWeight: 'bold'
                          }}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                          <button 
                            className="btn btn-sm" 
                            style={{ 
                              padding: '4px 8px', 
                              backgroundColor: hasDetails ? 'var(--orange)' : 'transparent',
                              color: hasDetails ? '#ffffff' : 'var(--orange)',
                              border: `1px solid ${hasDetails ? 'var(--orange)' : 'var(--card-border)'}`,
                              transition: 'all 0.2s ease'
                            }} 
                            onClick={() => handleOpenDetails(p)}
                          >
                            상세
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', color: 'var(--coral)' }} 
                            onClick={() => handleDeletePayment(p.id)}
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
              {cardPayments.length > 0 && (() => {
                const totalCashAmount = cardPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
                const paidCashAmount = cardPayments.reduce((acc, p) => acc + (p.isPaid ? (Number(p.amount) || 0) : 0), 0);
                const netRemainingAmount = totalCashAmount - paidCashAmount;
                return (
                  <tfoot>
                    <tr style={{ 
                      backgroundColor: dark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                      fontWeight: 'bold',
                      borderTop: '2px solid var(--border)'
                    }}>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '10px 6px', fontWeight: 800 }}>
                        합계
                      </td>
                      <td className="amount-cell num" style={{ padding: '10px 4px', textAlign: 'right', color: 'var(--text-primary)', fontWeight: 900 }}>
                        {formatKRW(totalCashAmount)}
                      </td>
                      <td style={{ textAlign: 'center', padding: '10px 4px', whiteSpace: 'nowrap' }}>
                        <span 
                          style={{ 
                            fontSize: '0.78rem', 
                            color: netRemainingAmount > 0 ? (dark ? '#60a5fa' : '#2563eb') : 'var(--emerald, #10b981)', 
                            fontWeight: 900,
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: netRemainingAmount > 0 
                              ? (dark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(37, 99, 235, 0.08)')
                              : (dark ? 'rgba(16, 185, 129, 0.18)' : 'rgba(16, 185, 129, 0.08)')
                          }}
                          title={`총 입금완료: ${formatKRW(paidCashAmount)} / 입금 차감 잔액: ${formatKRW(netRemainingAmount)}`}
                        >
                          {formatKRW(netRemainingAmount)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                );
              })()}
            </table>
          </div>


        </div>
      </div>

      {/* 상세 항목 레이어 편집창 (Modal) */}
      {detailPayment && (
        <div className="modal-overlay" onClick={() => setDetailPayment(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 800 }}>
            <div className="modal-header">
              <div className="modal-title">
                상세내역
              </div>
              <button className="btn-close" onClick={() => setDetailPayment(null)}>✕</button>
            </div>

            <div style={{ overflowX: 'auto', marginBottom: '1.5rem', maxHeight: '45vh' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>상세 항목명</th>
                    <th style={{ width: 180, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>내용</th>
                    <th style={{ width: 180, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>금액 (원)</th>
                    <th style={{ width: 80, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {(!detailPayment.details || detailPayment.details.length === 0) ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.5 }}>
                        등록된 상세 항목이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    detailPayment.details.map((d, idx) => (
                      <tr key={idx}>
                        <td>
                          <input
                            type="text"
                            value={d.content || ''}
                            placeholder="예: 동양생명, 관리비 등"
                            onChange={(e) => handleDetailFieldChange(idx, 'content', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={d.card || ''}
                            placeholder="내용 입력"
                            onChange={(e) => handleDetailFieldChange(idx, 'card', e.target.value)}
                          />
                        </td>
                        <td className="amount-cell">
                          <NumberInput
                            value={d.amount || 0}
                            onChange={(val) => handleDetailFieldChange(idx, 'amount', val)}
                            style={{ textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--coral)' }}
                            onClick={() => handleDeleteDetailRow(idx)}
                            title="삭제"
                          >
                            <span className="desktop-only-text">삭제</span>
                            <span className="mobile-only-text" style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>×</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <button className="btn btn-ghost" onClick={handleAddDetailRow}>
                + 상세 항목 추가
              </button>
              <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                상세 합계: <span style={{ color: 'var(--orange)', fontFamily: 'Inter', fontWeight: 900 }}>{formatKRW(detailsSum)}</span> 원
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
              <button className="btn btn-ghost" onClick={() => setDetailPayment(null)}>
                취소
              </button>
              <button className="btn btn-dark" onClick={handleSaveDetails}>
                상세내역 저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 모바일 스마트폰 화면 전용 절대 중앙 모달 레이어 포털 */}
      {typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <>
          {isIncomeHovered && (
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
              onClick={() => setIsIncomeHovered(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(6, 182, 212, 0.35)',
                  width: 'fit-content',
                  minWidth: '280px',
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--text-primary)',
                  animation: 'fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--teal)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                    수입 내역
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsIncomeHovered(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, padding: '0 4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                  {(sections.income || []).length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>등록된 수입 내역이 없습니다.</div>
                  ) : (
                    (sections.income || []).map((i, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {(i.category && i.content) 
                            ? (i.category === i.content ? i.category : `${i.category} (${i.content})`) 
                            : (i.category || i.content || '미지정')
                          }
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--teal)', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(i.amount)}원</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 2. 현금 모바일 중앙 모달 */}
          {isExpenseHovered && (
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
              onClick={() => setIsExpenseHovered(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(255, 138, 0, 0.35)',
                  width: 'fit-content',
                  minWidth: '280px',
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--text-primary)',
                  animation: 'fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#ff8a00', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff8a00', display: 'inline-block' }} />
                    현금 지출 내역
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsExpenseHovered(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, padding: '0 4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                  {cardPayments.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>등록된 지출 내역이 없습니다.</div>
                  ) : (
                    cardPayments.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', opacity: p.isPaid ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', textDecoration: p.isPaid ? 'line-through' : 'none', whiteSpace: 'nowrap' }}>
                          {p.item || '미지정'}
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            ({displayPayDate(p.payDate)})
                          </span>
                        </span>
                        <span style={{ fontWeight: 800, color: p.isPaid ? 'var(--text-muted)' : '#ff8a00', textAlign: 'right', flexShrink: 0, textDecoration: p.isPaid ? 'line-through' : 'none', fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(p.amount)}원</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 3. 카드 모바일 중앙 모달 */}
          {isCardHovered && (
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
              onClick={() => setIsCardHovered(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(59, 130, 246, 0.35)',
                  width: 'fit-content',
                  minWidth: '280px',
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--text-primary)',
                  animation: 'fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#3b82f6', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                    카드별 결제 내역
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCardHovered(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, padding: '0 4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                  {cardBreakdown.length === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>이번 달 카드 결제 내역이 없습니다.</div>
                  ) : (
                    cardBreakdown.map((b, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', opacity: b.isPaid ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', textDecoration: b.isPaid ? 'line-through' : 'none', whiteSpace: 'nowrap' }}>
                          💳 {b.card}
                          {b.isPaid && (
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'var(--teal-dim)', color: 'var(--teal)', fontWeight: 800 }}>
                              선결제
                            </span>
                          )}
                        </span>
                        <span style={{ fontWeight: 800, color: b.isPaid ? 'var(--text-muted)' : '#3b82f6', textAlign: 'right', flexShrink: 0, textDecoration: b.isPaid ? 'line-through' : 'none', fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(b.amount)}원</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. 선납 모바일 중앙 모달 */}
          {isPrepaidHovered && (
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
              onClick={() => setIsPrepaidHovered(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(139, 92, 246, 0.35)',
                  width: 'fit-content',
                  minWidth: '280px',
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--text-primary)',
                  animation: 'fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#8b5cf6', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                    결제 완료
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrepaidHovered(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, padding: '0 4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                  {totalPrepaidAmount === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>납부 또는 결제 완료 항목이 없습니다.</div>
                  ) : (
                    <>
                      {cardPayments.filter(p => p.isPaid).map((p, idx) => (
                        <div key={`pre-cash-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            💵 {p.item || '현금'}
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 138, 0, 0.15)', color: '#ff8a00', fontWeight: 800 }}>현금납부</span>
                          </span>
                          <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(p.amount)}원</span>
                        </div>
                      ))}
                      {cardMonthlySummaries.filter(s => s.isPaid).map((s, idx) => (
                        <div key={`pre-card-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            💳 {s.cardName || '카드'}
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 800 }}>카드선결제</span>
                          </span>
                          <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(s.currentMonthTotal)}원</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* 4. 선납 모바일 중앙 모달 */}
          {isPrepaidHovered && (
            <div 
              style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 99999999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem'
              }}
              onClick={() => setIsPrepaidHovered(false)}
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: '20px',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 25px 70px rgba(0,0,0,0.65), 0 0 35px rgba(139, 92, 246, 0.35)',
                  width: 'fit-content',
                  minWidth: '280px',
                  maxWidth: '92vw',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  color: 'var(--text-primary)',
                  animation: 'fadeInScale 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                  <div style={{ fontSize: '0.88rem', color: '#8b5cf6', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                    결제 완료
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsPrepaidHovered(false)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 800, padding: '0 4px', lineHeight: 1 }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '4px' }}>
                  {totalPrepaidAmount === 0 ? (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1.5rem 0' }}>납부 또는 결제 완료 항목이 없습니다.</div>
                  ) : (
                    <>
                      {cardPayments.filter(p => p.isPaid).map((p, idx) => (
                        <div key={`pre-cash-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            💵 {p.item || '현금'}
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 138, 0, 0.15)', color: '#ff8a00', fontWeight: 800 }}>현금납부</span>
                          </span>
                          <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(p.amount)}원</span>
                        </div>
                      ))}
                      {cardMonthlySummaries.filter(s => s.isPaid).map((s, idx) => (
                        <div key={`pre-card-${idx}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', gap: '1.5rem', width: '100%', padding: '0.35rem 0', borderBottom: '1px dashed var(--border)', whiteSpace: 'nowrap' }}>
                          <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px', textAlign: 'left', whiteSpace: 'nowrap' }}>
                            💳 {s.cardName || '카드'}
                            <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', fontWeight: 800 }}>카드선결제</span>
                          </span>
                          <span style={{ fontWeight: 800, color: '#8b5cf6', textAlign: 'right', flexShrink: 0, fontFamily: "'Plus Jakarta Sans', monospace" }}>{formatKRW(s.currentMonthTotal)}원</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}
