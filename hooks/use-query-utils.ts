import { useQueryClient } from '@tanstack/react-query'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { User } from '@/types/user'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'

/**
 * 쿼리 유틸리티 훅들
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