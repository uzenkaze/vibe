import { useState, useRef, useEffect } from 'react'
import styles from './Step2Repairs.module.css'
import FormattedNumberInput from '../components/FormattedNumberInput'

const CATEGORIES = ['엔진', '오일류', '조향계', '현가계', '구동계', '제동계', '냉각계', '전기계', '외장', '내장', '진단점검', '기타']

const CATEGORY_DETAILS = {
  '엔진': {
    label: '엔진 (구동 핵심 부품)',
    desc: '타이밍 벨트/체인, 엔진 마운트(미미), 점화플러그, 에어필터, 연료필터, 가스켓 교환, 흡기/배기 밸브 정비 등'
  },
  '오일류': {
    label: '오일류 (케미컬 및 각종 액체류)',
    desc: '엔진오일 교체, 미션오일, 브레이크 액(오일), 파워스티어링 오일, 디퍼런셜 기어 오일, 냉각수(부동액) 교환 및 보충'
  },
  '조향계': {
    label: '조향계 (핸들 및 방향 조절)',
    desc: '파워스티어링 기어/펌프(오무기어), 타이로드 엔드, 스티어링 휠 링키지 등 바퀴 방향 조절 부위'
  },
  '현가계': {
    label: '현가계 (서스펜션 및 바퀴 충격완화)',
    desc: '로어암, 어퍼암, 활대링크, 볼조인트, 쇼크업소버(쇼바), 스프링, 하부암 어셈블리 등 승차감 관련 하체 부품'
  },
  '구동계': {
    label: '구동계 (변속기 및 미션 동력전달)',
    desc: '자동/수동 변속기(미션) 기어 조절부, 변속기 오일팬, 등속조인트, 드라이브샤프트, 클러치 등 바퀴 구동 부위'
  },
  '제동계': {
    label: '제동계 (브레이크 및 멈춤 장치)',
    desc: '브레이크 패드/디스크 로터 교체, 브레이크 캘리퍼, 드럼 라이닝 등 제동 관련 핵심 부품'
  },
  '냉각계': {
    label: '냉각계 (엔진 열 식힘 장치)',
    desc: '라디에이터 교환, 워터펌프, 냉각 팬, 서모스탯 등 냉각수 라인 및 엔진 온도 조절 장치'
  },
  '전기계': {
    label: '전기계 (배터리 및 전장 기기)',
    desc: '배터리 교체, 제네레이터(발전기), 시동 모터, 전구류(헤드램프/테일램프), 퓨즈, 경음기 등 전장 부품'
  },
  '외장': {
    label: '외장 (차체 외관 및 판금)',
    desc: '앞/뒤 범퍼 교체, 사이드 미러, 도어/본넷 도색, 유리창 교환, 썬팅, 와이퍼 블레이드 등 외부 파츠'
  },
  '내장': {
    label: '내장 (실내 공간 및 에어컨 필터)',
    desc: '캐빈 에어컨 필터 교체, 가죽 시트 복원, 실내 매트, 블랙박스/내비게이션 장착 등 내부 파츠'
  },
  '진단점검': {
    label: '진단점검 (스캐너 검사 및 공임 점검)',
    desc: 'GDS/KDS 컴퓨터 스캔 진단 점검, 휠 얼라이먼트 조정, 정기 종합 검사 대행 등 진단 분석 공임'
  },
  '기타': {
    label: '기타 정비 가이드',
    desc: '해당하지 않는 가벼운 소모품 정비, 엔진룸 크리닝, 실내 탈취 작업 등'
  }
}

const EMPTY_ITEM = {
  id: '',
  name: '',
  category: '기타',
  partsCost: '',
  laborCost: '',
  repairDate: new Date().toISOString().split('T')[0],
  note: ''
}

function newItem() {
  return { ...EMPTY_ITEM, id: Date.now() + Math.random() }
}

