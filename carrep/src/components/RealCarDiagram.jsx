import { useState } from 'react'
import styles from './RealCarDiagram.module.css'

const ANNOTATIONS = {
  overview: {
    title: '2008 모하비 하부/구동계 수리 부위 요약 (실사)',
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
    image: '/mohave_repair_real_02_front_suspension.png',
    labels: [
      {
        title: '파워스티어링 기어 & 링키지 (오무기어) 교체',
        desc: '기어 & 링키지 어셈블리 교환 (파워 스티어)\n파워스티어링 오일 주입 완료\n부품: 629,200원 | 공임: 145,600원 | 오일: 17,050원\n합계: 791,850원',
        color: '#ff3b30',
        targets: [{ x: 150, y: 320 }]
      },
      {
        title: '프론트 하부암 (로어암 좌/우) 교체',
        desc: '암 컴프리트-프론트 하부 (로어암 좌/우) 교체\n부품: 189,420원 (각 94,710원)\n공임: 63,700원\n합계: 253,120원',
        color: '#fa8231',
        targets: [{ x: 420, y: 590 }]
      },
      {
        title: '하부암 볼 조인트 (양쪽) 교체',
        desc: '하부암 볼조인트 어셈블리 (양쪽) 교체\n부품: 28,600원 (각 14,300원)\n공임: 91,000원\n합계: 119,600원',
        color: '#f7b731',
        targets: [{ x: 560, y: 610 }]
      },
      {
        title: '로어암 고착 볼트 교체 및 산소 작업',
        desc: '고착 볼트 해체 작업 (산소 토치 사용): 24,420원\n로어암 스핀들 (4개): 15,640원\n캠 플레이트 B (4개): 7,200원\n볼트, 너트, 와셔 소모품: 15,620원\n합계: 62,880원',
        color: '#e67e22',
        targets: [{ x: 230, y: 480 }]
      },
      {
        title: '휠 얼라이먼트 조정',
        desc: '하체 부품 대대적 교체 후 정렬 작업\n타이어 이상 마모 방지 및 주행성 셋팅\n비용: 100,100원',
        color: '#3498db',
        targets: [{ x: 850, y: 750 }]
      }
    ]
  },
  transmission: {
    title: '자동변속기 (미션) 오일팬 & 미션오일 교환 내역 (실사)',
    subtitle: 'Automatic Transmission Oil Pan & Fluid Replacement Detail (Real Photo)',
    image: '/mohave_repair_real_03_transmission.png',
    labels: [
      {
        title: '자동변속기 오일팬 어셈블리 교체',
        desc: '팬 어셈블리-자동변속기 오일 교체\n누유 차단 및 신품 오일팬 장착\n부품: 228,800원 | 공임: 63,700원\n합계: 292,500원',
        color: '#ff3b30',
        targets: [{ x: 450, y: 470 }]
      },
      {
        title: '오토 미션 오일 (8L) 교환',
        desc: '고성능 규격 오토 미션 오일 주입\n용량: 8리터\n비용: 188,000원 (리터당 23,500원)\n합계: 188,000원',
        color: '#3498db',
        targets: [{ x: 680, y: 250 }]
      },
      {
        title: 'GDS/KDS 진단 점검',
        desc: '변속 제어 시스템 진단 및 센서 점검\nGDS/KDS 정밀 스캐너 진단\n비용: 18,200원',
        color: '#a0a8b3',
        targets: [{ x: 220, y: 150 }]
      }
    ]
  }
}

export default function RealCarDiagram() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'suspension' | 'transmission'
  const [selectedLabel, setSelectedLabel] = useState(null)

  const IMAGE_BASE = window.location.pathname.includes('/vibe') ? '/vibe' : ''
  const currentView = ANNOTATIONS[activeTab]

  return (
    <div className={styles.wrapper}>
      {/* Viewer Tab Controls */}
      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.ctrlBtn} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('overview')
            setSelectedLabel(null)
          }}
        >
          🔍 하체 전체 요약
        </button>
        <button
          type="button"
          className={`${styles.ctrlBtn} ${activeTab === 'suspension' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('suspension')
            setSelectedLabel(null)
          }}
        >
          🔧 조향/서스펜션 앞바퀴
        </button>
        <button
          type="button"
          className={`${styles.ctrlBtn} ${activeTab === 'transmission' ? styles.active : ''}`}
          onClick={() => {
            setActiveTab('transmission')
            setSelectedLabel(null)
          }}
        >
          ⚙️ 자동변속기 미션
        </button>
      </div>

      <div className={styles.container}>
        {/* Real Vehicle Repair Photo */}
        <img
          src={`${IMAGE_BASE}${currentView.image}`}
          alt={currentView.title}
          className={styles.bgImage}
        />
        <div className={styles.scanOverlay} />

        {/* Info Header overlay */}
        <div className={styles.infoOverlay}>
          <div className={styles.viewTitle}>{currentView.title}</div>
          <div className={styles.viewSubtitle}>{currentView.subtitle}</div>
        </div>

        {/* Hotspot Marks mapped via coordinates */}
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

                {/* Direct Small Tooltip */}
                <div className={styles.labelTooltip}>
                  {label.title}
                </div>
              </div>
            )
          })
        })}

        {/* Detailed Full Tooltip Overlay when a hotspot is clicked */}
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
