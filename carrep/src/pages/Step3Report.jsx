import { useState, useRef } from 'react'
import styles from './Step3Report.module.css'
import CarDiagram from '../components/CarDiagram'
import RealCarDiagram from '../components/RealCarDiagram'
import ServicePhotoVisualizer from '../components/ServicePhotoVisualizer'

const PART_MAP = {
  '조향계': { label: '조향계', color: '#ff3b30', class: styles.sysSteering },
  '현가계': { label: '현가계', color: '#fa8231', class: styles.sysSuspension },
  '구동계': { label: '구동계', color: '#45f3ff', class: styles.sysTrans },
  '엔진':   { label: '엔진', color: '#fd9644', class: styles.sysEngine },
  '오일류': { label: '오일류', color: '#fd9644', class: styles.sysOil },
  '제동계': { label: '제동계', color: '#f7b731', class: styles.sysBrake },
  '냉각계': { label: '냉각계', color: '#26de81', class: styles.sysCooling },
  '전기계': { label: '전기계', color: '#a29bfe', class: styles.sysElectric },
  '외장':   { label: '외장', color: '#74b9ff', class: styles.sysExterior },
  '내장':   { label: '내장', color: '#fd79a8', class: styles.sysInterior },
  '진단점검': { label: '진단점검', color: '#a0a8b3', class: styles.sysDiag },
  '기타':   { label: '기타', color: '#bef264', class: styles.sysEtc },
}

