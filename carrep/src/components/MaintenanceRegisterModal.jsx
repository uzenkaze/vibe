import React, { useState, useEffect } from 'react'
import styles from './MaintenanceRegisterModal.module.css'
import FormattedNumberInput from './FormattedNumberInput'

export default function MaintenanceRegisterModal({
  isOpen,
  onClose,
  onSave,
  itemName,
  currentOverride,
  currentMileage
}) {
  const [date, setDate] = useState('')
  const [km, setKm] = useState('')
  const [cost, setCost] = useState('')
  const [addToReport, setAddToReport] = useState(false)

  // Initialize values when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (currentOverride) {
        setDate(currentOverride.date || '')
        setKm(currentOverride.km || '')
        setCost(currentOverride.cost || '')
      } else {
        setDate(new Date().toISOString().split('T')[0])
        setKm(currentMileage || '')
        setCost('')
      }
      setAddToReport(false)
    }
  }, [isOpen, currentOverride, currentMileage])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const parsedKm = Number(km)
    if (isNaN(parsedKm) || parsedKm <= 0) {
      alert('정비 당시의 올바른 주행거리를 입력해 주세요.')
      return
    }
    const parsedCost = cost ? Number(cost) : 0
    onSave(itemName, {
      date: date || new Date().toISOString().split('T')[0],
      km: parsedKm,
      cost: isNaN(parsedCost) ? 0 : parsedCost,
      addToReport
    })
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>🔧</span>
          <h2 className={styles.title}>'{itemName}' 정비 이력 등록</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <p className={styles.intro}>
            최근 교환 또는 정비한 이력을 등록하시면 수명(Health) 분석 리포트가 초기화되어 정밀하게 자동 보정됩니다.
          </p>

          <div className={styles.field}>
            <label className={styles.label}>최근 정비/교환 일자</label>
            <input
              type="date"
              className={styles.input}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>정비 당시 주행거리 (km) <span className={styles.req}>*</span></label>
            <FormattedNumberInput
              className={styles.input}
              placeholder={`예: ${currentMileage || 120000}`}
              value={km}
              onChange={val => setKm(val)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>정비/부품 비용 (원)</label>
            <FormattedNumberInput
              className={styles.input}
              placeholder="예: 80,000"
              value={cost}
              onChange={val => setCost(val)}
            />
          </div>

          <div className={styles.checkboxField}>
            <input
              type="checkbox"
              id="addToReportCheckbox"
              className={styles.checkbox}
              checked={addToReport}
              onChange={e => setAddToReport(e.target.checked)}
            />
            <label htmlFor="addToReportCheckbox" className={styles.checkboxLabel}>
              📋 현재 작성 중인 정비 내역(Step 2)에 이 수리 내역을 자동으로 추가합니다.
            </label>
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>취소</button>
            <button type="submit" className={styles.submitBtn}>저장 완료</button>
          </div>
        </form>
      </div>
    </div>
  )
}
