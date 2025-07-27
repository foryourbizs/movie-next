import ky from 'ky'
import toast from 'react-hot-toast'

import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '@/lib/constants'
import type { AuthResponse } from '@/types/api'

/**
 * 토큰 관리 클래스
 */
export class TokenManager {
  private static instance: TokenManager
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private isRefreshing = false
  private refreshPromise: Promise<string> | null = null

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager()
    }
    return TokenManager.instance
  }

  // 토큰 설정
  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken
    if (refreshToken) {
      this.refreshToken = refreshToken
    }

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken)
      }
      // 토큰 만료 시간도 저장 (JWT는 보통 1시간, 여유분 5분을 빼고 55분으로 설정)
      const expiryTime = Date.now() + (55 * 60 * 1000)
      localStorage.setItem('tokenExpiry', expiryTime.toString())
    }
  }

  // 토큰 가져오기
  getAccessToken(): string | null {
    if (this.accessToken) {
      return this.accessToken
    }

    // localStorage에서 토큰 복원
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken')
      this.refreshToken = localStorage.getItem('refreshToken')
      return this.accessToken
    }

    return null
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken
    }

    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refreshToken')
      return this.refreshToken
    }

    return null
  }

  // 토큰 제거
  clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('tokenExpiry')
    }
  }

  // 토큰 만료 체크
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    const expiryTime = localStorage.getItem('tokenExpiry')
    if (!expiryTime) {
      return true // 만료 시간이 없으면 만료된 것으로 간주
    }

    return Date.now() >= parseInt(expiryTime)
  }

  // 토큰 만료가 임박했는지 체크 (5분 이내)
  isTokenExpiringSoon(): boolean {
    if (typeof window === 'undefined') {
      return false
    }

    const expiryTime = localStorage.getItem('tokenExpiry')
    if (!expiryTime) {
      return true
    }

    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000)
    return fiveMinutesFromNow >= parseInt(expiryTime)
  }

  // 토큰 갱신
  async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      this.isRefreshing = false
      this.refreshPromise = null
      return newAccessToken
    } catch (error) {
      this.isRefreshing = false
      this.refreshPromise = null
      this.clearTokens()
      throw error
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    try {
      const response = await ky.post(`${API_CONFIG.BASE_URL}/${API_CONFIG.PREFIX}/${API_CONFIG.VERSION}/${API_ENDPOINTS.AUTH.REFRESH}`, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
        timeout: 10000,
      }).json<AuthResponse>()

      this.setTokens(response.accessToken, response.refreshToken)

      // Zustand store의 토큰도 업데이트
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = await import('@/store/auth-store')
          const { setTokens } = useAuthStore.getState()
          setTokens(response.accessToken, response.refreshToken)
        } catch (error) {
          console.error('Failed to update auth store tokens:', error)
        }
      }

      return response.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error('Token refresh failed')
    }
  }
}

/**
 * 401 Unauthorized 에러 처리
 */
export async function handleUnauthorizedError(): Promise<void> {
  const tokenManager = TokenManager.getInstance()

  // 토큰 제거
  tokenManager.clearTokens()

  // Zustand store의 인증 상태 초기화
  if (typeof window !== 'undefined') {
    try {
      const { useAuthStore } = await import('@/store/auth-store')
      const { logout } = useAuthStore.getState()
      logout()
    } catch (error) {
      console.error('Failed to clear auth state:', error)
    }

    // 로그인 페이지로 리디렉션 (현재 페이지가 로그인 관련 페이지가 아닌 경우만)
    const currentPath = window.location.pathname
    const isAuthPage = currentPath.startsWith('/auth/') || currentPath === '/'

    if (!isAuthPage) {
      setTimeout(() => {
        window.location.href = '/auth/signin'
      }, 1000) // 토스트 메시지를 보여줄 시간 확보
    }
  }
}

// 토큰 관리자 인스턴스 export
export const tokenManager = TokenManager.getInstance() 