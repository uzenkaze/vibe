import { useState, useEffect } from 'react'
import styles from './RepairListPage.module.css'
import { getMaintenanceStatus } from '../utils/carMaintenance'
import MaintenanceRegisterModal from '../components/MaintenanceRegisterModal'
import MaintenanceHistoryModal from '../components/MaintenanceHistoryModal'

export default function RepairListPage({
  reports = [],
  myCar,
  vehicleInfo,
  initialTab = 'list',
  onSelectReport,
  onDeleteReport,
  onGoRepair,
  onNext,
  repairItems,
  setRepairItems,
}) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'list' | 'consumables'

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  // ── 소모품 정비 이력 상태 ──
  const [historyMap, setHistoryMap] = useState(() => {
    try {
      const saved = localStorage.getItem('carrep_maintenance_history')
      if (saved) return JSON.parse(saved)
    } catch (e) {}
    return {}
  })

  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedDiagItem, setSelectedDiagItem] = useState(null)

  // ── 소모품 필터 탭 ──
  const [consumableFilter, setConsumableFilter] = useState('all') // 'all' | 'danger' | 'warning' | 'good'

  const carYear     = myCar?.year     || vehicleInfo?.year     || ''
  const carMileage  = myCar?.mileage  || vehicleInfo?.mileage  || ''

  const maintenanceItems = getMaintenanceStatus(carMileage, carYear, historyMap)
  const dangerItems  = maintenanceItems.filter(i => i.status === 'danger')
  const warningItems = maintenanceItems.filter(i => i.status === 'warning')
  const goodItems    = maintenanceItems.filter(i => i.status === 'good')

  const filteredConsumables = consumableFilter === 'all'
    ? maintenanceItems
    : maintenanceItems.filter(i => i.status === consumableFilter)

  // ── 정비 이력 등록 ──
  const handleSaveDiagOverride = (itemName, data) => {
    const currentList = historyMap[itemName] || []
    const newRecord = { id: Date.now(), date: data.date, km: data.km, cost: data.cost }
    const updatedHistory = { ...historyMap, [itemName]: [...currentList, newRecord] }
    setHistoryMap(updatedHistory)
    localStorage.setItem('carrep_maintenance_history', JSON.stringify(updatedHistory))
    setIsDiagModalOpen(false)
    if (data.addToReport && setRepairItems) {
      let category = '기타'
      if (['엔진', '오일', '부동액', '냉각수'].some(k => itemName.includes(k))) category = '오일류'
      else if (['쇼바', '서스', '미미', '마운트', '타이어', '얼라인'].some(k => itemName.includes(k))) category = '현가계'
      else if (['미션', '구동'].some(k => itemName.includes(k))) category = '구동계'
      else if (['브레이크', '패드'].some(k => itemName.includes(k))) category = '제동계'
      else if (['조향', '벨트', '점화'].some(k => itemName.includes(k))) category = '조향계'
      const newRepair = {
        id: Date.now(), category, name: `${itemName} 교환`,
        partsCost: data.cost || 0, laborCost: 0,
        details: `${data.date} 주행거리 ${Number(data.km).toLocaleString()}km 시점에 정비 등록.`
      }
      setRepairItems(prev => [newRepair, ...prev])
      alert(`'${itemName}' 정비 이력이 추가 등록되었으며, 현재 정비 내역에 자동 등록되었습니다!`)
    } else {
      alert(`'${itemName}' 정비 이력이 성공적으로 추가 등록되었습니다!`)
    }
  }

  const handleDeleteHistoryItem = (itemName, itemId) => {
    const currentList = historyMap[itemName] || []
    const updatedList = currentList.filter(item => item.id !== itemId)
    const updatedHistory = { ...historyMap, [itemName]: updatedList }
    if (updatedList.length === 0) delete updatedHistory[itemName]
    setHistoryMap(updatedHistory)
    localStorage.setItem('carrep_maintenance_history', JSON.stringify(updatedHistory))
    if (updatedList.length === 0) setIsHistoryModalOpen(false)
  }

  // ── 정비목록 정렬 ──
  const sorted = [...reports].sort((a, b) => {
    const da = (a.repairItems || []).map(i => i.repairDate).filter(Boolean).sort().reverse()[0] || a.createdAt
    const db = (b.repairItems || []).map(i => i.repairDate).filter(Boolean).sort().reverse()[0] || b.createdAt
    return new Date(db) - new Date(da)
  })

  return (
    <div className={styles.page}>

      {/* ── 페이지 헤더 ── */}
      <div className={styles.pageHeader}>
        <div className={styles.pageHeaderInner}>
          <div className={styles.pageTitleGroup}>
            <h2 className={styles.pageTitle}>정비 관리</h2>
            <span className={styles.pageSubtitle}>정비 내역 및 소모품 상태를 한눈에</span>
          </div>
          <button className={styles.newRepairBtn} onClick={onGoRepair}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'5px'}}>
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            정비 등록
          </button>
        </div>

        {/* ── 탭 바 ── */}
        <div className={styles.tabBar}>
          <button
            className={`${styles.tab} ${activeTab === 'list' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'5px'}}>
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            정비 내역
            {reports.length > 0 && <span className={styles.tabBadge}>{reports.length}</span>}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'consumables' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('consumables')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'5px'}}>
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
            소모품 수명
            {dangerItems.length > 0 && <span className={styles.tabBadgeDanger}>{dangerItems.length}</span>}
          </button>
        </div>
      </div>

      {/* ── 탭 콘텐츠 ── */}
      <div className={styles.tabContent}>

        {/* ── 정비 내역 탭 ── */}
        {activeTab === 'list' && (
          <div className={styles.listTab}>
            {sorted.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📋</div>
                <div className={styles.emptyTitle}>저장된 정비 내역이 없습니다</div>
                <div className={styles.emptyDesc}>
                  정비 등록 버튼을 눌러 수리/소모품 내역을<br />처음으로 기록해보세요.
                </div>
                <button className={styles.emptyActionBtn} onClick={onGoRepair}>
                  + 정비 내역 등록하기
                </button>
              </div>
            ) : (
              <div className={styles.repairList}>
                {sorted.map(r => {
                  const total = (r.repairItems || []).reduce((s, i) => s + (Number(i.partsCost)||0) + (Number(i.laborCost)||0), 0)
                  const grandTotal = total + Math.round(total * 0.1)
                  const names = (r.repairItems || []).map(i => i.name).filter(Boolean)
                  const title = names.length > 0 ? names.join(', ') : '정비 항목'
                  const dates = (r.repairItems || []).map(i => i.repairDate).filter(Boolean)
                  const date = dates[0] || new Date(r.createdAt).toLocaleDateString('ko-KR')
                  const itemCount = (r.repairItems || []).length

                  return (
                    <div key={r.id} className={styles.repairCard} onClick={() => onSelectReport(r)}>
                      <div className={styles.repairCardLeft}>
                        <div className={styles.repairDateTag}>{date}</div>
                        <div className={styles.repairTitle}>{title}</div>
                        <div className={styles.repairMeta}>
                          <span className={styles.repairItemCount}>항목 {itemCount}개</span>
                          <span className={styles.repairDot}>·</span>
                          <span className={styles.repairPrice}>{grandTotal.toLocaleString()}원</span>
                        </div>
                      </div>
                      <div className={styles.repairCardRight} onClick={e => e.stopPropagation()}>
                        <button className={styles.btnView} onClick={() => onSelectReport(r)}>
                          보기 →
                        </button>
                        <button
                          className={styles.btnDelete}
                          onClick={() => onDeleteReport(r.id)}
                          title="삭제"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── 소모품 수명 탭 ── */}
        {activeTab === 'consumables' && (
          <div className={styles.consumablesTab}>

            {/* 요약 배지 */}
            <div className={styles.consumableSummary}>
              <button
                className={`${styles.summaryBadge} ${styles.badgeDanger} ${consumableFilter === 'danger' ? styles.summaryBadgeActive : ''}`}
                onClick={() => setConsumableFilter(consumableFilter === 'danger' ? 'all' : 'danger')}
              >
                <span className={styles.summaryNum}>{dangerItems.length}</span>
                <span className={styles.summaryLabel}>교체 대상</span>
              </button>
              <button
                className={`${styles.summaryBadge} ${styles.badgeWarning} ${consumableFilter === 'warning' ? styles.summaryBadgeActive : ''}`}
                onClick={() => setConsumableFilter(consumableFilter === 'warning' ? 'all' : 'warning')}
              >
                <span className={styles.summaryNum}>{warningItems.length}</span>
                <span className={styles.summaryLabel}>점검 권장</span>
              </button>
              <button
                className={`${styles.summaryBadge} ${styles.badgeGood} ${consumableFilter === 'good' ? styles.summaryBadgeActive : ''}`}
                onClick={() => setConsumableFilter(consumableFilter === 'good' ? 'all' : 'good')}
              >
                <span className={styles.summaryNum}>{goodItems.length}</span>
                <span className={styles.summaryLabel}>상태 양호</span>
              </button>
            </div>

            {!(carYear || carMileage) ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔧</div>
                <div className={styles.emptyTitle}>차량 정보를 먼저 등록해주세요</div>
                <div className={styles.emptyDesc}>
                  차량 연식과 주행거리를 등록하시면<br />소모품 교체 주기 및 잔여 수명이 표시됩니다.
                </div>
              </div>
            ) : (
              <div className={styles.consumablesList}>
                {filteredConsumables.map((item, idx) => {
                  const isDanger  = item.status === 'danger'
                  const isWarning = item.status === 'warning'
                  const statusText = isDanger ? '교체' : isWarning ? '점검' : '양호'
                  const hasHistory = item.historyCount > 0

                  return (
                    <div
                      key={idx}
                      className={`${styles.consumableItem} ${isDanger ? styles.itemDanger : isWarning ? styles.itemWarning : styles.itemGood}`}
                    >
                      <div className={styles.consumableTopRow}>
                        <span className={styles.consumableName}>{item.name}</span>
                        <span className={styles.healthPct}>{item.health}%</span>
                      </div>

                      <div className={styles.progressBarBg}>
                        <div
                          className={styles.progressBarFill}
                          style={{
                            width: `${item.health}%`,
                            backgroundColor: isDanger ? '#ef4444' : isWarning ? '#f97316' : '#22c55e'
                          }}
                        />
                      </div>

                      <div className={styles.consumableMidRow}>
                        <span className={`${styles.statusBadge} ${isDanger ? styles.statusDanger : isWarning ? styles.statusWarning : styles.statusGood}`}>
                          {statusText}
                        </span>
                        <span className={styles.consumableReason}>{item.reason}</span>
                      </div>

                      {item.tip && (
                        <div className={styles.consumableTip}>{item.tip}</div>
                      )}

                      <div className={styles.consumableActions}>
                        <button
                          type="button"
                          className={styles.btnRegister}
                          onClick={() => { setSelectedDiagItem(item.name); setIsDiagModalOpen(true) }}
                          title="정비 이력 등록"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}>
                            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                          </svg>
                          정비 등록
                        </button>
                        {hasHistory && (
                          <button
                            type="button"
                            className={styles.btnHistory}
                            onClick={() => { setSelectedDiagItem(item.name); setIsHistoryModalOpen(true) }}
                            title="이력 보기"
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                            이력 ({item.historyCount})
                          </button>
                        )}
                        {onNext && (
                          <button
                            type="button"
                            className={styles.btnGoRepair}
                            onClick={() => onNext(item.name)}
                            title="정비 내역 입력 화면으로 이동"
                          >
                            정비 기록 →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 소모품 모달들 ── */}
      {isDiagModalOpen && selectedDiagItem && (
        <MaintenanceRegisterModal
          isOpen={isDiagModalOpen}
          itemName={selectedDiagItem}
          currentMileage={carMileage}
          onSave={(data) => handleSaveDiagOverride(selectedDiagItem, data)}
          onClose={() => setIsDiagModalOpen(false)}
        />
      )}
      {isHistoryModalOpen && selectedDiagItem && (
        <MaintenanceHistoryModal
          isOpen={isHistoryModalOpen}
          itemName={selectedDiagItem}
          historyList={historyMap[selectedDiagItem] || []}
          onDelete={(itemId) => handleDeleteHistoryItem(selectedDiagItem, itemId)}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  )
}
