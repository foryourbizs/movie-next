import { useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'

import { apiUtils } from '@/lib/api'
import { useCrudUserApi, CrudUserApi } from './use-crud-user-api'
import type { User, CreateUserRequest, UpdateUserRequest, UserStats } from '@/types/user/user'
import type { PaginatedResponse } from '@/types/api'

/**
 * User API 훅 (확장 가능)
 * 
 * 이 파일은 자동 생성되지 않습니다. 커스텀 메서드를 여기에 추가하세요.
 */
export class UserApi extends CrudUserApi {
  /**
   * 커스텀 메서드 예시: 활성 사용자만 조회
   * 
   * 아래 주석을 해제하고 필요에 맞게 수정하세요:
   */

  /*
  getActiveUsers = (options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return this.index({ 
      filter: { isActive: true } 
    }, options)
  }

  getInactiveUsers = (options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return this.index({ 
      filter: { isActive: false } 
    }, options)
  }

  searchByUserName = (name: string, options?: UseQueryOptions<PaginatedResponse<User>>) => {
    return this.index({ 
      filter: { name_like: name } 
    }, options)
  }

  getUserStats = () => {
    return useQuery({
      queryKey: ['user', 'stats'],
      queryFn: () => apiUtils.get<UserStats>(`${this.baseUrl}/stats`),
    })
  }
  */

  // 여기에 커스텀 메서드들을 추가하세요...
}

/**
 * User API 훅
 * 
 * CRUD 기능 + 커스텀 확장 기능 포함
 */
export function useUserApi() {
  const queryClient = useQueryClient()

  return new UserApi(queryClient)
}

// 편의를 위한 개별 export
export { useCrudUserApi }
