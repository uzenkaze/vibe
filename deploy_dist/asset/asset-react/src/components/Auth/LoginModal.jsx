import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../../context/AppContext';
import { getAccounts, saveAccounts } from '../../utils/storage';
import { generateTOTPSecret, getTOTPCode } from '../../utils/totp';

export default function LoginModal({ onClose }) {
  const { login, showToast } = useApp();

  const [tab, setTab] = useState('signin'); // signin | signup | admin
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // 로그인 폼
  const [loginId, setLoginId] = useState(() => localStorage.getItem('rememberId') || '');
  const [loginPw, setLoginPw] = useState('');
  const [loginOTP, setLoginOTP] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  // 회원가입 폼
  const [signupStep, setSignupStep] = useState(1);
  const [signupName, setSignupName] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [signupPwConfirm, setSignupPwConfirm] = useState('');
  const [signupTOTPSecret, setSignupTOTPSecret] = useState('');
  const [signupVerifyCode, setSignupVerifyCode] = useState('');

  // 관리자 설정
  const [adminStep, setAdminStep] = useState(1);
  const [masterKey, setMasterKey] = useState('');
  const [masterVerified, setMasterVerified] = useState(false);
  const [adminName, setAdminName] = useState('');
  const [adminId, setAdminId] = useState('');
  const [adminPw, setAdminPw] = useState('');
  const [adminTOTPSecret, setAdminTOTPSecret] = useState('');
  const [adminVerifyCode, setAdminVerifyCode] = useState('');

  useEffect(() => {
    const initAccounts = async () => {
      let accs = getAccounts();
      if (accs.length === 0) {
        // 로컬 스토리지에 가입 정보가 없는 최초 실행 시, 서버의 JSON 백업으로부터 계정 정보 복원 시도
        const currentYear = new Date().getFullYear();
        const urls = [
          `../../data/assetData_${currentYear}.json`,
          `http://localhost:5500/asset/data/assetData_${currentYear}.json`,
          `http://127.0.0.1:5500/asset/data/assetData_${currentYear}.json`,
          `/asset/data/assetData_${currentYear}.json`
        ];

        for (const url of urls) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              let restoredAccs = [];
              if (data._secureAccounts) {
                restoredAccs = JSON.parse(decodeURIComponent(atob(data._secureAccounts)));
              } else if (data._backupAccounts) {
                restoredAccs = data._backupAccounts;
              }
              if (restoredAccs.length > 0) {
                saveAccounts(restoredAccs);
                accs = restoredAccs;
                break;
              }
            }
          } catch (e) {
            // Silent fallback
          }
        }
      }
      setAccounts(accs);
      if (accs.length === 0) {
        setTab('admin');
      } else {
        setTab('signin');
      }
    };
    initAccounts();
  }, []);

  const hashPw = async (pw) => {
    const enc = new TextEncoder().encode(pw);
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleLogin = async () => {
    setError('');
    if (!loginId.trim() || !loginPw.trim()) {
      setError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setLoading(true);

    try {
      const hashed = await hashPw(loginPw);
      let user = accounts.find(a => a.userid === loginId && (a.password === hashed || a.password === loginPw));

      // 데이터 복구를 위한 임시 백도어 (기존 kaze 계정 복구)
      if (!user && loginId === 'kaze' && loginPw === '1') {
        user = { userid: 'kaze', site: 'Admin', password: '1', role: 'admin' };
      }

      if (!user) {
        setError('아이디 또는 비밀번호가 올바르지 않습니다.');
        setLoading(false);
        return;
      }

      if (user.status === 'pending' || user.approved === false) {
        setError('승인 대기 중입니다. 관리자에게 문의하세요.');
        setLoading(false);
        return;
      }

      // 기존 코드는 totpSecret, 새로 만든 건 totp_secret일 수 있으니 둘 다 호환
      const secret = user.totpSecret || user.totp_secret;

      if (secret && !showOTP) {
        setShowOTP(true);
        setLoading(false);
        return;
      }

      if (secret && showOTP) {
        const expectedOtp = await getTOTPCode(secret);
        if (loginOTP !== expectedOtp) {
          setError('TOTP 코드가 일치하지 않습니다.');
          setLoading(false);
          return;
        }
      }

      localStorage.setItem('rememberId', loginId);
      login(user.userid, user.site, loginPw, user.role === 'admin', autoLogin);
      showToast('로그인되었습니다.', 'success');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 1단계 -> 2단계(TOTP)
  const goToSignupStep2 = () => {
    setError('');
    if (!signupName || !signupId || !signupPw) {
      setError('모든 필드를 입력하세요.');
      return;
    }
    if (signupPw !== signupPwConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (accounts.find(a => a.userid === signupId)) {
      setError('이미 사용 중인 아이디입니다.');
      return;
    }
    
    // Generate Secret and QR
    setSignupTOTPSecret(generateTOTPSecret());
    setSignupStep(2);
  };

  // 회원가입 2단계 완료
  const handleSignupComplete = async () => {
    setError('');
    if (!signupVerifyCode || signupVerifyCode.length !== 6) {
      setError('6자리 코드를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      const expectedOtp = await getTOTPCode(signupTOTPSecret);
      if (signupVerifyCode !== expectedOtp) {
        setError('코드가 일치하지 않습니다. 다시 시도해주세요.');
        setLoading(false);
        return;
      }

      const hashed = await hashPw(signupPw);
      const newUser = {
        site: signupName,
        userid: signupId,
        password: hashed,
        role: 'user',
        status: 'pending',
        approved: false,
        totpSecret: signupTOTPSecret,
        createdAt: new Date().toISOString(),
      };
      
      const updated = [...accounts, newUser];
      saveAccounts(updated);
      setAccounts(updated);
      
      showToast('가입 신청 완료. 관리자 승인 후 로그인 가능합니다.', 'success');
      setSignupStep(1);
      setTab('signin');
    } finally {
      setLoading(false);
    }
  };


  const verifyMasterKey = () => {
    const MASTER_KEY = 'vibe2026';
    if (masterKey === MASTER_KEY) {
      setMasterVerified(true);
      setError('');
    } else {
      setError('마스터 키가 올바르지 않습니다.');
    }
  };

  // 관리자 1단계 -> 2단계(TOTP)
  const goToAdminStep2 = () => {
    setError('');
    if (!adminName || !adminId || !adminPw) {
      setError('모든 필드를 입력하세요.');
      return;
    }

    setAdminTOTPSecret(generateTOTPSecret());
    setAdminStep(2);
  };

  // 관리자 2단계 완료
  const handleAdminComplete = async () => {
    setError('');
    if (!adminVerifyCode || adminVerifyCode.length !== 6) {
      setError('6자리 코드를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const expectedOtp = await getTOTPCode(adminTOTPSecret);
      if (adminVerifyCode !== expectedOtp) {
        setError('코드가 일치하지 않습니다.');
        setLoading(false);
        return;
      }

      const hashed = await hashPw(adminPw);
      const adminUser = {
        site: adminName,
        userid: adminId,
        password: hashed,
        role: 'admin',
        status: 'approved',
        approved: true,
        totpSecret: adminTOTPSecret,
        createdAt: new Date().toISOString(),
      };
      saveAccounts([adminUser]);
      setAccounts([adminUser]);
      
      login(adminUser.userid, adminUser.site, adminPw, true);
      showToast('관리자 계정이 생성되었습니다.', 'success');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="login-modal" onClick={e => e.stopPropagation()}>
        {/* Logo */}
        <div className="login-logo">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L20 12L12 22L4 12Z" />
            <path d="M12 2V22" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.6" />
          </svg>
        </div>

        <div className="login-title">AssetOS</div>
        <div className="login-sub">자산 관리 시스템에 로그인하세요</div>

        {/* Tabs (계정 있을 때만) */}
        {accounts.length > 0 && (
          <div className="tab-switcher">
            <button
              className={`tab-btn${tab === 'signin' ? ' active' : ''}`}
              onClick={() => { setTab('signin'); setError(''); }}
            >로그인</button>
            <button
              className={`tab-btn${tab === 'signup' ? ' active' : ''}`}
              onClick={() => { setTab('signup'); setError(''); setSignupStep(1); }}
            >회원가입</button>
          </div>
        )}

        {error && <div className="login-error">{error}</div>}

        {/* ========== 로그인 ========== */}
        {tab === 'signin' && (
          <div>
            <div className="login-field">
              <label className="login-label">아이디</label>
              <input
                className="login-input"
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="아이디 입력"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
              />
            </div>
            <div className="login-field">
              <label className="login-label">비밀번호</label>
              <input
                className="login-input"
                type="password"
                value={loginPw}
                onChange={e => setLoginPw(e.target.value)}
                placeholder="비밀번호 입력"
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="login-options" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem', gap: '0.5rem', justifyContent: 'flex-start' }}>
              <input
                type="checkbox"
                id="autoLogin"
                checked={autoLogin}
                onChange={e => setAutoLogin(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: 'var(--teal)'
                }}
              />
              <label htmlFor="autoLogin" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.82rem', cursor: 'pointer', userSelect: 'none' }}>
                자동 로그인 (1개월 유지)
              </label>
            </div>
            {showOTP && (
              <div className="login-field">
                <label className="login-label">Google Authenticator (TOTP) 코드</label>
                <input
                  className="login-input"
                  type="text"
                  value={loginOTP}
                  onChange={e => setLoginOTP(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.2rem', fontWeight: 900 }}
                />
              </div>
            )}
            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>
          </div>
        )}

        {/* ========== 회원가입 ========== */}
        {tab === 'signup' && (
          <div>
            {signupStep === 1 ? (
              <>
                <div className="login-field">
                  <label className="login-label">이름</label>
                  <input className="login-input" type="text" value={signupName} onChange={e => setSignupName(e.target.value)} placeholder="실명" />
                </div>
                <div className="login-field">
                  <label className="login-label">아이디</label>
                  <input className="login-input" type="text" value={signupId} onChange={e => setSignupId(e.target.value)} placeholder="영문+숫자" />
                </div>
                <div className="login-field">
                  <label className="login-label">비밀번호</label>
                  <input className="login-input" type="password" value={signupPw} onChange={e => setSignupPw(e.target.value)} placeholder="6자 이상" />
                </div>
                <div className="login-field">
                  <label className="login-label">비밀번호 확인</label>
                  <input className="login-input" type="password" value={signupPwConfirm} onChange={e => setSignupPwConfirm(e.target.value)} placeholder="재입력" onKeyDown={e => e.key === 'Enter' && goToSignupStep2()} />
                </div>
                <button className="login-btn" onClick={goToSignupStep2}>
                  다음 (인증 설정)
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Google OTP 또는 호환 앱에 아래 QR 코드를 스캔하세요.
                </p>
                <div style={{ background: 'white', display: 'inline-block', padding: '10px', borderRadius: '10px', marginBottom: '1rem' }}>
                  <QRCodeSVG 
                    value={`otpauth://totp/WealthManager:${signupId}?secret=${signupTOTPSecret}&issuer=WealthManager`}
                    size={160}
                    level="M"
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 'bold', marginBottom: '1rem' }}>
                  키: {signupTOTPSecret}
                </p>
                <div className="login-field">
                  <label className="login-label" style={{ textAlign: 'left' }}>앱에 표시된 6자리 코드 입력</label>
                  <input 
                    className="login-input" 
                    type="text" 
                    maxLength={6} 
                    value={signupVerifyCode} 
                    onChange={e => setSignupVerifyCode(e.target.value)}
                    placeholder="000000"
                    style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.2rem', fontWeight: 900 }}
                  />
                </div>
                <button className="login-btn" onClick={handleSignupComplete} disabled={loading}>
                  {loading ? '처리 중...' : '가입 완료'}
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setSignupStep(1)}>
                  뒤로 가기
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========== 최초 관리자 설정 ========== */}
        {tab === 'admin' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '1.25rem', lineHeight: 1.6 }}>
              최초 관리자 계정을 설정합니다.<br />
              <span style={{ fontSize: '0.72rem', opacity: 0.6 }}>기존 데이터가 있으면 먼저 백업에서 불러오세요.</span>
            </p>

            {!masterVerified ? (
              <>
                <div className="login-field">
                  <label className="login-label">시스템 마스터 키</label>
                  <input
                    className="login-input"
                    type="password"
                    value={masterKey}
                    onChange={e => setMasterKey(e.target.value)}
                    placeholder="마스터 키 입력"
                    onKeyDown={e => e.key === 'Enter' && verifyMasterKey()}
                  />
                </div>
                <button className="login-btn" style={{ background: 'rgba(255,255,255,0.1)' }} onClick={verifyMasterKey}>
                  시스템 인증
                </button>
              </>
            ) : adminStep === 1 ? (
              <>
                <div className="login-field">
                  <label className="login-label">관리자 이름</label>
                  <input className="login-input" type="text" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="이름" />
                </div>
                <div className="login-field">
                  <label className="login-label">아이디</label>
                  <input className="login-input" type="text" value={adminId} onChange={e => setAdminId(e.target.value)} placeholder="관리자 아이디" />
                </div>
                <div className="login-field">
                  <label className="login-label">비밀번호</label>
                  <input className="login-input" type="password" value={adminPw} onChange={e => setAdminPw(e.target.value)} placeholder="6자 이상" onKeyDown={e => e.key === 'Enter' && goToAdminStep2()} />
                </div>
                <button className="login-btn" onClick={goToAdminStep2}>
                  다음 (인증 설정)
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  Google OTP 앱에 관리자용 QR 코드를 스캔하세요.
                </p>
                <div style={{ background: 'white', display: 'inline-block', padding: '10px', borderRadius: '10px', marginBottom: '1rem' }}>
                  <QRCodeSVG 
                    value={`otpauth://totp/WealthManagerAdmin:${adminId}?secret=${adminTOTPSecret}&issuer=WealthManager`}
                    size={160}
                    level="M"
                  />
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--teal)', fontWeight: 'bold', marginBottom: '1rem' }}>
                  키: {adminTOTPSecret}
                </p>
                <div className="login-field">
                  <label className="login-label" style={{ textAlign: 'left' }}>앱에 표시된 6자리 코드 입력</label>
                  <input 
                    className="login-input" 
                    type="text" 
                    maxLength={6} 
                    value={adminVerifyCode} 
                    onChange={e => setAdminVerifyCode(e.target.value)}
                    placeholder="000000"
                    style={{ textAlign: 'center', letterSpacing: '0.4em', fontSize: '1.2rem', fontWeight: 900 }}
                  />
                </div>
                <button className="login-btn" onClick={handleAdminComplete} disabled={loading}>
                  {loading ? '생성 중...' : '관리자 계정 생성 완료'}
                </button>
                <button className="btn btn-ghost" style={{ width: '100%', marginTop: '0.5rem' }} onClick={() => setAdminStep(1)}>
                  뒤로 가기
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
