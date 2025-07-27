/**
 * User 타입 확장
 * 
 * 이 파일은 자동 생성되지 않습니다. 커스텀 타입을 여기에 추가하세요.
 */

import type {
  User as CrudUser,
  CreateUserRequest as CrudCreateUserRequest,
  UpdateUserRequest as CrudUpdateUserRequest,
  UserFilter as CrudUserFilter
} from './crud-user'

// 기본 타입 재사용 (필요시 확장 가능)
export interface User extends CrudUser {
  // 여기에 추가 필드를 정의하세요
  // customField?: string
}

// 생성 요청 타입 확장
export interface CreateUserRequest extends CrudCreateUserRequest {
  // 여기에 추가 필드를 정의하세요
}

// 수정 요청 타입 확장  
export interface UpdateUserRequest extends CrudUpdateUserRequest {
  // 여기에 추가 필드를 정의하세요
}

// 필터 타입 확장
export interface UserFilter extends CrudUserFilter {
  // 여기에 추가 필터를 정의하세요
  // customFilter?: string
}

// 커스텀 타입들을 여기에 추가하세요
export interface UserStats {
  totalCount: number
  activeCount: number
  // 추가 통계 필드들...
}

export type UserStatus = 'active' | 'inactive' | 'pending'

// 유틸리티 타입들
export type UserSummary = Pick<User, 'id' | 'name' | 'createdAt'>
export type UserFormData = Omit<CreateUserRequest, 'id'>
