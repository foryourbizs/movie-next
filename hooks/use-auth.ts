import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  User,
  QueryError,
  MutationOptions
} from '@/types/api'

/**
 * 인증 관련 훅들
 */

// 로그인
export const useLogin = (options?: MutationOptions<AuthResponse, LoginRequest>) => {
  const router = useRouter()
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
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

// 회원가입
export const useSignUp = (options?: MutationOptions<AuthResponse, SignUpRequest>) => {
  const router = useRouter()
  const queryClient = useQueryClient()

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
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
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

// 로그아웃
export const useLogout = (options?: MutationOptions<void, void>) => {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      return apiUtils.post<void>(API_ENDPOINTS.AUTH.SIGN_OUT)
    },
    onSuccess: (data, variables) => {
      // 모든 쿼리 캐시 제거
      queryClient.clear()
      toast.success('로그아웃되었습니다.')
      router.push('/auth/signin')
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Logout failed:', error)
      options?.onError?.(error, variables)
    },
    ...options,
  })
}

// 토큰 갱신
export const useRefreshToken = (options?: MutationOptions<AuthResponse, void>) => {
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