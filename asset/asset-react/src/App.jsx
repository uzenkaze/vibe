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
import AssetAnalyticsChart from './components/Dashboard/AssetAnalyticsChart';
import AssetSection from './components/Dashboard/AssetSection';
import ExpenseSection from './components/Dashboard/ExpenseSection';
import InstallmentOverview from './components/Dashboard/InstallmentOverview';
import SubscriptionOverview from './components/Dashboard/SubscriptionOverview';
import IncomeExpenseSectionCard from './components/Dashboard/IncomeExpenseSectionCard';
import InstallmentPage from './components/Pages/InstallmentPage';
import CardPaymentsPage from './components/Pages/CardPaymentsPage';
import PensionPage from './components/Pages/PensionPage';
import InsurancePage from './components/Pages/InsurancePage';
import TaxArticlePage from './components/Pages/TaxArticlePage';
import KnowledgeIndustryPage from './components/Pages/KnowledgeIndustryPage';

// UI
import Toast from './components/UI/Toast';
import SummaryModal from './components/UI/SummaryModal';
import DataModal from './components/UI/DataModal';
import GitHubModal from './components/UI/GitHubModal';
import ExpenseDetailModal from './components/UI/ExpenseDetailModal';
import CalculatorModal from './components/UI/CalculatorModal';
import PullToRefresh from './components/UI/PullToRefresh';

