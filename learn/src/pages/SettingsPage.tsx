import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../hooks/useStore';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { ghConfig, updateGhConfig, syncDown, syncUp, dataSource, showToast } = useStore();

  const [token, setToken] = useState(ghConfig.token);
  const [repo, setRepo] = useState(ghConfig.repo);
  const [branch, setBranch] = useState(ghConfig.branch);
  const [autoSync, setAutoSync] = useState(ghConfig.autoSync);
  const [showToken, setShowToken] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSave = () => {
    updateGhConfig({ token: token.trim(), repo: repo.trim(), branch: branch.trim(), autoSync });
  };

  const handleSyncDown = async () => {
    setIsSyncing(true);
    await syncDown();
    setIsSyncing(false);
  };

  const handleSyncUp = async () => {
    setIsSyncing(true);
    await syncUp();
    setIsSyncing(false);
  };

  const handleExport = () => {
    const data = localStorage.getItem('learnVaultData');
    if (!data) { showToast('내보낼 데이터가 없습니다'); return; }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `learnvault-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('데이터를 내보냈습니다');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (data.categories && data.articles) {
            localStorage.setItem('learnVaultData', JSON.stringify(data));
            showToast('데이터를 가져왔습니다. 새로고침합니다.');
            setTimeout(() => window.location.reload(), 1000);
          } else {
            showToast('올바른 형식의 데이터가 아닙니다');
          }
        } catch {
          showToast('파일 파싱에 실패했습니다');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs text-text-muted hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>홈으로</span>
        </button>
        <h1 className="text-2xl font-black text-text-primary">설정</h1>
        <p className="text-sm text-text-muted mt-1">GitHub 동기화 및 데이터 관리</p>
      </div>

      {/* GitHub Settings */}
      <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-5 animate-slide-up">
        <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
          GitHub 동기화 설정
        </h2>

        <div>
          <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Personal Access Token</label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 pr-12 text-sm text-text-primary outline-none focus:border-accent transition-colors font-mono"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Repository</label>
            <input
              type="text"
              value={repo}
              onChange={e => setRepo(e.target.value)}
              placeholder="owner/repo"
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Branch</label>
            <input
              type="text"
              value={branch}
              onChange={e => setBranch(e.target.value)}
              placeholder="main"
              className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoSync}
            onChange={e => setAutoSync(e.target.checked)}
            className="w-4 h-4 rounded accent-accent"
          />
          <span className="text-sm text-text-secondary">자동 동기화 (데이터 변경 시 자동 업로드)</span>
        </label>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-sm font-bold bg-accent hover:bg-accent-hover text-white transition-all"
        >
          설정 저장
        </button>
      </div>

      {/* Sync Actions */}
      <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-base font-bold text-text-primary">수동 동기화</h2>
        <p className="text-xs text-text-muted">현재 데이터 소스: <span className={`font-bold ${dataSource === 'github' ? 'text-accent-green' : 'text-text-secondary'}`}>{dataSource === 'github' ? 'GitHub' : dataSource === 'syncing' ? 'Syncing...' : 'Local Storage'}</span></p>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSyncDown}
            disabled={isSyncing || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-border hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-primary"
          >
            <Download size={14} />
            GitHub → Local
          </button>
          <button
            onClick={handleSyncUp}
            disabled={isSyncing || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-border hover:bg-bg-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all text-text-primary"
          >
            <Upload size={14} />
            Local → GitHub
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="rounded-2xl border border-border bg-bg-card p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-base font-bold text-text-primary">데이터 관리</h2>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="py-3 rounded-xl text-sm font-semibold border border-border hover:bg-bg-hover transition-all text-text-primary"
          >
            📦 JSON 내보내기
          </button>
          <button
            onClick={handleImport}
            className="py-3 rounded-xl text-sm font-semibold border border-border hover:bg-bg-hover transition-all text-text-primary"
          >
            📥 JSON 가져오기
          </button>
        </div>
      </div>
    </div>
  );
}
