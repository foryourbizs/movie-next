import { useEffect, useRef } from 'react'
import { tokenManager } from '@/lib/token-manager'
import { useAuth } from '@/store/auth-store'

/**
 * 토큰 만료 모니터링 및 자동 갱신 훅
 */
export const useTokenMonitor = () => {
  const { isAuthenticated } = useAuth()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // 인증되지 않은 상태에서는 모니터링하지 않음
    if (!isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // 토큰 상태 체크 함수
    const checkTokenStatus = async () => {
      try {
        // 토큰이 만료되었다면
        if (tokenManager.isTokenExpired()) {
          if (tokenManager.getRefreshToken()) {
            try {
              await tokenManager.refreshAccessToken()
            } catch (error) {
              console.error('Token refresh failed:', error)
            }
          }
        }
        // 토큰이 곧 만료될 예정이라면 미리 갱신
        else if (tokenManager.isTokenExpiringSoon()) {
          if (tokenManager.getRefreshToken()) {
            try {
              await tokenManager.refreshAccessToken()
            } catch (error) {
              console.error('Proactive token refresh failed:', error)
            }
          }
        }
      } catch (error) {
        console.error('Token status check failed:', error)
      }
    }

    // 초기 체크
    checkTokenStatus()

    // 30초마다 토큰 상태 체크
    intervalRef.current = setInterval(checkTokenStatus, 30 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isAuthenticated])

  // 페이지 포커스 시에도 토큰 상태 체크
  useEffect(() => {
    const handleFocus = async () => {
      if (isAuthenticated && tokenManager.isTokenExpiringSoon()) {
        try {
          await tokenManager.refreshAccessToken()
        } catch (error) {
          console.error('Token refresh on focus failed:', error)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('focus', handleFocus)
      return () => window.removeEventListener('focus', handleFocus)
    }
  }, [isAuthenticated])
} 