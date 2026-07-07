import { useRef } from 'react'
import styles from './Step1Vehicle.module.css'

const CAR_MAKERS = ['현대', '기아', '쉐보레', 'BMW', '벤츠', '아우디', '도요타', '혼다', '닛산', '폭스바겐', '볼보', '포드', '기타']

export default function Step1Vehicle({
  vehicleInfo,
  setVehicleInfo,
  reports = [],
  myCar,
  dbStatus = 'offline',
  onSaveMyCar,
  onSelectReport,
  onEditReport,
  onDeleteReport,
  onNext
}) {
  const set = (key, val) => setVehicleInfo(prev => ({ ...prev, [key]: val }))
  const canNext = vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year
  const dateInputRef = useRef(null)

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker()
      } else {
        dateInputRef.current.focus()
      }
    }
  }

  const handleLoadMyCar = () => {
    if (myCar) {
      setVehicleInfo(prev => ({
        ...prev,
        maker: myCar.maker || '',
        model: myCar.model || '',
        year: myCar.year || '',
        mileage: myCar.mileage || ''
      }))
    }
  }

  const isFormFilledForMyCar = vehicleInfo.maker && vehicleInfo.model && vehicleInfo.year

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>차량 정보 입력</h1>
          {(dbStatus === 'local' || dbStatus === 'cloud') ? (
            <span className={`${styles.badge} ${styles.badgeSqlite}`} title="GitHub 동기화 및 데이터 저장이 정상적으로 연결되었습니다.">
              🟢 GitHub 데이터 연결
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeLocal}`} title="GitHub 데이터 서버에 연결할 수 없습니다. 우측 상단의 [GitHub 설정]에서 토큰을 입력해 권한을 활성화하세요.">
              🔴 GitHub 데이터 미연결
            </span>
          )}
        </div>
        <p className={styles.subtitle}>정비 보고서를 생성할 차량의 기본 정보를 입력하거나, 이전 정비 보고서 목록을 선택하세요.</p>
      </div>

      <div className={styles.mainLayout}>
        <div className={styles.formSection}>
          <div className={styles.card}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🚗</span>
                <span>차량 기본 정보</span>
              </div>
              {myCar && (
                <button
                  type="button"
                  className={styles.loadMyCarBtn}
                  onClick={handleLoadMyCar}
                  title={`${myCar.maker} ${myCar.model} 불러오기`}
                >
                  🚗 내 차량 불러오기
                </button>
              )}
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
                <div className={styles.dateContainer}>
                  <input
                    ref={dateInputRef}
                    className={`${styles.input} ${styles.dateInput}`}
                    type="date"
                    value={vehicleInfo.repairDate}
                    onChange={e => set('repairDate', e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.calendarBtn}
                    onClick={handleCalendarClick}
                    title="달력 열기"
                  >
                    📅
                  </button>
                </div>
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

            {isFormFilledForMyCar && (
              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.registerMyCarBtn}
                  onClick={() => onSaveMyCar(vehicleInfo)}
                >
                  💾 현재 정보를 '내 차량'으로 등록
                </button>
              </div>
            )}
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

        {reports && reports.length > 0 && (
          <div className={styles.reportsSection}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📋</span>
              <span>저장된 정비 보고서 목록 ({reports.length}건)</span>
            </div>
            <div className={styles.reportList}>
              {reports.map(r => {
                const total = r.repairItems.reduce((sum, item) => sum + (Number(item.partsCost) || 0) + (Number(item.laborCost) || 0), 0)
                const vat = Math.round(total * 0.1)
                const grandTotal = total + vat
                return (
                  <div key={r.id} className={styles.reportItem} onClick={() => onSelectReport(r)}>
                    <div className={styles.reportItemMeta}>
                      <span className={styles.reportItemTitle}>
                        {r.vehicleInfo.year}년 {r.vehicleInfo.maker} {r.vehicleInfo.model}
                      </span>
                      <span className={styles.reportItemDate}>
                        {r.vehicleInfo.repairDate ? `${r.vehicleInfo.repairDate} 정비` : new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.reportItemPriceRow}>
                      <span className={styles.reportItemPrice}>{grandTotal.toLocaleString()}원</span>
                      <button
                        type="button"
                        className={styles.editReportBtn}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditReport(r)
                        }}
                        title="보고서 수정"
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className={styles.deleteReportBtn}
                        onClick={(e) => onDeleteReport(r.id, e)}
                        title="보고서 삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

