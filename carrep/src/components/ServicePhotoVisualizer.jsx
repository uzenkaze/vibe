import React, { useState, useEffect } from 'react'
import styles from './ServicePhotoVisualizer.module.css'

const DEFAULT_PART_PHOTOS = {
  '엔진': {
    url: '/mohave_repair_real_04_engine_1783410132117.png',
    pinX: 52,
    pinY: 38,
    label: '엔진룸 및 흡배기 부위'
  },
  '오일류': {
    url: '/mohave_repair_real_04_engine_1783410132117.png',
    pinX: 48,
    pinY: 42,
    label: '엔진오일 주입구 및 오일 필터 부위'
  },
  '조향계': {
    url: '/front_suspension_steering_1783045711894.png',
    pinX: 35,
    pinY: 38,
    label: '파워스티어링 기어 (오무기어) & 타이로드'
  },
  '현가계': {
    url: '/front_suspension_steering_1783045711894.png',
    pinX: 62,
    pinY: 60,
    label: '프론트 서스펜션 로어암 및 볼조인트'
  },
  '구동계': {
    url: '/transmission_oil_pan_1783045722554.png',
    pinX: 48,
    pinY: 52,
    label: '자동변속기 (미션) 오일팬 부위'
  },
  '제동계': {
    url: '/brake_disc_caliper_clean.png',
    pinX: 50,
    pinY: 50,
    label: '브레이크 디스크 로터 & 캘리퍼 패드 부위'
  },
  '냉각계': {
    url: '/mohave_engine_layout_1783410118006.png',
    pinX: 32,
    pinY: 28,
    label: '라디에이터 및 냉각수 부동액 탱크'
  },
  '전기계': {
    url: '/mohave_engine_layout_1783410118006.png',
    pinX: 75,
    pinY: 35,
    label: '차량 배터리 및 제네레이터 전장부'
  },
  '내장': {
    url: '/mohave_engine_layout_1783410118006.png',
    pinX: 62,
    pinY: 42,
    label: '실내 캐빈 에어컨 필터 장착 부위'
  },
  '진단점검': {
    url: '/mohave_chassis_layout_1783045700836.png',
    pinX: 46,
    pinY: 20,
    label: 'GDS/KDS 컴퓨터 진단 스캐너 점검'
  },
  '외장': {
    url: '/mohave_titanium.png',
    pinX: 50,
    pinY: 50,
    label: '차체 외관 파츠 및 범퍼 교체 부위'
  },
  '기타': {
    url: '/mohave_chassis_layout_1783045700836.png',
    pinX: 50,
    pinY: 50,
    label: '하체 종합 점검 및 기타 수리 부위'
  }
}

function getImagePath(path) {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  const base = import.meta.env.BASE_URL || '/'
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  const cleanBase = base.endsWith('/') ? base : `${base}/`
  return `${cleanBase}${cleanPath}`
}

