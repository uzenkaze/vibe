import { useState, useRef } from 'react'
import styles from './CarDiagram.module.css'

const PART_MAP = {
  '조향계': { label: '조향 장치', cx: 300, cy: 195, rx: 80, ry: 28, fill: '#ff3b30' },
  '현가계': { label: '서스펜션 / 현가계', cx: 300, cy: 300, rx: 110, ry: 30, fill: '#fa8231' },
  '구동계': { label: '변속기 / 구동계', cx: 300, cy: 370, rx: 75, ry: 28, fill: '#45f3ff' },
  '엔진':   { label: '엔진', cx: 300, cy: 145, rx: 72, ry: 35, fill: '#fd9644' },
  '제동계': { label: '브레이크 / 제동계', cx: 300, cy: 430, rx: 80, ry: 22, fill: '#f7b731' },
  '냉각계': { label: '냉각 시스템', cx: 300, cy: 95, rx: 60, ry: 20, fill: '#26de81' },
  '전기계': { label: '전장 시스템', cx: 300, cy: 500, rx: 70, ry: 20, fill: '#a29bfe' },
  '외장':   { label: '외장 / 차체', cx: 300, cy: 300, rx: 145, ry: 270, fill: 'none' },
  '내장':   { label: '내장재', cx: 300, cy: 320, rx: 65, ry: 55, fill: '#fd79a8' },
  '진단점검': { label: '진단 점검', cx: 300, cy: 250, rx: 90, ry: 20, fill: '#a0a8b3' },
  '기타':   { label: '기타 부위', cx: 300, cy: 480, rx: 60, ry: 18, fill: '#bef264' },
  '오일류': { label: '오일류 및 케미컬', cx: 300, cy: 230, rx: 75, ry: 24, fill: '#f5cd79' }
}

