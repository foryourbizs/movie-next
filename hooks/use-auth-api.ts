import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { LoginRequest, SignUpRequest, AuthResponse } from '@/types/auth'
import type { User } from '@/types/user'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * 인증 API 클래스
 */
class AuthApi {
  private queryClient = useQueryClient()
  private router = useRouter()

  /**
   * 로그인
   */
  login(options?: MutationOptions<AuthResponse, LoginRequest>) {
    return useMutation({
      mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
        const authResponse = await apiUtils.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_IN, data)

        // 토큰을 임시로 설정하여 /users/me API 호출이 가능하도록 함
        const { tokenManager } = await import('@/lib/token-manager')
        tokenManager.setTokens(authResponse.accessToken, authResponse.refreshToken)

        // 사용자 정보 가져오기
        try {
          const userInfo = await apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
          return {
            ...authResponse,
            user: userInfo
          }
        } catch (error) {
          console.error('Failed to fetch user info after login:', error)
          // 사용자 정보를 가져오지 못해도 로그인은 성공으로 처리
          return authResponse
        }
      },
      onSuccess: (data, variables) => {
        // 사용자 관련 쿼리 무효화
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
        toast.success('로그인에 성공했습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        console.error('Login failed:', error)
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * 회원가입
   */
  signUp(options?: MutationOptions<AuthResponse, SignUpRequest>) {
    return useMutation({
      mutationFn: async (data: SignUpRequest): Promise<AuthResponse> => {
        const authResponse = await apiUtils.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_UP, data)

        // 토큰을 임시로 설정하여 /users/me API 호출이 가능하도록 함
        const { tokenManager } = await import('@/lib/token-manager')
        tokenManager.setTokens(authResponse.accessToken, authResponse.refreshToken)

        // 사용자 정보 가져오기
        try {
          const userInfo = await apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
          return {
            ...authResponse,
            user: userInfo
          }
        } catch (error) {
          console.error('Failed to fetch user info after sign up:', error)
          // 사용자 정보를 가져오지 못해도 회원가입은 성공으로 처리
          return authResponse
        }
      },
      onSuccess: (data, variables) => {
        // 사용자 관련 쿼리 무효화
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
        toast.success('회원가입에 성공했습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        console.error('Sign up failed:', error)
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * 로그아웃
   */
  logout(options?: MutationOptions<void, void>) {
    return useMutation({
      mutationFn: async (): Promise<void> => {
        return apiUtils.post<void>(API_ENDPOINTS.AUTH.SIGN_OUT)
      },
      onSuccess: (data, variables) => {
        // 모든 쿼리 캐시 제거
        this.queryClient.clear()
        toast.success('로그아웃되었습니다.')
        this.router.push('/auth/signin')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        console.error('Logout failed:', error)
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * 토큰 갱신
   */
  refreshToken(options?: MutationOptions<AuthResponse, void>) {
    return useMutation({
      mutationFn: async (): Promise<AuthResponse> => {
        return apiUtils.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH)
      },
      onError: (error, variables) => {
        console.error('Token refresh failed:', error)
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * 인증 상태 관리 유틸리티 메서드들
   */
  utils() {
    return {
      /**
       * 토큰 관리자에 직접 접근
       */
      getTokenManager: async () => {
        const { tokenManager } = await import('@/lib/token-manager')
        return tokenManager
      },

      /**
       * 현재 토큰 상태 확인
       */
      getTokenStatus: async () => {
        const { tokenManager } = await import('@/lib/token-manager')
        return {
          hasAccessToken: !!tokenManager.getAccessToken(),
          hasRefreshToken: !!tokenManager.getRefreshToken(),
          isExpired: tokenManager.isTokenExpired(),
          isExpiringSoon: tokenManager.isTokenExpiringSoon(),
        }
      },

      /**
       * 인증 관련 쿼리 무효화
       */
      invalidateAuth: () => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
      },

      /**
       * 캐시 정리
       */
      clearCache: () => {
        this.queryClient.clear()
      }
    }
  }
}

/**
 * 인증 API 훅
 */
export const useAuthApi = () => {
  return new AuthApi()
} 