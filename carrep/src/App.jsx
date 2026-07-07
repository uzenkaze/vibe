import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Step1Vehicle from './pages/Step1Vehicle'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

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

  // Load reports and my car (hybrid: API server or LocalStorage)
  useEffect(() => {
    const initLoad = async () => {
      if (isLocal) {
        try {
          // 1. Load reports
          const reportsRes = await fetch('/api/carrep/reports')
          if (reportsRes.ok) {
            const reportsData = await reportsRes.json()
            setReports(reportsData)
          }
          // 2. Load myCar
          const myCarRes = await fetch('/api/carrep/mycar')
          if (myCarRes.ok) {
            const myCarData = await myCarRes.json()
            setMyCar(myCarData)
          }
          return // API loading success
        } catch (e) {
          console.warn('Backend API server not reachable, fallback to LocalStorage', e)
        }
      }

      // LocalStorage fallback
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
    }

    initLoad()
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

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation()
    if (!window.confirm('이 보고서를 삭제하시겠습니까?')) return

    if (isLocal) {
      try {
        const res = await fetch(`/api/carrep/reports/${id}`, {
          method: 'DELETE'
        })
        if (res.ok) {
          const updated = reports.filter(r => r.id !== id)
          setReports(updated)
          if (savedReportId === id) {
            handleReset()
          }
          return
        }
      } catch (err) {
        console.error('Delete via API failed, trying LocalStorage fallback', err)
      }
    }

    // LocalStorage fallback
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('carrep_reports', JSON.stringify(updated))
    if (savedReportId === id) {
      handleReset()
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

    if (isLocal) {
      try {
        const res = await fetch('/api/carrep/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        })
        if (res.ok) {
          // Reload from DB to keep sync
          const listRes = await fetch('/api/carrep/reports')
          if (listRes.ok) {
            const reportsData = await listRes.json()
            setReports(reportsData)
          }
          setSavedReportId(newReport.id)
          alert('보고서가 SQLite 데이터베이스에 성공적으로 저장되었습니다!')
          return
        }
      } catch (err) {
        console.error('Save via API failed, trying LocalStorage fallback', err)
      }
    }

    // LocalStorage fallback
    let updatedReports = []
    if (savedReportId) {
      updatedReports = reports.map(r => r.id === savedReportId ? newReport : r)
    } else {
      updatedReports = [newReport, ...reports]
      setSavedReportId(newReport.id)
    }
    setReports(updatedReports)
    localStorage.setItem('carrep_reports', JSON.stringify(updatedReports))
    alert('보고서가 로컬 브라우저(LocalStorage)에 저장되었습니다!')
  }

  const handleSaveMyCar = async (carInfo) => {
    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage
    }

    if (isLocal) {
      try {
        const res = await fetch('/api/carrep/mycar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(myCarData)
        })
        if (res.ok) {
          setMyCar(myCarData)
          alert('내 차량 정보가 SQLite 데이터베이스에 등록되었습니다!')
          return
        }
      } catch (err) {
        console.error('Save My Car via API failed, trying LocalStorage fallback', err)
      }
    }

    // LocalStorage fallback
    setMyCar(myCarData)
    localStorage.setItem('carrep_my_car', JSON.stringify(myCarData))
    alert('내 차량 정보가 로컬 브라우저(LocalStorage)에 등록되었습니다!')
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
