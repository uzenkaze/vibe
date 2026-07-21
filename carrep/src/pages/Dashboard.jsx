import { useState, useRef } from 'react'
import styles from './Dashboard.module.css'
import { getMaintenanceStatus } from '../utils/carMaintenance'
import MaintenanceRegisterModal from '../components/MaintenanceRegisterModal'
import MaintenanceHistoryModal from '../components/MaintenanceHistoryModal'
import DiagnosticFilterModal from '../components/DiagnosticFilterModal'

function BrandLogo({ maker }) {
  const isKia = !maker || maker.includes('기아') || maker.includes('KIA')
  const isHyundai = maker && (maker.includes('현대') || maker.includes('HYUNDAI'))

  if (isKia) {
    // 공식 KIA 2021 리브랜딩 로고 (Simple Icons / kia.com 동일 path)
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        width="108"
        height="38"
        fill="currentColor"
        className={styles.kiaLogoSvg}
        title="기아 (KIA)"
      >
        <path d="M13.923 14.175c0 .046.015.072.041.072a.123.123 0 0 0 .058-.024l7.48-4.854a.72.72 0 0 1 .432-.13h1.644c.252 0 .422.168.422.42v3.139c0 .38-.084.6-.42.801l-1.994 1.2a.137.137 0 0 1-.067.024c-.024 0-.048-.019-.048-.088v-3.663c0-.043-.012-.071-.041-.071a.113.113 0 0 0-.058.024l-5.466 3.551a.733.733 0 0 1-.42.127h-3.624c-.254 0-.422-.168-.422-.422V9.757c0-.033-.015-.064-.044-.064a.118.118 0 0 0-.057.024L7.732 11.88c-.036.024-.046.041-.046.058 0 .014.008.029.032.055l2.577 2.575c.034.034.058.06.058.089 0 .024-.039.043-.084.043H7.94c-.183 0-.324-.026-.423-.125l-1.562-1.56a.067.067 0 0 0-.048-.024.103.103 0 0 0-.048.015l-2.61 1.57a.72.72 0 0 1-.423.122H.425C.168 14.7 0 14.53 0 14.279v-3.08c0-.38.084-.6.422-.8L2.43 9.192a.103.103 0 0 1 .052-.016c.032 0 .048.03.048.1V13.4c0 .043.01.063.041.063a.144.144 0 0 0 .06-.024L9.407 9.36a.733.733 0 0 1 .446-.124h3.648c.252 0 .422.168.422.42l-.002 4.518z" />
      </svg>
    )
  }

  if (isHyundai) {
    return (
      <svg width="60" height="24" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="50" cy="20" rx="42" ry="16" stroke="#9ca3af" strokeWidth="4"/>
        <path d="M28 30L40 10M72 30L60 10M34 20H66" stroke="#9ca3af" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    )
  }

  return <span className={styles.makerText}>{maker}</span>
}

function fmtDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}`
}

function getDdayLabel(endDate) {
  if (!endDate) return null
  const d = new Date(endDate)
  const now = new Date()
  now.setHours(0,0,0,0)
  d.setHours(0,0,0,0)
  const diff = Math.ceil((d - now) / (1000*60*60*24))
  if (diff < 0) return { text: `${Math.abs(diff)}일 지났어요`, color: 'var(--accent-red)' }
  if (diff === 0) return { text: '오늘 만료!', color: 'var(--accent-red)' }
  if (diff <= 30) return { text: `D-${diff}`, color: 'var(--accent-orange)' }
  return { text: `D-${diff}`, color: 'var(--accent-green)' }
}

function getInspRemaining(start, end) {
  if (!start || !end) return null
  const s = new Date(start), e = new Date(end), now = new Date()
  const total = Math.ceil((e - s) / (1000*60*60*24))
  const rem = Math.ceil((e - now) / (1000*60*60*24))
  const pct = Math.max(0, Math.min(100, (rem / total) * 100))
  const months = Math.floor(Math.abs(rem) / 30)
  const days = Math.abs(rem) % 30
  const label = rem < 0
    ? `${months > 0 ? months + '개월 ' : ''}${days}일 지났어요`
    : `${months > 0 ? months + '개월 ' : ''}${days}일 남음`
  return { rem, pct, label, expired: rem < 0 }
}

function removeBgFromImage(base64Url, callback) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imgData.data

      const cornerR = data[0]
      const cornerG = data[1]
      const cornerB = data[2]

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const isWhite = r > 220 && g > 220 && b > 220
        const isCornerBg = Math.abs(r - cornerR) < 25 && Math.abs(g - cornerG) < 25 && Math.abs(b - cornerB) < 25

        if (isWhite || isCornerBg) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imgData, 0, 0)
      callback(canvas.toDataURL('image/png'))
    } catch (e) {
      console.warn('Background removal error:', e)
      callback(base64Url)
    }
  }
  img.onerror = () => callback(base64Url)
  img.src = base64Url
}

export default function Dashboard({
  myCar, vehicleInfo, dbStatus,
  reports,
  insurance, inspection,
  onOpenMyCarModal,
  onOpenInsuranceModal,
  onOpenInspectionModal,
  onNext,
  onGoConsumables,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  repairItems,
  setRepairItems,
}) {
  const fileInputRef = useRef(null)
  const [userPhoto, setUserPhoto] = useState(() => {
    try { return localStorage.getItem('carrep_user_car_photo') || null } catch { return null }
  })

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const rawBase64 = event.target.result
        // 사진 등록 시 단색/흰색 배경을 지우고 차량 본체만 보이도록 투명화 처리
        removeBgFromImage(rawBase64, (processedPng) => {
          setUserPhoto(processedPng)
          localStorage.setItem('carrep_user_car_photo', processedPng)
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveUserPhoto = (e) => {
    e.stopPropagation()
    setUserPhoto(null)
    localStorage.removeItem('carrep_user_car_photo')
  }

  // ── 소모품 정비 이력 상태 (localStorage 유지) ──
  const [historyMap, setHistoryMap] = useState(() => {
    try {
      const saved = localStorage.getItem('carrep_maintenance_history')
      if (saved) return JSON.parse(saved)
      const oldOverrides = localStorage.getItem('carrep_maintenance_overrides')
      if (oldOverrides) {
        const parsed = JSON.parse(oldOverrides)
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
        localStorage.removeItem('carrep_maintenance_overrides')
        return migrated
      }
    } catch (e) {}
    return {}
  })

  // ── 소모품 모달 상태 ──
  const [isDiagModalOpen, setIsDiagModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedDiagItem, setSelectedDiagItem] = useState(null)
  const [selectedFilterType, setSelectedFilterType] = useState(null)

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

  // ── 차량 정보 계산 ──
  const carName = myCar?.model || vehicleInfo?.model || ''
  const carMaker = myCar?.maker || vehicleInfo?.maker || ''
  const carNickname = myCar?.nickname || ''
  const carPlate = myCar?.plate || ''
  const carDriveType = myCar?.driveType || vehicleInfo?.driveType || ''
  const carGrade = myCar?.grade || ''
  const carRegDate = myCar?.regDate || vehicleInfo?.regDate || ''
  const carFuelEconomy = myCar?.fuelEconomy || vehicleInfo?.fuelEconomy || ''
  const carTireSize = myCar?.tireSize || vehicleInfo?.tireSize || ''
  const carEngineDisp = myCar?.engineDisp || vehicleInfo?.engineDisp || ''
  const carFuelType = myCar?.fuelType || vehicleInfo?.fuelType || '경유'
  const carYear = myCar?.year || vehicleInfo?.year || ''
  const carMileage = myCar?.mileage || vehicleInfo?.mileage || ''

  // 차량 이미지
  const getImagePath = (path) => {
    const base = (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    const cleanBase = base.endsWith('/') ? base : `${base}/`
    return `${cleanBase}${cleanPath}`
  }
  const isMohave = carName?.toLowerCase()?.includes('모하비') || carName?.toLowerCase()?.includes('mohave')
  const carImageUrl = isMohave
    ? (myCar?.color === '티타늄실버' || !myCar?.color
      ? getImagePath('/mohave_titanium.png')
      : getImagePath('/mohave_exterior.png'))
    : null

  // ── 소모품 진단 계산 ──
  const maintenanceItems = getMaintenanceStatus(carMileage, carYear, historyMap)
  const dangerItems = maintenanceItems.filter(i => i.status === 'danger')
  const warningItems = maintenanceItems.filter(i => i.status === 'warning')
  const goodItems = maintenanceItems.filter(i => i.status === 'good')

  // ── 보험/검사 계산 ──
  const insEndDday = insurance?.endDate ? getDdayLabel(insurance.endDate) : null
  const insRem = insurance?.startDate && insurance?.endDate
    ? getInspRemaining(insurance.startDate, insurance.endDate)
    : insurance?.endDate
    ? getInspRemaining(new Date(new Date(insurance.endDate).setFullYear(new Date(insurance.endDate).getFullYear() - 1)).toISOString(), insurance.endDate)
    : null

  const inspRem = inspection?.startDate && inspection?.endDate
    ? getInspRemaining(inspection.startDate, inspection.endDate) : null


  // ── 정비 내역 정렬 ──
  const sortedReports = [...(reports || [])].sort((a, b) => {
    const da = (a.repairItems || []).map(i => i.repairDate).filter(Boolean).sort().reverse()[0] || a.createdAt
    const db2 = (b.repairItems || []).map(i => i.repairDate).filter(Boolean).sort().reverse()[0] || b.createdAt
    return new Date(db2) - new Date(da)
  })

  return (
    <div className={styles.dashboard}>

      {/* ── 상단 2컬럼: 내 차량 카드 + 상태 점검 카드 ── */}
      <div className={styles.topGrid}>

        {/* 카드 1: 내 차량 (첨부 이미지 레이아웃 100% 반영) */}
        <div className={`${styles.card} ${styles.heroProfileCard}`}>
          {/* 상단 1행: 좌측 닉네임 + ✏️ / 우측 기아 공식 엠블럼 로고 */}
          <div className={styles.profileCardTopRow}>
            <div className={styles.carNicknameRow}>
              <span className={styles.carNickname}>{carNickname || carName || '하비'}</span>
              <button className={styles.editIconBtn} onClick={onOpenMyCarModal} title="내차 정보 수정">✏️</button>
            </div>

            <div className={styles.brandLogoWrap}>
              <BrandLogo maker={carMaker || '기아'} />
            </div>
          </div>

          {/* 중단 2행: 번호판 (등록된 경우만 표시) */}
          <div className={styles.profileCardMidRow}>
            {carPlate ? (
              <div className={styles.realPlateBox}>
                <span className={styles.plateScrew} />
                <span className={styles.plateText}>{carPlate}</span>
                <span className={styles.plateScrew} />
              </div>
            ) : null}
          </div>

          {/* 하단 3행: 좌측 📷 사진넣기 (사용자 첨부 사진이 없을 때만 표시) / 우측 큼직한 차량 실사컷 */}
          <div className={styles.profileCardBottomRow}>
            <div className={styles.profileBottomLeft}>
              {!userPhoto ? (
                <button
                  type="button"
                  className={styles.addPhotoBtnInline}
                  onClick={() => fileInputRef.current?.click()}
                  title="차량 사진 업로드"
                >
                  <span className={styles.camIcon}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
                  <span className={styles.addPhotoLabel}>사진넣기</span>
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <button
                    type="button"
                    className={styles.changePhotoBtnInline}
                    onClick={() => fileInputRef.current?.click()}
                    title="새로운 차량 사진 선택 및 변경"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    사진 변경
                  </button>
                  <button
                    type="button"
                    className={styles.changePhotoBtnInline}
                    onClick={handleRemoveUserPhoto}
                    title="등록된 사용자 사진 삭제 및 초기화"
                    style={{ opacity: 0.7 }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    삭제
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handlePhotoUpload}
              />
            </div>

            <div className={styles.profileCarImageWrap}>
              <img
                src={userPhoto || carImageUrl || getImagePath('/mohave_exterior.png')}
                alt={carName || '차량 이미지'}
                className={styles.profileCarImage}
                onError={e => { e.target.src = getImagePath('/mohave_exterior.png') }}
              />
            </div>
          </div>
        </div>

        {/* 카드 2: 내 차 상태 점검 */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <div>
              <div className={styles.cardTitle}>{carName || '내 차 상태 점검'}</div>
              {(carDriveType || carGrade) && (
                <div className={styles.carSubtitle}>{[carDriveType, carGrade].filter(Boolean).join(' ')}</div>
              )}
            </div>
            <button className={styles.detailBtn} onClick={onOpenMyCarModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              상세보기 &gt;
            </button>
          </div>
          {carMileage && (
            <div className={styles.mileageText}>
              {Number(carMileage).toLocaleString()}km 주행기준
            </div>
          )}
          <div className={styles.statGrid}>
            <div className={`${styles.statItem} ${styles.statDanger}`}
              onClick={() => { setSelectedFilterType('danger'); setIsFilterModalOpen(true) }}
              style={{ cursor: 'pointer' }} title="교체 대상 항목 보기">
              <div className={styles.statLabel}>교체 대상</div>
              <div className={styles.statNum}>{dangerItems.length}</div>
            </div>
            <div className={`${styles.statItem} ${styles.statWarning}`}
              onClick={() => { setSelectedFilterType('warning'); setIsFilterModalOpen(true) }}
              style={{ cursor: 'pointer' }} title="점검 권장 항목 보기">
              <div className={styles.statLabel}>점검 권장</div>
              <div className={styles.statNum}>{warningItems.length}</div>
            </div>
            <div className={`${styles.statItem} ${styles.statGood}`}
              onClick={() => { setSelectedFilterType('good'); setIsFilterModalOpen(true) }}
              style={{ cursor: 'pointer' }} title="상태 양호 항목 보기">
              <div className={styles.statLabel}>상태 양호</div>
              <div className={styles.statNum}>{goodItems.length}</div>
            </div>
            <div className={`${styles.statItem} ${styles.statTotal}`}>
              <div className={styles.statLabel}>전체 점검</div>
              <div className={styles.statNum}>{maintenanceItems.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 중단 2x2 컬럼: 차량 스펙 + 소모품 정비 + 자동차 보험 + 검사/보증 ── */}
      <div className={styles.midGrid}>

        {/* 카드 3: 차량 스펙 */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <span className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'6px'}}>
                <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-4"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              차량 정보
            </span>
          </div>
          <div className={styles.specGrid}>
            <div className={styles.specCard}>
              <span className={styles.specCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </span>
              <div className={styles.specCardMeta}>
                <span className={styles.specCardLabel}>차량 등록일</span>
                <span className={styles.specCardVal}>{carRegDate || '-'}</span>
              </div>
            </div>
            <div className={styles.specCard}>
              <span className={styles.specCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 22V12a9 9 0 0 1 18 0v10"/><path d="M12 13v4"/><path d="M8 17h8"/>
                </svg>
              </span>
              <div className={styles.specCardMeta}>
                <span className={styles.specCardLabel}>공인연비</span>
                <span className={styles.specCardVal}>{carFuelEconomy || '-'}</span>
              </div>
            </div>
            <div className={styles.specCard}>
              <span className={styles.specCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                </svg>
              </span>
              <div className={styles.specCardMeta}>
                <span className={styles.specCardLabel}>타이어 사이즈</span>
                <span className={styles.specCardVal}>{carTireSize || '-'}</span>
              </div>
            </div>
            <div className={styles.specCard}>
              <span className={styles.specCardIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </span>
              <div className={styles.specCardMeta}>
                <span className={styles.specCardLabel}>배기량</span>
                <span className={styles.specCardVal}>{carEngineDisp || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 카드 4: 정비 소모품 수명 요약 (Top 3) */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <span className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'6px'}}>
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
              </svg>
              주요 정비 소모품
            </span>
            <button className={styles.detailBtn} onClick={() => { if (onGoConsumables) onGoConsumables(); else if (onNext) onNext(); }}>
              전체보기 &gt;
            </button>
          </div>

          {!(carYear || carMileage) ? (
            <button className={styles.registerPromptBtn} onClick={onOpenMyCarModal}>
              + 차량 주행거리 등록하기
            </button>
          ) : (
            <div className={styles.repairSummaryList}>
              {maintenanceItems.slice(0, 3).map((item, idx) => {
                const isDanger = item.status === 'danger'
                const isWarning = item.status === 'warning'
                const statusText = isDanger ? '교체' : isWarning ? '점검' : '양호'
                const badgeStyle = isDanger ? styles.badgeDanger : isWarning ? styles.badgeWarning : styles.badgeGood
                
                // 5단계 Segment 수치 인디케이터
                const totalBars = 5
                const activeBars = Math.max(0, Math.min(totalBars, Math.round((item.health / 100) * totalBars)))
                const barColor = isDanger ? '#ef4444' : isWarning ? '#f97316' : '#22c55e'

                return (
                  <div key={idx} className={styles.repairSummaryItem}>
                    <div className={styles.repairSummaryLeft}>
                      <span className={styles.repairSummaryName}>{item.name}</span>
                      <span className={`${styles.repairSummaryBadge} ${badgeStyle}`}>{statusText}</span>
                    </div>

                    <div className={styles.repairSummaryRight}>
                      {/* 첨부 이미지 스타일의 Segment Bar 인디케이터 */}
                      <div className={styles.segmentBarGroup}>
                        {Array.from({ length: totalBars }).map((_, bIdx) => (
                          <span
                            key={bIdx}
                            className={styles.segmentBarItem}
                            style={{
                              backgroundColor: bIdx < activeBars ? barColor : 'var(--border)',
                              opacity: bIdx < activeBars ? 1 : 0.25
                            }}
                          />
                        ))}
                      </div>
                      <span className={styles.repairSummaryHealth}>{item.health}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 카드 5: 자동차 보험 (의무/책임보험) */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <span className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'6px'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              자동차 보험
            </span>
            <button className={styles.detailBtn} onClick={onOpenInsuranceModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              상세보기 &gt;
            </button>
          </div>
          {insurance?.endDate ? (
            <>
              <div className={styles.insuranceRow}>
                <div className={styles.insuranceIcon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
                <div style={{ flex: 1 }}>
                  <div className={styles.insuranceName}>
                    {[insurance.insurer, insurance.product].filter(Boolean).join(' ')}
                    {new Date(insurance.endDate) < new Date() && <span className={styles.expiredTag}> (만료됨)</span>}
                  </div>
                  <div className={styles.insuranceDate}>
                    {insurance.startDate ? `${fmtDate(insurance.startDate)} ~ ` : ''}{fmtDate(insurance.endDate)}
                  </div>
                  {insRem && (
                    <>
                      <div className={styles.inspProgressBar}>
                        <div className={styles.inspProgressFill} style={{
                          width: `${insRem.pct}%`,
                          background: insRem.rem <= 30 ? 'var(--accent-red)' : insRem.rem <= 90 ? 'var(--accent-orange)' : 'var(--accent-green)'
                        }} />
                      </div>
                      <div className={styles.inspRemLabel}
                        style={{ color: insRem.expired ? 'var(--accent-red)' : insRem.rem <= 30 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                        {insRem.label}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <button className={styles.registerPromptBtn} onClick={onOpenInsuranceModal}>
              + 보험 정보 등록하기
            </button>
          )}
        </div>

        {/* 카드 6: 정기검사/운행 보험 보증 */}
        <div className={styles.card}>
          <div className={styles.cardTitleRow}>
            <span className={styles.cardTitle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'6px'}}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              운행 보증 보험 (정기검사)
            </span>
            <button className={styles.detailBtn} onClick={onOpenInspectionModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{verticalAlign:'middle',marginRight:'4px'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              상세보기 &gt;
            </button>
          </div>
          {inspection?.startDate ? (
            <>
              <div className={styles.insuranceRow}>
                <div className={styles.inspIcon}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="m9 12 2 2 4-4"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div className={styles.insuranceName}>자동차 정기 검사 보증</div>
                  <div className={styles.insuranceDate}>
                    {fmtDate(inspection.startDate)} ~ {fmtDate(inspection.endDate)}
                  </div>
                  {inspRem && (
                    <>
                      <div className={styles.inspProgressBar}>
                        <div className={styles.inspProgressFill} style={{
                          width: `${inspRem.pct}%`,
                          background: inspRem.rem <= 30 ? 'var(--accent-red)' : inspRem.rem <= 90 ? 'var(--accent-orange)' : 'var(--accent-green)'
                        }} />
                      </div>
                      <div className={styles.inspRemLabel}
                        style={{ color: inspRem.expired ? 'var(--accent-red)' : inspRem.rem <= 30 ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>
                        {inspRem.label}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <button className={styles.registerPromptBtn} onClick={onOpenInspectionModal}>
              + 검사 보증 기간 등록하기
            </button>
          )}
        </div>
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
      {isFilterModalOpen && (
        <DiagnosticFilterModal
          isOpen={isFilterModalOpen}
          filterType={selectedFilterType}
          items={maintenanceItems}
          onClose={() => setIsFilterModalOpen(false)}
          onRegisterClick={(itemName) => {
            setIsFilterModalOpen(false)
            if (onNext) onNext(itemName)
          }}
          onRegister={(itemName) => {
            setIsFilterModalOpen(false)
            if (onNext) onNext(itemName)
          }}
        />
      )}
    </div>
  )
}
