import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Step1Vehicle from './pages/Step1Vehicle'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'

const API_BASE = 'http://localhost:5500'

export default function App() {
  const [step, setStep] = useState(1)
  const [vehicleInfo, setVehicleInfo] = useState({
    maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: ''
  })
  const [repairItems, setRepairItems] = useState([])
  const [attachedImages, setAttachedImages] = useState([])
  const [reports, setReports] = useState([])
  const [savedReportId, setSavedReportId] = useState(null)
  const [myCar, setMyCar] = useState(null)
  
  // Connection state: 'sqlite' (🟢 로컬 실시간 DB) | 'github' (🔵 GitHub 원격 동기화 DB) | 'local' (🟡 브라우저 로컬 저장소)
  const [dbSource, setDbSource] = useState('local')

  // Hybrid Data Loading Chain
  const loadData = async () => {
    // 1. Try loading from Live Local SQLite DB Server (localhost:5500)
    try {
      const reportsRes = await fetch(`${API_BASE}/api/carrep/reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
        
        const myCarRes = await fetch(`${API_BASE}/api/carrep/mycar`)
        if (myCarRes.ok) {
          const myCarData = await myCarRes.json()
          setMyCar(myCarData)
        }
        setDbSource('sqlite')
        console.log('[CarRep] Loaded data from SQLite DB Server.')
        return
      }
    } catch (e) {
      console.warn('[CarRep] SQLite DB server not reachable, trying GitHub static DB...')
    }

    // 2. Try loading from GitHub Pages deployed Static JSON files
    try {
      // Determine base path to fetch reports.json
      const basePath = window.location.pathname.includes('/vibe') ? '/vibe/carrep' : '/carrep'
      const reportsRes = await fetch(`${basePath}/data/reports.json?t=${Date.now()}`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)

        const myCarRes = await fetch(`${basePath}/data/mycar.json?t=${Date.now()}`)
        if (myCarRes.ok) {
          const myCarData = await myCarRes.json()
          setMyCar(myCarData)
        }
        setDbSource('github')
        console.log('[CarRep] Loaded data from GitHub remote static JSON database.')
        return
      }
    } catch (e) {
      console.warn('[CarRep] GitHub static JSON database not reachable, trying LocalStorage...')
    }

    // 3. Fallback to LocalStorage
    const saved = localStorage.getItem('carrep_reports')
    if (saved) {
      try {
        setReports(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse reports', e)
      }
    }

    const savedMyCar = localStorage.getItem('carrep_my_car')
    if (savedMyCar) {
      try {
        setMyCar(JSON.parse(savedMyCar))
      } catch (e) {
        console.error('Failed to parse my car', e)
      }
    }
    setDbSource('local')
    console.log('[CarRep] Fallback: Loaded data from LocalStorage.')
  }

  useEffect(() => {
    loadData()
  }, [])

  const goNext = () => setStep(s => Math.min(s + 1, 3))
  const goPrev = () => setStep(s => Math.max(s - 1, 1))
  const goToStep = (n) => setStep(n)

  const handleReset = () => {
    setVehicleInfo({ maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: '' })
    setRepairItems([])
    setAttachedImages([])
    setSavedReportId(null)
    setStep(1)
  }

  const handleSelectReport = (report) => {
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
    setStep(1)
  }

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('이 보고서를 삭제하시겠습니까?')) return

    if (dbSource === 'sqlite') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/reports/${id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          setReports(prev => prev.filter(r => r.id !== id))
          if (savedReportId === id) handleReset()
          alert('SQLite 데이터베이스에서 삭제되었습니다.')
          return
        }
      } catch (err) {
        console.error('Delete via API failed', err)
      }
    }

    // LocalStorage Fallback for offline mode
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('carrep_reports', JSON.stringify(updated))
    if (savedReportId === id) handleReset()
    alert('브라우저 임시 저장소(LocalStorage)에서 삭제되었습니다.')
  }

  const handleSaveReport = async () => {
    const newReport = {
      id: savedReportId || Date.now(),
      createdAt: new Date().toISOString(),
      vehicleInfo,
      repairItems,
      attachedImages
    }

    if (dbSource === 'sqlite') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        })
        if (res.ok) {
          await loadData()
          setSavedReportId(newReport.id)
          alert('보고서가 SQLite DB에 저장되었으며, GitHub로 자동 동기화 배포를 트리거했습니다!')
          setStep(3)
          return
        }
      } catch (err) {
        console.error('Save via API failed', err)
      }
    }

    // LocalStorage Fallback for offline mode
    let updatedReports = []
    if (savedReportId) {
      updatedReports = reports.map(r => r.id === savedReportId ? newReport : r)
    } else {
      updatedReports = [newReport, ...reports]
      setSavedReportId(newReport.id)
    }
    setReports(updatedReports)
    localStorage.setItem('carrep_reports', JSON.stringify(updatedReports))
    alert('⚠️ 서버 미연결 상태: 보고서가 현재 브라우저(LocalStorage)에 임시 보존되었습니다. 로컬에서 서버(node server.js)를 구동하여 저장하시면 SQLite DB와 GitHub 전체로 자동 동기화됩니다.')
    setStep(3)
  }

  const handleSaveMyCar = async (carInfo) => {
    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage
    }

    if (dbSource === 'sqlite') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/mycar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(myCarData)
        })
        if (res.ok) {
          setMyCar(myCarData)
          alert('내 차량 정보가 SQLite DB에 저장되었으며, GitHub로 자동 동기화 배포를 트리거했습니다!')
          return
        }
      } catch (err) {
        console.error('Save My Car via API failed', err)
      }
    }

    // LocalStorage Fallback for offline mode
    setMyCar(myCarData)
    localStorage.setItem('carrep_my_car', JSON.stringify(myCarData))
    alert('내 차량 정보가 현재 브라우저(LocalStorage)에 임시 등록되었습니다.')
  }

  return (
    <AppLayout step={step} goToStep={goToStep}>
      {step === 1 && (
        <Step1Vehicle
          vehicleInfo={vehicleInfo}
          setVehicleInfo={setVehicleInfo}
          reports={reports}
          myCar={myCar}
          dbSource={dbSource}
          onSaveMyCar={handleSaveMyCar}
          onSelectReport={handleSelectReport}
          onEditReport={handleEditReport}
          onDeleteReport={handleDeleteReport}
          onNext={goNext}
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
    </AppLayout>
  )
}
