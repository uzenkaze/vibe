/**
 * Car SVG Diagram Component
 * Shows a simplified top-down / front view of a car
 * and highlights repair areas based on categories.
 */

const PART_MAP = {
  '조향계': { label: '조향 장치', cx: 300, cy: 195, rx: 80, ry: 28, fill: '#ff3b30' },
  '현가계': { label: '서스펜션', cx: 300, cy: 300, rx: 110, ry: 30, fill: '#fa8231' },
  '구동계': { label: '변속기 / 구동계', cx: 300, cy: 370, rx: 75, ry: 28, fill: '#45f3ff' },
  '엔진':   { label: '엔진', cx: 300, cy: 145, rx: 72, ry: 35, fill: '#fd9644' },
  '제동계': { label: '브레이크', cx: 300, cy: 430, rx: 80, ry: 22, fill: '#f7b731' },
  '냉각계': { label: '냉각 시스템', cx: 300, cy: 95, rx: 60, ry: 20, fill: '#26de81' },
  '전기계': { label: '전장 시스템', cx: 300, cy: 500, rx: 70, ry: 20, fill: '#a29bfe' },
  '외장':   { label: '외장 / 차체', cx: 300, cy: 300, rx: 145, ry: 270, fill: 'none' },
  '내장':   { label: '내장재', cx: 300, cy: 320, rx: 65, ry: 55, fill: '#fd79a8' },
  '진단점검': { label: '진단 점검', cx: 300, cy: 250, rx: 90, ry: 20, fill: '#a0a8b3' },
  '기타':   { label: '기타', cx: 300, cy: 480, rx: 60, ry: 18, fill: '#bef264' },
}

export default function CarDiagram({ repairItems }) {
  // Get unique categories that have been repaired
  const repairedCats = [...new Set(repairItems.map(it => it.category))]

  return (
    <svg
      viewBox="0 0 600 590"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: 500 }}
    >
      {/* --- Car Body (Top-Down View) --- */}
      {/* Main Body */}
      <ellipse cx="300" cy="300" rx="145" ry="270" fill="#1a2235" stroke="#2f3640" strokeWidth="2" />

      {/* Hood (Front) */}
      <path d="M200 130 Q220 60 300 50 Q380 60 400 130 Z" fill="#151e2d" stroke="#2f3640" strokeWidth="2"/>

      {/* Trunk (Rear) */}
      <path d="M200 470 Q220 540 300 550 Q380 540 400 470 Z" fill="#151e2d" stroke="#2f3640" strokeWidth="2"/>

      {/* Windshield Front */}
      <path d="M215 185 Q225 150 300 145 Q375 150 385 185 Z" fill="rgba(69,243,255,0.12)" stroke="rgba(69,243,255,0.3)" strokeWidth="1.5"/>

      {/* Windshield Rear */}
      <path d="M215 415 Q225 450 300 455 Q375 450 385 415 Z" fill="rgba(69,243,255,0.08)" stroke="rgba(69,243,255,0.2)" strokeWidth="1.5"/>

      {/* Front Wheels */}
      <rect x="148" y="175" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
      <rect x="412" y="175" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
      {/* Front wheel inner */}
      <ellipse cx="168" cy="211" rx="12" ry="20" fill="#1a2a3f" stroke="#2f3640" strokeWidth="1"/>
      <ellipse cx="432" cy="211" rx="12" ry="20" fill="#1a2a3f" stroke="#2f3640" strokeWidth="1"/>

      {/* Rear Wheels */}
      <rect x="148" y="355" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
      <rect x="412" y="355" width="40" height="72" rx="12" fill="#0d1521" stroke="#45f3ff" strokeWidth="1.5"/>
      {/* Rear wheel inner */}
      <ellipse cx="168" cy="391" rx="12" ry="20" fill="#1a2a3f" stroke="#2f3640" strokeWidth="1"/>
      <ellipse cx="432" cy="391" rx="12" ry="20" fill="#1a2a3f" stroke="#2f3640" strokeWidth="1"/>

      {/* Center console line */}
      <line x1="300" y1="190" x2="300" y2="410" stroke="#2f3640" strokeWidth="1" strokeDasharray="6,4"/>

      {/* Steering wheel indicator */}
      <circle cx="270" cy="240" r="16" fill="none" stroke="#2f3640" strokeWidth="1.5"/>
      <circle cx="270" cy="240" r="6" fill="#2f3640"/>

      {/* Engine indicator */}
      <rect x="255" y="108" width="90" height="50" rx="6" fill="rgba(255,255,255,0.03)" stroke="#2f3640" strokeWidth="1.5"/>

      {/* Transmission indicator */}
      <rect x="260" y="348" width="80" height="44" rx="6" fill="rgba(255,255,255,0.03)" stroke="#2f3640" strokeWidth="1.5"/>

      {/* --- Highlighted Repair Zones --- */}
      {repairedCats.map(cat => {
        const part = PART_MAP[cat]
        if (!part) return null
        return (
          <g key={cat}>
            <ellipse
              cx={part.cx}
              cy={part.cy}
              rx={part.rx}
              ry={part.ry}
              fill={`${part.fill}22`}
              stroke={part.fill}
              strokeWidth="2.5"
              strokeDasharray={cat === '외장' ? '8,4' : '0'}
            >
              <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
            </ellipse>
            {/* Dot center */}
            <circle cx={part.cx} cy={part.cy} r="5" fill={part.fill}>
              <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite"/>
            </circle>
          </g>
        )
      })}

      {/* Direction label */}
      <text x="300" y="30" textAnchor="middle" fill="#a0a8b3" fontSize="11" fontFamily="Inter, sans-serif">앞</text>
      <text x="300" y="580" textAnchor="middle" fill="#a0a8b3" fontSize="11" fontFamily="Inter, sans-serif">뒤</text>
    </svg>
  )
}
