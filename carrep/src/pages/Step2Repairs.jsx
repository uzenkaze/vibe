import { useState, useRef } from 'react'
import styles from './Step2Repairs.module.css'

const CATEGORIES = ['조향계', '현가계', '구동계', '제동계', '엔진', '냉각계', '전기계', '외장', '내장', '진단점검', '기타']

const EMPTY_ITEM = { id: '', name: '', category: '기타', partsCost: '', laborCost: '', note: '' }

function newItem() {
  return { ...EMPTY_ITEM, id: Date.now() + Math.random() }
}

export default function Step2Repairs({
  repairItems, setRepairItems,
  attachedImages, setAttachedImages,
  onNext, onPrev
}) {
  const [form, setForm] = useState(newItem())
  const [editingId, setEditingId] = useState(null)
  const [tab, setTab] = useState('manual') // 'manual' | 'upload'
  const fileRef = useRef()
  const imgRef = useRef()

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const addItem = () => {
    if (!form.name) return
    if (editingId) {
      setRepairItems(prev => prev.map(it => it.id === editingId ? { ...form } : it))
      setEditingId(null)
    } else {
      setRepairItems(prev => [...prev, { ...form, id: Date.now() }])
    }
    setForm(newItem())
  }

  const editItem = (item) => {
    setForm({ ...item })
    setEditingId(item.id)
    setTab('manual')
  }

  const deleteItem = (id) => setRepairItems(prev => prev.filter(it => it.id !== id))

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setAttachedImages(prev => [...prev, {
          id: Date.now() + Math.random(),
          name: file.name,
          dataUrl: ev.target.result
        }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (id) => setAttachedImages(prev => prev.filter(img => img.id !== id))

  const totalParts = repairItems.reduce((s, it) => s + (Number(it.partsCost) || 0), 0)
  const totalLabor = repairItems.reduce((s, it) => s + (Number(it.laborCost) || 0), 0)
  const totalSupply = totalParts + totalLabor
  const vat = Math.round(totalSupply * 0.1)
  const grandTotal = totalSupply + vat

  const catColor = (cat) => {
    if (cat === '조향계') return '#ff3b30'
    if (cat === '현가계') return '#fa8231'
    if (cat === '구동계') return '#45f3ff'
    if (cat === '제동계') return '#f7b731'
    if (cat === '엔진') return '#fd9644'
    if (cat === '진단점검') return '#a0a8b3'
    return '#bef264'
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>정비 내역 입력</h1>
        <p className={styles.subtitle}>수리한 항목과 금액을 직접 입력하거나, 정비 영수증 이미지를 첨부하세요.</p>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === 'manual' ? styles.tabActive : ''}`} onClick={() => setTab('manual')}>
          ✏️ 항목 직접 입력
        </button>
        <button className={`${styles.tabBtn} ${tab === 'upload' ? styles.tabActive : ''}`} onClick={() => setTab('upload')}>
          📎 파일/이미지 첨부
        </button>
      </div>

      {/* Manual Entry Tab */}
      {tab === 'manual' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>{editingId ? '✏️ 항목 수정' : '+ 새 항목 추가'}</span>
          </div>
          <div className={styles.formGrid}>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label}>정비 항목명 <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                placeholder="예: 파워스티어링 기어 교체, 로어암 교체..."
                value={form.name}
                onChange={e => setF('name', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>부위 구분</label>
              <select className={styles.select} value={form.category} onChange={e => setF('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>부품비 (원)</label>
              <input
                className={styles.input}
                type="number"
                placeholder="0"
                value={form.partsCost}
                onChange={e => setF('partsCost', e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>공임비 (원)</label>
              <input
                className={styles.input}
                type="number"
                placeholder="0"
                value={form.laborCost}
                onChange={e => setF('laborCost', e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label}>비고</label>
              <input
                className={styles.input}
                placeholder="추가 설명 (선택)"
                value={form.note}
                onChange={e => setF('note', e.target.value)}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            {editingId && (
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setEditingId(null); setForm(newItem()) }}>
                취소
              </button>
            )}
            <button
              className={`${styles.btn} ${styles.btnAdd}`}
              onClick={addItem}
              disabled={!form.name}
            >
              {editingId ? '✓ 수정 완료' : '+ 항목 추가'}
            </button>
          </div>
        </div>
      )}

      {/* Image Upload Tab */}
      {tab === 'upload' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}><span>📎 정비 영수증 / 이미지 첨부</span></div>
          <div
            className={styles.dropzone}
            onClick={() => imgRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
              files.forEach(file => {
                const reader = new FileReader()
                reader.onload = ev => setAttachedImages(prev => [...prev, { id: Date.now() + Math.random(), name: file.name, dataUrl: ev.target.result }])
                reader.readAsDataURL(file)
              })
            }}
          >
            <span className={styles.dropIcon}>🖼️</span>
            <p className={styles.dropText}>클릭하거나 이미지를 드래그하여 업로드</p>
            <p className={styles.dropSub}>JPG, PNG, WEBP 파일 지원</p>
            <input ref={imgRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>

          {attachedImages.length > 0 && (
            <div className={styles.imageGrid}>
              {attachedImages.map(img => (
                <div key={img.id} className={styles.imageCard}>
                  <img src={img.dataUrl} alt={img.name} className={styles.imgThumb} />
                  <div className={styles.imgName}>{img.name}</div>
                  <button className={styles.imgRemove} onClick={() => removeImage(img.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      {repairItems.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>📋 등록된 정비 항목 ({repairItems.length}건)</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>구분</th>
                  <th>항목명</th>
                  <th className={styles.numCol}>부품비</th>
                  <th className={styles.numCol}>공임비</th>
                  <th className={styles.numCol}>소계</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {repairItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <span className={styles.catBadge} style={{ borderColor: catColor(item.category), color: catColor(item.category) }}>
                        {item.category}
                      </span>
                    </td>
                    <td>
                      <div>{item.name}</div>
                      {item.note && <div className={styles.noteText}>{item.note}</div>}
                    </td>
                    <td className={styles.numCol}>{Number(item.partsCost || 0).toLocaleString()}</td>
                    <td className={styles.numCol}>{Number(item.laborCost || 0).toLocaleString()}</td>
                    <td className={`${styles.numCol} ${styles.subtotal}`}>
                      {((Number(item.partsCost) || 0) + (Number(item.laborCost) || 0)).toLocaleString()}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.editBtn} onClick={() => editItem(item)}>수정</button>
                        <button className={styles.delBtn} onClick={() => deleteItem(item.id)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>부품비 합계</span>
              <span>{totalParts.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>공임비 합계</span>
              <span>{totalLabor.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>공급가액 소계</span>
              <span>{totalSupply.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>부가가치세 (10%)</span>
              <span>{vat.toLocaleString()} 원</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>합계금액</span>
              <span className={styles.totalValue}>{grandTotal.toLocaleString()} 원</span>
            </div>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onPrev}>
          ← 이전
        </button>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onNext}
          disabled={repairItems.length === 0}
        >
          정비내역 보기 →
        </button>
      </div>
    </div>
  )
}
