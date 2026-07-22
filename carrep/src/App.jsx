import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Dashboard from './pages/Dashboard'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'
import RepairListPage from './pages/RepairListPage'
import FuelPage from './pages/FuelPage'
import AuthPage from './pages/AuthPage'
import GitHubModal from './components/GitHubModal'
import MyCarModal from './components/MyCarModal'
import InsuranceModal from './components/InsuranceModal'
import InspectionModal from './components/InspectionModal'
import BottomNav from './components/BottomNav'
import { getGithubJson, saveGithubJson, validateGithubToken } from './utils/githubDb'

const API_BASE = 'http://localhost:5500'

// 회원 아이디(이메일 ID)를 포함한 회원별 데이터 경로 생성 함수
const getUserIdKey = (user) => {
  if (!user || !user.email) return 'default'
  return user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_')
}

const getReportsPath = (user) => `carrep/public/data/reports_${getUserIdKey(user)}.json`
const getMyCarPath = (user) => `carrep/public/data/mycar_${getUserIdKey(user)}.json`

export default function App() {
  const [step, setStep] = useState(1)

  // Current logged in user state
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carrep_current_user')
      return saved ? JSON.parse(saved) : null
    } catch (e) { return null }
  })

  // 비로그인 상태일 때는 데이터 미표시 (초기 빈값)
  const [vehicleInfo, setVehicleInfo] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) {
      return { maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '', driveType: '', fuelType: '', regDate: '', fuelEconomy: '', tireSize: '', engineDisp: '' }
    }
    try {
      const userIdKey = getUserIdKey(user)
      const cached = localStorage.getItem(`carrep_mycar_${userIdKey}`) || localStorage.getItem('carrep_cached_mycar')
      if (cached) {
        const car = JSON.parse(cached)
        return {
          maker: car.maker || '',
          model: car.model || '',
          year: car.year || '',
          mileage: car.mileage || '',
          repairDate: '',
          shopName: '',
          color: car.color || '',
          driveType: car.driveType || '2WD',
          fuelType: car.fuelType || '경유',
          regDate: car.regDate || '2008.11.20',
          fuelEconomy: car.fuelEconomy || '9.4 km/L',
          tireSize: car.tireSize || '265/60R18',
          engineDisp: car.engineDisp || '2,959 cc'
        }
      }
    } catch (e) {}
    return { maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '', driveType: '2WD', fuelType: '경유', regDate: '2008.11.20', fuelEconomy: '9.4 km/L', tireSize: '265/60R18', engineDisp: '2,959 cc' }
  })
  const [repairItems, setRepairItems] = useState([])
  const [attachedImages, setAttachedImages] = useState([])
  const [reports, setReports] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) return []
    try {
      const userIdKey = getUserIdKey(user)
      const cached = localStorage.getItem(`carrep_reports_${userIdKey}`) || localStorage.getItem('carrep_cached_reports')
      return cached ? JSON.parse(cached) : []
    } catch (e) { return [] }
  })
  const [savedReportId, setSavedReportId] = useState(null)
  const [myCar, setMyCar] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) return null
    try {
      const userIdKey = getUserIdKey(user)
      const cached = localStorage.getItem(`carrep_mycar_${userIdKey}`) || localStorage.getItem('carrep_cached_mycar')
      return cached ? JSON.parse(cached) : null
    } catch (e) { return null }
  })
  
  // GitHub integration & modal states
  const [githubToken, setGithubToken] = useState(localStorage.getItem('carrep_github_token') || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isMyCarModalOpen, setIsMyCarModalOpen] = useState(false)
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false)
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false)

  // Insurance & Inspection state (비로그인 시 데이터 미표시)
  const [insurance, setInsurance] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) return null
    try {
      const userIdKey = getUserIdKey(user)
      return JSON.parse(localStorage.getItem(`carrep_insurance_${userIdKey}`) || 'null')
    } catch { return null }
  })
  const [inspection, setInspection] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) return null
    try {
      const userIdKey = getUserIdKey(user)
      return JSON.parse(localStorage.getItem(`carrep_inspection_${userIdKey}`) || 'null')
    } catch { return null }
  })

  // Fuel History state (비로그인 시 빈 배열)
  const [fuelHistory, setFuelHistory] = useState(() => {
    const user = JSON.parse(localStorage.getItem('carrep_current_user') || 'null')
    if (!user) return []
    try {
      const userIdKey = getUserIdKey(user)
      const cached = localStorage.getItem(`carrep_fuel_history_${userIdKey}`) || localStorage.getItem('carrep_fuel_history')
      return cached ? JSON.parse(cached) : []
    } catch (e) { return [] }
  })

  // Fuel modal state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false)

  // RepairListPage active tab state ('list' | 'consumables')
  const [repairListTab, setRepairListTab] = useState('list')

  const handleGoToConsumablesTab = () => {
    setRepairListTab('consumables')
    setStep(4)
  }

  const handleGoToRepairListStep = () => {
    setRepairListTab('list')
    setStep(4)
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
    localStorage.setItem('carrep_current_user', JSON.stringify(user))

    const userIdKey = getUserIdKey(user)
    const userMyCarKey = `carrep_mycar_${userIdKey}`
    const userReportsKey = `carrep_reports_${userIdKey}`
    const userInsuranceKey = `carrep_insurance_${userIdKey}`
    const userInspectionKey = `carrep_inspection_${userIdKey}`

    // 1. 사용자 차량 정보 연동 (기존 등록 원본 모하비 데이터 기반)
    const originalMohaveCar = {
      maker: '기아',
      model: '모하비',
      year: 2009,
      mileage: 177000,
      color: '티타늄실버',
      nickname: '하비',
      plate: '43누5894',
      grade: 'KV300 최고급형',
      driveType: '2WD',
      fuelType: '경유',
      regDate: '2008.11.20',
      fuelEconomy: '9.4 km/L',
      tireSize: '265/60R18',
      engineDisp: '2,959 cc'
    }

    if (user && user.car) {
      const carData = {
        maker: user.car.maker || originalMohaveCar.maker,
        model: user.car.model || originalMohaveCar.model,
        year: user.car.year || originalMohaveCar.year,
        mileage: user.car.mileage || originalMohaveCar.mileage,
        color: user.car.color || originalMohaveCar.color,
        nickname: user.car.nickname || originalMohaveCar.nickname,
        plate: user.car.plate || originalMohaveCar.plate,
        grade: user.car.grade || originalMohaveCar.grade,
        driveType: user.car.driveType || originalMohaveCar.driveType,
        fuelType: user.car.fuelType || originalMohaveCar.fuelType,
        regDate: user.car.regDate || originalMohaveCar.regDate,
        fuelEconomy: user.car.fuelEconomy || originalMohaveCar.fuelEconomy,
        tireSize: user.car.tireSize || originalMohaveCar.tireSize,
        engineDisp: user.car.engineDisp || originalMohaveCar.engineDisp
      }

      setMyCar(carData)
      setVehicleInfo(prev => ({ ...prev, ...carData }))
      localStorage.setItem(userMyCarKey, JSON.stringify(carData))
      localStorage.setItem('carrep_cached_mycar', JSON.stringify(carData))
    }

    // 3. 사용자 개별 보험 및 자동차 검사 정보 로드 (기존 등록 원본 데이터 자동 이관 지원)
    const defaultInsuranceData = {
      insurer: 'KB손해보험',
      product: '커넥티드카 승용 자동차보험',
      startDate: '2025-11-20',
      endDate: '2026-11-20',
      memo: '긴급출동 6회 포함'
    }
    const defaultInspectionData = {
      startDate: '2024-11-20',
      endDate: '2026-11-20',
      memo: '한국교통안전공단 정기검사 완료'
    }

    try {
      const ins = localStorage.getItem(userInsuranceKey) || localStorage.getItem('carrep_insurance')
      if (ins) {
        const parsedIns = JSON.parse(ins)
        setInsurance(parsedIns)
        localStorage.setItem(userInsuranceKey, JSON.stringify(parsedIns))
      } else {
        setInsurance(defaultInsuranceData)
        localStorage.setItem(userInsuranceKey, JSON.stringify(defaultInsuranceData))
      }
    } catch {
      setInsurance(defaultInsuranceData)
    }

    try {
      const insp = localStorage.getItem(userInspectionKey) || localStorage.getItem('carrep_inspection')
      if (insp) {
        const parsedInsp = JSON.parse(insp)
        setInspection(parsedInsp)
        localStorage.setItem(userInspectionKey, JSON.stringify(parsedInsp))
      } else {
        setInspection(defaultInspectionData)
        localStorage.setItem(userInspectionKey, JSON.stringify(defaultInspectionData))
      }
    } catch {
      setInspection(defaultInspectionData)
    }

    // 로그인 직후 데이터 즉시 로드 (uzenkaze 전용 JSON 및 정비내역 동적 조율)
    loadData().then(() => {
      showToast(`✨ ${user.name || user.email.split('@')[0]}님, 성공적으로 로그인 되었습니다!`, 'success', 4000)
    })
    setStep(1)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('carrep_current_user')
    setMyCar(null)
    setVehicleInfo({ maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '', driveType: '', fuelType: '', regDate: '', fuelEconomy: '', tireSize: '', engineDisp: '' })
    setReports([])
    setRepairItems([])
    setInsurance(null)
    setInspection(null)
    showToast('로그아웃 되었습니다.', 'info', 3000)
    setStep(1)
  }

  const handleSaveFuel = (newItem) => {
    const exists = fuelHistory.some(f => f.id === newItem.id)
    let updated
    if (exists) {
      updated = fuelHistory.map(f => f.id === newItem.id ? newItem : f)
    } else {
      updated = [newItem, ...fuelHistory]
    }
    setFuelHistory(updated)
    localStorage.setItem('carrep_fuel_history', JSON.stringify(updated))
    showToast('주유 정보가 저장되었습니다.', 'success')
  }

  const handleDeleteFuel = (fuelId) => {
    const updated = fuelHistory.filter(f => f.id !== fuelId)
    setFuelHistory(updated)
    localStorage.setItem('carrep_fuel_history', JSON.stringify(updated))
    showToast('주유 기록이 삭제되었습니다.', 'info')
  }

  // Connection status: 'local' | 'cloud' | 'remote' | 'offline'
  const [dbStatus, setDbStatus] = useState('offline')
  const [toast, setToast] = useState({ show: false, message: '', type: 'warning', icon: null })

  const showToast = (message, type = 'warning', duration = 5000, icon = null) => {
    setToast({ show: true, message, type, icon })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, duration)
  }

  // Hybrid Fast Parallel Data Loading Chain
  const loadData = async () => {
    const savedUser = localStorage.getItem('carrep_current_user')
    const activeUser = currentUser || (savedUser ? JSON.parse(savedUser) : null)

    // [보안 및 격리] 로그인하지 않은 게스트의 경우 타인의 데이터를 절대로 로드하지 않고 완전 빈 데이터 보장
    if (!activeUser) {
      setReports([])
      setMyCar(null)
      setVehicleInfo({ maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '', driveType: '', fuelType: '', regDate: '', fuelEconomy: '', tireSize: '', engineDisp: '' })
      setInsurance(null)
      setInspection(null)
      setFuelHistory([])
      setDbStatus('offline')
      return null
    }

    const tokenVal = githubToken || localStorage.getItem('carrep_github_token')
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

    // 1. Try loading from Live Local API Server ONLY if on localhost (Avoid 5s timeout on web)
    if (isLocalhost) {
      try {
        const reportsRes = await fetch(`${API_BASE}/api/carrep/reports`)
        if (reportsRes.ok) {
          const reportsData = await reportsRes.json()
          setReports(reportsData)
          localStorage.setItem('carrep_cached_reports', JSON.stringify(reportsData))
          
          let loadedMyCar = null
          const myCarRes = await fetch(`${API_BASE}/api/carrep/mycar`)
          if (myCarRes.ok) {
            loadedMyCar = await myCarRes.json()
            setMyCar(loadedMyCar)
            if (loadedMyCar) localStorage.setItem('carrep_cached_mycar', JSON.stringify(loadedMyCar))
          }
          setDbStatus('local')
          console.log('[CarRep] Loaded data from local backend server JSON.')
          return loadedMyCar
        }
      } catch (e) {
        console.warn('[CarRep] Local API server not reachable.')
      }
    }

    // 2. Direct GitHub Contents API Mode (Parallel fetch with Promise.all for speed)
    if (tokenVal) {
      try {
        const [reportsRes, myCarRes] = await Promise.all([
          getGithubJson(REPORTS_PATH, tokenVal).catch(() => null),
          getGithubJson(MYCAR_PATH, tokenVal).catch(() => null)
        ])

        const reportsContent = reportsRes ? (reportsRes.content || []) : []
        const loadedMyCar = myCarRes ? (myCarRes.content || null) : null

        setReports(reportsContent)
        localStorage.setItem('carrep_cached_reports', JSON.stringify(reportsContent))

        if (loadedMyCar) {
          setMyCar(loadedMyCar)
          localStorage.setItem('carrep_cached_mycar', JSON.stringify(loadedMyCar))
        }

        setDbStatus('cloud')
        console.log('[CarRep] GitHub Cloud DB connection established (Parallel API Mode).')
        return loadedMyCar
      } catch (e) {
        console.warn('[CarRep] GitHub API read error, falling back to static Pages...', e)
      }
    }

    // 3. GitHub Pages Deployed Static JSON Mode (Parallel fetch)
    try {
      const basePath = window.location.pathname.includes('/vibe') ? '/vibe/carrep' : '/carrep'
      const activeUser = currentUser || (savedUser ? JSON.parse(savedUser) : null)
      const userIdKey = getUserIdKey(activeUser)

      // 로그인한 사용자별 전용 JSON 파일(예: reports_uzenkaze.json, mycar_uzenkaze.json) 우선 동적 페치
      const userReportsUrl = `${basePath}/data/reports_${userIdKey}.json?t=${Date.now()}`
      const userMyCarUrl = `${basePath}/data/mycar_${userIdKey}.json?t=${Date.now()}`
      const defaultReportsUrl = `${basePath}/data/reports.json?t=${Date.now()}`
      const defaultMyCarUrl = `${basePath}/data/mycar.json?t=${Date.now()}`

      const [userReportsRes, userMyCarRes] = await Promise.all([
        fetch(userReportsUrl).catch(() => null),
        fetch(userMyCarUrl).catch(() => null)
      ])

      let reportsRes = (userReportsRes && userReportsRes.ok) ? userReportsRes : await fetch(defaultReportsUrl).catch(() => null)
      let myCarRes = (userMyCarRes && userMyCarRes.ok) ? userMyCarRes : await fetch(defaultMyCarUrl).catch(() => null)

      let reportsData = []
      let loadedMyCar = null

      if (reportsRes && reportsRes.ok) {
        reportsData = await reportsRes.json()

        // Merge user modified cached reports from localStorage if available
        const userReportsKey = `carrep_reports_${userIdKey}`
        const cachedStr = localStorage.getItem(userReportsKey) || localStorage.getItem('carrep_cached_reports')
        if (cachedStr) {
          try {
            const cachedReports = JSON.parse(cachedStr)
            if (Array.isArray(cachedReports) && cachedReports.length > 0) {
              const reportMap = new Map()
              reportsData.forEach(r => reportMap.set(String(r.id), r))
              cachedReports.forEach(r => reportMap.set(String(r.id), r))
              reportsData = Array.from(reportMap.values())
            }
          } catch (e) {}
        }

        setReports(reportsData)
        localStorage.setItem(`carrep_reports_${userIdKey}`, JSON.stringify(reportsData))
        localStorage.setItem('carrep_cached_reports', JSON.stringify(reportsData))
      }

      if (myCarRes && myCarRes.ok) {
        loadedMyCar = await myCarRes.json()
        setMyCar(loadedMyCar)
        if (loadedMyCar) {
          localStorage.setItem(`carrep_mycar_${userIdKey}`, JSON.stringify(loadedMyCar))
          localStorage.setItem('carrep_cached_mycar', JSON.stringify(loadedMyCar))
        }
      }

      if (reportsRes?.ok || myCarRes?.ok) {
        setDbStatus('remote')
        return loadedMyCar
      }
    } catch (e) {
      console.warn('[CarRep] Static JSON database fetch error.')
    }

    setDbStatus('offline')
    const tempMyCar = localStorage.getItem('carrep_temp_mycar') || localStorage.getItem('carrep_cached_mycar')
    const loadedTempMyCar = tempMyCar ? JSON.parse(tempMyCar) : null
    setMyCar(loadedTempMyCar)
    return loadedTempMyCar
  }

  useEffect(() => {
    loadData().then(carData => {
      if (githubToken && (!carData || !carData.maker)) {
        showToast('🚗 GitHub에 연결되었으나 등록된 내 차량 정보가 없습니다. 차량을 먼저 등록하세요.', 'warning', 6000)
      }
    })
  }, [githubToken])

  // GitHub 연결 또는 데이터 로드 완료 시 등록된 내 차량 정보가 있으면 자동으로 차량 정보에 반영
  useEffect(() => {
    if (myCar) {
      setVehicleInfo(prev => ({
        ...prev,
        maker: myCar.maker || '',
        model: myCar.model || '',
        year: myCar.year || '',
        mileage: myCar.mileage || '',
        color: myCar.color || ''
      }))
    }
  }, [myCar])

  const goNext = () => setStep(s => Math.min(s + 1, 3))
  const goPrev = () => setStep(s => Math.max(s - 1, 1))
  const goToStep = (n) => setStep(n)

  const handleReset = () => {
    setVehicleInfo({ maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '' })
    setRepairItems([])
    setAttachedImages([])
    setSavedReportId(null)
    setStep(1)
  }

  const handleLogoClick = () => {
    setStep(1)
    setRepairItems([])
    setAttachedImages([])
    setSavedReportId(null)

    // 비로그인 상태인 경우 개인 데이터(차량 번호, 스펙 등) 절대 복구하지 않음
    if (!currentUser) {
      setMyCar(null)
      setVehicleInfo({ maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '', color: '', driveType: '', fuelType: '', regDate: '', fuelEconomy: '', tireSize: '', engineDisp: '' })
      return
    }

    // 로그인된 사용자만 본인 데이터에 안전하게 바인딩
    const userIdKey = getUserIdKey(currentUser)
    const userMyCarStr = localStorage.getItem(`carrep_mycar_${userIdKey}`)
    let activeCar = myCar
    if (!activeCar && userMyCarStr) {
      try {
        activeCar = JSON.parse(userMyCarStr)
        setMyCar(activeCar)
      } catch (e) {}
    }

    if (activeCar && activeCar.maker) {
      setVehicleInfo({
        maker: activeCar.maker || '',
        model: activeCar.model || '',
        year: activeCar.year || '',
        mileage: activeCar.mileage || '',
        repairDate: '',
        shopName: '',
        color: activeCar.color || '',
        driveType: activeCar.driveType || '',
        fuelType: activeCar.fuelType || '',
        regDate: activeCar.regDate || '',
        fuelEconomy: activeCar.fuelEconomy || '',
        tireSize: activeCar.tireSize || '',
        engineDisp: activeCar.engineDisp || ''
      })
    }
  }

  const handleSelectReport = (report) => {
    setVehicleInfo(report.vehicleInfo)
    setRepairItems(report.repairItems)
    setAttachedImages(report.attachedImages || [])
    setSavedReportId(report.id)
    setStep(3)
  }

  const handleSelectReportFromList = (report) => {
    setVehicleInfo(report.vehicleInfo)
    setRepairItems(report.repairItems)
    setAttachedImages(report.attachedImages || [])
    setSavedReportId(report.id)
    setStep(3)
  }

  const handleEditReport = (report) => {
    setVehicleInfo(report.vehicleInfo)
    setRepairItems(report.repairItems)
    setAttachedImages(report.attachedImages || [])
    setSavedReportId(report.id)
    setStep(2)
    showToast('✏️ 선택한 정비 내역을 수정 모드로 불러왔습니다.', 'info', 3000)
  }

  // Handle Token registration and save to localStorage (with validation check)
  const handleSaveToken = async (token) => {
    if (token) {
      const isValid = await validateGithubToken(token)
      if (!isValid) {
        alert('⚠️ 입력하신 GitHub 토큰이 유효하지 않거나 만료되었습니다.\n권한 범위(Scopes) 중 [repo]가 체크되었는지 다시 한 번 확인해 주세요.')
        return
      }
      localStorage.setItem('carrep_github_token', token)
      setGithubToken(token)
      setIsModalOpen(false)
      const carData = await loadData(token)
      if (!carData || !carData.maker) {
        showToast('🚗 GitHub에 연결되었으나 등록된 내 차량 정보가 없습니다. 차량을 먼저 등록하세요.', 'warning', 6000)
      } else {
        showToast('✨ GitHub 연결 및 내 차량 정보 조회가 완료되었습니다!', 'success', 4000)
      }
    } else {
      localStorage.removeItem('carrep_github_token')
      setGithubToken('')
      setIsModalOpen(false)
      showToast('GitHub 연결이 해제되었습니다.', 'info', 3000)
      loadData('')
    }
  }

  const handleDeleteReport = async (id, e) => {
    if (e) e.stopPropagation()

    if (!window.confirm('이 보고서를 영구 삭제하시겠습니까?')) return

    const targetIdStr = String(id)
    const updatedReports = reports.filter(r => String(r.id) !== targetIdStr)

    setReports(updatedReports)
    localStorage.setItem('carrep_cached_reports', JSON.stringify(updatedReports))
    if (String(savedReportId) === targetIdStr) handleReset()

    // Scenario A: Local backend server is active
    if (dbStatus === 'local') {
      try {
        await fetch(`${API_BASE}/api/carrep/reports/${id}`, { method: 'DELETE' })
      } catch (err) {
        console.error('Delete via server failed', err)
      }
    }

    // Scenario B: Client-side direct GitHub Cloud DB commit
    if (githubToken) {
      try {
        await saveGithubJson(
          getReportsPath(currentUser),
          updatedReports,
          githubToken,
          `chore(data): delete repair report ${id}`
        )
      } catch (err) {
        console.error('Delete via GitHub API failed', err)
      }
    }

    showToast('🗑️ 정비 내역 보고서가 정상 삭제되었습니다.', 'info', 3000)
  }

  const handleSaveReport = async (itemsToSave) => {
    const activeRepairItems = itemsToSave && Array.isArray(itemsToSave) ? itemsToSave : repairItems
    if (itemsToSave && Array.isArray(itemsToSave)) {
      setRepairItems(itemsToSave)
    }

    const primaryItemDate = (activeRepairItems || []).find(it => it.repairDate)?.repairDate || vehicleInfo.repairDate
    const syncedVehicleInfo = primaryItemDate ? { ...vehicleInfo, repairDate: primaryItemDate } : vehicleInfo
    if (primaryItemDate && primaryItemDate !== vehicleInfo.repairDate) {
      setVehicleInfo(syncedVehicleInfo)
    }

    const newReport = {
      id: savedReportId || Date.now(),
      createdAt: new Date().toISOString(),
      vehicleInfo: syncedVehicleInfo,
      repairItems: activeRepairItems,
      attachedImages
    }

    const targetIdStr = String(newReport.id)
    const exists = reports.some(r => String(r.id) === targetIdStr)

    let updatedReports = []
    if (exists) {
      updatedReports = reports.map(r => String(r.id) === targetIdStr ? newReport : r)
    } else {
      updatedReports = [newReport, ...reports]
    }

    // Always update React state and LocalStorage cache immediately!
    setReports(updatedReports)
    localStorage.setItem('carrep_cached_reports', JSON.stringify(updatedReports))
    setSavedReportId(newReport.id)

    // Scenario A: Local backend server is active
    if (dbStatus === 'local') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        })
        if (res.ok) {
          showToast('✨ 정비내역 보고서가 성공적으로 저장되었습니다!', 'success', 4000)
          setStep(3)
          return
        }
      } catch (err) {
        console.error('Save via server failed', err)
      }
    }

    // Scenario B: Client-side direct GitHub Cloud DB commit
    if (githubToken) {
      try {
        await saveGithubJson(
          getReportsPath(currentUser),
          updatedReports,
          githubToken,
          savedReportId ? `chore(data): update repair report ${newReport.id}` : `chore(data): create repair report ${newReport.id}`
        )
        showToast('✨ 정비내역 보고서가 GitHub 및 저장소에 성공적으로 저장되었습니다!', 'success', 4000)
        setStep(3)
        return
      } catch (err) {
        console.error('Save via GitHub API failed', err)
        showToast(`⚠️ GitHub 저장소 저장 오류: ${err.message} (로컬 캐시에 저장됨)`, 'warning', 5000)
        setStep(3)
        return
      }
    }

    // Scenario C: Web / Offline Mode (LocalStorage saved successfully!)
    showToast('✨ 정비내역 보고서가 성공적으로 저장되었습니다!', 'success', 4000)
    setStep(3)
  }

  const handleSaveMyCar = async (carInfo) => {
    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage,
      color: carInfo.color || '',
      nickname: carInfo.nickname || '',
      plate: carInfo.plate || '',
      grade: carInfo.grade || '',
      driveType: carInfo.driveType || '2WD',
      fuelType: carInfo.fuelType || '경유',
      regDate: carInfo.regDate || '',
      fuelEconomy: carInfo.fuelEconomy || '',
      tireSize: carInfo.tireSize || '',
      engineDisp: carInfo.engineDisp || ''
    }

    // 차량 정보를 메인 대시보드(히어로 배너 포함)에 즉시 자동 적용 및 캐시 저장
    localStorage.setItem('carrep_cached_mycar', JSON.stringify(myCarData))
    setVehicleInfo(prev => ({
      ...prev,
      maker: myCarData.maker,
      model: myCarData.model,
      year: myCarData.year,
      mileage: myCarData.mileage,
      color: myCarData.color
    }))

    // Scenario A: Local backend server is active
    if (dbStatus === 'local') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/mycar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(myCarData)
        })
        if (res.ok) {
          setMyCar(myCarData)
          showToast('내차 정보가 서버에 정상적으로 저장되었습니다.', 'success', 4000, 'local-server')
          return
        }
      } catch (err) {
        console.error('Save My Car via server failed', err)
      }
    }

    // Scenario B: Client-side direct GitHub Cloud DB commit
    if (githubToken) {
      try {
        await saveGithubJson(
          getMyCarPath(currentUser),
          myCarData,
          githubToken,
          'chore(data): update MyCar profile'
        )
        setMyCar(myCarData)
        showToast('내차 정보가 서버에 정상적으로 저장되었습니다.', 'success', 4000, 'git')
        return
      } catch (err) {
        console.error('Save My Car via GitHub API failed', err)
        showToast(`내차 정보 저장 실패: ${err.message}`, 'warning', 5000)
        return
      }
    }

    // 임시 로컬 환경일 경우 임시 브라우저 세션에 저장
    setMyCar(myCarData)
    localStorage.setItem('carrep_temp_mycar', JSON.stringify(myCarData))
    showToast('내차 정보가 저장되었습니다.', 'success', 4000, 'local-server')
  }

  const handleSaveInsurance = (data) => {
    setInsurance(data)
    if (currentUser) {
      const userIdKey = getUserIdKey(currentUser)
      localStorage.setItem(`carrep_insurance_${userIdKey}`, JSON.stringify(data))
    }
    localStorage.setItem('carrep_insurance', JSON.stringify(data))
    showToast('🛡️ 보험 정보가 저장되었습니다!', 'success', 3000)
  }

  const handleSaveInspection = (data) => {
    setInspection(data)
    if (currentUser) {
      const userIdKey = getUserIdKey(currentUser)
      localStorage.setItem(`carrep_inspection_${userIdKey}`, JSON.stringify(data))
    }
    localStorage.setItem('carrep_inspection', JSON.stringify(data))
    showToast('🔍 자동차 검사 기간이 저장되었습니다!', 'success', 3000)
  }

  const [presetItemName, setPresetItemName] = useState('')

  const handleGoToRepairStep = (itemName = '') => {
    setPresetItemName(typeof itemName === 'string' ? itemName : '')
    setStep(2)
  }

  return (
    <AppLayout
      step={step}
      goToStep={(n) => setStep(n)}
      dbStatus={dbStatus}
      githubToken={githubToken}
      currentUser={currentUser}
      onGoAuth={() => setStep(6)}
      onOpenSetting={() => setIsModalOpen(true)}
      onOpenMyCar={() => setIsMyCarModalOpen(true)}
      onLogoClick={handleLogoClick}
    >
      {step === 1 && (
        <Dashboard
          currentUser={currentUser}
          myCar={myCar}
          vehicleInfo={vehicleInfo}
          dbStatus={dbStatus}
          reports={reports}
          insurance={insurance}
          inspection={inspection}
          onOpenMyCarModal={() => setIsMyCarModalOpen(true)}
          onOpenInsuranceModal={() => setIsInsuranceModalOpen(true)}
          onOpenInspectionModal={() => setIsInspectionModalOpen(true)}
          onNext={handleGoToRepairStep}
          onGoConsumables={handleGoToConsumablesTab}
          onSelectReport={handleSelectReport}
          onEditReport={handleEditReport}
          onDeleteReport={handleDeleteReport}
          repairItems={repairItems}
          setRepairItems={setRepairItems}
        />
      )}
      {step === 4 && (
        <RepairListPage
          reports={reports}
          myCar={myCar}
          vehicleInfo={vehicleInfo}
          initialTab={repairListTab}
          onSelectReport={handleSelectReportFromList}
          onDeleteReport={handleDeleteReport}
          onGoRepair={() => setStep(2)}
          onNext={handleGoToRepairStep}
          repairItems={repairItems}
          setRepairItems={setRepairItems}
        />
      )}
      {step === 2 && (
        <Step2Repairs
          repairItems={repairItems}
          setRepairItems={setRepairItems}
          attachedImages={attachedImages}
          setAttachedImages={setAttachedImages}
          onNext={goNext}
          onPrev={goPrev}
          onSave={handleSaveReport}
          isSaved={!!savedReportId}
          presetItemName={presetItemName}
        />
      )}
      {step === 3 && (
        <Step3Report
          vehicleInfo={vehicleInfo}
          repairItems={repairItems}
          attachedImages={attachedImages}
          onPrev={goPrev}
          onReset={handleReset}
          onSave={handleSaveReport}
          isSaved={!!savedReportId}
        />
      )}

      {step === 5 && (
        <FuelPage
          fuelHistory={fuelHistory}
          onSaveFuel={handleSaveFuel}
          onDeleteFuel={handleDeleteFuel}
        />
      )}

      {step === 6 && (
        <AuthPage
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onGoHome={() => setStep(1)}
        />
      )}

      {/* GitHub Token Config Layer Modal */}
      <GitHubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveToken}
        currentToken={githubToken}
      />

      {/* My Car Management Layer Modal */}
      <MyCarModal
        isOpen={isMyCarModalOpen}
        onClose={() => setIsMyCarModalOpen(false)}
        onSave={handleSaveMyCar}
        currentMyCar={myCar}
      />

      {/* Insurance Modal */}
      <InsuranceModal
        isOpen={isInsuranceModalOpen}
        onClose={() => setIsInsuranceModalOpen(false)}
        onSave={handleSaveInsurance}
        current={insurance}
      />

      {/* Inspection Modal */}
      <InspectionModal
        isOpen={isInspectionModalOpen}
        onClose={() => setIsInspectionModalOpen(false)}
        onSave={handleSaveInspection}
        current={inspection}
      />

      {/* Bottom Floating Navigation Bar */}
      <BottomNav
        activeStep={step}
        onGoHome={() => setStep(1)}
        onGoRepair={() => setStep(2)}
        onGoRepairList={handleGoToRepairListStep}
        onGoFuel={() => setStep(5)}
        reportCount={reports.length}
      />

      {/* Toast Notification Popup Banner */}
      {toast.show && (
        <div
          className={`toastContainer toast${toast.type === 'warning' ? 'Warning' : toast.type === 'success' ? 'Success' : 'Info'}`}
          onClick={() => {
            if (toast.type === 'warning' && toast.message.includes('내 차량 정보가 없습니다')) {
              setIsMyCarModalOpen(true)
            }
          }}
          title={toast.type === 'warning' ? "클릭하여 내 차량 정보 등록하기" : ""}
        >
          <span className="toastIcon" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {toast.icon === 'git' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle' }}>
                <path d="M21.5 10.5l-8-8c-.6-.6-1.5-.6-2.1 0l-1.9 1.9 2.5 2.5c.6-.2 1.3 0 1.8.5.5.5.7 1.2.5 1.8l2.4 2.4c.6-.2 1.3 0 1.8.5.7.7.7 1.8 0 2.5s-1.8.7-2.5 0c-.5-.5-.7-1.2-.5-1.8l-2.2-2.2v5.7c.2.1.4.3.5.5.7.7.7 1.8 0 2.5s-1.8.7-2.5 0c-.7-.7-.7-1.8 0-2.5.2-.2.4-.4.7-.5v-5.7c-.3-.1-.5-.3-.7-.5-.5-.5-.7-1.2-.5-1.8l-2.4-2.4c-.6.2-1.3 0-1.8-.5-.7-.7-.7-1.8 0-2.5.7-.7 1.8-.7 2.5 0 .5.5.7 1.2.5 1.8l2.2 2.2V6.3l-2.5-2.5L2.5 10.5c-.6.6-.6 1.5 0 2.1l8 8c.6.6 1.5.6 2.1 0l8.9-8.9c.6-.6.6-1.6 0-2.2z"/>
              </svg>
            ) : toast.icon === 'local-server' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: 'middle' }}>
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
            ) : (
              toast.type === 'warning' ? '⚠️' : toast.type === 'success' ? '✨' : 'ℹ️'
            )}
          </span>
          <span className="toastMessage">{toast.message}</span>
          <button
            className="toastClose"
            onClick={(e) => {
              e.stopPropagation()
              setToast(prev => ({ ...prev, show: false }))
            }}
          >
            ✕
          </button>
        </div>
      )}
    </AppLayout>
  )
}

