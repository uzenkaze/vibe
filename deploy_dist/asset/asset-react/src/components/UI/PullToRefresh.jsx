import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';

export default function PullToRefresh({ children }) {
  const { loadYearData, year, dark } = useApp();

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startYRef = useRef(0);
  const currentYRef = useRef(0);
  const isPullingRef = useRef(false);

  const THRESHOLD = 75; // 당겨야 하는 최소 피셀 거리 (px)

  const handleTouchStart = useCallback((e) => {
    // 화면 최상단(scrollTop === 0)에 있을 때만 작동
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollTop <= 2 && e.touches && e.touches.length === 1) {
      startYRef.current = e.touches[0].clientY;
      isPullingRef.current = true;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isPullingRef.current || isRefreshing) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (scrollTop > 2) {
      isPullingRef.current = false;
      setPullDistance(0);
      return;
    }

    currentYRef.current = e.touches[0].clientY;
    const dy = currentYRef.current - startYRef.current;

    if (dy > 0) {
      // 저항감(Damping) 공식 적용하여 당기는 감각을 극대화
      const distance = Math.min(dy * 0.45, 120);
      setPullDistance(distance);

      // 브라우저의 기본 새로고침 바(Default Chrome PWA Pull) 방지
      if (dy > 15 && e.cancelable) {
        e.preventDefault();
      }
    }
  }, [isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPullingRef.current) return;
    isPullingRef.current = false;

    if (pullDistance >= THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD);

      try {
        console.log('[PullToRefresh] Triggering data refresh...');
        if (loadYearData) {
          await loadYearData(year);
        }
        // 시각적 만족감을 위한 최소 대기 시간
        await new Promise((res) => setTimeout(res, 600));
      } catch (err) {
        console.error('[PullToRefresh] Refresh failed', err);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  }, [pullDistance, isRefreshing, loadYearData, year, THRESHOLD]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 스피너 회전 및 크기 비율 연산
  const progressRatio = Math.min(pullDistance / THRESHOLD, 1);
  const spinnerRotation = pullDistance * 3;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      
      {/* ── 아이폰 iOS 스타일 Pull-to-Refresh 로딩 인디케이터 ── */}
      <div style={{
        position: 'fixed',
        top: isRefreshing ? 20 : Math.max(pullDistance - 50, -60),
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: dark ? 'rgba(21, 28, 46, 0.92)' : 'rgba(255, 255, 255, 0.95)',
        boxShadow: dark 
          ? '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(99, 102, 241, 0.3)' 
          : '0 8px 24px rgba(0,0,0,0.15)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: isPullingRef.current ? 'none' : 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        opacity: pullDistance > 10 || isRefreshing ? 1 : 0,
        pointerEvents: 'none'
      }}>
        {isRefreshing ? (
          /* 아이폰 뱅글뱅글 스피너 (Spinning ring) */
          <div className="ios-spinner-ring" />
        ) : (
          /* 당길 때 회전하며 차오르는 화살표/아크 */
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={dark ? '#818cf8' : '#4f46e5'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: `rotate(${spinnerRotation}deg) scale(${progressRatio})`,
              opacity: progressRatio,
              transition: 'transform 0.1s linear'
            }}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
        )}
      </div>

      {/* 메인 화면 컨텐츠 */}
      <div style={{
        transform: `translateY(${isRefreshing ? 50 : pullDistance * 0.4}px)`,
        transition: isPullingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      }}>
        {children}
      </div>

    </div>
  );
}
