import { useState } from 'react'
import styles from './RealCarDiagram.module.css'

const ANNOTATIONS = {
  overview: {
    title: '모하비 2WD 하부/구동계 수리 부위 요약 (실사)',
    subtitle: 'Mohave Chassis & Powertrain Repairs Overview (Real Photo)',
    image: '/mohave_repair_real_01_chassis_overview.png',
    labels: [
      {
        title: '① 휠 얼라이먼트 조정',
        desc: '바퀴 정렬 및 주행 안정성 개선\n비용: 100,100원 (공임)',
        color: '#3498db',
        targets: [{ x: 50, y: 480 }, { x: 950, y: 450 }]
      },
      {
        title: '② 조향 장치 (오무기어) 교체',
        desc: '파워스티어링 기어 & 링키지 교환\n파워스티어링 오일 주입\n비용: 791,850원 (공임 포함)',
        color: '#ff3b30',
        targets: [{ x: 480, y: 340 }]
      },
      {
        title: '③ 앞 하부암 및 볼조인트 교체',
        desc: '로어암 좌/우 및 볼조인트 교체\n스핀들, 캠플레이트, 소모품 등\n비용: 435,580원 (공임 포함)',
        color: '#fa8231',
        targets: [{ x: 200, y: 490 }, { x: 750, y: 470 }]
      },
      {
        title: '④ 자동변속기 오일팬 및 오일 교환',
        desc: '자동변속기 오일팬 교체\n오토 미션 오일 8L 교환\n비용: 480,500원 (공임 포함)',
        color: '#45f3ff',
        targets: [{ x: 540, y: 590 }]
      },
      {
        title: '⑤ GDS/KDS 진단 점검',
        desc: 'GDS/KDS 시스템 정밀 컴퓨터 진단\n비용: 18,200원 (공임)',
        color: '#a0a8b3',
        targets: [{ x: 460, y: 200 }]
      }
    ]
  },
  suspension: {
    title: '조향 및 전륜 서스펜션 (앞바퀴) 상세 수리 내역 (실사)',
    subtitle: 'Front Steering & Suspension System Repairs Detail (Real Photo)',
    image: '/front_suspension_steering_1783045711894.png',
    labels: []
  },
  transmission: {
    title: '자동변속기 (미션) 오일팬 & 미션오일 교환 내역 (실사)',
    subtitle: 'Automatic Transmission Oil Pan & Fluid Replacement Detail (Real Photo)',
    image: '/transmission_oil_pan_1783045722554.png',
    labels: []
  },
  engine_oil: {
    title: '엔진룸 및 오일류/케미컬 정비 상세 내역 (실사)',
    subtitle: 'Engine Room & Fluids Service Detail (Real Photo)',
    image: '/mohave_engine_layout_1783410118006.png',
    labels: []
  },
  rear_suspension: {
    title: '후륜 에어 서스펜션 (에어쇼바) 정비 상세 내역 (실사)',
    subtitle: 'Rear Air Suspension (Air Shocks) Detail (Real Photo)',
    image: '/mohave_rear_suspension_1783466979850.png',
    labels: []
  },
  brake: {
    title: '제동 시스템 (브레이크 디스크/패드/오일) 정비 내역 (실사)',
    subtitle: 'Brake System (Disc Rotor, Caliper & Fluid) Service Detail (Real Photo)',
    image: '/brake_disc_caliper_clean.png',
    labels: []
  }
}

// Fallback universal hotspots for non-Mohave vehicles without custom uploads
const UNIVERSAL_REAL_HOTSPOTS = {
  '엔진':   { label: '엔진룸 정비', top: '22%', left: '50%', color: '#fd9644' },
  '오일류': { label: '오일 및 케미컬 교환', top: '32%', left: '50%', color: '#f5cd79' },
  '조향계': { label: '조향 링키지 장치', top: '42%', left: '50%', color: '#ff3b30' },
  '현가계': { label: '서스펜션 쇼바/링크', top: '50%', left: '50%', color: '#fa8231' },
  '구동계': { label: '변속기 (미션) 동력부', top: '62%', left: '50%', color: '#45f3ff' },
  '제동계': { label: '브레이크 패드/디스크', top: '78%', left: '50%', color: '#f7b731' },
  '냉각계': { label: '냉각수/라디에이터', top: '12%', left: '50%', color: '#26de81' },
  '전기계': { label: '배터리 및 제네레이터', top: '30%', left: '35%', color: '#a29bfe' },
  '외장':   { label: '판금 도색/외관 케어', top: '50%', left: '18%', color: '#74b9ff' },
  '내장':   { label: '실내 필터/내장 클리닝', top: '50%', left: '82%', color: '#fd79a8' },
  '진단점검': { label: '스캐너 진단 컴퓨터', top: '5%', left: '80%', color: '#a0a8b3' },
  '기타':   { label: '기타 보충 정비', top: '90%', left: '50%', color: '#bef264' },
}

