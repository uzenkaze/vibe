import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatKRW } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

export default function PensionPage() {
  const { getCurrentPension, persistPension, year, month } = useApp();
  const [formData, setFormData] = useState(() => getCurrentPension());

  useEffect(() => {
    setFormData(getCurrentPension());
  }, [getCurrentPension, year, month]);

  const { totalMonths, paidMonths, currentAmount, ratio } = useMemo(() => {
    const curY = Number(year);
    const curM = Number(month);
    let totalMonths = 0, paidMonths = 0, ratio = 1;

    const periodMatch = (formData.totalPeriod || '').match(/(\d{4})[.](\d{2})\s*~\s*(\d{4})[.](\d{2})/);
    if (periodMatch) {
      const startY = parseInt(periodMatch[1]), startM = parseInt(periodMatch[2]);
      const endY = parseInt(periodMatch[3]),   endM   = parseInt(periodMatch[4]);
      totalMonths = (endY - startY) * 12 + (endM - startM);
      paidMonths  = (curY - startY) * 12 + (curM - startM) + 1;
      if (paidMonths < 0) paidMonths = 0;
      if (paidMonths > totalMonths) paidMonths = totalMonths;
      ratio = totalMonths > 0 ? paidMonths / totalMonths : 0;
    }

    const targetAmount = Number(String(formData.afterTax).replace(/[^0-9]/g, '')) || 0;
    const currentAmount = Math.floor(targetAmount * ratio);
    return { totalMonths, paidMonths, currentAmount, ratio };
  }, [formData, year, month]);

  const handleChange = async (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    await persistPension(updated);
  };

  const pct = (ratio * 100).toFixed(1);
  const afterTaxNum  = Number(String(formData.afterTax ).replace(/[^0-9]/g, '')) || 0;
  const beforeTaxNum = Number(String(formData.beforeTax).replace(/[^0-9]/g, '')) || 0;
  const totalPaidNum = Number(String(formData.totalPaid).replace(/[^0-9]/g, '')) || 0;

  return (
    <div style={{ marginBottom: '1.5rem' }}>

      {/* ── Hero Highlight Card ── */}
      <div style={{
        background: 'linear-gradient(135deg, #1A1F3C 0%, #2D3561 50%, #1a3a5c 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.5rem 2rem',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
      }}>


        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: 42, height: 42, borderRadius: '12px',
            background: 'linear-gradient(135deg, #F5A623, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(245,166,35,0.4)',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M21.18 8A10 10 0 0 0 12 2v10z"/>
            </svg>
          </div>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.95)', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>연금 정보</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Pension Management</div>
          </div>
        </div>

        {/* 메인 금액 */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            {formData.startDate ? `${formData.startDate}(65세)부터` : '연금 개시 시기(65세)부터'}&nbsp;받게 될 예상 연금액
          </div>
          <div style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>매월</div>
          <div style={{
            color: '#2DC9A0',
            fontSize: 'clamp(2.2rem, 6vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            lineHeight: 1.1,
            textShadow: '0 0 30px rgba(45,201,160,0.4)',
          }}>
            {formatKRW(currentAmount)}<span style={{ fontSize: '1.2rem', fontWeight: 700, marginLeft: 4 }}>원</span>
          </div>
        </div>

        {/* 진행률 바 */}
        {totalMonths > 0 && (
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', height: 10, marginBottom: '0.75rem' }}>
            <div style={{
              width: `${Math.min(ratio * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #2DC9A0, #3DDBB1)',
              borderRadius: 99,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: '0 0 10px rgba(45,201,160,0.5)',
            }} />
          </div>
        )}
        {totalMonths > 0 ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600 }}>
            <span>총 {totalMonths}개월 중 {paidMonths}개월 납부</span>
            <span style={{ color: '#2DC9A0', fontWeight: 700 }}>{pct}%</span>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.07)', borderRadius: 10,
            padding: '0.75rem 1rem', fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.5)', lineHeight: 1.6,
          }}>
            ※ 납입 기간 입력 시 실시간 진행률 및 예상 수령액이 계산됩니다.
          </div>
        )}
      </div>

      {/* ── 인포 카드 그리드 ── */}
      <div className="pension-info-grid">
        {[
          { label: '세전 예상액', value: beforeTaxNum, color: '#5B6BF8', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          )},
          { label: '세후 예상액', value: afterTaxNum, color: '#2DC9A0', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          )},
          { label: '기납부 총액', value: totalPaidNum, color: '#F5A623', icon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
            </svg>
          )},
        ].map(item => (
          <div key={item.label} className="pension-info-card">
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: 3, background: item.color, borderRadius: '0 0 3px 3px',
            }} />
            <div className="pension-info-card-header" style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              marginBottom: '0.5rem',
            }}>
              <div className="pension-info-icon-wrapper" style={{
                width: 26, height: 26, borderRadius: '7px',
                background: item.color + '18',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: item.color,
              }}>{item.icon}</div>
              <div className="pension-info-label" style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
                {item.label}
              </div>
            </div>
            <div className="pension-info-value num" style={{ color: item.color }}>
              {formatKRW(item.value)}<span style={{ color: 'var(--text-muted)', marginLeft: 2 }}>원</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── 입력 폼 ── */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {/* 폼 헤더 */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid var(--card-border)',
          display: 'flex', alignItems: 'center', gap: '0.625rem',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '9px',
            background: 'linear-gradient(135deg, #F5A623, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>연금 정보 입력</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>정보를 입력하면 예상 수령액이 자동 계산됩니다</div>
          </div>
        </div>

        <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* 납입 기간 */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--teal)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              납입 기간
            </label>
            <input
              style={{
                width: '100%', background: 'var(--card)', border: '1.5px solid rgba(45, 201, 160, 0.2)',
                color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                fontWeight: 600, outline: 'none', transition: 'all 0.2s ease',
                boxSizing: 'border-box', textAlign: 'center',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,201,160,0.15)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(45, 201, 160, 0.2)'; e.target.style.boxShadow = 'none'; }}
              placeholder="예: 2024.01 ~ 2034.12"
              value={formData.totalPeriod}
              onChange={e => handleChange('totalPeriod', e.target.value)}
            />
          </div>

          {/* 세전/세후 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { key: 'beforeTax', label: '세전 예상 연금액', color: '#5B6BF8', required: false, placeholder: '예: 1000000' },
              { key: 'afterTax',  label: '세후 예상 연금액', color: '#2DC9A0', required: false, placeholder: '예: 850000'  },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: f.color, display: 'inline-block', flexShrink: 0 }} />
                  {f.label}
                  {f.required && <span style={{ color: 'var(--coral)', fontSize: '0.72rem', marginLeft: 2 }}>*필수</span>}
                </label>
                <NumberInput
                  style={{
                    width: '100%', background: 'var(--card)', border: `1.5px solid ${f.color}30`,
                    color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                    padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                    fontWeight: 600, outline: 'none', textAlign: 'right',
                  }}
                  placeholder={f.placeholder}
                  value={formData[f.key]}
                  onChange={val => handleChange(f.key, val)}
                />
              </div>
            ))}
          </div>

          {/* 기납부/개시 시기 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
                기납부 총액 (원)
              </label>
              <NumberInput
                style={{
                  width: '100%', background: 'var(--card)', border: '1.5px solid rgba(245,166,35,0.2)',
                  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                  padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                  fontWeight: 600, outline: 'none', textAlign: 'right',
                }}
                placeholder="예: 5000000"
                value={formData.totalPaid}
                onChange={val => handleChange('totalPaid', val)}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                연금 개시 시기
              </label>
              <input
                style={{
                  width: '100%', background: 'var(--card)', border: '1.5px solid var(--card-border)',
                  color: 'var(--text-primary)', borderRadius: 'var(--radius-sm)',
                  padding: '0.825rem 1rem', fontSize: '0.95rem', fontFamily: 'inherit',
                  fontWeight: 600, outline: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--teal)'; e.target.style.boxShadow = '0 0 0 3px rgba(45,201,160,0.15)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--card-border)'; e.target.style.boxShadow = 'none'; }}
                placeholder="예: 2039년 03월"
                value={formData.startDate}
                onChange={e => handleChange('startDate', e.target.value)}
              />
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}
