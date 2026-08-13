import { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

function InstallmentStatCard({ label, value, theme, icon, subBadge, tooltipContent, dark }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    const supportsHover = window.matchMedia('(hover: hover)').matches;
    if (supportsHover && window.innerWidth > 768) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // 첨부 이미지 스타일 스펙 (Soft Pastel Glow Gradient Background, Inner Floating Soft Icon Box, Rounded Pill Tags)
  const themeStyles = {
    indigo: {
      cardBg: dark ? 'linear-gradient(135deg, #111827 0%, #1e293b 100%)' : 'linear-gradient(135deg, #f0f7ff 0%, #e6f0fa 100%)',
      cardBorder: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(219, 234, 254, 0.9)',
      iconBoxBg: dark ? 'rgba(59, 130, 246, 0.15)' : '#ffffff',
      iconBoxShadow: dark ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 10px 22px -4px rgba(37, 99, 235, 0.12), inset 0 2px 4px #ffffff',
      iconColor: '#3b82f6',
      titleColor: dark ? '#f8fafc' : '#0f172a',
      pillBg: dark ? 'rgba(59, 130, 246, 0.18)' : '#ffffff',
      pillBorder: dark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(226, 232, 240, 0.8)',
      pillText: dark ? '#93c5fd' : '#2563eb',
      valueColor: dark ? '#60a5fa' : '#2563eb'
    },
    rose: {
      cardBg: dark ? 'linear-gradient(135deg, #1f1216 0%, #29151c 100%)' : 'linear-gradient(135deg, #fff2f5 0%, #ffe6ec 100%)',
      cardBorder: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(254, 205, 211, 0.9)',
      iconBoxBg: dark ? 'rgba(244, 63, 94, 0.15)' : '#ffffff',
      iconBoxShadow: dark ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 10px 22px -4px rgba(225, 29, 72, 0.12), inset 0 2px 4px #ffffff',
      iconColor: '#f43f5e',
      titleColor: dark ? '#f8fafc' : '#0f172a',
      pillBg: dark ? 'rgba(244, 63, 94, 0.18)' : '#ffffff',
      pillBorder: dark ? 'rgba(244, 63, 94, 0.3)' : 'rgba(226, 232, 240, 0.8)',
      pillText: dark ? '#fca5a5' : '#e11d48',
      valueColor: dark ? '#f87171' : '#e11d48'
    },
    emerald: {
      cardBg: dark ? 'linear-gradient(135deg, #091e17 0%, #112921 100%)' : 'linear-gradient(135deg, #f0fdf4 0%, #dcfee9 100%)',
      cardBorder: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(167, 243, 208, 0.9)',
      iconBoxBg: dark ? 'rgba(16, 185, 129, 0.15)' : '#ffffff',
      iconBoxShadow: dark ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 10px 22px -4px rgba(5, 150, 105, 0.12), inset 0 2px 4px #ffffff',
      iconColor: '#10b981',
      titleColor: dark ? '#f8fafc' : '#0f172a',
      pillBg: dark ? 'rgba(16, 185, 129, 0.18)' : '#ffffff',
      pillBorder: dark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(226, 232, 240, 0.8)',
      pillText: dark ? '#6ee7b7' : '#059669',
      valueColor: dark ? '#34d399' : '#059669'
    },
    violet: {
      cardBg: dark ? 'linear-gradient(135deg, #18122c 0%, #23193d 100%)' : 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
      cardBorder: dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(221, 214, 254, 0.9)',
      iconBoxBg: dark ? 'rgba(139, 92, 246, 0.15)' : '#ffffff',
      iconBoxShadow: dark ? '0 8px 20px rgba(0, 0, 0, 0.4)' : '0 10px 22px -4px rgba(124, 58, 237, 0.12), inset 0 2px 4px #ffffff',
      iconColor: '#8b5cf6',
      titleColor: dark ? '#f8fafc' : '#0f172a',
      pillBg: dark ? 'rgba(139, 92, 246, 0.18)' : '#ffffff',
      pillBorder: dark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(226, 232, 240, 0.8)',
      pillText: dark ? '#c4b5fd' : '#7c3aed',
      valueColor: dark ? '#a78bfa' : '#7c3aed'
    }
  }[theme || 'indigo'];

  return (
    <div
      className="installment-stat"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ 
        background: themeStyles.cardBg, 
        position: 'relative', 
        zIndex: isHovered ? 100 : 1,
        border: `2px solid ${themeStyles.cardBorder}`,
        borderRadius: '24px',
        padding: '1rem 1.15rem',
        boxShadow: isHovered 
          ? '0 16px 36px -8px rgba(15, 23, 42, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)' 
          : '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxSizing: 'border-box'
      }}
    >
      {/* 첨부 이미지 스타일: 좌측 독립 3D 입체 소프트 아이콘 박스 */}
      <div style={{
        width: 58,
        height: 58,
        borderRadius: '18px',
        background: themeStyles.iconBoxBg,
        boxShadow: themeStyles.iconBoxShadow,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: themeStyles.iconColor,
        flexShrink: 0,
        border: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0.9)'
      }}>
        {icon}
      </div>

      {/* 우측 정보 영역 (타이틀, 금액, 알약 태그) */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={{
          fontSize: '0.92rem',
          fontWeight: 800,
          color: themeStyles.titleColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </div>

        <div style={{
          fontSize: 'clamp(1.1rem, 2.3vw, 1.45rem)',
          fontWeight: 900,
          color: themeStyles.valueColor,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          letterSpacing: '-0.03em',
          lineHeight: 1.15
        }}>
          {formatKRW(value)} <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>원</span>
        </div>

        {subBadge && (
          <div style={{ marginTop: '0.1rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              background: themeStyles.pillBg,
              border: `1px solid ${themeStyles.pillBorder}`,
              color: themeStyles.pillText,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              {subBadge}
            </span>
          </div>
        )}
      </div>

      {isHovered && tooltipContent && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '0.85rem 1.1rem',
          boxShadow: '0 14px 36px rgba(15, 23, 42, 0.22)',
          zIndex: 1000,
          minWidth: '250px',
          color: '#0f172a',
          pointerEvents: 'none'
        }}>
          {tooltipContent}
        </div>
      )}
    </div>
  );
}


