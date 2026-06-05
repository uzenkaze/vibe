export default function LandingPage({ onLogin }) {
  return (
    <div className="landing">
      {/* Background gradient blobs */}
      <div className="landing-bg" />

      {/* Animated teal orb */}
      <div style={{
        position: 'absolute',
        width: 500,
        height: 500,
        background: 'radial-gradient(circle, rgba(45,201,160,0.08) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />

      <div className="landing-content">
        {/* Badge */}
        <div className="landing-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Intelligent Wealth Management
        </div>

        {/* Logo */}
        <div style={{
          width: 72, height: 72,
          background: 'linear-gradient(135deg, #2DC9A0, #1DA880)',
          borderRadius: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
          boxShadow: '0 12px 36px rgba(45,201,160,0.35)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L20 12L12 22L4 12Z" />
            <path d="M12 2V22" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.6" />
            <path d="M4 12H20" strokeWidth="0.8" strokeDasharray="2 2" strokeOpacity="0.6" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="landing-title">
          Your <span className="landing-title-accent">Wealth</span>,<br />
          Managed Smartly.
        </h1>

        {/* Subtitle */}
        <p className="landing-subtitle">
          자산, 부채, 수입, 지출을 한곳에서 관리하세요.<br />
          스마트한 재무 관리의 시작.
        </p>

        {/* CTA */}
        <button className="landing-btn" onClick={onLogin}>
          시작하기
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>

        {/* Bottom stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}>
          {[
            { label: '자산 관리', value: '통합' },
            { label: '보안', value: 'TOTP' },
            { label: '백업', value: 'GitHub' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.125rem', fontWeight: 900, color: 'rgba(255,255,255,0.8)', letterSpacing: '-0.03em' }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
