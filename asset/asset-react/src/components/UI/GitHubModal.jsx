import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { getGithubConfig, saveGithubConfig, syncWithGitHub } from '../../utils/github';

export default function GitHubModal({ onClose }) {
  const { showToast, yearData, year, loadYearData, checkGithubConnection } = useApp();
  
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [autoSync, setAutoSync] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const config = getGithubConfig();
    setToken(config.token || '');
    setRepo(config.repo || '');
    setBranch(config.branch || 'main');
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
      const yearKey = `assetData_${year}`;
      const data = await syncWithGitHub('download', yearKey);
      if (data) {
        // Save to local storage and reload
        localStorage.setItem(yearKey, JSON.stringify(data));
        await loadYearData(year);
        showToast('GitHub에서 데이터를 성공적으로 불러왔습니다.', 'success');
        onClose();
      } else {
        showToast('GitHub에 해당 연도의 데이터가 없습니다.', 'error');
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

    const data = yearData[year];
    if (!data) {
      showToast('내보낼 데이터가 없습니다.', 'error');
      return;
    }

    setIsSyncing(true);
    try {
      const yearKey = `assetData_${year}`;
      const success = await syncWithGitHub('upload', yearKey, JSON.stringify(data));
      if (success) {
        showToast('GitHub에 데이터를 성공적으로 저장했습니다.', 'success');
        onClose();
      }
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
                placeholder="username/repository"
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
                placeholder="main"
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
