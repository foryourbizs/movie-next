import ky, { type KyInstance, type Options, HTTPError } from 'ky'
import toast from 'react-hot-toast'

import { API_CONFIG, API_ENDPOINTS, HTTP_STATUS, ERROR_MESSAGES } from '@/lib/constants'
import type { ApiError, AuthResponse } from '@/types/api'

/**
 * 토큰 관리 클래스
 */
class TokenManager {
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
    console.log('💾 setTokens called:', {
      accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : 'null'
    })

    this.accessToken = accessToken
    if (refreshToken) {
      this.refreshToken = refreshToken
    }

    // localStorage에 저장
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('accessToken', accessToken)
        console.log('✅ Access token saved to localStorage')

        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken)
          console.log('✅ Refresh token saved to localStorage')
        }

        // 토큰 만료 시간도 저장 (JWT는 보통 1시간, 여유분 5분을 빼고 55분으로 설정)
        const expiryTime = Date.now() + (55 * 60 * 1000)
        localStorage.setItem('tokenExpiry', expiryTime.toString())
        console.log('✅ Token expiry time saved:', new Date(expiryTime).toLocaleString())
      } catch (error) {
        console.error('❌ Failed to save tokens to localStorage:', error)
      }
    } else {
      console.warn('⚠️ Window is undefined, tokens not saved to localStorage')
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
      console.log('🔑 Access token loaded from localStorage:', this.accessToken ? `${this.accessToken.substring(0, 20)}...` : 'null')
      return this.accessToken
    }

    console.log('🔑 getAccessToken: window undefined, returning null')
    return null
  }

  getRefreshToken(): string | null {
    if (this.refreshToken) {
      return this.refreshToken
    }

    if (typeof window !== 'undefined') {
      this.refreshToken = localStorage.getItem('refreshToken')
      console.log('🔄 Refresh token loaded from localStorage:', this.refreshToken ? `${this.refreshToken.substring(0, 20)}...` : 'null')
      return this.refreshToken
    }

    console.log('🔄 getRefreshToken: window undefined, returning null')
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

  // 디버깅용 토큰 상태 확인
  debugTokenStatus(): void {
    console.log('🔍 Token Status Debug:')
    console.log('- Access Token:', this.accessToken ? `${this.accessToken.substring(0, 20)}...` : 'null')
    console.log('- Refresh Token:', this.refreshToken ? `${this.refreshToken.substring(0, 20)}...` : 'null')
    console.log('- Is Expired:', this.isTokenExpired())
    console.log('- Is Expiring Soon:', this.isTokenExpiringSoon())

    if (typeof window !== 'undefined') {
      const expiryTime = localStorage.getItem('tokenExpiry')
      if (expiryTime) {
        const remaining = parseInt(expiryTime) - Date.now()
        console.log('- Time until expiry:', Math.round(remaining / (60 * 1000)), 'minutes')
      }
    }
  }

  // 토큰 갱신
  async refreshAccessToken(): Promise<string> {
    console.log('🔄 refreshAccessToken called')

    if (this.isRefreshing && this.refreshPromise) {
      console.log('⏳ Token refresh already in progress, waiting...')
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      console.error('❌ No refresh token available')
      throw new Error('No refresh token available')
    }

    console.log('🔄 Starting token refresh process...')
    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh(refreshToken)

    try {
      const newAccessToken = await this.refreshPromise
      this.isRefreshing = false
      this.refreshPromise = null
      console.log('✅ Token refresh completed successfully')
      return newAccessToken
    } catch (error) {
      console.error('❌ Token refresh process failed:', error)
      this.isRefreshing = false
      this.refreshPromise = null
      this.clearTokens()
      throw error
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    const refreshUrl = `${API_CONFIG.BASE_URL}/${API_CONFIG.PREFIX}/${API_CONFIG.VERSION}/${API_ENDPOINTS.AUTH.REFRESH}`
    console.log('📡 Making token refresh request to:', refreshUrl)

    try {
      const response = await ky.post(refreshUrl, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
        timeout: 10000,
      }).json<AuthResponse>()

      console.log('📥 Token refresh response received')
      this.setTokens(response.accessToken, response.refreshToken)

      // Zustand store의 토큰도 업데이트
      if (typeof window !== 'undefined') {
        try {
          const { useAuthStore } = await import('@/store/auth-store')
          const { setTokens } = useAuthStore.getState()
          setTokens(response.accessToken, response.refreshToken)
          console.log('🔄 Auth store tokens updated')
        } catch (error) {
          console.error('❌ Failed to update auth store tokens:', error)
        }
      }

      return response.accessToken
    } catch (error) {
      console.error('❌ Token refresh request failed:', error)
      if (error instanceof Error) {
        console.error('Error details:', error.message)
      }
      throw new Error('Token refresh failed')
    }
  }
}

