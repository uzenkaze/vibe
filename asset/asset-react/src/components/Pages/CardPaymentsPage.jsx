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


  // --- 항목별 라인 설정 ---
  const lineConfigs = {
    total: { label: '전체 납부액', color: '#ff8a00', gradId: 'totalGrad', areaGradId: 'totalAreaGrad', dimColor: 'rgba(255, 138, 0, 0.12)' },
    card: { label: '카드사용금액', color: '#3b82f6', gradId: 'cardGrad', areaGradId: 'cardAreaGrad', dimColor: 'rgba(59, 130, 246, 0.12)' },
    jisan: { label: '지산 납부액', color: '#10b981', gradId: 'jisanGrad', areaGradId: 'jisanAreaGrad', dimColor: 'rgba(16, 185, 129, 0.12)' },
    kabank: { label: '카뱅이자', color: '#8b5cf6', gradId: 'kabankGrad', areaGradId: 'kabankAreaGrad', dimColor: 'rgba(139, 92, 246, 0.12)' }
  };

  // --- 라인 활성화 토글 상태 ---
  const [activeLines, setActiveLines] = useState({
    total: true,
    card: true,
    jisan: true,
    kabank: true
  });

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
      
      let total = 0;
      let card = 0;
      let jisan = 0;
      let kabank = 0;

      payments.forEach(p => {
        const amt = Number(p.amount) || 0;
        const name = String(p.item || '').toLowerCase();
        
        total += amt;
        if (name.includes('카드')) {
          card += amt;
        } else if (name.includes('지산')) {
          jisan += amt;
        } else if (name.includes('카뱅') || name.includes('카카오')) {
          kabank += amt;
        }
      });

      return {
        month: `${mNum}월`,
        total,
        card,
        jisan,
        kabank
      };
    });
  }, [yearData, year]);

  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [isIncomeHovered, setIsIncomeHovered] = useState(false);
  const [isExpenseHovered, setIsExpenseHovered] = useState(false);
  
  const incomeCardRef = useRef(null);
  const expenseCardRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (incomeCardRef.current && !incomeCardRef.current.contains(e.target)) {
        setIsIncomeHovered(false);
      }
      if (expenseCardRef.current && !expenseCardRef.current.contains(e.target)) {
        setIsExpenseHovered(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // --- SVG Chart Dimensions ---
  const width = 800;
  const height = 250;
  const paddingLeft = 75;
  const paddingRight = 40;
  const paddingTop = 45;
  const paddingBottom = 45;

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

    if (prevPayments.length === 0) {
      alert('복사할 전월 데이터가 없습니다.');
      return;
    }

    if (cardPayments.length > 0 && !confirm('현재 작성된 데이터가 모두 지워지고 전월 데이터로 대체됩니다. 계속하시겠습니까?')) {
      return;
    }

    // 복사 시 ID 재발행 및 입금여부(isPaid) 초기화, 상세 내역 명시적 복사
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

    persistSections({ ...sections, cardPayments: copiedPayments });
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

  // 부족금액 = 수입내역합계 - 현금납부합계
  const difference = totalIncome - paymentsTotalAmount;
  const isShortage = difference < 0;
  const absDifference = Math.abs(difference);

  // 퍼센트율 계산 (수입 대비 지출 비율)
  const percent = totalIncome > 0 ? (paymentsTotalAmount / totalIncome) * 100 : (paymentsTotalAmount > 0 ? 100 : 0);
  const clampedPercent = Math.min(percent, 100);

  return (
    <>
      {/* 12개월 필요 자금 변동 추이 차트 */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="section-card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div className="section-card-title">
            <span className="section-dot" style={{ background: '#FF8A00' }} />
            현금 납부 변동 추이 ({year}년)
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginLeft: 4,
            }}>
              Monthly Trend of Required Funds
            </span>
          </div>
        </div>

        {/* --- 필터 칩스 버튼 그룹 추가 --- */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {Object.entries(lineConfigs).map(([key, cfg]) => {
            const isActive = activeLines[key];
            return (
              <button
                key={key}
                onClick={() => setActiveLines(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  borderRadius: '99px',
                  border: `1px solid ${isActive ? cfg.color : 'var(--border)'}`,
                  background: isActive ? cfg.dimColor : 'var(--surface)',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 2px 8px ${cfg.dimColor}` : 'none'
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cfg.color }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
        
        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
          <svg 
            width="100%" 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ overflow: 'visible' }}
          >
            <defs>
              {/* 각 라인별 그라디언트 정의 */}
              {Object.entries(lineConfigs).map(([key, cfg]) => (
                <g key={key}>
                  <linearGradient id={cfg.gradId} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={cfg.color} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0.8} />
                  </linearGradient>
                  <linearGradient id={cfg.areaGradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={cfg.color} stopOpacity={0.16} />
                    <stop offset="100%" stopColor={cfg.color} stopOpacity={0.0} />
                  </linearGradient>
                </g>
              ))}
            </defs>

            {/* Grid Lines */}
            {gridLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={line.y}
                  x2={width - paddingRight}
                  y2={line.y}
                  stroke="var(--border)"
                  strokeWidth="1"
                  strokeDasharray={idx === 0 ? "none" : "4 4"}
                />
                <text
                  x={paddingLeft - 12}
                  y={line.y + 4}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="10"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {formatShorthand(line.val)}
                </text>
              </g>
            ))}

            {/* 활성화된 영역 채우기 (Area) 및 라인 그리기 */}
            {Object.entries(lineConfigs).map(([key, cfg]) => {
              if (!activeLines[key]) return null;
              const { linePath, areaPath } = getLinePaths(key);
              return (
                <g key={key}>
                  {/* Area Path */}
                  <path d={areaPath} fill={`url(#${cfg.areaGradId})`} />

                  {/* Line Path */}
                  <path 
                    d={linePath} 
                    fill="none" 
                    stroke={`url(#${cfg.gradId})`} 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                </g>
              );
            })}

            {/* Vertical Guide line on hover */}
            {hoveredPoint && (
              <line
                x1={paddingLeft + (chartData.indexOf(hoveredPoint) * columnWidth)}
                y1={paddingTop}
                x2={paddingLeft + (chartData.indexOf(hoveredPoint) * columnWidth)}
                y2={paddingTop + plotHeight}
                stroke="var(--text-muted)"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.4"
              />
            )}

            {/* Data Circles (활성화된 라인들에 점 찍기) */}
            {chartData.map((d, i) => {
              const x = paddingLeft + (i * columnWidth);
              return (
                <g key={i}>
                  {Object.entries(lineConfigs).map(([key, cfg]) => {
                    if (!activeLines[key]) return null;
                    const val = d[key] || 0;
                    const y = paddingTop + plotHeight - (val / maxVal * plotHeight);
                    return (
                      <g key={key}>
                        <circle
                          cx={x}
                          cy={y}
                          r="3"
                          fill="var(--surface)"
                          stroke={cfg.color}
                          strokeWidth="2"
                        />
                        {hoveredPoint && hoveredPoint.month === d.month && (
                          <circle
                            cx={x}
                            cy={y}
                            r="6"
                            fill={cfg.color}
                            fillOpacity="0.25"
                            style={{ transition: 'all 0.1s ease' }}
                          />
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* X Axis Labels */}
            {chartData.map((d, i) => {
              const x = paddingLeft + (i * columnWidth);
              return (
                <text
                  key={i}
                  x={x}
                  y={height - paddingBottom + 22}
                  textAnchor="middle"
                  fill={hoveredPoint && hoveredPoint.month === d.month ? "var(--text-primary)" : "var(--text-muted)"}
                  fontSize="11"
                  fontWeight={hoveredPoint && hoveredPoint.month === d.month ? "700" : "600"}
                >
                  {d.month}
                </text>
              );
            })}

            {/* Tooltip via foreignObject to scale perfectly */}
            {hoveredPoint && (
              <foreignObject
                x={paddingLeft + (chartData.indexOf(hoveredPoint) * columnWidth) + 120 > width 
                  ? paddingLeft + (chartData.indexOf(hoveredPoint) * columnWidth) - 180 
                  : paddingLeft + (chartData.indexOf(hoveredPoint) * columnWidth) + 10
                }
                y={paddingTop + 10}
                width="170"
                height="150"
                style={{ overflow: 'visible', pointerEvents: 'none' }}
              >
                <div style={{
                  background: dark ? 'rgba(28, 31, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  boxShadow: 'var(--shadow-md)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  width: '160px'
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '3px' }}>
                    {hoveredPoint.month} 납부 상세
                  </span>
                  {Object.entries(lineConfigs).map(([key, cfg]) => {
                    if (!activeLines[key]) return null;
                    return (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                        <span style={{ color: cfg.color, fontWeight: 700 }}>● {cfg.label.replace(' 납부액', '')}</span>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{formatKRW(hoveredPoint[key])}</span>
                      </div>
                    );
                  })}
                </div>
              </foreignObject>
            )}

            {/* Interactive Hover Zones */}
            {hoverZones.map((zone, idx) => (
              <rect
                key={idx}
                x={zone.x}
                y={paddingTop}
                width={zone.w}
                height={plotHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(zone.point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>
        </div>
      </div>

      {/* 수입 대비 현금 지출 비교 영역 (도식화) */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="section-card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
          <div className="section-card-title">
            <span className="section-dot" style={{ background: isShortage ? 'var(--coral)' : 'var(--teal)' }} />
            수입 대비 현금 지출
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginLeft: 4,
            }}>
              Income vs Cash Expense
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem', position: 'relative', zIndex: 10 }}>
          {/* 수입 카드 */}
          <div 
            ref={incomeCardRef}
            onMouseEnter={() => setIsIncomeHovered(true)}
            onMouseLeave={() => setIsIncomeHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setIsIncomeHovered(prev => !prev);
            }}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              borderLeft: '4px solid var(--teal)',
              position: 'relative',
              zIndex: isIncomeHovered ? 50 : 1,
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>수입</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              {formatKRW(totalIncome)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
            </div>

            {/* 수입 상세 레이어 */}
            {isIncomeHovered && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 1000,
                  minWidth: '360px',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                  수입 상세 내역
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                  {(sections.income || []).length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>등록된 수입 내역이 없습니다.</div>
                  ) : (
                    (sections.income || []).map((i, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '1.5rem', width: '100%', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {(i.category && i.content) 
                            ? (i.category === i.content ? i.category : `${i.category} (${i.content})`) 
                            : (i.category || i.content || '미지정')
                          }
                        </span>
                        <span style={{ fontWeight: 800, color: 'var(--teal)', textAlign: 'right', flexShrink: 0 }}>{formatKRW(i.amount)}원</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 지출 카드 */}
          <div 
            ref={expenseCardRef}
            onMouseEnter={() => setIsExpenseHovered(true)}
            onMouseLeave={() => setIsExpenseHovered(false)}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpenseHovered(prev => !prev);
            }}
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              borderLeft: '4px solid #ff8a00',
              position: 'relative',
              zIndex: isExpenseHovered ? 50 : 1,
              cursor: 'pointer'
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>지출</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              {formatKRW(paymentsTotalAmount)} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>원</span>
            </div>

            {/* 지출 상세 레이어 */}
            {isExpenseHovered && (
              <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  boxShadow: 'var(--shadow-md)',
                  zIndex: 1000,
                  minWidth: '360px',
                  color: 'var(--text-primary)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }}
              >
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, borderBottom: '1px solid var(--border)', paddingBottom: '4px', marginBottom: '6px' }}>
                  현금 납부 지출 상세
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: '150px', overflowY: 'auto' }}>
                  {cardPayments.length === 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '6px 0' }}>등록된 지출 내역이 없습니다.</div>
                  ) : (
                    cardPayments.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', gap: '1.5rem', width: '100%', whiteSpace: 'nowrap' }}>
                        <span style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', whiteSpace: 'nowrap', textAlign: 'left' }}>
                          {p.item || '미지정'}
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: '4px', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            ({displayPayDate(p.payDate)})
                          </span>
                        </span>
                        <span style={{ fontWeight: 800, color: '#ff8a00', textAlign: 'right', flexShrink: 0 }}>{formatKRW(p.amount)}원</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 결과 카드 (부족 또는 남음) */}
          <div style={{
            background: isShortage ? 'var(--coral-dim)' : 'var(--teal-dim)',
            border: `1px solid ${isShortage ? 'var(--coral)' : 'var(--teal)'}`,
            borderRadius: '12px',
            padding: '1rem 1.25rem',
            borderLeft: `4px solid ${isShortage ? 'var(--coral)' : 'var(--teal)'}`
          }}>
            <div style={{ fontSize: '0.75rem', color: isShortage ? 'var(--coral)' : 'var(--teal)', fontWeight: 700, marginBottom: '0.25rem' }}>
              {isShortage ? '⚠️ 부족 금액' : '✓ 남은 여유 자금'}
            </div>
            <div style={{ 
              fontSize: '1.35rem', 
              fontWeight: 900, 
              color: isShortage ? 'var(--coral)' : 'var(--teal)', 
              fontFamily: 'Inter, sans-serif' 
            }}>
              {formatKRW(absDifference)} <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>원</span>
            </div>
          </div>
        </div>

        {/* 비주얼 프로그레스 바 영역 */}
        <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
            <span style={{ color: 'var(--text-secondary)' }}>수입 대비 지출 비율</span>
            <span style={{ color: isShortage ? 'var(--coral)' : 'var(--teal)' }}>
              {percent.toFixed(1)}% {isShortage ? '(초과)' : ''}
            </span>
          </div>
          
          {/* 프로그레스 트랙 */}
          <div style={{ 
            height: '10px', 
            background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', 
            borderRadius: '99px', 
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* 프로그레스 필 */}
            <div style={{
              width: `${clampedPercent}%`,
              height: '100%',
              background: isShortage 
                ? 'linear-gradient(90deg, #ff8a00 0%, var(--coral) 100%)' 
                : 'linear-gradient(90deg, #5D6BF8 0%, var(--teal) 100%)',
              borderRadius: '99px',
              transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <span>0%</span>
            {isShortage && <span style={{ color: 'var(--coral)', fontWeight: 700 }}>수입 한도 초과!</span>}
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="section-card" style={{ marginBottom: '1.5rem', minHeight: '60vh' }}>
        <div className="section-card-header">
          <div className="section-card-title">
            <span className="section-dot" style={{ background: '#FF8A00' }} />
            납부(예정) 내역 ({month}월)
            <span style={{
              fontSize: '0.65rem', color: 'var(--text-muted)',
              fontWeight: 600, letterSpacing: '0.05em',
              textTransform: 'uppercase', marginLeft: 4,
            }}>
              Required Funds for This Month
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-ghost" onClick={handleSortByDate}>날짜순 정렬</button>
            <button className="btn btn-ghost" onClick={handleCopyPrevMonthData}>전월 데이터 복사</button>
            <button className="btn btn-dark" onClick={handleAddPayment}>+ 항목추가</button>
          </div>
        </div>

        <div style={{ animation: 'tabFadeIn 0.2s ease', marginTop: '1.5rem' }}>
          <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ width: 40, backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}></th>
                  <th style={{ width: 90, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>입금여부</th>
                  <th style={{ width: 180, backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>납부일</th>
                  <th style={{ backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>항목</th>
                  <th style={{ width: 180, textAlign: 'right', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>금액 (원)</th>
                  <th style={{ width: 140, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>작업</th>
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
            padding: '1.25rem 1.5rem', 
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff8a00 0%, #ea580c 100%)', 
            color: '#ffffff',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            boxShadow: '0 4px 14px rgba(255, 138, 0, 0.22)'
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'rgba(255, 255, 255, 0.9)' }}>
              합계
            </span>
            <span style={{ 
              fontSize: '1.8rem', 
              fontWeight: 900, 
              color: '#ffffff',
              fontFamily: 'Inter, sans-serif',
              letterSpacing: '-0.03em' 
            }}>
              {formatKRW(paymentsTotalAmount)}
              <span style={{ fontSize: '0.95rem', fontWeight: 'bold', marginLeft: '4px', color: 'rgba(255, 255, 255, 0.8)' }}>
                원
              </span>
            </span>
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
                    <th style={{ backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>상세 항목명</th>
                    <th style={{ width: 180, backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>내용</th>
                    <th style={{ width: 180, textAlign: 'right', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>금액 (원)</th>
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
    </>
  );
}