// Helper to compute pin coordinates and details for any repair item
function getItemPinConfig(item) {
  const name = (item?.name || '').toLowerCase().replace(/\s/g, '')
  const category = item?.category || '기타'
  const parts = Number(item?.partsCost) || 0
  const labor = Number(item?.laborCost) || 0
  const cost = parts + labor

  let viewTab = 'overview'
  let x = 500
  let y = 500
  let color = '#45f3ff'
  let labelTitle = item.name

  if (name.includes('데후') || name.includes('디퍼런셜') || name.includes('디퍼렌셜') || name.includes('differential')) {
    viewTab = 'rear_suspension'
    x = 500
    y = 650
    color = '#45f3ff'
    labelTitle = `${item.name} (디퍼런셜 기어)`
  } else if (name.includes('에어쇼바') || name.includes('뒷쇼바') || name.includes('후륜')) {
    viewTab = 'rear_suspension'
    x = 500
    y = 420
    color = '#ff3b30'
  } else if (name.includes('egr') || name.includes('쿨러') || name.includes('호스') || name.includes('재순환')) {
    viewTab = 'engine_oil'
    x = 620
    y = 450
    color = '#26de81'
    labelTitle = `${item.name} (EGR 쿨러 호스)`
  } else if (name.includes('브레이크오일') || name.includes('브레이크액')) {
    viewTab = 'brake'
    x = 250
    y = 300
    color = '#ff3b30'
    labelTitle = `${item.name} (브레이크 오일 리저버)`
  } else if (name.includes('브레이크') || name.includes('디스크') || name.includes('패드') || name.includes('캘리퍼') || name.includes('라이닝')) {
    viewTab = 'brake'
    x = 850
    y = 750
    color = '#f7b731'
    labelTitle = `${item.name} (브레이크 디스크 & 캘리퍼)`
  } else if (name.includes('엔진오일') || (category === '엔진' && name.includes('오일'))) {
    viewTab = 'engine_oil'
    x = 480
    y = 400
    color = '#fd9644'
  } else if (name.includes('냉각수') || name.includes('부동액')) {
    viewTab = 'engine_oil'
    x = 320
    y = 280
    color = '#26de81'
  } else if (name.includes('예열플러그') || name.includes('가열플러그') || name.includes('glowplug')) {
    viewTab = 'engine_oil'
    x = 520
    y = 340
    color = '#fd9644'
    labelTitle = `${item.name} (디젤 예열플러그 & 모듈)`
  } else if (name.includes('점화플러그') || name.includes('점화코일') || name.includes('sparkplug')) {
    viewTab = 'engine_oil'
    x = 500
    y = 350
    color = '#fd9644'
    labelTitle = `${item.name} (점화플러그 & 점화코일)`
  } else if (name.includes('인젝터') || name.includes('연료필터') || name.includes('고압펌프')) {
    viewTab = 'engine_oil'
    x = 450
    y = 360
    color = '#fd9644'
    labelTitle = `${item.name} (연료 분사 어셈블리)`
  } else if (name.includes('타이밍') || name.includes('겉벨트') || name.includes('팬벨트')) {
    viewTab = 'engine_oil'
    x = 300
    y = 420
    color = '#26de81'
    labelTitle = `${item.name} (구동 벨트 & 베어링)`
  } else if (name.includes('배터리') || name.includes('제네레이터')) {
    viewTab = 'engine_oil'
    x = 750
    y = 350
    color = '#a29bfe'
  } else if (name.includes('미션') || name.includes('변속기') || name.includes('atf')) {
    viewTab = 'transmission'
    x = 450
    y = 470
    color = '#ff3b30'
  } else if (name.includes('오무기어') || name.includes('조향') || name.includes('타이로드')) {
    viewTab = 'suspension'
    x = 150
    y = 320
    color = '#ff3b30'
  } else if (name.includes('로어암') || name.includes('볼조인트') || name.includes('쇼바') || name.includes('어퍼암')) {
    viewTab = 'suspension'
    x = 420
    y = 590
    color = '#fa8231'
  } else if (category === '엔진' || category === '오일류') {
    viewTab = 'engine_oil'
    x = 500
    y = 350
    color = '#fd9644'
  } else if (category === '구동계') {
    viewTab = 'transmission'
    x = 450
    y = 470
    color = '#ff3b30'
  } else if (category === '조향계' || category === '현가계') {
    viewTab = 'suspension'
    x = 420
    y = 590
    color = '#fa8231'
  } else if (category === '제동계') {
    viewTab = 'brake'
    x = 850
    y = 750
    color = '#f7b731'
  }

  const descText = `${item.name} (${category})\n부품비: ${parts.toLocaleString()}원 | 공임비: ${labor.toLocaleString()}원\n합계: ${cost.toLocaleString()}원${item.note ? `\n비고: ${item.note}` : ''}`

  return {
    item,
    viewTab,
    title: labelTitle,
    desc: descText,
    color,
    x,
    y
  }
}

