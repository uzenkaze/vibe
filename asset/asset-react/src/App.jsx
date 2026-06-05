import { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';

// Layout
import Sidebar from './components/Layout/Sidebar';
import BottomNav from './components/Layout/BottomNav';
import TopBar from './components/Layout/TopBar';

// Auth
import LandingPage from './components/Auth/LandingPage';
import LoginModal from './components/Auth/LoginModal';

// Dashboard
import SummaryCards from './components/Dashboard/SummaryCards';
import AssetSection from './components/Dashboard/AssetSection';
import ExpenseSection from './components/Dashboard/ExpenseSection';
import InstallmentOverview from './components/Dashboard/InstallmentOverview';
import InstallmentPage from './components/Pages/InstallmentPage';
import PensionPage from './components/Pages/PensionPage';

// UI
import Toast from './components/UI/Toast';
import SummaryModal from './components/UI/SummaryModal';
import DataModal from './components/UI/DataModal';
import GitHubModal from './components/UI/GitHubModal';

function Dashboard() {
  const { navSection, showToast, persistSections, getCurrentSections } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null); // 'assets' | 'expenses' | null
  const [dataModal, setDataModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [githubModal, setGithubModal] = useState(false);

  const handleSaveSync = async () => {
    const sections = getCurrentSections();
    showToast('저장 및 동기화 진행 중...', 'info');
    const res = await persistSections(sections);
    if (res && res.success) {
      if (res.target === 'github') {
        showToast('로컬 및 GitHub 동기화 저장이 완료되었습니다.', 'success');
      } else if (res.target === 'local_only_sync_fail') {
        showToast('로컬에 저장되었습니다. (GitHub 동기화 실패)', 'warning');
      } else {
        showToast('로컬 저장소에 저장되었습니다.', 'success');
      }
    } else {
      showToast('저장 중 오류가 발생했습니다.', 'danger');
    }
  };



  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(false)}
        onSaveSync={handleSaveSync}
        onDataModal={() => setDataModal(true)}
        onManual={() => setManualModal(true)}
        onGithubModal={() => setGithubModal(true)}
      />

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="main-content">
        <TopBar
          onHamburger={() => setSidebarOpen(o => !o)}
          onSaveSync={handleSaveSync}
          onDataModal={() => setDataModal(true)}
          onManual={() => setManualModal(true)}
          onGithubModal={() => setGithubModal(true)}
        />

        <div className="page-container">
          {/* 대시보드: 요약카드 + 전체 */}
          {(navSection === 'dashboard') && (
            <>
              <SummaryCards />
              <InstallmentOverview />
              <div className="dashboard-grid">
                <AssetSection onSummary={() => setSummaryModal('assets')} />
                <ExpenseSection
                  onSummary={() => setSummaryModal('expenses')}
                />
              </div>
            </>
          )}

          {/* 자산·수입 전용 */}
          {navSection === 'assets' && (
            <>
              <SummaryCards />
              <AssetSection onSummary={() => setSummaryModal('assets')} />
            </>
          )}

          {/* 부채·지출 전용 */}
          {navSection === 'expenses' && (
            <>
              <SummaryCards />
              <ExpenseSection onSummary={() => setSummaryModal('expenses')} />
            </>
          )}

          {/* 할부 관리 */}
          {navSection === 'installment' && (
            <>
              <SummaryCards />
              <InstallmentPage />
            </>
          )}

          {/* 연금 정보 관리 */}
          {navSection === 'pension' && (
            <PensionPage />
          )}
        </div>
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav />

      {/* Modals */}
      {summaryModal && (
        <SummaryModal type={summaryModal} onClose={() => setSummaryModal(null)} />
      )}
      {dataModal && (
        <DataModal onClose={() => setDataModal(false)} />
      )}
      {githubModal && (
        <GitHubModal onClose={() => setGithubModal(false)} />
      )}
      {manualModal && (
        <div className="modal-overlay" onClick={() => setManualModal(false)}>
          <div className="modal-box" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📖 사용 매뉴얼</div>
              <button className="btn-close" onClick={() => setManualModal(false)}>×</button>
            </div>
            <div style={{ lineHeight: 1.8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.5rem', fontSize: '1rem' }}>1. 화면 구성</h3>
              <p>좌측 사이드바에서 메뉴를 선택하여 자산, 지출, 할부를 관리합니다.</p>
              <br />
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.5rem', fontSize: '1rem' }}>2. 상단 버튼</h3>
              <ul style={{ paddingLeft: '1.25rem' }}>
                <li><strong>저장</strong>: 현재 데이터를 로컬에 저장합니다.</li>
                <li><strong>데이터</strong>: JSON 내보내기/가져오기를 합니다.</li>
                <li><strong>연/월 선택</strong>: 조회할 기간을 변경합니다.</li>
              </ul>
              <br />
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.5rem', fontSize: '1rem' }}>3. 데이터 입력</h3>
              <p>각 섹션의 <strong>+ 추가</strong> 버튼으로 항목을 추가하고, 셀을 클릭하여 직접 수정합니다.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-dark" onClick={() => setManualModal(false)} style={{ padding: '0.6rem 2rem' }}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const { screen, setScreen } = useApp();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      {screen === 'landing' && (
        <>
          <LandingPage onLogin={() => setShowLogin(true)} />
          {showLogin && (
            <LoginModal onClose={() => setShowLogin(false)} />
          )}
        </>
      )}

      {screen === 'dashboard' && <Dashboard />}

      <Toast />
    </>
  );
}
