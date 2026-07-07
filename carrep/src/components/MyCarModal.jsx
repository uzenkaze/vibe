import { useState, useEffect } from 'react'
import styles from './MyCarModal.module.css'

const CAR_MAKERS = ['현대', '기아', '쉐보레', 'BMW', '벤츠', '아우디', '도요타', '혼다', '닛산', '폭스바겐', '볼보', '포드', '기타']

export default function MyCarModal({ isOpen, onClose, onSave, currentMyCar }) {
  const [maker, setMaker] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')

  useEffect(() => {
    if (isOpen) {
      setMaker(currentMyCar?.maker || '')
      setModel(currentMyCar?.model || '')
      setYear(currentMyCar?.year || '')
      setMileage(currentMyCar?.mileage || '')
    }
  }, [isOpen, currentMyCar])

  if (!isOpen) return null

  const handleSave = () => {
    if (!maker || !model || !year) {
      alert('제조사, 모델명, 연식은 필수 입력 항목입니다.')
      return
    }
    onSave({
      maker,
      model,
      year: Number(year),
      mileage: mileage ? Number(mileage) : ''
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>🚗 내차 정보 관리</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p className={styles.desc}>
            자주 정비하는 내 차량의 기본 정보를 등록해 두면, 보고서 작성 시 매번 입력하지 않고 원클릭으로 신속히 작성할 수 있습니다.
          </p>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>제조사 <span className={styles.req}>*</span></label>
              <select
                className={styles.select}
                value={maker}
                onChange={e => setMaker(e.target.value)}
              >
                <option value="">선택하세요</option>
                {CAR_MAKERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>차종 (모델명) <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                placeholder="예: 모하비"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>연식 (연도) <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                type="number"
                placeholder="예: 2018"
                min="1990"
                max={new Date().getFullYear()}
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>기본 주행거리 (km)</label>
              <input
                className={styles.input}
                type="number"
                placeholder="예: 120000"
                value={mileage}
                onChange={e => setMileage(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>취소</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>내차 등록</button>
        </div>
      </div>
    </div>
  )
}
