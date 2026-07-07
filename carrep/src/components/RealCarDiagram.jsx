import styles from './RealCarDiagram.module.css'

const REAL_PART_MAP = {
  '엔진':   { label: '엔진', top: '22%', left: '50%', color: '#fd9644' },
  '조향계': { label: '조향 장치', top: '38%', left: '50%', color: '#ff3b30' },
  '현가계': { label: '서스펜션 / 현가계', top: '48%', left: '50%', color: '#fa8231' },
  '구동계': { label: '변속기 / 구동계', top: '62%', left: '50%', color: '#45f3ff' },
  '제동계': { label: '브레이크', top: '78%', left: '50%', color: '#f7b731' },
  '냉각계': { label: '냉각 시스템', top: '12%', left: '50%', color: '#26de81' },
  '전기계': { label: '전장 시스템', top: '30%', left: '35%', color: '#a29bfe' },
  '외장':   { label: '외장 / 차체', top: '50%', left: '18%', color: '#74b9ff' },
  '내장':   { label: '내장재', top: '50%', left: '82%', color: '#fd79a8' },
  '진단점검': { label: '진단 점검', top: '5%', left: '80%', color: '#a0a8b3' },
  '기타':   { label: '기타 부위', top: '90%', left: '50%', color: '#bef264' },
}

export default function RealCarDiagram({ repairItems }) {
  const repairedCats = [...new Set(repairItems.map(it => it.category))]

  return (
    <div className={styles.container}>
      {/* Background Real Undercarriage Photo */}
      <img
        src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=600&auto=format&fit=crop"
        alt="Vehicle Undercarriage Lift"
        className={styles.bgImage}
      />
      {/* Interlaced Video Scanning Overlay for Workshop look */}
      <div className={styles.overlay} />

      {/* Highlights mapping */}
      {repairedCats.map(cat => {
        const part = REAL_PART_MAP[cat]
        if (!part) return null

        return (
          <div
            key={cat}
            className={styles.hotspot}
            style={{
              top: part.top,
              left: part.left,
              '--part-color': part.color
            }}
          >
            {/* Animated Pulses */}
            <div className={styles.pulseRing} />
            <div className={styles.pulseRingSecondary} />
            <div className={styles.centerDot} />

            {/* Floating label */}
            <div className={styles.labelTooltip}>
              <span className={styles.labelDot} style={{ background: part.color }} />
              {part.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
