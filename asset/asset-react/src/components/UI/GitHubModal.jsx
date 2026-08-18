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
      showToast('GitHub 설정을 먼저 완료해주세요.', 'error');
      return;
    }
    
    setIsSyncing(true);
    try {
      let downloadCount = 0;

      // 1. 자산 데이터
      const yearKey = `assetData_${year}`;
      const data = await syncWithGitHub('download', yearKey);
      if (data) {
        localStorage.setItem(yearKey, JSON.stringify(data));
        await loadYearData(year);
        downloadCount++;
      }

      // 2. 지식산업센터 데이터
      const kiData = await syncWithGitHub('download', 'asset_knowledge_industry');
      if (kiData) {
        localStorage.setItem('asset_knowledge_industry', JSON.stringify(kiData));
        downloadCount++;
      }

      // 3. 아티클 및 카테고리 데이터
      const artData = await syncWithGitHub('download', 'asset_tax_articles');
      if (artData) {
        localStorage.setItem('asset_tax_articles', JSON.stringify(artData));
        downloadCount++;
      }
      const catData = await syncWithGitHub('download', 'asset_tax_article_categories');
      if (catData) {
        localStorage.setItem('asset_tax_article_categories', JSON.stringify(catData));
      }

      if (downloadCount > 0) {
        showToast('GitHub에서 데이터를 성공적으로 불러왔습니다.', 'success');
        onClose();
        // 페이지 새로고침하여 최신 상태 즉시 반영
        window.location.reload();
      } else {
        showToast('GitHub에 저장된 데이터가 없습니다.', 'error');
      }
    } catch (e) {
      showToast('동기화 실패: ' + e.message, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncUpload = async () => {
    if (!token || !repo) {
      showToast('GitHub 설정을 먼저 완료해주세요.', 'error');
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
      <div className="modal-box" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">☁️ GitHub 동기화 설정</div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.2rem', lineHeight: '1.5' }}>
            GitHub API를 통해 데이터를 동기화합니다.<br />
            <a href="https://github.com/settings/tokens" target="_blank" rel="noreferrer" style={{ color: 'var(--teal)', textDecoration: 'underline' }}>
              GitHub PAT(Personal Access Token)
            </a>가 필요합니다. (권한: repo)
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

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '4px' }}>저장소 경로 (Repo)</label>
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
               <button className="btn btn-ghost" style={{ flex: 1 }} onClick={handleSyncDownload} disabled={isSyncing}>
                  {isSyncing ? '동기화 중...' : '⬇️ 불러오기'}
               </button>
               <button className="btn btn-teal" style={{ flex: 1 }} onClick={handleSyncUpload} disabled={isSyncing}>
                  {isSyncing ? '동기화 중...' : '⬆️ 내보내기'}
               </button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--card-border)' }}>
          <button className="btn btn-ghost" onClick={onClose}>취소</button>
          <button className="btn btn-teal" onClick={handleSave}>설정 저장</button>
        </div>
      </div>
    </div>
  );
}
