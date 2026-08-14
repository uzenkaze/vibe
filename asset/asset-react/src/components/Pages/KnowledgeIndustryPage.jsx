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
      { date: '2024. 9. 5', rate: '5.85%', payment: 557807, principal: 80910, interest: 476897, diff: 130231, margin: '1.69%' },
      { date: '2024. 10. 7', rate: '5.69%', payment: 547592, principal: 84122, interest: 463470, diff: 116804, margin: '1.53%' },
      { date: '2024. 11. 5', rate: '5.69%', payment: 547592, principal: 84521, interest: 463071, diff: 116405, margin: '1.53%' },
      { date: '2024. 12. 5', rate: '5.69%', payment: 547592, principal: 84922, interest: 462670, diff: 116004, margin: '1.53%' },
      { date: '2025. 1. 6', rate: '5.69%', payment: 547592, principal: 85325, interest: 462267, diff: 115601, margin: '1.53%' },
      { date: '2025. 2. 5', rate: '5.69%', payment: 547592, principal: 85729, interest: 461863, diff: 115197, margin: '1.53%' },
      { date: '2025. 3. 5', rate: '5.69%', payment: 547592, principal: 86136, interest: 461456, diff: 114790, margin: '1.53%' },
      { date: '2025. 4. 7', rate: '5.69%', payment: 547592, principal: 86544, interest: 461048, diff: 114382, margin: '1.53%' },
      { date: '2025. 5. 7', rate: '5.79%', payment: 547632, principal: 86995, interest: 460637, diff: 113971, margin: '1.63%' },
      { date: '2025. 6. 5', rate: '5.69%', payment: 553886, principal: 85573, interest: 468313, diff: 121647, margin: '1.53%' },
      { date: '2025. 7. 7', rate: '5.69%', payment: 547602, principal: 87783, interest: 459819, diff: 113153, margin: '1.53%' },
      { date: '2025. 8. 5', rate: '5.69%', payment: 547602, principal: 88199, interest: 459403, diff: 112737, margin: '1.53%' },
      { date: '2025. 9. 5', rate: '5.13%', payment: 547602, principal: 88617, interest: 458985, diff: 112319, margin: '0.97%', condition: '누적: 5,543,002원' },
      { date: '2025. 10. 6', rate: '5.23%', payment: 513167, principal: 99733, interest: 413434, diff: 66768, margin: '1.07%' },
      { date: '2025. 11. 5', rate: '5.23%', payment: 519232, principal: 98174, interest: 421058, diff: 74392, margin: '1.07%' },
      { date: '2025. 12. 5', rate: '5.13%', payment: 519232, principal: 98602, interest: 420630, diff: 73964, margin: '0.97%' },
      { date: '2026. 1. 5', rate: '5.13%', payment: 513188, principal: 101022, interest: 412166, diff: 65500, margin: '0.97%' },
      { date: '2026. 2. 5', rate: '5.13%', payment: 513188, principal: 101454, interest: 411734, diff: 65068, margin: '0.97%' },
      { date: '2026. 3. 5', rate: '5.13%', payment: 513188, principal: 101888, interest: 411300, diff: 64634, margin: '0.97%' },
      { date: '2026. 4. 5', rate: '5.13%', payment: 513188, principal: 102323, interest: 410865, diff: 64199, margin: '0.97%' },
      { date: '2026. 5. 5', rate: '5.13%', payment: 513188, principal: 102761, interest: 410427, diff: 63761, margin: '0.97%' },
      { date: '2026. 6. 5', rate: '5.13%', payment: 513188, principal: 103200, interest: 409988, diff: 63322, margin: '0.97%' },
      { date: '2026. 7. 5', rate: '5.13%', payment: 513188, principal: 103641, interest: 409547, diff: 62881, margin: '0.97%' },
      { date: '2026. 8. 5', rate: '5.13%', payment: 513188, principal: 103641, interest: 409547, diff: 62881, margin: '0.97%' },
      { date: '2026. 9. 7', rate: '5.13%', payment: 513188, principal: 103641, interest: 409547, diff: 62881, margin: '0.97%' }
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
      { date: '2024. 8. 13', rate: '5.63%', payment: 1297053, extra: 147053 },
      { date: '2024. 9. 13', rate: '5.63%', payment: 1297053, extra: 147053 },
      { date: '2024. 10. 14', rate: '5.39%', payment: 1201704, extra: 51704, condition: '기준: 3.42%, 가산: 1.97%' },
      { date: '2024. 11. 13', rate: '5.39%', payment: 1241761, extra: 91761 },
      { date: '2024. 12. 13', rate: '5.39%', payment: 1201704, extra: 51704 },
      { date: '2025. 1. 13', rate: '5.39%', payment: 1243077, extra: 93077 },
      { date: '2025. 2. 13', rate: '5.39%', payment: 1245163, extra: 95163 },
      { date: '2025. 3. 13', rate: '5.39%', payment: 1124664, extra: -25336 },
      { date: '2025. 4. 14', rate: '5.05%', payment: 1166619, extra: 16619, condition: '기준: 3.08%, 가산: 1.97%' },
      { date: '2025. 5. 13', rate: '5.05%', payment: 1128986, extra: -21014 },
      { date: '2025. 6. 13', rate: '5.05%', payment: 1166619, extra: -33381 },
      { date: '2025. 7. 14', rate: '5.05%', payment: 1128986, extra: -71014 },
      { date: '2025. 8. 13', rate: '5.05%', payment: 1166619, extra: -33381 },
      { date: '2025. 9. 13', rate: '5.05%', payment: 1166619, extra: -33381 },
      { date: '2025. 10. 13', rate: '4.14%', payment: 925545, extra: -274455, condition: '기준: 2.54%, 가산: 1.6%' },
      { date: '2025. 11. 13', rate: '4.14%', payment: 956396, extra: -243604 },
      { date: '2025. 12. 15', rate: '4.14%', payment: 925545, extra: -274455 },
      { date: '2026. 1. 13', rate: '4.14%', payment: 956396, extra: -243604 },
      { date: '2026. 2. 13', rate: '4.14%', payment: 956396, extra: -243604 },
      { date: '2026. 3. 13', rate: '4.45%', payment: 863842, extra: -336158, condition: '기준: 2.85%, 가산: 1.6%' },
      { date: '2026. 4. 13', rate: '4.45%', payment: 1028010, extra: -171990 },
      { date: '2026. 5. 13', rate: '4.45%', payment: 994849, extra: -205151 },
      { date: '2026. 6. 15', rate: '4.45%', payment: 1028010, extra: -171990 },
      { date: '2026. 7. 15', rate: '4.45%', payment: 994849, extra: -205151 },
      { date: '2026. 8. 13', rate: '4.45%', payment: 1028010, extra: -171990 }
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
  const [loanSubTab, setLoanSubTab] = useState('kb'); // 'kb' | 'nh' | 'all'

  // 데이터 상태 (localStorage 연동 & 구버전 시 신규 48개 데이터 자동 마이그레이션)
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('asset_knowledge_industry');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.investment && parsed.loans && parsed.rent) {
          // KB / NH 대출 데이터가 24개 이하인 구버전 저장 데이터인 경우 최신 INITIAL_DATA로 업그레이드
          if (parsed.loans.kb && parsed.loans.kb.length <= 24) {
            parsed.loans.kb = INITIAL_DATA.loans.kb;
          }
          if (parsed.loans.nh && parsed.loans.nh.length <= 24) {
            parsed.loans.nh = INITIAL_DATA.loans.nh;
          }
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_DATA;
  });

  // 데이터 초기화 헬퍼
  const handleResetData = () => {
    if (window.confirm('모든 데이터를 최신 원본 데이터로 리셋하시겠습니까?')) {
      setData(INITIAL_DATA);
      localStorage.setItem('asset_knowledge_industry', JSON.stringify(INITIAL_DATA));
      showToast('최신 원본 데이터로 리셋되었습니다.', 'info');
    }
  };

  // 대출상환 편집 모달 상태
  const [loanModal, setLoanModal] = useState({
    open: false,
    bank: 'kb', // 'kb' | 'nh'
    editIndex: null,
    formData: {
      date: '',
      rate: '',
      payment: '',
      principal: '',
      interest: '',
      extra: '',
      diff: '',
      margin: '',
      condition: ''
    }
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

  // --- 탭 1: 투자 비용 계산 ---
  const ca520Sum = data.investment.interiorCA520.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const ca557Sum = data.investment.interiorCA557.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const interiorTotal = ca520Sum + ca557Sum;

  const [loanYearFilter, setLoanYearFilter] = useState('2026'); // 기본 당해연도(2026) 필터링

  // --- 탭 2: 대출 상환 연도 필터링 및 자동 계산 ---
  const filteredKbLoans = data.loans.kb.filter(item => loanYearFilter === 'ALL' || (item.date && item.date.startsWith(loanYearFilter)));
  const filteredNhLoans = data.loans.nh.filter(item => loanYearFilter === 'ALL' || (item.date && item.date.startsWith(loanYearFilter)));

  const kbPaymentTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const kbPrincipalTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.principal) || 0), 0);
  const kbInterestTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.interest) || 0), 0);

  const nhPaymentTotal = filteredNhLoans.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const nhExtraTotal = filteredNhLoans.reduce((s, i) => s + (Number(i.extra) || 0), 0);

  // --- 대출상환 CRUD 헬퍼 ---
  const handleOpenLoanModal = (bank, index = null) => {
    if (index !== null) {
      const row = data.loans[bank][index];
      setLoanModal({
        open: true,
        bank,
        editIndex: index,
        formData: {
          date: row.date || '',
          rate: row.rate || '',
          payment: row.payment || '',
          principal: row.principal || '',
          interest: row.interest || '',
          extra: row.extra || '',
          diff: row.diff || 0,
          margin: row.margin || '',
          condition: row.condition || ''
        }
      });
    } else {
      const today = new Date();
      const dateStr = `${today.getFullYear()}. ${today.getMonth() + 1}. 15`;
      setLoanModal({
        open: true,
        bank,
        editIndex: null,
        formData: {
          date: dateStr,
          rate: bank === 'kb' ? '5.75%' : '5.63%',
          payment: bank === 'kb' ? 551403 : 1297053,
          principal: bank === 'kb' ? 80000 : 0,
          interest: bank === 'kb' ? 470403 : 1297053,
          extra: bank === 'nh' ? 147053 : 0,
          diff: 0,
          margin: '0.00%',
          condition: ''
        }
      });
    }
  };

  const handleSaveLoanRow = (e) => {
    e.preventDefault();
    const { bank, editIndex, formData } = loanModal;
    const payment = Number(formData.payment) || 0;
    const principal = Number(formData.principal) || 0;
    const interest = Number(formData.interest) || (payment - principal);
    const extra = Number(formData.extra) || 0;

    const newRow = {
      date: formData.date.trim(),
      rate: formData.rate.trim(),
      payment,
      principal,
      interest,
      extra,
      diff: Number(formData.diff) || 0,
      margin: formData.margin.trim(),
      condition: formData.condition.trim()
    };

    setData(prev => {
      const nextBankList = [...prev.loans[bank]];
      if (editIndex !== null) {
        nextBankList[editIndex] = newRow;
      } else {
        nextBankList.push(newRow);
      }
      return {
        ...prev,
        loans: {
          ...prev.loans,
          [bank]: nextBankList
        }
      };
    });

    setLoanModal(prev => ({ ...prev, open: false }));
    showToast(`${bank.toUpperCase()} 대출 상환 내역이 저장되었습니다.`, 'success');
  };

  const handleDeleteLoanRow = (bank, index) => {
    if (!window.confirm('해당 대출 상환 내역을 삭제하시겠습니까?')) return;
    setData(prev => ({
      ...prev,
      loans: {
        ...prev.loans,
        [bank]: prev.loans[bank].filter((_, i) => i !== index)
      }
    }));
    showToast('삭제되었습니다.', 'info');
  };

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
    <div style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
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
          justify-content: center;
          gap: 6px;
          white-space: nowrap;
        }
        @media (max-width: 600px) {
          .tab-btn {
            padding: 8px 14px;
            font-size: 0.82rem;
          }
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

        .table-responsive-container {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          margin-top: 0.5rem;
          border-radius: 8px;
        }
        .data-table {
          width: 100%;
          min-width: 720px;
          border-collapse: collapse;
          font-size: 0.88rem;
        }
        .data-table th, .data-table td {
          padding: 10px 12px;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          text-align: center;
          white-space: nowrap;
        }
        .data-table th {
          background: ${dark ? 'rgba(255,255,255,0.06)' : '#f8fafc'};
          color: var(--text-primary);
          font-weight: 800;
        }
        .data-table tr:hover {
          background: ${dark ? 'rgba(255,255,255,0.02)' : '#f1f5f9'};
        }

        .btn-action-icon {
          background: transparent;
          border: none;
          cursor: pointer;
          fontSize: 0.8rem;
          padding: 2px 4px;
          border-radius: 4px;
          transition: transform 0.1s ease;
        }
        .btn-action-icon:hover {
          transform: scale(1.15);
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
              🏢 지식산업센터
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
            <button
              onClick={handleResetData}
              title="최신 원본 데이터로 초기화"
              style={{
                padding: '10px 14px',
                borderRadius: '99px',
                border: '1px solid var(--border)',
                background: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              🔄 초기화
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
      {/* 탭 2: 대출 상환 관리 (서브 탭 적용으로 100% Full Width 시원한 화면 구성 & 편집 기능) */}
      {/* ========================================================================================= */}
      {activeTab === 'loans' && (
        <div>
          {/* 대출 상환 상단 서브 탭 스위처 & 연도 필터 & 추가 버튼 */}
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* 은행 서브 탭 (모바일에서도 1줄 슬림 정렬) */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('kb')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '99px',
                    border: `1px solid ${loanSubTab === 'kb' ? '#3b82f6' : (dark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
                    background: loanSubTab === 'kb' ? (dark ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff') : (dark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                    color: loanSubTab === 'kb' ? (dark ? '#60a5fa' : '#1d4ed8') : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏦 KB
                </button>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('nh')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '99px',
                    border: `1px solid ${loanSubTab === 'nh' ? '#a855f7' : (dark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
                    background: loanSubTab === 'nh' ? (dark ? 'rgba(168, 85, 247, 0.25)' : '#f3e8ff') : (dark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                    color: loanSubTab === 'nh' ? (dark ? '#c084fc' : '#7e22ce') : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏦 NH
                </button>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('all')}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '99px',
                    border: `1px solid ${loanSubTab === 'all' ? '#10b981' : (dark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
                    background: loanSubTab === 'all' ? (dark ? 'rgba(16, 185, 129, 0.25)' : '#ecfdf5') : (dark ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                    color: loanSubTab === 'all' ? (dark ? '#34d399' : '#047857') : 'var(--text-muted)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📊 모두보기
                </button>
              </div>

              {/* 연도별 조회 필터 셀렉터 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>📅 조회 연도:</span>
                <select
                  value={loanYearFilter}
                  onChange={e => setLoanYearFilter(e.target.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">전체 연도</option>
                  <option value="2022">2022년</option>
                  <option value="2023">2023년</option>
                  <option value="2024">2024년</option>
                  <option value="2025">2025년</option>
                  <option value="2026">2026년</option>
                </select>
              </div>
            </div>

            {/* 신규 납부 행 추가 버튼 */}
            {loanSubTab !== 'all' && (
              <button
                type="button"
                onClick={() => handleOpenLoanModal(loanSubTab)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: loanSubTab === 'kb' ? '#2563eb' : '#a855f7',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                + {loanSubTab === 'kb' ? 'KB' : 'NH'} 상환 내역 등록/추가
              </button>
            )}
          </div>

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

          {/* 1. KB (생활안정) 대출 - 넓은 화면 뷰 (loanSubTab === 'kb') */}
          {loanSubTab === 'kb' && (
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>
                    🏦 KB 상환 내역 ({filteredKbLoans.length}건)
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    금리 4.16% ~ 5.85% 변동 수치 및 원금/이자/이자차액 상세 관리
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLoanModal('kb')}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + KB 납부 내역 추가
                </button>
              </div>

              <div className="table-responsive-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>순번</th>
                      <th>연월</th>
                      <th>금리</th>
                      <th>원리금(납부액)</th>
                      <th>원금</th>
                      <th>이자</th>
                      <th>최초기준 이자차액</th>
                      <th>우대금리 조건</th>
                      <th>편집</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKbLoans.map((row, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 800 }}>{row.date}</td>
                        <td style={{ color: '#2563eb', fontWeight: 800 }}>{row.rate}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: '#1e40af' }}>{formatMoney(row.payment)}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(row.principal)}</td>
                        <td style={{ textAlign: 'right' }}>{formatMoney(row.interest)}</td>
                        <td style={{ textAlign: 'right', color: row.diff > 0 ? '#ef4444' : '#10b981', fontWeight: 800 }}>
                          {formatMoney(row.diff)}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.margin || row.condition || '-'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenLoanModal('kb', idx)}
                            title="수정"
                            className="btn-action-icon"
                            style={{ color: '#2563eb' }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLoanRow('kb', idx)}
                            title="삭제"
                            className="btn-action-icon"
                            style={{ color: '#ef4444' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff', fontWeight: 900, fontSize: '0.9rem' }}>
                      <td colSpan={3}>누적 합계</td>
                      <td style={{ textAlign: 'right', color: '#1e40af' }}>{formatMoney(kbPaymentTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbPrincipalTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbInterestTotal)}</td>
                      <td colSpan={3}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. NH (기업성장론) 대출 - 넓은 화면 뷰 (loanSubTab === 'nh') */}
          {loanSubTab === 'nh' && (
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#7e22ce', margin: 0 }}>
                    🏦 NH (기업성장론) ({filteredNhLoans.length}건)
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    월세 대비 추가부담금 및 2024.02.07 이자환급(-2,685,805원) 상세 관리
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLoanModal('nh')}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#a855f7', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + NH 납부 내역 추가
                </button>
              </div>

              <div className="table-responsive-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>순번</th>
                      <th>연월</th>
                      <th>금리</th>
                      <th>원리금(이자만)</th>
                      <th>월세대비 추가부담금</th>
                      <th>우대금리 / 특이사항 조건</th>
                      <th>편집</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNhLoans.map((row, idx) => (
                      <tr key={idx} style={{ background: row.isRefund ? (dark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7') : 'inherit' }}>
                        <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                        <td style={{ fontWeight: 800 }}>{row.date}</td>
                        <td style={{ color: row.isRefund ? '#d97706' : '#7e22ce', fontWeight: 800 }}>{row.rate}</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, color: row.isRefund ? '#d97706' : '#581c87' }}>
                          {formatMoney(row.payment)}
                        </td>
                        <td style={{ textAlign: 'right', color: '#ef4444', fontWeight: 800 }}>
                          {formatMoney(row.extra)}
                        </td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.condition || '-'}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleOpenLoanModal('nh', idx)}
                            title="수정"
                            className="btn-action-icon"
                            style={{ color: '#a855f7' }}
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLoanRow('nh', idx)}
                            title="삭제"
                            className="btn-action-icon"
                            style={{ color: '#ef4444' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.25)' : '#f3e8ff', fontWeight: 900, fontSize: '0.9rem' }}>
                      <td colSpan={3}>누적 합계</td>
                      <td style={{ textAlign: 'right', color: '#581c87' }}>{formatMoney(nhPaymentTotal)}</td>
                      <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatMoney(nhExtraTotal)}</td>
                      <td colSpan={2}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. 대출 2종 나란히 비교 뷰 (loanSubTab === 'all') */}
          {loanSubTab === 'all' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* KB 대출 */}
              <div className="section-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb', margin: 0 }}>
                    🏦 KB (생활안정) 상환 내역
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenLoanModal('kb')}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    + 추가
                  </button>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>연월</th>
                        <th>금리</th>
                        <th>원리금</th>
                        <th>이자</th>
                        <th>편집</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredKbLoans.map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{row.date}</td>
                          <td style={{ color: '#2563eb', fontWeight: 800 }}>{row.rate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(row.payment)}</td>
                          <td style={{ textAlign: 'right' }}>{formatMoney(row.interest)}</td>
                          <td>
                            <button type="button" onClick={() => handleOpenLoanModal('kb', idx)} className="btn-action-icon" style={{ color: '#2563eb' }}>✏️</button>
                            <button type="button" onClick={() => handleDeleteLoanRow('kb', idx)} className="btn-action-icon" style={{ color: '#ef4444' }}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NH 대출 */}
              <div className="section-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#7e22ce', margin: 0 }}>
                    🏦 NH (기업성장론) 상환 내역
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenLoanModal('nh')}
                    style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', border: 'none', background: '#a855f7', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    + 추가
                  </button>
                </div>
                <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>연월</th>
                        <th>금리</th>
                        <th>원리금</th>
                        <th>추가부담금</th>
                        <th>편집</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNhLoans.map((row, idx) => (
                        <tr key={idx} style={{ background: row.isRefund ? (dark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7') : 'inherit' }}>
                          <td style={{ fontWeight: 700 }}>{row.date}</td>
                          <td style={{ color: row.isRefund ? '#d97706' : '#7e22ce', fontWeight: 800 }}>{row.rate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(row.payment)}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatMoney(row.extra)}</td>
                          <td>
                            <button type="button" onClick={() => handleOpenLoanModal('nh', idx)} className="btn-action-icon" style={{ color: '#a855f7' }}>✏️</button>
                            <button type="button" onClick={() => handleDeleteLoanRow('nh', idx)} className="btn-action-icon" style={{ color: '#ef4444' }}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
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

      {/* --- 대출 상환 내역 등록/수정 모달 --- */}
      {loanModal.open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 3000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setLoanModal(prev => ({ ...prev, open: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              background: dark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                {loanModal.bank === 'kb' ? '🏦 KB 생활안정 대출' : '🏦 NH 기업성장론 대출'} {loanModal.editIndex !== null ? '상환 내역 수정' : '신규 상환 내역 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setLoanModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLoanRow}>
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>상환 연월</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="예: 2024. 10. 15"
                    value={loanModal.formData.date}
                    onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, date: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 36px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  />
                  <input
                    type="date"
                    onChange={e => {
                      if (e.target.value) {
                        const [y, m, d] = e.target.value.split('-');
                        const formatted = `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}`;
                        setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, date: formatted } }));
                      }
                    }}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      width: '28px',
                      height: '28px',
                      opacity: 0,
                      cursor: 'pointer',
                      zIndex: 2
                    }}
                    title="달력 선택"
                  />
                  <span style={{ position: 'absolute', right: '10px', pointerEvents: 'none', fontSize: '1rem', zIndex: 1 }}>
                    📅
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>금리 (예: 5.63%)</label>
                  <input
                    type="text"
                    value={loanModal.formData.rate}
                    onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, rate: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>원리금 납부액 (원)</label>
                  <input
                    type="number"
                    value={loanModal.formData.payment}
                    onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, payment: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              {loanModal.bank === 'kb' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>원금 (원)</label>
                    <input
                      type="number"
                      value={loanModal.formData.principal}
                      onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, principal: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>이자 (원)</label>
                    <input
                      type="number"
                      value={loanModal.formData.interest}
                      onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, interest: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>월세 대비 추가부담금 (원)</label>
                  <input
                    type="number"
                    value={loanModal.formData.extra}
                    onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, extra: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>우대금리 / 특이사항 조건</label>
                <input
                  type="text"
                  placeholder="예: 기준: 3.66%, 가산: 1.97%"
                  value={loanModal.formData.condition}
                  onChange={e => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, condition: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setLoanModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: loanModal.bank === 'kb' ? '#2563eb' : '#a855f7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
