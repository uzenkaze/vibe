import { useState, useEffect } from 'react'
import styles from './GitHubModal.module.css'

export default function GitHubModal({ isOpen, onClose, onSave, currentToken }) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setToken(currentToken || '')
    }
  }, [isOpen, currentToken])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(token.trim())
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>⚙️ GitHub Cloud DB 설정</span>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <p className={styles.desc}>
            데이터를 원격에 직접 저장, 수정, 삭제하려면 <strong>GitHub Personal Access Token (classic)</strong>이 필요합니다.
          </p>
          <div className={styles.infoBox}>
            <strong>💡 토큰 발급 방법:</strong>
            <ol className={styles.list}>
              <li>GitHub 로그인 후 <strong>Settings &gt; Developer Settings &gt; Personal access tokens &gt; Tokens (classic)</strong>으로 이동합니다.</li>
              <li>[Generate new token] 버튼을 누르고 권한 범위(Scopes) 중 <strong>[repo]</strong>를 체크한 뒤 토큰을 생성합니다.</li>
              <li>생성된 <code>ghp_...</code>로 시작하는 토큰 키를 복사하여 아래에 입력하세요.</li>
            </ol>
            <a 
              href="https://github.com/settings/tokens" 
              target="_blank" 
              rel="noreferrer" 
              className={styles.link}
            >
              👉 GitHub 토큰 발급 페이지 바로가기 (새창)
            </a>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Personal Access Token (classic)</label>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                type={showToken ? 'text' : 'password'}
                placeholder="ghp_... 로 시작하는 토큰 입력"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <button
                type="button"
                className={styles.toggleBtn}
                onClick={() => setShowToken(!showToken)}
                title={showToken ? '비밀번호 숨기기' : '비밀번호 보이기'}
              >
                {showToken ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={onClose}>취소</button>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave}>설정 등록</button>
        </div>
      </div>
    </div>
  )
}
