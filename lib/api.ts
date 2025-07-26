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
    }
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
      const response = await ky.post(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
        timeout: 10000,
      }).json<AuthResponse>()

      this.setTokens(response.accessToken, response.refreshToken)
      return response.accessToken
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error('Token refresh failed')
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
        TokenManager.getInstance().clearTokens()
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/signin'
        }
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
      methods: ['get'],
      statusCodes: [408, 413, 429, 500, 502, 503, 504],
    },
    headers: {
      'Content-Type': 'application/json',
    },
    hooks: {
      beforeRequest: [
        (request) => {
          const accessToken = tokenManager.getAccessToken()
          if (accessToken) {
            request.headers.set('Authorization', `Bearer ${accessToken}`)
          }
        }
      ],
      beforeRetry: [
        async ({ request, error, retryCount }) => {
          // 401 에러 시 토큰 갱신 시도
          if (error instanceof HTTPError && error.response?.status === HTTP_STATUS.UNAUTHORIZED && retryCount === 0) {
            try {
              const newAccessToken = await tokenManager.refreshAccessToken()
              request.headers.set('Authorization', `Bearer ${newAccessToken}`)
              return
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError)
              // 토큰 갱신 실패 시 재시도 중단
              throw error
            }
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
              error.message = errorData.message || error.message
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

  // CRUD 쿼리 문자열 생성
  buildCrudQuery(params: Record<string, unknown>): string {
    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)))
        } else {
          searchParams.append(key, String(value))
        }
      }
    })

    return searchParams.toString()
  }
} 