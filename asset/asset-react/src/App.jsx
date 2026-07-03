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
import ExpenseDetailModal from './components/UI/ExpenseDetailModal';

function Dashboard() {
  const { navSection, showToast, persistSections, getCurrentSections, updateRow } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null); // 'assets' | 'expenses' | null
  const [dataModal, setDataModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [githubModal, setGithubModal] = useState(false);
  const [expenseDetail, setExpenseDetail] = useState(null); // { item, sectionKey } | null
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  const handleExpenseDetailOpen = (item, sectionKey) => {
    setExpenseDetail({ item, sectionKey });
  };

  const handleExpenseDetailSave = async (sectionKey, itemId, details) => {
    const sections = getCurrentSections();
    const items = sections[sectionKey] || [];
    const targetItem = items.find(i => i.id === itemId);
    if (!targetItem) return;

    // 1) 메모리 상태 업데이트
    const newAmount = details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    updateRow(sectionKey, itemId, 'details', details);
    updateRow(sectionKey, itemId, 'amount', newAmount);
    if (sectionKey === 'debt') {
      updateRow(sectionKey, itemId, 'remAmount', newAmount);
    }

    // 2) 즉시 로컬 + 서버 저장
    setIsSavingDetail(true);
    try {
      // updateRow는 동기이므로 최신 sections를 다시 읽어와 저장
      const latestSections = getCurrentSections();
      // 방금 업데이트한 항목을 직접 패치해서 저장
      const patchedSections = { ...latestSections };
      const patchedItems = (patchedSections[sectionKey] || []).map(i =>
        i.id === itemId
          ? { ...i, details, amount: newAmount, ...(sectionKey === 'debt' ? { remAmount: newAmount } : {}) }
          : i
      );
      patchedSections[sectionKey] = patchedItems;

      const res = await persistSections(patchedSections, true);
      if (res && res.success) {
        if (res.target === 'github') {
          showToast('상세 내역이 로컬 및 GitHub에 저장되었습니다.', 'success');
        } else {
          showToast('상세 내역이 저장되었습니다.', 'success');
        }
      } else {
        showToast('저장 중 오류가 발생했습니다.', 'danger');
      }
    } catch (e) {
      showToast('저장 중 오류가 발생했습니다.', 'danger');
    } finally {
      setIsSavingDetail(false);
      setExpenseDetail(null);
    }
  };

  const handleSaveSync = async () => {
    const sections = getCurrentSections();
    showToast('저장 및 동기화 진행 중...', 'info');
    const res = await persistSections(sections, true);
    if (res && res.success) {
      if (res.target === 'github') {
        showToast('✅ 로컬 및 GitHub 서버에 성공적으로 동기화 저장되었습니다.', 'success');
      } else if (res.target === 'local_only_sync_fail') {
        showToast('⚠️ 로컬 저장소에 저장되었습니다. (GitHub 서버 동기화 실패)', 'warning');
      } else if (res.target === 'server') {
        showToast('✅ 로컬 및 서버 백엔드에 안전하게 저장되었습니다.', 'success');
      } else {
        showToast('ℹ️ 로컬 브라우저 저장소에만 저장되었습니다. (GitHub 서버 연동 필요)', 'info');
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
                  onExpenseDetail={handleExpenseDetailOpen}
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
              <ExpenseSection 
                onSummary={() => setSummaryModal('expenses')} 
                onExpenseDetail={handleExpenseDetailOpen}
              />
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
      {expenseDetail && (
        <ExpenseDetailModal
          item={expenseDetail.item}
          sectionKey={expenseDetail.sectionKey}
          onClose={() => setExpenseDetail(null)}
          onSave={handleExpenseDetailSave}
          isSaving={isSavingDetail}
        />
      )}
      {manualModal && (
        <div className="modal-overlay" onClick={() => setManualModal(false)}>
          <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">📖 사용 매뉴얼</div>
              <button className="btn-close" onClick={() => setManualModal(false)}>×</button>
            </div>
            <div style={{ lineHeight: 1.9, color: 'var(--text-secondary)', fontSize: '0.88rem', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.25rem' }}>

              {/* 1. 메뉴 구성 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                📌 1. 메뉴 구성 (좌측 사이드바)
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>대시보드</strong> — 요약카드 + 할부 현황 + 자산/지출 섹션 전체 조회</li>
                <li><strong>자산 · 수입</strong> — 현금성 자산, 비현금성 자산, 부동산, 연금·보험, 수입 항목 관리</li>
                <li><strong>부채 · 지출</strong> — 부채, 고정지출, 변동지출 항목 관리</li>
                <li><strong>할부 관리</strong> — 카드 할부 상세 입력 및 상환 처리</li>
                <li><strong>연금 정보</strong> — 연금 수령액, 납입 기간 등 정보 입력</li>
              </ul>

              {/* 2. 상단바 버튼 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                🔧 2. 상단 버튼 안내
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>연도 · 월 선택</strong> — 조회/입력 기준 연월을 변경합니다. 변경 즉시 해당 월의 데이터로 전환됩니다.</li>
                <li><strong>💾 저장(플로피 아이콘)</strong> — 현재 데이터를 서버(GitHub 연동 시 자동 동기화 포함)에 저장합니다.</li>
                <li><strong>🐙 GitHub(고양이 아이콘)</strong> — GitHub 동기화 설정 창을 엽니다. 연결 성공 시 아이콘이 <span style={{ color: '#28a745', fontWeight: 700 }}>초록색</span>으로 표시됩니다.</li>
                <li><strong>🗄 데이터(실린더 아이콘)</strong> — JSON 형식으로 데이터를 내보내거나 가져옵니다. 다른 기기로 이전하거나 백업할 때 활용하세요.</li>
                <li><strong>❓ 매뉴얼(물음표 아이콘)</strong> — 현재 이 화면입니다.</li>
                <li><strong>☀️/🌙 테마 전환</strong> — 라이트/다크 모드를 전환합니다.</li>
              </ul>

              {/* 3. 요약 카드 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                📊 3. 상단 요약 카드
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>각 페이지 상단에 4개의 요약 카드가 표시됩니다.</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>월 수입</strong> — 해당 월의 수입 합계 (마우스 오버 시 항목별 상세 표시)</li>
                <li><strong>총 지출</strong> — 고정지출 + 변동지출 + 할부 납부액 합계</li>
                <li><strong>월 손익 (P&L)</strong> — 수입 − 지출. 플러스면 흑자(초록), 마이너스면 적자(빨강)</li>
                <li><strong>순자산 (Net Worth)</strong> — 총 자산 − 총 부채 (마우스 오버 시 자산/부채 세부 내역 표시)</li>
              </ul>

              {/* 4. 데이터 입력 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                ✏️ 4. 데이터 입력 방법
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li>각 섹션 우측의 <strong>+ 추가</strong> 버튼으로 새 항목을 추가합니다.</li>
                <li>표의 각 셀(금액, 내용, 카테고리 등)을 클릭하면 바로 수정할 수 있습니다.</li>
                <li>금액 입력 시 숫자만 입력하면 자동으로 천원 단위 콤마가 표시됩니다.</li>
                <li>항목 삭제는 행 우측의 <strong>삭제</strong> 버튼을 클릭합니다.</li>
                <li>변경된 내용은 즉시 반영되며, 상단 저장 버튼을 눌러 서버에 저장하세요.</li>
              </ul>

              {/* 5. 할부 관리 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                💳 5. 할부 관리
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li>사용일, 카드, 사용처, 총금액, 이율(%), 현재 회차/전체 회차를 입력합니다.</li>
                <li>이율 입력 시 남은 잔액과 수수료가 자동 계산됩니다. (이율 0이면 수수료 직접 입력)</li>
                <li><strong>상세 버튼</strong>을 클릭하면 회차별 납부 스케줄과 상환 관리 화면이 열립니다.</li>
                <li>상환 구분: <strong>정상 납부</strong> / <strong>일부 상환</strong>(금액 직접 입력) / <strong>중도 완납</strong> 선택 가능</li>
                <li>만기가 지난 할부는 자동으로 흐리게 표시되어 구분됩니다.</li>
              </ul>

              {/* 6. GitHub 동기화 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                🐙 6. GitHub 동기화
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li>상단 GitHub 아이콘을 클릭해 설정 창을 엽니다.</li>
                <li>Personal Access Token, Repository명, 파일 경로를 입력 후 저장합니다.</li>
                <li>설정 후 저장 버튼을 누르면 데이터가 서버와 GitHub에 자동 동기화됩니다.</li>
                <li>연결 성공 시 GitHub 아이콘이 초록색으로 변경됩니다.</li>
                <li>디바이스가 변경되어도 GitHub에서 최신 데이터를 불러올 수 있습니다.</li>
              </ul>

              {/* 7. 데이터 백업/복원 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                🗄 7. 데이터 백업 및 복원
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <li>상단 데이터 아이콘 → <strong>내보내기</strong>: 현재 데이터를 JSON 파일로 다운로드합니다.</li>
                <li>상단 데이터 아이콘 → <strong>가져오기</strong>: JSON 파일을 업로드하여 데이터를 복원합니다.</li>
                <li>기기 이전, 데이터 초기화 복구 등에 활용하세요.</li>
              </ul>

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
