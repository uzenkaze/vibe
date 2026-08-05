import React from 'react'
import styles from './DiagnosticFilterModal.module.css'

export default function DiagnosticFilterModal({
  isOpen,
  onClose,
  filterType, // 'danger' | 'warning' | 'good'
  items = [],
  onRegisterClick // callback when clicking [🔧 등록] inside this modal list
}) {
  if (!isOpen) return null

  const getHeaderStyle = () => {
    switch (filterType) {
      case 'danger':
        return {
          title: '교체 대상 소모품 목록',
          class: styles.headerDanger,
          icon: '🚨'
        }
      case 'warning':
        return {
          title: '점검 권장 소모품 목록',
          class: styles.headerWarning,
          icon: '⚠️'
        }
      case 'good':
        return {
          title: '상태 양호 소모품 목록',
          class: styles.headerGood,
          icon: '🟢'
        }
      default:
        return {
          title: '소모품 진단 목록',
          class: styles.headerDefault,
          icon: '🔍'
        }
    }
  }

  const config = getHeaderStyle()

  return (
    <div className={styles.overlay}>
      <div className={`${styles.modal} ${styles[filterType + 'Modal']}`}>
        <div className={`${styles.header} ${config.class}`}>
          <span className={styles.icon}>{config.icon}</span>
          <h2 className={styles.title}>{config.title} ({items.length}건)</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🎉</span>
              <p className={styles.emptyText}>해당 등급의 소모품이 존재하지 않습니다.</p>
            </div>
          ) : (
            <div className={styles.list}>
              {items.map((item, idx) => (
                <div key={idx} className={`${styles.cardItem} ${styles[filterType + 'Card']}`}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleRow}>
                      <span className={styles.cardName}>{item.name}</span>
                      <span className={styles.cardHealth}>{item.health}% 수명 잔여</span>
                    </div>
                    <button
                      type="button"
                      className={styles.registerShortcutBtn}
                      onClick={() => {
                        onClose() // Close this list modal
                        onRegisterClick(item.name) // Open registration modal
                      }}
                      title="정비 기록 등록"
                    >
                      🔧 정비등록
                    </button>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.progressBg}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${item.health}%`,
                          backgroundColor:
                            filterType === 'danger'
                              ? '#ff3b30'
                              : filterType === 'warning'
                              ? '#fa8231'
                              : '#26de81'
                        }}
                      />
                    </div>
                    <div className={styles.metaRow}>
                      <span className={styles.reason}>{item.reason}</span>
                      <span className={styles.tip}>{item.tip}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.closeModalBtn} onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}
