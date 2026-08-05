import { useRef, useState } from 'react'
import styles from './Step1Vehicle.module.css'
import { getMaintenanceStatus } from '../utils/carMaintenance'
import MaintenanceRegisterModal from '../components/MaintenanceRegisterModal'
import MaintenanceHistoryModal from '../components/MaintenanceHistoryModal'
import DiagnosticFilterModal from '../components/DiagnosticFilterModal'

const CAR_MAKERS = ['현대', '기아', '쉐보레', 'BMW', '벤츠', '아우디', '도요타', '혼다', '닛산', '폭스바겐', '볼보', '포드', '기타']

// 차량 색상 옵션 (hex 컬러 + 표시명)
// 흰색 차량 이미지 위에 올바르게 색이 입혀지도록 multiply(어둡게 누르기) 및 color(색상 덮어씌우기) 모드를 세분화합니다.
const COLOR_OPTIONS = [
  { label: '선택 안함', value: '', hex: null },
  { label: '흰색 (화이트)', value: '흰색', hex: '#ffffff', blend: 'normal', opacity: 0.05 },
  { label: '검정 (블랙)', value: '검정', hex: '#151515', blend: 'multiply', opacity: 0.85 },
  { label: '티타늄실버 (Titanium Silver)', value: '티타늄실버', hex: '#5a5b5f' },
  { label: '은색 (실버)', value: '은색', hex: '#a8a8a8', blend: 'multiply', opacity: 0.4 },
  { label: '회색 (그레이)', value: '회색', hex: '#5c5c5c', blend: 'multiply', opacity: 0.6 },
  { label: '빨간색 (레드)', value: '빨간색', hex: '#ff1a1a', blend: 'color', opacity: 0.65 },
  { label: '와인', value: '와인', hex: '#8a0020', blend: 'color', opacity: 0.7 },
  { label: '파란색 (블루)', value: '파란색', hex: '#1a5ad7', blend: 'color', opacity: 0.65 },
  { label: '하늘색 (스카이블루)', value: '하늘색', hex: '#3fa2f7', blend: 'color', opacity: 0.6 },
  { label: '초록색 (그린)', value: '초록색', hex: '#1db53d', blend: 'color', opacity: 0.6 },
  { label: '진초록 (다크그린)', value: '진초록', hex: '#0b4a1b', blend: 'color', opacity: 0.7 },
  { label: '노란색 (옐로우)', value: '노란색', hex: '#ffd700', blend: 'color', opacity: 0.6 },
  { label: '주황색 (오렌지)', value: '주황색', hex: '#ff7700', blend: 'color', opacity: 0.6 },
  { label: '갈색 (브라운)', value: '갈색', hex: '#8b4513', blend: 'color', opacity: 0.65 },
  { label: '베이지 (샴페인)', value: '베이지', hex: '#e1d4b7', blend: 'color', opacity: 0.5 },
  { label: '금색 (골드)', value: '금색', hex: '#d4af37', blend: 'color', opacity: 0.55 },
  { label: '보라 (퍼플)', value: '보라', hex: '#8a2be2', blend: 'color', opacity: 0.6 },
]