/**
 * 401 Unauthorized 에러 처리
 */
async function handleUnauthorizedError(): Promise<void> {
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
        console.log('🔄 Redirecting to login page due to authentication failure')
        // window.location.href = '/auth/signin'
      }, 1000) // 토스트 메시지를 보여줄 시간 확보
    }
  }
}

/**
 * API 에러 처리 함수
 */
function handleApiError(error: unknown): never {
  console.error('API Error:', error)

  // ky HTTPError 처리
  if (error && typeof error === 'object' && 'response' in error) {
    const httpError = error as { response: Response; message: string }
    const status = httpError.response.status

    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        toast.error(ERROR_MESSAGES.UNAUTHORIZED)
        // 인증 실패 시 토큰 제거하고 로그인 페이지로 리디렉션
        handleUnauthorizedError()
        break
      case HTTP_STATUS.FORBIDDEN:
        toast.error(ERROR_MESSAGES.FORBIDDEN)
        break
      case HTTP_STATUS.NOT_FOUND:
        toast.error(ERROR_MESSAGES.NOT_FOUND)
        break
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        toast.error(ERROR_MESSAGES.VALIDATION_ERROR)
        break
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        toast.error(ERROR_MESSAGES.SERVER_ERROR)
        break
      default:
        toast.error(ERROR_MESSAGES.NETWORK_ERROR)
    }
  } else {
    toast.error(ERROR_MESSAGES.NETWORK_ERROR)
  }

  throw error
}

/**
 * ky 인스턴스 생성 및 설정
 */
function createApiClient(): KyInstance {
  const tokenManager = TokenManager.getInstance()

  return ky.create({
    prefixUrl: `${API_CONFIG.BASE_URL}/${API_CONFIG.PREFIX}/${API_CONFIG.VERSION}`,
    timeout: API_CONFIG.TIMEOUT,
    retry: {
      limit: 2,
      methods: ['get', 'post', 'put', 'patch', 'delete'], // 모든 HTTP 메서드에서 재시도 허용
      statusCodes: [401, 408, 413, 429, 500, 502, 503, 504], // 401 추가
    },
    headers: {
      'Content-Type': 'application/json',
    },
    hooks: {
      beforeRequest: [
        async (request) => {
          // 토큰 만료 체크 및 미리 갱신
          if (tokenManager.isTokenExpiringSoon() && tokenManager.getRefreshToken()) {
            try {
              console.log('Token expiring soon, refreshing...')
              await tokenManager.refreshAccessToken()
            } catch (error) {
              console.error('Proactive token refresh failed:', error)
              // 미리 갱신 실패해도 기존 토큰으로 요청 시도
            }
          }

          const accessToken = tokenManager.getAccessToken()
          if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
          }
        }
      ],
      beforeRetry: [
        async ({ request, error, retryCount }) => {
          console.log(`🔄 Retry attempt ${retryCount} for request:`, request.url)

          // 401 에러 시 토큰 갱신 시도 (첫 번째 재시도에서만)
          if (error instanceof HTTPError && error.response?.status === HTTP_STATUS.UNAUTHORIZED && retryCount === 1) {
            console.log('🔐 401 Unauthorized detected, attempting token refresh...')

            const refreshToken = tokenManager.getRefreshToken()
            if (!refreshToken) {
              console.error('❌ No refresh token available for token refresh')
              await handleUnauthorizedError()
              throw error
            }

            try {
              console.log('🔄 Refreshing access token...')
              const newAccessToken = await tokenManager.refreshAccessToken()
              console.log('✅ Token refresh successful')
              request.headers.set('Authorization', `Bearer ${newAccessToken}`)
              return
            } catch (refreshError) {
              console.error('❌ Token refresh failed:', refreshError)
              // 토큰 갱신 실패 시 인증 상태 초기화 및 리디렉션
              await handleUnauthorizedError()
              throw error
            }
          } else {
            console.log(`⚠️  Retry conditions not met: status=${error instanceof HTTPError ? error.response?.status : 'unknown'}, retryCount=${retryCount}`)
          }
        }
      ],
      afterResponse: [
        (request, options, response) => {
          // 응답이 성공적이면 그대로 반환
          if (response.ok) {
            return response
          }

          // 에러 응답 처리
          return response
        }
      ],
      beforeError: [
        async (error) => {
          const { response } = error
          if (response) {
            try {
              const errorData = await response.json() as ApiError
              // @foryourdev/nestjs-crud는 message가 배열이므로 첫 번째 요소 사용
              error.message = Array.isArray(errorData.message)
                ? errorData.message[0] || error.message
                : String(errorData.message) || error.message
            } catch {
              // JSON 파싱 실패 시 기본 메시지 사용
            }
          }
          return error
        }
      ]
    }
  })
}

