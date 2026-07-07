import { useState, useRef } from 'react'
import styles from './Step3Report.module.css'
import CarDiagram from '../components/CarDiagram'
import RealCarDiagram from '../components/RealCarDiagram'

const PART_MAP = {
  '조향계': { label: '조향 장치', color: '#ff3b30' },
  '현가계': { label: '서스펜션 / 현가계', color: '#fa8231' },
  '구동계': { label: '변속기 / 구동계', color: '#45f3ff' },
  '엔진':   { label: '엔진', color: '#fd9644' },
  '제동계': { label: '브레이크', color: '#f7b731' },
  '냉각계': { label: '냉각 시스템', color: '#26de81' },
  '전기계': { label: '전장 시스템', color: '#a29bfe' },
  '외장':   { label: '외장 / 차체', color: '#74b9ff' },
  '내장':   { label: '내장재', color: '#fd79a8' },
  '진단점검': { label: '진단 점검', color: '#a0a8b3' },
  '기타':   { label: '기타', color: '#bef264' },
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth()+1}월 ${d.getDate()}일`
}

export default function Step3Report({
  vehicleInfo,
  repairItems,
  attachedImages,
  onPrev,
  onReset,
  onSave,
  isSaved
}) {
  const reportRef = useRef()
  const [diagramMode, setDiagramMode] = useState('3d') // '3d' | 'real'

  const totalParts = repairItems.reduce((s, it) => s + (Number(it.partsCost) || 0), 0)
  const totalLabor = repairItems.reduce((s, it) => s + (Number(it.laborCost) || 0), 0)
  const totalSupply = totalParts + totalLabor
  const vat = Math.round(totalSupply * 0.1)
  const grandTotal = totalSupply + vat

  const repairedCats = [...new Set(repairItems.map(it => it.category))]

  // Group items by category
  const grouped = PART_MAP
    ? repairedCats.map(cat => ({
        cat,
        color: (PART_MAP[cat] || {}).color || '#bef264',
        label: (PART_MAP[cat] || {}).label || cat,
        items: repairItems.filter(it => it.category === cat)
      }))
    : []

  const handlePrint = () => window.print()

  return (
    <div className={styles.wrapper} ref={reportRef}>
      {/* Actions Bar */}
      <div className={styles.actionsBar} id="reportActions">
        <div className={styles.actionLeft}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onPrev}>
            ← 수정하기
          </button>
          <button className={`${styles.btn} ${styles.btnHome}`} onClick={onReset}>
            🏠 홈으로 (새 보고서)
          </button>
        </div>
        <div className={styles.actionRight}>
          <button className={`${styles.btn} ${styles.btnSave}`} onClick={onSave}>
            {isSaved ? '💾 보고서 수정저장' : '💾 보고서 저장하기'}
          </button>
          <button className={`${styles.btn} ${styles.btnPrint}`} onClick={handlePrint}>
            🖨️ 인쇄 / PDF 저장
          </button>
        </div>
      </div>

      <div className={styles.report}>
        {/* Report Header */}
        <div className={styles.reportHeader}>
          <div className={styles.reportBrand}>🔧 CarRep</div>
          <div className={styles.reportMeta}>
            <h1 className={styles.reportTitle}>차량 정비 보고서</h1>
            <div className={styles.reportSubtitle}>Vehicle Repair Report</div>
          </div>
          <div className={styles.reportDate}>{formatDate(vehicleInfo.repairDate) || new Date().toLocaleDateString('ko-KR')}</div>
        </div>

        {/* Vehicle Info */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>차량 정보</div>
          <div className={styles.vehicleGrid}>
            <div className={styles.vehicleItem}>
              <span className={styles.vehicleKey}>차량</span>
              <span className={styles.vehicleVal}>{vehicleInfo.year}년식 {vehicleInfo.maker} {vehicleInfo.model}</span>
            </div>
            {vehicleInfo.mileage && (
              <div className={styles.vehicleItem}>
                <span className={styles.vehicleKey}>주행거리</span>
                <span className={styles.vehicleVal}>{Number(vehicleInfo.mileage).toLocaleString()} km</span>
              </div>
            )}
            {vehicleInfo.repairDate && (
              <div className={styles.vehicleItem}>
                <span className={styles.vehicleKey}>정비일</span>
                <span className={styles.vehicleVal}>{formatDate(vehicleInfo.repairDate)}</span>
              </div>
            )}
            {vehicleInfo.shopName && (
              <div className={styles.vehicleItem}>
                <span className={styles.vehicleKey}>정비소</span>
                <span className={styles.vehicleVal}>{vehicleInfo.shopName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Diagram + Cost Summary */}
        <div className={styles.diagramRow}>
          {/* Car Diagram */}
          <div className={styles.diagramBox}>
            <div className={styles.sectionHeaderRow}>
              <div className={styles.sectionTitle}>수리 부위 시각화</div>
              <div className={styles.tabToggle} id="diagramTabs">
                <button
                  type="button"
                  className={`${styles.tabBtn} ${diagramMode === '3d' ? styles.tabBtnActive : ''}`}
                  onClick={() => setDiagramMode('3d')}
                >
                  3D 그래픽
                </button>
                <button
                  type="button"
                  className={`${styles.tabBtn} ${diagramMode === 'real' ? styles.tabBtnActive : ''}`}
                  onClick={() => setDiagramMode('real')}
                >
                  실물 사진
                </button>
              </div>
            </div>

            <div className={styles.diagramWrap}>
              {diagramMode === '3d' ? (
                <CarDiagram repairItems={repairItems} vehicleInfo={vehicleInfo} />
              ) : (
                <RealCarDiagram repairItems={repairItems} vehicleInfo={vehicleInfo} attachedImages={attachedImages} />
              )}
            </div>
            {/* Legend */}
            <div className={styles.legend}>
              {repairedCats.map(cat => (
                <div key={cat} className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: (PART_MAP[cat] || {}).color || '#fff' }}/>
                  <span>{(PART_MAP[cat] || {}).label || cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Summary */}
          <div className={styles.costBox}>
            <div className={styles.sectionTitle}>비용 요약</div>

            <div className={styles.costCards}>
              <div className={styles.costCard} style={{ borderColor: 'rgba(69,243,255,0.4)' }}>
                <div className={styles.costIcon}>🔩</div>
                <div className={styles.costLabel}>부품비</div>
                <div className={styles.costValue} style={{ color: '#45f3ff' }}>{totalParts.toLocaleString()}</div>
                <div className={styles.costUnit}>원</div>
              </div>
              <div className={styles.costCard} style={{ borderColor: 'rgba(250,130,49,0.4)' }}>
                <div className={styles.costIcon}>🛠️</div>
                <div className={styles.costLabel}>공임비</div>
                <div className={styles.costValue} style={{ color: '#fa8231' }}>{totalLabor.toLocaleString()}</div>
                <div className={styles.costUnit}>원</div>
              </div>
              <div className={styles.costCard} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <div className={styles.costIcon}>📋</div>
                <div className={styles.costLabel}>VAT (10%)</div>
                <div className={styles.costValue} style={{ color: '#a0a8b3' }}>{vat.toLocaleString()}</div>
                <div className={styles.costUnit}>원</div>
              </div>
            </div>

            <div className={styles.grandTotalBox}>
              <div className={styles.gtLabel}>합계금액</div>
              <div className={styles.gtValue}>{grandTotal.toLocaleString()}</div>
              <div className={styles.gtUnit}>원</div>
            </div>

            {/* Category breakdown */}
            <div className={styles.catBreakdown}>
              <div className={styles.catBreakTitle}>부위별 비용</div>
              {grouped.map(g => {
                const sub = g.items.reduce((s, it) => s + (Number(it.partsCost)||0) + (Number(it.laborCost)||0), 0)
                const pct = totalSupply > 0 ? Math.round((sub / totalSupply) * 100) : 0
                return (
                  <div key={g.cat} className={styles.catRow}>
                    <span className={styles.catDot} style={{ background: g.color }} />
                    <span className={styles.catName}>{g.label}</span>
                    <div className={styles.catBar}>
                      <div className={styles.catBarFill} style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                    <span className={styles.catPct}>{pct}%</span>
                    <span className={styles.catAmt}>{sub.toLocaleString()}원</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Repair Items Table */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>정비 세부 내역</div>
          {grouped.map(g => (
            <div key={g.cat} className={styles.catSection}>
              <div className={styles.catHeader} style={{ borderLeftColor: g.color }}>
                <span className={styles.catHeaderDot} style={{ background: g.color }} />
                {g.label}
                <span className={styles.catHeaderCount}>{g.items.length}건</span>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>항목명</th>
                      <th className={styles.num}>부품비</th>
                      <th className={styles.num}>공임비</th>
                      <th className={styles.num}>소계</th>
                      <th>비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {g.items.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className={styles.num}>{(Number(item.partsCost)||0).toLocaleString()}</td>
                        <td className={styles.num}>{(Number(item.laborCost)||0).toLocaleString()}</td>
                        <td className={`${styles.num} ${styles.subCol}`}>
                          {((Number(item.partsCost)||0) + (Number(item.laborCost)||0)).toLocaleString()}
                        </td>
                        <td className={styles.noteCol}>{item.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Attached Images */}
        {attachedImages.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}>첨부 이미지</div>
            <div className={styles.galleryGrid}>
              {attachedImages.map(img => (
                <div key={img.id} className={styles.galleryItem}>
                  <img src={img.dataUrl} alt={img.name} className={styles.galleryImg} />
                  <div className={styles.galleryName}>{img.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.reportFooter}>
          <span>본 보고서는 CarRep 시스템에 의해 자동 생성되었습니다.</span>
          <span>생성일시: {new Date().toLocaleString('ko-KR')}</span>
        </div>
      </div>
    </div>
  )
}