export default function Step1Vehicle({
  vehicleInfo,
  setVehicleInfo,
  reports = [],
  myCar,
  dbStatus = 'offline',
  onSaveMyCar,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onNext,
  repairItems = [],
  setRepairItems,
  onSave,
  isSaved
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Helper to extract timestamp for sorting reports by recent repair date
  const getReportSortTimestamp = (r) => {
    const itemDates = (r.repairItems || []).map(it => it.repairDate).filter(Boolean)
    if (itemDates.length > 0) {
      const sortedItemDates = [...itemDates].sort().reverse()
      const t = new Date(sortedItemDates[0]).getTime()
      if (!isNaN(t)) return t
    }
    if (r.vehicleInfo?.repairDate) {
      const t = new Date(r.vehicleInfo.repairDate).getTime()
      if (!isNaN(t)) return t
    }
    if (r.createdAt) {
      const t = new Date(r.createdAt).getTime()
      if (!isNaN(t)) return t
    }
    return Number(r.id) || 0
  }

  const sortedReports = [...reports].sort((a, b) => getReportSortTimestamp(b) - getReportSortTimestamp(a))

  // History data map: { '엔진오일': [ { id, date, km, cost }, ... ] }
  const [historyMap, setHistoryMap] = useState(() => {
    const savedHistory = localStorage.getItem('carrep_maintenance_history')
    if (savedHistory) {
      return JSON.parse(savedHistory)
    }
    
    // Auto-migrate from old single 'overrides' data if present
    const savedOverrides = localStorage.getItem('carrep_maintenance_overrides')
    if (savedOverrides) {
      try {
        const parsed = JSON.parse(savedOverrides)
        const migrated = {}
        Object.keys(parsed).forEach(key => {
          if (parsed[key]) {
            migrated[key] = [{
              id: Date.now() - Math.random() * 100000,
              date: parsed[key].date || '',
              km: parsed[key].km || 0,
              cost: parsed[key].cost || 0
            }]
          }
        })
        localStorage.setItem('carrep_maintenance_history', JSON.stringify(migrated))
        localStorage.removeItem('carrep_maintenance_overrides') // cleanup
        return migrated
      } catch (e) {
        console.error('Failed to migrate overrides to history:', e)
      }
    }
    
    return {}
  })

  // Modals visibility states
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedDiagItem, setSelectedDiagItem] = useState(null)
  const [selectedFilterType, setSelectedFilterType] = useState(null) // 'danger' | 'warning' | 'good'

  const handleSaveWithSimulatedGeneration = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      onSaveMyCar(vehicleInfo)
    }, 1500)
  }

  // Handle adding a new history record
  const handleSaveDiagOverride = (arg1, arg2) => {
    const itemName = typeof arg1 === 'string' ? arg1 : selectedDiagItem
    const data = typeof arg1 === 'string' ? arg2 : arg1
    if (!itemName || !data) return

    const currentList = historyMap[itemName] || []
    const parsedKm = Number(data.km)
    const parsedCost = Number(data.cost)
    const newRecord = {
      id: Date.now(),
      date: data.date || new Date().toISOString().split('T')[0],
      km: isNaN(parsedKm) ? 0 : parsedKm,
      cost: isNaN(parsedCost) ? 0 : parsedCost,
      notes: data.notes || ''
    }

    const updatedHistory = {
      ...historyMap,
      [itemName]: [...currentList, newRecord]
    }

    setHistoryMap(updatedHistory)
    localStorage.setItem('carrep_maintenance_history', JSON.stringify(updatedHistory))
    setIsDiagModalOpen(false)

    // Add to current report (Step 2) if checked
    if (data.addToReport && setRepairItems) {
      let category = '기타'
      if (['엔진', '오일', '부동액', '냉각수'].some(k => itemName.includes(k))) category = '오일류'
      else if (['쇼바', '서스', '미미', '마운트', '타이어', '얼라인'].some(k => itemName.includes(k))) category = '현가계'
      else if (['미션', '구동'].some(k => itemName.includes(k))) category = '구동계'
      else if (['브레이크', '패드'].some(k => itemName.includes(k))) category = '제동계'
      else if (['조향', '벨트', '점화'].some(k => itemName.includes(k))) category = '조향계'

      const newRepair = {
        id: Date.now(),
        category,
        name: `${itemName} 교환`,
        partsCost: data.cost || 0,
        laborCost: 0,
        details: `${data.date} 주행거리 ${data.km.toLocaleString()}km 시점에 수동 정비 등록 및 수명 리셋 완료.`
      }
      setRepairItems(prev => [newRepair, ...prev])
      alert(`'${itemName}' 정비 이력이 추가 등록되었으며, 현재 작성 중인 정비 내역에 자동 등록되었습니다!`)
    } else {
      alert(`'${itemName}' 정비 이력이 성공적으로 추가 등록되었습니다!`)
    }
  }

  // Handle deleting a history record
  const handleDeleteHistoryItem = (itemName, itemId) => {
    const currentList = historyMap[itemName] || []
    const updatedList = currentList.filter(item => item.id !== itemId)
    
    const updatedHistory = {
      ...historyMap,
      [itemName]: updatedList
    }

    // Cleanup empty keys to keep localStorage light
    if (updatedList.length === 0) {
      delete updatedHistory[itemName]
    }

    setHistoryMap(updatedHistory)
    localStorage.setItem('carrep_maintenance_history', JSON.stringify(updatedHistory))
    
    // Close modal if list becomes empty
    if (updatedList.length === 0) {
      setIsHistoryModalOpen(false)
    }
  }

  const set = (key, val) => setVehicleInfo(prev => ({ ...prev, [key]: val }))
  const canNext = vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year
  const dateInputRef = useRef(null)

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker()
      } else {
        dateInputRef.current.focus()
      }
    }
  }


  const isFormFilledForMyCar = vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year

  const getImagePath = (path) => {
    if (!path) return ''
    const base = import.meta.env.BASE_URL || '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const cleanBase = base.endsWith('/') ? base : `${base}/`
    return `${cleanBase}${cleanPath}`
  }

  const isMohave = vehicleInfo.model?.toLowerCase()?.includes('모하비') || vehicleInfo.model?.toLowerCase()?.includes('mohave')
  const carImageUrl = isMohave 
    ? (vehicleInfo.color === '티타늄실버' || vehicleInfo.color === '티타늄' || vehicleInfo.color === '실버' || !vehicleInfo.color
        ? getImagePath('/mohave_titanium.png') 
        : getImagePath('/mohave_exterior.png'))
    : 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80'

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80'
  }

  // 색상 오버레이 스타일 계산
  const selectedColorOption = COLOR_OPTIONS.find(c => c.value === vehicleInfo.color)
  const colorOverlayStyle = selectedColorOption?.hex
    ? {
        position: 'absolute',
        inset: 0,
        backgroundColor: selectedColorOption.hex,
        mixBlendMode: selectedColorOption.blend || 'hue',
        opacity: selectedColorOption.opacity || 0.5,
        pointerEvents: 'none',
        zIndex: 1
      }
    : null

  // Diagnostic consumable list
  const maintenanceItems = getMaintenanceStatus(vehicleInfo.mileage, vehicleInfo.year, historyMap)
  const dangerItems = maintenanceItems.filter(item => item.status === 'danger')
  const warningItems = maintenanceItems.filter(item => item.status === 'warning')
  const goodItems = maintenanceItems.filter(item => item.status === 'good')

  return (
    <div className={styles.container}>

      {/* ───── Hero Banner: 차량 프로필 (폼 위 최상단 / 모바일 우선) ───── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroImageWrap}>
          {vehicleInfo.model ? (
            <img
              src={carImageUrl}
              alt={vehicleInfo.model}
              className={styles.heroCarImage}
              onError={handleImageError}
              style={{ opacity: isGenerating ? 0.2 : 1 }}
            />
          ) : (
            <div className={styles.heroEmptyPlaceholder}>
              <span className={styles.heroEmptyIcon}>🚗</span>
              <span className={styles.heroEmptyText}>차량 정보를 입력하면 차량 이미지가 표시됩니다</span>
            </div>
          )}
          {isGenerating && (
            <div className={styles.generatingOverlay}>
              <div className={styles.spinner} />
              <span>AI 차량 이미지 생성 중...</span>
            </div>
          )}
          {/* 색상 기반 커러 오버레이 */}
          {colorOverlayStyle && vehicleInfo.model && (
            <div style={colorOverlayStyle} />
          )}
          {/* 차량 이미지 하단 스펙 바 (등록일, 공인연비, 타이어 사이즈, 배기량) */}
          {vehicleInfo.model && (
            <div className={styles.imageSpecsBar}>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>📅</span>
                <div className={styles.specMeta}>
                  <span className={styles.specLabel}>최초 등록일</span>
                  <span className={styles.specVal}>{vehicleInfo.regDate || '2008.11.20'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>⛽</span>
                <div className={styles.specMeta}>
                  <span className={styles.specLabel}>공인 연비</span>
                  <span className={styles.specVal}>{vehicleInfo.fuelEconomy || '9.4 km/L'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>🛞</span>
                <div className={styles.specMeta}>
                  <span className={styles.specLabel}>타이어 규격</span>
                  <span className={styles.specVal}>{vehicleInfo.tireSize || '265/60R18'}</span>
                </div>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specIcon}>⚡</span>
                <div className={styles.specMeta}>
                  <span className={styles.specLabel}>엔진 배기량</span>
                  <span className={styles.specVal}>{vehicleInfo.engineDisp || '2,959 cc'}</span>
                </div>
              </div>
            </div>
          )}
          <div className={styles.heroGradient} />
        </div>

        <div className={styles.heroInfo}>
          <div className={styles.heroTopRow}>
            <div>
              <div className={styles.heroCarName}>
                {vehicleInfo.model ? (
                  <>
                    <span className={styles.heroMaker}>{vehicleInfo.maker}</span>
                    {' '}
                    <span className={styles.heroModel}>{vehicleInfo.model}</span>
                  </>
                ) : (
                  <span className={styles.heroPlaceholderText}>차종을 입력해 주세요</span>
                )}
              </div>
            </div>

            <div className={styles.heroRightTop}>
              {(dbStatus === 'local' || dbStatus === 'cloud') ? (
                <span className={`${styles.badge} ${styles.badgeSqlite}`}>🟢 GitHub 연결</span>
              ) : (
                <span className={`${styles.badge} ${styles.badgeLocal}`}>🔴 미연결</span>
              )}
            </div>
          </div>

          {(vehicleInfo.year || vehicleInfo.mileage) && (
            <div className={styles.heroStatRow}>
              <div
                className={`${styles.heroStat} ${styles.heroStatDanger}`}
                onClick={() => { setSelectedFilterType('danger'); setIsFilterModalOpen(true) }}
                title="교체 대상 항목 보기"
              >
                <span className={styles.heroStatNum}>{dangerItems.length}</span>
                <span className={styles.heroStatLabel}>교체 대상</span>
              </div>
              <div
                className={`${styles.heroStat} ${styles.heroStatWarning}`}
                onClick={() => { setSelectedFilterType('warning'); setIsFilterModalOpen(true) }}
                title="점검 권장 항목 보기"
              >
                <span className={styles.heroStatNum}>{warningItems.length}</span>
                <span className={styles.heroStatLabel}>점검 권장</span>
              </div>
              <div
                className={`${styles.heroStat} ${styles.heroStatGood}`}
                onClick={() => { setSelectedFilterType('good'); setIsFilterModalOpen(true) }}
                title="상태 양호 항목 보기"
              >
                <span className={styles.heroStatNum}>{goodItems.length}</span>
                <span className={styles.heroStatLabel}>상태 양호</span>
              </div>
              <div className={`${styles.heroStat} ${styles.heroStatTotal}`}>
                <span className={styles.heroStatNum}>{maintenanceItems.length}</span>
                <span className={styles.heroStatLabel}>전체 점검 항목</span>
              </div>
            </div>
          )}


        </div>
      </div>

      {/* ───── 페이지 제목 (심플) ───── */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>내차정보</h1>
        </div>
        <p className={styles.subtitle}>정비 보고서를 생성할 차량의 기본 정보를 입력하거나, 이전 정비 보고서 목록을 선택하세요.</p>
      </div>

      <div className={styles.mainLayout}>
        {/* Left column: input form */}
        <div className={styles.formSection}>
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🚗</span>
                <span>차량정보</span>
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.field}>
                <label className={styles.label}>제조사 <span className={styles.req}>*</span></label>
                <select
                  className={styles.select}
                  value={vehicleInfo.maker}
                  onChange={e => set('maker', e.target.value)}
                >
                  <option value="">선택하세요</option>
                  {CAR_MAKERS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>차종 (모델명) <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  placeholder="예: 모하비, 소나타, 그랜저..."
                  value={vehicleInfo.model}
                  onChange={e => set('model', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>연식 <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="예: 2009"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={vehicleInfo.year}
                  onChange={e => set('year', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>구동 방식</label>
                <select
                  className={styles.select}
                  value={vehicleInfo.driveType || '2WD'}
                  onChange={e => set('driveType', e.target.value)}
                >
                  <option value="2WD">2WD (이륜구동)</option>
                  <option value="4WD">4WD (사륜구동)</option>
                  <option value="AWD">AWD (상시 사륜구동)</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>주행거리 (km)</label>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="예: 150000"
                  value={vehicleInfo.mileage}
                  onChange={e => set('mileage', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>정비 일자</label>
                <div className={styles.dateContainer}>
                  <input
                    ref={dateInputRef}
                    className={`${styles.input} ${styles.dateInput}`}
                    type="date"
                    value={vehicleInfo.repairDate}
                    onChange={e => set('repairDate', e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.calendarBtn}
                    onClick={handleCalendarClick}
                    title="달력 열기"
                  >
                    📅
                  </button>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>정비소명</label>
                <input
                  className={styles.input}
                  placeholder="예: 현대자동차 서비스센터"
                  value={vehicleInfo.shopName}
                  onChange={e => set('shopName', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>📅 최초 등록일</label>
                <input
                  className={styles.input}
                  placeholder="예: 2008.11.20"
                  value={vehicleInfo.regDate || ''}
                  onChange={e => set('regDate', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>⛽ 공인 연비</label>
                <input
                  className={styles.input}
                  placeholder="예: 9.4 km/L"
                  value={vehicleInfo.fuelEconomy || ''}
                  onChange={e => set('fuelEconomy', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>🛞 타이어 규격</label>
                <input
                  className={styles.input}
                  placeholder="예: 265/60R18"
                  value={vehicleInfo.tireSize || ''}
                  onChange={e => set('tireSize', e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>⚡ 엔진 배기량</label>
                <input
                  className={styles.input}
                  placeholder="예: 2,959 cc"
                  value={vehicleInfo.engineDisp || ''}
                  onChange={e => set('engineDisp', e.target.value)}
                />
              </div>
            </div>

            {isFormFilledForMyCar && (
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.registerMyCarBtn}
                  onClick={handleSaveWithSimulatedGeneration}
                >
                  💾 현재 정보를 '내 차량'으로 등록
                </button>
              </div>
            )}
          </div>

          {onSave && (repairItems.length > 0 || isSaved) && (
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.btn}
                onClick={onSave}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700
                }}
              >
                💾 정비내역 저장
              </button>
            </div>
          )}
        </div>

        {/* Floating Sticky Circular Action Button on the Right Area */}
        <div className={styles.floatingRightAction}>
          <button
            type="button"
            className={styles.floatingCircularBtn}
            onClick={onNext}
            disabled={!canNext}
            title="정비내역 입력 화면으로 이동"
          >
            <span className={styles.floatingBtnIcon}>📝</span>
            <span className={styles.floatingBtnLabel}>정비입력</span>
          </button>
        </div>

        {/* Right column: 실시간 소모품 진단 및 차량 사진 */}
        <div className={styles.diagnosticsPanel}>
          <div className={styles.diagnosticsCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🔍</span>
              <span>소모품 진단 & 정보</span>
            </div>

            <div className={styles.diagnosticsContent}>

              {(vehicleInfo.year || vehicleInfo.mileage) ? (
                <div className={styles.statusSummaryGrid}>
                  <div
                    className={`${styles.summaryBox} ${styles.summaryDanger}`}
                    onClick={() => {
                      setSelectedFilterType('danger')
                      setIsFilterModalOpen(true)
                    }}
                    title="교체 대상 항목 모아보기"
                  >
                    <span className={styles.summaryCount}>{dangerItems.length}</span>
                    <span className={styles.summaryLabel}>교체 대상</span>
                  </div>
                  <div
                    className={`${styles.summaryBox} ${styles.summaryWarning}`}
                    onClick={() => {
                      setSelectedFilterType('warning')
                      setIsFilterModalOpen(true)
                    }}
                    title="점검 권장 항목 모아보기"
                  >
                    <span className={styles.summaryCount}>{warningItems.length}</span>
                    <span className={styles.summaryLabel}>점검 권장</span>
                  </div>
                  <div
                    className={`${styles.summaryBox} ${styles.summaryGood}`}
                    onClick={() => {
                      setSelectedFilterType('good')
                      setIsFilterModalOpen(true)
                    }}
                    title="상태 양호 항목 모아보기"
                  >
                    <span className={styles.summaryCount}>{goodItems.length}</span>
                    <span className={styles.summaryLabel}>상태 양호</span>
                  </div>
                </div>
              ) : null}

              <div className={styles.consumablesSection}>
                <div className={styles.consumableSectionTitle}>🔧 항목별 소모품 잔여 수명</div>

                {!(vehicleInfo.year || vehicleInfo.mileage) ? (
                  <div className={styles.diagnosticsEmptyState}>
                    차량 연식과 주행거리를 입력하시면 실시간 교체 주기 및 권장 상태 진단 리포트가 여기에 생성됩니다.
                  </div>
                ) : (
                  <div className={styles.consumablesList}>
                    {maintenanceItems.map((item, idx) => {
                      const isDanger = item.status === 'danger'
                      const isWarning = item.status === 'warning'
                      const statusText = isDanger ? '교체' : isWarning ? '점검' : '양호'
                      const hasHistory = item.historyCount > 0
                      
                      return (
                        <div key={idx} className={`${styles.consumableItem} ${isDanger ? styles.itemDanger : isWarning ? styles.itemWarning : styles.itemGood}`}>
                          {/* 1. Title Row */}
                          <div className={styles.consumableTitleRow}>
                            <span className={styles.consumableName}>{item.name}</span>
                          </div>
                          
                          {/* 2. Sub Badges Row (Title 하단에 양호, 등록, 이력, 잔여수명 92% 배치) */}
                          <div className={styles.consumableSubBadgeRow}>
                            <span className={`${styles.statusBadge} ${isDanger ? styles.badgeDanger : isWarning ? styles.badgeWarning : styles.badgeGood}`}>
                              {statusText}
                            </span>
                            <button
                              type="button"
                              className={styles.diagBtnReg}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedDiagItem(item.name)
                                setIsDiagModalOpen(true)
                              }}
                              title="정비 기록 등록"
                            >
                              🔧 등록
                            </button>
                            
                            {hasHistory && (
                              <button
                                type="button"
                                className={styles.diagBtnHistory}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedDiagItem(item.name)
                                  setIsHistoryModalOpen(true)
                                }}
                                title="등록된 과거 정비 내역 보기"
                              >
                                👁️ 이력 ({item.historyCount})
                              </button>
                            )}
                            <span
                              className={styles.healthText}
                              style={{ color: isDanger ? '#ef4444' : isWarning ? '#f97316' : 'var(--tick-good-color, #ccff00)' }}
                            >{item.health}%</span>
                          </div>

                          {/* 3. 틱 파티션 세그먼트 프로그레스 게이지 (메인과 동일) */}
                          <div className={styles.tickGaugeRow}>
                            <div className={styles.yellowTickGaugeWrapFull} title={`잔여 수명 ${item.health}%`}>
                              {Array.from({ length: 28 }).map((_, tIdx) => {
                                const activeCount = Math.round((item.health / 100) * 28)
                                const isActive = tIdx < activeCount
                                const activeTickColor = isDanger ? '#ef4444' : isWarning ? '#f97316' : 'var(--tick-good-color, #ccff00)'
                                return (
                                  <span
                                    key={tIdx}
                                    className={styles.yellowTickItem}
                                    style={{
                                      backgroundColor: isActive ? activeTickColor : 'rgba(148, 163, 184, 0.25)',
                                      boxShadow: isActive ? `0 0 4px ${activeTickColor}` : 'none'
                                    }}
                                  />
                                )
                              })}
                            </div>
                          </div>

                          {/* 4. Vertical Description Block (상태설명 아래에 교체주기 부연설명 배치) */}
                          <div className={styles.consumableFooterBlock}>
                            <div className={styles.consumableReason}>{item.reason}</div>
                            {item.tip && <div className={styles.consumableTip}>{item.tip}</div>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: 저장된 보고서 목록 (최근 정비일자 내림차순 정렬) */}
      {sortedReports && sortedReports.length > 0 && (
        <div className={styles.reportsSectionFull}>
          <div className={styles.cardHeader}>
            <span className={styles.cardIcon}>📋</span>
            <span>정비 내역 ({sortedReports.length}건 - 최근 정비일순)</span>
          </div>
          <div className={styles.reportGrid}>
            {sortedReports.map(r => {
              const total = r.repairItems.reduce((sum, item) => sum + (Number(item.partsCost) || 0) + (Number(item.laborCost) || 0), 0)
              const vat = Math.round(total * 0.1)
              const grandTotal = total + vat
              const itemNames = (r.repairItems || []).map(it => it.name).filter(Boolean)
              const displayTitle = itemNames.length > 0 ? itemNames.join(', ') : '정비 항목 없음'
              const itemDates = (r.repairItems || []).map(it => it.repairDate).filter(Boolean)
              const displayDate = itemDates.length > 0 ? itemDates[0] : (r.vehicleInfo?.repairDate || new Date(r.createdAt).toLocaleDateString())
              return (
                <div key={r.id} className={styles.reportCard} onClick={() => onSelectReport(r)}>
                  {/* 상단 1줄: 정비항목 타이틀 및 정비일자 */}
                  <div className={styles.reportCardTop}>
                    <span className={styles.reportCardTitle} title={displayTitle}>
                      {displayTitle}
                    </span>
                    <span className={styles.reportCardDate}>
                      📅 정비일자: {displayDate}
                    </span>
                  </div>
                  {/* 하단 2줄: 정비 총금액(좌측) 및 관리 버튼(우측) */}
                  <div className={styles.reportCardBottom}>
                    <div className={styles.reportCardPriceBadge}>
                      <span className={styles.priceLabel}>총 정비금액</span>
                      <span className={styles.reportCardPrice}>{grandTotal.toLocaleString()}원</span>
                    </div>
                    <div className={styles.reportCardActions}>
                      <button
                        type="button"
                        className={styles.editReportBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditReport(r)
                        }}
                        title="보고서 수정"
                      >
                        ✏️ 수정
                      </button>
                      <button
                        type="button"
                        className={styles.deleteReportBtn}
                        onClick={(e) => onDeleteReport(r.id, e)}
                        title="보고서 삭제"
                      >
                        ✕ 삭제
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Manual Diagnostic Log Registration Modal */}
      {isDiagModalOpen && selectedDiagItem && (
        <MaintenanceRegisterModal
          isOpen={isDiagModalOpen}
          onClose={() => setIsDiagModalOpen(false)}
          onSave={(arg1, arg2) => handleSaveDiagOverride(arg1, arg2)}
          itemName={selectedDiagItem}
          currentMileage={vehicleInfo.mileage}
        />
      )}

      {/* Maintenance History List View Modal */}
      <MaintenanceHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        itemName={selectedDiagItem}
        historyList={historyMap[selectedDiagItem] || []}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Diagnostic Category Filter List Modal */}
      <DiagnosticFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filterType={selectedFilterType}
        items={
          selectedFilterType === 'danger'
            ? dangerItems
            : selectedFilterType === 'warning'
            ? warningItems
            : selectedFilterType === 'good'
            ? goodItems
            : []
        }
        onRegisterClick={(itemName) => {
          setSelectedDiagItem(itemName)
          setIsDiagModalOpen(true)
        }}
      />
    </div>
  )
}

