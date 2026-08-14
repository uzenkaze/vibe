import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

// 초기 샘플 데이터 (첨부 이미지 3종 실 데이터 100% 정밀 복원)
const INITIAL_DATA = {
  investment: {
    interiorCA520: [
      { id: '1', date: '2022-09-26', item: '냉장고', detail: 'RB33A300401', amount: 615600 },
      { id: '2', date: '2022-09-26', item: '세탁기', detail: 'F9WKB(9Kg)', amount: 460370 },
      { id: '3', date: '2022-10-19', item: '인테리어', detail: '싱크대', amount: 2620000 },
      { id: '4', date: '2023-01-29', item: '인테리어', detail: '냉난방기', amount: 1280000 },
      { id: '5', date: '2023-01-28', item: '부동산', detail: '중계수수료', amount: 440000 }
    ],
    interiorCA557: [
      { id: '1', date: '2023-02-01', item: '냉장고', detail: 'RB33A300401', amount: 673400 },
      { id: '2', date: '2023-02-01', item: '세탁기', detail: 'F9WKB(9Kg)', amount: 438130 },
      { id: '3', date: '2022-10-28', item: '인테리어', detail: '싱크대', amount: 2620000 },
      { id: '4', date: '2023-02-11', item: '인테리어', detail: '냉난방기', amount: 1280000 },
      { id: '5', date: '2023-02-11', item: '부동산', detail: '중계수수료', amount: 440000 }
    ],
    details: [
      { id: 'd1', category: '총분양가', target: '2개 호실', note: '분양', amount: 326754100 },
      { id: 'd2', category: '계약금', target: '분양', note: '', amount: 32000000 },
      { id: 'd3', category: '하나은행 상환이자', target: '2022.09', note: '', amount: 1210747 },
      { id: 'd4', category: '대출부족금', target: '2022.09', note: '잔금 KB', amount: 22769809 },
      { id: 'd5', category: '대출금', target: '2022.09', note: '농협 NH', amount: 272000000 },
      { id: 'd6', category: '법무사비용', target: '2022.09', note: '등기 2개호실', amount: 8517510 },
      { id: 'd7', category: '인테리어', target: '2023.01', note: '빌트인 시설 2개호실', amount: 10867500 }
    ],
    summary: {
      deposit: 54769809,
      facility: 10867500,
      taxInterest: 9728257,
      sumCost: 75365566,
      totalInvestment: 347349857
    },
    breakEven: [
      { id: 'b1', unit: 'C-A-05-057', supplyPrice: 166040200, diff: 7634729 },
      { id: 'b2', unit: 'C-A-05-020', supplyPrice: 160713900, diff: 12961029 }
    ]
  },
  loans: {
    kb: [
      { date: '2022. 10. 5', rate: '4.16%', payment: 452422, principal: 105756, interest: 346666, diff: 0, margin: '0.00%' },
      { date: '2022. 11. 7', rate: '4.16%', payment: 452422, principal: 106122, interest: 346300, diff: -366, margin: '0.00%' },
      { date: '2022. 12. 5', rate: '4.16%', payment: 452422, principal: 106490, interest: 345932, diff: -734, margin: '0.00%' },
      { date: '2023. 1. 5', rate: '4.16%', payment: 458472, principal: 104603, interest: 353869, diff: 7203, margin: '0.00%' },
      { date: '2023. 2. 6', rate: '4.16%', payment: 452432, principal: 107232, interest: 345200, diff: -1466, margin: '0.00%' },
      { date: '2023. 3. 6', rate: '4.16%', payment: 452432, principal: 107604, interest: 344828, diff: -1838, margin: '0.00%' },
      { date: '2023. 4. 5', rate: '4.16%', payment: 452432, principal: 107977, interest: 344455, diff: -2211, margin: '0.00%' },
      { date: '2023. 5. 8', rate: '4.16%', payment: 452432, principal: 108351, interest: 344081, diff: -2585, margin: '0.00%' },
      { date: '2023. 6. 5', rate: '4.16%', payment: 452432, principal: 108727, interest: 343705, diff: -2961, margin: '0.00%' },
      { date: '2023. 7. 5', rate: '4.16%', payment: 452432, principal: 109104, interest: 343328, diff: -3338, margin: '0.00%' },
      { date: '2023. 8. 7', rate: '4.16%', payment: 452432, principal: 109482, interest: 342950, diff: -3716, margin: '0.00%' },
      { date: '2023. 9. 5', rate: '4.16%', payment: 452432, principal: 109862, interest: 342570, diff: -4096, margin: '0.00%' },
      { date: '2023. 10. 5', rate: '5.75%', payment: 551403, principal: 78424, interest: 472979, diff: 126313, margin: '1.59%' },
      { date: '2023. 11. 6', rate: '5.75%', payment: 551403, principal: 78800, interest: 472603, diff: 125937, margin: '1.59%' },
      { date: '2023. 12. 5', rate: '5.75%', payment: 551403, principal: 79178, interest: 472225, diff: 125559, margin: '1.59%' },
      { date: '2024. 1. 8', rate: '5.75%', payment: 551403, principal: 79557, interest: 471846, diff: 125180, margin: '1.59%' },
      { date: '2024. 2. 5', rate: '5.75%', payment: 551403, principal: 79938, interest: 471465, diff: 124799, margin: '1.59%' },
      { date: '2024. 3. 5', rate: '5.75%', payment: 551403, principal: 80321, interest: 471082, diff: 124416, margin: '1.59%' },
      { date: '2024. 4. 5', rate: '5.75%', payment: 551403, principal: 80706, interest: 470697, diff: 124031, margin: '1.59%' },
      { date: '2024. 5. 7', rate: '5.75%', payment: 551403, principal: 81093, interest: 470310, diff: 123644, margin: '1.59%' },
      { date: '2024. 6. 5', rate: '5.75%', payment: 551403, principal: 81482, interest: 469921, diff: 123255, margin: '1.59%' },
      { date: '2024. 7. 5', rate: '5.75%', payment: 551403, principal: 81872, interest: 469531, diff: 122865, margin: '1.59%' },
      { date: '2024. 8. 5', rate: '5.75%', payment: 551403, principal: 82264, interest: 469139, diff: 122473, margin: '1.59%' },
      { date: '2024. 9. 5', rate: '5.85%', payment: 557807, principal: 80910, interest: 476897, diff: 130231, margin: '1.69%' }
    ],
    nh: [
      { date: '2022. 10. 13', rate: '4.57%', payment: 1021675, extra: 21675, condition: '기준: 2.9%, 가산: 1.67%' },
      { date: '2022. 11. 14', rate: '4.57%', payment: 1021676, extra: 21676 },
      { date: '2022. 12. 13', rate: '4.57%', payment: 1021676, extra: 21676 },
      { date: '2023. 1. 13', rate: '4.57%', payment: 1055732, extra: 55732 },
      { date: '2023. 2. 13', rate: '4.87%', payment: 1089266, extra: 89266 },
      { date: '2023. 3. 13', rate: '4.87%', payment: 1016162, extra: 16162 },
      { date: '2023. 4. 13', rate: '5.79%', payment: 1337569, extra: 337569, condition: '기준: 3.82%, 가산: 1.97%' },
      { date: '2023. 5. 15', rate: '5.79%', payment: 1294421, extra: 294421 },
      { date: '2023. 6. 13', rate: '5.79%', payment: 1337569, extra: 337569 },
      { date: '2023. 7. 13', rate: '5.79%', payment: 1294421, extra: 294421 },
      { date: '2023. 8. 14', rate: '5.79%', payment: 1337569, extra: 337569 },
      { date: '2023. 9. 13', rate: '5.79%', payment: 1337569, extra: 337569 },
      { date: '2023. 10. 13', rate: '5.79%', payment: 1265358, extra: 265358, condition: '기준: 3.69%, 가산: 1.97%' },
      { date: '2023. 11. 13', rate: '5.66%', payment: 1307537, extra: 307537 },
      { date: '2023. 12. 13', rate: '5.66%', payment: 1265358, extra: 265358 },
      { date: '2024. 1. 15', rate: '5.66%', payment: 1306153, extra: 306153 },
      { date: '2024. 2. 13', rate: '5.66%', payment: 1303965, extra: 303965 },
      { date: '2024. 2. 7', rate: '이자환급', payment: -2685805, extra: 0, isRefund: true },
      { date: '2024. 3. 13', rate: '5.66%', payment: 1219838, extra: 69838 },
      { date: '2024. 4. 15', rate: '5.63%', payment: 1297053, extra: 147053, condition: '기준: 3.66%, 가산: 1.97%' },
      { date: '2024. 5. 13', rate: '5.63%', payment: 1255213, extra: 105213 },
      { date: '2024. 6. 13', rate: '5.63%', payment: 1297053, extra: 147053 },
      { date: '2024. 7. 15', rate: '5.63%', payment: 1255213, extra: 105213 },
      { date: '2024. 8. 13', rate: '5.63%', payment: 1297053, extra: 147053 }
    ]
  },
  rent: {
    year: '2026',
    contracts: [
      {
        id: 'c1',
        room: 'CA520',
        tenant: '김성진',
        contact: '010-3192-5546',
        contractDate: '2025. 5. 20',
        status: '계약만료',
        terms: '500/60',
        deposit: 5000000,
        rent: 600000,
        extendRequest: '2026. 3. 24',
        extendStatus: '6개월 연장',
        note: '1인 남성',
        memo: '※ 1개월 연장하고 복비부담하고 선출함',
        payments: [
          { id: 'p1', date: '2026. 1. 19', actualDate: '2026. 1. 19', amount: 600000, isPaid: true, note: '' },
          { id: 'p2', date: '2026. 2. 19', actualDate: '2026. 2. 20', amount: 600000, isPaid: true, note: '' },
          { id: 'p3', date: '2026. 3. 19', actualDate: '2026. 3. 19', amount: 600000, isPaid: true, note: '' },
          { id: 'p4', date: '2026. 4. 19', actualDate: '2026. 4. 20', amount: 600000, isPaid: true, note: '' },
          { id: 'p5', date: '2026. 5. 19', actualDate: '2026. 5. 19', amount: 600000, isPaid: true, note: '계약만료' },
          { id: 'p6', date: '2026. 6. 19', actualDate: '2026. 6. 19', amount: 600000, isPaid: true, note: '' },
          { id: 'p7', date: '2026. 7. 19', actualDate: '2026. 7. 20', amount: 600000, isPaid: true, note: '정산' }
        ]
      },
      {
        id: 'c2',
        room: 'CA520',
        tenant: '이주훈',
        contact: '',
        contractDate: '2026. 7. 20',
        status: '계약만료',
        terms: '500/60',
        deposit: 5000000,
        rent: 600000,
        extendRequest: '',
        extendStatus: '',
        note: '1인 남성',
        memo: '1차 계약금(350), 2차 계약금(150)',
        payments: [
          { id: 'p8', date: '2026. 8. 19', actualDate: '', amount: 600000, isPaid: true, note: '' },
          { id: 'p9', date: '2026. 9. 19', actualDate: '', amount: 0, isPaid: false, note: '' },
          { id: 'p10', date: '2026. 10. 19', actualDate: '', amount: 0, isPaid: false, note: '' },
          { id: 'p11', date: '2026. 11. 19', actualDate: '', amount: 0, isPaid: false, note: '' },
          { id: 'p12', date: '2026. 12. 19', actualDate: '', amount: 0, isPaid: false, note: '' }
        ]
      }
    ]
  }
};

