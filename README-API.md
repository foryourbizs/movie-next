# ky HTTP 클라이언트 구현

이 프로젝트는 `.cursorrules`와 `.backendrules`에 따라 구현된 ky HTTP 클라이언트입니다.

## 📁 파일 구조

```
lib/
├── constants.ts     # API 엔드포인트 및 상수 정의
├── api.ts          # ky 클라이언트 설정 및 토큰 관리

types/
└── api.ts          # API 관련 타입 정의

hooks/               # 도메인별로 분리된 커스텀 훅들
├── use-api.ts      # 통합 export (기존 호환성 유지)
├── use-auth.ts     # 인증 관련 훅들 (로그인, 회원가입, 로그아웃)
├── use-users.ts    # 사용자 관리 훅들 (CRUD)
└── use-query-utils.ts # 쿼리 유틸리티 (무효화, 프리페치)

store/
└── auth-store.ts   # Zustand 인증 상태 관리

providers/
└── query-provider.tsx # React Query Provider
```

### 📚 훅 구조 개선사항

백엔드 route가 늘어날수록 `use-api.ts` 파일이 커지지 않도록 **도메인별로 분리**했습니다:

- **`use-auth.ts`**: 인증 관련 (로그인, 회원가입, 로그아웃, 토큰 갱신)
- **`use-users.ts`**: 사용자 관리 (목록 조회, 생성, 수정, 삭제)
- **`use-query-utils.ts`**: 공통 유틸리티 (쿼리 무효화, 프리페치)
- **`use-api.ts`**: 통합 export (기존 import 경로 유지)

### 새로운 도메인 추가 시:

```bash
# 예: 게시물 관리 기능 추가 시
hooks/
├── use-posts.ts    # 게시물 관련 훅들
└── use-api.ts      # 새 훅들을 추가로 export
```

## 🚀 주요 기능

### 1. 자동 토큰 관리
- JWT Access Token 및 Refresh Token 자동 관리
- 401 에러 시 자동 토큰 갱신
- localStorage 기반 토큰 영속화
- **토큰 만료 예방**: 만료 5분 전 자동 갱신
- **백그라운드 모니터링**: 30초마다 토큰 상태 체크
- **페이지 포커스 시 갱신**: 탭 전환 후 토큰 상태 확인

### 2. 에러 처리
- ky hooks를 사용한 중앙 집중식 에러 처리
- react-hot-toast를 통한 사용자 친화적 에러 메시지
- HTTP 상태 코드별 맞춤 에러 처리

### 3. NestJS @foryourdev/nestjs-crud 호환
- CRUD 쿼리 문자열 자동 생성 (underscore 구분자 방식)
- 페이지네이션, 필터링, 정렬 지원
- 보안 강화된 필터링 (allowedFilters 기반)

## 🔧 설정 방법

### 1. 환경 변수 설정

`.env.local` 파일에 다음 변수들을 설정하세요:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 2. Provider 설정

`app/layout.tsx`에 Provider를 추가하세요:

```tsx
import { QueryProvider } from '@/providers/query-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

## 💻 사용 예시

### 1. 인증 관련

```tsx
'use client'

// 방법 1: 통합 import (기존 방식 유지)
import { useLogin, useSignUp, useLogout } from '@/hooks/use-api'

// 방법 2: 직접 import (새로운 방식)
import { useLogin, useSignUp, useLogout } from '@/hooks/use-auth'

import { useAuth } from '@/store/auth-store'

export function AuthExample() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const loginMutation = useLogin({
    onSuccess: (data) => {
      login(data)
      // 로그인 성공 후 처리
    }
  })

  const handleLogin = () => {
    loginMutation.mutate({
      email: 'user@example.com',
      password: 'password123'
    })
  }

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>환영합니다, {user?.name}님!</p>
          <button onClick={() => logout()}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleLogin}>로그인</button>
      )}
    </div>
  )
}
```

### 2. 사용자 관리

```tsx
'use client'

// 방법 1: 통합 import
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-api'

// 방법 2: 직접 import  
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-users'

