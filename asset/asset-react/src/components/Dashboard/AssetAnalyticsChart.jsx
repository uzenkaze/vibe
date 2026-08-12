import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

export default function AssetAnalyticsChart() {
  const { getCurrentSections, dark } = useApp();
  const sections = getCurrentSections();

  // 자산 항목별 총액 계산
  const totals = useMemo(() => {
    const sum = (arr) => (arr || []).reduce((a, b) => a + (Number(b.amount) || 0), 0);
    const cash = sum(sections.cash);
    const nonCash = sum(sections['non-cash']);
    const retirement = sum(sections.retirement);
    
    const income = sum(sections.income);
    const curCashPayment = sum(sections.cardPayments);
    const curCardPayment = (sections.cardMonthlySummaries || []).reduce((a, r) => a + (Number(r.currentMonthTotal) || 0), 0);
    const vExpense = sum(sections['v-expense']);
    const fExpense = sum(sections['f-expense']);
    const totalExpense = (curCashPayment + curCardPayment) > 0 
      ? (curCashPayment + curCardPayment) 
      : (vExpense + fExpense);

    const totalAsset = cash + nonCash + retirement;
    const debt = sum(sections.debt);
    const netWorth = totalAsset - debt;

    return {
      cash,
      nonCash,
      retirement,
      totalAsset,
      debt,
      netWorth,
      income,
      totalExpense
    };
  }, [sections]);

  // 자산 포트폴리오 비중 (%) - EAM 앱 대시보드 테마 컬러 매칭 (Navy Blue, Emerald Mint, Soft Violet, Amber Gold)
  const portfolioSegments = useMemo(() => {
    const total = totals.totalAsset || 0;
    
    const items = [
      { id: 'nonCash', name: '비현금/금융자산', amount: totals.nonCash, color: '#3b82f6', displayColor: '#3b82f6' },
      { id: 'cash', name: '현금자산', amount: totals.cash, color: '#10b981', displayColor: '#10b981' },
      { id: 'retirement', name: '연금자산', amount: totals.retirement, color: '#8b5cf6', displayColor: '#8b5cf6' },
      { id: 'debt', name: '기타/부채', amount: totals.debt, color: '#f59e0b', displayColor: '#f59e0b' },
    ];

    if (total > 0) {
      const filtered = items.filter(item => item.amount > 0);
      const activeTotal = filtered.reduce((sum, item) => sum + item.amount, 0) || 1;
      return filtered.map(item => ({
        ...item,
        pct: Math.round((item.amount / activeTotal) * 100)
      }));
    } else {
      // 등록된 데이터가 없을 경우 샘플 비중 노출
      return [
        { id: 'nonCash', name: '비현금/금융자산', amount: 43000000, color: '#3b82f6', displayColor: '#3b82f6', pct: 45 },
        { id: 'cash', name: '현금자산', amount: 28000000, color: '#10b981', displayColor: '#10b981', pct: 30 },
        { id: 'retirement', name: '연금자산', amount: 17000000, color: '#8b5cf6', displayColor: '#8b5cf6', pct: 15 },
        { id: 'debt', name: '기타/부채', amount: 10000000, color: '#f59e0b', displayColor: '#f59e0b', pct: 10 },
      ];
    }
  }, [totals]);

  // 첨부 이미지 스타일의 둥근 모서리 & 조각별 간격 도넛 호(Arc) 및 백색 뱃지 좌표 계산
  const donutArcs = useMemo(() => {
    const cx = 100;
    const cy = 100;
    const rMid = 68;
    const strokeWidth = 30;
    const padAngle = 0.12; // 각 도넛 조각 사이 간격 (약 7도)
    let startAngle = -Math.PI / 2; // 12시 방향 시작

    const totalPct = portfolioSegments.reduce((sum, s) => sum + (s.pct || 0), 0) || 100;

    return portfolioSegments.map((seg) => {
      const pctFrac = (seg.pct || 0) / totalPct;
      const angleSpan = pctFrac * 2 * Math.PI;

      const segStart = startAngle;
      const segEnd = startAngle + angleSpan;
      startAngle = segEnd;

      const arcStart = segStart + padAngle / 2;
      const arcEnd = segEnd - padAngle / 2;
      const safeArcEnd = arcEnd <= arcStart ? arcStart + 0.01 : arcEnd;

      const x1 = cx + rMid * Math.cos(arcStart);
      const y1 = cy + rMid * Math.sin(arcStart);
      const x2 = cx + rMid * Math.cos(safeArcEnd);
      const y2 = cy + rMid * Math.sin(safeArcEnd);

      const largeArc = (safeArcEnd - arcStart) > Math.PI ? 1 : 0;
      const pathD = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${rMid} ${rMid} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

      const midAngle = (arcStart + safeArcEnd) / 2;
      const badgeX = cx + rMid * Math.cos(midAngle);
      const badgeY = cy + rMid * Math.sin(midAngle);

      return {
        ...seg,
        pathD,
        badgeX,
        badgeY,
        strokeWidth
      };
    });
  }, [portfolioSegments]);

  return (
    <div className="section-card asset-analytics-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* 1. 이미지 형태의 도넛 차트 & 범주 */}
        <div className="asset-portfolio-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingRight: '0.75rem', borderRight: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
          
          {/* 도넛 차트 SVG 영역 */}
          <div className="donut-chart-container" style={{ position: 'relative', width: 180, height: 180, flexShrink: 0 }}>
            <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <defs>
                {/* 빗금 패턴 서식 */}
                <pattern id="striped-pattern" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                  <rect width="8" height="8" fill={dark ? '#1e293b' : '#f8fafc'} />
                  <line x1="0" y1="0" x2="0" y2="8" stroke={dark ? '#475569' : '#cbd5e1'} strokeWidth="4" />
                </pattern>
                {/* 퍼센티지 뱃지 쉐도우 */}
                <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.18" />
                </filter>
              </defs>

              {/* 도넛 곡선 조각들 (둥근 끝처리 & 간격) */}
              {donutArcs.map((arc, i) => (
                <path
                  key={i}
                  d={arc.pathD}
                  fill="none"
                  stroke={arc.color}
                  strokeWidth={arc.strokeWidth}
                  strokeLinecap="round"
                  style={{ transition: 'all 0.4s ease' }}
                />
              ))}

              {/* 중앙 총 자산 요약 텍스트 */}
              <text x="100" y="93" textAnchor="middle" fill="var(--text-muted)" fontSize="9.5" fontWeight="700" fontFamily="'Plus Jakarta Sans', sans-serif">
                총 자산
              </text>
              <text x="100" y="112" textAnchor="middle" fill="var(--text-primary)" fontSize="12.5" fontWeight="900" fontFamily="'Plus Jakarta Sans', sans-serif">
                {formatKRW(totals.totalAsset)}
              </text>

              {/* 조각 내부의 퍼센티지 뱃지 알약(Pill) */}
              {donutArcs.map((arc, i) => (
                <g key={`badge-${i}`} transform={`translate(${arc.badgeX.toFixed(2)}, ${arc.badgeY.toFixed(2)})`} filter="url(#badge-shadow)">
                  <rect
                    x="-18"
                    y="-9.5"
                    width="36"
                    height="19"
                    rx="9.5"
                    ry="9.5"
                    fill={dark ? '#0f172a' : '#ffffff'}
                    stroke={dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'}
                    strokeWidth="0.8"
                  />
                  <text
                    x="0"
                    y="3.5"
                    textAnchor="middle"
                    fill={dark ? '#f8fafc' : '#0f172a'}
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="'Plus Jakarta Sans', sans-serif"
                  >
                    {`${arc.pct}%`}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* 범례 영역 */}
          <div className="portfolio-legend-container" style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              자산 구성
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {portfolioSegments.map((seg, i) => (
                <div key={i} className="portfolio-legend-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.displayColor, flexShrink: 0 }} />
                    <span className="portfolio-seg-name" style={{ color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.name}</span>
                  </div>
                  <span className="portfolio-seg-val" style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0, marginLeft: 6 }}>
                    {formatKRW(seg.amount)}원 <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600 }}>({seg.pct}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. 월 수입 vs 총 지출 흐름 바 차트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              수입/지출 요약
            </div>
            {(() => {
              const diff = totals.income - totals.totalExpense;
              const isShortage = diff < 0;
              return (
                <div style={{
                  fontSize: '0.82rem',
                  fontWeight: 900,
                  color: isShortage ? '#f43f5e' : '#10b981',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}>
                  {isShortage ? '-' : '+'}{formatKRW(Math.abs(diff))}<span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', marginLeft: 2 }}>원</span>
                </div>
              );
            })()}
          </div>

          {/* 수입 바 (Yellow Tick Gauge 계기판) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} /> 당월 총 수입
              </span>
              <span style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>{formatKRW(totals.income)}원</span>
            </div>
            <div className="yellow-tick-gauge-track">
              <div 
                className="yellow-tick-gauge-fill-income"
                style={{
                  width: `${Math.min((totals.income / (Math.max(totals.income, totals.totalExpense) || 1)) * 100, 100)}%`
                }} 
              />
            </div>
          </div>

          {/* 지출 바 (수입 범위 내 초록 + 초과분 빨강 계기판) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span style={{ color: totals.totalExpense > totals.income ? '#f43f5e' : '#10b981', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: totals.totalExpense > totals.income ? '#f43f5e' : '#10b981', boxShadow: totals.totalExpense > totals.income ? '0 0 6px #f43f5e' : '0 0 6px #10b981' }} /> 당월 총 지출
              </span>
              <span style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>{formatKRW(totals.totalExpense)}원</span>
            </div>
            {(() => {
              const maxVal = Math.max(totals.income, totals.totalExpense) || 1;
              const safePct = (Math.min(totals.totalExpense, totals.income) / maxVal) * 100;
              const overPct = (Math.max(0, totals.totalExpense - totals.income) / maxVal) * 100;
              return (
                <div className="yellow-tick-gauge-track" style={{ position: 'relative' }}>
                  {/* 수입 범위 내 안전 지출 (초록/청록빛) */}
                  <div 
                    style={{
                      height: '100%',
                      width: `${safePct}%`,
                      borderRadius: overPct > 0 ? '99px 0 0 99px' : '99px',
                      background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 50%, #10b981 100%)',
                      boxShadow: '0 0 10px rgba(16, 185, 129, 0.4)',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                  {/* 수입 초과 지출 (로즈/크림슨 빨강빛) */}
                  {overPct > 0 && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0, bottom: 0,
                        left: `${safePct}%`,
                        width: `${overPct}%`,
                        borderRadius: '0 99px 99px 0',
                        background: 'linear-gradient(90deg, #f43f5e 0%, #be123c 100%)',
                        boxShadow: '0 0 12px rgba(244, 63, 94, 0.6)',
                        transition: 'width 0.4s ease'
                      }} 
                    />
                  )}
                </div>
              );
            })()}
          </div>
        </div>

      </div>
    </div>
  );
}
