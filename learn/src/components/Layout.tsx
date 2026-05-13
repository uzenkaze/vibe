import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, Home, Settings, Database, Sun, Moon, FileText, StickyNote, GitBranch } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from './SearchBar';
import Toast from './Toast';

export default function Layout() {
  const { dataSource, theme, toggleTheme } = useStore();

  const navItems = [
    { to: '/', icon: Home, label: '홈', end: true },
    { to: '/docs', icon: FileText, label: '문서', end: false },
    { to: '/mindmap', icon: GitBranch, label: '마인드맵', end: false },
    { to: '/memos', icon: StickyNote, label: '메모', end: false },
    { to: '/settings', icon: Settings, label: '설정', end: false },
  ];

  const syncColor =
    dataSource === 'github' ? '#10b981' :
      dataSource === 'syncing' ? '#f59e0b' :
        '#ef4444'; // Vivid red for local alert
  const syncBg =
    dataSource === 'github' ? 'rgba(16,185,129,0.12)' :
      dataSource === 'syncing' ? 'rgba(245,158,11,0.12)' :
        'rgba(239,68,68,0.15)'; // Reddish background
  const syncLabel =
    dataSource === 'github' ? 'GitHub' :
      dataSource === 'syncing' ? 'Syncing…' :
        'Local';

  return (
    <div className="min-h-screen bg-bg-primary">

      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-[1000] w-full">
        <div className="flex items-center justify-center pt-3 pb-2 px-2 sm:px-4">
          <nav
            className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-1.5 shadow-2xl max-w-full overflow-hidden"
            style={{
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--glass-border)',
              borderRadius: '999px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 1px 0 rgba(255,255,255,0.06) inset',
            }}
          >
            {/* ── Logo ── */}
            <NavLink to="/" className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-all hover:bg-white/5">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}
              >
                <BookOpen size={13} className="text-white" />
              </div>
              <span
                className="text-sm font-black tracking-tight hidden lg:inline"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                Han's Knowledge
              </span>
            </NavLink>

            {/* ── Nav Items ── */}
            <div className="flex items-center">
              {navItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${isActive
                      ? 'text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                    }`
                  }
                  style={({ isActive }) => isActive ? {
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    boxShadow: '0 4px 14px rgba(139,92,246,0.4)',
                  } : {}}
                >
                  <item.icon size={13} />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </div>

            {/* ── Separator ── */}
            <div className="hidden sm:block w-px h-5 mx-1" style={{ background: 'var(--glass-border)' }} />

            {/* ── Search ── */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* ── Separator ── */}
            <div className="w-px h-5 mx-0.5 sm:mx-1" style={{ background: 'var(--glass-border)' }} />

            {/* ── Data source badge ── */}
            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                dataSource === 'syncing' ? 'animate-pulse' : 
                (dataSource === 'local' || !dataSource ? 'animate-alert-blink shadow-[0_0_12px_rgba(239,68,68,0.3)]' : '')
              }`}
              style={{ background: syncBg, color: syncColor }}
              title={`현재 상태: ${syncLabel}`}
            >
              <Database size={10} className={dataSource === 'syncing' ? 'animate-spin' : ''} />
              <span className="sm:hidden">{syncLabel.charAt(0)}</span>
              <span className="hidden sm:inline">{syncLabel}</span>
            </div>

            {/* ── Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-0.5 rounded-full transition-all hover:scale-110"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.12)'; (e.currentTarget as HTMLButtonElement).style.color = '#8b5cf6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-text-muted)'; }}
              title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden flex justify-center px-6 pb-3 mt-1">
          <div className="w-full max-w-[400px]">
            <SearchBar />
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="w-full max-w-[1100px] mx-auto px-0 sm:px-[4%] pb-20 overflow-x-hidden">
        <Outlet />
      </main>

      {/* Toast */}
      <Toast />
    </div>
  );
}
