/**
 * Post 관련 타입 정의
 */

// 관계 타입 import
import type { User } from '@/types/user/user'

// Post 기본 인터페이스
export interface Post {
  id: string
  title: string
  content: string
  summary?: string | null
  isPublished: boolean
  viewCount: number
  userId: string
  user?: User | null
  createdAt: string
  updatedAt: string
}

// Post 생성 요청 타입
export interface CreatePostRequest {
  title: string
  content: string
  summary?: string | null
  isPublished: boolean
  viewCount: number
  userId: string
}

// Post 수정 요청 타입
export interface UpdatePostRequest {
  title?: string
  content?: string
  summary?: string | null
  isPublished?: boolean
  viewCount?: number
  userId?: string
}

// Post 필터 타입
export interface PostFilter {
  title?: string
  content?: string
  summary?: string
  userId?: string
}
