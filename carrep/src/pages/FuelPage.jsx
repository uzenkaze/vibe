import { useState, useEffect } from 'react'
import styles from './FuelPage.module.css'
import FormattedNumberInput from '../components/FormattedNumberInput'

const FUEL_TYPES = ['고급유', '휘발유', '경유', 'LPG']
const STATIONS = ['GS칼텍스', 'SK에너지', 'S-OIL', 'HD현대오일뱅크', '알뜰주유소', '기타']

/* ─── 날짜 포맷 ─── */
function fmtChartDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

/* ─── 연비 데이터 계산 ─── */
function calcEfficiencyData(history) {
  const sorted = [...history]
    .filter(h => h.mileage > 0 && h.volume > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  const result = []
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]
    const cur = sorted[i]
    const kmDiff = cur.mileage - prev.mileage
    if (kmDiff > 0 && cur.volume > 0) {
      const eff = kmDiff / cur.volume
      const costPerKm = cur.unitPrice > 0 ? cur.unitPrice / eff : null
      result.push({ date: cur.date, value: parseFloat(eff.toFixed(2)), costPerKm })
    }
  }
  return result
}

/* ─── 단가 데이터 계산 ─── */
function calcPriceData(history) {
  return [...history]
    .filter(h => h.unitPrice > 0)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(h => ({ date: h.date, value: h.unitPrice }))
}

