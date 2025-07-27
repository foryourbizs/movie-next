# ky HTTP 클라이언트 구현 가이드

Next.js 15 + TypeScript 프로젝트를 위한 완전한 HTTP 클라이언트 솔루션입니다.

## ✨ 주요 특징

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
import { TokenMonitorProvider } from '@/providers/token-monitor-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <QueryProvider>
          <TokenMonitorProvider>
            {children}
          </TokenMonitorProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

## 🔧 구조적 개선 사항

#### 1. **도메인별 훅 분리**
API 훅들을 도메인별로 분리하여 코드 구조를 개선했습니다:

- **`hooks/use-auth.ts`**: 인증 관련 클래스 (`AuthApi`)
- **`hooks/use-users.ts`**: 사용자 관리 클래스 (`UserApi`)
- **`hooks/use-query-utils.ts`**: 쿼리 유틸리티 훅들

#### 2. **인증 로직 분리**
관심사 분리를 위해 HTTP 클라이언트와 인증 로직을 분리했습니다:

- **`lib/api.ts`**: 순수 HTTP 클라이언트 기능만 (GET, POST, PUT, PATCH, DELETE)
- **`lib/token-manager.ts`**: JWT 토큰 관리, 자동 갱신, 인증 상태 처리

#### 3. **클래스 기반 API**
모든 API 작업을 직관적인 클래스 인터페이스로 통합했습니다:

**장점**:
- 🎯 **일관된 API**: 모든 작업이 하나의 객체에서 관리
- 📚 **직관적인 메서드명**: CRUD 작업을 명확하게 표현 (`index`, `show`, `create`, `update`, `destroy`)
- 🔧 **통합 유틸리티**: 캐시 관리, 프리페치 등을 포함
- 🎯 **통일된 인터페이스**: 모든 도메인에서 일관된 API 사용

### 새로운 도메인 추가 시:
1. `hooks/use-{domain}.ts` 파일 생성
2. `{Domain}Api` 클래스 구현
3. 필요한 타입을 `types/api.ts`에 추가

## 💻 사용 예시

### 🎯 **클래스 기반 API**

#### 1. 인증 API 

```tsx
'use client'

import { useAuthApi } from '@/hooks/use-auth'
import { useAuth } from '@/store/auth-store'

export function AuthExample() {
  const authApi = useAuthApi()
  const { login } = useAuth()

  // 로그인
  const loginMutation = authApi.login({
    onSuccess: (data) => {
      login(data)
    }
  })

  // 회원가입
  const signUpMutation = authApi.signUp({
    onSuccess: (data) => {
      login(data)
    }
  })

  // 로그아웃
  const logoutMutation = authApi.logout()

  // 토큰 상태 확인
  const checkTokenStatus = async () => {
    const utils = authApi.utils()
    const status = await utils.getTokenStatus()
    console.log('Token Status:', status)
  }

  return (
    <div>
      <button onClick={() => loginMutation.mutate({
        email: 'user@example.com',
        password: 'password123'
      })}>
        로그인
      </button>
      
      <button onClick={() => signUpMutation.mutate({
        name: '홍길동',
        email: 'hong@example.com', 
        password: 'password123'
      })}>
        회원가입
      </button>
      
      <button onClick={() => logoutMutation.mutate()}>
        로그아웃
      </button>
      
      <button onClick={checkTokenStatus}>
        토큰 상태 확인
      </button>
    </div>
  )
}
```

#### 2. 사용자 API

```tsx
'use client'

import { useUserApi } from '@/hooks/use-users'

export function UserExample() {
  const userApi = useUserApi()

  // 조회 작업
  const { data: currentUser } = userApi.me() // 내 정보
  const { data: users } = userApi.index({ limit: 10 }) // 목록
  const { data: user } = userApi.show('user-id') // 특정 유저

  // 수정 작업
  const createMutation = userApi.create()
  const updateMutation = userApi.update()
  const updateMeMutation = userApi.updateMe()
  const deleteMutation = userApi.destroy()

  // 유틸리티
  const handleRefresh = () => {
    const invalidate = userApi.invalidateQueries()
    invalidate.all() // 모든 사용자 쿼리 새로고침
  }

  const handlePrefetch = () => {
    const prefetch = userApi.prefetch()
    prefetch.users({ limit: 20 }) // 미리 로드
  }

  return (
    <div>
      {/* 현재 사용자 */}
      <p>안녕하세요, {currentUser?.name}님!</p>
      
      {/* 사용자 목록 */}
      <ul>
        {users?.data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      
      {/* 액션 버튼들 */}
      <button onClick={() => createMutation.mutate({
        name: '새 사용자',
        email: 'new@example.com',
        password: 'password123'
      })}>
        사용자 생성
      </button>
      
      <button onClick={handleRefresh}>
        새로고침
      </button>
    </div>
  )
}
```

