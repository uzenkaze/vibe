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
  const [dbConnected, setDbConnected] = useState(false)

  // Fetch reports list and my car profile directly from server SQLite DB
  const loadData = async () => {
    try {
      // 1. Fetch reports
      const reportsRes = await fetch(`${API_BASE}/api/carrep/reports`)
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json()
        setReports(reportsData)
        setDbConnected(true)
      } else {
        console.error('Failed to load reports from database')
        setDbConnected(false)
      }
      
      // 2. Fetch myCar profile
      const myCarRes = await fetch(`${API_BASE}/api/carrep/mycar`)
      if (myCarRes.ok) {
        const myCarData = await myCarRes.json()
        setMyCar(myCarData)
      }
    } catch (e) {
      console.error('SQLite DB server is not running or reachable:', e)
      setDbConnected(false)
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

  const handleEditReport = (report) => {
    setVehicleInfo(report.vehicleInfo)
    setRepairItems(report.repairItems)
    setAttachedImages(report.attachedImages || [])
    setSavedReportId(report.id)
    setStep(1)
  }

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('이 보고서를 서버 SQLite 데이터베이스에서 영구 삭제하시겠습니까?')) return

    try {
      const res = await fetch(`${API_BASE}/api/carrep/reports/${id}`, {
        method: 'DELETE'
      })
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id))
        if (savedReportId === id) {
          handleReset()
        }
        alert('보고서가 SQLite 데이터베이스에서 삭제되었습니다.')
      } else {
        alert('삭제 실패: 데이터베이스 서버 오류')
      }
    } catch (err) {
      console.error('Delete via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 오류: 삭제를 완료할 수 없습니다.')
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
        await loadData()
        setSavedReportId(newReport.id)
        alert('보고서가 서버 SQLite 데이터베이스에 성공적으로 저장되었습니다!')
        setStep(3)
      } else {
        alert('저장 실패: 데이터베이스 서버 스키마 검증 오류')
      }
    } catch (err) {
      console.error('Save via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 오류: 서버의 SQLite DB에 저장할 수 없습니다.')
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
        alert('내 차량 정보가 서버 SQLite 데이터베이스에 등록되었습니다!')
      } else {
        alert('내 차량 등록 실패: 서버 오류')
      }
    } catch (err) {
      console.error('Save My Car via API failed', err)
      alert('⚠️ 데이터베이스 서버 연결 오류: 내 차량 정보를 등록할 수 없습니다.')
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
          dbConnected={dbConnected}
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
