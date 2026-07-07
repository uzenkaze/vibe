import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Step1Vehicle from './pages/Step1Vehicle'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'

export default function App() {
  const [step, setStep] = useState(1)
  const [vehicleInfo, setVehicleInfo] = useState({
    maker: '', model: '', year: '', mileage: '', repairDate: '', shopName: ''
  })
  const [repairItems, setRepairItems] = useState([])
  const [attachedImages, setAttachedImages] = useState([])
  const [reports, setReports] = useState([])
  const [savedReportId, setSavedReportId] = useState(null)

  // Load reports from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('carrep_reports')
    if (saved) {
      try {
        setReports(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse reports', e)
      }
    }
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

  const handleDeleteReport = (id, e) => {
    e.stopPropagation()
    if (!window.confirm('이 보고서를 삭제하시겠습니까?')) return
    const updated = reports.filter(r => r.id !== id)
    setReports(updated)
    localStorage.setItem('carrep_reports', JSON.stringify(updated))
    if (savedReportId === id) {
      handleReset()
    }
  }

  const handleSaveReport = () => {
    const newReport = {
      id: savedReportId || Date.now(),
      createdAt: new Date().toISOString(),
      vehicleInfo,
      repairItems,
      attachedImages
    }
    let updatedReports = []
    if (savedReportId) {
      updatedReports = reports.map(r => r.id === savedReportId ? newReport : r)
    } else {
      updatedReports = [newReport, ...reports]
      setSavedReportId(newReport.id)
    }
    setReports(updatedReports)
    localStorage.setItem('carrep_reports', JSON.stringify(updatedReports))
    alert('보고서가 성공적으로 저장되었습니다!')
  }

  return (
    <AppLayout step={step} goToStep={goToStep}>
      {step === 1 && (
        <Step1Vehicle
          vehicleInfo={vehicleInfo}
          setVehicleInfo={setVehicleInfo}
          reports={reports}
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
