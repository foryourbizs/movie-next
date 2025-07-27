'use client'

import React from 'react'
import { tokenManager } from '@/lib/token-manager'

interface TokenMonitorProviderProps {
  children: React.ReactNode
}

/**
 * 토큰 모니터링 훅
 */
function useTokenMonitor() {
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const isActiveRef = React.useRef(true)
  const lastCheckRef = React.useRef<number>(0)

  const cleanup = React.useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    isActiveRef.current = false
  }, [])

  const checkTokenStatus = React.useCallback(async () => {
    // 컴포넌트가 언마운트되었거나 비활성화된 경우 체크 중단
    if (!isActiveRef.current) {
      return
    }

    const now = Date.now()
    // 중복 체크 방지 (최소 5초 간격)
    if (now - lastCheckRef.current < 5000) {
      return
    }
    lastCheckRef.current = now

    try {
      // 보안 상태 검증
      if (!tokenManager.validateSecurityState()) {
        console.warn('Token security validation failed')
        return
      }

      // 토큰 만료 임박 시 갱신
      if (tokenManager.isTokenExpiringSoon() && !tokenManager.isTokenExpired()) {
        const refreshToken = tokenManager.getRefreshToken()
        if (refreshToken && isActiveRef.current) {
          console.log('Proactive token refresh initiated')
          await tokenManager.refreshAccessToken()
        }
      }
    } catch (error) {
      console.error('Token monitoring failed:', error)
      // 에러 발생 시 토큰 상태 재검증
      if (isActiveRef.current) {
        setTimeout(() => {
          if (isActiveRef.current) {
            checkTokenStatus()
          }
        }, 10000) // 10초 후 재시도
      }
    }
  }, [])

  const startMonitoring = React.useCallback(() => {
    // 이미 모니터링 중이면 중단
    if (intervalRef.current) {
      return
    }

    isActiveRef.current = true

    // 즉시 토큰 상태 체크
    checkTokenStatus()

    // 30초마다 토큰 상태 체크
    intervalRef.current = setInterval(() => {
      if (isActiveRef.current) {
        checkTokenStatus()
      } else {
        cleanup()
      }
    }, 30000)

    console.log('Token monitoring started')
  }, [checkTokenStatus, cleanup])

  const stopMonitoring = React.useCallback(() => {
    cleanup()
    console.log('Token monitoring stopped')
  }, [cleanup])

  React.useEffect(() => {
    startMonitoring()

    // 페이지 포커스/블러 이벤트 처리
    const handleVisibilityChange = () => {
      if (!isActiveRef.current) return

      if (document.hidden) {
        // 페이지가 숨겨질 때 모니터링 일시 중단
        console.log('Page hidden, pausing token monitoring')
      } else {
        // 페이지가 다시 보일 때 즉시 토큰 상태 체크
        console.log('Page visible, checking token status')
        checkTokenStatus()
      }
    }

    const handleFocus = () => {
      if (isActiveRef.current) {
        console.log('Window focused, checking token status')
        checkTokenStatus()
      }
    }

    const handleBeforeUnload = () => {
      cleanup()
    }

    // 이벤트 리스너 등록
    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true })
    window.addEventListener('focus', handleFocus, { passive: true })
    window.addEventListener('beforeunload', handleBeforeUnload)

    // cleanup 함수
    return () => {
      stopMonitoring()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [startMonitoring, stopMonitoring, checkTokenStatus, cleanup])

  // 디버그 정보 (개발 모드에서만)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugInterval = setInterval(() => {
        if (isActiveRef.current) {
          console.debug('Token Monitor Status:', {
            isActive: isActiveRef.current,
            hasInterval: !!intervalRef.current,
            lastCheck: new Date(lastCheckRef.current).toISOString(),
          })
        }
      }, 60000) // 1분마다

      return () => {
        clearInterval(debugInterval)
      }
    }
  }, [])

  return {
    isMonitoring: isActiveRef.current && !!intervalRef.current,
    checkTokenStatus,
    startMonitoring,
    stopMonitoring,
  }
}

export function TokenMonitorProvider({ children }: TokenMonitorProviderProps) {
  const tokenMonitor = useTokenMonitor()

  // Provider context에서 토큰 모니터 기능 제공 (필요한 경우)
  const contextValue = React.useMemo(() => ({
    isMonitoring: tokenMonitor.isMonitoring,
    checkTokenStatus: tokenMonitor.checkTokenStatus,
  }), [tokenMonitor.isMonitoring, tokenMonitor.checkTokenStatus])

  return (
    <>
      {children}
    </>
  )
}

// 토큰 모니터 컨텍스트 (필요한 경우 사용)
export const TokenMonitorContext = React.createContext<{
  isMonitoring: boolean
  checkTokenStatus: () => Promise<void>
} | null>(null)

export function useTokenMonitorContext() {
  const context = React.useContext(TokenMonitorContext)
  if (!context) {
    console.warn('useTokenMonitorContext must be used within TokenMonitorProvider')
    return {
      isMonitoring: false,
      checkTokenStatus: async () => {},
    }
  }
  return context
} 