export default function RealCarDiagram({ repairItems, vehicleInfo, attachedImages }) {
  const [selectedLabel, setSelectedLabel] = useState(null)
  
  // Custom upload gallery index
  const [activeImgIdx, setActiveImgIdx] = useState(0)

  const getImagePath = (path) => {
    if (!path) return ''
    const base = import.meta.env.BASE_URL || '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const cleanBase = base.endsWith('/') ? base : `${base}/`
    return `${cleanBase}${cleanPath}`
  }

  const isMohave = vehicleInfo?.model?.includes('모하비') || vehicleInfo?.model?.toLowerCase()?.includes('mohave')

  // Calculate unique repaired categories
  const repairedCategories = [...new Set(repairItems.map(it => it.category))]
  const isSingleCategory = repairedCategories.length <= 1

  // Auto-pick default tab based on the primary repair item
  const getDefaultTab = () => {
    if (repairItems && repairItems.length > 0) {
      const firstConfig = getItemPinConfig(repairItems[0])
      if (firstConfig.viewTab) return firstConfig.viewTab
    }
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState(getDefaultTab())

  // -------------------------------------------------------------
  // Scenario A: Mohave Real Photo Mode (With CAD mapping annotations)
  // -------------------------------------------------------------
  if (isMohave) {
    const currentTabBase = ANNOTATIONS[activeTab] || ANNOTATIONS.overview

    // Dynamically generate labels matching actual repairItems
    const dynamicLabels = (repairItems && repairItems.length > 0)
      ? repairItems.map(getItemPinConfig)
          .filter(cfg => activeTab === 'overview' || cfg.viewTab === activeTab)
          .map(cfg => ({
            title: cfg.title,
            desc: cfg.desc,
            color: cfg.color,
            targets: [{ x: cfg.x, y: cfg.y }]
          }))
      : currentTabBase.labels

    const currentView = {
      ...currentTabBase,
      labels: dynamicLabels.length > 0 ? dynamicLabels : currentTabBase.labels
    }

    const itemConfigs = (repairItems && repairItems.length > 0) ? repairItems.map(getItemPinConfig) : []
    const itemTabKeys = [...new Set(itemConfigs.map(c => c.viewTab))].filter(Boolean)

    const TAB_LABELS = {
      brake: { icon: '🛑', title: '제동계 (브레이크 디스크/오일)' },
      engine_oil: { icon: '🛢️', title: '엔진룸 및 오일류' },
      transmission: { icon: '⚙️', title: '자동변속기 미션' },
      suspension: { icon: '🔧', title: '조향 및 서스펜션' },
      rear_suspension: { icon: '🌀', title: '후륜 서스펜션/데후' }
    }

    const showOverviewTab = itemTabKeys.length >= 2
    const visibleTabs = showOverviewTab ? ['overview', ...itemTabKeys] : itemTabKeys

    return (
      <div className={styles.wrapper}>
        {visibleTabs.length > 1 && (
          <div className={styles.controls}>
            {visibleTabs.map(tabKey => {
              if (tabKey === 'overview') {
                return (
                  <button
                    key="overview"
                    type="button"
                    className={`${styles.ctrlBtn} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => {
                      setActiveTab('overview')
                      setSelectedLabel(null)
                    }}
                  >
                    🔍 정비 전체 요약 (실사)
                  </button>
                )
              }
              const info = TAB_LABELS[tabKey] || { icon: '🔧', title: tabKey }
              return (
                <button
                  key={tabKey}
                  type="button"
                  className={`${styles.ctrlBtn} ${activeTab === tabKey ? styles.active : ''}`}
                  onClick={() => {
                    setActiveTab(tabKey)
                    setSelectedLabel(null)
                  }}
                >
                  {info.icon} {info.title}
                </button>
              )
            })}
          </div>
        )}

        <div className={styles.container}>
          <img
            src={getImagePath(currentView.image)}
            alt={currentView.title}
            className={styles.bgImage}
          />
          <div className={styles.scanOverlay} />

          <div className={styles.infoOverlay}>
            <div className={styles.viewTitle}>{currentView.title}</div>
            <div className={styles.viewSubtitle}>{currentView.subtitle}</div>
          </div>


          {currentView.labels.map((label, labelIdx) => {
            return label.targets.map((target, targetIdx) => {
              const isSelected = selectedLabel?.title === label.title
              
              return (
                <div
                  key={`${labelIdx}-${targetIdx}`}
                  className={`${styles.hotspot} ${isSelected ? styles.hotspotActive : ''}`}
                  style={{
                    left: `${target.x / 10}%`,
                    top: `${target.y / 10}%`,
                    '--part-color': label.color
                  }}
                  onClick={() => setSelectedLabel(label)}
                >
                  <div className={styles.pulseRing} />
                  <div className={styles.pulseRingSecondary} />
                  <div className={styles.centerDot} />
                  <div className={styles.labelTooltip}>{label.title}</div>
                </div>
              )
            })
          })}

          {selectedLabel && (
            <div
              className={styles.fullCard}
              style={{ borderColor: selectedLabel.color }}
            >
              <div className={styles.cardHeader} style={{ color: selectedLabel.color }}>
                📌 {selectedLabel.title}
              </div>
              <button className={styles.closeCardBtn} onClick={() => setSelectedLabel(null)}>✕</button>
              <div className={styles.cardBody}>
                {selectedLabel.desc.split('\n').map((line, idx) => (
                  <div key={idx} className={styles.cardLine}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }


  // -------------------------------------------------------------
  // Scenario C: Fallback Generic Undercarriage Lift Hotspot Mode
  // -------------------------------------------------------------
  const repairedCats = [...new Set(repairItems.map(it => it.category))]
  
  return (
    <div className={styles.wrapper}>
      <div className={styles.fallbackHeader}>
        🚘 {vehicleInfo?.maker} {vehicleInfo?.model} 정비 부위 매핑 (실사 매칭)
      </div>
      
      <div className={styles.container}>
        <img
          src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop"
          alt="Generic Vehicle Undercarriage Lift"
          className={styles.bgImage}
        />
        <div className={styles.scanOverlay} />

        {repairedCats.map(cat => {
          const part = UNIVERSAL_REAL_HOTSPOTS[cat]
          if (!part) return null
          const isSelected = selectedLabel?.title === part.label

          // Get items for this category to list inside fullCard
          const items = repairItems.filter(it => it.category === cat)

          return (
            <div
              key={cat}
              className={`${styles.hotspot} ${isSelected ? styles.hotspotActive : ''}`}
              style={{
                top: part.top,
                left: part.left,
                '--part-color': part.color
              }}
              onClick={() => setSelectedLabel({
                title: part.label,
                color: part.color,
                desc: items.map(it => `• ${it.name} (${(Number(it.partsCost) || 0).toLocaleString()}원)`).join('\n')
              })}
            >
              <div className={styles.pulseRing} />
              <div className={styles.pulseRingSecondary} />
              <div className={styles.centerDot} />
              <div className={styles.labelTooltip}>{part.label}</div>
            </div>
          )
        })}

        {selectedLabel && (
          <div
            className={styles.fullCard}
            style={{ borderColor: selectedLabel.color }}
          >
            <div className={styles.cardHeader} style={{ color: selectedLabel.color }}>
              📌 {selectedLabel.title}
            </div>
            <button className={styles.closeCardBtn} onClick={() => setSelectedLabel(null)}>✕</button>
            <div className={styles.cardBody}>
              {selectedLabel.desc.split('\n').map((line, idx) => (
                <div key={idx} className={styles.cardLine}>{line}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
