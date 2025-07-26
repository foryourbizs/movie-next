import { useQuery, useMutation, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type {
  LoginRequest,
  SignUpRequest,
  AuthResponse,
  User,
  UpdateUserRequest,
  PaginatedResponse,
  CrudQuery,
  QueryError,
  MutationOptions
} from '@/types/api'

/**
 * 인증 관련 훅들
 */

// 로그인
export const useLogin = (options?: MutationOptions<AuthResponse, LoginRequest>) => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
      return apiUtils.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_IN, data)
    },
    onSuccess: (data, variables) => {
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

  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<AuthResponse> => {
      return apiUtils.post<AuthResponse>(API_ENDPOINTS.AUTH.SIGN_UP, data)
    },
    onSuccess: (data, variables) => {
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

/**
 * 사용자 관련 훅들
 */

// 현재 사용자 정보 조회
export const useMe = (options?: Omit<UseQueryOptions<User, QueryError>, 'queryKey' | 'queryFn'>) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_ME,
    queryFn: async (): Promise<User> => {
      return apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
    },
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  })
}

// 사용자 목록 조회 (페이지네이션)
export const useUsers = (
  query?: CrudQuery,
  options?: Omit<UseQueryOptions<PaginatedResponse<User>, QueryError>, 'queryKey' | 'queryFn'>
) => {
  const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''

  return useQuery({
    queryKey: [...QUERY_KEYS.USERS, query],
    queryFn: async (): Promise<PaginatedResponse<User>> => {
      return apiUtils.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS.BASE}${queryString}`)
    },
    staleTime: 2 * 60 * 1000, // 2분
    ...options,
  })
}

// 특정 사용자 조회
export const useUser = (
  id: string,
  options?: Omit<UseQueryOptions<User, QueryError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: QUERY_KEYS.USER_BY_ID(id),
    queryFn: async (): Promise<User> => {
      return apiUtils.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5분
    ...options,
  })
}

// 사용자 생성
export const useCreateUser = (options?: MutationOptions<User, SignUpRequest>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SignUpRequest): Promise<User> => {
      return apiUtils.post<User>(API_ENDPOINTS.USERS.BASE, data)
    },
    onSuccess: (data, variables) => {
      // 사용자 목록 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('사용자가 생성되었습니다.')
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Create user failed:', error)
      options?.onError?.(error, variables)
    },
    ...options,
  })
}

// 사용자 업데이트
export const useUpdateUser = (options?: MutationOptions<User, { id: string; data: UpdateUserRequest }>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }): Promise<User> => {
      return apiUtils.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data)
    },
    onSuccess: (data, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(variables.id) })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
      toast.success('사용자 정보가 업데이트되었습니다.')
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Update user failed:', error)
      options?.onError?.(error, variables)
    },
    ...options,
  })
}

// 현재 사용자 정보 업데이트
export const useUpdateMe = (options?: MutationOptions<User, UpdateUserRequest>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateUserRequest): Promise<User> => {
      return apiUtils.put<User>(API_ENDPOINTS.USERS.ME, data)
    },
    onSuccess: (data, variables) => {
      // 현재 사용자 쿼리 업데이트
      queryClient.setQueryData(QUERY_KEYS.USER_ME, data)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      toast.success('프로필이 업데이트되었습니다.')
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Update profile failed:', error)
      options?.onError?.(error, variables)
    },
    ...options,
  })
}

// 사용자 삭제
export const useDeleteUser = (options?: MutationOptions<void, string>) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      return apiUtils.delete<void>(API_ENDPOINTS.USERS.BY_ID(id))
    },
    onSuccess: (data, variables) => {
      // 관련 쿼리들 무효화
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
      queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_BY_ID(variables) })
      toast.success('사용자가 삭제되었습니다.')
      options?.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      console.error('Delete user failed:', error)
      options?.onError?.(error, variables)
    },
    ...options,
  })
}

/**
 * 유틸리티 훅들
 */

// 쿼리 무효화 유틸리티
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateUsers: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
    invalidateUser: (id: string) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(id) }),
    invalidateMe: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME }),
    invalidateAuth: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.AUTH }),
    invalidateAll: () => queryClient.invalidateQueries(),
    clearAll: () => queryClient.clear(),
  }
}

// 쿼리 프리페치 유틸리티
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient()

  return {
    prefetchUsers: (query?: CrudQuery) => {
      const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
      return queryClient.prefetchQuery({
        queryKey: [...QUERY_KEYS.USERS, query],
        queryFn: async (): Promise<PaginatedResponse<User>> => {
          return apiUtils.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS.BASE}${queryString}`)
        },
        staleTime: 2 * 60 * 1000,
      })
    },
    prefetchUser: (id: string) => {
      return queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.USER_BY_ID(id),
        queryFn: async (): Promise<User> => {
          return apiUtils.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
        },
        staleTime: 5 * 60 * 1000,
      })
    },
    prefetchMe: () => {
      return queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.USER_ME,
        queryFn: async (): Promise<User> => {
          return apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
} 