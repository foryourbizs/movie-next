import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { Post, CreatePostRequest, UpdatePostRequest } from '@/types/post/crud-post'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * Post CRUD API 훅 클래스 (자동 생성)
 * 
 * ⚠️  이 파일은 덮어쓰기 됩니다. 직접 수정하지 마세요.
 * 커스텀 기능은 use-post-api.ts 파일에 추가하세요.
 * 
 * 백엔드에서 허용된 메서드: index, show, create, update, destroy
 */
export class CrudPostApi {
  protected readonly baseUrl = 'posts'

  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

  /**
   * Post 목록 조회
   * @filters 허용된 필터: title, userId
   * @includes 허용된 관계: user
   */
  index = (query?: CrudQuery, options?: UseQueryOptions<PaginatedResponse<Post>>) => {
    return useQuery({
      queryKey: QUERY_KEYS.POST.list(query as Record<string, unknown>),
      queryFn: () => {
        const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
        return apiUtils.get<PaginatedResponse<Post>>(`${this.baseUrl}${queryString}`)
      },
      ...options,
    })
  }

  /**
   * Post 단일 조회
   * @includes 허용된 관계: user
   */
  show = (id: string, options?: UseQueryOptions<Post>) => {
    return useQuery({
      queryKey: QUERY_KEYS.POST.detail(id),
      queryFn: () => apiUtils.get<Post>(`${this.baseUrl}/${id}`),
      enabled: !!id,
      ...options,
    })
  }

  /**
   * Post 생성
   * @params 허용된 파라미터: title, content, userId
   */
  create = (options?: MutationOptions<Post, CreatePostRequest>) => {
    return useMutation({
      mutationFn: (data: CreatePostRequest) =>
        apiUtils.post<Post>(this.baseUrl, data),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.lists() })
        toast.success('Post가 생성되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('Post 생성에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * Post 수정
   * @params 허용된 파라미터: title, content, userId
   */
  update = (id: string, options?: MutationOptions<Post, UpdatePostRequest>) => {
    return useMutation({
      mutationFn: (data: UpdatePostRequest) =>
        apiUtils.put<Post>(`${this.baseUrl}/${id}`, data),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.lists() })
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.detail(id) })
        toast.success('Post가 수정되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('Post 수정에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * Post 삭제
   */
  destroy = (id: string, options?: MutationOptions<void, string>) => {
    return useMutation({
      mutationFn: () => apiUtils.delete<void>(`${this.baseUrl}/${id}`),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POST.lists() })
        this.queryClient.removeQueries({ queryKey: QUERY_KEYS.POST.detail(id) })
        toast.success('Post가 삭제되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('Post 삭제에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }
}

/**
 * Post CRUD API 훅 (자동 생성)
 */
export function useCrudPostApi() {
  const queryClient = useQueryClient()
  
  return new CrudPostApi(queryClient)
}
