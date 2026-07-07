import styles from './AppLayout.module.css'

const steps = [
  { num: 1, label: '차량 정보' },
  { num: 2, label: '정비 내역' },
  { num: 3, label: '보고서' },
]

export default function AppLayout({ step, goToStep, onOpenSetting, onOpenMyCar, children }) {
  return (
    <div className={styles.shell}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔧</span>
          <span className={styles.logoText}>Car<span className={styles.logoAccent}>Rep</span></span>
        </div>
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
            className={styles.settingBtn} 
            onClick={onOpenMyCar}
            title="내 차량 정보 등록 및 관리"
          >
            🚗 내차 정보관리
          </button>
          <button 
            type="button" 
            className={styles.settingBtn} 
            onClick={onOpenSetting}
            title="GitHub Personal Access Token 설정"
          >
            ⚙️ GitHub 설정
          </button>
          <span className={styles.badge}>차량 정비 보고서</span>
        </div>
      </header>

      {/* Content */}
      <main className={styles.main}>
        {children}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>CarRep © 2024 — 차량 정비 내역 시각화 플랫폼</span>
      </footer>
    </div>
  )
}
