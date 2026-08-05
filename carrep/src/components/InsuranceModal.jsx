import { useState, useEffect } from 'react'
import styles from './InsuranceModal.module.css'

const INSURERS = ['KB손해보험', 'DB손해보험', '현대해상', '삼성화재', '메리츠화재', '한화손해보험', '롯데손해보험', '흥국화재', '기타']
const PRODUCTS = ['다이렉트', '일반', '운전자보험', '기타']

const defaultForm = {
  insurer: '',
  product: '',
  startDate: '',
  endDate: '',
  premium: '',
  phone: '',
  memo: ''
}

export default function InsuranceModal({ isOpen, onClose, onSave, current }) {
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    if (isOpen) {
      setForm(current ? { ...defaultForm, ...current } : defaultForm)
    }
  }, [isOpen, current])

  if (!isOpen) return null

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const handleSave = () => {
    if (!form.insurer || !form.startDate || !form.endDate) {
      alert('보험사, 가입일, 만료일은 필수 항목입니다.')
      return
    }
    onSave(form)
    onClose()
  }

  const getDday = () => {
    if (!form.endDate) return null
    const diff = Math.ceil((new Date(form.endDate) - new Date()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { label: `${Math.abs(diff)}일 지났어요`, color: 'var(--accent-red)', expired: true }
    if (diff === 0) return { label: '오늘 만료!', color: 'var(--accent-red)', expired: false }
    if (diff <= 30) return { label: `D-${diff}`, color: 'var(--accent-orange)', expired: false }
    return { label: `D-${diff}`, color: 'var(--accent-green)', expired: false }
  }

  const dday = getDday()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.headerIcon}>🛡️</span>
            <div>
              <div className={styles.title}>자동차 보험 관리</div>
              <div className={styles.subtitle}>보험 정보를 등록하고 갱신일을 관리하세요</div>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {dday && form.endDate && (
          <div className={styles.ddayBanner} style={{ borderColor: dday.color, color: dday.color }}>
            <span className={styles.ddayIcon}>{dday.expired ? '⚠️' : '📅'}</span>
            <span>보험 만료까지 <strong>{dday.label}</strong></span>
          </div>
        )}

        <div className={styles.body}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>보험사 <span className={styles.req}>*</span></label>
              <select className={styles.select} value={form.insurer} onChange={e => set('insurer', e.target.value)}>
                <option value="">선택하세요</option>
                {INSURERS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>보험 상품명</label>
              <select className={styles.select} value={form.product} onChange={e => set('product', e.target.value)}>
                <option value="">선택하세요</option>
                {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>가입일 <span className={styles.req}>*</span></label>
              <input className={styles.input} type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>만료일 <span className={styles.req}>*</span></label>
              <input className={styles.input} type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>연간 보험료</label>
              <input className={styles.input} placeholder="예: 820,000 원" value={form.premium} onChange={e => set('premium', e.target.value)} />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>보험사 연락처</label>
              <input className={styles.input} placeholder="예: 1588-0000" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>메모</label>
            <textarea className={styles.textarea} placeholder="특약, 가입 조건 등 메모" value={form.memo} onChange={e => set('memo', e.target.value)} rows={2} />
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