// ────────────────────────────────────────────────────
// 자동 카테고리 추론 키워드 맵
// 가장 앞에 위치한 카테고리가 우선순위를 가집니다.
// ────────────────────────────────────────────────────
const KEYWORD_CATEGORY_MAP = [
  { category: '엔진',    keywords: ['타이밍', '점화플러그', '에어필터', '에어 필터', '연료필터', '연료 필터', '가스켓', '엔진마운트', '엔진 마운트', '미미', '흡기', '배기', '밸브', '인젝터', '스로틀', '터보', '엔진오버홀', '매니폴드', '캠샤프트', '피스톤', '크랭크'] },
  { category: '오일류',  keywords: ['엔진오일', '엔진 오일', '미션오일', '미션 오일', '변속기오일', '변속기 오일', '브레이크오일', '브레이크 오일', '브레이크액', '파워오일', '파워스티어링오일', '디퍼런셜', '오일교체', '오일 교체', '부동액', '냉각수', '워셔액', 'atf', 'cvt오일', 'cvt 오일', '기어오일'] },
  { category: '조향계',  keywords: ['파워스티어링', '파워 스티어링', '스티어링', '타이로드', '타이 로드', '오무기어', '조향기어', '조향 기어', '볼조인트', '볼 조인트'] },
  { category: '현가계',  keywords: ['쇼바', '쇼크업소버', '쇼크 업소버', '스트럿', '서스펜션', '스프링', '로어암', '로어 암', '어퍼암', '어퍼 암', '활대링크', '활대 링크', '스태빌라이저', '부싱', '하체', '얼라인먼트', '휠얼라인', '휠 얼라인', '에어쇼바', '에어 쇼바'] },
  { category: '구동계',  keywords: ['변속기', '미션', '등속조인트', '등속 조인트', '드라이브샤프트', '드라이브 샤프트', '클러치', '토크컨버터', '트랜스퍼', '디퍼렌셜', '프로펠러샤프트', '프로펠러 샤프트', 'cvt', 'dct', 'dcv'] },
  { category: '제동계',  keywords: ['브레이크패드', '브레이크 패드', '디스크로터', '디스크 로터', '브레이크디스크', '브레이크 디스크', '캘리퍼', '드럼', '라이닝', 'abs', '핸드브레이크', '주차브레이크'] },
  { category: '냉각계',  keywords: ['라디에이터', '워터펌프', '워터 펌프', '냉각팬', '냉각 팬', '서모스탯', '호스', '라디에이터캡', '냉각장치'] },
  { category: '전기계',  keywords: ['배터리', '배터리 교체', '발전기', '제네레이터', '시동모터', '시동 모터', '스타터', '전구', '헤드램프', '헤드라이트', '테일램프', '퓨즈', '경음기', '혼', '와이어링', '전장', '전기', 'obd', 'ecu', 'abs센서', 'abs 센서', '에어컨컴프레서', '에어컨 컴프레서', '에어백'] },
  { category: '외장',    keywords: ['범퍼', '도색', '판금', '사이드미러', '사이드 미러', '도어', '본넷', '유리', '유리창', '썬팅', '와이퍼', '블레이드', '외장', '차체', '펜더', '트렁크'] },
  { category: '내장',    keywords: ['에어컨필터', '에어컨 필터', '캐빈필터', '캐빈 필터', '실내', '인테리어', '시트', '매트', '블랙박스', '내비게이션', '룸미러', '내장'] },
  { category: '진단점검', keywords: ['진단', '스캔', 'gds', 'kds', '점검', '얼라인먼트 조정', '종합검사', '검사'] },
]

function detectCategory(name) {
  if (!name || name.trim().length === 0) return null
  const lower = name.toLowerCase().replace(/\s/g, '')
  for (const entry of KEYWORD_CATEGORY_MAP) {
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase().replace(/\s/g, ''))) {
        return entry.category
      }
    }
  }
  return null
}

