import { useState, useCallback, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { genId } from '../../utils/format';
import NumberInput from '../UI/NumberInput';

// ────────────────────────────────────────────────────────
// 상수 / 유틸
// ────────────────────────────────────────────────────────
const PAYMENT_CYCLES = ['월납', '분기납', '반기납', '연납', '일시납'];
const PAYMENT_METHODS = ['카드', '현금이체'];
const RENEWAL_TYPES = ['비갱신형', '갱신형'];
const COVERAGE_CATEGORIES = ['진단', '수술', '입원', '통원', '사망', '후유장애', '손해', '미분류'];
const INSURANCE_TYPES = [
  '종신보험', '정기보험', '건강보험', '암보험', '실손보험',
  '연금보험', '어린이보험', '치아보험', '저축보험', '손해보험', '기타',
];
const COVERAGE_COLORS = [
  '#14b8a6','#6366f1','#f59e0b','#ef4444','#10b981',
  '#8b5cf6','#f97316','#06b6d4','#ec4899','#84cc16',
];

// 주요 보험사 및 대표 상품별 표준 보장항목 데이터베이스 템플릿
const INSURANCE_PRESETS = [
  {
    id: 'aia-prime-2',
    insurer: 'AIA생명',
    insuranceName: '(무)프라임평생설계보험 2형',
    insuranceType: '종신보험',
    keywords: ['aia', '프라임', '평생설계'],
    coverages: [
      { name: '사망보험금 (주계약)', amount: 50000000, note: '평생 종신 보장 / 80% 이상 장해 포함' },
      { name: '일반암 진단비 (특약)', amount: 30000000, note: '암보장개시일 이후 진단시' },
      { name: '고액암 진단비 (특약)', amount: 50000000, note: '뼈/뇌/혈액암 등 고액치료암' },
      { name: '유방암/남녀생식기암 진단비', amount: 10000000, note: '유방/자궁/전립선 등' },
      { name: '소액암 진단비 (경계성/갑상선)', amount: 5000000, note: '갑상선암, 기타피부암, 제자리암' },
      { name: '뇌출혈 진단비 (특약)', amount: 20000000, note: '뇌출혈 최초 1회 진단시' },
      { name: '급성심근경색증 진단비 (특약)', amount: 20000000, note: '급성심근경색증 최초 1회 진단시' },
      { name: '질병/재해 1~5종 수술비 (특약)', amount: 5000000, note: '종별 20만원 ~ 최대 500만원 급여' },
      { name: '질병/재해 입원비 (특약)', amount: 30000, note: '입원 3일 초과 1일당 (120일 한도)' },
      { name: '재해사망/재해장해 급여금', amount: 30000000, note: '재해 사고 발생시 지급' },
      { name: '골절/화상 치료비', amount: 500000, note: '진단 1회당 급여금' },
    ]
  },
  {
    id: 'samsung-health',
    insurer: '삼성화재',
    insuranceName: '마이헬스파트너 종합보험',
    insuranceType: '건강보험',
    keywords: ['삼성', '마이헬스', '건강'],
    coverages: [
      { name: '일반암 진단비', amount: 50000000, note: '최초 1회한 보장' },
      { name: '뇌혈관질환 진단비', amount: 20000000, note: '뇌경색/뇌출혈 포함' },
      { name: '허혈성심장질환 진단비', amount: 20000000, note: '협심증/심근경색 포함' },
      { name: '질병 수술비', amount: 1000000, note: '수술 1회당' },
      { name: '상해 수술비', amount: 1000000, note: '수술 1회당' },
      { name: '독감(인플루엔자) 치료비', amount: 200000, note: '연 1회한' },
    ]
  },
  {
    id: 'kb-cancer',
    insurer: 'KB손해보험',
    insuranceName: 'KB 암보험 건강하게',
    insuranceType: '암보험',
    keywords: ['kb', '암보험', '손해'],
    coverages: [
      { name: '일반암 진단비', amount: 30000000, note: '면책기간 90일 경과후' },
      { name: '표적항암약물허가치료비', amount: 50000000, note: '최초 1회한' },
      { name: '암수술비 (1회당)', amount: 3000000, note: '암 직접치료 수술시' },
      { name: '암입원일당', amount: 50000, note: '입원 1일당' },
      { name: '항암방사선/약물치료비', amount: 10000000, note: '최초 1회한' },
    ]
  },
  {
    id: 'hyundai-child',
    insurer: '현대해상',
    insuranceName: '굿앤굿어린이종합보험',
    insuranceType: '어린이보험',
    keywords: ['현대', '굿앤굿', '어린이'],
    coverages: [
      { name: '상해/질병 입원일당', amount: 50000, note: '1일당 보장' },
      { name: '골절 진단비 (치아포함)', amount: 300000, note: '진단 1회당' },
      { name: '화상 진단비 (심재성2도)', amount: 1000000, note: '진단 1회당' },
      { name: '어린이 주요질병 수술비', amount: 2000000, note: '수술 1회당' },
      { name: '응급실 내원 진료비', amount: 50000, note: '응급실 내원시' },
    ]
  },
  {
    id: 'meritz-loss',
    insurer: '메리츠화재',
    insuranceName: '메리츠 실손의료비보험',
    insuranceType: '실손보험',
    keywords: ['메리츠', '실손', '실비'],
    coverages: [
      { name: '상해/질병 급여 통원/입원', amount: 50000000, note: '자기부담 20% 공제후' },
      { name: '상해/질병 비급여 통원/입원', amount: 50000000, note: '자기부담 30% 공제후' },
      { name: '3대 비급여 (도수치료/체외충격파)', amount: 3500000, note: '연간 350만원/50회 한도' },
      { name: '3대 비급여 (주사료)', amount: 2500000, note: '연간 250만원/50회 한도' },
      { name: '3대 비급여 (MRI/MRA)', amount: 3000000, note: '연간 300만원 한도' },
    ]
  },
  {
    id: 'default-general',
    insurer: '기타보험사',
    insuranceName: '표준 건강종합 보장패키지',
    insuranceType: '건강보험',
    keywords: ['기타', '종합', '표준'],
    coverages: [
      { name: '일반암 진단비', amount: 30000000, note: '최초 1회한' },
      { name: '뇌혈관질환 진단비', amount: 10000000, note: '진단시 지급' },
      { name: '허혈성심장질환 진단비', amount: 10000000, note: '진단시 지급' },
      { name: '질병 수술비', amount: 500000, note: '수술 1회당' },
      { name: '상해 수술비', amount: 500000, note: '수술 1회당' },
    ]
  }
];

const fmt = (n) =>
  n == null || n === '' ? '-' : Number(n).toLocaleString('ko-KR') + '원';

const fmtShortDate = (dateStr) => {
  if (!dateStr) return '';
  const cleaned = String(dateStr).replace(/-/g, '.');
  const parts = cleaned.split('.');
  if (parts.length === 3) {
    const yy = parts[0].length === 4 ? parts[0].slice(2) : parts[0];
    const mm = parseInt(parts[1], 10);
    const dd = parseInt(parts[2], 10);
    return `${yy}.${mm}.${dd}`;
  }
  return cleaned;
};

const parseYM = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = String(dateStr).replace(/-/g, '.');
  const parts = cleaned.split('.').map(Number);
  if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { y: parts[0], m: parts[1] };
  }
  return null;
};

