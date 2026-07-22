import { useState } from 'react'
import styles from './AuthPage.module.css'

export const AVATAR_OPTIONS = [
  { id: 'm1', label: '남성 1 (소년)', gender: 'male', src: 'avatars/m1.jpg' },
  { id: 'm2', label: '남성 2 (청년)', gender: 'male', src: 'avatars/m2.jpg' },
  { id: 'm3', label: '남성 3 (안경)', gender: 'male', src: 'avatars/m3.jpg' },
  { id: 'm4', label: '남성 4 (드라이버)', gender: 'male', src: 'avatars/m4.jpg' },
  { id: 'm5', label: '남성 5 (중년)', gender: 'male', src: 'avatars/m5.jpg' },
  { id: 'f1', label: '여성 1 (소녀)', gender: 'female', src: 'avatars/f1.jpg' },
  { id: 'f2', label: '여성 2 (단발)', gender: 'female', src: 'avatars/f2.jpg' },
  { id: 'f3', label: '여성 3 (안경)', gender: 'female', src: 'avatars/f3.jpg' },
  { id: 'f4', label: '여성 4 (커리어)', gender: 'female', src: 'avatars/f4.jpg' },
  { id: 'f5', label: '여성 5 (웨이브)', gender: 'female', src: 'avatars/f5.jpg' }
]