export default function InstallmentOverview() {
  const { getCurrentSections, year, month, yearData, getPrevMonthCompareData, dark } = useApp();

  const sections = getCurrentSections();
  const installments = sections.installment || [];

  const currentMonthStr = useMemo(() => {
    return `${String(year).substring(2)}.${String(month).padStart(2, '0')}`;
  }, [year, month]);

  // 선택 연월 기준 활성 할부 필터링
  const activeInstallments = useMemo(() => {
    return installments.filter(r => {
      if (r.repayStatus === 'full') return false;
      
      let calculatedEndDate = '';
      if (r.date && r.totalMonths) {
        const p = r.date.split(/[-./ ]/);
        if (p.length >= 2) {
          let y = parseInt(p[0]), m = parseInt(p[1]) + (parseInt(r.totalMonths) || 1);
          y += Math.floor((m - 1) / 12);
          m = (m - 1) % 12 + 1;
          calculatedEndDate = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
        }
      }
      if (!calculatedEndDate) {
        calculatedEndDate = r.endDate;
      }

      if (calculatedEndDate && calculatedEndDate < currentMonthStr) return false;
      if (Number(r.currentMonth) > Number(r.totalMonths)) return false;
      
      if (Number(r.currentMonth) >= Number(r.totalMonths)) {
        if (calculatedEndDate && calculatedEndDate !== currentMonthStr) {
          return false;
        }
        if (!calculatedEndDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [installments, currentMonthStr]);

  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  const { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal } = useMemo(() => {
    const curMonthNum = parseInt(month, 10);
    const yd = yearData[year] || {};
    const monthsObj = yd.months || {};

    let totalAmount = 0;
    for (let m = 1; m <= curMonthNum; m++) {
      const mKeyPadded = String(m).padStart(2, '0');
      const mKeyUnpadded = String(m);
      const mData = monthsObj[mKeyPadded] || monthsObj[mKeyUnpadded] || {};
      const mSec = mData.sections || {};
      const mCardSummaries = mSec.cardMonthlySummaries || [];
      
      mCardSummaries.forEach(c => {
        totalAmount += (Number(c.currentMonthTotal) || 0);
      });
    }

    // 카드별 결제금액 상세 영역의 이달 결제액 합계 및 다음달 결제액 합계 그대로 표시
    const thisMonthTotal = cardMonthlySummaries.reduce((a, c) => a + (Number(c.currentMonthTotal) || 0), 0);
    const nextMonthTotal = cardMonthlySummaries.reduce((a, c) => a + (Number(c.nextMonthExpected) || 0), 0);
    const remainTotal = Math.max(totalAmount - thisMonthTotal, 0);

    return { totalAmount, thisMonthTotal, nextMonthTotal, remainTotal };
  }, [cardMonthlySummaries, yearData, year, month]);

  const stats = [
    {
      label: '결제원금',
      value: totalAmount,
      theme: 'indigo',
      subBadge: `1~${Number(month)}월 누적`,
      progressPct: 100,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="4" fill="rgba(99, 102, 241, 0.15)" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M2 9h20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <rect x="5" y="13" width="4" height="3" rx="1" fill="currentColor"/>
          <circle cx="17" cy="14.5" r="1.5" fill="currentColor" opacity="0.9"/>
          <circle cx="19.5" cy="14.5" r="1.5" fill="currentColor" opacity="0.6"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          1월부터 현재 조회 월({Number(month)}월)까지의 <strong>총 카드 사용 금액 합계</strong>입니다.
        </div>
      )
    },
    {
      label: '남은 잔액',
      value: remainTotal,
      theme: 'rose',
      subBadge: '이번달 차감 후',
      progressPct: totalAmount > 0 ? (remainTotal / totalAmount) * 100 : 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 18V9c0-1.657-1.343-3-3-3H5c-1.657 0-3 1.343-3 3v9c0 1.657 1.343 3 3 3h13c1.657 0 3-1.343 3-3z" fill="rgba(244, 63, 94, 0.15)" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 7.5V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="16.5" cy="13.5" r="2" fill="currentColor"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          1월부터 {Number(month)}월까지의 총 카드 사용 금액 합계에서 <strong>이번 달 납부 금액을 차감한 잔액</strong>입니다.
        </div>
      )
    },
    {
      label: '이번달',
      value: thisMonthTotal,
      theme: 'emerald',
      subBadge: `${Number(month)}월 청구`,
      progressPct: totalAmount > 0 ? (thisMonthTotal / totalAmount) * 100 : 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="17" rx="4" fill="rgba(16, 185, 129, 0.15)" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M3 9h18" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M9 14.5l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          이번 달(선택 연월)에 청구되는 <strong>카드 결제금액 및 할부 청구액의 총합계</strong> 금액입니다.
        </div>
      )
    },
    {
      label: '다음달',
      value: nextMonthTotal,
      theme: 'violet',
      subBadge: `${Number(month) === 12 ? 1 : Number(month) + 1}월 예정`,
      progressPct: totalAmount > 0 ? (nextMonthTotal / totalAmount) * 100 : 0,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" fill="rgba(139, 92, 246, 0.15)" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M12 7v5l3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M17.5 6.5l3-3m0 0h-4.5m4.5 0v4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      tooltipContent: (
        <div style={{ fontSize: '0.8rem', lineHeight: '1.4', maxWidth: '240px' }}>
          다음 달에 청구 예정인 <strong>카드 결제금액 및 할부 청구액의 총합계</strong> 금액입니다.
        </div>
      )
    },
  ];

  // 종료 예정 할부 스케줄 데이터 추출 (회차 기준 만료 예정 항목 그룹화)
  const expiringSchedules = useMemo(() => {
    const list = installments.filter(r => {
      const isExpired = r.repayStatus === 'full' || (Number(r.currentMonth) >= Number(r.totalMonths));
      return !isExpired && (Number(r.currentMonth) > 0);
    });

    // 종료일 기준 그룹화
    const groupsMap = {};
    list.forEach(item => {
      let dateKey = '';
      if (item.date && item.totalMonths) {
        const p = item.date.split(/[-./ ]/);
        if (p.length >= 2) {
          let y = parseInt(p[0]), m = parseInt(p[1]) + (parseInt(item.totalMonths) || 1);
          y += Math.floor((m - 1) / 12);
          m = (m - 1) % 12 + 1;
          dateKey = `${String(y).substring(2)}.${String(m).padStart(2, '0')}`;
        }
      }
      if (!dateKey) dateKey = item.endDate || '상환 중';

      if (!groupsMap[dateKey]) groupsMap[dateKey] = [];
      groupsMap[dateKey].push(item);
    });

    const sortedKeys = Object.keys(groupsMap).sort();
    return { groupsMap, sortedKeys, totalCount: list.length };
  }, [installments]);

  const compareData = getPrevMonthCompareData ? getPrevMonthCompareData() : null;

  return (
    <div className="section-card installment-overview-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
      <div className="section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div className="section-card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 26, height: 26, borderRadius: '7px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(168, 85, 247, 0.25) 100%)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            flexShrink: 0
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          카드 현황
          <span className="col-hide-mobile" style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Card Overview
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
          {/* 모바일 전용 1~N월 누적 데이터 표기 칩 */}
          <span className="mobile-only-text" style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            padding: '3px 8px',
            borderRadius: '99px',
            background: 'rgba(99, 102, 241, 0.12)',
            color: '#6366f1',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            whiteSpace: 'nowrap'
          }}>
            1~{Number(month)}월 누적
          </span>

          {compareData && compareData.hasPrev && compareData.cardDiff !== 0 && (
            <div className="col-hide-mobile" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
              padding: '4px 12px',
              borderRadius: '99px',
              fontSize: '0.72rem',
              fontWeight: 800,
              background: compareData.cardDiff < 0 
                ? 'rgba(16, 185, 129, 0.12)' 
                : 'rgba(244, 63, 94, 0.12)',
              color: compareData.cardDiff < 0 ? '#10b981' : '#f43f5e',
              border: compareData.cardDiff < 0 
                ? '1px solid rgba(16, 185, 129, 0.25)' 
                : '1px solid rgba(244, 63, 94, 0.25)',
            }} title={`전월 카드사용 지출 대비 ${compareData.cardDiff > 0 ? '증가' : '감소'}`}>
              <span>전월대비</span>
              <span>{compareData.cardDiff > 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(compareData.cardRate).toFixed(1)}%</span>
              <span style={{ opacity: 0.8, fontWeight: 600, marginLeft: '3px' }}>
                ({compareData.cardDiff > 0 ? '+' : ''}{formatKRW(compareData.cardDiff)})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="installment-grid" style={{ padding: 0 }}>
        {stats.map(s => (
          <InstallmentStatCard key={s.label} {...s} dark={dark} />
        ))}
      </div>

      {/* 종료 예정 카드할부 스케줄 (세련된 타임라인/카드 스케줄 UI) */}
      {expiringSchedules.totalCount > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '0.9rem 1rem',
          background: dark 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.7) 0%, rgba(30, 41, 59, 0.5) 100%)' 
            : 'linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
          borderRadius: '14px',
          border: dark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(226, 232, 240, 0.8)',
          boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.04)',
          backdropFilter: 'blur(8px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '7px',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem'
              }}>
                🎯
              </div>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                할부
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 900,
                padding: '2px 9px',
                borderRadius: '99px',
                background: dark ? 'rgba(99, 102, 241, 0.25)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: '#ffffff',
                border: dark ? '1px solid rgba(129, 140, 248, 0.4)' : 'none',
                boxShadow: '0 2px 6px rgba(99, 102, 241, 0.25)'
              }}>
                {expiringSchedules.totalCount}건
              </span>
              {(() => {
                const scheduleTotalSum = expiringSchedules.sortedKeys.reduce((acc, key) => {
                  const items = expiringSchedules.groupsMap[key];
                  return acc + items.reduce((sum, item) => sum + (Number(item.remAmount) || 0), 0);
                }, 0);
                return scheduleTotalSum > 0 ? (
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    marginLeft: '4px'
                  }}>
                    (잔액 합계 {formatKRW(scheduleTotalSum)}원)
                  </span>
                ) : null;
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {expiringSchedules.sortedKeys.map(dateKey => {
              const items = expiringSchedules.groupsMap[dateKey];
              return (
                <div 
                  key={dateKey}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '10px',
                    background: dark ? 'rgba(30, 41, 59, 0.65)' : 'rgba(255, 255, 255, 0.9)',
                    border: dark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(226, 232, 240, 0.8)',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                    flexWrap: 'wrap'
                  }}
                >
                  {/* 종료 예정 연월 뱃지 (26.09 세련된 전용 뱃지) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: dark ? 'rgba(99, 102, 241, 0.22)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.14) 0%, rgba(168, 85, 247, 0.14) 100%)',
                    border: dark ? '1px solid rgba(99, 102, 241, 0.45)' : '1px solid rgba(99, 102, 241, 0.28)',
                    boxShadow: dark ? '0 2px 10px rgba(129, 140, 248, 0.2)' : '0 2px 8px rgba(99, 102, 241, 0.1)',
                    flexShrink: 0
                  }}>
                    <span style={{ 
                      fontSize: '0.82rem', 
                      fontWeight: 900, 
                      color: dark ? '#818cf8' : '#6366f1', 
                      fontFamily: "'Plus Jakarta Sans', monospace",
                      letterSpacing: '-0.02em'
                    }}>
                      {dateKey}
                    </span>
                  </div>

                  {/* 할부 내역 아이템 태그 리스트 */}
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', minWidth: 0 }}>
                    {items.map(it => (
                      <div 
                        key={it.id} 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '7px',
                          background: dark ? 'rgba(15, 23, 42, 0.5)' : 'rgba(241, 245, 249, 0.85)',
                          border: dark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(226, 232, 240, 0.7)',
                          fontSize: '0.74rem',
                          whiteSpace: 'nowrap',
                          maxWidth: '100%'
                        }}
                      >
                        {(() => {
                          const cName = (it.card || '').trim();
                          let bg = 'rgba(99, 102, 241, 0.12)';
                          let color = '#6366f1';
                          let border = '1px solid rgba(99, 102, 241, 0.25)';

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

                          return (
                            <span style={{
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              background: bg,
                              color: color,
                              border: border,
                              flexShrink: 0
                            }}>
                              {it.card || '카드'}
                            </span>
                          );
                        })()}
                        <span style={{ 
                          fontWeight: 700, 
                          color: 'var(--text-primary)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {it.content || '할부항목'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 그룹별 잔여금 금액 표시 */}
                  {(() => {
                    const groupSum = items.reduce((a, c) => a + (Number(c.remAmount) || 0), 0);
                    return groupSum > 0 ? (
                      <div style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: "'Plus Jakarta Sans', monospace" }}>
                          {formatKRW(groupSum)}원
                        </span>
                      </div>
                    ) : null;
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
