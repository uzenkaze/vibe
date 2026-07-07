import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Step1Vehicle from './pages/Step1Vehicle'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'
import { getGithubJson, saveGithubJson } from './utils/githubDb'

const REPORTS_PATH = 'carrep/public/data/reports.json'
const MYCAR_PATH = 'carrep/public/data/mycar.json'

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
  
  // GitHub token state (stored in sessionStorage for safety)
  const [githubToken, setGithubToken] = useState(sessionStorage.getItem('carrep_github_token') || '')

  const updateGithubToken = (token) => {
    setGithubToken(token)
    if (token) {
      sessionStorage.setItem('carrep_github_token', token)
    } else {
      sessionStorage.removeItem('carrep_github_token')
    }
  }

  // Load database records directly from GitHub Contents API
  const loadData = async (tokenVal = githubToken) => {
    try {
      // 1. Fetch reports list
      const reportsRes = await getGithubJson(REPORTS_PATH, tokenVal)
      if (reportsRes && reportsRes.content) {
        setReports(reportsRes.content)
      } else {
        setReports([])
      }
      
      // 2. Fetch MyCar profile
      const myCarRes = await getGithubJson(MYCAR_PATH, tokenVal)
      if (myCarRes && myCarRes.content) {
        setMyCar(myCarRes.content)
      } else {
        setMyCar(null)
      }
    } catch (e) {
      console.warn('[CarRep] Failed to load data from GitHub. The files might not exist yet.', e)
    }
  }

  useEffect(() => {
    loadData()
  }, [githubToken])

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
    if (!githubToken) {
      alert('⚠️ 데이터를 삭제하려면 먼저 GitHub API 토큰을 입력해야 합니다.')
      return
    }
    if (!window.confirm('이 보고서를 GitHub 데이터베이스에서 영구 삭제하시겠습니까?')) return

    try {
      const updatedReports = reports.filter(r => r.id !== id)
      await saveGithubJson(
        REPORTS_PATH,
        updatedReports,
        githubToken,
        `chore(data): delete repair report ${id}`
      )
      
      setReports(updatedReports)
      if (savedReportId === id) {
        handleReset()
      }
      alert('보고서가 GitHub 데이터베이스에서 정상 삭제되었습니다!')
    } catch (err) {
      console.error('Delete via GitHub API failed', err)
      alert(`⚠️ 삭제 실패: ${err.message}\n토큰 권한(repo) 및 유효성을 점검해 주세요.`)
    }
  }

  const handleSaveReport = async () => {
    if (!githubToken) {
      alert('⚠️ 데이터를 저장하려면 먼저 GitHub API 토큰을 입력해야 합니다.')
      return
    }

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
    }

    try {
      await saveGithubJson(
        REPORTS_PATH,
        updatedReports,
        githubToken,
        savedReportId ? `chore(data): update repair report ${newReport.id}` : `chore(data): create repair report ${newReport.id}`
      )
      
      setReports(updatedReports)
      setSavedReportId(newReport.id)
      alert('보고서가 GitHub 데이터베이스에 성공적으로 저장되었습니다!')
      setStep(3)
    } catch (err) {
      console.error('Save via GitHub API failed', err)
      alert(`⚠️ 저장 실패: ${err.message}\n토큰 권한(repo) 및 유효성을 점검해 주세요.`)
    }
  }

  const handleSaveMyCar = async (carInfo) => {
    if (!githubToken) {
      alert('⚠️ 내 차량 정보를 등록하려면 먼저 GitHub API 토큰을 입력해야 합니다.')
      return
    }

    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage
    }

    try {
      await saveGithubJson(
        MYCAR_PATH,
        myCarData,
        githubToken,
        'chore(data): update MyCar profile'
      )
      setMyCar(myCarData)
      alert('내 차량 정보가 GitHub 데이터베이스에 정상 등록되었습니다!')
    } catch (err) {
      console.error('Save My Car via GitHub API failed', err)
      alert(`⚠️ 등록 실패: ${err.message}\n토큰 권한(repo) 및 유효성을 점검해 주세요.`)
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
          githubToken={githubToken}
          onGithubTokenChange={updateGithubToken}
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
