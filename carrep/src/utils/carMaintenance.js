/**
 * 차량 주행거리와 연식 정보를 기반으로 주요 소모품의 교체 주기 및 권장 상태를 계산하는 헬퍼 함수
 * 사용자가 수동으로 등록한 여러 개의 정비 이력(historyMap) 중 가장 최신 정비 건을 기준으로 계산합니다.
 */
export function getMaintenanceStatus(mileage, year, historyMap = {}) {
  const currentYear = 2026; // System base current year is 2026 based on timestamps
  const age = year ? Math.max(0, currentYear - Number(year)) : 0;
  const km = mileage ? Number(mileage) : 0;

  const items = [
    {
      name: '엔진오일 및 필터',
      intervalKm: 10000,
      intervalYears: 1,
      desc: '엔진 내부 윤활 및 마모 방지',
      tip: '매 10,000km 또는 1년마다 교체 권장'
    },
    {
      name: '에어컨 필터',
      intervalKm: 15000,
      intervalYears: 1,
      desc: '실내 먼지 및 악취 차단',
      tip: '매 15,000km 또는 1년마다 교체 권장'
    },
    {
      name: '브레이크 오일',
      intervalKm: 40000,
      intervalYears: 2,
      desc: '제동 압력 전달 및 수분 차단',
      tip: '매 40,000km 또는 2년마다 교체 권장'
    },
    {
      name: '브레이크 패드',
      intervalKm: 35000,
      intervalYears: 3,
      desc: '휠 회전을 멈추는 마찰 패드',
      tip: '매 35,000km 내외 주기적인 점검 요망'
    },
    {
      name: '자동변속기 미션오일',
      intervalKm: 80000,
      intervalYears: 6,
      desc: '변속기 내부 동력 전달 및 기어 보호',
      tip: '매 80,000km ~ 100,000km마다 교체'
    },
    {
      name: '겉벨트 (팬벨트) 세트',
      intervalKm: 90000,
      intervalYears: 6,
      desc: '발전기 및 냉각 펌프 구동 벨트',
      tip: '매 90,000km 또는 6년마다 세트 교체'
    },
    {
      name: '부동액 / 냉각수',
      intervalKm: 100000,
      intervalYears: 5,
      desc: '엔진 과열 방지 및 동파 차단',
      tip: '최초 5년/10만km, 이후 2년마다 점검'
    },
    {
      name: '시동 배터리',
      intervalKm: 60000,
      intervalYears: 3,
      desc: '차량 시동 및 전장 장치 전원 공급',
      tip: '매 3~4년 또는 주행 60,000km마다 교체'
    },
    {
      name: '타이어 세트',
      intervalKm: 45000,
      intervalYears: 5,
      desc: '노면 접지력 확보 및 제동 안전성',
      tip: '매 45,000km 또는 연식 5년 이상 시 교체 권장'
    },
    {
      name: '연료 필터',
      intervalKm: 40000,
      intervalYears: 2,
      desc: '연료 내 불순물 및 수분 여과 (디젤 필수)',
      tip: '디젤 3~4만km, 가솔린 6만km마다 교체 권장'
    },
    {
      name: '디퍼런셜 오일 (데프오일)',
      intervalKm: 60000,
      intervalYears: 4,
      desc: '차동기어 내부 마모 방지 및 4WD 부품 보호',
      tip: '매 50,000km ~ 60,000km 또는 4년마다 교체'
    },
    {
      name: '트랜스퍼케이스 오일 (TC오일)',
      intervalKm: 80000,
      intervalYears: 5,
      desc: '전/후륜 동력 배분 장치 내부 기어 보호',
      tip: '매 80,000km 내외 또는 5년 주기 교체 권장'
    },
    {
      name: '디젤 흡기 / DPF 크리닝',
      intervalKm: 80000,
      intervalYears: 4,
      desc: '매연 카본 누적 세척 및 매연저감장치 보호',
      tip: '매 80,000km ~ 100,000km 주행 시 크리닝 권장'
    },
    {
      name: '점화 코일 및 플러그',
      intervalKm: 80000,
      intervalYears: 5,
      desc: '실린더 내부 점화 불꽃 발생기 (가솔린/LPI)',
      tip: '매 6~8만km 주행 시 점화 플러그와 세트 교체'
    },
    {
      name: '타이밍 벨트 세트',
      intervalKm: 120000,
      intervalYears: 8,
      desc: '크랭크축과 캠축의 회전 동기화 벨트',
      tip: '고무 벨트 타입의 경우 10~12만km마다 필수 교체'
    },
    {
      name: '엔진 및 미션 미미 (마운트)',
      intervalKm: 100000,
      intervalYears: 8,
      desc: '엔진/미션 진동 감쇄용 마운트 고무',
      tip: '정차 시 D레인지 진동이 심해지면 점검 후 교체'
    },
    {
      name: '휠 얼라인먼트',
      intervalKm: 20000,
      intervalYears: 1,
      desc: '네 바퀴의 정렬 및 편마모 방지',
      tip: '매 20,000km 또는 매년 1회 점검 권장'
    }
  ];

  // If no mileage and age are given, return everything as good/unknown
  if (km === 0 && age === 0) {
    return items.map(item => ({
      ...item,
      health: 100,
      status: 'good',
      reason: '차량 정보 미입력 (점검 대기)',
      kmRemaining: item.intervalKm,
      yearsRemaining: item.intervalYears,
      historyCount: 0
    }))
  }

  return items.map(item => {
    const historyList = historyMap[item.name] || [];
    const historyCount = historyList.length;

    // Find the most recent record (by mileage or date)
    let latestRecord = null;
    if (historyCount > 0) {
      // Find the record with the maximum km
      latestRecord = historyList.reduce((max, r) => (Number(r.km) > Number(max.km) ? r : max), historyList[0]);
    }

    let baseKm = km;
    let baseAge = age;
    let isOverridden = false;

    if (latestRecord) {
      isOverridden = true;
      const lastKm = Number(latestRecord.km) || 0;
      baseKm = Math.max(0, km - lastKm); // Distance driven since last replacement

      if (latestRecord.date) {
        const lastYear = new Date(latestRecord.date).getFullYear();
        baseAge = Math.max(0, currentYear - lastYear); // Years elapsed since last replacement
      } else {
        baseAge = 0;
      }
    }

    // 1. Calculate health percentage based on mileage cycle
    const kmProgress = baseKm % item.intervalKm;
    const kmRemaining = Math.max(0, item.intervalKm - kmProgress);
    const kmHealth = 1 - (kmProgress / item.intervalKm);

    // 2. Calculate health percentage based on age cycle
    const yearProgress = baseAge % item.intervalYears;
    const yearsRemaining = Math.max(0, item.intervalYears - yearProgress);
    const ageHealth = 1 - (yearProgress / item.intervalYears);

    // Final health is the minimum of mileage health and age health
    let health = Math.round(Math.min(kmHealth, ageHealth) * 100);
    health = Math.max(0, Math.min(100, health)); // Clamp [0, 100]

    let status = 'good';
    let reason = isOverridden
      ? `상태 양호 (${latestRecord.date || `${Number(latestRecord.km).toLocaleString()}km`} 교환 완료)`
      : '상태 양호 (정기 점검 요망)';

    if (health <= 15) {
      status = 'danger';
      reason = isOverridden 
        ? '🚨 교체 대상 (정비 이후 수명 한계 재초과)' 
        : '🚨 교체 대상 (교체 주기 초과 또는 한계 도달)';
    } else if (health <= 35) {
      status = 'warning';
      reason = isOverridden
        ? '⚠️ 점검 요망 (정비 이후 수명 소모 진행)'
        : '⚠️ 점검 요망 (수명 임박 및 예방 점검 권장)';
    }

    return {
      ...item,
      health,
      status,
      reason,
      kmRemaining,
      yearsRemaining,
      isOverridden,
      historyCount,
      lastReplacedKm: latestRecord ? latestRecord.km : null,
      lastReplacedDate: latestRecord ? latestRecord.date : null,
      lastReplacedCost: latestRecord ? latestRecord.cost : null
    };
  });
}
