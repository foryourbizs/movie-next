/**
 * 기본 API 관련 타입 정의
 */

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
  data: T
  message: string
  status: number
}

// 에러 응답 타입 (@foryourdev/nestjs-crud CrudExceptionFilter 적용)
export interface ApiError {
  message: string[]  // 항상 배열 형태
  statusCode: number
  error?: string
  details?: Record<string, unknown>
}

// 페이지네이션 관련 타입
export interface PaginationParams {
  page?: number
  limit?: number
  sort?: string
  filter?: string
}

// nestjs-crud 페이지네이션 응답 구조
export interface PaginatedResponse<T> {
  data: T[]
  metadata: {
    operation: string
    timestamp: string
    affectedCount: number
    includedRelations?: string[]
    excludedFields?: string[]
    pagination: {
      type: 'offset' | 'cursor' | 'number'
      total: number
      page?: number
      pages?: number
      totalPages?: number
      offset?: number
      limit?: number
      nextCursor?: string
    }
  }
}

// HTTP 메서드 타입
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

// API 요청 옵션 타입
export interface ApiRequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  params?: Record<string, unknown>
  timeout?: number
  retry?: number
} 