function Dashboard() {
  const { navSection, showToast, persistSections, getCurrentSections, updateRow, triggerSaveSuccessBlink, yearData, year } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [summaryModal, setSummaryModal] = useState(null); // 'assets' | 'expenses' | null
  const [dataModal, setDataModal] = useState(false);
  const [manualModal, setManualModal] = useState(false);
  const [githubModal, setGithubModal] = useState(false);
  const [calcModal, setCalcModal] = useState(false);
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

    // 1) 상세 내역 금액 합산 계산
    const newAmount = details.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

    // 2) 최신 데이터가 반영된 단일 sections 객체 생성
    const patchedSections = { ...sections };
    patchedSections[sectionKey] = (sections[sectionKey] || []).map(i =>
      i.id === itemId
        ? { ...i, details, amount: newAmount, ...(sectionKey === 'debt' ? { remAmount: newAmount } : {}) }
        : i
    );

    // 3) 즉시 로컬 브라우저 + 서버 백엔드 + GitHub 저장소 동기화 실행
    setIsSavingDetail(true);
    try {
      showToast('상세 내역을 서버에 저장 중...', 'info');
      const res = await persistSections(patchedSections, true);
      if (res && res.success) {
        if (res.target === 'github' || res.target === 'server') {
          showToast('저장되었습니다.', 'success', true);
        } else if (res.target === 'local_only_sync_fail') {
          const errMsg = res.error ? ` 사유: ${res.error}` : '';
          showToast(`⚠️ 상세 내역 로컬 저장 완료 (GitHub 동기화 실패.${errMsg})`, 'warning');
        } else {
          showToast('저장되었습니다.', 'success', true);
        }
      } else {
        showToast('저장 중 오류가 발생했습니다.', 'danger');
      }
    } catch (e) {
      console.error(e);
      showToast('저장 중 오류가 발생했습니다.', 'danger');
    } finally {
      setIsSavingDetail(false);
      setExpenseDetail(null);
    }
  };

  const handleSaveSync = async () => {
    showToast('모든 페이지 데이터 서버(GitHub) 동기화 진행 중...', 'info');
    try {
      const { getGithubConfig, syncWithGitHub } = await import('./utils/github');
      const ghConfig = getGithubConfig();

      // 1. 현재 화면의 자산 관리 데이터 저장 (현재 연도 assetData_YYYY 저장 및 GitHub 동기화)
      const sections = getCurrentSections();
      await persistSections(sections, true);

      // 2. GitHub 설정이 있는 경우 다른 페이지 데이터셋 및 기타 연도 자산 데이터 동기화
      if (ghConfig.token && ghConfig.repo) {
        const uploadPromises = [];
        const currentYearKey = `assetData_${year}`;

        // 2-1. 현재 활성 연도를 제외한 기타 연도 자산 데이터만 동기화 (중복 업로드 및 409 Conflict 방지)
        const otherYearKeys = new Set();
        Object.keys(yearData || {}).forEach(y => {
          if (String(y) !== String(year)) otherYearKeys.add(`assetData_${y}`);
        });
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('assetData_') && !key.endsWith('_updatedAt') && key !== currentYearKey) {
            otherYearKeys.add(key);
          }
        }
        otherYearKeys.forEach(yearKey => {
          const y = yearKey.replace('assetData_', '');
          const yData = (yearData && yearData[y]) || (() => {
            try { return JSON.parse(localStorage.getItem(yearKey)); } catch { return null; }
          })();
          if (yData) {
            uploadPromises.push(
              syncWithGitHub('upload', yearKey, JSON.stringify(yData)).catch(e => console.warn(`[Sync] ${yearKey} failed`, e))
            );
          }
        });

        // 2-2. 지식산업센터 데이터 동기화
        const savedKi = localStorage.getItem('asset_knowledge_industry');
        if (savedKi) {
          uploadPromises.push(
            syncWithGitHub('upload', 'asset_knowledge_industry', savedKi).catch(e => console.warn('[Sync] KI failed', e))
          );
        }

        // 2-3. 세무/절세 아티클 데이터 동기화
        const savedArt = localStorage.getItem('asset_tax_articles');
        if (savedArt) {
          uploadPromises.push(
            syncWithGitHub('upload', 'asset_tax_articles', savedArt).catch(e => console.warn('[Sync] Articles failed', e))
          );
        }

        // 2-4. 세무 아티클 카테고리 동기화
        const savedCats = localStorage.getItem('asset_tax_article_categories');
        if (savedCats) {
          uploadPromises.push(
            syncWithGitHub('upload', 'asset_tax_article_categories', savedCats).catch(e => console.warn('[Sync] Categories failed', e))
          );
        }

        // 2-5. 보안 계좌 데이터 동기화
        const savedSec = localStorage.getItem('_secureAccounts');
        if (savedSec) {
          uploadPromises.push(
            syncWithGitHub('upload', '_secureAccounts', savedSec).catch(e => console.warn('[Sync] SecureAccounts failed', e))
          );
        }

        await Promise.all(uploadPromises);

        triggerSaveSuccessBlink();
        showToast('🔑 모든 페이지 데이터가 서버(GitHub)에 성공적으로 저장되었습니다!', 'success', true);
      } else {
        setGithubModal(true);
        showToast('⚠️ 타 기기/브라우저 동기화를 위해 GitHub 토큰 설정을 진행해 주세요.', 'warning');
      }
    } catch (e) {
      console.error('Failed to sync all pages data', e);
      showToast('저장 중 오류가 발생했습니다: ' + e.message, 'danger');
    }
  };

  // 메뉴/페이지 이동 시 화면 및 메인 컨테이너 최상단(Top)으로 스크롤 이동
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    const mainEl = document.querySelector('.main-content');
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
    const pageContainer = document.querySelector('.page-container');
    if (pageContainer) {
      pageContainer.scrollTop = 0;
    }
  }, [navSection]);

  // 모든 입력 필드(data-table 및 모달/폼) 포커스 이동 시 전체 자동 선택
  useEffect(() => {
    const handleGlobalFocusIn = (e) => {
      const target = e.target;
      if (!target) return;
      const tagName = target.tagName ? target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea') {
        if (['checkbox', 'radio', 'button', 'submit', 'reset', 'file'].includes(target.type)) {
          return;
        }
        requestAnimationFrame(() => {
          if (target && typeof target.select === 'function') {
            target.select();
          }
        });
      }
    };

    document.addEventListener('focusin', handleGlobalFocusIn);
    return () => {
      document.removeEventListener('focusin', handleGlobalFocusIn);
    };
  }, []);



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
          onCalcModal={() => setCalcModal(true)}
        />

        <PullToRefresh>
          <div className="page-container">
            {/* 대시보드: 요약카드 + 자산구성 분석차트 + 수입대비 지출 현황 + 카드 현황 */}
            {(navSection === 'dashboard') && (
              <>
                <SummaryCards />
                <AssetAnalyticsChart />
                <IncomeExpenseSectionCard />
                <InstallmentOverview />
                <SubscriptionOverview />
              </>
            )}

            {/* 자산·수입 전용 */}
            {navSection === 'assets' && (
              <>
                <AssetSection onSummary={() => setSummaryModal('assets')} />
              </>
            )}

            {/* 부채·지출 전용 */}
            {navSection === 'expenses' && (
              <>
                <ExpenseSection 
                  onSummary={() => setSummaryModal('expenses')} 
                  onExpenseDetail={handleExpenseDetailOpen}
                />
              </>
            )}

            {/* 할부 관리 */}
            {navSection === 'installment' && (
              <InstallmentPage />
            )}

            {/* 카드 납부 내역 */}
            {navSection === 'cardPayments' && (
              <CardPaymentsPage />
            )}

            {/* 연금 정보 관리 */}
            {navSection === 'pension' && (
              <PensionPage />
            )}

            {/* 보험 정보 관리 */}
            {navSection === 'insurance' && (
              <InsurancePage />
            )}

            {/* 세금 · 자산 지식 아티클 관리 */}
            {navSection === 'taxArticles' && (
              <TaxArticlePage />
            )}

            {/* 지식산업센터 부동산 자산 관리 */}
            {navSection === 'knowledgeIndustry' && (
              <KnowledgeIndustryPage />
            )}
          </div>
        </PullToRefresh>
      </main>

      {/* Bottom Nav (mobile) */}
      <BottomNav />

      {/* Floating Calculator FAB (Mobile only, floating above bottom nav) */}
      <button 
        className="mobile-floating-calc-fab"
        onClick={() => setCalcModal(true)}
        title="계산기 열기"
        aria-label="계산기"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="8" y1="6" x2="16" y2="6" />
          <line x1="16" y1="14" x2="16" y2="18" />
          <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
        </svg>
      </button>

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
      {calcModal && (
        <CalculatorModal onClose={() => setCalcModal(false)} />
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
                📌 1. 메뉴 구성 및 하단 네비게이션
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>대시보드</strong> — 요약 카드, 자산/지출 섹션, 수입 대비 지출 비교, 카드/구독 현황 전체 조회</li>
                <li><strong>자산 · 수입</strong> — 현금성 자산, 비현금성 자산, 부동산, 연금·보험, 수입 항목 관리</li>
                <li><strong>부채 · 지출</strong> — 부채, 고정지출, 변동지출 항목 관리</li>
                <li><strong>카드 (카드 할부)</strong> — 카드할부 상세 입력, 납부 회차 동기화, 회차별 스케줄 및 상환 레이어 관리</li>
                <li><strong>현금 (현금 납부/지출)</strong> — 현금 지출 내역 관리 및 6대 비교 카드 (수입 ➔ 현금 ➔ 카드 ➔ 차액 ➔ 지출 합계 ➔ 선납) 제공</li>
                <li><strong>내 연금</strong> — 국민/퇴직/개인연금 예상 수령액 및 납입 스케줄 조회</li>
              </ul>

              {/* 2. 상단바 및 모바일 제어 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                🔧 2. 상단바 및 스마트 모바일 제어
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>연도 · 월 선택</strong> — 조회/입력 기준 연월 변경 시 해당 월 데이터로 즉시 전환됩니다.</li>
                <li><strong>💾 저장(플로피 아이콘)</strong> — 현재 데이터를 local/서버 및 GitHub 연동 저장소에 저장합니다.</li>
                <li><strong>🐙 GitHub(고양이 아이콘)</strong> — GitHub 자동 연동 상태 관리 (<span style={{ color: '#28a745', fontWeight: 700 }}>초록색</span>: 연결 완료).</li>
                <li><strong>🗄 데이터(실린더 아이콘)</strong> — JSON 형식 파일 내보내기/가져오기 백업 관리.</li>
                <li><strong>☀️/🌙 테마 전환</strong> — 라이트/다크 감성 테마 원클릭 변경.</li>
                <li><strong>🔒 로그아웃</strong> — 모바일 및 PC 상단바 우측의 붉은색 로그아웃 아이콘 클릭 시 안전 확인 팝업 후 로그아웃됩니다.</li>
                <li><strong>🧮 모바일 플로팅 계산기 (FAB)</strong> — 모바일 화면 하단 우측에서 스크롤을 내려도 항상 따라다니는 에메랄드 원형 계산기 버튼이 배치되어 빠른 계산이 가능합니다.</li>
              </ul>

              {/* 3. 현금 납부 > 수입 대비 지출 6대 카드 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                💡 3. 현금납부 수입 대비 지출 6대 카드 & 커스텀 드래그 정렬
              </h3>
              <p style={{ marginBottom: '0.5rem' }}>지출 항목의 흐름을 한눈에 파악할 수 있는 6대 카드입니다. 카드를 드래그해서 원하는 위치로 순서를 변경할 수 있으며 정렬 순서는 자동으로 저장됩니다.</p>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>🖐 커스텀 드래그 앤 드롭</strong> — 수입, 현금, 카드, 차액, 지출 합계, 선납 카드를 원하는 위치로 끌어다 놓아 순서를 변경할 수 있습니다.</li>
                <li><strong>수입 카드 (에메랄드)</strong> — 해당 월의 수입 총액 (호버/클릭 시 상세 항목 툴팁 노출)</li>
                <li><strong>현금 카드 (오렌지)</strong> — 현금으로 직접 지출된 총 금액 (호버/클릭 시 지출 목록 노출)</li>
                <li><strong>카드 카드 (블루)</strong> — 이달 카드 결제 예정 총액 (호버/클릭 시 카드사별 결제액 툴팁)</li>
                <li><strong>차액 카드 (상태 반응형)</strong> — 수입 대비 지출 차액 금액 (부족 시 <span style={{ color: 'var(--coral)', fontWeight: 700 }}>- 마이너스 금액</span>으로 표시)</li>
                <li><strong>지출 합계 카드 (핑크)</strong> — 현금 지출과 카드 지출 원금을 합산한 총 지출 금액</li>
                <li><strong>선납 카드 (퍼플)</strong> — 미리 납부하거나 카드 선결제 완료된 항목의 총액 및 상세 레이어</li>
              </ul>

              {/* 4. 카드 할부 양방향 연동 기능 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                💳 4. 카드 할부 양방향 스마트 동기화
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
                <li><strong>회차 변경 자동 연동</strong> — 테이블에서 청구 회차(예: 3/10)를 변경하면 1회차부터 해당 회차 이전까지의 스케줄 체크박스가 자동으로 납부완료로 세팅됩니다.</li>
                <li><strong>스케줄 체크 역연동</strong> — 할부 상세 및 상환 모달의 납부 스케줄에서 특정 회차 체크박스를 선택/해제하면 청구 회차가 실시간으로 양방향 동기화됩니다.</li>
                <li><strong>이율 및 수수료 계산</strong> — 이율(%) 입력 시 남은 잔액과 월 수수료가 자동으로 계산됩니다.</li>
              </ul>

              {/* 5. 데이터 백업/복원 & GitHub 동기화 */}
              <h3 style={{ color: 'var(--teal)', marginBottom: '0.4rem', fontSize: '0.95rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.3rem' }}>
                📂 5. 데이터 백업, 복원 및 GitHub 동기화
              </h3>
              <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem' }}>
                <li><strong>JSON 내보내기/가져오기</strong> — 데이터 관리 창에서 한 번의 클릭으로 전체 장부를 파일로 저장하거나 불러옵니다.</li>
                <li><strong>GitHub 클라우드 동기화</strong> — Personal Access Token 설정 시, 기기를 변경해도 언제 어디서나 최근 장부 데이터를 안전하게 불러올 수 있습니다.</li>
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
