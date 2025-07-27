import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type {
  User,
  UpdateUserRequest,
  SignUpRequest,
  PaginatedResponse,
  CrudQuery,
  QueryError,
  MutationOptions
} from '@/types/api'

/**
 * 사용자 API 클래스
 */
class UserApi {
  private queryClient = useQueryClient()

  /**
   * 현재 사용자 정보 조회
   */
  me(options?: Omit<UseQueryOptions<User, QueryError>, 'queryKey' | 'queryFn'>) {
    return useQuery({
      queryKey: QUERY_KEYS.USER_ME,
      queryFn: async (): Promise<User> => {
        return apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
      },
      staleTime: 5 * 60 * 1000, // 5분
      ...options,
    })
  }

  /**
   * 사용자 목록 조회 (페이지네이션)
   */
  index(
    query?: CrudQuery,
    options?: Omit<UseQueryOptions<PaginatedResponse<User>, QueryError>, 'queryKey' | 'queryFn'>
  ) {
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

  /**
   * 특정 사용자 조회
   */
  show(
    id: string,
    options?: Omit<UseQueryOptions<User, QueryError>, 'queryKey' | 'queryFn'>
  ) {
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

  /**
   * 사용자 생성
   */
  create(options?: MutationOptions<User, SignUpRequest>) {
    return useMutation({
      mutationFn: async (data: SignUpRequest): Promise<User> => {
        return apiUtils.post<User>(API_ENDPOINTS.USERS.BASE, data)
      },
      onSuccess: (data, variables) => {
        // 사용자 목록 쿼리 무효화
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
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

  /**
   * 사용자 업데이트
   */
  update(options?: MutationOptions<User, { id: string; data: UpdateUserRequest }>) {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdateUserRequest }): Promise<User> => {
        return apiUtils.put<User>(API_ENDPOINTS.USERS.BY_ID(id), data)
      },
      onSuccess: (data, variables) => {
        // 관련 쿼리들 무효화
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(variables.id) })
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME })
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

  /**
   * 현재 사용자 정보 업데이트
   */
  updateMe(options?: MutationOptions<User, UpdateUserRequest>) {
    return useMutation({
      mutationFn: async (data: UpdateUserRequest): Promise<User> => {
        return apiUtils.put<User>(API_ENDPOINTS.USERS.ME, data)
      },
      onSuccess: (data, variables) => {
        // 현재 사용자 쿼리 업데이트
        this.queryClient.setQueryData(QUERY_KEYS.USER_ME, data)
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
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

  /**
   * 사용자 삭제
   */
  destroy(options?: MutationOptions<void, string>) {
    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        return apiUtils.delete<void>(API_ENDPOINTS.USERS.BY_ID(id))
      },
      onSuccess: (data, variables) => {
        // 관련 쿼리들 무효화
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS })
        this.queryClient.removeQueries({ queryKey: QUERY_KEYS.USER_BY_ID(variables) })
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
   * 쿼리 유틸리티 메서드들
   */
  invalidateQueries() {
    return {
      all: () => this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS }),
      me: () => this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_ME }),
      byId: (id: string) => this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_BY_ID(id) }),
    }
  }

  /**
   * 프리페치 유틸리티 메서드들
   */
  prefetch() {
    return {
      users: (query?: CrudQuery) => {
        const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
        return this.queryClient.prefetchQuery({
          queryKey: [...QUERY_KEYS.USERS, query],
          queryFn: async (): Promise<PaginatedResponse<User>> => {
            return apiUtils.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS.BASE}${queryString}`)
          },
          staleTime: 2 * 60 * 1000,
        })
      },
      user: (id: string) => {
        return this.queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.USER_BY_ID(id),
          queryFn: async (): Promise<User> => {
            return apiUtils.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
          },
          staleTime: 5 * 60 * 1000,
        })
      },
      me: () => {
        return this.queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.USER_ME,
          queryFn: async (): Promise<User> => {
            return apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
          },
          staleTime: 5 * 60 * 1000,
        })
      },
    }
  }
}

/**
 * 사용자 API 훅
 */
export const useUserApi = () => {
  return new UserApi()
} 