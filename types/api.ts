/**
 * API 관련 타입 정의
 */

// 기본 API 응답 타입
export interface ApiResponse<T = unknown> {
  data: T
  message: string
  status: number
}

// 에러 응답 타입
export interface ApiError {
  message: string
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

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  total: number
  page: number
  pageCount: number
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  name: string
  email: string
  password: string
  phone?: string
  role?: 'user' | 'admin'
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user?: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// 사용자 관련 타입
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'user' | 'admin'
  provider?: 'local' | 'google' | 'kakao' | 'naver' | 'apple'
  providerId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UpdateUserRequest {
  name?: string
  phone?: string
  role?: 'user' | 'admin'
}

// 소셜 로그인 관련 타입
export type SocialProvider = 'google' | 'kakao' | 'naver' | 'apple'

export interface SocialLoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  isNewUser: boolean
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

// CRUD 필터 타입 (NestJS @dataui/crud 호환)
export interface CrudFilter {
  field: string
  operator: '$eq' | '$ne' | '$gt' | '$lt' | '$gte' | '$lte' | '$starts' | '$ends' | '$cont' | '$excl' | '$in' | '$notin' | '$isnull' | '$notnull'
  value: string | number | boolean | null
}

export interface CrudQuery {
  filter?: string | CrudFilter[]
  or?: string | CrudFilter[]
  sort?: string[]
  join?: string[]
  limit?: number
  offset?: number
  page?: number
  cache?: number
}

// Zustand 스토어 타입
export interface AuthStore {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (response: AuthResponse) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
  setTokens: (accessToken: string, refreshToken?: string) => void
}

// React Query 관련 타입
export interface QueryError extends Error {
  status?: number
  statusCode?: number
  response?: {
    data?: ApiError
  }
}

export interface MutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: QueryError, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: QueryError | null, variables: TVariables) => void
} 