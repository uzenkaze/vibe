import React, { useState, useEffect, useCallback, Fragment, useRef } from 'react';
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
        room: 'CA557',
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
  },
  timeline: {
    keyHandover: {
      title: '입주\n잔금완납\n키불출',
      date: '22.09.13',
      memo: '분양 잔금 완납 및 키 불출 (CA520, CA557)'
    },
    ca520: [
      { id: 't1', type: 'interior', title: '인테리어', detail: 'CA520', date: '22.10' },
      { id: 't2', type: 'appliance', title: '가전', detail: '냉장고/세탁기', date: '22.09' },
      { id: 't3', type: 'facility', title: '냉난방', detail: '', date: '23.01' },
      { id: 't4', type: 'rent', title: '임대', detail: '500/50', date: '23.01' },
      { id: 't5', type: 'rent', title: '임대', detail: '300/60', date: '24.02' },
      { id: 't6', type: 'rent', title: '임대', detail: '300/60', date: '24.02' }
    ],
    ca557: [
      { id: 't7', type: 'interior', title: '인테리어', detail: 'CA557', date: '22.10' },
      { id: 't8', type: 'appliance', title: '가전', detail: '냉장고/세탁기', date: '23.02' },
      { id: 't9', type: 'facility', title: '냉난방', detail: '', date: '23.02' },
      { id: 't10', type: 'rent', title: '임대', detail: '500/50', date: '23.02' },
      { id: 't11', type: 'rent', title: '임대', detail: '500/55', date: '24.02' },
      { id: 't12', type: 'rent', title: '임대', detail: '500/55', date: '24.02' }
    ]
  }
};

