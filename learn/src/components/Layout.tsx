import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BookOpen, Home, Settings, Database, Sun, Moon } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import SearchBar from './SearchBar';
import Toast from './Toast';

export default function Layout() {
  const { dataSource, theme, toggleTheme } = useStore();
  const location = useLocation();

  const navItems = [
    { to: '/', icon: Home, label: '홈' },
    { to: '/settings', icon: Settings, label: '설정' },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Top Navigation */}
      <header className="sticky top-0 z-[1000] w-full">
        <div className="flex items-center justify-center pt-4 pb-2 px-4">
          <nav className="glass rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl shadow-black/20">
            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2 px-4 py-2 mr-1">
              <BookOpen size={18} className="text-accent" />
              <span className="text-sm font-black tracking-tight gradient-text hidden sm:inline">LearnVault</span>
            </NavLink>

            {/* Nav Items */}
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-white/5'
                  }`
                }
              >
                <item.icon size={14} />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}

            {/* Separator */}
            <div className="w-px h-5 bg-border mx-1" />

            {/* Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Data source badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
              dataSource === 'github'
                ? 'bg-accent-green/10 text-accent-green'
                : dataSource === 'syncing'
                ? 'bg-accent-amber/10 text-accent-amber animate-pulse'
                : 'bg-text-muted/10 text-text-muted'
            }`}>
              <Database size={10} />
              <span>{dataSource === 'github' ? 'GitHub' : dataSource === 'syncing' ? 'Syncing' : 'Local'}</span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 ml-1 rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
              title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </nav>
        </div>

        {/* Mobile search */}
        <div className="md:hidden px-4 pb-2">
          <SearchBar />
        </div>
      </header>

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20" key={location.pathname}>
        <Outlet />
      </main>

      {/* Toast */}
      <Toast />
    </div>
  );
}
