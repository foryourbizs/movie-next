import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * User API 훅 클래스
 * 
 * 백엔드에서 허용된 메서드: index, show
 */
export class UserApi {
  private readonly baseUrl = '/api/v1/users'

  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

  /**
   * User 목록 조회
   */
  index = (query?: CrudQuery, options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return useQuery({
      queryKey: [...QUERY_KEYS.USER.lists(), query],
      queryFn: () => {
        const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
        return apiUtils.get<PaginatedResponse<User>>(`${this.baseUrl}${queryString}`)
      },
      ...options,
    })
  }

  /**
   * User 단일 조회
   */
  show = (id: string, options?: UseQueryOptions<User>) => {
    return useQuery({
      queryKey: [...QUERY_KEYS.USER.detail(id)],
      queryFn: () => apiUtils.get<User>(`${this.baseUrl}/${id}`),
      enabled: !!id,
      ...options,
    })
  }
}

/**
 * User API 훅
 */
export function useUserApi() {
  const queryClient = useQueryClient()
  
  return new UserApi(queryClient)
}