export default function KnowledgeIndustryPage() {
  const { dark, showToast } = useApp();
  const [activeTab, setActiveTab] = useState('investment'); // 'investment' | 'loans' | 'rent' | 'timeline'
  const [loanSubTab, setLoanSubTab] = useState('kb'); // 'kb' | 'nh' | 'all'
  const timelineScrollRef = useRef(null);

  const handleScrollTimeline = (offset) => {
    if (timelineScrollRef.current) {
      timelineScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleTimelineWheel = (e) => {
    if (timelineScrollRef.current) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        timelineScrollRef.current.scrollLeft += e.deltaY;
      }
    }
  };

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
          if (!parsed.timeline) {
            parsed.timeline = INITIAL_DATA.timeline;
          }
          return parsed;
        }
      }
    } catch (e) {}
    return INITIAL_DATA;
  });



  const [rentYearFilter, setRentYearFilter] = useState('2026'); // 기본 당해연도(2026) 필터링

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

  // 월세 입금 내역 등록/수정 모달 상태
  const [rentModal, setRentModal] = useState({
    open: false,
    contractId: '',
    paymentId: null, // null: 신규, string: 수정
    formData: {
      date: '',
      actualDate: '',
      amount: '600,000',
      isPaid: true,
      note: ''
    }
  });

  // 계약 정보 등록/수정 모달 상태
  const [contractModal, setContractModal] = useState({
    open: false,
    contractId: null, // null: 신규, string: 수정
    formData: {
      room: 'CA520',
      tenant: '',
      contact: '',
      contractDate: '',
      status: '계약중',
      terms: '500/60',
      deposit: '5,000,000',
      rent: '600,000',
      extendRequest: '',
      extendStatus: '',
      note: '',
      memo: ''
    }
  });

  // 인테리어 비용 모달 상태
  const [interiorModal, setInteriorModal] = useState({
    open: false,
    unit: 'interiorCA520',
    editId: null,
    formData: {
      date: '',
      item: '',
      detail: '',
      amount: ''
    }
  });

  // 투자 상세내역 모달 상태
  const [investDetailModal, setInvestDetailModal] = useState({
    open: false,
    editId: null,
    formData: {
      category: '',
      target: '',
      note: '',
      amount: ''
    }
  });

  // 호실별 공급가 및 매각 회수 분석 모달 상태
  const [breakEvenModal, setBreakEvenModal] = useState({
    open: false,
    editId: null,
    formData: {
      unit: '',
      supplyPrice: '',
      diff: ''
    }
  });

  // 전체 투자 비용 요약 모달 상태
  const [summaryModal, setSummaryModal] = useState({
    open: false,
    formData: {
      deposit: '',
      facility: '',
      taxInterest: '',
      totalInvestment: ''
    }
  });

  // 연도별 흐름도 모달 상태
  const [timelineModal, setTimelineModal] = useState({
    open: false,
    unit: 'ca520', // 'ca520' | 'ca557' | 'keyHandover'
    editId: null,
    formData: {
      type: 'interior', // 'interior' | 'appliance' | 'facility' | 'rent'
      title: '',
      detail: '',
      date: '',
      memo: ''
    }
  });

  // ESC 키 클릭 시 열려있는 모달창 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        setLoanModal(prev => prev.open ? { ...prev, open: false } : prev);
        setRentModal(prev => prev.open ? { ...prev, open: false } : prev);
        setContractModal(prev => prev.open ? { ...prev, open: false } : prev);
        setInteriorModal(prev => prev.open ? { ...prev, open: false } : prev);
        setInvestDetailModal(prev => prev.open ? { ...prev, open: false } : prev);
        setBreakEvenModal(prev => prev.open ? { ...prev, open: false } : prev);
        setSummaryModal(prev => prev.open ? { ...prev, open: false } : prev);
        setTimelineModal(prev => prev.open ? { ...prev, open: false } : prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // GitHub 데이터 자동 동기화 헬퍼
  const syncKnowledgeIndustryWithGit = useCallback(async (targetData, isExplicit = false) => {
    try {
      const { getGithubConfig, syncWithGitHub } = await import('../../utils/github');
      const ghConfig = getGithubConfig();
      if (ghConfig.token && ghConfig.repo) {
        if (isExplicit && showToast) {
          showToast('☁️ GitHub 서버로 동기화 업로드 중...', 'info');
        }
        const success = await syncWithGitHub('upload', 'asset_knowledge_industry', JSON.stringify(targetData));
        if (isExplicit) {
          if (success) {
            if (showToast) showToast('🔑 GitHub 서버 동기화 저장 완료!', 'success', true);
          } else {
            if (showToast) showToast('⚠️ 로컬 저장 완료 (GitHub 동기화 확인 필요)', 'warning');
          }
        }
      } else if (isExplicit) {
        if (showToast) showToast('⚠️ GitHub 토큰이 설정되지 않아 로컬 브라우저에만 저장되었습니다.', 'warning');
      }
    } catch (err) {
      console.warn('[KnowledgeIndustryPage] Git sync error:', err);
    }
  }, [showToast]);

  // 초기 마운트 시 서버(GitHub) 최신 데이터 우선 조회 및 동기화 (서버가 단일 진실 원천)
  useEffect(() => {
    async function loadInitialData() {
      // 1. GitHub API 연동 설정이 있는 경우: 서버 데이터 기준으로 최신화
      try {
        const { getGithubConfig, syncWithGitHub } = await import('../../utils/github');
        const ghConfig = getGithubConfig();
        if (ghConfig.token && ghConfig.repo) {
          const remoteData = await syncWithGitHub('download', 'asset_knowledge_industry');
          if (remoteData && (remoteData.investment || remoteData.loans || remoteData.rent)) {
            setData(remoteData);
            localStorage.setItem('asset_knowledge_industry', JSON.stringify(remoteData));
            return;
          }
        }
      } catch (e) {
        console.warn('[KnowledgeIndustryPage] Server fetch failed, falling back to local', e);
      }

      // 2. 오프라인 또는 GitHub 미설정 시: localStorage 보존 데이터 로드
      const saved = localStorage.getItem('asset_knowledge_industry');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.investment || parsed.loans || parsed.rent)) {
            setData(parsed);
            return;
          }
        } catch (e) {}
      }

      // 3. GitHub 및 localStorage 둘 다 없는 경우: 기본 정적 JSON 로드
      try {
        const res = await fetch('./data/asset_knowledge_industry.json');
        if (res.ok) {
          const fetched = await res.json();
          if (fetched && (fetched.investment || fetched.loans || fetched.rent)) {
            setData(fetched);
            localStorage.setItem('asset_knowledge_industry', JSON.stringify(fetched));
          }
        }
      } catch (e) {}
    }
    loadInitialData();
  }, []);

  // 서버 데이터 불러오기(GitHubModal) 완료 시 또는 타 탭/창 스토리지 변경 시 즉시 상태 동기화
  useEffect(() => {
    const handleReload = () => {
      try {
        const saved = localStorage.getItem('asset_knowledge_industry');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.investment || parsed.loans || parsed.rent)) {
            setData(parsed);
          }
        }
      } catch (err) {
        console.warn('[KnowledgeIndustryPage] Storage sync error:', err);
      }
    };
    window.addEventListener('app-data-reloaded', handleReload);
    window.addEventListener('storage', handleReload);
    return () => {
      window.removeEventListener('app-data-reloaded', handleReload);
      window.removeEventListener('storage', handleReload);
    };
  }, []);

  // 데이터 변경 시 로컬스토리지 저장 (상단 저장 버튼 클릭 시 GitHub 일괄 동기화)
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
  const ca520Sum = (data.investment?.interiorCA520 || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const ca557Sum = (data.investment?.interiorCA557 || []).reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const interiorTotal = ca520Sum + ca557Sum;

  const summaryData = data.investment?.summary || INITIAL_DATA.investment.summary;
  const facilityAndTaxSum = (Number(summaryData.facility) || 0) + (Number(summaryData.taxInterest) || 0);

  const [loanYearFilter, setLoanYearFilter] = useState('2026'); // 기본 당해연도(2026) 필터링

  // --- 탭 2: 대출 상환 연도 필터링 및 자동 계산 ---
  const filteredKbLoans = data.loans.kb.filter(item => loanYearFilter === 'ALL' || (item.date && item.date.startsWith(loanYearFilter)));
  const filteredNhLoans = data.loans.nh.filter(item => loanYearFilter === 'ALL' || (item.date && item.date.startsWith(loanYearFilter)));

  const kbPaymentTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const kbPrincipalTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.principal) || 0), 0);
  const kbInterestTotal = filteredKbLoans.reduce((s, i) => s + (Number(i.interest) || 0), 0);

  const nhPaymentTotal = filteredNhLoans.reduce((s, i) => s + (Number(i.payment) || 0), 0);
  const nhExtraTotal = filteredNhLoans.reduce((s, i) => s + (Number(i.extra) || 0), 0);

  // --- 콤마 포맷팅 스마트 헬퍼 ---
  const formatComma = (val) => {
    if (val === null || val === undefined || val === '') return '';
    const str = String(val).replace(/,/g, '').trim();
    if (isNaN(str) || str === '') return str;
    return Number(str).toLocaleString('ko-KR');
  };

  const unformatComma = (val) => {
    if (val === null || val === undefined || val === '') return '';
    return String(val).replace(/,/g, '').trim();
  };

  // --- 대출상환 CRUD 헬퍼 ---
  const handleOpenLoanModal = (bank, index = null) => {
    if (index !== null) {
      const row = data.loans[bank][index];
      const cleanRateStr = String(row.rate || '').replace('%', '').trim();
      setLoanModal({
        open: true,
        bank,
        editIndex: index,
        formData: {
          date: row.date || '',
          rate: cleanRateStr,
          payment: formatComma(row.payment),
          principal: formatComma(row.principal),
          interest: formatComma(row.interest),
          extra: formatComma(row.extra),
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
          rate: '',
          payment: '',
          principal: '',
          interest: '',
          extra: '',
          diff: 0,
          margin: '',
          condition: ''
        }
      });
    }
  };

  const handleSaveLoanRow = (e) => {
    e.preventDefault();
    const { bank, editIndex, formData } = loanModal;
    const payment = Number(unformatComma(formData.payment)) || 0;
    const principal = Number(unformatComma(formData.principal)) || 0;
    const interest = Number(unformatComma(formData.interest)) || (payment - principal);
    const extra = Number(unformatComma(formData.extra)) || 0;

    const cleanRate = unformatComma(formData.rate);
    const rate = cleanRate ? (cleanRate.endsWith('%') ? cleanRate : `${cleanRate}%`) : '';

    const newRow = {
      date: formData.date.trim(),
      rate,
      payment,
      principal,
      interest,
      extra,
      diff: Number(formData.diff) || 0,
      margin: formData.margin ? formData.margin.trim() : '',
      condition: formData.condition ? formData.condition.trim() : ''
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
    const targetCId = String(contractId);
    setData(prev => {
      const nextRent = { ...prev.rent };
      nextRent.contracts = nextRent.contracts.map(c => {
        if (String(c.id) === targetCId) {
          const nextPayments = c.payments.map(p => {
            if (String(p.id) === String(paymentId)) {
              const nextPaid = !p.isPaid;
              return { ...p, isPaid: nextPaid, amount: nextPaid ? (c.rent || 600000) : 0 };
            }
            return p;
          });
          return { ...c, payments: nextPayments };
        }
        return c;
      });
      return { ...prev, rent: nextRent };
    });
    showToast('임대 입금 상태가 업데이트되었습니다.', 'success');
  };

  // --- 탭 3: 월세 입금 내역 CRUD 헬퍼 ---
  const handleOpenRentModal = (contractId = null, payment = null) => {
    let targetContract = null;
    if (contractId) {
      targetContract = data.rent.contracts.find(c => String(c.id) === String(contractId));
    }
    if (!targetContract) {
      targetContract = data.rent.contracts[0];
    }
    const defaultAmount = targetContract ? targetContract.rent : 600000;
    const finalContractId = targetContract ? String(targetContract.id) : (data.rent.contracts[0]?.id ? String(data.rent.contracts[0].id) : 'c1');
    
    if (payment) {
      setRentModal({
        open: true,
        contractId: finalContractId,
        paymentId: payment.id,
        formData: {
          date: payment.date || '',
          actualDate: payment.actualDate || '',
          amount: formatComma(payment.amount),
          isPaid: payment.isPaid !== false,
          note: payment.note || ''
        }
      });
    } else {
      const currentYear = rentYearFilter === 'ALL' ? '2026' : rentYearFilter;
      const today = new Date();
      const currentMonth = today.getMonth() + 1;
      const defaultDateStr = `${currentYear}. ${currentMonth}. 19`;
      setRentModal({
        open: true,
        contractId: finalContractId,
        paymentId: null,
        formData: {
          date: defaultDateStr,
          actualDate: '',
          amount: formatComma(defaultAmount),
          isPaid: true,
          note: ''
        }
      });
    }
  };

  const handleSaveRentPayment = (e) => {
    e.preventDefault();
    const { contractId, paymentId, formData } = rentModal;
    const targetCId = String(contractId);
    const amount = Number(unformatComma(formData.amount)) || 0;
    const parsedDate = formData.date.trim();
    const parsedActualDate = formData.actualDate.trim();
    const parsedNote = formData.note.trim();

    setData(prev => {
      const nextRent = { ...prev.rent };
      
      if (paymentId) {
        // 기존 입금 내역 수정 (만약 다른 계약으로 호실이 변경된 경우 기존 계약에서 제거 후 대상 계약으로 이동)
        nextRent.contracts = nextRent.contracts.map(c => ({
          ...c,
          payments: c.payments.filter(p => String(p.id) !== String(paymentId))
        }));

        nextRent.contracts = nextRent.contracts.map(c => {
          if (String(c.id) === targetCId) {
            const nextPayments = [
              ...c.payments,
              {
                id: paymentId,
                date: parsedDate,
                actualDate: parsedActualDate,
                amount,
                isPaid: formData.isPaid,
                note: parsedNote
              }
            ];
            nextPayments.sort((a, b) => {
              const parseDate = s => {
                if (!s) return 0;
                const parts = s.replace(/[^0-9.]/g, '').split('.').filter(Boolean).map(Number);
                return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
              };
              return parseDate(a.date) - parseDate(b.date);
            });
            return { ...c, payments: nextPayments };
          }
          return c;
        });
      } else {
        // 신규 월세 입금 등록: 선택된 contractId 계약에 정확히 추가
        nextRent.contracts = nextRent.contracts.map(c => {
          if (String(c.id) === targetCId) {
            const nextPayments = [
              ...c.payments,
              {
                id: `p-${Date.now()}`,
                date: parsedDate,
                actualDate: parsedActualDate,
                amount,
                isPaid: formData.isPaid,
                note: parsedNote
              }
            ];
            nextPayments.sort((a, b) => {
              const parseDate = s => {
                if (!s) return 0;
                const parts = s.replace(/[^0-9.]/g, '').split('.').filter(Boolean).map(Number);
                return (parts[0] || 0) * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
              };
              return parseDate(a.date) - parseDate(b.date);
            });
            return { ...c, payments: nextPayments };
          }
          return c;
        });
      }
      return { ...prev, rent: nextRent };
    });

    setRentModal(prev => ({ ...prev, open: false }));
    showToast('임대 입금 내역이 저장되었습니다.', 'success');
  };

  const handleDeleteRentPayment = (contractId, paymentId) => {
    if (!window.confirm('해당 임대 입금 내역을 삭제하시겠습니까?')) return;
    const targetCId = String(contractId);
    setData(prev => {
      const nextRent = { ...prev.rent };
      nextRent.contracts = nextRent.contracts.map(c => {
        if (String(c.id) === targetCId) {
          return { ...c, payments: c.payments.filter(p => String(p.id) !== String(paymentId)) };
        }
        return c;
      });
      return { ...prev, rent: nextRent };
    });
    showToast('삭제되었습니다.', 'info');
  };

  // --- 계약/호실 정보 CRUD 헬퍼 ---
  const handleOpenContractModal = (contract = null) => {
    if (contract) {
      setContractModal({
        open: true,
        contractId: contract.id,
        formData: {
          room: contract.room || '',
          tenant: contract.tenant || '',
          contact: contract.contact || '',
          contractDate: contract.contractDate || '',
          status: contract.status || '계약중',
          terms: contract.terms || '500/60',
          deposit: formatComma(contract.deposit),
          rent: formatComma(contract.rent),
          extendRequest: contract.extendRequest || '',
          extendStatus: contract.extendStatus || '',
          note: contract.note || '',
          memo: contract.memo || ''
        }
      });
    } else {
      const currentYear = rentYearFilter === 'ALL' ? '2026' : rentYearFilter;
      setContractModal({
        open: true,
        contractId: null,
        formData: {
          room: 'CA520',
          tenant: '',
          contact: '',
          contractDate: `${currentYear}. 1. 1`,
          status: '계약중',
          terms: '500/60',
          deposit: '5,000,000',
          rent: '600,000',
          extendRequest: '',
          extendStatus: '',
          note: '',
          memo: ''
        }
      });
    }
  };

  const handleSaveContract = (e) => {
    e.preventDefault();
    const { contractId, formData } = contractModal;
    const deposit = Number(unformatComma(formData.deposit)) || 0;
    const rent = Number(unformatComma(formData.rent)) || 0;

    setData(prev => {
      const nextRent = { ...prev.rent };
      if (contractId) {
        // 수정
        nextRent.contracts = nextRent.contracts.map(c => {
          if (String(c.id) === String(contractId)) {
            return {
              ...c,
              room: formData.room.trim(),
              tenant: formData.tenant.trim(),
              contact: formData.contact.trim(),
              contractDate: formData.contractDate.trim(),
              status: formData.status.trim(),
              terms: formData.terms.trim(),
              deposit,
              rent,
              extendRequest: formData.extendRequest.trim(),
              extendStatus: formData.extendStatus.trim(),
              note: formData.note.trim(),
              memo: formData.memo.trim()
            };
          }
          return c;
        });
      } else {
        // 신규 계약 호실 추가
        const newContract = {
          id: `c-${Date.now()}`,
          room: formData.room.trim(),
          tenant: formData.tenant.trim(),
          contact: formData.contact.trim(),
          contractDate: formData.contractDate.trim(),
          status: formData.status.trim(),
          terms: formData.terms.trim(),
          deposit,
          rent,
          extendRequest: formData.extendRequest.trim(),
          extendStatus: formData.extendStatus.trim(),
          note: formData.note.trim(),
          memo: formData.memo.trim(),
          payments: []
        };
        nextRent.contracts = [...nextRent.contracts, newContract];
      }
      const nextData = { ...prev, rent: nextRent };
      try {
        localStorage.setItem('asset_knowledge_industry', JSON.stringify(nextData));
      } catch (err) {}
      return nextData;
    });

    setContractModal(prev => ({ ...prev, open: false }));
    showToast('계약 정보가 저장되었습니다.', 'success');
  };

  const handleDeleteContract = (contractId) => {
    if (!window.confirm('해당 계약/호실 및 포함된 모든 임대 입금 내역을 삭제하시겠습니까?')) return;
    setData(prev => ({
      ...prev,
      rent: {
        ...prev.rent,
        contracts: prev.rent.contracts.filter(c => c.id !== contractId)
      }
    }));
    showToast('계약이 삭제되었습니다.', 'info');
  };

  // --- 투자 탭 CRUD 핸들러 ---
  // 1. 호실별 인테리어 비용 핸들러
  const handleOpenInteriorModal = (unit = 'interiorCA520', item = null) => {
    if (item) {
      setInteriorModal({
        open: true,
        unit,
        editId: item.id,
        formData: {
          date: item.date || '',
          item: item.item || '',
          detail: item.detail || '',
          amount: formatComma(item.amount)
        }
      });
    } else {
      setInteriorModal({
        open: true,
        unit,
        editId: null,
        formData: {
          date: new Date().toISOString().slice(0, 10),
          item: '',
          detail: '',
          amount: ''
        }
      });
    }
  };

  const handleSaveInterior = (e) => {
    e.preventDefault();
    const { unit, editId, formData } = interiorModal;
    const numAmount = Number(unformatComma(formData.amount)) || 0;
    const listKey = unit;

    setData(prev => {
      const prevList = prev.investment?.[listKey] || [];
      let nextList;
      if (editId) {
        nextList = prevList.map(i => i.id === editId ? { ...i, date: formData.date, item: formData.item, detail: formData.detail, amount: numAmount } : i);
      } else {
        nextList = [
          ...prevList,
          {
            id: String(Date.now()),
            date: formData.date,
            item: formData.item,
            detail: formData.detail,
            amount: numAmount
          }
        ];
      }
      return {
        ...prev,
        investment: {
          ...prev.investment,
          [listKey]: nextList
        }
      };
    });

    setInteriorModal(prev => ({ ...prev, open: false }));
    showToast(editId ? '인테리어 내역이 수정되었습니다.' : '인테리어 내역이 등록되었습니다.', 'success');
  };

  const handleDeleteInterior = (unit, itemId) => {
    if (!window.confirm('해당 인테리어 항목을 삭제하시겠습니까?')) return;
    setData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        [unit]: (prev.investment?.[unit] || []).filter(i => i.id !== itemId)
      }
    }));
    showToast('인테리어 내역이 삭제되었습니다.', 'info');
  };

  // 2. 투자 상세내역 핸들러
  const handleOpenInvestDetailModal = (item = null) => {
    if (item) {
      setInvestDetailModal({
        open: true,
        editId: item.id,
        formData: {
          category: item.category || '',
          target: item.target || '',
          note: item.note || '',
          amount: formatComma(item.amount)
        }
      });
    } else {
      setInvestDetailModal({
        open: true,
        editId: null,
        formData: {
          category: '',
          target: '',
          note: '',
          amount: ''
        }
      });
    }
  };

  const handleSaveInvestDetail = (e) => {
    e.preventDefault();
    const { editId, formData } = investDetailModal;
    const numAmount = Number(unformatComma(formData.amount)) || 0;

    setData(prev => {
      const prevList = prev.investment?.details || [];
      let nextList;
      if (editId) {
        nextList = prevList.map(i => i.id === editId ? { ...i, category: formData.category, target: formData.target, note: formData.note, amount: numAmount } : i);
      } else {
        nextList = [
          ...prevList,
          {
            id: 'd_' + Date.now(),
            category: formData.category,
            target: formData.target,
            note: formData.note,
            amount: numAmount
          }
        ];
      }
      return {
        ...prev,
        investment: {
          ...prev.investment,
          details: nextList
        }
      };
    });

    setInvestDetailModal(prev => ({ ...prev, open: false }));
    showToast(editId ? '투자 상세내역이 수정되었습니다.' : '투자 상세내역이 등록되었습니다.', 'success');
  };

  const handleDeleteInvestDetail = (itemId) => {
    if (!window.confirm('해당 투자 상세내역을 삭제하시겠습니까?')) return;
    setData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        details: (prev.investment?.details || []).filter(i => i.id !== itemId)
      }
    }));
    showToast('투자 상세내역이 삭제되었습니다.', 'info');
  };

  // 3. 호실별 공급가 & 매각 회수 분석 핸들러
  const handleOpenBreakEvenModal = (item = null) => {
    if (item) {
      setBreakEvenModal({
        open: true,
        editId: item.id,
        formData: {
          unit: item.unit || '',
          supplyPrice: formatComma(item.supplyPrice),
          diff: formatComma(item.diff)
        }
      });
    } else {
      setBreakEvenModal({
        open: true,
        editId: null,
        formData: {
          unit: '',
          supplyPrice: '',
          diff: ''
        }
      });
    }
  };

  const handleSaveBreakEven = (e) => {
    e.preventDefault();
    const { editId, formData } = breakEvenModal;
    const numSupplyPrice = Number(unformatComma(formData.supplyPrice)) || 0;
    const numDiff = Number(unformatComma(formData.diff)) || 0;

    setData(prev => {
      const prevList = prev.investment?.breakEven || [];
      let nextList;
      if (editId) {
        nextList = prevList.map(i => i.id === editId ? { ...i, unit: formData.unit, supplyPrice: numSupplyPrice, diff: numDiff } : i);
      } else {
        nextList = [
          ...prevList,
          {
            id: 'b_' + Date.now(),
            unit: formData.unit,
            supplyPrice: numSupplyPrice,
            diff: numDiff
          }
        ];
      }
      return {
        ...prev,
        investment: {
          ...prev.investment,
          breakEven: nextList
        }
      };
    });

    setBreakEvenModal(prev => ({ ...prev, open: false }));
    showToast(editId ? '공급가 분석 내역이 수정되었습니다.' : '공급가 분석 내역이 등록되었습니다.', 'success');
  };

  const handleDeleteBreakEven = (itemId) => {
    if (!window.confirm('해당 공급가 분석 내역을 삭제하시겠습니까?')) return;
    setData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        breakEven: (prev.investment?.breakEven || []).filter(i => i.id !== itemId)
      }
    }));
    showToast('공급가 분석 내역이 삭제되었습니다.', 'info');
  };

  // 4. 전체 투자 비용 요약 핸들러
  const handleOpenSummaryModal = () => {
    const s = data.investment?.summary || INITIAL_DATA.investment.summary;
    setSummaryModal({
      open: true,
      formData: {
        deposit: formatComma(s.deposit),
        facility: formatComma(s.facility),
        taxInterest: formatComma(s.taxInterest),
        totalInvestment: formatComma(s.totalInvestment)
      }
    });
  };

  const handleSaveSummary = (e) => {
    e.preventDefault();
    const numDeposit = Number(unformatComma(summaryModal.formData.deposit)) || 0;
    const numFacility = Number(unformatComma(summaryModal.formData.facility)) || 0;
    const numTaxInterest = Number(unformatComma(summaryModal.formData.taxInterest)) || 0;
    const numTotal = Number(unformatComma(summaryModal.formData.totalInvestment)) || 0;
    const numSumCost = numDeposit + numFacility + numTaxInterest;

    setData(prev => ({
      ...prev,
      investment: {
        ...prev.investment,
        summary: {
          deposit: numDeposit,
          facility: numFacility,
          taxInterest: numTaxInterest,
          sumCost: numSumCost,
          totalInvestment: numTotal
        }
      }
    }));

    setSummaryModal(prev => ({ ...prev, open: false }));
    showToast('전체 투자 비용 요약이 수정되었습니다.', 'success');
  };

  // 5. 연도별 흐름도 CRUD 핸들러
  const handleOpenTimelineModal = (unit = 'ca520', item = null) => {
    if (unit === 'keyHandover') {
      const keyInfo = data.timeline?.keyHandover || INITIAL_DATA.timeline.keyHandover;
      setTimelineModal({
        open: true,
        unit: 'keyHandover',
        editId: 'key',
        formData: {
          type: 'key',
          title: keyInfo.title || '입주\n잔금완납\n키불출',
          detail: keyInfo.memo || '',
          date: keyInfo.date || '22.09.13',
          memo: keyInfo.memo || ''
        }
      });
      return;
    }

    if (item) {
      setTimelineModal({
        open: true,
        unit,
        editId: item.id,
        formData: {
          type: item.type || 'interior',
          title: item.title || '',
          detail: item.detail || '',
          date: item.date || '',
          memo: item.memo || ''
        }
      });
    } else {
      setTimelineModal({
        open: true,
        unit,
        editId: null,
        formData: {
          type: 'rent',
          title: '임대',
          detail: '',
          date: '',
          memo: ''
        }
      });
    }
  };

  const handleSaveTimelineItem = (e) => {
    e.preventDefault();
    const { unit, editId, formData } = timelineModal;

    if (unit === 'keyHandover') {
      setData(prev => ({
        ...prev,
        timeline: {
          ...(prev.timeline || INITIAL_DATA.timeline),
          keyHandover: {
            title: formData.title,
            date: formData.date,
            memo: formData.detail || formData.memo
          }
        }
      }));
      setTimelineModal(prev => ({ ...prev, open: false }));
      showToast('키불출 정보가 수정되었습니다.', 'success');
      return;
    }

    setData(prev => {
      const currentTimeline = prev.timeline || INITIAL_DATA.timeline;
      const list = [...(currentTimeline[unit] || [])];
      if (editId) {
        const idx = list.findIndex(i => i.id === editId);
        if (idx >= 0) {
          list[idx] = {
            ...list[idx],
            type: formData.type,
            title: formData.title,
            detail: formData.detail,
            date: formData.date,
            memo: formData.memo
          };
        }
      } else {
        list.push({
          id: 't_' + Date.now(),
          type: formData.type,
          title: formData.title,
          detail: formData.detail,
          date: formData.date,
          memo: formData.memo
        });
      }
      return {
        ...prev,
        timeline: {
          ...currentTimeline,
          [unit]: list
        }
      };
    });

    setTimelineModal(prev => ({ ...prev, open: false }));
    showToast(editId ? '흐름도 단계가 수정되었습니다.' : '흐름도 단계가 추가되었습니다.', 'success');
  };

  const handleDeleteTimelineItem = (unit, itemId) => {
    if (!window.confirm('해당 흐름도 단계를 삭제하시겠습니까?')) return;
    setData(prev => {
      const currentTimeline = prev.timeline || INITIAL_DATA.timeline;
      return {
        ...prev,
        timeline: {
          ...currentTimeline,
          [unit]: (currentTimeline[unit] || []).filter(i => i.id !== itemId)
        }
      };
    });
    showToast('흐름도 단계가 삭제되었습니다.', 'info');
  };

  return (
    <div style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem', minWidth: 0, boxSizing: 'border-box' }}>
      <style>{`
        .section-card {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          box-sizing: border-box;
        }

        .tab-btn {
          padding: 8px 16px;
          border-radius: 99px;
          border: 1px solid transparent;
          font-size: 0.88rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          white-space: nowrap;
        }
        @media (max-width: 600px) {
          .tab-btn {
            padding: 6px 12px;
            font-size: 0.8rem;
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
          border-collapse: collapse;
          font-size: 1.12rem;
        }
        .data-table th, .data-table td {
          padding: 8px 12px;
          border: 1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'};
          text-align: center;
          white-space: nowrap;
          line-height: 1.35;
        }

        @media (max-width: 768px) {
          .section-card {
            padding: 1rem 0.65rem !important;
          }
          .data-table {
            width: 100% !important;
            min-width: 100% !important;
            font-size: 0.82rem !important;
          }
          .data-table th, .data-table td {
            padding: 6px 4px !important;
            font-size: 0.82rem !important;
            white-space: normal !important;
            word-break: keep-all;
          }
          .data-table th:last-child, .data-table td:last-child {
            width: 50px !important;
            min-width: 50px !important;
            padding: 6px 1px !important;
          }
          .btn-action-icon {
            font-size: 0.9rem !important;
            padding: 1px 2px !important;
          }
          .loan-compare-title-sub {
            display: none;
          }
        }

        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .summary-card-item {
          padding: 1.15rem 1.25rem;
          border-radius: 14px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
        .summary-card-title {
          font-size: 0.8rem;
          font-weight: 800;
          text-align: center;
          width: 100%;
        }
        .summary-card-value {
          font-size: 1.35rem;
          font-weight: 900;
          margin-top: 4px;
          text-align: center;
          width: 100%;
        }
        .summary-card-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 4px;
          text-align: center !important;
          width: 100% !important;
          display: block !important;
        }

        @media (max-width: 768px) {
          .summary-cards-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.5rem !important;
            margin-bottom: 1rem !important;
          }
          .summary-card-item {
            padding: 0.7rem 0.65rem !important;
            border-radius: 10px !important;
            text-align: center !important;
          }
          .summary-card-title {
            font-size: 0.7rem !important;
            text-align: center !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .summary-card-value {
            font-size: 1.05rem !important;
            margin-top: 2px !important;
            text-align: center !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .summary-card-sub {
            font-size: 0.62rem !important;
            margin-top: 2px !important;
            text-align: center !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
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
          font-size: 1.05rem;
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

        .ki-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 900px) {
          .ki-grid-2col {
            grid-template-columns: 1fr;
            gap: 1.25rem;
          }
        }

        /* 연도별 흐름도 스타일 */
        /* 연도별 흐름도 스타일 */
        .timeline-scroll-container {
          width: 100%;
          max-width: 100%;
          overflow-x: auto !important;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          padding: 1.25rem 0.25rem 1.5rem 0.25rem;
          scrollbar-width: thin;
          scrollbar-color: #a855f7 ${dark ? '#1e293b' : '#f1f5f9'};
        }
        .timeline-scroll-container::-webkit-scrollbar {
          height: 10px;
        }
        .timeline-scroll-container::-webkit-scrollbar-track {
          background: ${dark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'};
          border-radius: 8px;
        }
        .timeline-scroll-container::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #a855f7 0%, #6366f1 100%);
          border-radius: 8px;
        }
        .flow-diagram-table {
          border-collapse: separate;
          border-spacing: 0;
          width: max-content;
          min-width: max-content;
          margin: 0;
        }
        .flow-diagram-table td {
          padding: 6px 4px;
          vertical-align: middle;
          text-align: center;
        }
        .flow-box {
          display: inline-flex;
          flex-direction: column;
          border: 2px solid ${dark ? '#475569' : '#000000'};
          background: ${dark ? '#1e293b' : '#ffffff'};
          border-radius: 4px;
          width: 110px;
          min-width: 110px;
          text-align: center;
          position: relative;
          box-shadow: 0 4px 10px rgba(0,0,0,0.06);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          overflow: hidden;
        }
        .flow-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .flow-box-header {
          padding: 5px 3px;
          font-size: 0.88rem;
          font-weight: 900;
          border-bottom: 1.5px solid ${dark ? '#475569' : '#000000'};
        }
        .flow-box-header.prep {
          background: ${dark ? '#701a75' : '#fae8ff'};
          color: ${dark ? '#fdf4ff' : '#701a75'};
        }
        .flow-box-header.rent {
          background: ${dark ? '#0369a1' : '#e0f2fe'};
          color: ${dark ? '#f0f9ff' : '#0369a1'};
        }
        .flow-box-header.key {
          background: ${dark ? '#334155' : '#f1f5f9'};
          color: var(--text-primary);
        }
        .flow-box-body {
          padding: 6px 3px;
          min-height: 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 2px;
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-primary);
        }
        .flow-box-body .sub-date {
          font-size: 0.76rem;
          font-weight: 800;
          color: var(--text-muted);
        }
        .flow-arrow-cell {
          font-size: 1.25rem;
          font-weight: 900;
          color: ${dark ? '#94a3b8' : '#000000'};
          padding: 0 6px !important;
          user-select: none;
        }
        .flow-main-key-box {
          border: 2.5px solid ${dark ? '#64748b' : '#000000'};
          background: ${dark ? '#0f172a' : '#ffffff'};
          border-radius: 4px;
          padding: 10px 8px;
          width: 115px;
          min-width: 115px;
          text-align: center;
          font-size: 0.92rem;
          font-weight: 900;
          line-height: 1.35;
          color: var(--text-primary);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          cursor: pointer;
        }
        .flow-main-key-box:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(0,0,0,0.15);
        }
        .flow-box-actions {
          position: absolute;
          top: 2px;
          right: 2px;
          display: none;
          gap: 2px;
          background: rgba(0,0,0,0.6);
          border-radius: 4px;
          padding: 1px 3px;
        }
        .flow-box:hover .flow-box-actions {
          display: flex;
        }
        .flow-box-actions button {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 0.75rem;
          padding: 1px;
        }

        @media (max-width: 768px) {
          .flow-box {
            width: 86px !important;
            min-width: 86px !important;
          }
          .flow-box-header {
            font-size: 0.76rem !important;
            padding: 4px 2px !important;
          }
          .flow-box-body {
            font-size: 0.72rem !important;
            padding: 4px 2px !important;
            min-height: 38px !important;
          }
          .flow-box-body .sub-date {
            font-size: 0.68rem !important;
          }
          .flow-arrow-cell {
            font-size: 1rem !important;
            padding: 0 3px !important;
          }
          .flow-main-key-box {
            width: 88px !important;
            min-width: 88px !important;
            padding: 8px 4px !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      {/* 대시보드 헤더 */}
      <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.85rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              🏢 Knowledge Industry Center
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
              투자, 대출 원리금 상환 내역 및 임대 관리
            </p>
          </div>

          {/* 4개 탭 스위처 */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab('investment')}
              className={`tab-btn ${activeTab === 'investment' ? 'active' : 'inactive'}`}
            >
              💰 1. 투자
            </button>
            <button
              onClick={() => setActiveTab('loans')}
              className={`tab-btn ${activeTab === 'loans' ? 'active' : 'inactive'}`}
            >
              🏦 2. 대출
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`tab-btn ${activeTab === 'rent' ? 'active' : 'inactive'}`}
            >
              🚪 3. 임대
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : 'inactive'}`}
            >
              🗓️ 4. 흐름도
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
          <div className="summary-cards-grid">
            <div className="section-card summary-card-item" style={{ background: dark ? 'rgba(168, 85, 247, 0.12)' : '#faf5ff', border: '1px solid #c084fc', textAlign: 'center' }}>
              <div className="summary-card-title" style={{ color: dark ? '#c084fc' : '#7e22ce', textAlign: 'center', width: '100%' }}>총 분양가 (2개 호실)</div>
              <div className="summary-card-value" style={{ color: dark ? '#ffffff' : '#581c87', textAlign: 'center', width: '100%' }}>
                {formatMoney(326754100)}
              </div>
              <div className="summary-card-sub" style={{ textAlign: 'center', width: '100%', display: 'block' }}>CA520 + CA557 분양 총액</div>
            </div>

            <div className="section-card summary-card-item" style={{ background: dark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff', border: '1px solid #93c5fd', textAlign: 'center' }}>
              <div className="summary-card-title" style={{ color: dark ? '#60a5fa' : '#1d4ed8', textAlign: 'center', width: '100%' }}>전체 실 투자비용</div>
              <div className="summary-card-value" style={{ color: dark ? '#ffffff' : '#1e40af', textAlign: 'center', width: '100%' }}>
                {formatMoney(data.investment.summary.sumCost)}
              </div>
              <div className="summary-card-sub" style={{ textAlign: 'center', width: '100%', display: 'block' }}>계약금/잔금+시설비+이자</div>
            </div>

            <div className="section-card summary-card-item" style={{ background: dark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2', border: '1px solid #fca5a5', textAlign: 'center' }}>
              <div className="summary-card-title" style={{ color: dark ? '#f87171' : '#b91c1c', textAlign: 'center', width: '100%' }}>총 투자금 (경비 포함)</div>
              <div className="summary-card-value" style={{ color: dark ? '#ffffff' : '#991b1b', textAlign: 'center', width: '100%' }}>
                {formatMoney(data.investment.summary.totalInvestment)}
              </div>
              <div className="summary-card-sub" style={{ textAlign: 'center', width: '100%', display: 'block' }}>복비 제외 전체 자금</div>
            </div>

            <div className="section-card summary-card-item" style={{ background: dark ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5', border: '1px solid #6ee7b7', textAlign: 'center' }}>
              <div className="summary-card-title" style={{ color: dark ? '#34d399' : '#047857', textAlign: 'center', width: '100%' }}>호실별 회수 목표</div>
              <div className="summary-card-value" style={{ color: dark ? '#ffffff' : '#065f46', textAlign: 'center', width: '100%' }}>
                {formatMoney(173674929)}
              </div>
              <div className="summary-card-sub" style={{ textAlign: 'center', width: '100%', display: 'block' }}>호실당 손익분기 금액</div>
            </div>
          </div>

          {/* 호실별 인테리어 비용 */}
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🛠️ 호실별 인테리어 비용
            </h3>

            <div className="ki-grid-2col">
              {/* CA520 호실 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#a855f7' }}>📍 CA520 호실</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>합계: {formatMoney(ca520Sum)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInteriorModal('interiorCA520')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ➕ CA520 등록
                  </button>
                </div>
                <div className="table-responsive-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>일자</th>
                        <th>품목</th>
                        <th>상세</th>
                        <th>금액</th>
                        <th style={{ width: '60px' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.investment?.interiorCA520 || []).map(item => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.item}</td>
                          <td style={{ textAlign: 'left' }}>{item.detail}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(item.amount)}</td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenInteriorModal('interiorCA520', item)}
                                className="btn-action-icon"
                                title="수정"
                                style={{ color: '#2563eb' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteInterior('interiorCA520', item.id)}
                                className="btn-action-icon"
                                title="삭제"
                                style={{ color: '#ef4444' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', fontWeight: 800 }}>
                        <td colSpan={3}>소계</td>
                        <td style={{ textAlign: 'right', color: '#7e22ce' }}>{formatMoney(ca520Sum)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CA557 호실 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#3b82f6' }}>📍 CA557 호실</span>
                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>합계: {formatMoney(ca557Sum)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenInteriorModal('interiorCA557')}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ➕ CA557 등록
                  </button>
                </div>
                <div className="table-responsive-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>일자</th>
                        <th>품목</th>
                        <th>상세</th>
                        <th>금액</th>
                        <th style={{ width: '60px' }}>관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.investment?.interiorCA557 || []).map(item => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.item}</td>
                          <td style={{ textAlign: 'left' }}>{item.detail}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(item.amount)}</td>
                          <td>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenInteriorModal('interiorCA557', item)}
                                className="btn-action-icon"
                                title="수정"
                                style={{ color: '#2563eb' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteInterior('interiorCA557', item.id)}
                                className="btn-action-icon"
                                title="삭제"
                                style={{ color: '#ef4444' }}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ background: dark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff', fontWeight: 800 }}>
                        <td colSpan={3}>소계</td>
                        <td style={{ textAlign: 'right', color: '#1d4ed8' }}>{formatMoney(ca557Sum)}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 인테리어 총합계 */}
            <div style={{ marginTop: '1rem', padding: '10px 16px', borderRadius: '12px', background: dark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', border: '1px solid #c084fc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 900, color: dark ? '#ffffff' : '#581c87' }}>2개 호실 인테리어 총 비용 합계</span>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: dark ? '#c084fc' : '#7e22ce' }}>{formatMoney(interiorTotal)}</span>
            </div>
          </div>

          {/* 투자상세내역 & 전체 투자 비용 상세 */}
          <div className="ki-grid-2col">
            {/* 투자 상세 내역 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  📋 투자 상세 내역
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenInvestDetailModal()}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ➕ 내역 등록
                </button>
              </div>
              <div className="table-responsive-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>항목</th>
                      <th>대상/연월</th>
                      <th>비고</th>
                      <th>투자금액</th>
                      <th style={{ width: '60px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.investment?.details || []).map(d => (
                      <tr key={d.id} style={{ fontWeight: d.category === '총분양가' ? 900 : 400 }}>
                        <td style={{ fontWeight: 800 }}>{d.category}</td>
                        <td>{d.target}</td>
                        <td>{d.note}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: d.category === '총분양가' ? '#a855f7' : 'inherit' }}>
                          {formatMoney(d.amount)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenInvestDetailModal(d)}
                              className="btn-action-icon"
                              title="수정"
                              style={{ color: '#2563eb' }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteInvestDetail(d.id)}
                              className="btn-action-icon"
                              title="삭제"
                              style={{ color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 전체 투자 비용 요약 및 호실별 회수 분석 */}
            <div className="section-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                  📊 호실별 공급가 & 매각 회수 분석
                </h3>
                <button
                  type="button"
                  onClick={() => handleOpenBreakEvenModal()}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ➕ 공급가 등록
                </button>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>
                ※ 차액은 호실별 매각금액 - 공급가액 임
              </div>
              <div className="table-responsive-container" style={{ marginBottom: '1rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>호실별 공급가</th>
                      <th>공급 금액</th>
                      <th>차액 (투자금 포함)</th>
                      <th style={{ width: '60px' }}>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.investment?.breakEven || []).map(b => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 800 }}>{b.unit}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatMoney(b.supplyPrice)}</td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#10b981' }}>{formatMoney(b.diff)}</td>
                        <td>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenBreakEvenModal(b)}
                              className="btn-action-icon"
                              title="수정"
                              style={{ color: '#2563eb' }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBreakEven(b.id)}
                              className="btn-action-icon"
                              title="삭제"
                              style={{ color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 전체 투자 비용 상세 테이블 (첨부 이미지 규격 100% 정밀 복원) */}
              <div style={{ marginTop: '1.25rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>🏷️ 전체 투자 비용 요약</span>
                  <button
                    type="button"
                    onClick={handleOpenSummaryModal}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      border: 'none',
                      background: dark ? 'rgba(248, 113, 113, 0.2)' : '#fee2e2',
                      color: dark ? '#f87171' : '#b91c1c',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ✏️ 비용 수정
                  </button>
                </div>
                <div className="table-responsive-container">
                  <table className="data-table" style={{ border: `2px solid ${dark ? '#475569' : '#000000'}` }}>
                    <thead>
                      <tr>
                        <th
                          colSpan={3}
                          style={{
                            background: dark ? '#9a3412' : '#e2876e',
                            color: '#000000',
                            fontSize: '1rem',
                            fontWeight: 900,
                            padding: '8px',
                            border: `1.5px solid ${dark ? '#475569' : '#000000'}`
                          }}
                        >
                          전체 투자 비용
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ background: dark ? 'rgba(234, 88, 12, 0.25)' : '#e2876e' }}>
                        <td style={{ fontWeight: 800, textAlign: 'left', paddingLeft: '14px', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000', width: '32%' }}>계약금/잔금</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000', width: '34%' }}>{formatMoney(summaryData.deposit).replace('원', '')}</td>
                        <td style={{ border: `1.5px solid ${dark ? '#475569' : '#000000'}`, width: '34%' }}></td>
                      </tr>
                      <tr style={{ background: dark ? 'rgba(234, 88, 12, 0.25)' : '#e2876e' }}>
                        <td style={{ fontWeight: 800, textAlign: 'left', paddingLeft: '14px', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000' }}>시설투자비</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000' }}>{formatMoney(summaryData.facility).replace('원', '')}</td>
                        <td
                          rowSpan={2}
                          style={{
                            textAlign: 'center',
                            fontWeight: 900,
                            verticalAlign: 'middle',
                            fontSize: '0.95rem',
                            border: `1.5px solid ${dark ? '#475569' : '#000000'}`,
                            color: dark ? '#fdba74' : '#000000',
                            background: dark ? 'rgba(234, 88, 12, 0.35)' : '#e2876e'
                          }}
                        >
                          {formatMoney(facilityAndTaxSum).replace('원', '')}
                        </td>
                      </tr>
                      <tr style={{ background: dark ? 'rgba(234, 88, 12, 0.25)' : '#e2876e' }}>
                        <td style={{ fontWeight: 800, textAlign: 'left', paddingLeft: '14px', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000' }}>등취득/이자</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000' }}>{formatMoney(summaryData.taxInterest).replace('원', '')}</td>
                      </tr>
                      <tr style={{ background: dark ? '#1e293b' : '#f1f5f9', fontWeight: 900 }}>
                        <td style={{ textAlign: 'center', fontWeight: 900, fontSize: '0.95rem', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#f8fafc' : '#000000' }}>합계</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, fontSize: '0.95rem', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#60a5fa' : '#000000' }}>{formatMoney(summaryData.sumCost).replace('원', '')}</td>
                        <td style={{ border: `1.5px solid ${dark ? '#475569' : '#000000'}` }}></td>
                      </tr>
                      <tr style={{ background: dark ? '#991b1b' : '#d96565', fontWeight: 900 }}>
                        <td style={{ textAlign: 'center', fontWeight: 900, border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#ffffff' : '#000000' }}>총 투자금</td>
                        <td style={{ textAlign: 'right', fontWeight: 900, border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#ffffff' : '#000000' }}>{formatMoney(summaryData.totalInvestment).replace('원', '')}</td>
                        <td style={{ textAlign: 'left', fontSize: '0.82rem', paddingLeft: '8px', border: `1.5px solid ${dark ? '#475569' : '#000000'}`, color: dark ? '#fecaca' : '#000000' }}>모든 경비포함(복비등은 제외)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ padding: '14px 12px', borderRadius: '12px', background: dark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', border: '1px solid #fca5a5', textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: dark ? '#ffffff' : '#991b1b' }}>
                  각 호실별 {formatMoney(173674929)}
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>※ 최소 이 금액 이상 매각 시 전체 투자금 완전 회수</div>
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
            {/* 좌측: 연도별 조회 필터 셀렉터 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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

            {/* 우측: 은행 서브 탭 + 추가 버튼 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('kb')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: loanSubTab === 'kb' ? '1px solid #1d4ed8' : (dark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #bfdbfe'),
                    background: loanSubTab === 'kb' ? '#2563eb' : (dark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff'),
                    color: loanSubTab === 'kb' ? '#ffffff' : (dark ? '#60a5fa' : '#1d4ed8'),
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: loanSubTab === 'kb' ? '0 4px 12px rgba(37, 99, 235, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏦 KB
                </button>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('nh')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: loanSubTab === 'nh' ? '1px solid #7e22ce' : (dark ? '1px solid rgba(168, 85, 247, 0.4)' : '1px solid #e9d5ff'),
                    background: loanSubTab === 'nh' ? '#9333ea' : (dark ? 'rgba(147, 51, 234, 0.15)' : '#faf5ff'),
                    color: loanSubTab === 'nh' ? '#ffffff' : (dark ? '#c084fc' : '#7e22ce'),
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: loanSubTab === 'nh' ? '0 4px 12px rgba(147, 51, 234, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  🏦 NH
                </button>
                <button
                  type="button"
                  onClick={() => setLoanSubTab('all')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: loanSubTab === 'all' ? '1px solid #047857' : (dark ? '1px solid rgba(168, 185, 129, 0.4)' : '1px solid #a7f3d0'),
                    background: loanSubTab === 'all' ? '#059669' : (dark ? 'rgba(5, 150, 105, 0.15)' : '#ecfdf5'),
                    color: loanSubTab === 'all' ? '#ffffff' : (dark ? '#34d399' : '#047857'),
                    fontSize: '0.85rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: loanSubTab === 'all' ? '0 4px 12px rgba(5, 150, 105, 0.35)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  📊 모두보기
                </button>
              </div>
            </div>
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
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>임대 대비 누적 추가부담금: {formatMoney(nhExtraTotal)}</div>
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
                  + 추가
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
                      <th>편집</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKbLoans.map((row, idx) => {
                      const originalIdx = data.loans.kb.indexOf(row);
                      return (
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
                          <td>
                            <button
                              type="button"
                              onClick={() => handleOpenLoanModal('kb', originalIdx >= 0 ? originalIdx : idx)}
                              title="수정"
                              className="btn-action-icon"
                              style={{ color: '#2563eb' }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLoanRow('kb', originalIdx >= 0 ? originalIdx : idx)}
                              title="삭제"
                              className="btn-action-icon"
                              style={{ color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: dark ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff', fontWeight: 900, fontSize: '0.9rem' }}>
                      <td colSpan={3}>누적 합계</td>
                      <td style={{ textAlign: 'right', color: '#1e40af' }}>{formatMoney(kbPaymentTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbPrincipalTotal)}</td>
                      <td style={{ textAlign: 'right' }}>{formatMoney(kbInterestTotal)}</td>
                      <td colSpan={2}>-</td>
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
                    임대 대비 추가부담금 및 2024.02.07 이자환급(-2,685,805원) 상세 관리
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenLoanModal('nh')}
                  style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#a855f7', color: '#ffffff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  + 추가
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
                      <th>임대대비 추가부담금</th>
                      <th>편집</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNhLoans.map((row, idx) => {
                      const originalIdx = data.loans.nh.indexOf(row);
                      return (
                        <tr key={idx} style={{ background: row.isRefund ? (dark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7') : 'inherit' }}>
                          <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td style={{ fontWeight: 800 }}>{row.date}</td>
                          <td style={{ color: row.isRefund ? '#d97706' : '#7e22ce', fontWeight: 800 }}>{row.rate}</td>
                          <td style={{ textAlign: 'right', fontWeight: 900, color: row.isRefund ? '#d97706' : '#581c87' }}>{formatMoney(row.payment)}</td>
                          <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatMoney(row.extra)}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleOpenLoanModal('nh', originalIdx >= 0 ? originalIdx : idx)}
                              title="수정"
                              className="btn-action-icon"
                              style={{ color: '#7e22ce' }}
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLoanRow('nh', originalIdx >= 0 ? originalIdx : idx)}
                              title="삭제"
                              className="btn-action-icon"
                              style={{ color: '#ef4444' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. 대출 2종 나란히 비교 뷰 (loanSubTab === 'all') */}
          {loanSubTab === 'all' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* KB 대출 */}
              <div className="section-card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '6px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#2563eb', margin: 0, whiteSpace: 'nowrap' }}>
                    🏦 KB <span className="loan-compare-title-sub" style={{ fontSize: '0.9rem', fontWeight: 800 }}>상환 내역</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenLoanModal('kb')}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
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
                      {filteredKbLoans.map((row, idx) => {
                        const originalIdx = data.loans.kb.indexOf(row);
                        const targetIdx = originalIdx >= 0 ? originalIdx : idx;
                        return (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>{row.date}</td>
                            <td style={{ color: '#2563eb', fontWeight: 800 }}>{row.rate}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(row.payment)}</td>
                            <td style={{ textAlign: 'right' }}>{formatMoney(row.interest)}</td>
                            <td>
                              <button type="button" onClick={() => handleOpenLoanModal('kb', targetIdx)} className="btn-action-icon" style={{ color: '#2563eb' }}>✏️</button>
                              <button type="button" onClick={() => handleDeleteLoanRow('kb', targetIdx)} className="btn-action-icon" style={{ color: '#ef4444' }}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>



              {/* NH 대출 */}
              <div className="section-card" style={{ padding: '1rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#7e22ce', margin: 0, whiteSpace: 'nowrap' }}>
                    🏦 NH <span className="loan-compare-title-sub" style={{ fontSize: '0.9rem', fontWeight: 800 }}>상환 내역</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleOpenLoanModal('nh')}
                    style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', border: 'none', background: '#a855f7', color: '#fff', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
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
                      {filteredNhLoans.map((row, idx) => {
                        const originalIdx = data.loans.nh.indexOf(row);
                        const targetIdx = originalIdx >= 0 ? originalIdx : idx;
                        return (
                          <tr key={idx} style={{ background: row.isRefund ? (dark ? 'rgba(245, 158, 11, 0.2)' : '#fef3c7') : 'inherit' }}>
                            <td style={{ fontWeight: 700 }}>{row.date}</td>
                            <td style={{ color: row.isRefund ? '#d97706' : '#7e22ce', fontWeight: 800 }}>{row.rate}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800 }}>{formatMoney(row.payment)}</td>
                            <td style={{ textAlign: 'right', color: '#ef4444' }}>{formatMoney(row.extra)}</td>
                            <td>
                              <button type="button" onClick={() => handleOpenLoanModal('nh', targetIdx)} className="btn-action-icon" style={{ color: '#a855f7' }}>✏️</button>
                              <button type="button" onClick={() => handleDeleteLoanRow('nh', targetIdx)} className="btn-action-icon" style={{ color: '#ef4444' }}>🗑️</button>
                            </td>
                          </tr>
                        );
                      })}
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
          {/* 상단 툴바: 연도 필터 & 종합 통계 & 추가 버튼 */}
          {(() => {
            const now = new Date();
            const currentYearMonth = now.getFullYear() * 100 + (now.getMonth() + 1);

            // 해당 계약이 특정 조회 연도에 걸쳐 있는지(기본 1년 계약 기간, 계약일자, 입금 일정 등) 판별
            const isContractInYear = (c, targetYear) => {
              if (!c) return false;
              if (targetYear === 'ALL') return true;

              const tYear = Number(targetYear);
              if (isNaN(tYear)) return true;

              const yStr = String(targetYear);

              // 1. 계약일자(contractDate)에서 시작 연도 파싱
              let startYear = null;
              if (c.contractDate) {
                const match = String(c.contractDate).match(/(\d{4})/);
                if (match) startYear = Number(match[1]);
              }

              // 2. 월세 입금 내역(payments)에서 연도 수집
              const paymentYears = [];
              if (Array.isArray(c.payments)) {
                c.payments.forEach(p => {
                  const match = String(p.date || '').match(/(\d{4})/);
                  if (match) paymentYears.push(Number(match[1]));
                });
              }

              // 3. 임대차 계약 기간 범위 판별
              // 임대차 계약은 일반적으로 12개월(1년) 이상 지속되므로, 시작연도(예: 2025년) 기준 최소 다음 연도(2026년)까지 유효 범위로 계산
              if (startYear !== null) {
                const minYear = startYear;
                // 기본 12개월 계약 기준 최소 startYear + 1년까지 포함
                let maxYear = startYear + 1;

                if (paymentYears.length > 0) {
                  maxYear = Math.max(maxYear, ...paymentYears);
                }

                // 현재 '계약중' 상태라면 당해연도(현재 연도)까지도 유효한 계약으로 포함
                if (c.status === '계약중') {
                  maxYear = Math.max(maxYear, new Date().getFullYear());
                }

                if (tYear >= minYear && tYear <= maxYear) {
                  return true;
                }
              } else if (paymentYears.length > 0) {
                const minYear = Math.min(...paymentYears);
                const maxYear = Math.max(...paymentYears);
                if (tYear >= minYear && tYear <= maxYear) {
                  return true;
                }
              }

              // 직접 문자열 매칭 보조
              if (c.contractDate && String(c.contractDate).includes(yStr)) return true;
              if (Array.isArray(c.payments) && c.payments.some(p => p.date && String(p.date).startsWith(yStr))) return true;

              return false;
            };

            // 조회 연도에 따른 계약/호실 필터링
            const displayedContracts = (data.rent.contracts || []).filter(c => isContractInYear(c, rentYearFilter));

            let totalYearPaid = 0;
            let totalYearScheduled = 0;
            let totalPaidCount = 0;
            let totalUnpaidCount = 0;

            displayedContracts.forEach(c => {
              const pList = c.payments.filter(p => rentYearFilter === 'ALL' || (p.date && p.date.startsWith(rentYearFilter)));
              pList.forEach(p => {
                if (p.isPaid) {
                  totalYearPaid += (Number(p.amount) || 0);
                  totalPaidCount += 1;
                } else {
                  totalYearScheduled += (Number(p.amount) || 0);
                  // 해당월(현재 연월)을 포함하여 이전 데이터 중 미입금된 건만 미납으로 집계
                  const pDateParts = String(p.date || '').replace(/[^0-9.]/g, '').split('.').filter(Boolean).map(Number);
                  const pYearMonth = (pDateParts[0] || 0) * 100 + (pDateParts[1] || 0);
                  if (pYearMonth > 0 && pYearMonth <= currentYearMonth) {
                    totalUnpaidCount += 1;
                  }
                }
              });
            });

            return (
              <>
                <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'var(--text-primary)' }}>📅 조회 연도:</span>
                      <select
                        value={rentYearFilter}
                        onChange={e => setRentYearFilter(e.target.value)}
                        style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        <option value="2024">2024년</option>
                        <option value="2025">2025년</option>
                        <option value="2026">2026년 (당해연도)</option>
                        <option value="2027">2027년</option>
                        <option value="2028">2028년</option>
                        <option value="ALL">전체보기 (ALL)</option>
                      </select>
                    </div>

                    {/* 통계 뱃지 */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '99px', background: dark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', color: '#10b981', fontWeight: 800, border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                        수령 완료: {formatMoney(totalYearPaid)} ({totalPaidCount}건)
                      </span>
                      {totalUnpaidCount > 0 && (
                        <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '99px', background: dark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2', color: '#ef4444', fontWeight: 800, border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          미납: {totalUnpaidCount}건
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenRentModal(displayedContracts[0]?.id || data.rent.contracts[0]?.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '99px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)' }}
                    >
                      ➕ 임대 입금 등록
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenContractModal()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 16px', borderRadius: '99px', border: `1px solid ${dark ? 'rgba(168, 85, 247, 0.4)' : '#c084fc'}`, background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', color: dark ? '#c084fc' : '#7e22ce', fontWeight: 800, cursor: 'pointer' }}
                    >
                      🏢 계약/호실 추가
                    </button>
                  </div>
                </div>

                {/* 호실/계약자 테이블 렌더링 */}
                <div className="ki-grid-2col">
                  {displayedContracts.length > 0 ? (
                    displayedContracts.map(contract => {
                      const filteredPayments = contract.payments.filter(p => rentYearFilter === 'ALL' || (p.date && p.date.startsWith(rentYearFilter)));
                      const totalPaidAmount = filteredPayments.reduce((s, p) => s + (p.isPaid ? (Number(p.amount) || 0) : 0), 0);

                      return (
                        <div key={contract.id} className="section-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            {/* 계약자 / 호실 헤더 */}
                            <div style={{ borderBottom: `2px solid ${dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9'}`, paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#a855f7' }}>
                                    📍 {contract.room} ({contract.tenant})
                                  </span>
                                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '99px', background: dark ? 'rgba(168,85,247,0.2)' : '#f3e8ff', color: '#7e22ce', fontWeight: 800 }}>
                                    {contract.status}
                                  </span>
                                </div>

                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenContractModal(contract)}
                                    title="계약 정보 수정"
                                    className="btn-action-icon"
                                    style={{ color: '#a855f7', fontSize: '0.85rem' }}
                                  >
                                    ✏️
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteContract(contract.id)}
                                    title="계약 삭제"
                                    className="btn-action-icon"
                                    style={{ color: '#ef4444', fontSize: '0.85rem' }}
                                  >
                                    🗑️
                                  </button>
                                </div>
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
                            <div className="table-responsive-container">
                              <table className="data-table">
                                <thead>
                                  <tr>
                                    <th>입금예정일</th>
                                    <th>실입금일</th>
                                    <th>입금액</th>
                                    <th>입금여부</th>
                                    <th>비고</th>
                                    <th>관리</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredPayments.length > 0 ? (
                                    filteredPayments.map(p => (
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
                                            title="클릭 시 완납/미납 전환"
                                          >
                                            {p.isPaid ? '⭕ 완납' : '❌ 미납'}
                                          </button>
                                        </td>
                                        <td style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
                                          {p.note || '-'}
                                        </td>
                                        <td>
                                          <button type="button" onClick={() => handleOpenRentModal(contract.id, p)} className="btn-action-icon" style={{ color: '#a855f7' }}>✏️</button>
                                          <button type="button" onClick={() => handleDeleteRentPayment(contract.id, p.id)} className="btn-action-icon" style={{ color: '#ef4444' }}>🗑️</button>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan={6} style={{ padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                        {rentYearFilter}년 등록된 입금 내역이 없습니다.
                                      </td>
                                    </tr>
                                  )}
                                  <tr style={{ background: dark ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff', fontWeight: 900 }}>
                                    <td colSpan={2}>{rentYearFilter === 'ALL' ? '전체' : `${rentYearFilter}년`} 입금 총액</td>
                                    <td style={{ textAlign: 'right', color: '#7e22ce' }}>{formatMoney(totalPaidAmount)}</td>
                                    <td colSpan={3}>-</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* 호실별 빠른 입금 등록 버튼 */}
                          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenRentModal(contract.id)}
                              style={{ fontSize: '0.78rem', padding: '6px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                            >
                              + {contract.room} 입금 내역 추가
                            </button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="section-card" style={{ gridColumn: '1 / -1', padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏢</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        {rentYearFilter}년에 등록된 계약/호실 정보가 없습니다.
                      </div>
                      <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
                        조회 연도를 변경하시거나, 새로운 계약을 등록해 주세요.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleOpenContractModal()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 20px', borderRadius: '99px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                      >
                        🏢 {rentYearFilter === 'ALL' ? '2026' : rentYearFilter}년 신규 계약/호실 추가
                      </button>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ========================================================================================= */}
      {/* 탭 4: 연도별 흐름도 (분양 키불출 -> 인테리어/가전 -> 임대차 변천사) */}
      {/* ========================================================================================= */}
      {activeTab === 'timeline' && (
        <div>
          <div className="section-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🗓️ 지식산업센터 흐름도
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>
                  최초 분양 잔금 및 키불출 시점부터 호실별 인테리어, 가전, 냉난방 설치 및 임대 계약 변천 흐름입니다.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', maxWidth: '100%' }}>
                <div style={{ display: 'inline-flex', background: dark ? 'rgba(255,255,255,0.06)' : '#f1f5f9', borderRadius: '8px', padding: '2px' }}>
                  <button
                    type="button"
                    onClick={() => handleScrollTimeline(-250)}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title="좌측으로 스크롤"
                  >
                    ◀ 좌측
                  </button>
                  <button
                    type="button"
                    onClick={() => handleScrollTimeline(250)}
                    style={{
                      padding: '5px 9px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                    title="우측으로 스크롤"
                  >
                    우측 ▶
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenTimelineModal('ca520')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ➕ CA520 추가
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenTimelineModal('ca557')}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ➕ CA557 추가
                </button>
              </div>
            </div>

            {/* 연도별 흐름도 다이어그램 */}
            <div className="timeline-scroll-container" ref={timelineScrollRef} onWheel={handleTimelineWheel}>
              <table className="flow-diagram-table">
                <tbody>
                  {/* CA520 라인 (상단 행) */}
                  <tr>
                    {/* 공통 시작 노드 (입주 / 잔금완납 / 키불출) - 2개 행 병합 */}
                    <td rowSpan={2} style={{ paddingRight: '12px' }}>
                      <div
                        className="flow-main-key-box"
                        onClick={() => handleOpenTimelineModal('keyHandover')}
                        title="클릭하여 키불출 정보 수정"
                      >
                        <div style={{ fontSize: '0.78rem', color: dark ? '#cbd5e1' : '#64748b', fontWeight: 800, marginBottom: '2px' }}>
                          🏁 시작 공통
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, whiteSpace: 'pre-line', lineHeight: 1.35 }}>
                          {data.timeline?.keyHandover?.title || '입주\n잔금완납\n키불출'}
                        </div>
                        <div style={{ marginTop: '6px', fontSize: '0.92rem', fontWeight: 900, color: dark ? '#38bdf8' : '#0284c7' }}>
                          {data.timeline?.keyHandover?.date || '22.09.13'}
                        </div>
                        <div style={{ marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ✏️ 클릭 수정
                        </div>
                      </div>
                    </td>

                    {/* 분기 화살표 (2개 행 병합) */}
                    <td rowSpan={2} className="flow-arrow-cell" style={{ padding: '0 12px !important' }}>
                      &gt;
                    </td>

                    {/* CA520 단계 노드들 */}
                    {(data.timeline?.ca520 || []).map((item, idx, arr) => (
                      <React.Fragment key={item.id || idx}>
                        <td>
                          <div className="flow-box">
                            <div className="flow-box-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenTimelineModal('ca520', item)}
                                title="수정"
                                style={{ color: '#60a5fa' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTimelineItem('ca520', item.id)}
                                title="삭제"
                                style={{ color: '#f87171' }}
                              >
                                🗑️
                              </button>
                            </div>
                            <div className={`flow-box-header ${item.type === 'rent' ? 'rent' : 'prep'}`}>
                              {item.title}
                            </div>
                            <div className="flow-box-body">
                              <div>{item.detail || '-'}</div>
                              <div className="sub-date">{item.date}</div>
                            </div>
                          </div>
                        </td>
                        {idx < arr.length - 1 && (
                          <td className="flow-arrow-cell">&gt;</td>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>

                  {/* CA557 라인 (하단 행) */}
                  <tr>
                    {/* CA557 단계 노드들 */}
                    {(data.timeline?.ca557 || []).map((item, idx, arr) => (
                      <React.Fragment key={item.id || idx}>
                        <td>
                          <div className="flow-box">
                            <div className="flow-box-actions">
                              <button
                                type="button"
                                onClick={() => handleOpenTimelineModal('ca557', item)}
                                title="수정"
                                style={{ color: '#60a5fa' }}
                              >
                                ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTimelineItem('ca557', item.id)}
                                title="삭제"
                                style={{ color: '#f87171' }}
                              >
                                🗑️
                              </button>
                            </div>
                            <div className={`flow-box-header ${item.type === 'rent' ? 'rent' : 'prep'}`}>
                              {item.title}
                            </div>
                            <div className="flow-box-body">
                              <div>{item.detail || '-'}</div>
                              <div className="sub-date">{item.date}</div>
                            </div>
                          </div>
                        </td>
                        {idx < arr.length - 1 && (
                          <td className="flow-arrow-cell">&gt;</td>
                        )}
                      </React.Fragment>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 하단 범례 및 안내 */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-muted)' }}>구분 범례:</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: dark ? '#701a75' : '#fae8ff', border: `1px solid ${dark ? '#fdf4ff' : '#701a75'}` }}></span>
                  시설/가전/인테리어 시공
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 800 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 3, background: dark ? '#0369a1' : '#e0f2fe', border: `1px solid ${dark ? '#f0f9ff' : '#0369a1'}` }}></span>
                  임대차 계약 체결 및 갱신
                </span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                💡 각 카드를 마우스로 가리키면 수정(✏️) 및 삭제(🗑️)가 가능합니다.
              </div>
            </div>
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
                {loanModal.bank === 'kb' ? '🏦 KB' : '🏦 NH (기업성장론)'} {loanModal.editIndex !== null ? '상환 내역 수정' : '상환 내역 등록'}
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
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>금리 (%)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="예: 5.635"
                      value={loanModal.formData.rate}
                      onChange={e => {
                        let val = e.target.value.replace(/[^0-9.]/g, '');
                        const parts = val.split('.');
                        if (parts.length > 2) val = parts[0] + '.' + parts.slice(1).join('');
                        if (parts[1] && parts[1].length > 3) {
                          val = parts[0] + '.' + parts[1].slice(0, 3);
                        }
                        setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, rate: val } }));
                      }}
                      style={{ width: '100%', padding: '8px 28px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                      required
                    />
                    <span style={{ position: 'absolute', right: '10px', pointerEvents: 'none', fontSize: '0.85rem', fontWeight: 900, color: 'var(--text-muted)' }}>
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>원리금 납부액 (원)</label>
                  <input
                    type="text"
                    value={loanModal.formData.payment}
                    onFocus={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, payment: unformatComma(prev.formData.payment) } }))}
                    onBlur={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, payment: formatComma(prev.formData.payment) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, payment: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              {loanModal.bank === 'kb' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>원금 (원)</label>
                    <input
                      type="text"
                      value={loanModal.formData.principal}
                      onFocus={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, principal: unformatComma(prev.formData.principal) } }))}
                      onBlur={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, principal: formatComma(prev.formData.principal) } }))}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                        setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, principal: cleanVal } }));
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>이자 (원)</label>
                    <input
                      type="text"
                      value={loanModal.formData.interest}
                      onFocus={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, interest: unformatComma(prev.formData.interest) } }))}
                      onBlur={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, interest: formatComma(prev.formData.interest) } }))}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                        setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, interest: cleanVal } }));
                      }}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    />
                  </div>
                </div>
              ) : (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>임대 대비 추가부담금 (원)</label>
                  <input
                    type="text"
                    value={loanModal.formData.extra}
                    onFocus={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, extra: unformatComma(prev.formData.extra) } }))}
                    onBlur={() => setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, extra: formatComma(prev.formData.extra) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9-]/g, '');
                      setLoanModal(prev => ({ ...prev, formData: { ...prev.formData, extra: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  />
                </div>
              )}

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
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 임대 입금 내역 등록/수정 모달 --- */}
      {rentModal.open && (
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
          onClick={() => setRentModal(prev => ({ ...prev, open: false }))}
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
                💰 {rentModal.paymentId ? '임대 입금 내역 수정' : '임대 입금 내역 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setRentModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRentPayment}>
              {/* 호실/계약 선택 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>대상 호실 및 계약자</label>
                <select
                  value={rentModal.contractId}
                  onChange={e => {
                    const nextCId = e.target.value;
                    const nextContract = data.rent.contracts.find(c => c.id === nextCId);
                    setRentModal(prev => ({
                      ...prev,
                      contractId: nextCId,
                      formData: {
                        ...prev.formData,
                        amount: (!prev.paymentId && nextContract) ? formatComma(nextContract.rent) : prev.formData.amount
                      }
                    }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                >
                  {data.rent.contracts.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.room} - {c.tenant} (월 {formatMoney(c.rent)})
                    </option>
                  ))}
                </select>
              </div>

              {/* 입금 예정일 & 실입금일 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>입금 예정일</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="예: 2026. 8. 19"
                      value={rentModal.formData.date}
                      onChange={e => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, date: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      required
                    />
                    <input
                      type="date"
                      onChange={e => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-');
                          const formatted = `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}`;
                          setRentModal(prev => ({ ...prev, formData: { ...prev.formData, date: formatted } }));
                        }
                      }}
                      style={{ position: 'absolute', right: '6px', width: '24px', height: '24px', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                      title="달력 선택"
                    />
                    <span style={{ position: 'absolute', right: '8px', pointerEvents: 'none', fontSize: '0.9rem', zIndex: 1 }}>📅</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>실입금일 (선택)</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="예: 2026. 8. 20"
                      value={rentModal.formData.actualDate}
                      onChange={e => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, actualDate: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    />
                    <input
                      type="date"
                      onChange={e => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-');
                          const formatted = `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}`;
                          setRentModal(prev => ({ ...prev, formData: { ...prev.formData, actualDate: formatted } }));
                        }
                      }}
                      style={{ position: 'absolute', right: '6px', width: '24px', height: '24px', opacity: 0, cursor: 'pointer', zIndex: 2 }}
                      title="달력 선택"
                    />
                    <span style={{ position: 'absolute', right: '8px', pointerEvents: 'none', fontSize: '0.9rem', zIndex: 1 }}>📅</span>
                  </div>
                </div>
              </div>

              {/* 입금액 & 입금 상태 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>입금액 (원)</label>
                  <input
                    type="text"
                    value={rentModal.formData.amount}
                    onFocus={() => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, amount: unformatComma(prev.formData.amount) } }))}
                    onBlur={() => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, amount: formatComma(prev.formData.amount) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setRentModal(prev => ({ ...prev, formData: { ...prev.formData, amount: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>입금 여부</label>
                  <select
                    value={rentModal.formData.isPaid ? 'paid' : 'unpaid'}
                    onChange={e => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, isPaid: e.target.value === 'paid' } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  >
                    <option value="paid">⭕ 완납</option>
                    <option value="unpaid">❌ 미납</option>
                  </select>
                </div>
              </div>

              {/* 비고 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>비고 (특이사항)</label>
                <input
                  type="text"
                  placeholder="예: 계약만료, 정산, 선납 등"
                  value={rentModal.formData.note}
                  onChange={e => setRentModal(prev => ({ ...prev, formData: { ...prev.formData, note: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setRentModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 계약 정보 등록/수정 모달 --- */}
      {contractModal.open && (
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
          onClick={() => setContractModal(prev => ({ ...prev, open: false }))}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              background: dark ? '#0f172a' : '#ffffff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
              position: 'relative',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                🏢 {contractModal.contractId ? '계약 정보 수정' : '신규 계약/호실 등록'}
              </h3>
              <button
                type="button"
                onClick={() => setContractModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveContract}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>호실명</label>
                  <input
                    type="text"
                    placeholder="예: CA520, CA557"
                    value={contractModal.formData.room}
                    onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, room: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>계약자명</label>
                  <input
                    type="text"
                    placeholder="예: 홍길동"
                    value={contractModal.formData.tenant}
                    onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, tenant: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>계약일자</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="예: 2026. 1. 15"
                      value={contractModal.formData.contractDate}
                      onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, contractDate: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      required
                    />
                    <input
                      type="date"
                      onChange={e => {
                        if (e.target.value) {
                          const [y, m, d] = e.target.value.split('-');
                          const formatted = `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}`;
                          setContractModal(prev => ({ ...prev, formData: { ...prev.formData, contractDate: formatted } }));
                        }
                      }}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                      title="달력 선택"
                    />
                    <span style={{ position: 'absolute', right: '8px', pointerEvents: 'none', fontSize: '0.9rem', zIndex: 1 }}>
                      📅
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>계약상태</label>
                  <input
                    type="text"
                    placeholder="예: 계약중, 계약만료"
                    value={contractModal.formData.status}
                    onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, status: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>보증금 (원)</label>
                  <input
                    type="text"
                    value={contractModal.formData.deposit}
                    onFocus={() => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: unformatComma(prev.formData.deposit) } }))}
                    onBlur={() => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: formatComma(prev.formData.deposit) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setContractModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>임대료 (원)</label>
                  <input
                    type="text"
                    value={contractModal.formData.rent}
                    onFocus={() => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, rent: unformatComma(prev.formData.rent) } }))}
                    onBlur={() => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, rent: formatComma(prev.formData.rent) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setContractModal(prev => ({ ...prev, formData: { ...prev.formData, rent: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>계약조건 텍스트</label>
                  <input
                    type="text"
                    placeholder="예: 500/60"
                    value={contractModal.formData.terms}
                    onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, terms: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>연장정보</label>
                  <input
                    type="text"
                    placeholder="예: 6개월 연장"
                    value={contractModal.formData.extendStatus}
                    onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, extendStatus: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>메모 / 특이사항</label>
                <input
                  type="text"
                  placeholder="예: 1차 계약금(350), 2차 계약금(150)"
                  value={contractModal.formData.memo}
                  onChange={e => setContractModal(prev => ({ ...prev, formData: { ...prev.formData, memo: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setContractModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#a855f7', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 호실별 인테리어 비용 등록/수정 모달 --- */}
      {interiorModal.open && (
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
          onClick={() => setInteriorModal(prev => ({ ...prev, open: false }))}
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
                🛠️ {interiorModal.unit === 'interiorCA520' ? 'CA520' : 'CA557'} 인테리어 비용 {interiorModal.editId ? '수정' : '등록'}
              </h3>
              <button
                type="button"
                onClick={() => setInteriorModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInterior}>
              {/* 호실 선택 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>대상 호실</label>
                <select
                  value={interiorModal.unit}
                  onChange={e => setInteriorModal(prev => ({ ...prev, unit: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                >
                  <option value="interiorCA520">📍 CA520 호실</option>
                  <option value="interiorCA557">📍 CA557 호실</option>
                </select>
              </div>

              {/* 일자 & 품목 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>일자</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="예: 2023-01-29"
                      value={interiorModal.formData.date}
                      onChange={e => setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, date: e.target.value } }))}
                      style={{ width: '100%', padding: '8px 32px 8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                      required
                    />
                    <input
                      type="date"
                      onChange={e => {
                        if (e.target.value) {
                          setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, date: e.target.value } }));
                        }
                      }}
                      style={{
                        position: 'absolute',
                        right: '6px',
                        width: '24px',
                        height: '24px',
                        opacity: 0,
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                      title="달력 선택"
                    />
                    <span style={{ position: 'absolute', right: '8px', pointerEvents: 'none', fontSize: '0.9rem', zIndex: 1 }}>
                      📅
                    </span>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>품목</label>
                  <input
                    type="text"
                    placeholder="예: 냉장고, 세탁기, 인테리어"
                    value={interiorModal.formData.item}
                    onChange={e => setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, item: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              {/* 상세 내역 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>상세 규격 / 내용</label>
                <input
                  type="text"
                  placeholder="예: RB33A300401, 싱크대, 냉난방기"
                  value={interiorModal.formData.detail}
                  onChange={e => setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, detail: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                />
              </div>

              {/* 금액 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>금액 (원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={interiorModal.formData.amount}
                  onFocus={() => setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, amount: unformatComma(prev.formData.amount) } }))}
                  onBlur={() => setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, amount: formatComma(prev.formData.amount) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setInteriorModal(prev => ({ ...prev, formData: { ...prev.formData, amount: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInteriorModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 투자 상세 내역 등록/수정 모달 --- */}
      {investDetailModal.open && (
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
          onClick={() => setInvestDetailModal(prev => ({ ...prev, open: false }))}
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
                📋 투자 상세 내역 {investDetailModal.editId ? '수정' : '등록'}
              </h3>
              <button
                type="button"
                onClick={() => setInvestDetailModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInvestDetail}>
              {/* 항목명 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>항목명</label>
                <input
                  type="text"
                  placeholder="예: 총분양가, 계약금, 법무사비용, 대출금"
                  value={investDetailModal.formData.category}
                  onChange={e => setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, category: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                />
              </div>

              {/* 대상/연월 & 비고 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>대상 / 연월</label>
                  <input
                    type="text"
                    placeholder="예: 2개 호실, 2022.09"
                    value={investDetailModal.formData.target}
                    onChange={e => setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, target: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>비고</label>
                  <input
                    type="text"
                    placeholder="예: 잔금 KB, 농협 NH"
                    value={investDetailModal.formData.note}
                    onChange={e => setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, note: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              {/* 투자금액 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>투자금액 (원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={investDetailModal.formData.amount}
                  onFocus={() => setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, amount: unformatComma(prev.formData.amount) } }))}
                  onBlur={() => setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, amount: formatComma(prev.formData.amount) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9-]/g, '');
                    setInvestDetailModal(prev => ({ ...prev, formData: { ...prev.formData, amount: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setInvestDetailModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 호실별 공급가 & 매각 회수 분석 등록/수정 모달 --- */}
      {breakEvenModal.open && (
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
          onClick={() => setBreakEvenModal(prev => ({ ...prev, open: false }))}
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
                📊 호실별 공급가 & 매각 분석 {breakEvenModal.editId ? '수정' : '등록'}
              </h3>
              <button
                type="button"
                onClick={() => setBreakEvenModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveBreakEven}>
              {/* 호실명 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>호실명</label>
                <input
                  type="text"
                  placeholder="예: C-A-05-057, C-A-05-020"
                  value={breakEvenModal.formData.unit}
                  onChange={e => setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, unit: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                />
              </div>

              {/* 공급 금액 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>공급 금액 (원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={breakEvenModal.formData.supplyPrice}
                  onFocus={() => setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, supplyPrice: unformatComma(prev.formData.supplyPrice) } }))}
                  onBlur={() => setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, supplyPrice: formatComma(prev.formData.supplyPrice) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9-]/g, '');
                    setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, supplyPrice: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              {/* 차액 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>차액 (투자금 포함, 원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={breakEvenModal.formData.diff}
                  onFocus={() => setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, diff: unformatComma(prev.formData.diff) } }))}
                  onBlur={() => setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, diff: formatComma(prev.formData.diff) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9-]/g, '');
                    setBreakEvenModal(prev => ({ ...prev, formData: { ...prev.formData, diff: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setBreakEvenModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 전체 투자 비용 요약 등록/수정 모달 --- */}
      {summaryModal.open && (
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
          onClick={() => setSummaryModal(prev => ({ ...prev, open: false }))}
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
                🏷️ 전체 투자 비용 요약 수정
              </h3>
              <button
                type="button"
                onClick={() => setSummaryModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSummary}>
              {/* 계약금/잔금 */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>계약금 / 잔금 (원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={summaryModal.formData.deposit}
                  onFocus={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: unformatComma(prev.formData.deposit) } }))}
                  onBlur={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: formatComma(prev.formData.deposit) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, deposit: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              {/* 시설투자비 & 등취득/이자 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>시설투자비 (원)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={summaryModal.formData.facility}
                    onFocus={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, facility: unformatComma(prev.formData.facility) } }))}
                    onBlur={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, facility: formatComma(prev.formData.facility) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, facility: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>등취득 / 이자 (원)</label>
                  <input
                    type="text"
                    placeholder="0"
                    value={summaryModal.formData.taxInterest}
                    onFocus={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, taxInterest: unformatComma(prev.formData.taxInterest) } }))}
                    onBlur={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, taxInterest: formatComma(prev.formData.taxInterest) } }))}
                    onChange={e => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, taxInterest: cleanVal } }));
                    }}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                    required
                  />
                </div>
              </div>

              {/* 총 투자금 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>총 투자금 (원)</label>
                <input
                  type="text"
                  placeholder="0"
                  value={summaryModal.formData.totalInvestment}
                  onFocus={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, totalInvestment: unformatComma(prev.formData.totalInvestment) } }))}
                  onBlur={() => setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, totalInvestment: formatComma(prev.formData.totalInvestment) } }))}
                  onChange={e => {
                    const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                    setSummaryModal(prev => ({ ...prev, formData: { ...prev.formData, totalInvestment: cleanVal } }));
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', textAlign: 'right', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSummaryModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- 연도별 흐름도 단계 등록/수정 모달 --- */}
      {timelineModal.open && (
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
          onClick={() => setTimelineModal(prev => ({ ...prev, open: false }))}
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
                🗓️ {timelineModal.unit === 'keyHandover' ? '키불출 정보 수정' : `${timelineModal.unit === 'ca520' ? 'CA520' : 'CA557'} 흐름도 단계 ${timelineModal.editId ? '수정' : '추가'}`}
              </h3>
              <button
                type="button"
                onClick={() => setTimelineModal(prev => ({ ...prev, open: false }))}
                style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: dark ? 'rgba(255,255,255,0.1)' : '#f1f5f9', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 900 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTimelineItem}>
              {timelineModal.unit !== 'keyHandover' && (
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>구분 (타입)</label>
                  <select
                    value={timelineModal.formData.type}
                    onChange={e => setTimelineModal(prev => ({ ...prev, formData: { ...prev.formData, type: e.target.value } }))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  >
                    <option value="interior">🛠️ 시설 / 가전 / 인테리어</option>
                    <option value="rent">🚪 임대차 계약</option>
                  </select>
                </div>
              )}

              {/* 제목 (품목/단계명) */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {timelineModal.unit === 'keyHandover' ? '제목' : '단계명 (예: 인테리어, 가전, 냉난방, 임대)'}
                </label>
                <input
                  type="text"
                  placeholder="예: 임대, 가전, 냉난방 등"
                  value={timelineModal.formData.title}
                  onChange={e => setTimelineModal(prev => ({ ...prev, formData: { ...prev.formData, title: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                />
              </div>

              {/* 상세 내용 (조건/품목) */}
              <div style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  {timelineModal.unit === 'keyHandover' ? '메모' : '상세 내용 / 임대 조건 (예: 500/50, 냉장고/세탁기)'}
                </label>
                <input
                  type="text"
                  placeholder="예: 500/50, 300/60, 냉장고/세탁기"
                  value={timelineModal.formData.detail}
                  onChange={e => setTimelineModal(prev => ({ ...prev, formData: { ...prev.formData, detail: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                />
              </div>

              {/* 일자 */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '4px' }}>
                  일자 / 시기 (예: 22.09, 23.01, 24.02)
                </label>
                <input
                  type="text"
                  placeholder="예: 23.01 또는 2023.01"
                  value={timelineModal.formData.date}
                  onChange={e => setTimelineModal(prev => ({ ...prev, formData: { ...prev.formData, date: e.target.value } }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 800 }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setTimelineModal(prev => ({ ...prev, open: false }))}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontWeight: 800, cursor: 'pointer' }}
                >
                  취소
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)', color: '#ffffff', fontWeight: 800, cursor: 'pointer' }}
                >
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
