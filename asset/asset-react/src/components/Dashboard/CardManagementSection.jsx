import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import CustomDropdown from '../UI/CustomDropdown';

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

// 카드 기본값 (초기 사용자용 - KB, 신한, 롯데, NH농협카드)
const DEFAULT_USER_CARDS = [
  { id: 'default-kb', brandKey: 'KB', name: 'KB국민카드', lastDigits: '4281' },
  { id: 'default-shinhan', brandKey: 'SHINHAN', name: '신한카드', lastDigits: '1052' },
  { id: 'default-lotte', brandKey: 'LOTTE', name: '롯데카드', lastDigits: '8821' },
  { id: 'default-nh', brandKey: 'NH', name: 'NH농협카드', lastDigits: '3365' }
];

export default function CardManagementSection() {
  const { getCurrentSections, persistSections, year, month, yearData } = useApp();
  const sections = getCurrentSections();

  // 기존 사용자 데이터에 현대카드(HYUNDAI)가 들어있거나 비어있으면 4대 카드(KB, 신한, 롯데, NH)로 자동 전환
  const userCards = useMemo(() => {
    const hasHyundai = sections.userCards && sections.userCards.some(c => c.brandKey === 'HYUNDAI');
    if (!sections.userCards || sections.userCards.length === 0 || hasHyundai) {
      return DEFAULT_USER_CARDS;
    }
    return sections.userCards;
  }, [sections.userCards]);

  // 컴포넌트 마운트 시 실제 로컬스토리지에 현대카드 레거시 데이터 영구 제거
  useEffect(() => {
    const hasHyundai = sections.userCards && sections.userCards.some(c => c.brandKey === 'HYUNDAI');
    if (!sections.userCards || sections.userCards.length === 0 || hasHyundai) {
      persistSections({
        ...sections,
        userCards: DEFAULT_USER_CARDS
      });
    }
  }, [sections, persistSections]);

  const installments = sections.installment || [];
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

  // 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('KB');
  const [cardNameInput, setCardNameInput] = useState('');
  const [lastDigitsInput, setLastDigitsInput] = useState('');

  const handleOpenAddModal = () => {
    setSelectedBrand('KB');
    setCardNameInput('');
    setLastDigitsInput('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewCard = () => {
    if (!cardNameInput.trim()) {
      alert('카드 이름을 입력해 주세요.');
      return;
    }
    const newCard = {
      id: `card-${Date.now()}`,
      brandKey: selectedBrand,
      name: cardNameInput.trim(),
      lastDigits: lastDigitsInput.trim() || '1234'
    };
    const updated = [...userCards, newCard];
    persistSections({ ...sections, userCards: updated });
    setIsAddModalOpen(false);
  };

  const handleDeleteCard = (id) => {
    if (!confirm('해당 카드를 등록 목록에서 삭제하시겠습니까?')) return;
    const updated = userCards.filter(c => c.id !== id);
    persistSections({ ...sections, userCards: updated });
  };

  return (
    <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
      {/* 헤더 */}
      <div className="section-card-header" style={{ marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
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
        <button className="btn btn-dark" onClick={handleOpenAddModal}>
          + 신규 카드 등록
        </button>
      </div>

      {/* 3D 실물 카드 슬라이더 / 그리드 영역 */}
      <div 
        className="mobile-card-deck"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem'
        }}
      >
        {userCards.map(card => {
          const brand = CARD_BRANDS[card.brandKey] || CARD_BRANDS.KB;
          const shortName = brand.short;
          
          // 해당 카드사의 이달 결제금액 & 지난달 결제금액 (카드명/짧은이름 자동 매칭)
          const thisAmt = thisMonthUsageMap[shortName] || thisMonthUsageMap[card.name] || 0;
          const prevAmt = prevMonthUsageMap[shortName] || prevMonthUsageMap[card.name] || 0;
          const diff = thisAmt - prevAmt;

          return (
            <div
              key={card.id}
              style={{
                position: 'relative',
                height: '165px',
                borderRadius: '16px',
                background: brand.bg,
                color: brand.textColor,
                padding: '1.1rem 1.25rem',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}
            >
              {/* 메탈릭 광택 효과 패널 */}
              <div style={{
                position: 'absolute',
                top: '-40%',
                right: '-20%',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
                pointerEvents: 'none'
              }} />

              {/* 카드 상단 로고 & 삭제 버튼 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.9 }}>
                  {brand.logoText}
                </span>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    background: 'rgba(0, 0, 0, 0.2)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: brand.textColor,
                    cursor: 'pointer',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.75,
                    transition: 'opacity 0.2s'
                  }}
                  title="카드 삭제"
                >
                  ✕
                </button>
              </div>

              {/* IC 칩 그래픽 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
                <div style={{
                  width: '38px',
                  height: '27px',
                  borderRadius: '5px',
                  background: 'linear-gradient(135deg, #ffe58f 0%, #d4b106 50%, #faf0ca 100%)',
                  border: '1px solid rgba(0,0,0,0.2)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                  position: 'relative'
                }}>
                  {/* IC 칩 내부 그리드 선 */}
                  <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                  <div style={{ position: 'absolute', left: '40%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,0,0,0.15)' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.15em', opacity: 0.85, fontFamily: 'monospace' }}>
                  •••• {card.lastDigits}
                </span>
              </div>

              {/* 카드 하단 명칭 및 이달 결제금액 */}
              <div style={{ zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>
                    {card.name}
                  </div>
                  <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                    {month}월 청구 결제금액
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {formatKRW(thisAmt)}원
                  </div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                    {diff > 0 ? (
                      <span style={{ color: brand.textColor === '#1e293b' ? '#dc2626' : '#f87171' }}>▲ {formatKRW(diff)}원 (전월대비)</span>
                    ) : diff < 0 ? (
                      <span style={{ color: brand.textColor === '#1e293b' ? '#16a34a' : '#4ade80' }}>▼ {formatKRW(Math.abs(diff))}원 (절감)</span>
                    ) : (
                      <span style={{ opacity: 0.7 }}>전월과 동일</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 카드별 지난달 대비 지출 비교 차트 영역 */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            📊 카드별 결제금액 비교 차트 ({prevMonthVal}월 vs {month}월)
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#3b82f6' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} /> {month}월 (이번달)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--border)' }} /> {prevMonthVal}월 (지난달)
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {userCards.map(card => {
            const brand = CARD_BRANDS[card.brandKey] || CARD_BRANDS.KB;
            const shortName = brand.short;

            const thisAmt = thisMonthUsageMap[shortName] || thisMonthUsageMap[card.name] || 0;
            const prevAmt = prevMonthUsageMap[shortName] || prevMonthUsageMap[card.name] || 0;
            const maxVal = Math.max(thisAmt, prevAmt, 100000);

            const thisWidthPct = Math.min((thisAmt / maxVal) * 100, 100);
            const prevWidthPct = Math.min((prevAmt / maxVal) * 100, 100);
            const diff = thisAmt - prevAmt;

            return (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 10, height: 10, borderRadius: '3px', background: brand.bg }} />
                    {card.name} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>({shortName})</span>
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: diff > 0 ? 'var(--coral)' : (diff < 0 ? 'var(--teal)' : 'var(--text-muted)') }}>
                    {diff > 0 ? `+${formatKRW(diff)}원 (증가)` : (diff < 0 ? `-${formatKRW(Math.abs(diff))}원 (절감)` : '변동없음')}
                  </span>
                </div>

                {/* 차트 트랙 2개 (이번달 & 지난달) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* 이번달 막대 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.65rem', width: '32px', color: '#3b82f6', fontWeight: 700 }}>{month}월</span>
                    <div style={{ flex: 1, height: '10px', background: 'var(--bg)', borderRadius: '5px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${thisWidthPct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)',
                          borderRadius: '5px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, minWidth: '70px', textAlign: 'right', color: 'var(--text-primary)' }}>
                      {formatKRW(thisAmt)}원
                    </span>
                  </div>

                  {/* 지난달 막대 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.65rem', width: '32px', color: 'var(--text-muted)', fontWeight: 600 }}>{prevMonthVal}월</span>
                    <div style={{ flex: 1, height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${prevWidthPct}%`,
                          height: '100%',
                          background: 'var(--border)',
                          borderRadius: '4px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '0.68rem', fontWeight: 600, minWidth: '70px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {formatKRW(prevAmt)}원
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 신규 카드 등록 모달 */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-box" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">💳 신규 카드 등록</div>
              <button className="btn-close" onClick={() => setIsAddModalOpen(false)}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block', color: 'var(--text-muted)' }}>
                  카드사 선택
                </label>
                <CustomDropdown
                  value={selectedBrand}
                  onChange={setSelectedBrand}
                  options={Object.entries(CARD_BRANDS).map(([k, b]) => ({
                    value: k,
                    label: b.name
                  }))}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block', color: 'var(--text-muted)' }}>
                  카드 명칭 / 별칭
                </label>
                <input
                  type="text"
                  placeholder="예: 국민 톡톡카드, 현대 M3"
                  value={cardNameInput}
                  onChange={(e) => setCardNameInput(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', display: 'block', color: 'var(--text-muted)' }}>
                  카드 번호 뒷 4자리 (선택)
                </label>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="예: 4281"
                  value={lastDigitsInput}
                  onChange={(e) => setLastDigitsInput(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsAddModalOpen(false)}>취소</button>
              <button className="btn btn-dark btn-sm" onClick={handleSaveNewCard}>카드 저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
