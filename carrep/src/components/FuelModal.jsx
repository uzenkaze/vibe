import { useState, useEffect, useRef } from 'react'
import styles from './FuelModal.module.css'
import FormattedNumberInput from './FormattedNumberInput'

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
              {/* 값 텍스트 (마지막 제외) */}
              {!isLast && (
                <text x={x} y={y - 11} textAnchor="middle" fontSize="10" fill="var(--text-sub)" fontWeight="700">
                  {d.value.toFixed(2)}
                </text>
              )}
              {/* 원 */}
              {isLast ? (
                <>
                  <circle cx={x} cy={y} r={9} fill={color} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="9.5" fill="#fff" fontWeight="900">
                    {d.value.toFixed(2)}
                  </text>
                </>
              ) : (
                <circle cx={x} cy={y} r={4.5} fill="var(--bg-card)" stroke={color} strokeWidth="2.2" />
              )}
              {/* 날짜 */}
              <text x={x} y={H - 6} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
                {fmtChartDate(d.date)}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ─── 리포트 탭 뷰 ─── */
function FuelReport({ fuelHistory }) {
  const [mode, setMode] = useState('efficiency')

  const efficiencyData = calcEfficiencyData(fuelHistory)
  const priceData = calcPriceData(fuelHistory)

  // 통계 요약
  const totalAmount = fuelHistory.reduce((s, h) => s + (h.amount || 0), 0)
  const totalVolume = fuelHistory.reduce((s, h) => s + (h.volume || 0), 0)
  const avgPrice = priceData.length > 0
    ? priceData.reduce((s, d) => s + d.value, 0) / priceData.length : 0

  return (
    <div className={styles.reportWrap}>
      {/* 통계 요약 행 */}
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

      {/* 차트 */}
      {mode === 'efficiency'
        ? <FuelLineChart data={efficiencyData} unit="km/L" color="#3b82f6" />
        : <FuelLineChart data={priceData} unit="원/L" color="#f59e0b" />
      }

      {/* 하단 토글 */}
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

/* ─── 메인 모달 ─── */
export default function FuelModal({ isOpen, onClose, fuelHistory = [], onSaveFuel, onDeleteFuel }) {
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

  const lastChanged = useRef(null)

  useEffect(() => {
    const amt = parseFloat(String(amount).replace(/,/g, '')) || 0
    const price = parseFloat(String(unitPrice).replace(/,/g, '')) || 0
    const vol = parseFloat(String(volume).replace(/,/g, '')) || 0

    if (lastChanged.current === 'volume') {
      if (price > 0 && vol > 0) setAmount(Math.round(price * vol).toString())
    } else if (lastChanged.current === 'amount') {
      if (amt > 0 && price > 0) setVolume((amt / price).toFixed(2))
    } else if (lastChanged.current === 'unitPrice') {
      if (amt > 0 && price > 0) setVolume((amt / price).toFixed(2))
      else if (vol > 0 && price > 0) setAmount(Math.round(price * vol).toString())
    }
  }, [amount, unitPrice, volume])

  if (!isOpen) return null

  const resetForm = () => {
    setStation('GS칼텍스')
    setCustomStation('')
    setMileage('')
    setAmount('')
    setFuelType('경유')
    setUnitPrice('1650')
    setVolume('')
    setDate(new Date().toISOString().split('T')[0])
    setEditingId(null)
    lastChanged.current = null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalStation = station === '기타' ? (customStation || '기타주유소') : station
    if (!amount) { alert('주유 금액을 입력해 주세요.'); return }

    onSaveFuel({
      id: editingId || Date.now(),
      station: finalStation,
      mileage: Number(mileage) || 0,
      amount: Number(amount) || 0,
      fuelType,
      unitPrice: Number(unitPrice) || 0,
      volume: Number(volume) || 0,
      date
    })
    resetForm()
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    if (STATIONS.includes(item.station)) { setStation(item.station); setCustomStation('') }
    else { setStation('기타'); setCustomStation(item.station) }
    setMileage(item.mileage || '')
    setAmount(item.amount || '')
    setFuelType(item.fuelType || '경유')
    setUnitPrice(item.unitPrice || '1650')
    setVolume(item.volume || '')
    setDate(item.date || new Date().toISOString().split('T')[0])
    lastChanged.current = null
    setActiveTab('record')
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22V12a9 9 0 0 1 18 0v10"/><path d="M12 13v4"/><path d="M8 17h8"/>
            </svg>
            <h3 className={styles.title}>주유 정보 관리</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 탭 바 */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'record' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('record')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            주유기록
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'report' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('report')}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
              <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
            </svg>
            리포트
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'record' ? (
            <>
              {/* 입력 폼 */}
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>주유 일자</label>
                    <input type="date" className={styles.input} value={date} onChange={e => setDate(e.target.value)} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>주유소 브랜드</label>
                    <select className={styles.select} value={station} onChange={e => setStation(e.target.value)}>
                      {STATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {station === '기타' && (
                    <div className={styles.field}>
                      <label className={styles.label}>직접 입력 주유소명</label>
                      <input type="text" className={styles.input} placeholder="주유소 이름을 입력하세요"
                        value={customStation} onChange={e => setCustomStation(e.target.value)} />
                    </div>
                  )}

                  <div className={styles.field}>
                    <label className={styles.label}>유종 선택</label>
                    <div className={styles.radioGroup}>
                      {FUEL_TYPES.map(t => (
                        <button key={t} type="button"
                          className={`${styles.fuelTypeChip} ${fuelType === t ? styles.chipActive : ''}`}
                          onClick={() => setFuelType(t)}>{t}</button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      주유 금액 (원)
                      {lastChanged.current !== 'amount' && amount && <span className={styles.autoTag}>자동계산</span>}
                    </label>
                    <FormattedNumberInput
                      className={`${styles.input} ${lastChanged.current !== 'amount' && amount ? styles.autoCalcField : ''}`}
                      placeholder="예: 70,000" value={amount}
                      onChange={val => { lastChanged.current = 'amount'; setAmount(val) }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>리터당 단가 (원/L)</label>
                    <FormattedNumberInput
                      className={styles.input} placeholder="예: 1,650" value={unitPrice}
                      onChange={val => { lastChanged.current = 'unitPrice'; setUnitPrice(val) }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>
                      주유량 (L)
                      {lastChanged.current !== 'volume' && volume && <span className={styles.autoTag}>자동계산</span>}
                    </label>
                    <input type="number" step="0.01"
                      className={`${styles.input} ${styles.inputRight} ${lastChanged.current !== 'volume' && volume ? styles.autoCalcField : ''}`}
                      style={{ textAlign: 'right', fontWeight: 800 }}
                      placeholder="0.00" value={volume}
                      onChange={e => { lastChanged.current = 'volume'; setVolume(e.target.value) }}
                    />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>누적 주행거리 (km)</label>
                    <FormattedNumberInput
                      className={styles.input} placeholder="예: 176,200" value={mileage}
                      onChange={val => setMileage(val)}
                    />
                  </div>
                </div>

                <div className={styles.formActions}>
                  {editingId && (
                    <button type="button" className={styles.btnCancel} onClick={resetForm}>수정 취소</button>
                  )}
                  <button type="submit" className={styles.btnSave}>
                    {editingId ? '✓ 주유 정보 수정' : '+ 주유 내역 등록'}
                  </button>
                </div>
              </form>

              {/* 주유 이력 목록 */}
              <div className={styles.historySection}>
                <h4 className={styles.historyTitle}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle', marginRight: 5 }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  주유 기록 목록 ({fuelHistory.length}건)
                </h4>
                {fuelHistory.length === 0 ? (
                  <div className={styles.empty}>등록된 주유 기록이 없습니다.</div>
                ) : (
                  <div className={styles.historyList}>
                    {fuelHistory.map(item => (
                      <div key={item.id} className={styles.historyCard}>
                        <div className={styles.cardMain}>
                          <div className={styles.cardHeader}>
                            <span className={styles.stationBadge}>{item.station}</span>
                            <span className={styles.fuelTypeTag}>{item.fuelType}</span>
                            <span className={styles.cardDate}>{item.date}</span>
                          </div>
                          <div className={styles.cardMetrics}>
                            <div className={styles.metric}>
                              <span className={styles.mLabel}>주유금액:</span>
                              <span className={styles.mVal}>{(item.amount || 0).toLocaleString()}원</span>
                            </div>
                            <div className={styles.metric}>
                              <span className={styles.mLabel}>주유량:</span>
                              <span className={styles.mVal}>{item.volume}L</span>
                            </div>
                            <div className={styles.metric}>
                              <span className={styles.mLabel}>단가:</span>
                              <span className={styles.mVal}>{(item.unitPrice || 0).toLocaleString()}원/L</span>
                            </div>
                            {item.mileage > 0 && (
                              <div className={styles.metric}>
                                <span className={styles.mLabel}>누적거리:</span>
                                <span className={styles.mVal}>{item.mileage.toLocaleString()}km</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={styles.cardBtns}>
                          <button className={styles.btnEdit} onClick={() => handleEdit(item)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button className={styles.btnDelete} onClick={() => onDeleteFuel(item.id)}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <FuelReport fuelHistory={fuelHistory} />
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnClose} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
