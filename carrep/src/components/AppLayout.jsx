import { useState, useEffect } from 'react'
import styles from './AppLayout.module.css'

const steps = [
  { num: 1, label: '차량 정보' },
  { num: 2, label: '정비 내역' },
  { num: 3, label: '보고서' },
]

export default function AppLayout({ step, goToStep, dbStatus, githubToken, currentUser, onGoAuth, onOpenSetting, onOpenMyCar, onLogoClick, children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('carrep_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('carrep_theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const isGithubConnected = dbStatus === 'local' || dbStatus === 'cloud' || !!githubToken

  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <button
          type="button"
          className={styles.logo}
          onClick={onLogoClick}
          title="홈으로 이동"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span className={styles.logoIcon}>🔧</span>
          <span className={styles.logoText}>Car<span className={styles.logoAccent}>Rep</span></span>
        </button>

        <div className={styles.stepper}>
          {steps.map((s, i) => (
            <div key={s.num} className={styles.stepWrapper}>
              <button
                className={`${styles.stepBtn} ${step === s.num ? styles.active : ''} ${step > s.num ? styles.done : ''}`}
                onClick={() => step > s.num && goToStep(s.num)}
                disabled={step < s.num}
              >
                {step > s.num ? '✓' : s.num}
              </button>
              <span className={`${styles.stepLabel} ${step === s.num ? styles.activeLabel : ''}`}>{s.label}</span>
              {i < steps.length - 1 && (
                <div className={`${styles.stepLine} ${step > s.num ? styles.lineDone : ''}`} />
              )}
            </div>
          ))}
        </div>

        <div className={styles.headerRight}>
          <button
            type="button"
            className={styles.iconCircleBtn}
            title="알림"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
          </button>

          <button
            type="button"
            className={styles.themeBtn}
            onClick={toggleTheme}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <button
            type="button"
            className={styles.settingBtn}
            onClick={onOpenMyCar}
            title="내 차량 정보 등록 및 관리"
          >
            🚗 <span className={styles.btnLabel}>내차 정보</span>
          </button>

          <button
            type="button"
            className={`${styles.githubIconBtn} ${isGithubConnected ? styles.githubConnected : styles.githubDisconnected}`}
            onClick={onOpenSetting}
            title={isGithubConnected ? "GitHub 연결됨 (클릭하여 설정)" : "GitHub 미연결 (클릭하여 설정)"}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            <span className={styles.statusDot} />
          </button>

          {/* 유저 아바타 버튼 (로그인 한 경우 캐릭터 이미지 렌더링, 클릭 시 로그인 페이지 이동) */}
          <div
            className={styles.userAvatarBtn}
            onClick={onGoAuth}
            title={currentUser ? `${currentUser.name || '사용자'} 프로필 (클릭하여 관리)` : "로그인 / 회원가입"}
          >
            {currentUser ? (
              <img
                src={`${import.meta.env.BASE_URL}${currentUser.avatar || 'avatars/m1.jpg'}`}
                alt="사용자 프로필 캐릭터"
                className={styles.avatarImgIcon}
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        {children}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>CarRep © 2025 — 차량 정비 내역 시각화 플랫폼</span>
      </footer>
    </div>
  )
}
