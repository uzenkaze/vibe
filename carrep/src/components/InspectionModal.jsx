import { useState, useEffect } from 'react'
import styles from './InspectionModal.module.css'

const CENTERS = ['한국교통안전공단', '민간 검사소', '기타']

const defaultForm = {
  startDate: '',
  endDate: '',
  center: '',
  memo: ''
}

export default function InspectionModal({ isOpen, onClose, onSave, current }) {
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (isOpen) {
      setForm(current ? { ...defaultForm, ...current } : defaultForm)
    }
  }, [isOpen, current])

  if (!isOpen) return null

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    if (!form.startDate || !form.endDate) {
      alert('검사 시작일과 만료일은 필수 항목입니다.')
      return
    }
    onSave(form)
    onClose()
  }

  const getRemaining = () => {
    if (!form.startDate || !form.endDate) return null
    const now = new Date()
    const start = new Date(form.startDate)
    const end = new Date(form.endDate)
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    const remaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
    const pct = Math.max(0, Math.min(100, (remaining / totalDays) * 100))
    return { remaining, pct, expired: remaining < 0 }
  }

  const rem = getRemaining()

  const fmtDate = (d) => {
    if (!d) return ''
    const dt = new Date(d)
    return `${dt.getFullYear()}. ${dt.getMonth() + 1}. ${dt.getDate()}`
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🔍</span>
            <div>
              <div className={styles.title}>자동차 검사 기간 관리</div>
              <div className={styles.subtitle}>차량 정기 검사 일정을 등록하고 관리하세요</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {rem && form.startDate && (
          <div className={styles.progressSection}>
            {rem.expired ? (
              <div className={styles.expiredLabel}>⚠️ 검사 기간이 만료되었습니다</div>
            ) : (
              <div className={styles.remainLabel}>
                📅 <strong>{fmtDate(form.endDate)}</strong> 까지 &nbsp;
                <span style={{ color: rem.remaining <= 30 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                  {rem.remaining}일 남음
                </span>
              </div>
            )}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${rem.pct}%`,
                  background: rem.remaining <= 30 ? 'var(--accent-red)' : rem.remaining <= 90 ? 'var(--accent-orange)' : 'var(--accent-green)'
                }}
              />
            </div>
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>검사 시작일 <span className={styles.req}>*</span></label>
              <input className={styles.input} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>검사 만료일 <span className={styles.req}>*</span></label>
              <input className={styles.input} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>검사소</label>
            <select className={styles.select} value={form.center} onChange={e => set('center', e.target.value)}>
              <option value="">선택하세요</option>
              {CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>메모</label>
            <textarea className={styles.textarea} placeholder="검사 결과, 특이사항 등 메모" value={form.memo} onChange={e => set('memo', e.target.value)} rows={2} />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnGhost} onClick={onClose}>취소</button>
          <button className={styles.btnPrimary} onClick={handleSave}>💾 저장</button>
        </div>
      </div>
    </div>
  )
}
