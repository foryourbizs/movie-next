/**
 * API 관련 상수 정의
 */

// API 기본 설정
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  VERSION: 'v1',
  PREFIX: 'api',
  TIMEOUT: 30000,
} as const

// API 엔드포인트
export const API_ENDPOINTS = {
  // 인증 관련
  AUTH: {
    SIGN_UP: 'auth/sign/up',
    SIGN_IN: 'auth/sign/in',
    SIGN_OUT: 'auth/sign/out',
    REFRESH: 'auth/sign/refresh',
    ME: 'auth/me',
  },

  // 소셜 로그인
  SOCIAL: {
    GOOGLE: 'auth/google',
    GOOGLE_CALLBACK: 'auth/google/callback',
    KAKAO: 'auth/kakao',
    KAKAO_CALLBACK: 'auth/kakao/callback',
    NAVER: 'auth/naver',
    NAVER_CALLBACK: 'auth/naver/callback',
    APPLE: 'auth/apple',
    APPLE_CALLBACK: 'auth/apple/callback',
  },

  // 사용자 관리
  USERS: {
    BASE: 'users',
    ME: 'users/me',
    BY_ID: (id: string) => `users/${id}`,
  },
} as const

// HTTP 상태 코드
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const

// 에러 메시지
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '네트워크 연결을 확인해 주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 정보를 확인해 주세요.',
  SERVER_ERROR: '서버 오류가 발생했습니다.',
  TOKEN_EXPIRED: '토큰이 만료되었습니다. 다시 로그인해 주세요.',
} as const

// 쿼리 키
export const QUERY_KEYS = {
  USERS: ['users'] as const,
  USER_BY_ID: (id: string) => ['users', id] as const,
  USER_ME: ['users', 'me'] as const,
  AUTH: ['auth'] as const,
} as const 