export default function Step3Report({
  vehicleInfo,
  repairItems,
  attachedImages,
  onPrev,
  onReset,
  onSave,
  isSaved
}) {
  const reportRef = useRef()
  const [diagramMode, setDiagramMode] = useState('real') // 'real' | '3d'
  const [filterCat, setFilterCat] = useState('all') // 'all' | 'steering' | 'susp' | 'trans'
  const [activeAccordion, setActiveAccordion] = useState(0) // active accordion index (0, 1, 2, or null)

  const totalParts = repairItems.reduce((s, it) => s + (Number(it.partsCost) || 0), 0)
  const totalLabor = repairItems.reduce((s, it) => s + (Number(it.laborCost) || 0), 0)
  const totalSupply = totalParts + totalLabor
  const vat = Math.round(totalSupply * 0.1)
  const grandTotal = totalSupply + vat

  // Calculate parts and labor ratios for the gauge bar
  const partsRatio = totalSupply > 0 ? (totalParts / totalSupply) * 100 : 0
  const laborRatio = totalSupply > 0 ? (totalLabor / totalSupply) * 100 : 0

  const handlePrint = () => window.print()

  // Filter repair items for the table
  const filteredItems = repairItems.filter(item => {
    if (filterCat === 'all') return true
    if (filterCat === 'steering') return item.category === '조향계'
    if (filterCat === 'susp') return item.category === '현가계'
    if (filterCat === 'trans') {
      return item.category === '구동계' || item.category === '오일류'
    }
    return true
  })

  // Format system badge label and style class
  const getBadgeClass = (category) => {
    return (PART_MAP[category] || {}).class || styles.sysEtc
  }
  const getBadgeLabel = (category) => {
    return (PART_MAP[category] || {}).label || category
  }

function getTechDocForItem(item) {
  const name = (item?.name || '').toLowerCase().replace(/\s/g, '')
  const category = item?.category || '일반정비'

  if (name.includes('데후') || name.includes('디퍼런셜') || name.includes('디퍼렌셜') || name.includes('differential')) {
    return {
      title: `${item.name} - 디퍼런셜 기어(데후) 정밀 기술서`,
      category: '구동계',
      purpose: [
        '후륜 및 4WD 구동축 디퍼런셜(차동) 기어 하우징 내부 고하중 베어링과 엑슬 기어의 마모를 방지하고 고온 윤활막을 형성합니다.',
        '직선 및 급선회 시 좌우 바퀴의 회전차를 부드럽게 흡수 보정하여 구동력 손실 없는 안정적 선회 주행을 유지합니다.',
        '기어 마찰열 및 슬러지를 방출시켜 오일 씰 파손 및 고열 변형을 막아줍니다.'
      ],
      danger: [
        '데후오일 교환 주기 오버 시 점도 파괴로 기어 간 직접 마찰이 발생하여 주행 중 \'웅-\' 하는 하부 이음(우웅 소리)이 점차 극심해집니다.',
        '디퍼런셜 피니언/링 기어 마모로 가속/감속 충격 및 구동 이음이 발생합니다.',
        '심각할 경우 디퍼런셜 차동 기어가 고착(파손)되어 바퀴가 잠기고 주행 불능 상태에 빠집니다.'
      ]
    }
  }

  if (name.includes('예열플러그') || name.includes('가열플러그') || name.includes('glowplug')) {
    return {
      title: `${item.name} - 디젤 엔진 예열플러그 & 실린더 착화 보조 시스템 정밀 기술서`,
      category: '엔진',
      purpose: [
        '디젤 엔진의 저온 시동 시 연소실(실린더) 내부 공기를 순식간에 고온으로 가열하여 압축 자착화가 원활히 일어나도록 지원합니다.',
        '시동 직후 포스트 히팅(Post Heating) 과정을 거쳐 초기 배출가스(매연/흰연기) 및 디젤 부동 진동(노킹)을 대폭 저감합니다.',
        '엔진 착화 온도를 신속히 상승시켜 연료 인젝터 분사 미세화 연소를 돕습니다.'
      ],
      danger: [
        '예열플러그 단선/단락 시 겨울철 및 아침 저온 초기 시동 불능(시동 지연/안 걸림) 현상이 발생합니다.',
        '미연소 디젤 연료 배출로 인해 DPF(매연저감장치) 포집량이 급증하고 연소실 카본 슬러지가 누적됩니다.',
        '단선 상태 방치 시 예열 릴레이 모듈 과부하 및 엔진 경고등이 지속 점등됩니다.'
      ]
    }
  }

  if (name.includes('점화플러그') || name.includes('점화코일') || name.includes('sparkplug')) {
    return {
      title: `${item.name} - 가솔린 엔진 점화플러그 & 고압 코일 정밀 기술서`,
      category: '엔진',
      purpose: [
        '고압 점화코일에서 발생한 2만V 이상의 고전압 전기를 이용해 실린더 내부 혼합기에 불꽃(Spark)을 튀겨 불꽃 연소를 유도합니다.',
        '실린더 내 최적의 연소 타이밍에 전기 불꽃을 발생시켜 엔진 출력을 폭발시킵니다.'
      ],
      danger: [
        '점화플러그 팁 마모 시 미스파이어(실화) 현상으로 가속 시 덜컥거리는 엔진 찜빠(부동) 진동이 발생합니다.',
        '연료 실화로 연소되지 않은 가솔린 유입 시 삼원 촉매 변환기 고열 파손 및 연비가 극심하게 하락합니다.'
      ]
    }
  }

  if (name.includes('엔진오일') || (category === '엔진' && name.includes('오일'))) {
    return {
      title: `${item.name} - 엔진 윤활 시스템 정밀 기술서`,
      category: '오일류',
      purpose: [
        '엔진 내부 피스톤, 실린더, 크랭크축 부품의 마찰을 극소화하여 부품 마모를 방지하고 출력을 보존합니다.',
        '실린더 내부 기밀성을 유지하고 엔진 내부 연소 고열을 식혀주는 유체 냉각 작용을 수행합니다.',
        '엔진 내부 불순물 및 카본 슬러지를 필터가 걸러내어 엔진 작동 안정성을 지속시킵니다.'
      ],
      danger: [
        '오일 수명 다할 시 점도가 파괴되어 금속 직마찰로 엔진 작동음이 커지고 연비가 하락합니다.',
        '카본 슬러지가 오일 통로를 막으면 엔진 부품 고착 및 주행 중 시동 꺼짐이 발생합니다.',
        '엔진 과열로 인한 블록 손상 시 고가의 엔진 오버홀 작업이 필요합니다.'
      ]
    }
  }

  if (name.includes('egr') || name.includes('쿨러호스') || name.includes('쿨러') || name.includes('호스') || name.includes('재순환')) {
    return {
      title: `${item.name} - EGR 쿨러 & 배기가스 재순환 냉각 시스템 정밀 기술서`,
      category: '엔진',
      purpose: [
        '엔진 배기가스를 고열 상태에서 실린더로 재순환시키기 전 EGR 쿨러가 부동액으로 열을 식혀 질소산화물(NOx) 배출을 억제합니다.',
        'EGR 쿨러 고온 호스는 고열의 부동액 유체를 누수 없이 쿨러 어셈블리로 유입/배출시키는 기밀 유체 라인 역할을 합니다.',
        '배기가스 재순환 온도를 저하시켜 엔진 과열 방지 및 연소 효율성을 향상시킵니다.'
      ],
      danger: [
        'EGR 쿨러 호스 열화 및 경화 균열 발생 시 엔진 부동액(냉각수)이 급격히 누수되어 엔진 오버히트(과열) 위험이 극대화됩니다.',
        '쿨러 라인 누설 시 냉각수가 실린더/배기 라인으로 유입되어 머플러 백색 연기(흰 연기) 소진 및 엔진 경고등이 점등됩니다.',
        '방치 시 엔진 실린더 헤드 가스켓 파손 및 시동 꺼짐 중대 고장으로 이어질 수 있습니다.'
      ]
    }
  }

  if (name.includes('미션오일') || name.includes('변속기오일') || name.includes('atf') || name.includes('cvt')) {
    return {
      title: `${item.name} - 자동변속기 유압 제어 정밀 기술서`,
      category: '구동계',
      purpose: [
        '변속기 내부 토크컨버터 및 유압 밸브바디를 작동시키는 동력 전달 핵심 매개체 역할을 합니다.',
        '오일팬 자석 필터가 기어 변속 시 발생하는 미세 금속 가루를 필터링하여 변속 라인을 보호합니다.',
        '변속 클러치 디스크의 과열 및 변속 충격을 방지하여 부드럽고 정밀한 변속감을 유지합니다.'
      ],
      danger: [
        '미션오일 누유 또는 점도 저하 시 변속 슬립(rpm 상승 후 변속 지연) 및 충격이 가해집니다.',
        '유압 밸브바디 오염으로 특정 변속 단수 고정 현상이 일어납니다.',
        '윤활 부족으로 변속기 디스크 손상 시 고가의 미션 전체 교체가 필요합니다.'
      ]
    }
  }

  if (name.includes('브레이크') || name.includes('패드') || name.includes('디스크') || name.includes('캘리퍼')) {
    return {
      title: `${item.name} - 제동 시스템 캘리퍼 & 디스크 정밀 기술서`,
      category: '제동계',
      purpose: [
        '마찰재 기반 캘리퍼 브레이크 패드가 디스크 로터를 압착하여 차량을 유효 거리에 정지시킵니다.',
        '브레이크액 유압을 각 바퀴 캘리퍼 피스톤으로 고르게 전달합니다.',
        '디스크 열 방출 구조로 페이드(Fade) 현상을 제어하여 고속 제동 안정성을 확보합니다.'
      ],
      danger: [
        '패드 마모 한계선 초과 시 디스크 긁힘 및 금속성 마찰음이 발생합니다.',
        '브레이크액 열화 시 베이퍼 록(Vapor Lock)으로 페달이 푹 꺼지는 제동 스폰지 현상이 일어납니다.',
        '제동 거리 연장으로 전방 추돌 사고 위험이 대폭 증가합니다.'
      ]
    }
  }

  if (name.includes('쇼바') || name.includes('서스펜션') || name.includes('로어암') || name.includes('어퍼암') || name.includes('에어쇼바')) {
    return {
      title: `${item.name} - 서스펜션 완충 & 차륜 정렬 정밀 기술서`,
      category: '현가계',
      purpose: [
        '노면 충격을 서스펜션 쇼크업소버 및 에어스프링이 완충 흡수하여 타이어 접지력을 유지합니다.',
        '로어암 및 하부 부싱이 휠 캐스터/캠버 값을 유지하여 안정적인 조종성을 줍니다.',
        '급가속, 급제동 및 코너링 시 차체 롤링과 피칭 쏠림을 억제합니다.'
      ],
      danger: [
        '쇼바 감쇄력 손상 시 요철 주행 후 둥둥거리는 바운싱 현상과 하부 이음이 심해집니다.',
        '로어암 부싱 찢어짐 시 방지턱 주행 시 찌걱거림과 타이어 이상 편마모가 유발됩니다.',
        '볼조인트 유격 발생 시 주행 안정성이 떨어지며 최악의 경우 바퀴가 이탈될 수 있습니다.'
      ]
    }
  }

  if (name.includes('오무기어') || name.includes('조향') || name.includes('타이로드') || name.includes('스티어링')) {
    return {
      title: `${item.name} - 조향 기어박스 & 링키지 정밀 기술서`,
      category: '조향계',
      purpose: [
        '운전자의 핸들 회전 운동을 앞바퀴 좌우 슬라이딩 조향 유동으로 전환합니다.',
        '파워 어시스트로 주행 및 정차 시 부드럽고 가벼운 핸들링을 제공합니다.',
        '노면 충격이 핸들로 역전달되는 킥백 현상을 차단합니다.'
      ],
      danger: [
        '오무기어 유압 씰 파손 시 누유로 핸들이 급격히 무거워집니다.',
        '기어 유격 심화 시 핸들 이음 및 조향 유격(놀이)이 헐거워집니다.'
      ]
    }
  }

  if (name.includes('에어컨') || name.includes('캐빈필터')) {
    return {
      title: `${item.name} - 실내 캐빈 공기정화 필터 정밀 기술서`,
      category: '내장',
      purpose: [
        '외부 황사, 미세먼지, 유해 공해 물질을 억제하여 쾌적한 실내 공기를 유지합니다.',
        '블로워 모터 및 에어컨 공조기 내부 곰팡이 및 냄새 원인 물질을 걸러냅니다.'
      ],
      danger: [
        '필터 막힘 시 에어컨/히터 풍량이 급감하고 실내 악취가 발생합니다.'
      ]
    }
  }

  if (name.includes('배터리') || name.includes('제네레이터')) {
    return {
      title: `${item.name} - 전장 배터리 & 발전기 정밀 기술서`,
      category: '전기계',
      purpose: [
        '시동 모터 구동 전력 및 차량 전장 제어장치(ECU) 전원을 안정적으로 공급합니다.',
        '제네레이터(발전기)가 주행 중 전력을 충전하고 전장 기기 동작을 유지합니다.'
      ],
      danger: [
        '배터리 시동 전압 하강 시 겨울철 시동 불능이 발생합니다.',
        '발전기 전압 불안정 시 주행 중 전자 제어 시스템 오류 및 시동 꺼짐이 유발됩니다.'
      ]
    }
  }

  if (name.includes('냉각수') || name.includes('부동액') || name.includes('라디에이터')) {
    return {
      title: `${item.name} - 엔진 냉각 시스템 정밀 기술서`,
      category: '냉각계',
      purpose: [
        '엔진 내부에서 발생하는 고열을 라디에이터로 전달하여 적정 주행 온도를 유지합니다.',
        '부동액 방청제가 냉각 라인 내부 부식을 막고 워터펌프 작동을 지원합니다.'
      ],
      danger: [
        '냉각수 누수 시 엔진 오버히트(과열)로 헤드 가스켓 파손 및 엔진 변형이 일어납니다.'
      ]
    }
  }

  // Fallback for custom items
  return {
    title: `${item.name} - 정밀 기술서`,
    category: category,
    purpose: [
      `[${item.name}] 항목의 탈거 및 정밀 교체 수리를 진행하여 관련 시스템의 정상 작동 상태를 복원하였습니다.`,
      '체결 토크 기준을 준수하여 정밀하게 장착 완료하였습니다.',
      '수리 완료 후 기밀성 및 동작 안정성 테스트를 마쳤습니다.'
    ],
    danger: [
      '소모품 및 정비 주기를 초과할 경우 연관 부품의 차후 교체 비용이 상승할 수 있습니다.',
      '주행 중 이상 진동이나 이음 발생 시 즉시 점검을 권장합니다.'
    ]
  }
}

  const uniqueRepairedCategories = new Set(repairItems.map(it => it.category))
  const isSingleCategory = uniqueRepairedCategories.size <= 1

  const filteredAccordionData = repairItems.map(getTechDocForItem)

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index)
  }

  return (
    <div className={styles.wrapper} ref={reportRef}>
      {/* Sticky Floating Edit Button on the Right Side */}
      {/* Floating Sticky Circular Right Edit Button */}
      <div className={styles.floatingRightAction}>
        <button
          type="button"
          className={styles.floatingCircularBtn}
          onClick={onPrev}
          title="정비내역 수정 화면으로 이동"
        >
          <span className={styles.floatingBtnIcon}>✏️</span>
          <span className={styles.floatingBtnLabel}>수정</span>
        </button>
      </div>

      {/* Actions Bar */}
      <div className={styles.actionsBar} id="reportActions">
        <div className={styles.actionLeft}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onPrev}>
            ← 이전
          </button>
        </div>
        <div className={styles.actionRight}>
          <button className={`${styles.btn} ${styles.btnSave}`} onClick={onSave}>
            <span className={styles.actionBadgeIcon}>💾</span>
            <span className={styles.actionBtnText}>저장</span>
          </button>
          <button className={`${styles.btn} ${styles.btnPrint}`} onClick={handlePrint}>
            <span className={styles.actionBadgeIcon}>🖨️</span>
            <span className={styles.actionBtnText}>인쇄 / PDF</span>
          </button>
        </div>
      </div>

      <div className={styles.report}>
        {/* Dashboard Header */}
        <header className={styles.reportHeader}>
          <div className={styles.headerTitle}>
            <h1>{vehicleInfo.year || '2009'} {vehicleInfo.maker || '기아'} {vehicleInfo.model || '모하비'} 정비 & 수리 보고서</h1>
            <p className={styles.headerSubtitle}>
              Auto Service Inspection & Technical Maintenance Report
            </p>
            <span className={styles.vehicleBadge}>
              {vehicleInfo.model || '모하비'} {vehicleInfo.driveType || '2WD'} • {vehicleInfo.year || '2009'}년식 • {vehicleInfo.mileage ? Number(vehicleInfo.mileage).toLocaleString() + ' km' : '185,000 km'}
            </span>
          </div>
        </header>

        {/* Main Dashboard Layout Grid */}
        <div className={styles.dashboardGrid}>
          {/* Left: Interactive Image Visualizer */}
          <div className={styles.visualizerPanel}>
            <div className={styles.controlsRow}>
              <div className={styles.tabs}>
                <span style={{ fontSize: '14px', fontWeight: 800 }}>🔧 정비 시스템 모니터</span>
              </div>
              {!isSingleCategory && (
                <div className={styles.viewModes} id="diagramTabs">
                  <button
                    type="button"
                    className={`${styles.viewBtn} ${diagramMode === 'real' ? styles.viewBtnActive : ''}`}
                    onClick={() => setDiagramMode('real')}
                  >
                    실물 사진 (Real)
                  </button>
                  <button
                    type="button"
                    className={`${styles.viewBtn} ${diagramMode === '3d' ? styles.viewBtnActive : ''}`}
                    onClick={() => setDiagramMode('3d')}
                  >
                    3D 도면 (3D)
                  </button>
                </div>
              )}
            </div>

            <div className={styles.diagramWrap}>
              {diagramMode === '3d' ? (
                <CarDiagram repairItems={repairItems} vehicleInfo={vehicleInfo} />
              ) : (
                <RealCarDiagram repairItems={repairItems} vehicleInfo={vehicleInfo} attachedImages={attachedImages} />
              )}
            </div>
          </div>

          {/* Right: Cost Summary Panel */}
          <div className={styles.costPanel}>
            {/* Total Billing Card */}
            <div className={styles.summaryCard}>
              <div className="label" style={{ color: '#a0a8b3', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                총 정비 청구 금액 (VAT 포함)
              </div>
              <div className="value" style={{ color: '#45f3ff', fontSize: '28px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>
                {grandTotal.toLocaleString()} 원
              </div>
              <div className="meta" style={{ color: '#a0a8b3', fontSize: '11px', marginTop: '8px', lineHeight: 1.5 }}>
                공급가액: {totalSupply.toLocaleString()}원 (공임 {totalLabor.toLocaleString()}원 + 부품 {totalParts.toLocaleString()}원) <br />
                부가가치세 (10%): {vat.toLocaleString()}원
              </div>
            </div>

            {/* Parts vs Labor Ratio Bar */}
            <div className={styles.ratioSection}>
              <div className={styles.ratioHeader}>
                <span>공급가 비중 분석</span>
                <span style={{ fontWeight: 700, color: '#45f3ff' }}>
                  {partsRatio >= laborRatio
                    ? `부품비 비중 우세 (${partsRatio.toFixed(1)}%)`
                    : `정비공임 비중 우세 (${laborRatio.toFixed(1)}%)`}
                </span>
              </div>
              <div className={styles.ratioBar}>
                <div className={styles.ratioParts} style={{ width: `${partsRatio}%` }} />
                <div className={styles.ratioLabor} style={{ width: `${laborRatio}%` }} />
              </div>
              <div className={styles.ratioLabels}>
                <span>
                  <span className={`${styles.dot} ${styles.parts}`} />
                  부품비 ({partsRatio.toFixed(1)}% / {totalParts.toLocaleString()}원)
                </span>
                <span>
                  <span className={`${styles.dot} ${styles.labor}`} />
                  정비공임 ({laborRatio.toFixed(1)}% / {totalLabor.toLocaleString()}원)
                </span>
              </div>
            </div>

            {/* Table Filters and Item Table */}
            <div className={styles.controlsRow} style={{ border: 'none', paddingBottom: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: 700 }}>세부 부품 및 공임 내역 (공급가 기준)</span>
              <div className={styles.tableFilter}>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterCat === 'all' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterCat('all')}
                >
                  전체
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterCat === 'steering' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterCat('steering')}
                >
                  조향
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterCat === 'susp' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterCat('susp')}
                >
                  현가
                </button>
                <button
                  type="button"
                  className={`${styles.filterBtn} ${filterCat === 'trans' ? styles.filterBtnActive : ''}`}
                  onClick={() => setFilterCat('trans')}
                >
                  미션
                </button>
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.itemTable}>
                <thead>
                  <tr>
                    <th>정비일자</th>
                    <th>구분</th>
                    <th>정비 항목</th>
                    <th className={styles.numCol}>부품비</th>
                    <th className={styles.numCol}>공임</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map(item => (
                    <tr key={item.id}>
                      <td style={{ fontSize: '0.8rem', color: '#a0a8b3', whiteSpace: 'nowrap' }}>
                        📅 {item.repairDate || vehicleInfo.repairDate || new Date().toISOString().split('T')[0]}
                      </td>
                      <td>
                        <span className={`${styles.systemBadge} ${getBadgeClass(item.category)}`}>
                          {getBadgeLabel(item.category)}
                        </span>
                      </td>
                      <td>{item.name}</td>
                      <td className={styles.numCol}>{(Number(item.partsCost) || 0).toLocaleString()}</td>
                      <td className={styles.numCol}>{(Number(item.laborCost) || 0).toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#a0a8b3', padding: '20px 0' }}>
                        해당 카테고리의 정비 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Attached & Auto-Generated Repair Component Photos */}
        {(attachedImages.length > 0 || repairItems.length > 0) && (
          <div className={styles.gallerySection}>
            <ServicePhotoVisualizer
              attachedImages={attachedImages}
              repairItems={repairItems}
              vehicleInfo={vehicleInfo}
            />
          </div>
        )}

        {/* Footer */}
        <div className={styles.reportFooter}>
          <div className={styles.footerLine1}>본 보고서는 CarRep 차량 정비 관리 시스템에 의해 자동 생성되었습니다.</div>
          <div className={styles.footerLine2}>보고서 생성일시: {new Date().toLocaleString('ko-KR')}</div>
        </div>
      </div>
    </div>
  )
}
