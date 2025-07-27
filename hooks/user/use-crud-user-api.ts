import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { User, CreateUserRequest, UpdateUserRequest } from '@/types/user/crud-user'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * User CRUD API 훅 클래스 (자동 생성)
 * 
 * ⚠️  이 파일은 덮어쓰기 됩니다. 직접 수정하지 마세요.
 * 커스텀 기능은 use-user-api.ts 파일에 추가하세요.
 * 
 * 백엔드에서 허용된 메서드: index, show
 */
export class CrudUserApi {
  protected readonly baseUrl = 'users'

  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

  /**
   * User 목록 조회
   * @filters 허용된 필터: email
   * @includes 허용된 관계: posts
   */
  index = (query?: CrudQuery, options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return useQuery({
      queryKey: QUERY_KEYS.USER.list(query as Record<string, unknown>),
      queryFn: () => {
        const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
        return apiUtils.get<PaginatedResponse<User>>(`${this.baseUrl}${queryString}`)
      },
      ...options,
    })
  }

  /**
   * User 단일 조회
   * @includes 허용된 관계: posts
   */
  show = (id: string, options?: UseQueryOptions<User>) => {
    return useQuery({
      queryKey: QUERY_KEYS.USER.detail(id),
      queryFn: () => apiUtils.get<User>(`${this.baseUrl}/${id}`),
      enabled: !!id,
      ...options,
    })
  }
}

/**
 * User CRUD API 훅 (자동 생성)
 */
export function useCrudUserApi() {
  const queryClient = useQueryClient()
  
  return new CrudUserApi(queryClient)
}
