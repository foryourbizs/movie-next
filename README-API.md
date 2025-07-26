# ky HTTP 클라이언트 구현

이 프로젝트는 `.cursorrules`와 `.backendrules`에 따라 구현된 ky HTTP 클라이언트입니다.

## 📁 파일 구조

```
lib/
├── constants.ts     # API 엔드포인트 및 상수 정의
├── api.ts          # ky 클라이언트 설정 및 토큰 관리

types/
└── api.ts          # API 관련 타입 정의

hooks/
└── use-api.ts      # TanStack Query 커스텀 훅

store/
└── auth-store.ts   # Zustand 인증 상태 관리

providers/
└── query-provider.tsx # React Query Provider
```

## 🚀 주요 기능

### 1. 자동 토큰 관리
- JWT Access Token 및 Refresh Token 자동 관리
- 401 에러 시 자동 토큰 갱신
- localStorage 기반 토큰 영속화

### 2. 에러 처리
- ky hooks를 사용한 중앙 집중식 에러 처리
- react-hot-toast를 통한 사용자 친화적 에러 메시지
- HTTP 상태 코드별 맞춤 에러 처리

### 3. NestJS @dataui/crud 호환
- CRUD 쿼리 문자열 자동 생성
- 페이지네이션, 필터링, 정렬 지원

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

import { useLogin, useSignUp, useLogout } from '@/hooks/use-api'
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

import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/use-api'

export function UserManagement() {
  const { data: users, isLoading } = useUsers({
    limit: 10,
    page: 1,
    sort: ['createdAt,DESC']
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

### 3. 권한 확인

```tsx
'use client'

import { usePermissions } from '@/store/auth-store'

export function ProtectedComponent() {
  const { canManageUsers, canEditProfile } = usePermissions()

  return (
    <div>
      {canManageUsers && (
        <button>사용자 관리</button>
      )}
      {canEditProfile('user-id') && (
        <button>프로필 수정</button>
      )}
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
import { useUsers } from '@/hooks/use-api'

export function AdvancedUserList() {
  const { data: activeUsers } = useUsers({
    filter: 'isActive||$eq||true',
    sort: ['name,ASC'],
    limit: 20,
    page: 1
  })

  const { data: adminUsers } = useUsers({
    filter: 'role||$eq||admin',
    join: ['profile']
  })

  // 복합 필터
  const { data: filteredUsers } = useUsers({
    filter: [
      'isActive||$eq||true',
      'createdAt||$gte||2024-01-01'
    ],
    or: ['role||$eq||admin', 'role||$eq||moderator']
  })

  return <div>{/* 사용자 목록 렌더링 */}</div>
}
```

### 2. 캐시 및 무효화 관리

```tsx
import { useInvalidateQueries, usePrefetchQueries } from '@/hooks/use-api'

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

### 새로운 API 엔드포인트 추가

1. `lib/constants.ts`에 엔드포인트 추가
2. `types/api.ts`에 관련 타입 정의
3. `hooks/use-api.ts`에 커스텀 훅 생성

## 📝 참고사항

- 모든 API 호출은 자동으로 JWT 토큰을 포함합니다
- 네트워크 에러 시 자동 재시도 (최대 3회)
- React Query DevTools는 개발 환경에서만 활성화됩니다
- TypeScript 타입 안전성을 위해 모든 API 응답에 타입을 지정하세요 