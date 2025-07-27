/**
 * 사용자 관련 타입 정의
 */

// 사용자 역할 타입
export type UserRole = 'user' | 'admin'

// 소셜 로그인 제공자 타입
export type AuthProvider = 'local' | 'google' | 'kakao' | 'naver' | 'apple'

// 사용자 기본 정보 타입
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: UserRole
  provider?: AuthProvider
  providerId?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// 사용자 업데이트 요청 타입
export interface UpdateUserRequest {
  name?: string
  phone?: string
  role?: UserRole
}

// 사용자 프로필 요청 타입
export interface UpdateProfileRequest {
  name?: string
  phone?: string
}

// 사용자 목록 필터 타입
export interface UserListFilter {
  role?: UserRole
  isActive?: boolean
  provider?: AuthProvider
  search?: string
}

// 사용자 통계 타입
export interface UserStats {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  usersByRole: {
    admin: number
    user: number
  }
  usersByProvider: Record<AuthProvider, number>
} 