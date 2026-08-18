import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getGithubConfig, saveGithubConfig, syncWithGitHub } from '../../utils/github';

export default function GitHubModal({ onClose }) {
  const { showToast, yearData, year, loadYearData, checkGithubConnection } = useApp();
  
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('uzenkaze/vibe');
  const [branch, setBranch] = useState('master');
  const [autoSync, setAutoSync] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [downloadResults, setDownloadResults] = useState(null);

  useEffect(() => {
    const config = getGithubConfig();
    setToken(config.token || '');
    setRepo(config.repo || 'uzenkaze/vibe');
    setBranch(config.branch || 'master');
    setAutoSync(!!config.autoSync);
  }, []);

  const handleSave = async () => {
    if (token && !repo) {
      showToast('저장소 정보를 입력해주세요.', 'error');
      return;
    }
    saveGithubConfig({ token, repo, branch, autoSync });
    showToast('GitHub 설정이 저장되었습니다.', 'success');
    if (checkGithubConnection) {
      await checkGithubConnection();
    }
    onClose();
  };

  const handleSyncDownload = async () => {
    if (!token || !repo) {
      showToast('GitHub 토큰 및 저장소 설정을 먼저 완료해주세요.', 'error');
      return;
    }
    
    setIsSyncing(true);
    setDownloadResults(null);
    try {
      const results = {
        assets: [],
        knowledgeIndustry: null,
        articles: null,
        categories: null,
        secureAccounts: null
      };

      // 1. 자산 데이터 (주요 연도 순회 조회)
      const targetYears = Array.from(new Set([year, '2026', '2025', '2024', '2027']));
      for (const y of targetYears) {
        const yearKey = `assetData_${y}`;
        try {
          const remoteAsset = await syncWithGitHub('download', yearKey);
          if (remoteAsset && remoteAsset.months) {
            localStorage.setItem(yearKey, JSON.stringify(remoteAsset));
            if (remoteAsset.updatedAt) {
              localStorage.setItem(`${yearKey}_updatedAt`, String(remoteAsset.updatedAt));
            }
            const monthCount = Object.keys(remoteAsset.months || {}).length;
            results.assets.push({ year: y, monthCount, updatedAt: remoteAsset.updatedAt });
          }
        } catch (err) {
          console.warn(`[GitHubModal] Error downloading ${yearKey}:`, err);
        }
      }
      // 현재 화면 연도 즉시 리로드
      await loadYearData(year);

      // 2. 지식산업센터 실제 데이터 조회
      try {
        const remoteKi = await syncWithGitHub('download', 'asset_knowledge_industry');
        if (remoteKi && (remoteKi.investment || remoteKi.loans || remoteKi.rent)) {
          localStorage.setItem('asset_knowledge_industry', JSON.stringify(remoteKi));
          const contractCount = remoteKi.rent?.contracts?.length || 0;
          const kbLoanCount = remoteKi.loans?.kb?.length || 0;
          const nhLoanCount = remoteKi.loans?.nh?.length || 0;
          results.knowledgeIndustry = { contractCount, kbLoanCount, nhLoanCount };
        }
      } catch (err) {
        console.warn('[GitHubModal] Error downloading asset_knowledge_industry:', err);
      }

      // 3. 세무/절세 아티클 실제 데이터 조회
      try {
        const remoteArt = await syncWithGitHub('download', 'asset_tax_articles');
        if (Array.isArray(remoteArt)) {
          localStorage.setItem('asset_tax_articles', JSON.stringify(remoteArt));
          results.articles = { count: remoteArt.length, titles: remoteArt.map(a => a.title).slice(0, 5) };
        }
      } catch (err) {
        console.warn('[GitHubModal] Error downloading asset_tax_articles:', err);
      }

      // 4. 세무 아티클 카테고리 실제 데이터 조회
      try {
        const remoteCats = await syncWithGitHub('download', 'asset_tax_article_categories');
        if (Array.isArray(remoteCats)) {
          localStorage.setItem('asset_tax_article_categories', JSON.stringify(remoteCats));
          results.categories = { list: remoteCats };
        }
      } catch (err) {
        console.warn('[GitHubModal] Error downloading asset_tax_article_categories:', err);
      }

      // 5. 보안 계좌 데이터 조회
      try {
        const remoteSec = await syncWithGitHub('download', '_secureAccounts');
        if (remoteSec) {
          localStorage.setItem('_secureAccounts', typeof remoteSec === 'string' ? remoteSec : JSON.stringify(remoteSec));
          results.secureAccounts = true;
        }
      } catch (err) {}

      const hasAnyData = results.assets.length > 0 || results.knowledgeIndustry || results.articles || results.categories;

      if (hasAnyData) {
        setDownloadResults(results);
        window.dispatchEvent(new CustomEvent('app-data-reloaded', { detail: results }));
        showToast('🔑 GitHub 서버 실제 데이터 조회 및 화면 적용 완료!', 'success', true);
      } else {
        showToast('⚠️ GitHub 저장소에 저장된 JSON 데이터가 없습니다.', 'error');
      }
    } catch (e) {
      showToast('동기화 실패: ' + e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncUpload = async () => {
    if (!token || !repo) {
      showToast('GitHub 설준을 먼저 완료해주세요.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      // 1. 자산 데이터
      const yearKey = `assetData_${year}`;
      const data = yearData[year];
      if (data) {
        await syncWithGitHub('upload', yearKey, JSON.stringify(data));
      }

      // 2. 지식산업센터 데이터
      const savedKi = localStorage.getItem('asset_knowledge_industry');
      if (savedKi) {
        await syncWithGitHub('upload', 'asset_knowledge_industry', savedKi);
      }

      // 3. 아티클 및 카테고리 데이터
      const savedArt = localStorage.getItem('asset_tax_articles');
      if (savedArt) {
        await syncWithGitHub('upload', 'asset_tax_articles', savedArt);
      }
      const savedCats = localStorage.getItem('asset_tax_article_categories');
      if (savedCats) {
        await syncWithGitHub('upload', 'asset_tax_article_categories', savedCats);
      }

      showToast('GitHub 서버로 모든 데이터가 저장되었습니다.', 'success', true);
      onClose();
    } catch (e) {
      showToast('동기화 실패: ' + e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">☁️ GitHub 동기화 설정 및 서버 데이터 조회</div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
            GitHub 저장소(`asset/data/*.json`)의 실제 데이터를 실시간 조회하여 화면에 즉시 적용합니다.<br />
            <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--teal)', textDecoration: 'underline' }}>
              GitHub PAT(Personal Access Token)
            </a> 권한: <code>repo</code>
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>GitHub 토큰 (PAT)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showToken ? 'text' : 'password'}
                  className="data-modal-textarea"
                  style={{ minHeight: 'auto', margin: 0, paddingRight: '40px' }}
                  value={token}
                  onChange={e => setToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  style={{
                    position: 'absolute', right: '10px', background: 'none', border: 'none',
                    cursor: 'pointer', fontSize: '1.2rem'
                  }}
                >
                  {showToken ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>저장소 (Repo)</label>
                <input
                  type="text"
                  className="data-modal-textarea"
                  style={{ minHeight: 'auto', margin: 0 }}
                  value={repo}
                  onChange={e => setRepo(e.target.value)}
                  placeholder="uzenkaze/vibe"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>브랜치 (Branch)</label>
                <input
                  type="text"
                  className="data-modal-textarea"
                  style={{ minHeight: 'auto', margin: 0 }}
                  value={branch}
                  onChange={e => setBranch(e.target.value)}
                  placeholder="master"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={e => setAutoSync(e.target.checked)}
                />
                데이터 변경 시 자동 저장 (Auto Sync)
              </label>
            </div>
            
            <div className="divider" style={{ margin: '10px 0' }} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
               <button 
                 className="btn btn-ghost" 
                 style={{ flex: 1, border: '1px solid var(--teal)', color: 'var(--teal)', fontWeight: 800 }} 
                 onClick={handleSyncDownload} 
                 disabled={isSyncing}
               >
                  {isSyncing ? '⏳ 서버 데이터 조회 중...' : '⬇️ 서버 데이터 불러오기'}
               </button>
               <button 
                 className="btn btn-teal" 
                 style={{ flex: 1, fontWeight: 800 }} 
                 onClick={handleSyncUpload} 
                 disabled={isSyncing}
               >
                  {isSyncing ? '⏳ 서버 저장 중...' : '⬆️ 서버로 전체 내보내기'}
               </button>
            </div>

            {/* 서버에서 조회한 실제 데이터 결과 요약 박스 */}
            {downloadResults && (
              <div style={{
                marginTop: '10px',
                padding: '1rem',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '0.82rem'
              }}>
                <div style={{ fontWeight: 800, color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>✅</span> GitHub 서버 실제 데이터 조회 및 화면 적용 완료
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-primary)' }}>
                  {downloadResults.assets.length > 0 && (
                    <div>
                      📊 <strong>자산 관리 데이터:</strong> {downloadResults.assets.map(a => `${a.year}년(${a.monthCount}개월)`).join(', ')}
                    </div>
                  )}
                  {downloadResults.knowledgeIndustry && (
                    <div>
                      🏢 <strong>지식산업센터:</strong> 계약 {downloadResults.knowledgeIndustry.contractCount}건, 대출내역 KB({downloadResults.knowledgeIndustry.kbLoanCount}건) / NH({downloadResults.knowledgeIndustry.nhLoanCount}건)
                    </div>
                  )}
                  {downloadResults.articles && (
                    <div>
                      📑 <strong>세무/절세 아티클:</strong> 실데이터 {downloadResults.articles.count}건
                    </div>
                  )}
                  {downloadResults.categories && (
                    <div>
                      🏷️ <strong>아티클 카테고리:</strong> {downloadResults.categories.list.join(', ')}
                    </div>
                  )}
                  {downloadResults.secureAccounts && (
                    <div>
                      🔐 <strong>보안 계좌 설정:</strong> 동기화 완료
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>닫기</button>
          <button className="btn btn-teal" onClick={handleSave}>설정 저장</button>
        </div>
      </div>
    </div>
  );
}
