import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Upload, Eye, EyeOff, GitBranch, RefreshCw, HardDrive, Settings } from 'lucide-react';
import { useStore } from '../hooks/useStore';

interface SettingCardProps {
  title: string;
  description?: string;
  icon: React.ReactNode;
  accentColor?: string;
  children: React.ReactNode;
}

function SettingCard({ title, description, icon, accentColor = '#6366f1', children }: SettingCardProps) {
  return (
    <div
      className="rounded-3xl overflow-hidden animate-slide-up"
      style={{
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}
    >
      {/* Card header accent */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: `${accentColor}20` }}>
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <div>
          <h2 className="text-sm font-black text-text-primary">{title}</h2>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

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

  const inputClass = "w-full bg-bg-secondary border border-border rounded-2xl px-4 py-3 text-sm text-text-primary outline-none focus:border-accent/50 transition-colors";
  const labelClass = "block text-xs font-bold text-text-muted uppercase tracking-wider mb-2";

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors mb-6">
          <ArrowLeft size={14} />
          <span>홈으로</span>
        </button>

        {/* Hero */}
        <div className="rounded-3xl p-8 mb-2 relative overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #6366f1, #4f46e5)',
            boxShadow: '0 12px 40px rgba(99,102,241,0.35)',
          }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 55%)' }} />
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-15"
            style={{ background: 'rgba(255,255,255,0.5)' }} />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
              <Settings size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">설정</h1>
              <p className="text-sm text-white/70 mt-0.5">GitHub 동기화 및 데이터 관리</p>
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Settings */}
      <SettingCard
        title="GitHub 동기화 설정"
        description="데이터를 GitHub 저장소에 안전하게 백업합니다"
        icon={<GitBranch size={18} />}
        accentColor="#6366f1"
      >
        <div>
          <label className={labelClass}>Personal Access Token</label>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxx"
              className={inputClass + ' pr-12 font-mono'}
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
            <label className={labelClass}>Repository</label>
            <input type="text" value={repo} onChange={e => setRepo(e.target.value)} placeholder="owner/repo" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Branch</label>
            <input type="text" value={branch} onChange={e => setBranch(e.target.value)} placeholder="main" className={inputClass} />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-2xl hover:bg-bg-hover transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={e => setAutoSync(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-11 h-6 rounded-full transition-all"
              style={{ background: autoSync ? '#6366f1' : 'var(--color-border)' }}
            >
              <div
                className="w-4 h-4 bg-white rounded-full shadow absolute top-1 transition-all"
                style={{ left: autoSync ? '24px' : '4px' }}
              />
            </div>
          </div>
          <div>
            <span className="text-sm font-semibold text-text-primary">자동 동기화</span>
            <p className="text-xs text-text-muted">데이터 변경 시 GitHub에 자동 업로드</p>
          </div>
        </label>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl text-sm font-bold text-white transition-all shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', boxShadow: '0 8px 24px rgba(99,102,241,0.35)' }}
        >
          설정 저장
        </button>
      </SettingCard>

      {/* Sync Actions */}
      <SettingCard
        title="수동 동기화"
        description={`현재 데이터 소스: ${dataSource === 'github' ? 'GitHub' : dataSource === 'syncing' ? 'Syncing...' : 'Local Storage'}`}
        icon={<RefreshCw size={18} />}
        accentColor="#06b6d4"
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSyncDown}
            disabled={isSyncing || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(6,182,212,0.1)',
              color: '#06b6d4',
              border: '1px solid rgba(6,182,212,0.25)',
            }}
          >
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
            GitHub → Local
          </button>
          <button
            onClick={handleSyncUp}
            disabled={isSyncing || !token}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'rgba(6,182,212,0.1)',
              color: '#06b6d4',
              border: '1px solid rgba(6,182,212,0.25)',
            }}
          >
            {isSyncing ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
            Local → GitHub
          </button>
        </div>
      </SettingCard>

      {/* Data Management */}
      <SettingCard
        title="데이터 관리"
        description="JSON 파일로 데이터를 백업하거나 복원합니다"
        icon={<HardDrive size={18} />}
        accentColor="#f97316"
      >
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(249,115,22,0.1)',
              color: '#f97316',
              border: '1px solid rgba(249,115,22,0.25)',
            }}
          >
            <Download size={14} />
            JSON 내보내기
          </button>
          <button
            onClick={handleImport}
            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(249,115,22,0.1)',
              color: '#f97316',
              border: '1px solid rgba(249,115,22,0.25)',
            }}
          >
            <Upload size={14} />
            JSON 가져오기
          </button>
        </div>
      </SettingCard>
    </div>
  );
}