const MOHAVE_3D_ANNOTATIONS = {
  overview: {
    title: '모하비 2WD 하부/구동계 수리 부위 요약',
    subtitle: 'Mohave Chassis & Powertrain Repairs Overview',
    image: '/mohave_chassis_layout_1783045700836.png',
    labels: [
      {
        title: '① 휠 얼라이먼트 조정',
        desc: '바퀴 정렬 및 주행 안정성 개선\n비용: 100,100원 (공임)',
        color: '#3498db',
        targets: [{ x: 180, y: 680 }, { x: 750, y: 780 }]
      },
      {
        title: '② 조향 장치 (오무기어) 교체',
        desc: '파워스티어링 기어 & 링키지 교환\n파워스티어링 오일 주입\n비용: 791,850원 (공임 포함)',
        color: '#ff3b30',
        targets: [{ x: 420, y: 720 }]
      },
      {
        title: '③ 앞 하부암 및 볼조인트 교체',
        desc: '로어암 좌/우 및 볼조인트 교체\n스핀들, 캠플레이트, 소모품 등\n비용: 435,580원 (공임 포함)',
        color: '#fa8231',
        targets: [{ x: 280, y: 670 }, { x: 580, y: 750 }]
      },
      {
        title: '④ 자동변속기 오일팬 및 오일 교환',
        desc: '자동변속기 오일팬 교체\n오토 미션 오일 8L 교환\n비용: 480,500원 (공임 포함)',
        color: '#45f3ff',
        targets: [{ x: 470, y: 520 }]
      },
      {
        title: '⑤ GDS/KDS 진단 점검',
        desc: 'GDS/KDS 시스템 정밀 컴퓨터 진단\n비용: 18,200원 (공임)',
        color: '#a0a8b3',
        targets: [{ x: 460, y: 420 }]
      }
    ]
  },
  suspension: {
    title: '조향 및 전륜 서스펜션 (앞바퀴) 상세 수리 내역',
    subtitle: 'Front Steering & Suspension System Repairs Detail',
    image: '/front_suspension_steering_1783045711894.png',
    labels: [
      {
        title: '파워스티어링 기어 & 링키지 (오무기어) 교체',
        desc: '기어 & 링키지 어셈블리 교환 (파워 스티어)\n파워스티어링 오일 주입 완료\n부품: 629,200원 | 공임: 145,600원 | 오일: 17,050원\n합계: 791,850원',
        color: '#ff3b30',
        targets: [{ x: 490, y: 490 }]
      },
      {
        title: '프론트 하부암 (로어암 좌/우) 교체',
        desc: '암 컴프리트-프론트 하부 (로어암 좌/우) 교체\n부품: 189,420원 (각 94,710원)\n공임: 63,700원\n합계: 253,120원',
        color: '#fa8231',
        targets: [{ x: 350, y: 520 }, { x: 630, y: 600 }]
      },
      {
        title: '하부암 볼 조인트 (양쪽) 교체',
        desc: '하부암 볼조인트 어셈블리 (양쪽) 교체\n부품: 28,600원 (각 14,300원)\n공임: 91,000원\n합계: 119,600원',
        color: '#f7b731',
        targets: [{ x: 255, y: 495 }, { x: 750, y: 690 }]
      },
      {
        title: '로어암 고착 볼트 교체 및 산소 작업',
        desc: '고착 볼트 해체 작업 (산소 토치 사용): 24,420원\n로어암 스핀들 (4개): 15,640원\n캠 플레이트 B (4개): 7,200원\n볼트, 너트, 와셔 소모품: 15,620원\n합계: 62,880원',
        color: '#e67e22',
        targets: [{ x: 440, y: 545 }, { x: 550, y: 580 }]
      },
      {
        title: '휠 얼라이먼트 조정 (4월)',
        desc: '하체 부품 대대적 교체 후 정렬 작업\n타이어 이상 마모 방지 및 주행성 셋팅\n비용: 100,100원',
        color: '#3498db',
        targets: [{ x: 170, y: 360 }, { x: 800, y: 650 }]
      }
    ]
  },
  transmission: {
    title: '자동변속기 (미션) 오일팬 & 미션오일 교환 내역',
    subtitle: 'Automatic Transmission Oil Pan & Fluid Replacement Detail',
    image: '/transmission_oil_pan_1783045722554.png',
    labels: [
      {
        title: '자동변속기 오일팬 어셈블리 교체',
        desc: '팬 어셈블리-자동변속기 오일 교체\n누유 차단 및 신품 오일팬 장착\n부품: 228,800원 | 공임: 63,700원\n합계: 292,500원',
        color: '#ff3b30',
        targets: [{ x: 480, y: 770 }]
      },
      {
        title: '오토 미션 오일 (8L) 교환',
        desc: '고성능 규격 오토 미션 오일 주입\n용량: 8리터\n비용: 188,000원 (리터당 23,500원)\n합계: 188,000원',
        color: '#3498db',
        targets: [{ x: 550, y: 400 }]
      },
      {
        title: 'GDS/KDS 진단 점검',
        desc: '변속 제어 시스템 진단 및 센서 점검\nGDS/KDS 정밀 스캐너 진단\n비용: 18,200원',
        color: '#a0a8b3',
        targets: [{ x: 250, y: 320 }]
      }
    ]
  },
  rear_suspension: {
    title: '후륜 에어 서스펜션 (에어쇼바) 상세 수리 내역',
    subtitle: 'Rear Air Suspension (Air Shocks) Replacement Detail',
    image: '/mohave_rear_suspension_1783466979850.png',
    labels: [
      {
        title: '후륜 에어 서스펜션 벨로우즈 (에어백) 교체',
        desc: '에어스프링 벨로우즈-리어 (에어백 좌/우) 교체\n차고 조절 최적화 및 승차감 복원\n부품 및 공임 포함\n합계: 420,000원',
        color: '#ff3b30',
        targets: [{ x: 500, y: 450 }]
      },
      {
        title: '에어 컴프레셔 및 공기 라인 점검',
        desc: '에어 공급 컴프레셔 구동 상태 및 유압 라인 누기 점검\n시스템 진단 및 기밀 테스트 완료',
        color: '#3498db',
        targets: [{ x: 280, y: 300 }]
      },
      {
        title: '후륜 쇼크업소버 (쇼바 좌/우) 교체',
        desc: '진동 댐퍼 감쇠력 유지 부품 교체\n부품: 160,000원 | 공임: 70,000원\n합계: 230,000원',
        color: '#fa8231',
        targets: [{ x: 650, y: 400 }]
      }
    ]
  },
  engine_oil: {
    title: '엔진룸 및 오일류/케미컬 정비 상세 내역',
    subtitle: 'Engine Room & Fluids Service Detail',
    image: '/mohave_engine_layout_1783410118006.png',
    labels: [
      {
        title: '엔진 오일 및 필터 세트 교환',
        desc: '엔진 윤활 시스템 관리 및 노화 방지\n오일 필터 및 에어클리너 세트 동시 교환\n부품 및 공임 포함\n합계: 120,000원',
        color: '#fd9644',
        targets: [{ x: 500, y: 400 }]
      },
      {
        title: '파워스티어링 오일 주입',
        desc: '조향 유압 작동유 레벨 보충 및 세척\n부품: 17,050원 | 공임: 0원\n합계: 17,050원',
        color: '#ff3b30',
        targets: [{ x: 320, y: 350 }]
      },
      {
        title: '냉각수 및 부동액 레벨 조정',
        desc: '엔진 과열 예방 및 부식 방지\n냉각계 리저버 탱크 보충 점검 완료',
        color: '#26de81',
        targets: [{ x: 220, y: 280 }]
      }
    ]
  }
}