/* ─── SVG 라인차트 컴포넌트 ─── */
function FuelLineChart({ data, unit, color = '#3b82f6' }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3, marginBottom: 10 }}>
          <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
        </svg>
        <div>데이터가 부족합니다.</div>
        <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
          {unit === 'km/L' ? '주행거리를 포함한 주유 기록이 2건 이상 필요합니다.' : '주유 단가가 포함된 기록이 1건 이상 필요합니다.'}
        </div>
      </div>
    )
  }

  const W = 320, H = 175
  const PAD = { top: 38, right: 46, bottom: 42, left: 12 }
  const plotW = W - PAD.left - PAD.right
  const plotH = H - PAD.top - PAD.bottom

  const values = data.map(d => d.value)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const range = maxVal - minVal || 1

  const xOf = (i) => PAD.left + (data.length === 1 ? plotW / 2 : i * plotW / (data.length - 1))
  const yOf = (v) => PAD.top + (1 - (v - minVal) / range) * plotH

  const pathD = data.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xOf(i).toFixed(1)} ${yOf(d.value).toFixed(1)}`
  ).join(' ')

  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const avgY = yOf(avg)

  const last = data[data.length - 1]
  const prev = data[data.length - 2]
  const diff = prev ? last.value - prev.value : null
  const isUp = diff !== null && diff > 0
  const isSame = diff !== null && Math.abs(diff) < 0.01

  return (
    <div className={styles.chartWrap}>
      {/* 상단 요약 */}
      <div className={styles.chartSummary}>
        {diff !== null && !isSame ? (
          <>
            <div className={styles.chartSummaryTitle}>
              지난번보다 {unit === 'km/L' ? '연비가' : '단가가'}
            </div>
            <div className={styles.chartSummaryVal}
              style={{ color: unit === 'km/L' ? (isUp ? 'var(--accent-blue)' : 'var(--accent-red)') : (isUp ? 'var(--accent-red)' : 'var(--accent-blue)') }}>
              {Math.abs(diff).toFixed(2)}{unit} {isUp ? '올랐어요 ↑' : '떨어졌어요 ↓'}
            </div>
            {unit === 'km/L' && last.costPerKm && (
              <div className={styles.chartSummaryMeta}>
                1km 달릴 때 약 {Math.round(last.costPerKm).toLocaleString()}원 지출
              </div>
            )}
          </>
        ) : (
          <div className={styles.chartSummaryTitle}>
            {unit === 'km/L' ? '연비' : '주유 단가'} 추이
          </div>
        )}
        <div className={styles.chartCurrentVal}>
          최근: <strong style={{ color }}>{last.value.toFixed(2)}{unit}</strong>
          &nbsp;· 평균: <strong>{avg.toFixed(2)}{unit}</strong>
        </div>
      </div>

      {/* SVG 차트 */}
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible', display: 'block' }}>
        {/* 평균 점선 */}
        <line
          x1={PAD.left} y1={avgY.toFixed(1)}
          x2={W - PAD.right + 6} y2={avgY.toFixed(1)}
          stroke="#9ca3af" strokeDasharray="4 3" strokeWidth="1.2"
        />
        <text x={W - PAD.right + 8} y={avgY + 4} fontSize="9" fill="#9ca3af" fontWeight="600">평균</text>

        {/* 그라디언트 배경 */}
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 영역 채우기 */}
        {data.length > 1 && (
          <path
            d={`${pathD} L ${xOf(data.length - 1).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} L ${xOf(0).toFixed(1)} ${(PAD.top + plotH).toFixed(1)} Z`}
            fill="url(#chartGrad)"
          />
        )}

        {/* 메인 라인 */}
        {data.length > 1 && (
          <path d={pathD} fill="none" stroke={color} strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* 데이터 포인트 */}
        {data.map((d, i) => {
          const x = xOf(i)
          const y = yOf(d.value)
          const isLast = i === data.length - 1
          return (
            <g key={i}>
              {!isLast && (
                <text x={x} y={y - 11} textAnchor="middle" fontSize="10" fill="var(--text-sub)" fontWeight="700">
                  {d.value.toFixed(2)}
                </text>
              )}
              <circle cx={x} cy={y} r={isLast ? 6 : 4} fill={isLast ? color : 'var(--bg-card)'} stroke={color} strokeWidth="2.5" />
              {isLast && (
                <g>
                  <rect x={x - 28} y={y - 28} width="56" height="20" rx="10" fill={color} />
                  <text x={x} y={y - 14} textAnchor="middle" fontSize="10" fill="#ffffff" fontWeight="800">
                    {d.value.toFixed(2)}
                  </text>
                </g>
              )}
              <text x={x} y={H - 8} textAnchor="middle" fontSize="9.5" fill="var(--text-muted)" fontWeight="600">
                {fmtChartDate(d.date)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── 주유 리포트 탭 내용 ─── */
function FuelReport({ fuelHistory }) {
  const [mode, setMode] = useState('efficiency')

  const efficiencyData = calcEfficiencyData(fuelHistory)
  const priceData = calcPriceData(fuelHistory)

  const totalAmount = fuelHistory.reduce((s, h) => s + (h.amount || 0), 0)
  const totalVolume = fuelHistory.reduce((s, h) => s + (h.volume || 0), 0)
  const avgPrice = priceData.length > 0
    ? priceData.reduce((s, d) => s + d.value, 0) / priceData.length : 0

  return (
    <div className={styles.reportWrap}>
      <div className={styles.reportStatRow}>
        <div className={styles.reportStat}>
          <div className={styles.reportStatLabel}>총 주유 금액</div>
          <div className={styles.reportStatVal}>{totalAmount.toLocaleString()}원</div>
        </div>
        <div className={styles.reportStat}>
          <div className={styles.reportStatLabel}>총 주유량</div>
          <div className={styles.reportStatVal}>{totalVolume.toFixed(1)}L</div>
        </div>
        <div className={styles.reportStat}>
          <div className={styles.reportStatLabel}>평균 단가</div>
          <div className={styles.reportStatVal}>{Math.round(avgPrice).toLocaleString()}원</div>
        </div>
      </div>

      {mode === 'efficiency'
        ? <FuelLineChart data={efficiencyData} unit="km/L" color="#3b82f6" />
        : <FuelLineChart data={priceData} unit="원/L" color="#f59e0b" />
      }

      <div className={styles.reportToggle}>
        <button
          className={`${styles.toggleBtn} ${mode === 'efficiency' ? styles.toggleActive : ''}`}
          onClick={() => setMode('efficiency')}
        >
          연비로 보기
        </button>
        <button
          className={`${styles.toggleBtn} ${mode === 'price' ? styles.toggleActive : ''}`}
          onClick={() => setMode('price')}
        >
          주유 단가로 보기
        </button>
      </div>
    </div>
  )
}

/* ─── 주유 관리 메인 페이지 ─── */
export default function FuelPage({ fuelHistory = [], onSaveFuel, onDeleteFuel }) {
  const [activeTab, setActiveTab] = useState('record') // 'record' | 'report'
  const [station, setStation] = useState('GS칼텍스')
  const [customStation, setCustomStation] = useState('')
  const [mileage, setMileage] = useState('')
  const [amount, setAmount] = useState('')
  const [fuelType, setFuelType] = useState('경유')
  const [unitPrice, setUnitPrice] = useState('1650')
  const [volume, setVolume] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    const amt = Number(amount) || 0
    const price = Number(unitPrice) || 0
    if (amt > 0 && price > 0) {
      const calcVol = (amt / price).toFixed(2)
      setVolume(calcVol)
    }
  }, [amount, unitPrice])

  const handleEdit = (item) => {
    setEditingId(item.id)
    if (STATIONS.includes(item.station)) {
      setStation(item.station)
      setCustomStation('')
    } else {
      setStation('기타')
      setCustomStation(item.station || '')
    }
    setMileage(item.mileage ? String(item.mileage) : '')
    setAmount(item.amount ? String(item.amount) : '')
    setFuelType(item.fuelType || '경유')
    setUnitPrice(item.unitPrice ? String(item.unitPrice) : '1650')
    setVolume(item.volume ? String(item.volume) : '')
    setDate(item.date || new Date().toISOString().split('T')[0])
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setMileage('')
    setAmount('')
    setVolume('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalStation = station === '기타' ? (customStation.trim() || '기타') : station
    if (!amount) {
      alert('주유 금액을 입력해주세요.')
      return
    }

    const newItem = {
      id: editingId || Date.now(),
      date,
      station: finalStation,
      fuelType,
      mileage: Number(mileage) || 0,
      amount: Number(amount) || 0,
      unitPrice: Number(unitPrice) || 0,
      volume: Number(volume) || 0,
    }

    onSaveFuel(newItem)
    handleCancelEdit()
  }

  const sortedHistory = [...fuelHistory].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className={styles.page}>
      {/* 페이지 헤더 */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageTitleGroup}>
            <h2 className={styles.pageTitle}>주유 관리</h2>
            <span className={styles.pageSubtitle}>주유 기록 및 연비/단가 추이를 기록 분석합니다</span>
          </div>
        </div>

        {/* 탭 바 */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'record' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('record')}
          >
            ⛽ 주유 기록
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'report' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('report')}
          >
            📈 연비/단가 리포트
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className={styles.tabContent}>
        {activeTab === 'record' ? (
          <div className={styles.recordContainer}>
            {/* 폼 카드 */}
            <form onSubmit={handleSubmit} className={styles.formCard}>
              <div className={styles.formTitle}>
                {editingId ? '✏️ 주유 기록 수정' : '➕ 새 주유 기록 작성'}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>주유일자</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={date}
                    onChange={e => setDate(e.target.value)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>유종</label>
                  <select
                    className={styles.select}
                    value={fuelType}
                    onChange={e => setFuelType(e.target.value)}
                  >
                    {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>주유소 브랜드</label>
                  <select
                    className={styles.select}
                    value={station}
                    onChange={e => setStation(e.target.value)}
                  >
                    {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {station === '기타' && (
                  <div className={styles.field}>
                    <label className={styles.label}>주유소 이름 (직접 입력)</label>
                    <input
                      type="text"
                      className={styles.input}
                      placeholder="예: 행복주유소"
                      value={customStation}
                      onChange={e => setCustomStation(e.target.value)}
                    />
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.label}>누적 주행거리 (km)</label>
                  <FormattedNumberInput
                    className={styles.input}
                    placeholder="예: 185000"
                    value={mileage}
                    onChange={val => setMileage(val)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>주유 금액 (원)</label>
                  <FormattedNumberInput
                    className={styles.input}
                    placeholder="예: 70000"
                    value={amount}
                    onChange={val => setAmount(val)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>리터당 단가 (원)</label>
                  <FormattedNumberInput
                    className={styles.input}
                    placeholder="1650"
                    value={unitPrice}
                    onChange={val => setUnitPrice(val)}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>주유량 (L)</label>
                  <input
                    type="number"
                    step="0.01"
                    className={styles.input}
                    placeholder="자동 계산됨"
                    value={volume}
                    onChange={e => setVolume(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                {editingId && (
                  <button type="button" className={styles.btnCancel} onClick={handleCancelEdit}>
                    취소
                  </button>
                )}
                <button type="submit" className={styles.btnSubmit}>
                  {editingId ? '수정 저장' : '주유 기록 추가'}
                </button>
              </div>
            </form>

            {/* 히스토리 리스트 */}
            <div className={styles.historySection}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>지난 주유 기록 ({sortedHistory.length}건)</h3>
              </div>

              {sortedHistory.length === 0 ? (
                <div className={styles.emptyState}>
                  주유 기록이 아직 없습니다.<br />위 양식을 통해 첫 주유 내역을 등록해보세요!
                </div>
              ) : (
                <div className={styles.historyList}>
                  {sortedHistory.map(h => (
                    <div key={h.id} className={styles.historyCard}>
                      <div className={styles.historyTop}>
                        <div>
                          <span className={styles.historyStation}>{h.station}</span>
                          <span className={styles.historyFuelType}>{h.fuelType}</span>
                        </div>
                        <span className={styles.historyDate}>{h.date}</span>
                      </div>
                      <div className={styles.historyMain}>
                        <div className={styles.historyAmount}>{h.amount?.toLocaleString()} 원</div>
                        <div className={styles.historyDetails}>
                          <span>{h.volume}L</span>
                          <span>·</span>
                          <span>@ {h.unitPrice?.toLocaleString()}원/L</span>
                          {h.mileage > 0 && (
                            <>
                              <span>·</span>
                              <span>{h.mileage?.toLocaleString()} km</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={styles.historyActions}>
                        <button className={styles.btnEdit} onClick={() => handleEdit(h)}>수정</button>
                        <button className={styles.btnDelete} onClick={() => onDeleteFuel(h.id)}>삭제</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <FuelReport fuelHistory={fuelHistory} />
        )}
      </div>
    </div>
  )
}
