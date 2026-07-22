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
    const realEstate = sum(sections['real-estate']);
    const retirement = sum(sections.retirement);
    
    const income = sum(sections.income);
    const vExpense = sum(sections['v-expense']);
    const fExpense = sum(sections['f-expense']);
    const yExpense = sum(sections['y-expense']);
    const totalExpense = vExpense + fExpense + yExpense;

    const totalAsset = cash + nonCash + realEstate + retirement;
    const debt = sum(sections.debt);
    const netWorth = totalAsset - debt;

    return {
      cash,
      nonCash,
      realEstate,
      retirement,
      totalAsset,
      debt,
      netWorth,
      income,
      totalExpense
    };
  }, [sections]);

  // 자산 포트폴리오 비중 (%)
  const portfolioSegments = useMemo(() => {
    const total = totals.totalAsset || 1;
    return [
      { name: '현금자산', amount: totals.cash, color: '#3b82f6', pct: Math.round((totals.cash / total) * 100) },
      { name: '금융/비현금', amount: totals.nonCash, color: '#8b5cf6', pct: Math.round((totals.nonCash / total) * 100) },
      { name: '부동산', amount: totals.realEstate, color: '#f97316', pct: Math.round((totals.realEstate / total) * 100) },
      { name: '연금자산', amount: totals.retirement, color: '#a855f7', pct: Math.round((totals.retirement / total) * 100) },
    ].filter(s => s.pct > 0 || s.amount > 0);
  }, [totals]);

  // 도넛 차트 SVG 파라미터 계산
  const donutSvg = useMemo(() => {
    let accumulatedAngle = 0;
    const radius = 42;
    const circumference = 2 * Math.PI * radius;

    const arcs = portfolioSegments.map((seg) => {
      const pct = (seg.amount / (totals.totalAsset || 1));
      const strokeDasharray = `${pct * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += pct;
      return { ...seg, strokeDasharray, strokeDashoffset };
    });

    return { arcs, circumference };
  }, [portfolioSegments, totals.totalAsset]);

  return (
    <div className="section-card asset-analytics-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
        
        {/* 1. 포트폴리오 자산 비중 도넛 차트 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', paddingRight: '1rem', borderRight: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <svg width="110" height="110" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}>
              <circle cx="50" cy="50" r="42" fill="none" stroke={dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0'} strokeWidth="12" />
              {donutSvg.arcs.map((arc, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={arc.color}
                  strokeWidth="12"
                  strokeDasharray={arc.strokeDasharray}
                  strokeDashoffset={arc.strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'all 0.6s ease' }}
                />
              ))}
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>순자산비율</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {totals.totalAsset > 0 ? Math.round((totals.netWorth / totals.totalAsset) * 100) : 0}%
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              자산 구성 포트폴리오
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {portfolioSegments.length === 0 ? (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>등록된 자산 데이터가 없습니다.</span>
              ) : (
                portfolioSegments.map((seg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{seg.name}</span>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0, marginLeft: 8 }}>
                      {formatKRW(seg.amount)}원 <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 600 }}>({seg.pct}%)</span>
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 2. 월 수입 vs 총 지출 흐름 바 차트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              이번달 수입 vs 지출 요약
            </div>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: totals.income >= totals.totalExpense ? '#10b981' : '#ef4444' }}>
              {totals.income >= totals.totalExpense ? '✓ 흑자 달성' : '⚠️ 적자 상태'}
            </span>
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

          {/* 지출 바 (Yellow Tick Gauge 계기판) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 800, marginBottom: '0.35rem' }}>
              <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 6px #ef4444' }} /> 당월 총 지출
              </span>
              <span style={{ color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800 }}>{formatKRW(totals.totalExpense)}원</span>
            </div>
            <div className="yellow-tick-gauge-track">
              <div 
                className="yellow-tick-gauge-fill-expense"
                style={{
                  width: `${Math.min((totals.totalExpense / (Math.max(totals.income, totals.totalExpense) || 1)) * 100, 100)}%`
                }} 
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
