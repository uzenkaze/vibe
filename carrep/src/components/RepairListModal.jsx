import styles from './RepairListModal.module.css'

export default function RepairListModal({ isOpen, onClose, reports = [], onSelectReport, onDeleteReport }) {
  if (!isOpen) return null

  const sorted = [...reports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleRow}>
            <span className={styles.headerIcon}>📋</span>
            <h3 className={styles.title}>저장된 정비 내역 목록 ({reports.length}건)</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {sorted.length === 0 ? (
            <div className={styles.empty}>
              저장된 정비 내역이 없습니다.<br />
              정비 메뉴에서 새로운 수리/소모품 내역을 등록해보세요.
            </div>
          ) : (
            <div className={styles.list}>
              {sorted.map(r => {
                const total = (r.repairItems || []).reduce((s, i) => s + (Number(i.partsCost)||0) + (Number(i.laborCost)||0), 0)
                const grandTotal = total + Math.round(total * 0.1)
                const names = (r.repairItems || []).map(i => i.name).filter(Boolean)
                const title = names.length > 0 ? names.join(', ') : '정비 항목'
                const dates = (r.repairItems || []).map(i => i.repairDate).filter(Boolean)
                const date = dates[0] || new Date(r.createdAt).toLocaleDateString()

                return (
                  <div key={r.id} className={styles.card} onClick={() => { onSelectReport(r); onClose(); }}>
                    <div className={styles.cardMain}>
                      <div className={styles.cardHeader}>
                        <span className={styles.itemTitle}>{title}</span>
                        <span className={styles.itemDate}>{date}</span>
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.itemCount}>항목 {(r.repairItems||[]).length}개</span>
                        <span className={styles.totalPrice}>{grandTotal.toLocaleString()} 원</span>
                      </div>
                    </div>

                    <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                      <button className={styles.btnView} onClick={() => { onSelectReport(r); onClose(); }}>
                        상세보기 →
                      </button>
                      <button className={styles.btnDelete} onClick={() => onDeleteReport(r.id)} title="내역 삭제">
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.btnClose} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
