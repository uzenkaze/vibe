import styles from './BottomNav.module.css'

export default function BottomNav({ activeStep, onGoHome, onGoRepair, onGoRepairList, onGoFuel, reportCount = 0 }) {
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.bottomNav}>
        {/* 홈 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 1 ? styles.active : ''}`}
          onClick={onGoHome}
        >
          <span className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </span>
          <span className={styles.label}>홈</span>
        </button>

        {/* 정비내역 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 2 ? styles.active : ''}`}
          onClick={onGoRepair}
        >
          <span className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </span>
          <span className={styles.label}>정비내역</span>
        </button>

        {/* 정비목록 - 페이지로 이동 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 4 ? styles.active : ''}`}
          onClick={onGoRepairList}
        >
          <span className={styles.iconWrap}>
            <span className={styles.icon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </span>
            {reportCount > 0 && <span className={styles.badge}>{reportCount}</span>}
          </span>
          <span className={styles.label}>정비목록</span>
        </button>

        {/* 주유 - 페이지로 이동 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 5 ? styles.active : ''}`}
          onClick={onGoFuel}
        >
          <span className={styles.icon}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="22" x2="15" y2="22"/><path d="M4 9h10"/><path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/><path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
            </svg>
          </span>
          <span className={styles.label}>주유</span>
        </button>
      </div>
    </div>
  )
}
