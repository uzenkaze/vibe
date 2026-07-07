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
  
  // Connection state: 'local' (🟢 로컬 API 서버 JSON DB) | 'remote' (🔵 GitHub 원격 동기화 JSON DB) | 'offline' (🔴 미연결 오프라인)
  const [dbStatus, setDbStatus] = useState('offline')

  // Hybrid Data Loading Chain (SQLite/LocalStorage Completely Removed)
  const loadData = async () => {
    // 1. Try loading from Live Local API Server (localhost:5500)
    try {
      const reportsRes = await fetch(`${API_BASE}/api/carrep/reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.ok ? await reportsRes.json() : []
        setReports(reportsData)
        
        const myCarRes = await fetch(`${API_BASE}/api/carrep/mycar`)
        if (myCarRes.ok) {
          const myCarData = await myCarRes.json()
          setMyCar(myCarData)
        }
        setDbStatus('local')
        console.log('[CarRep] Loaded data from local JSON database via server.js')
        return
      }
    } catch (e) {
      console.warn('[CarRep] Local API server not reachable, trying GitHub static DB...')
    }

    // 2. Try loading from GitHub Pages deployed Static JSON files
    try {
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
        setDbStatus('remote')
        console.log('[CarRep] Loaded data from GitHub remote static JSON database.')
        return
      }
    } catch (e) {
      console.warn('[CarRep] GitHub static JSON database not reachable.')
    }

    setDbStatus('offline')
    setReports([])
    setMyCar(null)
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
    if (dbStatus !== 'local') {
      alert('⚠️ 현재 읽기 전용 상태입니다. 데이터를 삭제하려면 로컬 PC에서 "node server.js" 서버를 구동해야 합니다.')
      return
    }

    if (!window.confirm('이 보고서를 서버 데이터베이스에서 영구 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`${API_BASE}/api/carrep/reports/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id))
        if (savedReportId === id) {
          handleReset()
        }
        alert('보고서가 데이터베이스에서 정상 삭제되었습니다.')
      } else {
        alert('삭제 실패: 서버 오류')
      }
    } catch (err) {
      console.error('Delete failed', err)
      alert('⚠️ 서버 통신 오류로 삭제를 실패했습니다.')
    }
  }

  const handleSaveReport = async () => {
    if (dbStatus !== 'local') {
      alert('⚠️ 현재 읽기 전용 상태입니다. 데이터를 저장하려면 로컬 PC에서 "node server.js" 서버를 구동해야 합니다.')
      return
    }

    const newReport = {
      id: savedReportId || Date.now(),
      createdAt: new Date().toISOString(),
      vehicleInfo,
      repairItems,
      attachedImages
    }

    try {
      const res = await fetch(`${API_BASE}/api/carrep/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      })
      if (res.ok) {
        await loadData()
        setSavedReportId(newReport.id)
        alert('보고서가 서버 JSON DB에 정상 저장되었으며, GitHub로 자동 동기화 배포를 완료했습니다!')
        setStep(3)
      } else {
        alert('저장 실패: 서버 오류')
      }
    } catch (err) {
      console.error('Save failed', err)
      alert('⚠️ 서버 통신 오류로 보고서 저장에 실패했습니다.')
    }
  }

  const handleSaveMyCar = async (carInfo) => {
    if (dbStatus !== 'local') {
      alert('⚠️ 현재 읽기 전용 상태입니다. 내 차량 정보를 등록하려면 로컬 PC에서 "node server.js" 서버를 구동해야 합니다.')
      return
    }

    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage
    }

    try {
      const res = await fetch(`${API_BASE}/api/carrep/mycar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(myCarData)
      })
      if (res.ok) {
        setMyCar(myCarData)
        alert('내 차량 정보가 서버 JSON DB에 등록되었으며, GitHub로 자동 동기화되었습니다!')
      } else {
        alert('내 차량 등록 실패: 서버 오류')
      }
    } catch (err) {
      console.error('Save My Car failed', err)
      alert('⚠️ 서버 통신 오류로 내 차량 등록에 실패했습니다.')
    }
  }

  return (
    <AppLayout step={step} goToStep={goToStep}>
      {step === 1 && (
        <Step1Vehicle
          vehicleInfo={vehicleInfo}
          setVehicleInfo={setVehicleInfo}
          reports={reports}
          myCar={myCar}
          dbStatus={dbStatus}
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
