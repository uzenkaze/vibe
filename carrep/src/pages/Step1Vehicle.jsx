import styles from './Step1Vehicle.module.css'

const CAR_MAKERS = ['현대', '기아', '쉐보레', 'BMW', '벤츠', '아우디', '도요타', '혼다', '닛산', '폭스바겐', '볼보', '포드', '기타']

export default function Step1Vehicle({ vehicleInfo, setVehicleInfo, onNext }) {
  const set = (key, val) => setVehicleInfo(prev => ({ ...prev, [key]: val }))
  const canNext = vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>차량 정보 입력</h1>
        <p className={styles.subtitle}>정비 보고서를 생성할 차량의 기본 정보를 입력하세요.</p>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>🚗</span>
          <span>차량 기본 정보</span>
        </div>

        <div className={styles.grid}>
          <div className={styles.field}>
            <label className={styles.label}>제조사 <span className={styles.req}>*</span></label>
            <select
              className={styles.select}
              value={vehicleInfo.maker}
              onChange={e => set('maker', e.target.value)}
            >
              <option value="">선택하세요</option>
              {CAR_MAKERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>차종 (모델명) <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              placeholder="예: 모하비, 소나타, 그랜저..."
              value={vehicleInfo.model}
              onChange={e => set('model', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>연식 <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              type="number"
              placeholder="예: 2008"
              min="1990"
              max={new Date().getFullYear()}
              value={vehicleInfo.year}
              onChange={e => set('year', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>주행거리 (km)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="예: 150000"
              value={vehicleInfo.mileage}
              onChange={e => set('mileage', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>정비 일자</label>
            <input
              className={styles.input}
              type="date"
              value={vehicleInfo.repairDate}
              onChange={e => set('repairDate', e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>정비소명</label>
            <input
              className={styles.input}
              placeholder="예: 현대자동차 서비스센터"
              value={vehicleInfo.shopName}
              onChange={e => set('shopName', e.target.value)}
            />
          </div>
        </div>
      </div>

      {vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year && (
        <div className={styles.preview}>
          <span className={styles.previewLabel}>입력된 차량</span>
          <span className={styles.previewValue}>
            {vehicleInfo.year}년식 {vehicleInfo.maker} {vehicleInfo.model}
            {vehicleInfo.mileage ? ` · ${Number(vehicleInfo.mileage).toLocaleString()}km` : ''}
          </span>
        </div>
      )}

      <div className={styles.actions}>
        <button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={onNext}
          disabled={!canNext}
        >
          다음 단계: 정비 내역 입력 →
        </button>
      </div>
    </div>
  )
}