export default function AuthPage({ currentUser, onLogin, onLogout, onGoHome }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('m1')
  const [genderFilter, setGenderFilter] = useState('all') // 'all' | 'male' | 'female'
  const [carModel, setCarModel] = useState('')
  const [carPlate, setCarPlate] = useState('')
  const [carYear, setCarYear] = useState('')
  const [carMileage, setCarMileage] = useState('')

  // 이미 로그인된 경우 프로필 정보 및 로그아웃 제공
  if (currentUser) {
    const userAvatarSrc = currentUser.avatar
      ? `${import.meta.env.BASE_URL}${currentUser.avatar}`
      : `${import.meta.env.BASE_URL}avatars/m1.jpg`

    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapLarge}>
              <img src={userAvatarSrc} alt="사용자 프로필 캐릭터" className={styles.avatarImgLarge} />
            </div>
            <h2 className={styles.profileName}>{currentUser.name || '사용자'}님 환영합니다!</h2>
            <span className={styles.profileEmail}>{currentUser.email}</span>
          </div>

          <div className={styles.carInfoBox}>
            <div className={styles.boxTitle}>🚘 연결된 차량 정보</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>차종 / 모델</span>
                <span className={styles.infoVal}>{currentUser.car?.model || '미등록'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>차량 번호</span>
                <span className={styles.infoVal}>{currentUser.car?.plate || '미등록'}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>연식 / 주행거리</span>
                <span className={styles.infoVal}>
                  {currentUser.car?.year ? `${currentUser.car.year}년식` : ''} · {currentUser.car?.mileage ? `${Number(currentUser.car.mileage).toLocaleString()}km` : ''}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnHome} onClick={onGoHome}>
              🏠 메인 대시보드로 이동
            </button>
            <button className={styles.btnLogout} onClick={onLogout}>
              🚪 로그아웃
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.')
      return
    }

    try {
      const users = JSON.parse(localStorage.getItem('carrep_users') || '{}')

      if (isSignUp) {
        if (users[email]) {
          alert('이미 가입된 이메일 주소입니다. 로그인해주세요.')
          setIsSignUp(false)
          return
        }

        const chosenAvatarObj = AVATAR_OPTIONS.find(a => a.id === selectedAvatar) || AVATAR_OPTIONS[0]

        const newUser = {
          email,
          password,
          name: name || email.split('@')[0],
          avatar: chosenAvatarObj.src,
          car: {
            maker: '기아',
            model: carModel || '모하비',
            plate: carPlate || '',
            year: carYear || '2022',
            mileage: carMileage || '45000',
            nickname: `${name || '사용자'}의 차`,
            driveType: '4WD',
            fuelType: '경유',
            regDate: '2022.05.10',
            fuelEconomy: '9.4 km/L',
            tireSize: '265/60R18',
            engineDisp: '2,959 cc'
          }
        }

        users[email] = newUser
        localStorage.setItem('carrep_users', JSON.stringify(users))
        alert('회원가입이 완료되었습니다! 자동 로그인됩니다.')
        onLogin(newUser)
      } else {
        // 로그인 처리
        const user = users[email]
        if (!user || user.password !== password) {
          alert('이메일 또는 비밀번호가 올바르지 않습니다.')
          return
        }

        onLogin(user)
      }
    } catch (e) {
      console.error(e)
      alert('오류가 발생했습니다.')
    }
  }

  const filteredAvatars = AVATAR_OPTIONS.filter(a => {
    if (genderFilter === 'male') return a.gender === 'male'
    if (genderFilter === 'female') return a.gender === 'female'
    return true
  })

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarWrapPlaceholder}>
            {isSignUp ? (
              <img
                src={`${import.meta.env.BASE_URL}${AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.src}`}
                alt="선택한 아바타"
                className={styles.avatarImg}
              />
            ) : (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-muted)' }}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <h2 className={styles.title}>{isSignUp ? '회원가입' : '사용자 로그인'}</h2>
          <p className={styles.subtitle}>
            {isSignUp ? '나만의 캐릭터와 보유 차량 정보를 등록하세요' : '가입하신 계정으로 로그인하여 차량 정보를 조회합니다'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
            <>
              {/* 캐릭터 아바타 선택 영역 */}
              <div className={styles.avatarPickerSection}>
                <div className={styles.avatarPickerHeader}>
                  <label className={styles.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)' }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>프로필 캐릭터 선택</span> <span className={styles.req}>*</span>
                  </label>
                  <div className={styles.genderTabs}>
                    <button
                      type="button"
                      className={`${styles.genderTab} ${genderFilter === 'all' ? styles.genderActive : ''}`}
                      onClick={() => setGenderFilter('all')}
                    >
                      전체 (10)
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderTab} ${genderFilter === 'male' ? styles.genderActive : ''}`}
                      onClick={() => setGenderFilter('male')}
                    >
                      남성
                    </button>
                    <button
                      type="button"
                      className={`${styles.genderTab} ${genderFilter === 'female' ? styles.genderActive : ''}`}
                      onClick={() => setGenderFilter('female')}
                    >
                      여성
                    </button>
                  </div>
                </div>

                <div className={styles.avatarGrid}>
                  {filteredAvatars.map(av => (
                    <div
                      key={av.id}
                      className={`${styles.avatarGridItem} ${selectedAvatar === av.id ? styles.avatarSelected : ''}`}
                      onClick={() => setSelectedAvatar(av.id)}
                      title={av.label}
                    >
                      <img
                        src={`${import.meta.env.BASE_URL}${av.src}`}
                        alt={av.label}
                        className={styles.avatarThumbImg}
                      />
                      {selectedAvatar === av.id && (
                        <div className={styles.avatarCheckBadge}>✓</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>이름 / 닉네임</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="예: 홍길동"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className={styles.field}>
            <label className={styles.label}>이메일 계정</label>
            <input
              type="email"
              className={styles.input}
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>비밀번호</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isSignUp && (
            <div className={styles.signUpCarBox}>
              <div className={styles.boxTitle} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-blue)', verticalAlign: 'middle' }}>
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span>기본 보유 차량 등록</span>
              </div>
              <div className={styles.fieldGrid}>
                <div className={styles.field}>
                  <label className={styles.label}>차종 / 모델명</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="예: 모하비 더 마스터"
                    value={carModel}
                    onChange={e => setCarModel(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>차량 번호판</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="예: 12가 3456"
                    value={carPlate}
                    onChange={e => setCarPlate(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>연식 (년)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="2022"
                    value={carYear}
                    onChange={e => setCarYear(e.target.value)}
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>현재 주행거리 (km)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="45000"
                    value={carMileage}
                    onChange={e => setCarMileage(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <button type="submit" className={styles.btnSubmit}>
            {isSignUp ? '가입 및 차량 등록 완료' : '로그인'}
          </button>
        </form>

        <div className={styles.footer}>
          <span>{isSignUp ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}</span>
          <button
            type="button"
            className={styles.btnSwitch}
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? '로그인 하기' : '회원가입 하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
