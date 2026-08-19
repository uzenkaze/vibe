import React, { useState, useEffect, useRef } from 'react'
import styles from './PullToRefresh.module.css'

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshComplete, setRefreshComplete] = useState(false)

  const startYRef = useRef(0)
  const isPullingRef = useRef(false)
  const PULL_THRESHOLD = 60

  const handleTouchStart = (e) => {
    if (isRefreshing) return
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    if (scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY
      isPullingRef.current = true
    } else {
      isPullingRef.current = false
    }
  }

  const handleTouchMove = (e) => {
    if (!isPullingRef.current || isRefreshing) return
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0
    if (scrollTop > 0) {
      isPullingRef.current = false
      setPullDistance(0)
      return
    }

    const currentY = e.touches[0].clientY
    const diff = currentY - startYRef.current

    if (diff > 0) {
      // Damping resistance curve
      const distance = Math.min(diff * 0.45, 85)
      setPullDistance(distance)
    } else {
      setPullDistance(0)
    }
  }

  const handleTouchEnd = async () => {
    if (!isPullingRef.current || isRefreshing) return
    isPullingRef.current = false

    if (pullDistance >= PULL_THRESHOLD && onRefresh) {
      setIsRefreshing(true)
      setPullDistance(50)
      try {
        await onRefresh()
        setRefreshComplete(true)
        setTimeout(() => {
          setRefreshComplete(false)
          setIsRefreshing(false)
          setPullDistance(0)
        }, 500)
      } catch (err) {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }

  const isTriggerable = pullDistance >= PULL_THRESHOLD
  const rotation = Math.min(pullDistance * 4, 360)

  return (
    <div
      className={styles.container}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator Banner */}
      <div
        className={`${styles.indicatorWrapper} ${isRefreshing ? styles.refreshing : ''}`}
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 8 ? Math.min(pullDistance / 35, 1) : 0
        }}
      >
        <div className={styles.indicatorContent}>
          {isRefreshing ? (
            refreshComplete ? (
              <div className={styles.successState}>
                <span className={styles.successIcon}>✓</span>
                <span className={styles.statusText}>데이터 갱신 완료</span>
              </div>
            ) : (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span className={styles.statusText}>데이터 조회 중...</span>
              </div>
            )
          ) : (
            <div className={styles.pullState}>
              <svg
                className={styles.arrowIcon}
                style={{ transform: `rotate(${isTriggerable ? 180 : rotation}deg)` }}
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              <span className={styles.statusText}>
                {isTriggerable ? '손을 놓아 새로고침' : '당겨서 최신 데이터 새로고침'}
              </span>
            </div>
          )}
        </div>
      </div>

      <div
        className={styles.contentWrapper}
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.4}px)` : 'none',
          transition: isPullingRef.current ? 'none' : 'transform 0.25s ease'
        }}
      >
        {children}
      </div>
    </div>
  )
}
