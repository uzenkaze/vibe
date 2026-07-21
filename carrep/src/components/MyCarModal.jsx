import { useState, useEffect } from 'react'
import styles from './MyCarModal.module.css'
import FormattedNumberInput from './FormattedNumberInput'

const CAR_MAKERS = ['현대', '기아', '쉐보레', 'BMW', '벤츠', '아우디', '도요타', '혼다', '닛산', '폭스바겐', '볼보', '포드', '기타']

const COLOR_OPTIONS = [
  { label: '선택 안함', value: '', hex: null },
  { label: '흰색 (화이트)', value: '흰색', hex: '#f5f5f5' },
  { label: '검정 (블랙)', value: '검정', hex: '#111111' },
  { label: '티타늄실버 (Titanium Silver)', value: '티타늄실버', hex: '#5a5b5f' },
  { label: '은색 (실버)', value: '은색', hex: '#c8c8c8' },
  { label: '회색 (그레이)', value: '회색', hex: '#808080' },
  { label: '빨간색 (레드)', value: '빨간색', hex: '#cc2200' },
  { label: '와인', value: '와인', hex: '#6b1020' },
  { label: '파란색 (블루)', value: '파란색', hex: '#1a4fa0' },
  { label: '하늘색 (스카이블루)', value: '하늘색', hex: '#4fa8d5' },
  { label: '초록색 (그린)', value: '초록색', hex: '#2a7a3a' },
  { label: '진초록 (다크그린)', value: '진초록', hex: '#1a4020' },
  { label: '노란색 (옐로우)', value: '노란색', hex: '#e8c020' },
  { label: '주황색 (오렌지)', value: '주황색', hex: '#e07020' },
  { label: '갈색 (브라운)', value: '갈색', hex: '#7a4030' },
  { label: '베이지 (샴페인)', value: '베이지', hex: '#d4c4a0' },
  { label: '금색 (골드)', value: '금색', hex: '#c8a820' },
  { label: '보라 (퍼플)', value: '보라', hex: '#6a30a0' },
]

export default function MyCarModal({ isOpen, onClose, onSave, currentMyCar }) {
  const [maker, setMaker] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [mileage, setMileage] = useState('')
  const [color, setColor] = useState('')
  const [regDate, setRegDate] = useState('')
  const [fuelEconomy, setFuelEconomy] = useState('')
  const [tireSize, setTireSize] = useState('')
  const [engineDisp, setEngineDisp] = useState('')
  const [nickname, setNickname] = useState('')
  const [plate, setPlate] = useState('')
  const [grade, setGrade] = useState('')
  const [driveType, setDriveType] = useState('2WD')
  const [fuelType, setFuelType] = useState('경유')

  useEffect(() => {
    if (isOpen) {
      setMaker(currentMyCar?.maker || '')
      setModel(currentMyCar?.model || '')
      setYear(currentMyCar?.year || '')
      setMileage(currentMyCar?.mileage || '')
      setColor(currentMyCar?.color || '')
      setRegDate(currentMyCar?.regDate || '')
      setFuelEconomy(currentMyCar?.fuelEconomy || '')
      setTireSize(currentMyCar?.tireSize || '')
      setEngineDisp(currentMyCar?.engineDisp || '')
      setNickname(currentMyCar?.nickname || '')
      setPlate(currentMyCar?.plate || '')
      setGrade(currentMyCar?.grade || '')
      setDriveType(currentMyCar?.driveType || '2WD')
      setFuelType(currentMyCar?.fuelType || '경유')
    }
  }, [isOpen, currentMyCar])

  if (!isOpen) return null

  const handleSave = () => {
    if (!maker || !model || !year) {
      alert('제조사, 모델명, 연식은 필수 입력 항목입니다.')
      return
    }
    onSave({
      maker,
      model,
      year: Number(year),
      mileage: mileage ? Number(mileage) : '',
      color,
      regDate,
      fuelEconomy,
      tireSize,
      engineDisp,
      nickname,
      plate,
      grade,
      driveType,
      fuelType
    })
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>🚗 내차 정보 관리</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p className={styles.desc}>
            자주 정비하는 내 차량의 기본 정보를 등록해 두면, 보고서 작성 시 매번 입력하지 않고 원클릭으로 신속히 작성할 수 있습니다.
          </p>

          <div className={styles.grid}>
            <div className={styles.field}>
              <label className={styles.label}>🏷️ 차량 별명 (닉네임)</label>
              <input
                className={styles.input}
                placeholder="예: 하비, 검둥이, 흰둥이"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>🔢 차량 번호판</label>
              <input
                className={styles.input}
                placeholder="예: 43느5894"
                value={plate}
                onChange={e => setPlate(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>제조사 <span className={styles.req}>*</span></label>
              <select
                className={styles.select}
                value={maker}
                onChange={e => setMaker(e.target.value)}
              >
                <option value="">선택하세요</option>
                {CAR_MAKERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>차종 (모델명) <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                placeholder="예: 모하비"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>연식 (연도) <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                type="number"
                placeholder="예: 2009"
                min="1990"
                max={new Date().getFullYear()}
                value={year}
                onChange={e => setYear(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>기본 주행거리 (km)</label>
              <FormattedNumberInput
                className={styles.input}
                placeholder="예: 176,200"
                value={mileage}
                onChange={val => setMileage(val)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>구동 방식</label>
              <select className={styles.select} value={driveType} onChange={e => setDriveType(e.target.value)}>
                {['2WD', '4WD', 'AWD', 'RWD', 'FWD'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>⛽ 사용 유종</label>
              <select className={styles.select} value={fuelType} onChange={e => setFuelType(e.target.value)}>
                {['고급휘발유', '휘발유', '경유', 'LPG'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>트림 / 등급</label>
              <input
                className={styles.input}
                placeholder="예: KV300 고급형, 프레스티지"
                value={grade}
                onChange={e => setGrade(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>차량 색상</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {color && COLOR_OPTIONS.find(c => c.value === color)?.hex && (
                  <span style={{
                    display: 'inline-block',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: COLOR_OPTIONS.find(c => c.value === color).hex,
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    flexShrink: 0,
                    boxShadow: `0 0 8px ${COLOR_OPTIONS.find(c => c.value === color).hex}66`
                  }} />
                )}
                <select
                  className={styles.select}
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  style={{ flex: 1 }}
                >
                  {COLOR_OPTIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>📅 최초 등록일</label>
              <input
                className={styles.input}
                placeholder="예: 2008.11.20"
                value={regDate}
                onChange={e => setRegDate(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>⛽ 공인 연비</label>
              <input
                className={styles.input}
                placeholder="예: 9.4 km/L"
                value={fuelEconomy}
                onChange={e => setFuelEconomy(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>🛞 타이어 규격</label>
              <input
                className={styles.input}
                placeholder="예: 265/60R18"
                value={tireSize}
                onChange={e => setTireSize(e.target.value)}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>⚡ 엔진 배기량</label>
              <input
                className={styles.input}
                placeholder="예: 2,959 cc"
                value={engineDisp}
                onChange={e => setEngineDisp(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>취소</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>내차 등록</button>
        </div>
      </div>
    </div>
  )
}
