import { useQueryClient } from '@tanstack/react-query'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { User } from '@/types/user/crud-user'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'

/**
 * 쿼리 유틸리티 훅들
 */

// 쿼리 무효화 유틸리티
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateUsers: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    invalidateUser: (id: string) => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER.detail(id) }),
    invalidateMe: () => queryClient.invalidateQueries({ queryKey: ['users', 'me'] }),
    invalidateAuth: () => queryClient.invalidateQueries({ queryKey: ['auth'] }),
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
        queryKey: [...QUERY_KEYS.USER.lists(), query],
        queryFn: async (): Promise<PaginatedResponse<User>> => {
          return apiUtils.get<PaginatedResponse<User>>(`${API_ENDPOINTS.USERS.BASE}${queryString}`)
        },
        staleTime: 2 * 60 * 1000,
      })
    },
    prefetchUser: (id: string) => {
      return queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.USER.detail(id),
        queryFn: async (): Promise<User> => {
          return apiUtils.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
        },
        staleTime: 5 * 60 * 1000,
      })
    },
    prefetchMe: () => {
      return queryClient.prefetchQuery({
        queryKey: ['users', 'me'],
        queryFn: async (): Promise<User> => {
          return apiUtils.get<User>(API_ENDPOINTS.USERS.ME)
        },
        staleTime: 5 * 60 * 1000,
      })
    },
  }
} 