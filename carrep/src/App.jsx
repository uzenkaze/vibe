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

  // Fetch reports list and my car profile from backend SQLite DB on mount
  const loadData = async () => {
    try {
      // 1. Fetch reports
      const reportsRes = await fetch(`${API_BASE}/api/carrep/reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
      } else {
        console.error('Failed to load reports from database')
      }
      
      // 2. Fetch myCar profile
      const myCarRes = await fetch(`${API_BASE}/api/carrep/mycar`)
      if (myCarRes.ok) {
        const myCarData = await myCarRes.json()
        setMyCar(myCarData)
      }
    } catch (e) {
      console.error('SQLite DB server is not running or reachable:', e)
      alert('⚠️ SQLite 데이터베이스 서버(localhost:5500)에 연결할 수 없습니다.\n로컬에서 "node server.js" 서버가 구동 중인지 확인해 주세요.')
    }
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

  // Load report data directly into Step 1 input fields for immediate editing
  const handleEditReport = (report) => {
    setVehicleInfo(report.vehicleInfo)
    setRepairItems(report.repairItems)
    setAttachedImages(report.attachedImages || [])
    setSavedReportId(report.id)
    setStep(1) // Go to Step 1 input form instead of Step 3 report view
  }

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('이 보고서를 데이터베이스에서 영구 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`${API_BASE}/api/carrep/reports/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id))
        if (savedReportId === id) {
          handleReset()
        }
        alert('보고서가 데이터베이스에서 삭제되었습니다.')
      } else {
        alert('삭제 실패: 데이터베이스 서버 오류')
      }
    } catch (err) {
      console.error('Delete via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 끊김: 삭제를 완료할 수 없습니다.')
    }
  }

  const handleSaveReport = async () => {
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
        // Sync and refresh state
        await loadData()
        setSavedReportId(newReport.id)
        alert('보고서가 SQLite 데이터베이스에 성공적으로 저장되었습니다!')
        // Move to Step 3 report view automatically after saving
        setStep(3)
      } else {
        alert('저장 실패: 데이터베이스 스키마 검증 실패')
      }
    } catch (err) {
      console.error('Save via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 끊김: 보고서를 저장할 수 없습니다.')
    }
  }

  const handleSaveMyCar = async (carInfo) => {
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
        alert('내 차량 정보가 SQLite 데이터베이스에 등록되었습니다!')
      } else {
        alert('내 차량 등록 실패: 서버 오류')
      }
    } catch (err) {
      console.error('Save My Car via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 끊김: 내 차량 정보를 등록할 수 없습니다.')
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
