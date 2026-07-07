import { useState, useEffect } from 'react'
import './index.css'
import AppLayout from './components/AppLayout'
import Step1Vehicle from './pages/Step1Vehicle'
import Step2Repairs from './pages/Step2Repairs'
import Step3Report from './pages/Step3Report'
import GitHubModal from './components/GitHubModal'
import { getGithubJson, saveGithubJson, validateGithubToken } from './utils/githubDb'

const API_BASE = 'http://localhost:5500'
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
  
  // GitHub integration & modal states
  const [githubToken, setGithubToken] = useState(localStorage.getItem('carrep_github_token') || '')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Connection status: 'local' | 'cloud' | 'remote' | 'offline'
  const [dbStatus, setDbStatus] = useState('offline')

  // Hybrid Data Loading Chain
  const loadData = async (tokenVal = githubToken) => {
    // 1. Try loading from Live Local API Server (localhost:5500)
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
        setDbStatus('local')
        console.log('[CarRep] Loaded data from local backend server JSON.')
        return
      }
    } catch (e) {
      console.warn('[CarRep] Local API server not reachable, trying direct GitHub API / Pages...')
    }

    // 2. Try loading from direct GitHub Contents API (if token is available)
    if (tokenVal) {
      const isValid = await validateGithubToken(tokenVal)
      if (isValid) {
        try {
          const reportsRes = await getGithubJson(REPORTS_PATH, tokenVal)
          // Even if file doesn't exist yet (reportsRes is null), the connection itself is valid
          setReports(reportsRes ? (reportsRes.content || []) : [])
          
          const myCarRes = await getGithubJson(MYCAR_PATH, tokenVal)
          setMyCar(myCarRes ? (myCarRes.content || null) : null)
          
          setDbStatus('cloud')
          console.log('[CarRep] GitHub Cloud DB connection established (Direct API Mode).')
          return
        } catch (e) {
          console.warn('[CarRep] GitHub API read error, falling back to static Pages...', e)
        }
      } else {
        console.warn('[CarRep] GitHub token is invalid or expired.')
      }
    }

    // 3. Try loading from GitHub Pages deployed Static JSON files (anonymous public)
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
        console.log('[CarRep] Loaded data from GitHub Pages static JSON (Read-only).')
        return
      }
    } catch (e) {
      console.warn('[CarRep] GitHub Pages static JSON database not reachable.')
    }

    setDbStatus('offline')
    setReports([])
    setMyCar(null)
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
      alert('GitHub 토큰 인증에 성공했습니다! 데이터 연결이 활성화됩니다.')
      loadData(token)
    } else {
      localStorage.removeItem('carrep_github_token')
      setGithubToken('')
      setIsModalOpen(false)
      alert('GitHub 설정 정보가 삭제되었습니다. 읽기 전용 모드로 전환됩니다.')
      loadData('')
    }
  }

  const handleDeleteReport = async (id, e) => {
    e.stopPropagation()

    if (!window.confirm('이 보고서를 영구 삭제하시겠습니까?')) return

    // Scenario A: Local backend server is active
    if (dbStatus === 'local') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/reports/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setReports(prev => prev.filter(r => r.id !== id))
          if (savedReportId === id) handleReset()
          alert('보고서가 로컬 서버를 통해 정상 삭제되었습니다.')
          return
        }
      } catch (err) {
        console.error('Delete via server failed', err)
      }
    }

    // Scenario B: Client-side direct GitHub Cloud DB commit
    if (githubToken) {
      try {
        const updatedReports = reports.filter(r => r.id !== id)
        await saveGithubJson(
          REPORTS_PATH,
          updatedReports,
          githubToken,
          `chore(data): delete repair report ${id}`
        )
        setReports(updatedReports)
        if (savedReportId === id) handleReset()
        alert('보고서가 GitHub 저장소에서 직접 정상 삭제되었습니다!')
        return
      } catch (err) {
        console.error('Delete via GitHub API failed', err)
        alert(`⚠️ GitHub 저장소 삭제 실패: ${err.message}\n토큰 권한 및 파일 상태를 확인해 주세요.`)
        return
      }
    }

    alert('⚠️ 읽기 전용 상태입니다. 삭제 권한이 없습니다. 우측 상단의 [GitHub 설정] 버튼을 클릭해 Personal Access Token을 입력하여 등록해 주세요.')
  }

  const handleSaveReport = async () => {
    const newReport = {
      id: savedReportId || Date.now(),
      createdAt: new Date().toISOString(),
      vehicleInfo,
      repairItems,
      attachedImages
    }

    // Scenario A: Local backend server is active
    if (dbStatus === 'local') {
      try {
        const res = await fetch(`${API_BASE}/api/carrep/reports`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReport)
        })
        if (res.ok) {
          await loadData()
          setSavedReportId(newReport.id)
          alert('보고서가 로컬 서버를 통해 저장 및 동기화되었습니다!')
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
        let updatedReports = []
        if (savedReportId) {
          updatedReports = reports.map(r => r.id === savedReportId ? newReport : r)
        } else {
          updatedReports = [newReport, ...reports]
        }

        await saveGithubJson(
          REPORTS_PATH,
          updatedReports,
          githubToken,
          savedReportId ? `chore(data): update repair report ${newReport.id}` : `chore(data): create repair report ${newReport.id}`
        )

        setReports(updatedReports)
        setSavedReportId(newReport.id)
        alert('보고서가 GitHub 저장소에 직접 정상 저장(커밋)되었습니다!')
        setStep(3)
        return
      } catch (err) {
        console.error('Save via GitHub API failed', err)
        alert(`⚠️ GitHub 저장소 저장 실패: ${err.message}\n토큰 유효성 및 권한(repo)을 확인하세요.`)
        return
      }
    }

    alert('⚠️ 읽기 전용 상태입니다. 저장 권한이 없습니다. 우측 상단의 [GitHub 설정] 버튼을 클릭해 Personal Access Token을 입력하여 등록해 주세요.')
  }

  const handleSaveMyCar = async (carInfo) => {
    const myCarData = {
      maker: carInfo.maker,
      model: carInfo.model,
      year: carInfo.year,
      mileage: carInfo.mileage
    }

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
          alert('내 차량 정보가 로컬 서버를 통해 저장 및 동기화되었습니다!')
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
          MYCAR_PATH,
          myCarData,
          githubToken,
          'chore(data): update MyCar profile'
        )
        setMyCar(myCarData)
        alert('내 차량 정보가 GitHub 저장소에 직접 등록(커밋)되었습니다!')
        return
      } catch (err) {
        console.error('Save My Car via GitHub API failed', err)
        alert(`⚠️ GitHub 저장소 저장 실패: ${err.message}`)
        return
      }
    }

    alert('⚠️ 읽기 전용 상태입니다. 내 차량 등록 권한이 없습니다. 우측 상단의 [GitHub 설정] 버튼을 클릭해 Personal Access Token을 입력하여 등록해 주세요.')
  }

  return (
    <AppLayout step={step} goToStep={goToStep} onOpenSetting={() => setIsModalOpen(true)}>
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

      {/* GitHub Token Config Layer Modal */}
      <GitHubModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveToken}
        currentToken={githubToken}
      />
    </AppLayout>
  )
}