이제 모든 API 호출이 클래스 기반으로 통일되어 더 일관되고 직관적인 개발 경험을 제공합니다! 🎉

## 📖 클래스 기반 API 레퍼런스

### 🔐 AuthApi 메서드

```tsx
const authApi = useAuthApi()

// 인증 작업
authApi.login(options?)        // 로그인
authApi.signUp(options?)       // 회원가입  
authApi.logout(options?)       // 로그아웃
authApi.refreshToken(options?) // 토큰 갱신

// 유틸리티
const utils = authApi.utils()
utils.getTokenManager()        // 토큰 관리자 접근
utils.getTokenStatus()         // 토큰 상태 확인
utils.invalidateAuth()         // 인증 쿼리 무효화
utils.clearCache()             // 캐시 전체 삭제
```

### 👥 UserApi 메서드

```tsx
const userApi = useUserApi()

// 조회 작업 (Query)
userApi.me(options?)           // 현재 사용자 정보
userApi.index(query?, options?) // 사용자 목록 (페이지네이션)
userApi.show(id, options?)     // 특정 사용자 조회

// 수정 작업 (Mutation)  
userApi.create(options?)       // 사용자 생성
userApi.update(options?)       // 사용자 수정
userApi.updateMe(options?)     // 내 정보 수정
userApi.destroy(options?)      // 사용자 삭제

// 쿼리 유틸리티
const invalidate = userApi.invalidateQueries()
invalidate.all()               // 모든 사용자 쿼리 무효화
invalidate.me()                // 내 정보만 무효화
invalidate.byId(id)            // 특정 사용자만 무효화

// 프리페치 유틸리티  
const prefetch = userApi.prefetch()
prefetch.users(query?)         // 사용자 목록 미리 로드
prefetch.user(id)              // 특정 사용자 미리 로드
prefetch.me()                  // 내 정보 미리 로드
```

### 🔄 메서드명 규칙

| 작업 | 메서드명 | 설명 |
|------|----------|------|
| 목록 조회 | `index()` | 페이지네이션된 목록 |
| 단일 조회 | `show(id)` | 특정 항목 조회 |
| 생성 | `create()` | 새 항목 생성 |
| 수정 | `update()` | 기존 항목 수정 |
| 삭제 | `destroy()` | 항목 삭제 |
| 내 정보 | `me()` | 현재 사용자 관련 |

## 🔍 고급 사용법

### 1. CRUD 쿼리 빌더

`@foryourdev/nestjs-crud` 호환 쿼리 빌더를 사용하여 복잡한 조건의 데이터를 쉽게 조회할 수 있습니다:

```tsx
const userApi = useUserApi()

// 페이지네이션과 정렬
const { data } = userApi.index({
  limit: 20,
  offset: 0,
  sort: ['-created_at', 'name'] // 생성일 내림차순, 이름 오름차순
})

// 필터링
const { data: filteredUsers } = userApi.index({
  limit: 10,
  filter: {
    'email_icontains': 'gmail',     // 이메일에 'gmail' 포함
    'created_at_gte': '2024-01-01'  // 2024년 1월 1일 이후 가입
  }
})
```

### 2. 토큰 상태 모니터링

토큰 만료를 사전에 방지하기 위한 모니터링 시스템:

```tsx
const authApi = useAuthApi()

// 토큰 상태 확인
const checkToken = async () => {
  const utils = authApi.utils()
  const status = await utils.getTokenStatus()
  
  console.log('Access Token:', status.hasAccessToken)
  console.log('Refresh Token:', status.hasRefreshToken)
  console.log('Is Expired:', status.isExpired)
  console.log('Is Expiring Soon:', status.isExpiringSoon)
}
```

### 3. 캐시 최적화

쿼리 캐시를 효율적으로 관리하여 성능을 향상시킬 수 있습니다:

```tsx
const userApi = useUserApi()

// 특정 사용자 데이터 프리페치
const prefetchUser = async (userId: string) => {
  const prefetch = userApi.prefetch()
  await prefetch.user(userId)
}

// 사용자 목록 미리 로드
const prefetchUsers = async () => {
  const prefetch = userApi.prefetch()
  await prefetch.users({ limit: 50 })
}

// 캐시 무효화
const refreshData = () => {
  const invalidate = userApi.invalidateQueries()
  invalidate.all() // 모든 사용자 관련 캐시 삭제
}
```

## 🚨 주의사항

### 1. 토큰 만료 방지
- 백그라운드에서 자동으로 토큰을 모니터링합니다
- 만료 5분 전에 자동으로 갱신을 시도합니다
- 페이지 포커스 시에도 토큰 상태를 확인합니다