// ── Dynamic OCR Engine Loader ──────────────────────
function loadTesseract() {
  return new Promise((resolve, reject) => {
    if (window.Tesseract) return resolve(window.Tesseract)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
    script.onload = () => resolve(window.Tesseract)
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

// ── 텍스트/파일명 정비 항목 및 금액 자동 추론/추출 파서 ──
function parseTextToRepairItems(text, fileName = '') {
  const items = []
  const lines = text ? text.split(/\r?\n/) : []

  for (const line of lines) {
    const cleanLine = line.trim()
    if (!cleanLine || cleanLine.length < 2) continue

    const category = detectCategory(cleanLine)
    if (category) {
      // 금액 숫자 매칭 (예: 50,000 또는 50000)
      const numberMatches = cleanLine.match(/(\d{1,3}(?:,\d{3})+|\d{4,7})\s*원?/g) || []
      const numbers = numberMatches.map(m => parseInt(m.replace(/[^0-9]/g, ''), 10))

      let partsCost = ''
      let laborCost = ''
      if (numbers.length >= 2) {
        partsCost = String(numbers[0])
        laborCost = String(numbers[1])
      } else if (numbers.length === 1) {
        if (cleanLine.includes('공임')) {
          laborCost = String(numbers[0])
        } else {
          partsCost = String(numbers[0])
        }
      }

      let itemName = cleanLine.replace(/[\d,]+원?/g, '').replace(/^[-*•\d.\s]+/, '').trim()
      if (!itemName) itemName = cleanLine

      items.push({
        id: Date.now() + Math.random(),
        name: itemName,
        category,
        partsCost,
        laborCost,
        note: `[자동 추출] ${fileName ? fileName : '첨부 문서'}`
      })
    }
  }

  // 파일명에서 키워드 추출 시도
  if (items.length === 0 && fileName) {
    const fnCategory = detectCategory(fileName)
    const fnName = fileName.replace(/\.[^/.]+$/, '').trim()
    if (fnCategory || fnName) {
      items.push({
        id: Date.now() + Math.random(),
        name: fnCategory ? `${fnCategory} 정비 (${fnName})` : `[첨부 파일] ${fnName}`,
        category: fnCategory || '기타',
        partsCost: '',
        laborCost: '',
        note: `[파일 첨부 자동 등록] ${fileName}`
      })
    }
  }

  // 폴백 기본 등록 보장
  if (items.length === 0) {
    const fallbackName = fileName ? `[첨부] ${fileName.replace(/\.[^/.]+$/, '')}` : '[첨부 파일] 정비내역'
    items.push({
      id: Date.now() + Math.random(),
      name: fallbackName,
      category: '기타',
      partsCost: '',
      laborCost: '',
      note: '첨부된 파일/이미지 정비내역'
    })
  }

  return items
}

export default function Step2Repairs({
  repairItems,
  setRepairItems,
  attachedImages,
  setAttachedImages,
  onNext,
  onPrev,
  onSave,
  isSaved,
  presetItemName
}) {
  const [tab, setTab] = useState('manual')
  const [form, setForm] = useState(newItem())
  const [editingId, setEditingId] = useState(null)
  const [autoDetected, setAutoDetected] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrStatusText, setOcrStatusText] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [extractNotice, setExtractNotice] = useState('')

  // presetItemName이 전달될 경우 폼에 소모품명 및 카테고리 자동 설정
  useEffect(() => {
    if (presetItemName) {
      const detected = detectCategory(presetItemName)
      setForm(prev => ({
        ...prev,
        name: presetItemName,
        category: detected || prev.category || '기타'
      }))
      if (detected) setAutoDetected(true)
    }
  }, [presetItemName])

  const fileRef = useRef()
  const imgRef = useRef()

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // 정비 항목명 입력 시 카테고리 자동 추론
  const handleNameChange = (e) => {
    const name = e.target.value
    const detected = detectCategory(name)
    if (detected) {
      setForm(prev => ({ ...prev, name, category: detected }))
      setAutoDetected(true)
    } else {
      setForm(prev => ({ ...prev, name }))
      setAutoDetected(false)
    }
  }

  const addItem = () => {
    if (!form.name) return
    if (editingId) {
      setRepairItems(prev => prev.map(it => it.id === editingId ? { ...form } : it))
      setEditingId(null)
    } else {
      setRepairItems(prev => [...prev, { ...form, id: Date.now() }])
    }
    setForm(newItem())
  }

  const handleSaveClick = () => {
    let finalItems = [...repairItems]

    // If there is an active item being edited or typed (with name)
    if (editingId && form.name) {
      finalItems = finalItems.map(it => it.id === editingId ? { ...form } : it)
      setRepairItems(finalItems)
      setEditingId(null)
      setForm(newItem())
    } else if (!editingId && form.name) {
      const newEntry = { ...form, id: Date.now() }
      finalItems = [...finalItems, newEntry]
      setRepairItems(finalItems)
      setForm(newItem())
    }

    if (onSave) {
      onSave(finalItems)
    }
  }

  const editItem = (item) => {
    setForm({ ...item })
    setEditingId(item.id)
    setTab('manual')
  }

  const deleteItem = (id) => setRepairItems(prev => prev.filter(it => it.id !== id))

  const processFiles = async (files) => {
    if (!files || files.length === 0) return

    setIsAnalyzing(true)
    setExtractNotice('')
    let newExtractedCount = 0

    for (const file of files) {
      const isImage = file.type.startsWith('image/')
      const isText = file.type.startsWith('text/') || file.name.match(/\.(txt|csv|json|log|md)$/i)

      if (isImage) {
        setAnalysisStatus(`🔍 [${file.name}] 이미지 OCR 분석 및 정비내역 추출 중...`)

        const reader = new FileReader()
        const dataUrl = await new Promise(res => {
          reader.onload = ev => res(ev.target.result)
          reader.readAsDataURL(file)
        })

        setAttachedImages(prev => [
          ...prev,
          { id: Date.now() + Math.random(), name: file.name, dataUrl }
        ])

        try {
          const Tesseract = await loadTesseract()
          const result = await Tesseract.recognize(dataUrl, 'kor+eng')
          const ocrText = result?.data?.text || ''
          const extracted = parseTextToRepairItems(ocrText, file.name)
          if (extracted.length > 0) {
            setRepairItems(prev => [...prev, ...extracted])
            newExtractedCount += extracted.length
          }
        } catch (err) {
          console.warn('OCR processing error, fallback applied', err)
          const fallback = parseTextToRepairItems('', file.name)
          setRepairItems(prev => [...prev, ...fallback])
          newExtractedCount += fallback.length
        }
      } else if (isText) {
        setAnalysisStatus(`📄 [${file.name}] 문서 정비내역 파싱 중...`)
        const text = await new Promise(res => {
          const reader = new FileReader()
          reader.onload = ev => res(ev.target.result)
          reader.readAsText(file)
        })

        const extracted = parseTextToRepairItems(text, file.name)
        if (extracted.length > 0) {
          setRepairItems(prev => [...prev, ...extracted])
          newExtractedCount += extracted.length
        }
      } else {
        const fallback = parseTextToRepairItems('', file.name)
        setRepairItems(prev => [...prev, ...fallback])
        newExtractedCount += fallback.length
      }
    }

    setIsAnalyzing(false)
    setAnalysisStatus('')
    if (newExtractedCount > 0) {
      setExtractNotice(`✨ ${newExtractedCount}개의 정비 항목이 파일/이미지에서 자동 추출되어 등록되었습니다!`)
      setTimeout(() => setExtractNotice(''), 5000)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    processFiles(files)
    e.target.value = ''
  }

  const removeImage = (id) => setAttachedImages(prev => prev.filter(img => img.id !== id))

  const totalParts = repairItems.reduce((s, it) => s + (Number(it.partsCost) || 0), 0)
  const totalLabor = repairItems.reduce((s, it) => s + (Number(it.laborCost) || 0), 0)
  const totalSupply = totalParts + totalLabor
  const vat = Math.round(totalSupply * 0.1)
  const grandTotal = totalSupply + vat

  const catColor = (cat) => {
    if (cat === '조향계') return '#ff3b30'
    if (cat === '현가계') return '#fa8231'
    if (cat === '구동계') return '#45f3ff'
    if (cat === '제동계') return '#f7b731'
    if (cat === '엔진') return '#fd9644'
    if (cat === '진단점검') return '#a0a8b3'
    return '#bef264'
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <div className={styles.headerTitleGroup}>
          <div className={styles.titleWithActions}>
            <h1 className={styles.title}>정비 내역 입력</h1>
            <div className={styles.topActionBtns}>
              <button className={styles.btnSmallIcon} onClick={onPrev} title="이전 단계로 이동">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                <span>이전</span>
              </button>
              {onSave && (
                <button
                  type="button"
                  className={styles.btnSmallIconSave}
                  onClick={handleSaveClick}
                  disabled={repairItems.length === 0 && attachedImages.length === 0 && !form.name}
                  title="정비내역 저장"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                    <polyline points="17 21 17 13 7 13 7 21"/>
                    <polyline points="7 3 7 8 15 8"/>
                  </svg>
                  <span>저장</span>
                </button>
              )}
            </div>
          </div>
          <p className={styles.subtitle}>
            수리한 항목과 금액을 직접 입력하거나, 정비 영수증/이미지를 첨부하면 정비 항목이 자동 추출 및 등록됩니다.
          </p>
        </div>
      </div>


      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tabBtn} ${tab === 'manual' ? styles.tabActive : ''}`} onClick={() => setTab('manual')}>
          ✏️ 항목 직접 입력
        </button>
        <button className={`${styles.tabBtn} ${tab === 'upload' ? styles.tabActive : ''}`} onClick={() => setTab('upload')}>
          📎 파일/이미지 첨부 (자동 추출)
        </button>
      </div>

      {/* Manual Entry Tab */}
      {tab === 'manual' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>{editingId ? '✏️ 항목 수정' : '➕ 항목추가'}</span>
          </div>
          <div className={styles.formGrid}>
            {/* 모바일 1행: 정비일자 + 정비항목명 */}
            <div className={styles.fieldRowInline}>
              <div className={styles.field}>
                <label className={styles.label}>📅 정비 일자 <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  type="date"
                  value={form.repairDate || new Date().toISOString().split('T')[0]}
                  onChange={e => setF('repairDate', e.target.value)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>정비 항목명 <span className={styles.req}>*</span></label>
                <input
                  className={styles.input}
                  placeholder="예: 에어쇼바, 엔진오일..."
                  value={form.name}
                  onChange={handleNameChange}
                />
              </div>
            </div>

            <div className={styles.field}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label className={styles.label} style={{ margin: 0 }}>부위 구분</label>
                {autoDetected && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    background: 'rgba(69,243,255,0.12)',
                    color: 'var(--accent-blue)',
                    border: '1px solid rgba(69,243,255,0.3)',
                    borderRadius: '6px',
                    padding: '2px 8px',
                    letterSpacing: '0.02em',
                    animation: 'fadeIn 0.2s ease'
                  }}>
                    ✨ 자동 선택됨
                  </span>
                )}
              </div>
              <select
                className={styles.select}
                value={form.category}
                onChange={e => { setF('category', e.target.value); setAutoDetected(false) }}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_DETAILS[c].label}</option>)}
              </select>
            </div>

            {/* 모바일 1행: 부품비 + 공임비 */}
            <div className={styles.fieldRowInline}>
              <div className={styles.field}>
                <label className={styles.label}>부품비 (원)</label>
                <FormattedNumberInput
                  className={styles.input}
                  placeholder="0"
                  value={form.partsCost}
                  onChange={val => setF('partsCost', val)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>공임비 (원)</label>
                <FormattedNumberInput
                  className={styles.input}
                  placeholder="0"
                  value={form.laborCost}
                  onChange={val => setF('laborCost', val)}
                />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label} style={{ color: 'var(--accent-blue)', fontWeight: '700' }}>
                💵 항목 소계 (자동 합산)
              </label>
              <div style={{
                background: 'rgba(69,243,255,0.08)',
                border: '1px solid rgba(69,243,255,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '1.05rem',
                fontWeight: '800',
                color: '#45f3ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                minHeight: '42px'
              }}>
                <span>{((Number(form.partsCost) || 0) + (Number(form.laborCost) || 0)).toLocaleString()} 원</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.8, color: '#a0a8b3', fontWeight: 'normal' }}>
                  (부품비 + 공임비)
                </span>
              </div>
            </div>
            {/* Real-time category selection helper */}
            <div className={`${styles.field} ${styles.fieldWide} ${styles.guideBox}`}>
              <span className={styles.guideIcon}>💡</span>
              <div className={styles.guideContent}>
                <strong style={{ color: 'var(--accent-blue)', fontSize: '0.8rem' }}>
                  {CATEGORY_DETAILS[form.category].label} 선택 가이드:
                </strong>
                <p className={styles.guideDesc}>{CATEGORY_DETAILS[form.category].desc}</p>
              </div>
            </div>
            <div className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label}>비고</label>
              <textarea
                className={`${styles.input} ${styles.textareaNote}`}
                placeholder="추가 설명 (선택)"
                rows={3}
                value={form.note}
                onChange={e => setF('note', e.target.value)}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            {editingId && (
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => { setEditingId(null); setForm(newItem()) }}>
                취소
              </button>
            )}
            <button
              className={`${styles.btn} ${styles.btnAdd}`}
              onClick={addItem}
              disabled={!form.name}
            >
              <span className={styles.actionBadgeIcon}>
                {editingId
                  ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                }
              </span>
              <span className={styles.actionBtnText}>{editingId ? '수정 완료' : '항목추가'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Image Upload Tab */}
      {tab === 'upload' && (
        <div className={styles.card}>
          <div className={styles.cardHeader}><span>📎 정비 영수증 / 이미지 / 문서 첨부</span></div>
          <div
            className={styles.dropzone}
            onClick={() => imgRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              const files = Array.from(e.dataTransfer.files)
              processFiles(files)
            }}
          >
            <span className={styles.dropIcon}>🖼️</span>
            <p className={styles.dropText}>클릭하거나 파일/이미지를 드래그하여 업로드</p>
            <p className={styles.dropSub}>JPG, PNG, WEBP, TXT, CSV 등 지원 (첨부 시 정비항목 자동 추출)</p>
            <input ref={imgRef} type="file" accept="image/*,.txt,.csv,.json,.log" multiple style={{ display: 'none' }} onChange={handleImageUpload} />
          </div>

          {isAnalyzing && (
            <div className={styles.analyzingBanner}>
              <div className={styles.spinner} />
              <span>{analysisStatus}</span>
            </div>
          )}

          {extractNotice && (
            <div className={styles.noticeBanner}>
              {extractNotice}
            </div>
          )}

          {attachedImages.length > 0 && (
            <div className={styles.imageGrid}>
              {attachedImages.map(img => (
                <div key={img.id} className={styles.imageCard}>
                  <img src={img.dataUrl} alt={img.name} className={styles.imgThumb} />
                  <div className={styles.imgName}>{img.name}</div>
                  <button className={styles.imgRemove} onClick={() => removeImage(img.id)}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      {repairItems.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span>📋 등록된 정비 항목 ({repairItems.length}건)</span>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>정비일자</th>
                  <th>구분</th>
                  <th>항목명</th>
                  <th className={styles.numCol}>부품비</th>
                  <th className={styles.numCol}>공임비</th>
                  <th className={styles.numCol}>소계</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {repairItems.map(item => (
                  <tr key={item.id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--accent-blue)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      📅 {item.repairDate || new Date().toISOString().split('T')[0]}
                    </td>
                    <td>
                      <span className={styles.catBadge} style={{ borderColor: catColor(item.category), color: catColor(item.category) }}>
                        {item.category}
                      </span>
                    </td>
                    <td className={styles.nameCol}>
                      <div className={styles.itemNameText}>{item.name}</div>
                      {item.note && <div className={styles.noteText}>{item.note}</div>}
                    </td>
                    <td className={styles.numCol}>{Number(item.partsCost || 0).toLocaleString()}</td>
                    <td className={styles.numCol}>{Number(item.laborCost || 0).toLocaleString()}</td>
                    <td className={`${styles.numCol} ${styles.subtotal}`}>
                      {((Number(item.partsCost) || 0) + (Number(item.laborCost) || 0)).toLocaleString()}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.editBtn} onClick={() => editItem(item)}>수정</button>
                        <button className={styles.delBtn} onClick={() => deleteItem(item.id)}>삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cost Summary */}
          <div className={styles.summary}>
            <div className={styles.summaryRow}>
              <span>부품비 합계</span>
              <span>{totalParts.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>공임비 합계</span>
              <span>{totalLabor.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>공급가액 소계</span>
              <span>{totalSupply.toLocaleString()} 원</span>
            </div>
            <div className={styles.summaryRow}>
              <span>부가가치세 (10%)</span>
              <span>{vat.toLocaleString()} 원</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>합계금액</span>
              <span className={styles.totalValue}>{grandTotal.toLocaleString()} 원</span>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}