export default function KnowledgeIndustryPage() {
  const { dark, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('investment'); // 'investment' | 'loans' | 'rent'

  // 데이터 상태 (localStorage 연동)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_knowledge_industry');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.investment && parsed.loans && parsed.rent) return parsed;
      }
    } catch (e) {}
    return INITIAL_DATA;
  });

  // 데이터 변경 시 저장
  useEffect(() => {
    try {
      localStorage.setItem('asset_knowledge_industry', JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  // 숫자를 한국 원화 금액 포맷으로 변환
  const formatMoney = (num) => {
    if (num === null || num === undefined) return '0원';
    const isNeg = num < 0;
    const absVal = Math.abs(num).toLocaleString('ko-KR');
    return isNeg ? `-${absVal}원` : `${absVal}원`;
  };

  // --- 탭 1: 투자 비용 관리 ---
  const ca520Sum = data.investment.interiorCA520.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const ca557Sum = data.investment.interiorCA557.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const interiorTotal = ca520Sum + ca557Sum;

  // --- 탭 2: 대출 상환 관리 ---
  const kbPaymentTotal = data.loans.kb.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const kbPrincipalTotal = data.loans.kb.reduce((s, i) => s + (Number(i.principal) || 0), 0);
  const kbInterestTotal = data.loans.kb.reduce((s, i) => s + (Number(i.interest) || 0), 0);

  const nhPaymentTotal = data.loans.nh.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const nhExtraTotal = data.loans.nh.reduce((s, i) => s + (Number(i.extra) || 0), 0);

  // --- 탭 3: 월세 입금 여부 토글 헬퍼 ---
  const handleToggleRentPaid = (contractId, paymentId) => {
    setData(prev => {
      const nextRent = { ...prev.rent };
      nextRent.contracts = nextRent.contracts.map(c => {
        if (c.id === contractId) {
          const nextPayments = c.payments.map(p => {
            if (p.id === paymentId) {
              const nextPaid = !p.isPaid;
              return { ...p, isPaid: nextPaid, amount: nextPaid ? 600000 : 0 };
            }
            return p;
          });
          return { ...c, payments: nextPayments };
        }
        return c;
      });
      return { ...prev, rent: nextRent };
    });
    showToast('월세 입금 상태가 업데이트되었습니다.', 'success');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <style>{`
        .tab-btn {
          padding: 10px 22px;
          border-radius: 99px;
          border: 1px solid transparent;
          font-size: 0.9rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          color: #ffffff;
          box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
        }
        .tab-btn.inactive {
          background: ${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};
          color: ${dark ? 'rgba(255,255,255,0.6)' : '#64748b'};
          border-color: ${dark ? 'rgba(255,255,255,0.1)' : '#cbd5e1'};
        }
        .tab-btn.inactive:hover {
          background: ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        .data-table th, .data-table td {
          padding: 8px 10px;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          text-align: center;
        }
        .data-table th {
          background: ${dark ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
          color: var(--text-primary);
          font-weight: 800;
        }
        .data-table tr:hover {
          background: ${dark ? 'rgba(255,255,255,0.02)' : '#f1f5f9'};
        }

        .badge-paid {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
          border: 1px solid rgba(16, 185, 129, 0.35);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }
        .badge-unpaid {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 99px;
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.35);
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
        }
      `}</style>

      {/* 대시보드 헤더 */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏢 지식산업센터 부동산 자산 관리
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              지식산업센터 2개 호실(CA520, CA557)의 투자 비용, 은행별 대출 원리금 상환 내역 및 월세 입금을 한눈에 통합 관리하세요.
            </p>
          </div>

          {/* 3개 탭 스위처 */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('investment')}
              className={`tab-btn ${activeTab === 'investment' ? 'active' : 'inactive'}`}
            >
              💰 1. 투자비용
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`tab-btn ${activeTab === 'loans' ? 'active' : 'inactive'}`}
            >
              🏦 2. 대출상환
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`tab-btn ${activeTab === 'rent' ? 'active' : 'inactive'}`}
            >
              🚪 3. 월세입금(호실별)
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================================= */}
      {/* 탭 1: 투자 비용 관리 */}
      {/* ========================================================================================= */}
      {activeTab === 'investment' && (
        <div>
          {/* 전체 투자 요약 카드 4종 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(168, 85, 247, 0.12)' : '#faf5ff', border: '1px solid #c084fc' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: dark ? '#c084fc' : '#7e22ce' }}>총 분양가 (2개 호실)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#581c87', marginTop: '4px' }}>
                {formatMoney(326754100)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>CA520 + CA557 분양 총액</div>
            </div>

            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff', border: '1px solid #93c5fd' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: dark ? '#60a5fa' : '#1d4ed8' }}>전체 실 투자비용</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#1e40af', marginTop: '4px' }}>
                {formatMoney(data.investment.summary.sumCost)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>계약금/잔금 + 시설비 + 등취득/이자</div>
            </div>

            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2', border: '1px solid #fca5a5' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: dark ? '#f87171' : '#b91c1c' }}>총 투자금 (모든 경비 포함)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#991b1b', marginTop: '4px' }}>
                {formatMoney(data.investment.summary.totalInvestment)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>복비 등 제외 전체 자금</div>
            </div>

            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5', border: '1px solid #6ee7b7' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: dark ? '#34d399' : '#047857' }}>호실별 회수 목표 평균금액</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#065f46', marginTop: '4px' }}>
                {formatMoney(173674929)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>손해 안 보고 매각 가능한 호실당 금액</div>
            </div>
          </div>

          {/* 호실별 인테리어 비용 */}
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛠️ 호실별 인테리어 비용
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* CA520 호실 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#a855f7' }}>📍 CA520 호실</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>합계: {formatMoney(ca520Sum)}</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>일자</th>
                      <th>품목</th>
                      <th>상세</th>
                      <th>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.investment.interiorCA520.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.item}</td>
                        <td style={{ textAlign: 'left' }}>{item.detail}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(item.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', fontWeight: 800 }}>
                      <td colSpan={3}>소계</td>
                      <td style={{ textAlign: 'right', color: '#7e22ce' }}>{formatMoney(ca520Sum)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* CA557 호실 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#3b82f6' }}>📍 CA557 호실</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>합계: {formatMoney(ca557Sum)}</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>일자</th>
                      <th>품목</th>
                      <th>상세</th>
                      <th>금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.investment.interiorCA557.map(item => (
                      <tr key={item.id}>
                        <td>{item.date}</td>
                        <td>{item.item}</td>
                        <td style={{ textAlign: 'left' }}>{item.detail}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(item.amount)}</td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', fontWeight: 800 }}>
                      <td colSpan={3}>소계</td>
                      <td style={{ textAlign: 'right', color: '#1d4ed8' }}>{formatMoney(ca557Sum)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 인테리어 총합계 */}
            <div style={{ marginTop: '1rem', padding: '10px 16px', borderRadius: '12px', background: dark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', border: '1px solid #c084fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: dark ? '#ffffff' : '#581c87' }}>2개 호실 인테리어 총 비용 합계</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: dark ? '#c084fc' : '#7e22ce' }}>{formatMoney(interiorTotal)}</span>
            </div>
          </div>

          {/* 투자상세내역 & 전체 투자 비용 상세 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* 투자 상세 내역 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                📋 투자 상세 내역
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>항목</th>
                    <th>대상/연월</th>
                    <th>비고</th>
                    <th>투자금액</th>
                  </tr>
                </thead>
                <tbody>
                  {data.investment.details.map(d => (
                    <tr key={d.id} style={{ fontWeight: d.category === '총분양가' ? 900 : 400 }}>
                      <td style={{ fontWeight: 800 }}>{d.category}</td>
                      <td>{d.target}</td>
                      <td>{d.note}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: d.category === '총분양가' ? '#a855f7' : 'inherit' }}>
                        {formatMoney(d.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 전체 투자 비용 요약 및 호실별 회수 분석 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
                📊 호실별 공급가 & 매각 회수 분석
              </h3>
              <table className="data-table" style={{ marginBottom: '1rem' }}>
                <thead>
                  <tr>
                    <th>호실별 공급가</th>
                    <th>공급 금액</th>
                    <th>차액 (투자금 포함)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.investment.breakEven.map(b => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 800 }}>{b.unit}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(b.supplyPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatMoney(b.diff)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ padding: '12px', borderRadius: '12px', background: dark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', border: '1px solid #fca5a5' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ef4444' }}>💡 손해 안 보고 호실별로 팔아야 하는 평균 금액</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: dark ? '#ffffff' : '#991b1b', marginTop: '4px' }}>
                  각 호실별 {formatMoney(173674929)}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>※ 최소 이 금액 이상 매각 시 전체 투자금 완전 회수</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 탭 2: 대출 상환 관리 */}
      {/* ========================================================================================= */}
      {activeTab === 'loans' && (
        <div>
          {/* 상환 요약 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff', border: '1px solid #93c5fd' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#2563eb' }}>KB (생활안정) 누적 원리금</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#1e40af', marginTop: '4px' }}>
                {formatMoney(kbPaymentTotal)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>원금: {formatMoney(kbPrincipalTotal)} | 이자: {formatMoney(kbInterestTotal)}</div>
            </div>

            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(168, 85, 247, 0.12)' : '#faf5ff', border: '1px solid #c084fc' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#7e22ce' }}>NH (기업성장론) 누적 원리금</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: dark ? '#ffffff' : '#581c87', marginTop: '4px' }}>
                {formatMoney(nhPaymentTotal)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>월세 대비 누적 추가부담금: {formatMoney(nhExtraTotal)}</div>
            </div>

            <div className="section-card" style={{ padding: '1.25rem', background: dark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb', border: '1px solid #fde68a' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#d97706' }}>NH 이자 환급액</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', marginTop: '4px' }}>
                -2,685,805원
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>2024. 02. 07 환급 완료</div>
            </div>
          </div>

          {/* 대출 상환 내역 테이블 (KB & NH 나란히) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* KB 생활안정 대출 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>
                  🏦 KB (생활안정) 상환 내역
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>기준: 4.16% ~ 5.85%</span>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>연월</th>
                      <th>금리</th>
                      <th>원리금</th>
                      <th>원금</th>
                      <th>이자</th>
                      <th>이자차액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.loans.kb.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 700 }}>{row.date}</td>
                        <td style={{ color: '#2563eb', fontWeight: 800 }}>{row.rate}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(row.payment)}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(row.principal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(row.interest)}</td>
                        <td style={{ textAlign: 'right', color: row.diff > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          {formatMoney(row.diff)}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', fontWeight: 900 }}>
                      <td colSpan={2}>합계</td>
                      <td style={{ textAlign: 'right', color: '#1e40af' }}>{formatMoney(kbPaymentTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbPrincipalTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbInterestTotal)}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* NH 기업성장론 대출 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#7e22ce', margin: 0 }}>
                  🏦 NH (기업성장론) 상환 내역
                </h3>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>우대금리 조건 보유</span>
              </div>
              <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>연월</th>
                      <th>금리</th>
                      <th>원리금(이자만)</th>
                      <th>월세대비 추가부담</th>
                      <th>우대조건</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.loans.nh.map((row, idx) => (
                      <tr key={idx} style={{ background: row.isRefund ? (dark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7') : 'inherit' }}>
                        <td style={{ fontWeight: 700 }}>{row.date}</td>
                        <td style={{ color: row.isRefund ? '#d97706' : '#7e22ce', fontWeight: 800 }}>{row.rate}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: row.isRefund ? '#d97706' : 'inherit' }}>
                          {formatMoney(row.payment)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 700 }}>
                          {formatMoney(row.extra)}
                        </td>
                        <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{row.condition || '-'}</td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', fontWeight: 900 }}>
                      <td colSpan={2}>합계</td>
                      <td style={{ textAlign: 'right', color: '#581c87' }}>{formatMoney(nhPaymentTotal)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatMoney(nhExtraTotal)}</td>
                      <td>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 탭 3: 월세 입금 및 계약 관리 (호실별) */}
      {/* ========================================================================================= */}
      {activeTab === 'rent' && (
        <div>
          {/* 연도 및 호실 정보 필터 툴바 */}
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>📅 조회 연도:</span>
              <select
                value={data.rent.year}
                onChange={e => setData(prev => ({ ...prev, rent: { ...prev.rent, year: e.target.value } }))}
                style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 800 }}
              >
                <option value="2025">2025년</option>
                <option value="2026">2026년</option>
                <option value="2027">2027년</option>
              </select>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              💡 입금 여부(⭕/❌) 뱃지를 클릭하면 입금 처리 상태가 즉시 토글 반영됩니다.
            </div>
          </div>

          {/* 2개 호실/계약자 테이블 나란히 렌더링 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {data.rent.contracts.map(contract => {
              const totalPaidAmount = contract.payments.reduce((s, p) => s + (p.isPaid ? (Number(p.amount) || 0) : 0), 0);

              return (
                <div key={contract.id} className="section-card" style={{ padding: '1.5rem' }}>
                  {/* 계약자 / 호실 헤더 */}
                  <div style={{ borderBottom: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a855f7' }}>
                        📍 {contract.room} ({contract.tenant})
                      </span>
                      <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: '99px', background: dark ? 'rgba(168,85,247,0.2)' : '#f3e8ff', color: '#7e22ce', fontWeight: 800 }}>
                        {contract.status}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                      <div>계약일: <strong>{contract.contractDate}</strong></div>
                      <div>계약조건: <strong>{contract.terms}</strong> (월 {formatMoney(contract.rent)})</div>
                      <div>보증금: <strong>{formatMoney(contract.deposit)}</strong></div>
                      <div>연장정보: <strong>{contract.extendStatus || '없음'}</strong></div>
                    </div>

                    {contract.memo && (
                      <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '6px', fontWeight: 700 }}>
                        {contract.memo}
                      </div>
                    )}
                  </div>

                  {/* 입금 일정 내역 테이블 */}
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>입금예정일</th>
                        <th>실입금일</th>
                        <th>입금액</th>
                        <th>입금여부</th>
                        <th>비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.payments.map(p => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 700 }}>{p.date}</td>
                          <td>{p.actualDate || '-'}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>
                            {formatMoney(p.amount)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleRentPaid(contract.id, p.id)}
                              className={p.isPaid ? 'badge-paid' : 'badge-unpaid'}
                            >
                              {p.isPaid ? '⭕ 완납' : '❌ 미납'}
                            </button>
                          </td>
                          <td style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                            {p.note || '-'}
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', fontWeight: 900 }}>
                        <td colSpan={2}>입금 총액</td>
                        <td style={{ textAlign: 'right', color: '#7e22ce' }}>{formatMoney(totalPaidAmount)}</td>
                        <td colSpan={2}>-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
