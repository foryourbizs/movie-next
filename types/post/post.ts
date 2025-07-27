/**
 * Post 타입 확장
 * 
 * 이 파일은 자동 덮어쓰기되지 않습니다. 커스텀 타입을 여기에 추가하세요.
 */

import type {
  Post as CrudPost,
  CreatePostRequest as CrudCreatePostRequest,
  UpdatePostRequest as CrudUpdatePostRequest,
  PostFilter as CrudPostFilter
} from './crud-post'

// 기본 타입 재사용 (필요시 확장 가능)
export interface Post extends CrudPost {
  // 여기에 추가 필드를 정의하세요
  // customField?: string
}

// 생성 요청 타입 확장
export interface CreatePostRequest extends CrudCreatePostRequest {
  // 여기에 추가 필드를 정의하세요
}

// 수정 요청 타입 확장  
export interface UpdatePostRequest extends CrudUpdatePostRequest {
  // 여기에 추가 필드를 정의하세요
}

// 필터 타입 확장
export interface PostFilter extends CrudPostFilter {
  // 여기에 추가 필터를 정의하세요
  // customFilter?: string
}

// 커스텀 타입들을 여기에 추가하세요
export interface PostStats {
  totalCount: number
  activeCount: number
  // 추가 통계 필드들...
}

export type PostStatus = 'active' | 'inactive' | 'pending'

// 유틸리티 타입들
export type PostSummary = Pick<Post, 'id' | 'name' | 'createdAt'>
export type PostFormData = Omit<CreatePostRequest, 'id'>