export default function CarDiagram({ repairItems, vehicleInfo }) {
  const containerRef = useRef(null)
  const [hoveredCat, setHoveredCat] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  
  // Mohave detailed 3D view states - auto-activate based on actual repaired categories
  const hasRearSusp = repairItems.some(it => 
    (it.category === '현가계' || it.category === '조향계') && 
    (it.name.includes('후륜') || it.name.includes('뒷') || it.name.includes('에어') || it.name.includes('쇼바'))
  )
  const hasSteeringOrSusp = repairItems.some(it => 
    (it.category === '조향계' || it.category === '현가계' || it.category === '제동계') && 
    !(it.name.includes('후륜') || it.name.includes('뒷') || it.name.includes('에어') || it.name.includes('쇼바'))
  )
  const hasTransmission = repairItems.some(it => it.category === '구동계')
  const hasEngineOrFluids = repairItems.some(it => it.category === '오일류' || it.category === '엔진' || it.category === '냉각계')

  // Calculate unique repaired categories
  const repairedCategories = [...new Set(repairItems.map(it => it.category))]
  const isSingleCategory = repairedCategories.length <= 1

  // Pick first available repaired category as default tab
  const getDefaultTab = () => {
    if (hasRearSusp) return 'rear_suspension'
    if (hasEngineOrFluids) return 'engine_oil'
    if (hasTransmission) return 'transmission'
    if (hasSteeringOrSusp) return 'suspension'
    return 'overview'
  }

  const [mohaveTab, setMohaveTab] = useState(getDefaultTab())
  const [selectedMohaveLabel, setSelectedMohaveLabel] = useState(null)

  const getImagePath = (path) => {
    if (!path) return ''
    const base = import.meta.env.BASE_URL || '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const cleanBase = base.endsWith('/') ? base : `${base}/`
    return `${cleanBase}${cleanPath}`
  }

  const isMohave = vehicleInfo?.model?.includes('모하비') || vehicleInfo?.model?.toLowerCase()?.includes('mohave')

  const repairedCats = [...new Set(repairItems.map(it => it.category))]

  const handleMouseMove = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({
        x: e.clientX - rect.left + 15,
        y: e.clientY - rect.top + 15
      })
    }
  }

  const getCatItems = (cat) => repairItems.filter(it => it.category === cat)

  // -------------------------------------------------------------
  // Scenario A: Mohave 3D Drawing Mode (Based on CAD annotations)
  // -------------------------------------------------------------
  if (isMohave) {
    const currentView = MOHAVE_3D_ANNOTATIONS[mohaveTab]

    return (
      <div className={styles.mohaveWrapper}>
        {!isSingleCategory && (
          <div className={styles.mohaveControls}>
            <button
              type="button"
              className={`${styles.mohaveCtrlBtn} ${mohaveTab === 'overview' ? styles.mohaveActiveBtn : ''}`}
              onClick={() => {
                setMohaveTab('overview')
                setSelectedMohaveLabel(null)
              }}
            >
              🔍 섀시/구동계 요약도
            </button>
            <button
              type="button"
              className={`${styles.mohaveCtrlBtn} ${mohaveTab === 'suspension' ? styles.mohaveActiveBtn : ''}`}
              onClick={() => {
                setMohaveTab('suspension')
                setSelectedMohaveLabel(null)
              }}
            >
              🔧 전륜 서스펜션 도면
            </button>
            <button
              type="button"
              className={`${styles.mohaveCtrlBtn} ${mohaveTab === 'rear_suspension' ? styles.mohaveActiveBtn : ''}`}
              onClick={() => {
                setMohaveTab('rear_suspension')
                setSelectedMohaveLabel(null)
              }}
            >
              🌀 후륜 에어쇼바 도면
            </button>
            <button
              type="button"
              className={`${styles.mohaveCtrlBtn} ${mohaveTab === 'transmission' ? styles.mohaveActiveBtn : ''}`}
              onClick={() => {
                setMohaveTab('transmission')
                setSelectedMohaveLabel(null)
              }}
            >
              ⚙️ 자동변속기 설계도
            </button>
            <button
              type="button"
              className={`${styles.mohaveCtrlBtn} ${mohaveTab === 'engine_oil' ? styles.mohaveActiveBtn : ''}`}
              onClick={() => {
                setMohaveTab('engine_oil')
                setSelectedMohaveLabel(null)
              }}
            >
              🛢️ 엔진 및 오일류 도면
            </button>
          </div>
        )}

        <div className={styles.mohaveContainer} ref={containerRef}>
          <img
            src={getImagePath(currentView.image)}
            alt={currentView.title}
            className={styles.mohaveBgImage}
          />

          <div className={styles.mohaveScanOverlay} />

          <div className={styles.mohaveInfoOverlay}>
            <div className={styles.mohaveViewTitle}>{currentView.title} (3D)</div>
            <div className={styles.mohaveViewSubtitle}>{currentView.subtitle}</div>
          </div>

          {currentView.labels.map((label, labelIdx) => {
            return label.targets.map((target, targetIdx) => {
              const isSelected = selectedMohaveLabel?.title === label.title
              
              return (
                <div
                  key={`${labelIdx}-${targetIdx}`}
                  className={`${styles.mohaveHotspot}`}
                  style={{
                    left: `${target.x / 10}%`,
                    top: `${target.y / 10}%`,
                    '--part-color': label.color
                  }}
                  onClick={() => setSelectedMohaveLabel(label)}
                >
                  <div className={styles.mohavePulseRing} />
                  <div className={styles.mohaveCenterDot} />
                  <div className={styles.mohaveLabelTooltip}>{label.title}</div>
                </div>
              )
            })
          })}

          {selectedMohaveLabel && (
            <div
              className={styles.mohaveFullCard}
              style={{ borderColor: selectedMohaveLabel.color }}
            >
              <div className={styles.mohaveCardHeader} style={{ color: selectedMohaveLabel.color }}>
                📌 {selectedMohaveLabel.title}
              </div>
              <button className={styles.mohaveCloseCardBtn} onClick={() => setSelectedMohaveLabel(null)}>✕</button>
              <div className={styles.mohaveCardBody}>
                {selectedMohaveLabel.desc.split('\n').map((line, idx) => (
                  <div key={idx} className={styles.mohaveCardLine}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // Scenario B: Default Universal Sedan 3D SVG Mode
  // -------------------------------------------------------------
  return (
    <div className={styles.container} ref={containerRef} onMouseMove={handleMouseMove}>
      <div className={styles.modelHeader}>
        🚘 {vehicleInfo?.maker} {vehicleInfo?.model} 3D 레이아웃 뷰
      </div>
      <svg
        viewBox="0 0 600 590"
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
      >
        {/* --- Car Body (Top-Down View) --- */}
        <ellipse cx="300" cy="300" rx="145" ry="270" fill="#1a2235" stroke="#2f3640" strokeWidth="2" />
        <path d="M200 130 Q220 60 300 50 Q380 60 400 130 Z" fill="#151e2d" stroke="#2f3640" strokeWidth="2"/>
        <path d="M200 470 Q220 540 300 550 Q380 540 400 470 Z" fill="#151e2d" stroke="#2f3640" strokeWidth="2"/>

        <path d="M215 185 Q225 150 300 145 Q375 150 385 185 Z" fill="rgba(69,243,255,0.12)" stroke="rgba(69,243,255,0.3)" strokeWidth="1.5"/>
        <path d="M215 415 Q225 450 300 455 Q375 450 385 415 Z" fill="rgba(69,243,255,0.08)" stroke="rgba(69,243,255,0.2)" strokeWidth="1.5"/>

        {/* Wheels */}
        <rect x="148" y="175" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
        <rect x="412" y="175" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
        <rect x="148" y="355" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
        <rect x="412" y="355" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>

        <line x1="300" y1="190" x2="300" y2="410" stroke="#2f3640" strokeWidth="1" strokeDasharray="6,4"/>
        <circle cx="270" cy="240" r="16" fill="none" stroke="#2f3640" strokeWidth="1.5"/>
        <circle cx="270" cy="240" r="6" fill="#2f3640"/>
        <rect x="255" y="108" width="90" height="50" rx="6" fill="rgba(255,255,255,0.03)" stroke="#2f3640" strokeWidth="1.5"/>
        <rect x="260" y="348" width="80" height="44" rx="6" fill="rgba(255,255,255,0.03)" stroke="#2f3640" strokeWidth="1.5"/>

        {/* --- Highlighted Repair Zones --- */}
        {repairedCats.map(cat => {
          const part = PART_MAP[cat]
          if (!part) return null
          const isHovered = hoveredCat === cat

          return (
            <g
              key={cat}
              className={styles.zoneGroup}
              onMouseEnter={() => setHoveredCat(cat)}
              onMouseLeave={() => setHoveredCat(null)}
              style={{ cursor: 'pointer' }}
            >
              <ellipse
                cx={part.cx}
                cy={part.cy}
                rx={isHovered ? part.rx + 8 : part.rx}
                ry={isHovered ? part.ry + 8 : part.ry}
                fill={isHovered ? `${part.fill}44` : `${part.fill}22`}
                stroke={part.fill}
                strokeWidth={isHovered ? "3.5" : "2.5"}
                strokeDasharray={cat === '외장' ? '8,4' : '0'}
                className={styles.pulseArea}
              />
              <circle cx={part.cx} cy={part.cy} r={isHovered ? "8" : "5"} fill={part.fill} />
              <circle
                cx={part.cx}
                cy={part.cy}
                r={isHovered ? "20" : "12"}
                fill="none"
                stroke={part.fill}
                strokeWidth="1"
                className={styles.pulseOutline}
              />
            </g>
          )
        })}

        {/* Direction label */}
        <text x="300" y="30" textAnchor="middle" fill="#a0a8b3" fontSize="11" fontFamily="Inter, sans-serif">앞</text>
        <text x="300" y="580" textAnchor="middle" fill="#a0a8b3" fontSize="11" fontFamily="Inter, sans-serif">뒤</text>
      </svg>

      {/* Real-time Tooltip Box on hover */}
      {hoveredCat && getCatItems(hoveredCat).length > 0 && (
        <div
          className={styles.tooltip}
          style={{
            top: tooltipPos.y,
            left: tooltipPos.x,
            borderColor: PART_MAP[hoveredCat]?.fill || 'var(--border)'
          }}
        >
          <div className={styles.tooltipHeader} style={{ color: PART_MAP[hoveredCat]?.fill }}>
            🚗 {PART_MAP[hoveredCat]?.label} 정비 내역
          </div>
          <div className={styles.tooltipBody}>
            {getCatItems(hoveredCat).map((it, idx) => (
              <div key={it.id || idx} className={styles.tooltipItem}>
                <div className={styles.itemName}>• {it.name}</div>
                <div className={styles.itemCost}>
                  <span>부품: {(Number(it.partsCost) || 0).toLocaleString()}원</span>
                  <span className={styles.separator}>|</span>
                  <span>공임: {(Number(it.laborCost) || 0).toLocaleString()}원</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