// API 클라이언트 인스턴스
export const api = createApiClient()

// 토큰 관리자 인스턴스 export
export const tokenManager = TokenManager.getInstance()

// 개발 환경에서 window 객체에 tokenManager 추가 (디버깅용)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ; (window as any).tokenManager = tokenManager
  console.log('🛠️ tokenManager available in console for debugging')
}

/**
 * API 유틸리티 함수들
 */
export const apiUtils = {
  // GET 요청
  async get<T>(url: string, options?: Options): Promise<T> {
    try {
      return await api.get(url, options).json<T>()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // POST 요청
  async post<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    try {
      return await api.post(url, { json: data, ...options }).json<T>()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // PUT 요청
  async put<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    try {
      return await api.put(url, { json: data, ...options }).json<T>()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // PATCH 요청
  async patch<T>(url: string, data?: unknown, options?: Options): Promise<T> {
    try {
      return await api.patch(url, { json: data, ...options }).json<T>()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // DELETE 요청
  async delete<T>(url: string, options?: Options): Promise<T> {
    try {
      return await api.delete(url, options).json<T>()
    } catch (error) {
      return handleApiError(error)
    }
  },

  // CRUD 쿼리 문자열 생성 (@foryourdev/nestjs-crud 형식)
  buildCrudQuery(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'filter' && typeof value === 'object' && !Array.isArray(value)) {
          // 필터 객체를 filter[field_operator]=value 형식으로 변환
          Object.entries(value as Record<string, unknown>).forEach(([filterKey, filterValue]) => {
            if (filterValue !== undefined && filterValue !== null) {
              searchParams.append(`filter[${filterKey}]`, String(filterValue))
            }
          })
        } else if (key === 'page' && typeof value === 'object' && !Array.isArray(value)) {
          // 페이지 객체를 page[number]=1&page[size]=10 형식으로 변환
          Object.entries(value as Record<string, unknown>).forEach(([pageKey, pageValue]) => {
            if (pageValue !== undefined && pageValue !== null) {
              searchParams.append(`page[${pageKey}]`, String(pageValue))
            }
          })
        } else if (Array.isArray(value)) {
          // 배열 값 처리 (sort, include 등)
          if (key === 'sort' || key === 'include') {
            value.forEach(item => searchParams.append(key, String(item)))
          } else {
            searchParams.append(key, value.join(','))
          }
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return searchParams.toString()
  },

  // 필터 헬퍼 함수들
  createFilter(field: string, operator: string, value: unknown): Record<string, unknown> {
    return {
      [`${field}_${operator}`]: value
    }
  },

  // 이메일 필터 헬퍼 (현재 백엔드에서 허용된 유일한 필터)
  emailFilter(value: string): Record<string, unknown> {
    return {
      filter: {
        email_like: `%${value}%`
      }
    }
  }
} 