function getPhotoConfigForItem(item) {
  const name = (item?.name || '').toLowerCase().replace(/\s/g, '')

  // 1. High-priority exact component matching BEFORE broad category checks
  if (name.includes('데후') || name.includes('디퍼런셜') || name.includes('디퍼렌셜') || name.includes('differential')) {
    return {
      url: '/mohave_rear_suspension_1783466979850.png',
      pinX: 50,
      pinY: 65,
      label: '후륜 디퍼런셜 기어 (데후) 오일 주입/드레인 플러그 부위'
    }
  }
  if (name.includes('엔진오일')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 48,
      pinY: 40,
      label: '엔진오일 주입구 및 윤활 유체 부위'
    }
  }
  if (name.includes('미션오일') || name.includes('변속기오일') || name.includes('atf') || name.includes('cvt')) {
    return {
      url: '/transmission_oil_pan_1783045722554.png',
      pinX: 48,
      pinY: 52,
      label: '자동변속기 (미션) 오일팬 및 변속 유체'
    }
  }
  if (name.includes('브레이크오일') || name.includes('브레이크액')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 25,
      pinY: 30,
      label: '브레이크 마스터 실린더 및 오일 리저버'
    }
  }
  if (name.includes('파워오일') || name.includes('파워스티어링오일')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 75,
      pinY: 35,
      label: '파워스티어링 유압 오일 리저버'
    }
  }
  if (name.includes('egr') || name.includes('쿨러호스') || name.includes('쿨러') || name.includes('호스') || name.includes('재순환')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 62,
      pinY: 45,
      label: 'EGR 쿨러 어셈블리 및 배기가스 재순환 쿨런트 호스 결합부'
    }
  }
  if (name.includes('냉각수') || name.includes('부동액')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 32,
      pinY: 28,
      label: '라디에이터 및 냉각수 부동액 탱크'
    }
  }
  if (name.includes('예열플러그') || name.includes('가열플러그') || name.includes('glowplug')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 52,
      pinY: 34,
      label: '디젤 엔진 실린더 헤드 예열플러그 (Glow Plug) & 모듈 결합부'
    }
  }
  if (name.includes('점화플러그') || name.includes('점화코일') || name.includes('sparkplug')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 50,
      pinY: 35,
      label: '가솔린 엔진 실린더 블록 점화플러그 & 고압 코일 어셈블리'
    }
  }
  if (name.includes('인젝터') || name.includes('연료필터') || name.includes('고압펌프')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 45,
      pinY: 36,
      label: '커먼레일 초고압 인젝터 및 연료 분사 시스템'
    }
  }
  if (name.includes('타이밍') || name.includes('겉벨트') || name.includes('팬벨트') || name.includes('텐셔너') || name.includes('베어링')) {
    return {
      url: '/mohave_engine_layout_1783410118006.png',
      pinX: 30,
      pinY: 42,
      label: '엔진 구동 벨트 (V-Ribbed Belt) & 오토 텐셔너 베어링'
    }
  }
  if (name.includes('브레이크') || name.includes('패드') || name.includes('디스크') || name.includes('캘리퍼') || name.includes('라이닝')) {
    return {
      url: '/brake_disc_caliper_clean.png',
      pinX: 50,
      pinY: 50,
      label: '전후륜 브레이크 디스크 로터 & 캘리퍼 패드 제동 장치'
    }
  }
  if (name.includes('에어쇼바') || name.includes('후륜') || name.includes('뒷쇼바') || name.includes('뒷서스')) {
    return {
      url: '/mohave_rear_suspension_1783466979850.png',
      pinX: 50,
      pinY: 42,
      label: '후륜 에어 서스펜션 완충 쇼바'
    }
  }
  if (name.includes('쇼바') || name.includes('로어암') || name.includes('어퍼암') || name.includes('서스펜션') || name.includes('활대')) {
    return {
      url: '/front_suspension_steering_1783045711894.png',
      pinX: 62,
      pinY: 60,
      label: '프론트 서스펜션 로어암 및 쇼바'
    }
  }
  if (name.includes('오무기어') || name.includes('조향') || name.includes('타이로드') || name.includes('스티어링')) {
    return {
      url: '/front_suspension_steering_1783045711894.png',
      pinX: 35,
      pinY: 38,
      label: '파워스티어링 기어 (오무기어) & 타이로드'
    }
  }
  if (name.includes('미션') || name.includes('변속기')) {
    return {
      url: '/mohave_repair_real_03_transmission.png',
      pinX: 48,
      pinY: 52,
      label: '자동변속기 (미션) 오일팬'
    }
  }
  if (name.includes('에어컨') || name.includes('캐빈필터')) {
    return {
      url: '/mohave_repair_real_04_engine_1783410132117.png',
      pinX: 62,
      pinY: 42,
      label: '실내 캐빈 에어컨 필터'
    }
  }
  if (name.includes('배터리') || name.includes('제네레이터')) {
    return {
      url: '/mohave_repair_real_04_engine_1783410132117.png',
      pinX: 75,
      pinY: 35,
      label: '차량 배터리 및 제네레이터 장착부'
    }
  }
  if (name.includes('타이어') || name.includes('휠') || name.includes('얼라이')) {
    return {
      url: '/mohave_repair_real_01_chassis_overview.png',
      pinX: 85,
      pinY: 75,
      label: '휠 타이어 및 하체 얼라인먼트 부위'
    }
  }
  if (name.includes('엔진')) {
    return {
      url: '/mohave_repair_real_04_engine_1783410132117.png',
      pinX: 52,
      pinY: 38,
      label: '엔진룸 정비 부위'
    }
  }

  // 2. Category Fallback
  return DEFAULT_PART_PHOTOS[item.category] || DEFAULT_PART_PHOTOS['기타']
}

