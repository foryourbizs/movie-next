/**
 * User 관련 타입 정의
 */

// 관계 타입 import
import type { Post } from '@/types/post/post'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export enum UserProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  APPLE = 'apple',
  KAKAO = 'kakao',
  NAVER = 'naver'
}

// User 기본 인터페이스
export interface User {
  id: string
  name: string
  email: string
  password?: string | null
  phone?: string | null
  role: UserRole
  provider: UserProvider
  providerId?: string | null
  refreshToken?: string | null
  posts?: Post[] | null
  createdAt: string
  updatedAt: string
}

// User 생성 요청 타입
export interface CreateUserRequest {
  phone?: string | null
}

// User 수정 요청 타입
export interface UpdateUserRequest {
  phone?: string | null
}

// User 필터 타입
export interface UserFilter {
  email?: string
}
