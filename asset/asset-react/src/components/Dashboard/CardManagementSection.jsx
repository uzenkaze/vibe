import { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';

// 카드사별 브랜드 스타일 & 템플릿
export const CARD_BRANDS = {
  KB: {
    name: 'KB국민카드',
    short: '국민',
    bg: 'linear-gradient(135deg, #5b5446 0%, #2f2a21 100%)',
    accentColor: '#ffbc00',
    textColor: '#ffffff',
    logoText: 'KB Kookmin Card'
  },
  SHINHAN: {
    name: '신한카드',
    short: '신한',
    bg: 'linear-gradient(135deg, #0046ff 0%, #002380 100%)',
    accentColor: '#60a5fa',
    textColor: '#ffffff',
    logoText: 'Shinhan Card'
  },
  HYUNDAI: {
    name: '현대카드',
    short: '현대',
    bg: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
    accentColor: '#e4e4e7',
    textColor: '#ffffff',
    logoText: 'HYUNDAI CARD'
  },
  SAMSUNG: {
    name: '삼성카드',
    short: '삼성',
    bg: 'linear-gradient(135deg, #0b2545 0%, #134074 100%)',
    accentColor: '#38bdf8',
    textColor: '#ffffff',
    logoText: 'SAMSUNG CARD'
  },
  LOTTE: {
    name: '롯데카드',
    short: '롯데',
    bg: 'linear-gradient(135deg, #991b1b 0%, #450a0a 100%)',
    accentColor: '#fca5a5',
    textColor: '#ffffff',
    logoText: 'LOTTE CARD'
  },
  WOORI: {
    name: '우리카드',
    short: '우리',
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    accentColor: '#7dd3fc',
    textColor: '#ffffff',
    logoText: 'WOORI CARD'
  },
  NH: {
    name: 'NH농협카드',
    short: '농협',
    bg: 'linear-gradient(135deg, #15803d 0%, #14532d 100%)',
    accentColor: '#86efac',
    textColor: '#ffffff',
    logoText: 'NH NongHyup'
  },
  HANA: {
    name: '하나카드',
    short: '하나',
    bg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
    accentColor: '#5eead4',
    textColor: '#ffffff',
    logoText: 'Hana Card'
  },
  KAKAO: {
    name: '카카오뱅크',
    short: '카카오',
    bg: 'linear-gradient(135deg, #facc15 0%, #ca8a04 100%)',
    accentColor: '#1e293b',
    textColor: '#1e293b',
    logoText: 'kakaobank'
  },
  TOSS: {
    name: '토스뱅크',
    short: '토스',
    bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    accentColor: '#93c5fd',
    textColor: '#ffffff',
    logoText: 'toss bank'
  }
};

export default function CardManagementSection() {
  const { getCurrentSections, year, month, yearData } = useApp();
  const sections = getCurrentSections();

  const cardMonthlySummaries = sections.cardMonthlySummaries || [];

  // 지난달 연월 산출
  let prevYearVal = parseInt(year);
  let prevMonthVal = parseInt(month) - 1;
  if (prevMonthVal === 0) {
    prevMonthVal = 12;
    prevYearVal -= 1;
  }
  const prevYearStr = String(prevYearVal);
  const prevMonthPadded = String(prevMonthVal).padStart(2, '0');
  const prevMonthUnpadded = String(prevMonthVal);

  const prevYd = yearData[prevYearStr] || {};
  const prevMonths = prevYd.months || {};
  const prevMonthData = prevMonths[prevMonthUnpadded] || prevMonths[prevMonthPadded] || {};
  const prevSections = prevMonthData.sections || {};
  const prevCardMonthlySummaries = prevSections.cardMonthlySummaries || [];

  // 1. 이번달 및 지난달 결제내역에서 등록된 고유 카드사 모두 추출 (이달 내역이 없어도 지난달 정보 기반으로 노출되도록 보장)
  const userCards = useMemo(() => {
    const seen = new Set();
    const list = [];
    
    // 이번 달과 지난 달 카드 리스트 병합 취합
    const combinedSummaries = [...cardMonthlySummaries, ...prevCardMonthlySummaries];
    
    combinedSummaries.forEach(item => {
      const cardName = item.cardName || '';
      if (!cardName.trim()) return;
      
      let brandKey = '';
      if (cardName.includes('신한')) brandKey = 'SHINHAN';
      else if (cardName.includes('롯데')) brandKey = 'LOTTE';
      else if (cardName.includes('농협') || cardName.includes('NH')) brandKey = 'NH';
      else if (cardName.includes('국민') || cardName.includes('KB')) brandKey = 'KB';
      else if (cardName.includes('현대')) brandKey = 'HYUNDAI';
      else if (cardName.includes('삼성')) brandKey = 'SAMSUNG';
      else if (cardName.includes('우리')) brandKey = 'WOORI';
      else if (cardName.includes('하나')) brandKey = 'HANA';
      else if (cardName.includes('카카오')) brandKey = 'KAKAO';
      else if (cardName.includes('토스')) brandKey = 'TOSS';
      else return;
      
      const brandShort = CARD_BRANDS[brandKey]?.short || '';
      if (brandShort && !seen.has(brandShort)) {
        seen.add(brandShort);
        const noteDigits = item.note ? item.note.replace(/[^0-9]/g, '') : '';
        const digits = noteDigits.length >= 4 ? noteDigits.slice(-4) : '3302';
        
        list.push({
          id: `dyn-${brandKey}`,
          brandKey,
          name: cardName,
          lastDigits: digits
        });
      }
    });
    return list;
  }, [cardMonthlySummaries, prevCardMonthlySummaries]);

  // 이번 달 카드별 결제금액 집계 (결제내역 기준)
  const thisMonthUsageMap = useMemo(() => {
    const map = {};
    cardMonthlySummaries.forEach(item => {
      const cardName = item.cardName || '';
      const amt = Number(item.currentMonthTotal) || 0;
      
      let foundKey = 'KB';
      if (cardName.includes('신한')) foundKey = 'SHINHAN';
      else if (cardName.includes('롯데')) foundKey = 'LOTTE';
      else if (cardName.includes('농협') || cardName.includes('NH')) foundKey = 'NH';
      else if (cardName.includes('국민') || cardName.includes('KB')) foundKey = 'KB';
      else if (cardName.includes('현대')) foundKey = 'HYUNDAI';
      else if (cardName.includes('삼성')) foundKey = 'SAMSUNG';
      else if (cardName.includes('우리')) foundKey = 'WOORI';
      else if (cardName.includes('하나')) foundKey = 'HANA';
      else if (cardName.includes('카카오')) foundKey = 'KAKAO';
      else if (cardName.includes('토스')) foundKey = 'TOSS';
      
      const shortName = CARD_BRANDS[foundKey]?.short || '국민';
      map[shortName] = (map[shortName] || 0) + amt;
      map[cardName] = (map[cardName] || 0) + amt;
    });
    return map;
  }, [cardMonthlySummaries]);

  // 지난달 카드별 결제금액 집계 (결제내역 기준)
  const prevMonthUsageMap = useMemo(() => {
    const map = {};
    prevCardMonthlySummaries.forEach(item => {
      const cardName = item.cardName || '';
      const amt = Number(item.currentMonthTotal) || 0;
      
      let foundKey = 'KB';
      if (cardName.includes('신한')) foundKey = 'SHINHAN';
      else if (cardName.includes('롯데')) foundKey = 'LOTTE';
      else if (cardName.includes('농협') || cardName.includes('NH')) foundKey = 'NH';
      else if (cardName.includes('국민') || cardName.includes('KB')) foundKey = 'KB';
      else if (cardName.includes('현대')) foundKey = 'HYUNDAI';
      else if (cardName.includes('삼성')) foundKey = 'SAMSUNG';
      else if (cardName.includes('우리')) foundKey = 'WOORI';
      else if (cardName.includes('하나')) foundKey = 'HANA';
      else if (cardName.includes('카카오')) foundKey = 'KAKAO';
      else if (cardName.includes('토스')) foundKey = 'TOSS';
      
      const shortName = CARD_BRANDS[foundKey]?.short || '국민';
      map[shortName] = (map[shortName] || 0) + amt;
      map[cardName] = (map[cardName] || 0) + amt;
    });
    return map;
  }, [prevCardMonthlySummaries]);

  // 2. 이번달 및 지난달 결제금액 내역 둘 다 아예 카드가 등록 안 되어 있으면 보유 현황 감춤
  if (userCards.length === 0) {
    return null;
  }

  return (
    <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem', maxWidth: '100%', overflow: 'hidden' }}>
      {/* 헤더 */}
      <div className="section-card-header" style={{ marginBottom: '1rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border)' }}>
        <div className="section-card-title">
          <span className="section-dot" style={{ background: '#3b82f6' }} />
          내 카드 보유 현황 & 지난달 대비 사용 비교
          <span style={{
            fontSize: '0.65rem', color: 'var(--text-muted)',
            fontWeight: 600, letterSpacing: '0.05em',
            textTransform: 'uppercase', marginLeft: 4,
          }}>
            Registered Cards & Expense Comparison
          </span>
        </div>
      </div>

      {/* 3D 실물 카드 슬라이더 / 그리드 영역 */}
      <div 
        className="mobile-card-deck"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem'
        }}
      >
        {userCards.map(card => {
          const brand = CARD_BRANDS[card.brandKey] || CARD_BRANDS.KB;
          const shortName = brand.short;
          
          const thisAmt = thisMonthUsageMap[shortName] || thisMonthUsageMap[card.name] || 0;
          const prevAmt = prevMonthUsageMap[shortName] || prevMonthUsageMap[card.name] || 0;
          const diff = thisAmt - prevAmt;

          return (
            <div
              key={card.id}
              style={{
                position: 'relative',
                height: '132px',
                borderRadius: '12px',
                background: brand.bg,
                color: brand.textColor,
                padding: '0.75rem 0.9rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 8px 20px -4px rgba(0, 0, 0, 0.2)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              {/* 메탈릭 광택 효과 패널 */}
              <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-20%',
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none'
              }} />

              {/* 카드 상단 로고 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: 0.9 }}>
                  {brand.logoText}
                </span>
              </div>

              {/* IC 칩 그래픽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', zIndex: 2 }}>
                <div style={{
                  width: '32px',
                  height: '22px',
                  borderRadius: '4px',
                  background: 'linear-gradient(135deg, #ffe58f 0%, #d4b106 50%, #faf0ca 100%)',
                  border: '1px solid rgba(0,0,0,0.15)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.5)',
                  position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.12)' }} />
                  <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.12)' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.12em', opacity: 0.85, fontFamily: 'monospace' }}>
                  •••• {card.lastDigits}
                </span>
              </div>

              {/* 카드 하단 명칭 및 이달 결제금액 */}
              <div style={{ zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                    {card.name}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.8, marginTop: '1px' }}>
                    {month}월 결제금액
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formatKRW(thisAmt)}원
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                    {diff > 0 ? (
                      <span style={{ color: brand.textColor === '#1e293b' ? '#dc2626' : '#f87171' }}>▲ {formatKRW(diff)}</span>
                    ) : diff < 0 ? (
                      <span style={{ color: brand.textColor === '#1e293b' ? '#16a34a' : '#4ade80' }}>▼ {formatKRW(Math.abs(diff))}</span>
                    ) : (
                      <span style={{ opacity: 0.7 }}>변동없음</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 카드별 지난달 대비 지출 비교 차트 영역 (Striped Yellow Tick Gauge 로 전면 리디자인) */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            📊 카드별 결제금액 비교 차트 ({prevMonthVal}월 vs {month}월)
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.68rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#10b981' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> {month}월 (이번달)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} /> {prevMonthVal}월 (전월)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {userCards.map(card => {
            const brand = CARD_BRANDS[card.brandKey] || CARD_BRANDS.KB;
            const shortName = brand.short;

            const thisAmt = thisMonthUsageMap[shortName] || thisMonthUsageMap[card.name] || 0;
            const prevAmt = prevMonthUsageMap[shortName] || prevMonthUsageMap[card.name] || 0;
            const maxVal = Math.max(thisAmt, prevAmt, 100000);

            // 게이지 백분율 계산
            const thisWidthPct = Math.min((thisAmt / maxVal) * 100, 100);
            const prevWidthPct = Math.min((prevAmt / maxVal) * 100, 100);
            const diff = thisAmt - prevAmt;

            return (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '2px', background: brand.bg }} />
                    {card.name} <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500 }}>({shortName})</span>
                  </span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: diff > 0 ? 'var(--coral)' : (diff < 0 ? 'var(--teal)' : 'var(--text-muted)') }}>
                    {diff > 0 ? `+${formatKRW(diff)}원 (증가)` : (diff < 0 ? `-${formatKRW(Math.abs(diff))}원 (절감)` : '변동없음')}
                  </span>
                </div>

                {/* 빗금 눈금(Yellow Tick) 게이지 모양 트랙 2개 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* 이번달 지출 게이지 (초록빛/오렌지 빛 빗금형식) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.62rem', width: '28px', color: 'var(--text-secondary)', fontWeight: 700 }}>{month}월</span>
                    <div className="yellow-tick-gauge-track" style={{ flex: 1, height: '9px' }}>
                      <div
                        className="yellow-tick-gauge-fill-income"
                        style={{
                          width: `${thisWidthPct}%`,
                          height: '100%'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, minWidth: '60px', textAlign: 'right', color: 'var(--text-primary)' }}>
                      {formatKRW(thisAmt)}원
                    </span>
                  </div>

                  {/* 지난달 지출 게이지 (붉은빛 빗금형식) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.62rem', width: '28px', color: 'var(--text-muted)', fontWeight: 600 }}>{prevMonthVal}월</span>
                    <div className="yellow-tick-gauge-track" style={{ flex: 1, height: '9px' }}>
                      <div
                        className="yellow-tick-gauge-fill-expense"
                        style={{
                          width: `${prevWidthPct}%`,
                          height: '100%'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 600, minWidth: '60px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatKRW(prevAmt)}원
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