export default function ServicePhotoVisualizer({ attachedImages = [], repairItems = [], vehicleInfo }) {
  const [activeImgIdx, setActiveImgIdx] = useState(0)
  const [selectedLabel, setSelectedLabel] = useState(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    setSelectedLabel(null)
  }, [activeImgIdx])

  // Build unified photo gallery: auto generated repair component photos FIRST, then user attached images
  const autoGeneratedPhotos = repairItems.map(item => {
    const config = getPhotoConfigForItem(item)
    return {
      id: `auto-${item.id}`,
      name: `${item.name} (${item.category})`,
      dataUrl: getImagePath(config.url),
      pinX: config.pinX,
      pinY: config.pinY,
      category: item.category,
      item,
      isAutoGenerated: true,
      label: config.label
    }
  })

  const userPhotos = (attachedImages || []).map((img, idx) => ({
    id: img.id || `user-${idx}`,
    name: img.name || `첨부 사진 ${idx + 1}`,
    dataUrl: img.dataUrl || img,
    pinX: 50,
    pinY: 45,
    category: '첨부사진',
    isAutoGenerated: false,
    item: repairItems[idx % (repairItems.length || 1)] || null
  }))

  const allPhotos = [...autoGeneratedPhotos, ...userPhotos]

  if (allPhotos.length === 0) {
    return null
  }

  const currentImgObj = allPhotos[activeImgIdx] || allPhotos[0]
  const currentImgUrl = currentImgObj?.dataUrl
  const matchedItem = currentImgObj?.item || null
  const pinX = currentImgObj?.pinX || 50
  const pinY = currentImgObj?.pinY || 45

  const handlePinClick = () => {
    if (!matchedItem && !currentImgObj) return
    const targetItem = matchedItem || { name: currentImgObj.name, category: currentImgObj.category, partsCost: 0, laborCost: 0 }
    
    if (selectedLabel) {
      setSelectedLabel(null)
    } else {
      setSelectedLabel({
        title: targetItem.name,
        category: targetItem.category,
        cost: (Number(targetItem.partsCost) || 0) + (Number(targetItem.laborCost) || 0),
        desc: targetItem.note || targetItem.details || `수리 항목: ${targetItem.name}\n정비 구분: ${targetItem.category}\n발생 비용: ${((Number(targetItem.partsCost) || 0) + (Number(targetItem.laborCost) || 0)).toLocaleString()}원`
      })
    }
  }

  return (
    <div className={styles.visualizerWrapper}>
      <div className={styles.visualizerHeader}>
        <div className={styles.headerTitle}>
          <span className={styles.headerIcon}>📸</span>
          <span>정비 수리 부위 실사 증빙 및 위치 매핑</span>
        </div>
        <div className={styles.headerBadge}>
          정비 부위 사진 {allPhotos.length}장 등록됨
        </div>
      </div>

      <div className={styles.visualizerContent}>
        <div className={styles.mainImageArea}>
          <div className={styles.viewerCard}>
            <div className={styles.mainImageContainer}>
              <img
                src={currentImgUrl}
                alt={currentImgObj?.name || '정비 사진'}
                className={styles.mainImage}
              />
              <div className={styles.imageScanOverlay} />
              
              {currentImgObj && (
                <div
                  className={`${styles.customHotspot} ${selectedLabel ? styles.hotspotActive : ''}`}
                  style={{ left: `${pinX}%`, top: `${pinY}%` }}
                  onClick={handlePinClick}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                >
                  <div className={styles.pulseRing} />
                  <div className={styles.pulseRingSecondary} />
                  <div className={styles.centerDot} />
                  
                  <div className={`${styles.pinTooltip} ${isHovered ? styles.tooltipVisible : ''}`}>
                    <div className={styles.tooltipName}>{matchedItem?.name || currentImgObj.name}</div>
                    <div className={styles.tooltipSub}>클릭하여 세부 명세 확인</div>
                  </div>
                </div>
              )}

              <div className={styles.imageIndexBadge}>
                {activeImgIdx + 1} / {allPhotos.length}
              </div>
            </div>

            <div className={styles.viewerFooter}>
              <div className={styles.vehicleChip}>
                🚘 {vehicleInfo?.maker} {vehicleInfo?.model} ({vehicleInfo?.year}년식) - {currentImgObj?.name}
              </div>
              <div className={styles.photoTip}>
                💡 사진 속 핀(Pin)에 마우스를 올리거나 클릭하면 부위별 정비 내역을 확인하실 수 있습니다.
              </div>
            </div>
          </div>
        </div>

        <div className={styles.infoArea}>
          <div className={styles.thumbnailCard}>
            <div className={styles.sectionTitle}>📷 정비 부위 사진 목록</div>
            <div className={styles.thumbnailsGrid}>
              {allPhotos.map((photo, idx) => {
                const isActive = idx === activeImgIdx
                return (
                  <button
                    key={photo.id || idx}
                    type="button"
                    className={`${styles.thumbBtn} ${isActive ? styles.thumbActive : ''}`}
                    onClick={() => setActiveImgIdx(idx)}
                  >
                    <img src={photo.dataUrl} alt={photo.name} className={styles.thumbImage} />
                    <div className={styles.thumbOverlay}>
                      <span className={styles.thumbIndex}>{idx + 1}</span>
                      <span className={styles.thumbTag}>{photo.category}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className={styles.detailCard}>
            <div className={styles.sectionTitle}>🔧 선택된 정비 부위 명세</div>
            {matchedItem ? (
              <div className={styles.matchedInfoBox}>
                <div className={styles.matchedHeader}>
                  <div className={styles.categoryBadge} data-category={matchedItem.category}>
                    {matchedItem.category}
                  </div>
                  <div className={styles.repairedTitle}>{matchedItem.name}</div>
                </div>
                
                <div className={styles.specTable}>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>🛠️ 정비 항목명</span>
                    <span className={styles.specValue}>{matchedItem.name}</span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>💰 공임 및 부품비</span>
                    <span className={styles.specValueHighlight}>
                      {((Number(matchedItem.partsCost) || 0) + (Number(matchedItem.laborCost) || 0)).toLocaleString()}원
                    </span>
                  </div>
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>📂 정비 분류</span>
                    <span className={styles.specValue}>{matchedItem.category || '일반정비'}</span>
                  </div>
                </div>

                <div className={styles.descBox}>
                  <div className={styles.descLabel}>📋 정비 소견 및 비고</div>
                  <p className={styles.descText}>
                    {matchedItem.note || matchedItem.details || '해당 부위의 정밀 점검 및 교환 수리가 수행되었으며, 정상 작동 상태를 확인하였습니다.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className={styles.emptyInfo}>
                <p>선택된 정비 부위 항목 정보가 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedLabel && (
        <div className={styles.floatingOverlayCard}>
          <div className={styles.overlayHeader}>
            <span className={styles.overlayIcon}>📌</span>
            <span>정비 실사 세부 증빙카드</span>
            <button className={styles.closeOverlayBtn} onClick={() => setSelectedLabel(null)}>✕</button>
          </div>
          <div className={styles.overlayBody}>
            <div className={styles.overlayTitle}>{selectedLabel.title}</div>
            <div className={styles.overlayMeta}>분류: {selectedLabel.category} | 총 비용: {selectedLabel.cost.toLocaleString()}원</div>
            <hr className={styles.overlayDivider} />
            <div className={styles.overlayDesc}>
              {selectedLabel.desc.split('\n').map((line, i) => (
                <p key={i} className={styles.overlayLine}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

