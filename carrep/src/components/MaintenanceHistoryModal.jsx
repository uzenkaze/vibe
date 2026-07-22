import React from 'react'
import styles from './MaintenanceHistoryModal.module.css'

export default function MaintenanceHistoryModal({
  isOpen,
  onClose,
  itemName,
  historyList = [],
  onDeleteItem
}) {
  if (!isOpen) return null

  // Sort history newest first (by date, then by km)
  const sortedHistory = [...historyList].sort((a, b) => {
    const dateA = new Date(a.date || 0)
    const dateB = new Date(b.date || 0)
    if (dateB - dateA !== 0) return dateB - dateA
    return Number(b.km) - Number(a.km)
  })

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <span className={styles.icon}>📋</span>
          <h2 className={styles.title}>'{itemName}' 정비 이력 목록</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {sortedHistory.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📂</span>
              <p className={styles.emptyText}>등록된 정비 이력이 없습니다.</p>
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>정비 일자</th>
                    <th>주행거리 (km)</th>
                    <th>비용 (원)</th>
                    <th style={{ width: '50px' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item) => {
                    const displayKm = isNaN(Number(item.km)) ? 0 : Number(item.km)
                    const displayCost = isNaN(Number(item.cost)) ? 0 : Number(item.cost)
                    return (
                      <tr key={item.id}>
                        <td>{item.date || '날짜 미입력'}</td>
                        <td>{displayKm.toLocaleString()} km</td>
                        <td>{displayCost > 0 ? `${displayCost.toLocaleString()}원` : '미입력'}</td>
                        <td>
                          <button
                            type="button"
                            className={styles.deleteRowBtn}
                            onClick={() => onDeleteItem(item.id)}
                            title="정비 기록 삭제"
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
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
