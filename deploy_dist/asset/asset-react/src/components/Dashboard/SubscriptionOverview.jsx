import { useMemo, useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

export default function SubscriptionOverview() {
  const { getCurrentSections, yearData, year, month, dark } = useApp();

  // 1. 현재 월 구독중인 상품 정보 추출 (분류 항목이 '구독'인 대상)
  const currentSubscriptions = useMemo(() => {
    const sections = getCurrentSections();
    const list = [];
    
    Object.keys(sections).forEach(secKey => {
      const secItems = sections[secKey];
      if (!Array.isArray(secItems)) return;

      secItems.forEach(item => {
        const catStr = String(item.category || '');
        
        // 분류 항목에 '구독'이 포함된 데이터만 대상
        if (catStr.includes('구독')) {
          const itemAmount = Number(item.amount) || 0;
          const detailsSum = (Array.isArray(item.details) && item.details.length > 0)
            ? item.details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
            : 0;

          // 상세 내역 합계가 메인 항목 금액과 일치할 경우 상세 목록 표시, 그렇지 않을 경우 메인 항목 표시
          if (Array.isArray(item.details) && item.details.length > 0 && detailsSum === itemAmount) {
            item.details.forEach((d, idx) => {
              list.push({
                id: `${item.id}-${idx}`,
                name: d.content || item.content || item.category || '구독 상품',
                amount: Number(d.amount) || 0,
                remarks: d.remarks || item.desc || '',
                category: item.category || '구독',
                parentContent: item.content || item.desc || ''
              });
            });
          } else {
            list.push({
              id: item.id,
              name: item.content || item.desc || item.category || '구독 상품',
              amount: itemAmount,
              remarks: item.desc || '',
              category: item.category || '구독',
              parentContent: ''
            });
          }
        }
      });
    });

    return list;
  }, [getCurrentSections]);

  // 이번 달 총 구독 지출 금액
  const totalSubAmount = useMemo(() => {
    return currentSubscriptions.reduce((sum, s) => sum + s.amount, 0);
  }, [currentSubscriptions]);

  // 2. 월별 납부 금액 변동 추이 데이터 추출 (1월 ~ 12월)
  // 분류 항목에 '구독'으로 입력된 금액(item.amount)만 계산
  const monthlyTrends = useMemo(() => {
    const monthsData = yearData[year]?.months || {};
    const result = [];
    const mKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    mKeys.forEach(mStr => {
      let sec = monthsData[mStr]?.sections;
      if (!sec && mStr === month) {
        sec = getCurrentSections();
      }

      let monthTotal = 0;
      let itemCount = 0;

      if (sec) {
        Object.keys(sec).forEach(secKey => {
          const secItems = sec[secKey];
          if (!Array.isArray(secItems)) return;

          secItems.forEach(item => {
            const catStr = String(item.category || '');

            // 분류가 '구독'을 포함하는 항목의 금액(item.amount)만 합산
            if (catStr.includes('구독')) {
              monthTotal += (Number(item.amount) || 0);
              itemCount += 1;
            }
          });
        });
      }

      result.push({
        month: `${parseInt(mStr, 10)}월`,
        mStr,
        amount: monthTotal,
        itemCount,
        isCurrent: mStr === month
      });
    });

    return result;
  }, [yearData, year, month, getCurrentSections]);

  // 그래프 계산용 최대값 및 전월 대비 계산
  const maxAmount = useMemo(() => {
    const max = Math.max(...monthlyTrends.map(t => t.amount), 1);
    return Math.ceil(max / 10000) * 10000 || 50000;
  }, [monthlyTrends]);

  const currentMonthIdx = useMemo(() => {
    return monthlyTrends.findIndex(t => t.mStr === month);
  }, [monthlyTrends, month]);

  const prevMonthCompare = useMemo(() => {
    if (currentMonthIdx <= 0) return null;
    const prev = monthlyTrends[currentMonthIdx - 1].amount;
    const curr = monthlyTrends[currentMonthIdx].amount;
    const diff = curr - prev;
    return {
      prev,
      curr,
      diff,
      rate: prev > 0 ? ((diff / prev) * 100).toFixed(1) : (curr > 0 ? 100 : 0)
    };
  }, [monthlyTrends, currentMonthIdx]);

  // 모바일 감지
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // 차트 툴팁 상태
  const [activePoint, setActivePoint] = useState(null);
  const chartRef = useRef(null);

  // 모바일: 외부 클릭 시 툴팁 닫기
  useEffect(() => {
    if (!isMobile) return;
    const handler = (e) => {
      if (chartRef.current && !chartRef.current.contains(e.target)) {
        setActivePoint(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isMobile]);

  // 서비스별 아이콘 색상 생성
  const getBadgeColor = (name) => {
    if (name.includes('Youtube') || name.includes('유튜브')) return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
    if (name.includes('SK') || name.includes('우주')) return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
    if (name.includes('Google') || name.includes('구글') || name.includes('AI')) return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' };
    if (name.includes('Neflix') || name.includes('넷플릭스')) return { bg: 'rgba(220, 38, 38, 0.15)', color: '#dc2626', border: 'rgba(220, 38, 38, 0.3)' };
    if (name.includes('Coupang') || name.includes('쿠팡')) return { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316', border: 'rgba(249, 115, 22, 0.3)' };
    return { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.25)' };
  };

  // SVG 차트 좌표 계산
  const chartWidth = 560;
  const chartHeight = 160;
  const paddingX = 30;
  const paddingY = 25;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const points = useMemo(() => {
    return monthlyTrends.map((t, idx) => {
      const x = paddingX + (idx / (monthlyTrends.length - 1)) * usableWidth;
      const y = chartHeight - paddingY - (t.amount / maxAmount) * usableHeight;
      return { ...t, x, y, idx };
    });
  }, [monthlyTrends, maxAmount, usableWidth, usableHeight]);

  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = chartHeight - paddingY;
    return `${pathD} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [pathD, points, bottomY => chartHeight - paddingY]);

  return (
    <div className="section-card subscription-overview-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
      {/* 카드 헤더 */}
      <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div className="section-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '7px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(129, 140, 248, 0.25) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#a855f7',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            flexShrink: 0
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6"/>
              <path d="M2 11.5a10 10 0 0 1 18.8-4.3L21.5 8M22 12.5a10 10 0 0 1-18.8 4.2L2.5 16"/>
            </svg>
          </div>
          구독
          
          {/* 타이틀 우측 건수 작게 표시 */}
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '99px',
            background: 'rgba(168, 85, 247, 0.12)',
            color: '#a855f7',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            marginLeft: '2px'
          }}>
            {currentSubscriptions.length}건
          </span>

          <span className="col-hide-mobile" style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Subscribed Services
          </span>
        </div>

        {/* 이번달 합계 금액 영역 (모바일 우측 정렬) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: '99px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--purple)',
            fontWeight: 700,
            textAlign: 'right',
            whiteSpace: 'nowrap'
          }}>
            합계: {formatKRW(totalSubAmount)}원
          </div>
        </div>
      </div>

      {/* 본문 레이아웃: 좌 측(구독 상품 목록) / 우 측(월별 납부 금액 변동 추이 그래프) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
        
        {/* 1. 구독 상품 목록 영역 */}
        <div style={{
          background: dark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--purple)' }}></span>
              구독 목록
            </span>
          </div>

          {currentSubscriptions.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center' }}>
              등록된 구독 상품 내역이 없습니다.<br/>(지출 내역 분류를 '구독'으로 등록해보세요)
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {currentSubscriptions.map(sub => {
                const badgeStyle = getBadgeColor(sub.name);
                return (
                  <div key={sub.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem', borderRadius: '8px',
                    background: dark ? 'rgba(255,255,255,0.03)' : '#ffffff',
                    border: '1px solid var(--border)',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '6px',
                        background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 800, flexShrink: 0
                      }}>
                        {sub.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.name}
                        </div>
                        {sub.remarks && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {sub.remarks}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '0.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {formatKRW(sub.amount)}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--purple)', opacity: 0.85 }}>
                        월 정기
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2. 월별 납부 금액 변동 추이 그래프 영역 */}
        <div style={{
          background: dark ? 'rgba(255, 255, 255, 0.02)' : '#f8fafc',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          justify: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.83rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)' }}></span>
              구독료 추이
              <span className="col-hide-mobile">({year}년)</span>
            </span>

            {prevMonthCompare && (
              <span className="col-hide-mobile" style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: prevMonthCompare.diff > 0 ? 'var(--coral)' : prevMonthCompare.diff < 0 ? 'var(--teal)' : 'var(--text-muted)'
              }}>
                전월 대비 {prevMonthCompare.diff > 0 ? `▲ ${formatKRW(prevMonthCompare.diff)}` : prevMonthCompare.diff < 0 ? `▼ ${formatKRW(Math.abs(prevMonthCompare.diff))}` : '변동없음'}
              </span>
            )}
          </div>

          {/* SVG Line Chart */}
          <div ref={chartRef} style={{ position: 'relative', width: '100%', height: '160px' }}>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                {/* 영역 채우기 그라데이션 */}
                <linearGradient id="sub-area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
                </linearGradient>

                {/* 선 라인 그라데이션 */}
                <linearGradient id="sub-line-gradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>

                <filter id="dot-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#a855f7" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* 가로 가이드라인 3줄 */}
              {[0, 0.5, 1].map(ratio => {
                const gy = chartHeight - paddingY - ratio * usableHeight;
                return (
                  <line
                    key={ratio}
                    x1={paddingX}
                    y1={gy}
                    x2={chartWidth - paddingX}
                    y2={gy}
                    stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'}
                    strokeDasharray="3 3"
                  />
                );
              })}

              {/* 영역 그라데이션 */}
              {areaD && <path d={areaD} fill="url(#sub-area-gradient)" />}

              {/* 메인 데이터 추이 곡선 */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#sub-line-gradient)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* 각 월별 데이터 포인트 닷(Dot) & X축 라벨 */}
              {points.map(p => {
                const isActive = activePoint && activePoint.idx === p.idx;
                const handlers = isMobile
                  ? { onClick: (e) => { e.stopPropagation(); setActivePoint(isActive ? null : p); } }
                  : { onMouseEnter: () => setActivePoint(p), onMouseLeave: () => setActivePoint(null) };
                return (
                  <g key={p.mStr} {...handlers}>
                    {/* 데이터 닷 (현재 월 / 호버·클릭 시 강조) */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={p.isCurrent || isActive ? 6 : 4}
                      fill={p.isCurrent ? '#ffffff' : isActive ? '#ec4899' : '#a855f7'}
                      stroke={p.isCurrent ? '#a855f7' : '#ffffff'}
                      strokeWidth={p.isCurrent ? 3 : 2}
                      filter={p.isCurrent || isActive ? 'url(#dot-glow)' : undefined}
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    />

                    {/* X축 월 라벨 */}
                    <text
                      x={p.x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight={p.isCurrent ? '700' : '500'}
                      fill={p.isCurrent ? 'var(--purple)' : 'var(--text-muted)'}
                    >
                      {p.month}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip */}
            {activePoint && (
              <div style={{
                position: 'absolute',
                left: `${(activePoint.x / chartWidth) * 100}%`,
                top: `${(activePoint.y / chartHeight) * 100}%`,
                transform: 'translate(-50%, -120%)',
                background: dark ? '#1e293b' : '#ffffff',
                border: '1px solid var(--border)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                borderRadius: '6px',
                padding: '4px 8px',
                pointerEvents: 'none',
                zIndex: 10,
                whiteSpace: 'nowrap'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{activePoint.month} 구독 합계</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--purple)' }}>{formatKRW(activePoint.amount)}</div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