const calcTotalPremium = (policy) => {
  const premium = Number(policy.premium) || 0;
  const start = parseYM(policy.payStart);
  const end = parseYM(policy.payEnd);
  if (!start || !end) return 0;

  const totalMonths = (end.y - start.y) * 12 + (end.m - start.m) + 1;
  const cycle = policy.payCycle || '월납';
  const factor = cycle === '분기납' ? 3 : cycle === '반기납' ? 6 : cycle === '연납' ? 12 : 1;
  return premium * Math.ceil(Math.max(0, totalMonths) / factor);
};

const calcPaidInstallments = (policy) => {
  const start = parseYM(policy.payStart);
  if (!start) return 0;
  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const elapsed = (curY - start.y) * 12 + (curM - start.m) + 1;
  const cycle = policy.payCycle || '월납';
  const factor = cycle === '분기납' ? 3 : cycle === '반기납' ? 6 : cycle === '연납' ? 12 : 1;
  return Math.max(0, Math.ceil(elapsed / factor));
};

const calcPayProgress = (policy) => {
  const start = parseYM(policy.payStart);
  const end = parseYM(policy.payEnd);
  if (!start || !end) return 0;

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const elapsed = (curY - start.y) * 12 + (curM - start.m);
  const total = (end.y - start.y) * 12 + (end.m - start.m);
  if (total <= 0) return 100;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
};

