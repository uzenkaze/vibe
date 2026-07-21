import { useState, useEffect, useRef } from 'react'
import styles from './FuelModal.module.css'
import FormattedNumberInput from './FormattedNumberInput'

const FUEL_TYPES = ['고급유', '휘발유', '경유', 'LPG']
const STATIONS = ['GS칼텍스', 'SK에너지', 'S-OIL', 'HD현대오일뱅크', '알뜰주유소', '기타']

export default function FuelModal({ isOpen, onClose, fuelHistory = [], onSaveFuel, onDeleteFuel }) {
  const [station, setStation] = useState('GS칼텍스')
  const [customStation, setCustomStation] = useState('')
  const [mileage, setMileage] = useState('')
  const [amount, setAmount] = useState('')
  const [fuelType, setFuelType] = useState('경유')
  const [unitPrice, setUnitPrice] = useState('1650')
  const [volume, setVolume] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState(null)

  // 마지막으로 수동 입력한 필드 추적 ('amount' | 'unitPrice' | 'volume')
  const lastChanged = useRef(null)

  // 자동계산: 세 필드 중 두 개 입력 → 나머지 하나 자동계산
  useEffect(() => {
    const amt = parseFloat(String(amount).replace(/,/g, '')) || 0
    const price = parseFloat(String(unitPrice).replace(/,/g, '')) || 0
    const vol = parseFloat(String(volume).replace(/,/g, '')) || 0

    // 마지막으로 변경된 필드를 제외하고, 나머지 두 값으로 계산
    if (lastChanged.current === 'volume') {
      // 주유량 입력 → 단가 + 주유량으로 금액 계산
      if (price > 0 && vol > 0) {
        setAmount(Math.round(price * vol).toString())
      }
    } else if (lastChanged.current === 'amount') {
      // 금액 입력 → 금액 + 단가로 주유량 계산
      if (amt > 0 && price > 0) {
        setVolume((amt / price).toFixed(2))
      }
    } else if (lastChanged.current === 'unitPrice') {
      // 단가 입력 → 금액 + 단가로 주유량 계산 (금액 우선)
      if (amt > 0 && price > 0) {
        setVolume((amt / price).toFixed(2))
      } else if (vol > 0 && price > 0) {
        setAmount(Math.round(price * vol).toString())
      }
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const finalStation = station === '기타' ? (customStation || '기타주유소') : station
    if (!amount) {
      alert('주유 금액을 입력해 주세요.')
      return
    }

    const newItem = {
      id: editingId || Date.now(),
      station: finalStation,
      mileage: Number(mileage) || 0,
      amount: Number(amount) || 0,
      fuelType,
      unitPrice: Number(unitPrice) || 0,
      volume: Number(volume) || 0,
      date
    }

    onSaveFuel(newItem)
    resetForm()
  }

  const handleEdit = (item) => {
    setEditingId(item.id)
    if (STATIONS.includes(item.station)) {
      setStation(item.station)
      setCustomStation('')
    } else {
      setStation('기타')
      setCustomStation(item.station)
    }
    setMileage(item.mileage || '')
    setAmount(item.amount || '')
    setFuelType(item.fuelType || '경유')
    setUnitPrice(item.unitPrice || '1650')
    setVolume(item.volume || '')
    setDate(item.date || new Date().toISOString().split('T')[0])
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.headerIcon}>⛽</span>
            <h3 className={styles.title}>자동차 주유 정보 등록 및 관리</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {/* 입력 폼 */}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label}>주유 일자</label>
                <input
                  type="date"
                  className={styles.input}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
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
                  <label className={styles.label}>직접 입력 주유소명</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="주유소 이름을 입력하세요"
                    value={customStation}
                    onChange={e => setCustomStation(e.target.value)}
                  />
                </div>
              )}

              <div className={styles.field}>
                <label className={styles.label}>유종 선택</label>
                <div className={styles.radioGroup}>
                  {FUEL_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`${styles.fuelTypeChip} ${fuelType === t ? styles.chipActive : ''}`}
                      onClick={() => setFuelType(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* ─── 자동 계산 안내 배너 ─── */}
              <div className={styles.autoCalcBanner}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'5px'}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                주유 금액 · 단가 · 주유량 중 <strong>두 가지</strong>를 입력하면 나머지를 자동 계산합니다.
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  주유 금액 (원)
                  {lastChanged.current !== 'amount' && amount && <span className={styles.autoTag}>자동계산</span>}
                </label>
                <FormattedNumberInput
                  className={`${styles.input} ${lastChanged.current !== 'amount' && amount ? styles.autoCalcField : ''}`}
                  placeholder="예: 70,000"
                  value={amount}
                  onChange={val => { lastChanged.current = 'amount'; setAmount(val) }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>리터당 단가 (원/L)</label>
                <FormattedNumberInput
                  className={styles.input}
                  placeholder="예: 1,650"
                  value={unitPrice}
                  onChange={val => { lastChanged.current = 'unitPrice'; setUnitPrice(val) }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  주유량 (L)
                  {lastChanged.current !== 'volume' && volume && <span className={styles.autoTag}>자동계산</span>}
                </label>
                <input
                  type="number"
                  step="0.01"
                  className={`${styles.input} ${styles.inputRight} ${lastChanged.current !== 'volume' && volume ? styles.autoCalcField : ''}`}
                  style={{ textAlign: 'right', fontWeight: 800 }}
                  placeholder="0.00"
                  value={volume}
                  onChange={e => { lastChanged.current = 'volume'; setVolume(e.target.value) }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>누적 주행거리 (km)</label>
                <FormattedNumberInput
                  className={styles.input}
                  placeholder="예: 176,200"
                  value={mileage}
                  onChange={val => setMileage(val)}
                />
              </div>
            </div>

            <div className={styles.formActions}>
              {editingId && (
                <button type="button" className={styles.btnCancel} onClick={resetForm}>
                  수정 취소
                </button>
              )}
              <button type="submit" className={styles.btnSave}>
                {editingId ? '✓ 주유 정보 수정' : '+ 주유 내역 등록'}
              </button>
            </div>
          </form>

          {/* 등록된 주유 이력 목록 */}
          <div className={styles.historySection}>
            <h4 className={styles.historyTitle}>📋 주유 기록 목록 ({fuelHistory.length}건)</h4>
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
                          <span className={styles.mVal}>{item.volume} L</span>
                        </div>
                        <div className={styles.metric}>
                          <span className={styles.mLabel}>단가:</span>
                          <span className={styles.mVal}>{(item.unitPrice || 0).toLocaleString()}원/L</span>
                        </div>
                        {item.mileage > 0 && (
                          <div className={styles.metric}>
                            <span className={styles.mLabel}>누적거리:</span>
                            <span className={styles.mVal}>{(item.mileage).toLocaleString()} km</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={styles.cardBtns}>
                      <button className={styles.btnEdit} onClick={() => handleEdit(item)}>✏️</button>
                      <button className={styles.btnDelete} onClick={() => onDeleteFuel(item.id)}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnClose} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