export function UserManagement() {
  const { data: users, isLoading } = useUsers({
    limit: 10,
    offset: 0,
    sort: ['-created_at']
  })

  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()

  const handleCreateUser = () => {
    createUserMutation.mutate({
      name: '새 사용자',
      email: 'newuser@example.com',
      password: 'password123'
    })
  }

  const handleUpdateUser = (id: string) => {
    updateUserMutation.mutate({
      id,
      data: {
        name: '수정된 이름'
      }
    })
  }

  if (isLoading) return <div>로딩 중...</div>

  return (
    <div>
      <button onClick={handleCreateUser}>사용자 생성</button>
      <ul>
        {users?.data.map(user => (
          <li key={user.id}>
            {user.name} ({user.email})
            <button onClick={() => handleUpdateUser(user.id)}>
              수정
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 3. 쿼리 유틸리티

```tsx
'use client'

import { useInvalidateQueries, usePrefetchQueries } from '@/hooks/use-query-utils'

export function CacheManagement() {
  const { invalidateUsers, invalidateAll } = useInvalidateQueries()
  const { prefetchUsers } = usePrefetchQueries()

  const handleRefresh = () => {
    invalidateUsers() // 사용자 목록 캐시 무효화
  }

  const handlePrefetch = () => {
    prefetchUsers({ limit: 10 }) // 사용자 데이터 미리 로드
  }

  return (
    <div>
      <button onClick={handleRefresh}>새로고침</button>
      <button onClick={handlePrefetch}>데이터 미리 로드</button>
    </div>
  )
}
```

### 4. 직접 API 호출

```tsx
import { apiUtils } from '@/lib/api'
import type { User } from '@/types/api'

// GET 요청
const users = await apiUtils.get<User[]>('/users')

// POST 요청
const newUser = await apiUtils.post<User>('/users', {
  name: '홍길동',
  email: 'hong@example.com'
})

// PUT 요청
const updatedUser = await apiUtils.put<User>(`/users/${userId}`, {
  name: '김철수'
})

// DELETE 요청
await apiUtils.delete(`/users/${userId}`)
```

## 🔍 고급 사용법

### 1. CRUD 쿼리 빌더

```tsx
import { useUsers } from '@/hooks/use-users'

export function AdvancedUserList() {
  // 이메일 필터링 (현재 백엔드에서 허용된 유일한 필터)
  const { data: gmailUsers } = useUsers({
    filter: {
      email_like: '%gmail.com%'  // Gmail 사용자 검색
    },
    sort: ['-created_at'],  // 생성일 내림차순
    limit: 20,
    offset: 0
  })

  // 페이지네이션 방식 1: offset/limit
  const { data: pagedUsers1 } = useUsers({
    limit: 10,
    offset: 20  // 3번째 페이지 (0-based)
  })

  // 페이지네이션 방식 2: page 객체
  const { data: pagedUsers2 } = useUsers({
    page: {
      number: 3,  // 페이지 번호 (1-based)
      size: 10    // 페이지 크기
    }
  })

  // 정렬 옵션
  const { data: sortedUsers } = useUsers({
    sort: ['name', '-created_at']  // 이름 오름차순, 생성일 내림차순
  })

  return <div>{/* 사용자 목록 렌더링 */}</div>
}
```

**⚠️ 중요**: 현재 백엔드는 `allowedFilters: ['email']`만 설정되어 있어 **이메일 필드만 필터링 가능**합니다.

### 2. 캐시 및 무효화 관리

```tsx
import { useInvalidateQueries, usePrefetchQueries } from '@/hooks/use-query-utils'

export function CacheManagement() {
  const { invalidateUsers, invalidateAll } = useInvalidateQueries()
  const { prefetchUsers } = usePrefetchQueries()

  const handleRefresh = () => {
    invalidateUsers() // 사용자 목록 캐시 무효화
  }

  const handlePrefetch = () => {
    prefetchUsers({ limit: 10 }) // 사용자 데이터 미리 로드
  }

  return (
    <div>
      <button onClick={handleRefresh}>새로고침</button>
      <button onClick={handlePrefetch}>데이터 미리 로드</button>
    </div>
  )
}
```

## 🛡️ 보안 고려사항

1. **토큰 저장**: Access Token은 메모리에, Refresh Token은 localStorage에 저장
2. **자동 갱신**: 401 에러 시 자동으로 토큰 갱신 시도
3. **토큰 만료**: 갱신 실패 시 자동 로그아웃 및 로그인 페이지 리디렉션
4. **HTTPS**: 프로덕션 환경에서는 반드시 HTTPS 사용

### 🔄 토큰 만료 방지 시스템

#### 1. 예방적 토큰 갱신
- **API 요청 전 체크**: 매 API 호출 시 토큰 만료 임박 여부 확인
- **자동 갱신**: 만료 5분 전 자동으로 토큰 갱신
- **백그라운드 모니터링**: 30초마다 토큰 상태 체크

#### 2. 사용자 경험 개선
- **무중단 갱신**: 사용자가 모르는 사이에 토큰 갱신
- **로그 출력**: 개발 모드에서 토큰 갱신 상태 콘솔 출력
- **페이지 포커스 시 갱신**: 오랫동안 탭을 떠났다가 돌아온 경우 토큰 체크

#### 3. 토큰 상태 동기화
- **Zustand Store 연동**: 토큰 갱신 시 인증 상태 자동 동기화
- **localStorage 연동**: 브라우저 재시작 시에도 토큰 상태 유지
- **만료 시간 추적**: 정확한 만료 예측을 위한 시간 추적

```tsx
// TokenMonitorProvider가 자동으로 처리하므로 별도 설정 불필요
// app/layout.tsx에서 이미 적용됨

// 수동으로 토큰 상태 확인하고 싶은 경우
import { tokenManager } from '@/lib/api'

// 토큰 만료 체크
const isExpired = tokenManager.isTokenExpired()
const isExpiringSoon = tokenManager.isTokenExpiringSoon()

// 수동 토큰 갱신
try {
  await tokenManager.refreshAccessToken()
  console.log('Token refreshed successfully')
} catch (error) {
  console.error('Manual token refresh failed:', error)
}
```

## 🔧 커스터마이징

### API 기본 설정 변경

`lib/constants.ts`에서 API 설정을 수정할 수 있습니다:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  VERSION: 'v1',
  PREFIX: 'api',
  TIMEOUT: 30000, // 30초
} as const
```

### 에러 메시지 커스터마이징

`lib/constants.ts`의 `ERROR_MESSAGES`를 수정하여 에러 메시지를 변경할 수 있습니다.

### 새로운 도메인의 API 엔드포인트 추가

예를 들어 게시물(Posts) 관리 기능을 추가하는 경우:

1. **상수 추가** (`lib/constants.ts`):
```typescript
export const API_ENDPOINTS = {
  // ... 기존 코드
  POSTS: {
    BASE: 'posts',
    BY_ID: (id: string) => `posts/${id}`,
  },
} as const

export const QUERY_KEYS = {
  // ... 기존 코드
  POSTS: ['posts'] as const,
  POST_BY_ID: (id: string) => ['posts', id] as const,
} as const
```

2. **타입 정의** (`types/api.ts`):
```typescript
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePostRequest {
  title: string
  content: string
}

export interface UpdatePostRequest {
  title?: string
  content?: string
}
```

3. **훅 파일 생성** (`hooks/use-posts.ts`):
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { Post, CreatePostRequest, UpdatePostRequest, PaginatedResponse, CrudQuery } from '@/types/api'

export const usePosts = (query?: CrudQuery) => {
  const queryString = query ? `?${apiUtils.buildCrudQuery(query as Record<string, unknown>)}` : ''
  
  return useQuery({
    queryKey: [...QUERY_KEYS.POSTS, query],
    queryFn: (): Promise<PaginatedResponse<Post>> => {
      return apiUtils.get<PaginatedResponse<Post>>(`${API_ENDPOINTS.POSTS.BASE}${queryString}`)
    },
    staleTime: 2 * 60 * 1000,
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreatePostRequest): Promise<Post> => {
      return apiUtils.post<Post>(API_ENDPOINTS.POSTS.BASE, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS })
    },
  })
}

// ... 기타 CRUD 훅들
```

4. **통합 export** (`hooks/use-api.ts`):
```typescript
// ... 기존 export들

// 게시물 관리 관련 훅들
export {
  usePosts,
  usePost,
  useCreatePost,
  useUpdatePost,
  useDeletePost
} from './use-posts'
```

## 📝 참고사항

- 모든 API 호출은 자동으로 JWT 토큰을 포함합니다
- 네트워크 에러 시 자동 재시도 (최대 3회)
- React Query DevTools는 개발 환경에서만 활성화됩니다
- TypeScript 타입 안전성을 위해 모든 API 응답에 타입을 지정하세요
- **기존 import 경로** (`@/hooks/use-api`)는 계속 사용 가능합니다
- **새로운 도메인별 import** (`@/hooks/use-auth`, `@/hooks/use-users` 등)도 사용 가능합니다 