const calcAgeProgress = (policy, birthYear) => {
  // 보장기간 0~100세 게이지
  const coverEnd = policy.coverEnd || '100'; // 나이 or '종신'
  const coverStart = Number(policy.coverStart || 0);
  const coverEndN = coverEnd === '종신' ? 100 : Number(coverEnd);
  const now = new Date();
  const currentAge = now.getFullYear() - (birthYear || 1974);
  const span = coverEndN - coverStart;
  if (span <= 0) return 0;
  const elapsed = currentAge - coverStart;
  return Math.min(100, Math.max(0, Math.round((elapsed / span) * 100)));
};

// ────────────────────────────────────────────────────────
// 빈 정책 템플릿
// ────────────────────────────────────────────────────────
const emptyPolicy = () => ({
  id: genId(),
  insuranceName:'', // 보험명 (예: 무배당프라임평생설계보험)
  insurer:      '',   // 보험사명
  insuranceType:'',   // 보험종류
  mainCoverageAmount: 50000000, // 주계약 가입금액 (기본 5,000만원)
  policyNo:     '',   // 증권번호
  contractDate: '',   // 계약체결일
  insured:      '',   // 피보험자
  feature:      '',   // 보험의 특징
  premium:      '',   // 보험료
  payCycle:     '월납',
  payMethod:    '카드',
  renewalType:  '비갱신형', // 갱신 / 비갱신
  payStart:     '',   // 납입시작 YYYY.MM.DD
  payEnd:       '',   // 납입종료 YYYY.MM.DD
  coverYears:   '',   // 보장기간 (년 단위, 예: 30 또는 100)
  coverStart:   '0',  // 보장시작 나이
  coverEnd:     '100',// 보장종료 나이 (또는 '종신')
  coverages:    [],   // 보장항목 [{name, amount, note}]
  birthYear:    1974, // 피보험자 생년 (게이지용)
});

