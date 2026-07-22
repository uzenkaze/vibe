import { useState } from 'react'
import styles from './AuthPage.module.css'

export default function AuthPage({ currentUser, onLogin, onLogout, onGoHome }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [carModel, setCarModel] = useState('모하비 더 마스터')
  const [carPlate, setCarPlate] = useState('12가 3456')
  const [carYear, setCarYear] = useState('2022')
  const [carMileage, setCarMileage] = useState('45000')

  // 이미 로그인된 경우 프로필 정보 및 로그아웃 제공
  if (currentUser) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.profileHeader}>
            <div className={styles.avatarWrapLarge}>
              <img src={`${import.meta.env.BASE_URL}user_avatar.jpg`} alt="사용자 아바타" className={styles.avatarImgLarge} />
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

        const newUser = {
          email,
          password,
          name: name || email.split('@')[0],
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
          // 데모용 샘플 기본 계정 지원 (테스트 편의성)
          if (email === 'demo@kia.com' && password === '1234') {
            const demoUser = {
              email: 'demo@kia.com',
              name: '기아 운전자',
              car: {
                maker: '기아',
                model: '모하비 더 마스터',
                plate: '12가 3456',
                year: '2022',
                mileage: '48200',
                nickname: '모하비 마스터',
                driveType: '4WD',
                fuelType: '경유',
                regDate: '2022.03.15',
                fuelEconomy: '9.4 km/L',
                tireSize: '265/60R18',
                engineDisp: '2,959 cc'
              }
            }
            onLogin(demoUser)
            return
          }
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

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.avatarWrap}>
            <img src={`${import.meta.env.BASE_URL}user_avatar.jpg`} alt="사용자 아바타" className={styles.avatarImg} />
          </div>
          <h2 className={styles.title}>{isSignUp ? '회원가입' : '사용자 로그인'}</h2>
          <p className={styles.subtitle}>
            {isSignUp ? '차량 정보와 계정을 등록하고 스마트하게 관리하세요' : '가입하신 계정으로 로그인하여 차량 정보를 조회합니다'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {isSignUp && (
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
              <div className={styles.boxTitle}>🚘 기본 보유 차량 등록</div>
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

        {!isSignUp && (
          <div className={styles.demoNotice}>
            💡 <strong>빠른 테스트용 계정:</strong> demo@kia.com / 1234
          </div>
        )}
      </div>
    </div>
  )
}