### 2. 에러 처리
- 모든 API 에러는 `react-hot-toast`로 자동 표시됩니다
- 401 에러 시 자동으로 토큰 갱신을 시도합니다
- 갱신 실패 시 로그인 페이지로 리다이렉트됩니다

### 3. 성능 최적화
- TanStack Query의 캐싱 전략을 활용합니다
- 사용자 정보는 5분간 캐시됩니다
- 사용자 목록은 2분간 캐시됩니다

## 🔧 커스터마이징

### 새로운 도메인 API 추가

예를 들어, 게시물(Post) 도메인을 추가하려면:

1. **타입 정의** (`types/api.ts`):
```tsx
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

2. **API 클래스 생성** (`hooks/use-posts.ts`):
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { Post, CreatePostRequest, UpdatePostRequest } from '@/types/api'

class PostApi {
  private queryClient = useQueryClient()

  // 게시물 목록 조회
  index(query?: CrudQuery) {
    const queryString = query ? `?${apiUtils.buildCrudQuery(query)}` : ''
    return useQuery({
      queryKey: ['posts', query],
      queryFn: async () => {
        return apiUtils.get<PaginatedResponse<Post>>(`/posts${queryString}`)
      },
      staleTime: 2 * 60 * 1000,
    })
  }

  // 특정 게시물 조회
  show(id: string) {
    return useQuery({
      queryKey: ['posts', id],
      queryFn: async () => {
        return apiUtils.get<Post>(`/posts/${id}`)
      },
      staleTime: 5 * 60 * 1000,
    })
  }

  // 게시물 생성
  create() {
    return useMutation({
      mutationFn: async (data: CreatePostRequest) => {
        return apiUtils.post<Post>('/posts', data)
      },
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['posts'] })
      },
    })
  }

  // 게시물 수정
  update() {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: UpdatePostRequest }) => {
        return apiUtils.put<Post>(`/posts/${id}`, data)
      },
      onSuccess: (_, { id }) => {
        this.queryClient.invalidateQueries({ queryKey: ['posts'] })
        this.queryClient.invalidateQueries({ queryKey: ['posts', id] })
      },
    })
  }

  // 게시물 삭제
  destroy() {
    return useMutation({
      mutationFn: async (id: string) => {
        return apiUtils.delete<void>(`/posts/${id}`)
      },
      onSuccess: (_, id) => {
        this.queryClient.invalidateQueries({ queryKey: ['posts'] })
        this.queryClient.removeQueries({ queryKey: ['posts', id] })
      },
    })
  }
}

export const usePostApi = () => {
  return new PostApi()
}
```

3. **상수 추가** (`lib/constants.ts`):
```tsx
export const API_ENDPOINTS = {
  // ... 기존 엔드포인트
  POSTS: {
    BASE: 'posts',
    BY_ID: (id: string) => `posts/${id}`,
  },
} as const

export const QUERY_KEYS = {
  // ... 기존 키
  POSTS: ['posts'],
  POST_BY_ID: (id: string) => ['posts', id],
} as const
```

4. **사용 예시**:
```tsx
const postApi = usePostApi()

// 게시물 목록 조회
const { data: posts } = postApi.index({ limit: 10, sort: ['-created_at'] })

// 게시물 생성
const createMutation = postApi.create()
createMutation.mutate({
  title: '새 게시물',
  content: '게시물 내용...'
})

// 게시물 수정
const updateMutation = postApi.update()
updateMutation.mutate({
  id: 'post-id',
  data: { title: '수정된 제목' }
})
```

이런 방식으로 쉽게 새로운 도메인을 추가할 수 있습니다!

## 📝 체크리스트

구현을 완료한 후 다음 항목들을 확인해보세요:

### ✅ 기본 설정
- [ ] 환경 변수 설정 (`.env.local`)
- [ ] Provider 설정 (`app/layout.tsx`)
- [ ] 의존성 설치 완료

### ✅ 인증 시스템
- [ ] 로그인/회원가입 폼 작동
- [ ] 토큰 자동 갱신 확인
- [ ] 로그아웃 기능 확인
- [ ] 401 에러 시 자동 처리 확인

### ✅ 사용자 관리
- [ ] 사용자 목록 조회/필터링
- [ ] 프로필 수정 기능
- [ ] 권한 기반 접근 제어

### ✅ 에러 처리
- [ ] API 에러 시 토스트 메시지 표시
- [ ] 네트워크 에러 처리
- [ ] 로딩 상태 표시

### ✅ 성능 최적화
- [ ] 쿼리 캐싱 작동 확인
- [ ] 불필요한 리렌더링 방지
- [ ] 토큰 모니터링 작동 확인

모든 항목이 체크되면 구현이 완료된 것입니다! 🎉 