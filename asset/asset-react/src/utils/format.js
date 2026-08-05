// 금액 포맷 (한국 원화)
export function formatKRW(val) {
  const num = Number(val) || 0;
  return num.toLocaleString('ko-KR');
}

// 금액 포맷 (축약형: 억/만)
export function formatKRWShort(val) {
  const num = Number(val) || 0;
  if (Math.abs(num) >= 100000000) {
    return (num / 100000000).toFixed(1) + '억';
  } else if (Math.abs(num) >= 10000) {
    return (num / 10000).toFixed(0) + '만';
  }
  return num.toLocaleString('ko-KR');
}

// 연도 목록
export function getYearList() {
  const now = new Date().getFullYear();
  const years = [];
  for (let y = now - 3; y <= now + 5; y++) years.push(String(y));
  return years;
}

// 월 목록
export function getMonthList() {
  return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
}

// 현재 연/월
export function getCurrentYearMonth() {
  const now = new Date();
  return {
    year: String(now.getFullYear()),
    month: String(now.getMonth() + 1).padStart(2, '0'),
  };
}

// 변동률 계산
export function calcChangeRate(current, previous) {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

// 고유 ID 생성
export function genId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}
