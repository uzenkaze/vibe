import { useState, useMemo } from 'react';
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

  const sortedCardPayments = useMemo(() => {
    return [...cardPayments].sort((a, b) => getDayValue(a.payDate) - getDayValue(b.payDate));
  }, [cardPayments]);

  // --- 12개월 변동 추이 데이터 집계 ---
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
      const total = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
      return {
        month: `${mNum}월`,
        total: total
      };
    });
  }, [yearData, year]);

  const [hoveredPoint, setHoveredPoint] = useState(null);

  // --- SVG Chart Dimensions ---
  const width = 800;
  const height = 240;
  const paddingLeft = 75;
  const paddingRight = 40;
  const paddingTop = 45;
  const paddingBottom = 45;

  const plotWidth = width - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  const totals = chartData.map(d => d.total);
  const maxVal = Math.max(...totals, 1000000); // 최소 100만원 기준

  const points = chartData.map((d, i) => {
    const x = paddingLeft + (i * (plotWidth / 11));
    const y = paddingTop + plotHeight - (d.total / maxVal * plotHeight);
    return { x, y, ...d, index: i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[11].x} ${paddingTop + plotHeight} L ${points[0].x} ${paddingTop + plotHeight} Z`;

  const columnWidth = plotWidth / 11;
  const hoverZones = points.map((p, i) => {
    const xStart = i === 0 ? paddingLeft : p.x - (columnWidth / 2);
    const xEnd = i === 11 ? (paddingLeft + plotWidth) : p.x + (columnWidth / 2);
    const x = xStart;
    const w = xEnd - xStart;
    return { x, w, index: i, point: p };
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

  return (
    <>
      {/* 12개월 필요 자금 변동 추이 차트 */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div className="section-card-header" style={{ marginBottom: '1.5rem' }}>
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
        
        <div style={{ position: 'relative', width: '100%', overflow: 'visible' }}>
          <svg 
            width="100%" 
            height={height} 
            viewBox={`0 0 ${width} ${height}`} 
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ff8a00" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="chartAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 138, 0, 0.22)" />
                <stop offset="100%" stopColor="rgba(255, 138, 0, 0.0)" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {gridLines.map((line, idx) => (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={line.y}
                  x2={width - paddingRight}
                  y2={line.y}
                  stroke="var(--card-border)"
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

            {/* Area Path */}
            <path d={areaPath} fill="url(#chartAreaGrad)" />

            {/* Line Path */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="url(#chartLineGrad)" 
              strokeWidth="3.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Vertical Guide line on hover */}
            {hoveredPoint && (
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={paddingTop + plotHeight}
                stroke="#ff8a00"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />
            )}

            {/* Data Circles */}
            {points.map((p, i) => (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="4"
                  fill="var(--card)"
                  stroke="#ff8a00"
                  strokeWidth="2.5"
                />
                {hoveredPoint && hoveredPoint.index === i && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="8"
                    fill="rgba(255, 138, 0, 0.3)"
                    style={{ transition: 'all 0.1s ease' }}
                  />
                )}
              </g>
            ))}

            {/* X Axis Labels */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={height - paddingBottom + 22}
                textAnchor="middle"
                fill={hoveredPoint && hoveredPoint.index === i ? "var(--text-primary)" : "var(--text-muted)"}
                fontSize="11"
                fontWeight={hoveredPoint && hoveredPoint.index === i ? "700" : "600"}
              >
                {p.month}
              </text>
            ))}

            {/* Tooltip via foreignObject to scale perfectly */}
            {hoveredPoint && (
              <foreignObject
                x={hoveredPoint.x - 100}
                y={hoveredPoint.y - 80}
                width="200"
                height="70"
                style={{ overflow: 'visible', pointerEvents: 'none' }}
              >
                <div style={{
                  background: dark ? 'rgba(30, 34, 54, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid rgba(255, 138, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  boxShadow: 'var(--shadow-md)',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 'auto',
                  minWidth: '130px',
                  margin: '0 auto'
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {hoveredPoint.month} 필요 자금
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                    {formatKRW(hoveredPoint.total)}원
                  </span>
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

      {/* 금월 필요 자금 목록 카드 */}
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
            <button className="btn btn-ghost" onClick={handleCopyPrevMonthData}>전월 데이터 복사</button>
            <button className="btn btn-dark" onClick={handleAddPayment}>+ 항목추가</button>
          </div>
        </div>

        <div style={{ animation: 'tabFadeIn 0.2s ease', marginTop: '1.5rem' }}>
          <div style={{ padding: '0 1.5rem 1.5rem', overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 650 }}>
              <thead>
                <tr>
                  <th style={{ width: 90, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>입금여부</th>
                  <th style={{ width: 180, backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>납부일</th>
                  <th style={{ backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>항목</th>
                  <th style={{ width: 180, textAlign: 'right', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>금액 (원)</th>
                  <th style={{ width: 140, textAlign: 'center', backgroundColor: dark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.05)' }}>작업</th>
                </tr>
              </thead>
              <tbody>
                {sortedCardPayments.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem 0', opacity: 0.4, fontSize: '0.85rem' }}>
                      등록된 납부 내역이 없습니다.
                    </td>
                  </tr>
                )}
                {sortedCardPayments.map((p) => {
                  const isRowPaid = !!p.isPaid;
                  const hasDetails = p.details && p.details.length > 0;
                  return (
                    <tr 
                      key={p.id}
                      style={{ 
                        backgroundColor: isRowPaid 
                          ? (dark ? 'rgba(59, 130, 246, 0.16)' : 'rgba(59, 130, 246, 0.08)') 
                          : 'transparent',
                        transition: 'background-color 0.25s ease'
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input 
                            type="text" 
                            value={p.item || ''} 
                            placeholder="항목 입력"
                            onChange={(e) => handlePaymentFieldChange(p.id, 'item', e.target.value)} 
                            style={{ flex: 1 }}
                          />
                          {hasDetails && (
                            <span 
                              style={{ 
                                fontSize: '0.65rem', 
                                padding: '2px 6px', 
                                borderRadius: '4px', 
                                background: 'rgba(255, 138, 0, 0.15)', 
                                color: '#ff8a00',
                                fontWeight: 700,
                                flexShrink: 0
                              }}
                            >
                              상세 {p.details.length}
                            </span>
                          )}
                        </div>
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
                            className="btn btn-ghost btn-sm" 
                            style={{ padding: '4px 8px', color: 'var(--orange)' }} 
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
