import styles from './BottomNav.module.css'

export default function BottomNav({ activeStep, onGoHome, onGoRepair, onGoRepairList, onOpenFuel, reportCount = 0 }) {
  return (
    <div className={styles.bottomNavContainer}>
      <div className={styles.bottomNav}>
        {/* 홈 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 1 ? styles.active : ''}`}
          onClick={onGoHome}
        >
          <span className={styles.icon}>🏠</span>
          <span className={styles.label}>홈</span>
        </button>

        {/* 정비내역 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 2 ? styles.active : ''}`}
          onClick={onGoRepair}
        >
          <span className={styles.icon}>🔧</span>
          <span className={styles.label}>정비내역</span>
        </button>

        {/* 정비목록 - 페이지로 이동 */}
        <button
          type="button"
          className={`${styles.navItem} ${activeStep === 4 ? styles.active : ''}`}
          onClick={onGoRepairList}
        >
          <span className={styles.iconWrap}>
            <span className={styles.icon}>📋</span>
            {reportCount > 0 && <span className={styles.badge}>{reportCount}</span>}
          </span>
          <span className={styles.label}>정비목록</span>
        </button>

        {/* 주유 */}
        <button
          type="button"
          className={styles.navItem}
          onClick={onOpenFuel}
        >
          <span className={styles.icon}>⛽</span>
          <span className={styles.label}>주유</span>
        </button>
      </div>
    </div>
  )
}