// ────────────────────────────────────────────────────────
// 서브 컴포넌트: 보장항목 편집 행
// ────────────────────────────────────────────────────────
function CoverageRow({ item, idx, onChange, onDelete }) {
  return (
    <div className="ins-coverage-row">
      <select
        className="ins-input ins-input-sm ins-category-select"
        value={item.category || '미분류'}
        onChange={e => onChange(idx, 'category', e.target.value)}
      >
        {COVERAGE_CATEGORIES.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      <input
        className="ins-input ins-input-sm"
        placeholder="보장항목 (예: 일반암 진단비)"
        value={item.name}
        onChange={e => onChange(idx, 'name', e.target.value)}
      />
      <NumberInput
        className="ins-input ins-input-sm"
        placeholder="보장금액 (원)"
        rightAlign
        value={item.amount}
        onChange={val => onChange(idx, 'amount', val)}
      />
      <input
        className="ins-input ins-input-sm"
        placeholder="비고"
        value={item.note}
        onChange={e => onChange(idx, 'note', e.target.value)}
      />
      <button className="ins-btn-icon ins-btn-del" onClick={() => onDelete(idx)} title="삭제">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 서브 컴포넌트: 보험 카드 (목록)
// ────────────────────────────────────────────────────────
function PolicyCard({ policy, colorIdx, onSelect, onDelete }) {
  const progress = calcPayProgress(policy);
  const totalPremium = calcTotalPremium(policy);
  const paidInstall = calcPaidInstallments(policy);
  const color = COVERAGE_COLORS[colorIdx % COVERAGE_COLORS.length];

  return (
    <div
      className="ins-policy-card"
      style={{ '--ins-color': color }}
      onClick={() => onSelect(policy)}
    >
      <div className="ins-policy-card-accent" />
      <div className="ins-policy-card-head">
        <div>
          <div className="ins-policy-card-name">
            {policy.insuranceName || '보험명 미입력'}
            {policy.renewalType && (
              <span className={`ins-card-renewal-badge ${policy.renewalType === '갱신형' ? 'is-renewal' : 'is-non-renewal'}`}>
                {policy.renewalType}
              </span>
            )}
          </div>
          <div className="ins-policy-card-insurer">{policy.insurer || '보험사 미입력'} · {policy.insuranceType || '종류 미입력'}</div>
        </div>
        <div className="ins-policy-card-actions" onClick={e => e.stopPropagation()}>
          <button className="ins-btn-icon ins-btn-edit" onClick={() => onSelect(policy)} title="편집">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button className="ins-btn-icon ins-btn-del" onClick={() => onDelete(policy.id)} title="삭제">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 보험료 납입 게이지 */}
      <div className="ins-gauge-label">
        <span>납입 진행률</span>
        <span style={{ color }}>{progress}%</span>
      </div>
      <div className="ins-gauge-track">
        <div className="ins-gauge-fill" style={{ width: `${progress}%`, background: color }} />
      </div>
      <div className="ins-policy-card-meta">
        <span>납입 {paidInstall}회</span>
        {totalPremium > 0 && <span>총 {fmt(totalPremium)}</span>}
      </div>

      {/* 보장 커버리지 뱃지 및 카테고리 요약 (네이버페이 스타일) */}
      {policy.coverages && policy.coverages.length > 0 && (
        <div className="ins-naver-coverage-summary">
          <div className="ins-naver-coverage-summary-head">
            <span className="ins-naver-cov-title">보장 분석</span>
            <span className="ins-naver-cov-count">총 <strong>{policy.coverages.length}개</strong> 보장 항목</span>
          </div>
          <div className="ins-coverage-badges">
            {policy.coverages.slice(0, 6).map((c, i) => (
              <span key={i} className="ins-badge ins-badge-np">
                {c.category && <span className="ins-badge-category">{c.category}</span>}
                <span className="ins-badge-name">{c.name}</span>
                {c.amount ? <span className="ins-badge-amt">{fmt(c.amount)}</span> : null}
              </span>
            ))}
            {policy.coverages.length > 6 && (
              <span className="ins-badge ins-badge-more">+{policy.coverages.length - 6}개 더보기</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────
// 서브 컴포넌트: 보험 상세 모달
// ────────────────────────────────────────────────────────
function PolicyModal({ policy, colorIdx, onClose, onSave, isNew }) {
  const [form, setForm] = useState(() => ({ ...emptyPolicy(), ...policy }));
  const color = COVERAGE_COLORS[colorIdx % COVERAGE_COLORS.length];

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCoverageChange = (idx, field, value) => {
    const updated = [...(form.coverages || [])];
    updated[idx] = { ...updated[idx], [field]: value };
    setField('coverages', updated);
  };
  const addCoverage = () => {
    setField('coverages', [...(form.coverages || []), { category: '진단', name: '', amount: '', note: '' }]);
  };
  const deleteCoverage = (idx) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    const updated = [...(form.coverages || [])];
    updated.splice(idx, 1);
    setField('coverages', updated);
  };

  const progress = calcPayProgress(form);
  const totalPremium = calcTotalPremium(form);
  const paidInstall  = calcPaidInstallments(form);

  // ── 0~100세 타임라인 연산 ──
  // 피보험자 생년월일(YYYY-MM-DD 또는 YYYY)에서 생년 추출
  let birthY = 1974;
  if (form.birthYear) {
    const match = String(form.birthYear).match(/(\d{4})/);
    if (match) birthY = parseInt(match[1], 10);
  }
  const currentY = new Date().getFullYear();
  const currentAge = Math.max(0, currentY - birthY);

  // 가입일자(계약체결일 > 납입시작일)로부터 가입 연도 및 월 추출
  let joinY = currentY;
  let joinM = 12;
  const joinDateStr = form.contractDate || form.payStart || '';
  if (joinDateStr) {
    const p = String(joinDateStr).replace(/-/g, '.').split('.');
    if (p.length >= 1 && !isNaN(p[0])) joinY = parseInt(p[0], 10);
    if (p.length >= 2 && !isNaN(p[1])) joinM = parseInt(p[1], 10);
  }
  
  // 가입 당시 나이
  const joinAge = Math.max(0, Math.min(100, joinY - birthY));

  // 피보험자 생년 및 보장기간 유효성 판단
  const coverYearsNum = Number(form.coverYears) || 0;
  const hasAgeAndPeriod = !!form.birthYear && coverYearsNum > 0;

  // 유동적 보장 종료 연도/월 연산
  let expYearText = '2077년 12월 종신';
  if (coverYearsNum > 0) {
    const endY = joinY + coverYearsNum;
    const endM = String(joinM).padStart(2, '0');
    expYearText = `${endY}년 ${endM}월`;
  }

  // 0~100 타임라인 축 상의 % 위치
  const joinAgePct = Math.min(100, Math.max(0, joinAge));
  const currentAgePct = Math.min(100, Math.max(0, currentAge));
  const activeWidthPct = Math.max(0, currentAgePct - joinAgePct);

  return createPortal(
    <div className="ins-modal-overlay" onClick={onClose}>
      <div className="ins-modal" onClick={e => e.stopPropagation()}>
        <div className="ins-modal-header" style={{ borderBottomColor: color }}>
          <div className="ins-modal-title" style={{ color }}>
            {isNew ? '🛡️ 새 보험 추가' : `🛡️ ${form.insurer || '보험 상세'}`}
          </div>
          <button className="ins-btn-close" onClick={onClose}>×</button>
        </div>

        <div className="ins-modal-body">
          {/* ── 기본 정보 ── */}
          <div className="ins-section-label">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>기본 정보</span>
          </div>
          <div className="ins-form-grid" style={{ marginBottom: '0.75rem' }}>
            <div className="ins-field">
              <label>보험명 <span className="ins-required">*</span></label>
              <input className="ins-input" placeholder="예: 무배당프라임평생설계보험" value={form.insuranceName || ''}
                onChange={e => setField('insuranceName', e.target.value)} />
            </div>
            <div className="ins-field">
              <label>주계약 가입금액 (원)</label>
              <NumberInput
                className="ins-input"
                placeholder="예: 50,000,000"
                rightAlign
                value={form.mainCoverageAmount}
                onChange={val => setField('mainCoverageAmount', val)}
              />
            </div>
          </div>
          <div className="ins-form-grid">
            <div className="ins-field">
              <label>보험사 <span className="ins-required">*</span></label>
              <input className="ins-input" placeholder="예: KB손해보험" value={form.insurer}
                onChange={e => setField('insurer', e.target.value)} />
            </div>
            <div className="ins-field">
              <label>보험종류 <span className="ins-required">*</span></label>
              <select className="ins-input" value={form.insuranceType}
                onChange={e => setField('insuranceType', e.target.value)}>
                <option value="">선택</option>
                {INSURANCE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="ins-field">
              <label>증권번호</label>
              <input className="ins-input" placeholder="증권번호" value={form.policyNo}
                onChange={e => setField('policyNo', e.target.value)} />
            </div>
            <div className="ins-field">
              <label>계약체결일 <span className="ins-required">*</span></label>
              <input className="ins-input" type="date" value={form.contractDate || ''}
                onChange={e => setField('contractDate', e.target.value)} />
            </div>
            <div className="ins-field">
              <label>피보험자</label>
              <input className="ins-input" placeholder="피보험자 이름" value={form.insured}
                onChange={e => setField('insured', e.target.value)} />
            </div>
            <div className="ins-field">
              <label>피보험자 생년월일 <span className="ins-required">*</span></label>
              <input className="ins-input" type="date" value={form.birthYear || ''}
                onChange={e => setField('birthYear', e.target.value)} />
            </div>
          </div>
          <div className="ins-field ins-field-full">
            <label>보험 특징</label>
            <textarea className="ins-input ins-textarea" placeholder="보험의 주요 특징을 입력하세요"
              value={form.feature} onChange={e => setField('feature', e.target.value)} />
          </div>

          {/* ── 보험료 정보 ── */}
          <div className="ins-section-label">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="6" width="20" height="12" rx="2"/>
              <circle cx="12" cy="12" r="2"/>
              <path d="M6 12h.01M18 12h.01"/>
            </svg>
            <span>보험료 정보</span>
          </div>
          <div className="ins-form-grid">
            <div className="ins-field">
              <label>보험료 (원)</label>
              <NumberInput
                className="ins-input"
                placeholder="월 보험료 (원)"
                rightAlign
                value={form.premium}
                onChange={val => setField('premium', val)}
              />
            </div>
            <div className="ins-field">
              <label>갱신 구분</label>
              <select className="ins-input" value={form.renewalType || '비갱신형'}
                onChange={e => setField('renewalType', e.target.value)}>
                {RENEWAL_TYPES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="ins-field">
              <label>납입주기</label>
              <select className="ins-input" value={form.payCycle}
                onChange={e => setField('payCycle', e.target.value)}>
                {PAYMENT_CYCLES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="ins-field">
              <label>납부방법</label>
              <select className="ins-input" value={form.payMethod || '카드'}
                onChange={e => setField('payMethod', e.target.value)}>
                {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          <div className="ins-field ins-field-full" style={{ marginTop: '0.25rem' }}>
            <label>납입 기간</label>
            <div className="ins-date-range-row">
              <input
                className="ins-input"
                type="date"
                value={form.payStart || ''}
                onChange={e => setField('payStart', e.target.value)}
              />
              <span className="ins-date-range-sep">~</span>
              <input
                className="ins-input"
                type="date"
                value={form.payEnd || ''}
                onChange={e => setField('payEnd', e.target.value)}
              />
            </div>
          </div>
          </div>

          {/* 납입 게이지 */}
          {(form.payStart && form.payEnd) && (
            <div className="ins-gauge-block">
              <div className="ins-gauge-label">
                <span>납입 진행률</span>
                <span style={{ color }}>{progress}%</span>
              </div>
              <div className="ins-gauge-track" style={{ height: 10 }}>
                <div className="ins-gauge-fill" style={{ width: `${progress}%`, background: color }} />
              </div>
              <div className="ins-pay-summary">
                <span>
                  납입 {paidInstall}회차 · <span className="ins-pay-dates-full">{form.payStart} ~ {form.payEnd}</span>
                  <span className="ins-pay-dates-short">{fmtShortDate(form.payStart)} ~ {fmtShortDate(form.payEnd)}</span>
                </span>
                {totalPremium > 0 && (
                  <span>총 예상 <strong>{fmt(totalPremium)}</strong></span>
                )}
              </div>
              {/* 네이버 스타일 납입 종료 안내 카드 */}
              <div className="ins-naver-card" style={{ marginTop: '0.65rem' }}>
                <div className="ins-naver-card-left">
                  <div className="ins-naver-card-title">
                    <span className="ins-naver-icon">💳</span>
                    <span>
                      최대 <strong>{(() => {
                        const p = String(form.payEnd).replace(/-/g, '.').split('.');
                        if (p.length >= 2) return `${p[0]}년 ${p[1]}월`;
                        return form.payEnd;
                      })()}</strong>까지 납부하면 납입이 종료됩니다
                    </span>
                  </div>
                  <div className="ins-pay-rem-badge">
                    {(() => {
                      if (!form.payEnd) return null;
                      const endYM = parseYM(form.payEnd);
                      if (!endYM) return null;
                      const now = new Date();
                      const curY = now.getFullYear();
                      const curM = now.getMonth() + 1;
                      const remMonths = (endYM.y - curY) * 12 + (endYM.m - curM);
                      if (remMonths <= 0) return <span className="ins-rem-done">🎉 납입이 완전 완료되었습니다!</span>;
                      return (
                        <>
                          <span>납입 완료까지</span>
                          <span className="ins-rem-highlight">약 <strong>{remMonths}개월</strong></span>
                          <span>남았습니다</span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── 보장기간 (0~100세 타임라인 게이지) ── */}
          <div className="ins-section-label">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>보장기간</span>
          </div>
          
          <div className="ins-inline-field" style={{ marginBottom: '1.1rem' }}>
            <label className="ins-inline-label">보장기간</label>
            <div className="ins-inline-input-wrapper">
              <input
                className="ins-input ins-input-inline"
                type="number"
                placeholder="예: 30"
                value={form.coverYears || ''}
                onChange={e => setField('coverYears', e.target.value)}
              />
              <span className="ins-inline-unit">년</span>
            </div>
          </div>
          <div className="ins-age-gauge-block">
            <div className="ins-age-header">
              <span className="ins-age-title">보장기간</span>
            </div>
            <div className="ins-gauge-track ins-age-track" style={{ height: 16, marginTop: '0.6rem', marginBottom: '0.4rem' }}>
              {/* 0~100세 트랙 전체 보장 영역 (가입나이 ~ 100세) */}
              <div
                className="ins-age-range"
                style={{
                  left: `${joinAgePct}%`,
                  width: `${100 - joinAgePct}%`,
                  background: `linear-gradient(90deg, ${color}22 0%, ${color}55 100%)`
                }}
              />
              {/* 가입나이(joinAgePct)부터 현재나이(currentAgePct)까지 경과된 보장 진행 바 (에메랄드/포인트 색상) */}
              <div
                className="ins-age-progress-bar"
                style={{
                  left: `${joinAgePct}%`,
                  width: `${activeWidthPct}%`,
                  background: '#10b981', // 에메랄드/초록색 포인트 게이지
                }}
              />
              {/* 가입 당시 나이 핀 */}
              <div
                className="ins-age-start-pin"
                style={{
                  left: `${joinAgePct}%`,
                  background: color,
                }}
                title={`가입 나이: ${joinAge}세 (${joinY}년)`}
              />
              {/* 현재 나이 마커 및 '현재' 라벨 */}
              <div
                className="ins-age-marker-container"
                style={{ left: `${currentAgePct}%` }}
              >
                <span className="ins-age-now-label">현재</span>
                <div
                  className="ins-age-marker"
                  style={{
                    borderColor: color,
                    boxShadow: `0 0 0 3px ${color}44`,
                  }}
                  title={`현재 나이: ${currentAge}세`}
                />
              </div>
            </div>
            <div className="ins-age-axis">
              <span>0</span>
              <span>10</span>
              <span>20</span>
              <span>30</span>
              <span>40</span>
              <span>50</span>
              <span>60</span>
              <span>70</span>
              <span>80</span>
              <span>90</span>
              <span>100+</span>
            </div>
            <div className="ins-naver-card">
              <div className="ins-naver-card-left">
                {hasAgeAndPeriod ? (
                  <>
                    <div className="ins-naver-card-title">
                      <span className="ins-naver-icon">🛡️</span>
                      <span>최대 <strong>{expYearText}</strong>까지 보장받을 수 있습니다</span>
                    </div>
                    <div className="ins-naver-card-desc">
                      가입 나이 <strong>{joinAge}세</strong>({joinY}년)부터 {coverYearsNum}년 동안 든든하게 보장
                    </div>
                  </>
                ) : (
                  <div className="ins-naver-card-title" style={{ opacity: 0.75, fontSize: '0.82rem' }}>
                    <span className="ins-naver-icon">💡</span>
                    <span>생년월일과 보장기간을 입력하면 표시됩니다.</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* ── 보장 정보 ── */}
          <div className="ins-section-label ins-section-label-flex">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>보장 정보</span>
            </div>
            <button className="ins-btn-add-coverage" onClick={addCoverage}>
              + 항목 추가
            </button>
          </div>
          {(form.coverages || []).length === 0 && (
            <div className="ins-empty-coverage">보장 항목을 추가하세요</div>
          )}
          <div className="ins-coverage-list">
            {(form.coverages || []).map((item, idx) => (
              <CoverageRow
                key={idx} item={item} idx={idx}
                onChange={handleCoverageChange}
                onDelete={deleteCoverage}
              />
            ))}
          </div>
        </div>

        <div className="ins-modal-footer">
          <button className="ins-btn ins-btn-cancel" onClick={onClose}>취소</button>
          <button className="ins-btn ins-btn-save" style={{ background: color }} onClick={() => onSave(form)}>
            저장
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ────────────────────────────────────────────────────────
// 메인: InsurancePage
// ────────────────────────────────────────────────────────
export default function InsurancePage() {
  const { getCurrentInsurance, persistInsurance, showToast, dark } = useApp();

  const insuranceData = getCurrentInsurance();
  const [policies, setPolicies] = useState(() => insuranceData.policies || []);
  const [modalState, setModalState] = useState(null); // null | { policy, isNew, colorIdx }
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState('');

  // 데이터 갱신 시 sync
  useEffect(() => {
    const d = getCurrentInsurance();
    setPolicies(d.policies || []);
  }, [getCurrentInsurance]);

  const filtered = useMemo(() => {
    let list = policies;
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = policies.filter(p =>
        (p.insuranceName || '').toLowerCase().includes(q) ||
        (p.insurer || '').toLowerCase().includes(q) ||
        (p.insuranceType || '').toLowerCase().includes(q) ||
        (p.insured || '').toLowerCase().includes(q)
      );
    }
    // (무)LIG닥터플러스 항목을 목록의 맨 끝(우측 끝)으로 정렬
    return [...list].sort((a, b) => {
      const isLigA = (a.insuranceName || '').includes('LIG닥터플러스') || (a.insuranceName || '').includes('닥터플러스');
      const isLigB = (b.insuranceName || '').includes('LIG닥터플러스') || (b.insuranceName || '').includes('닥터플러스');
      if (isLigA && !isLigB) return 1;
      if (!isLigA && isLigB) return -1;
      return 0;
    });
  }, [policies, searchText]);

  const handleAdd = () => {
    setModalState({ policy: emptyPolicy(), isNew: true, colorIdx: policies.length });
  };

  const handleSelect = (policy) => {
    const idx = policies.findIndex(p => p.id === policy.id);
    setModalState({ policy, isNew: false, colorIdx: idx });
  };

  const handleDelete = useCallback(async (id) => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    const updated = policies.filter(p => p.id !== id);
    setPolicies(updated);
    await persistInsurance({ policies: updated });
    showToast('삭제되었습니다.', 'success');
  }, [policies, persistInsurance, showToast]);

  const handleSave = useCallback(async (form) => {
    // 0. 필수 입력값 검증 (보험명, 보험사, 보험종류, 계약체결일, 피보험자 생년)
    if (!form.insuranceName || !String(form.insuranceName).trim()) {
      showToast('보험명을 입력해주세요.', 'warning');
      return false;
    }
    if (!form.insurer || !String(form.insurer).trim()) {
      showToast('보험사를 입력해주세요.', 'warning');
      return false;
    }
    if (!form.insuranceType || !String(form.insuranceType).trim()) {
      showToast('보험종류를 선택해주세요.', 'warning');
      return false;
    }
    if (!form.contractDate || !String(form.contractDate).trim()) {
      showToast('계약체결일을 선택해주세요.', 'warning');
      return false;
    }
    if (!form.birthYear || !String(form.birthYear).trim()) {
      showToast('피보험자 생년월일을 선택해주세요.', 'warning');
      return false;
    }

    // 1. 검증 통과 시 모달 창을 닫고 React State 즉시 업데이트
    const isNew = modalState?.isNew;
    setModalState(null);

    let updated;
    if (isNew) {
      updated = [...policies, form];
    } else {
      updated = policies.map(p => p.id === form.id ? form : p);
    }
    setPolicies(updated);

    // 2. 비동기 백그라운드 저장 및 토스트 표시
    try {
      showToast('저장 중입니다...', 'info');
      const res = await persistInsurance({ policies: updated });
      if (res?.success) {
        showToast('저장되었습니다.', 'success');
      } else {
        showToast('저장 중 일부 네트워크 동기화에 실패했습니다 (로컬 보관 완료).', 'warning');
      }
    } catch (e) {
      showToast('저장 완료', 'success');
    }
  }, [policies, modalState, persistInsurance, showToast]);

  // 요약 계산
  const totalMonthlyPremium = useMemo(() =>
    policies.reduce((s, p) => {
      const premium = Number(p.premium) || 0;
      const cycle = p.payCycle || '월납';
      const factor = cycle === '분기납' ? 1/3 : cycle === '반기납' ? 1/6 : cycle === '연납' ? 1/12 : 1;
      return s + premium * factor;
    }, 0),
    [policies]
  );

  const totalCoverageItems = useMemo(() =>
    policies.reduce((s, p) => s + ((p.coverages || []).length), 0),
    [policies]
  );

  return (
    <div className="ins-page">
      {/* ── 헤더 ── */}
      <div className="ins-page-header">
        <div className="ins-page-title-block">
          <div className="ins-page-title">
            <span className="ins-page-title-icon">🛡️</span>
            내 보험 관리
          </div>
          <div className="ins-page-subtitle">가입 보험 내역 및 보장 정보를 한눈에 관리하세요</div>
        </div>
        <button className="ins-btn ins-btn-primary ins-btn-add" onClick={handleAdd}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          보험 추가
        </button>
      </div>

      {/* ── 요약 카드 ── */}
      <div className="ins-summary-row">
        <div className="ins-summary-card ins-summary-card-teal">
          <div className="ins-summary-label">가입 보험 수</div>
          <div className="ins-summary-value">{policies.length}<span>건</span></div>
        </div>
        <div className="ins-summary-card ins-summary-card-indigo">
          <div className="ins-summary-label">월 납입 보험료</div>
          <div className="ins-summary-value ins-summary-value-sm">{Math.round(totalMonthlyPremium).toLocaleString('ko-KR')}<span>원</span></div>
        </div>
        <div className="ins-summary-card ins-summary-card-amber">
          <div className="ins-summary-label">총 보장 항목</div>
          <div className="ins-summary-value">{totalCoverageItems}<span>개</span></div>
        </div>
      </div>

      {/* ── 검색 ── */}
      {policies.length > 0 && (
        <div className="ins-search-bar">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="ins-search-input"
            placeholder="보험사, 종류, 피보험자로 검색..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          {searchText && (
            <button className="ins-btn-clear" onClick={() => setSearchText('')}>×</button>
          )}
        </div>
      )}

      {/* ── 보험 카드 목록 ── */}
      {filtered.length === 0 ? (
        <div className="ins-empty">
          <div className="ins-empty-icon">🛡️</div>
          <div className="ins-empty-title">
            {policies.length === 0 ? '등록된 보험이 없습니다' : '검색 결과가 없습니다'}
          </div>
          {policies.length === 0 && (
            <div className="ins-empty-desc">우측 상단 "보험 추가" 버튼으로 첫 보험을 등록해보세요</div>
          )}
        </div>
      ) : (
        <div className="ins-policy-grid">
          {filtered.map((policy, idx) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              colorIdx={policies.findIndex(p => p.id === policy.id)}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* ── 상세 모달 ── */}
      {modalState && (
        <PolicyModal
          policy={modalState.policy}
          colorIdx={modalState.colorIdx}
          isNew={modalState.isNew}
          onClose={() => setModalState(null)}
          onSave={handleSave}
        />
      )}

      {saving && (
        <div className="ins-saving-overlay">저장 중...</div>
      )}
    </div>
  );
}
