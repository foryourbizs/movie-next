# 🚀 Next.js 15 + TypeScript 풀스택 템플릿

> **외주 개발 최적화된 생산성 극대화 템플릿**  
> 현대적인 기술 스택과 자동화 도구로 개발 속도를 3-5배 향상시키는 프로덕션 레디 템플릿

[![Next.js](https://img.shields.io/badge/Next.js-15.4.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ 주요 특징

### 🎯 **외주 개발 특화 기능**
- **🤖 CRUD 자동 생성**: 새로운 엔티티를 30초 만에 완전한 CRUD로 생성
- **⚡ 쿼리 빌더**: 복잡한 API 쿼리를 체이닝으로 간편하게 구성
- **📝 VSCode 스니펫**: 보일러플레이트 코드를 3-5초 만에 자동 생성
- **🎨 완성도 높은 UI**: shadcn/ui 기반의 프로덕션 레디 컴포넌트

### 🏗️ **현대적 기술 스택**
- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **HTTP Client**: ky (경량, 현대적 fetch 래퍼)
- **상태 관리**: TanStack Query (서버) + Zustand (클라이언트)
- **폼 관리**: React Hook Form + Zod 스키마 검증
- **UI 컴포넌트**: shadcn/ui + Lucide React 아이콘
- **인증**: JWT (Access + Refresh Token) 자동 관리

### 🔒 **강력한 인증 시스템**
- JWT 토큰 자동 갱신 및 만료 관리
- 권한 기반 라우트 보호
- 클라이언트 사이드 하이드레이션 최적화
- 토큰 만료 감지 및 프로액티브 갱신

---

## 📦 설치 및 실행

### **필수 요구사항**
- Node.js 18.17+ 
- npm 또는 yarn

### **빠른 시작**
```bash
# 1. 레포지토리 클론
git clone <your-repo-url>
cd template-typescript-nextjs

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# API_BASE_URL 등 설정

# 4. 개발 서버 실행
npm run dev
```

### **빌드 및 배포**
```bash
# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm start

# 타입 체크
npm run type-check

# 린트 체크
npm run lint
```

---

## 🏗️ 프로젝트 구조

```
📦 template-typescript-nextjs/
├── 📁 app/                    # Next.js 15 App Router
│   ├── 📁 auth/              # 인증 페이지 (로그인/회원가입)
│   ├── 📁 dashboard/         # 대시보드 (메인 허브)
│   ├── 📁 profile/           # 사용자 프로필
│   ├── 📁 users/             # 사용자 관리
│   ├── layout.tsx            # 루트 레이아웃
│   └── page.tsx              # 홈 페이지
├── 📁 components/            # 재사용 가능한 컴포넌트
│   ├── 📁 ui/               # shadcn/ui 기본 컴포넌트
│   ├── 📁 forms/            # 폼 컴포넌트 (RHF + Zod)
│   ├── 📁 common/           # 공통 비즈니스 컴포넌트
│   └── 📁 layout/           # 레이아웃 컴포넌트
├── 📁 hooks/                # 커스텀 React 훅
│   ├── use-auth-api.ts      # 인증 API 훅 (클래스 기반)
│   ├── use-user-api.ts      # 사용자 API 훅 (클래스 기반)
│   ├── use-query-state.ts   # 쿼리 상태 관리 훅
│   └── use-token-monitor.ts # 토큰 모니터링 훅
├── 📁 lib/                  # 유틸리티 및 설정
│   ├── api.ts              # ky HTTP 클라이언트 설정
│   ├── token-manager.ts    # JWT 토큰 관리
│   ├── query-builder.ts    # API 쿼리 빌더 클래스
│   ├── constants.ts        # 상수 정의
│   └── utils.ts            # 유틸리티 함수
├── 📁 store/               # Zustand 상태 관리
│   └── auth-store.ts       # 인증 상태 관리
├── 📁 types/               # TypeScript 타입 정의
│   ├── api.ts             # API 관련 타입
│   └── auth.ts            # 인증 관련 타입
├── 📁 providers/          # React Context Providers
│   ├── query-provider.tsx  # TanStack Query Provider
│   └── token-monitor-provider.tsx # 토큰 모니터링
├── 📁 scripts/            # 자동화 스크립트
│   └── generate-crud.js    # CRUD 자동 생성기
├── 📁 .vscode/            # VSCode 설정
│   └── typescript-react.code-snippets # 코드 스니펫
└── 📄 docs/               # 상세 문서
    ├── README-API.md       # API 사용 가이드
    ├── USAGE-GUIDE.md      # 상세 사용법
    └── SPEED-GUIDE.md      # 개발 속도 최적화 가이드
```

---

## 🚀 개발 속도 극대화 도구들

### 1. **🤖 CRUD 자동 생성기**
새로운 엔티티의 전체 CRUD를 30초 만에 생성:

```bash
# 대화형 CRUD 생성
node scripts/generate-crud.js

# 📝 입력 예시:
# Entity name: Post
# Fields: title:string, content:text, author:string, published:boolean
```

**자동 생성되는 파일들:**
- `types/post.ts` - TypeScript 타입 정의
- `hooks/use-post-api.ts` - TanStack Query 훅 (클래스 기반)
- `components/forms/post-form.tsx` - 생성/수정 폼
- `components/common/post-list.tsx` - 목록 컴포넌트
- `app/posts/page.tsx` - 목록 페이지
- `app/posts/[id]/page.tsx` - 상세 페이지
- `app/posts/create/page.tsx` - 생성 페이지

### 2. **⚡ 쿼리 빌더**
복잡한 API 쿼리를 체이닝으로 간편하게 구성:

```typescript
import { createQuery } from '@/lib/query-builder'

// 🔗 체이닝으로 쿼리 구성
const query = createQuery()
  .paginate(1, 20)
  .sortDesc('createdAt')
  .filterEq('status', 'active')
  .filterLike('name', 'john')
  .include(['profile', 'posts'])
  .build()

// 📡 API 호출
const { data } = userApi.index(query)
```

**쿼리 템플릿 제공:**
```typescript
import { QueryTemplates } from '@/lib/query-builder'

// 📋 미리 정의된 쿼리 패턴
const activeUsers = QueryTemplates.activeUsers()
const recentPosts = QueryTemplates.recentPosts()
const adminUsers = QueryTemplates.adminUsers()
```

### 3. **📝 VSCode 스니펫**
보일러플레이트 코드를 3-5초 만에 자동 생성:

| 스니펫 | 단축키 | 생성 내용 |
|--------|--------|-----------|
| `rfc` | React Function Component | 완전한 함수형 컴포넌트 |
| `api-hook` | API Hook Class | TanStack Query 클래스 |
| `form-comp` | Form Component | RHF + Zod 폼 컴포넌트 |
| `list-comp` | List Component | 필터링/페이지네이션 목록 |
| `next-page` | Next.js Page | App Router 페이지 |
| `zustand-store` | Zustand Store | 상태 관리 스토어 |

### 4. **🎨 useQueryState 훅**
페이지네이션, 정렬, 필터링을 한 번에 관리:

```typescript
import { useQueryState } from '@/hooks/use-query-state'

function UserList() {
  const queryState = useQueryState({
    defaultLimit: 20,
    defaultSort: '-createdAt',
  })

  // 🎯 간단한 API 호출
  const { data } = userApi.index(queryState.query)

  return (
    <div>
      {/* 🔍 검색 */}
      <input 
        value={queryState.filters.email || ''} 
        onChange={(e) => queryState.searchBy('email', e.target.value)}
      />
      
      {/* 📊 정렬 */}
      <select 
        value={queryState.sort} 
        onChange={(e) => queryState.setSort(e.target.value)}
      >
        <option value="-createdAt">최신순</option>
        <option value="name">이름순</option>
      </select>
      
      {/* 📄 페이지네이션 */}
      <button onClick={queryState.prevPage}>이전</button>
      <span>{queryState.page}</span>
      <button onClick={queryState.nextPage}>다음</button>
    </div>
  )
}
```

---

## 🎯 클래스 기반 API 패턴

### **일관된 API 인터페이스**
```typescript
// 🏗️ 모든 API는 클래스 패턴으로 통일
const userApi = useUserApi()
const authApi = useAuthApi()
const postApi = usePostApi() // 자동 생성됨

// 📡 CRUD 작업
userApi.index(query)    // 목록 조회
userApi.show(id)        // 단일 조회  
userApi.create(data)    // 생성
userApi.update(id, data) // 수정
userApi.destroy(id)     // 삭제

// 🔐 인증 작업
authApi.login(credentials)
authApi.signUp(userData)
authApi.logout()
authApi.refreshToken()
```

### **TanStack Query 통합**
```typescript
// ✅ 자동 캐싱, 재시도, 에러 처리
const { 
  data: users, 
  isLoading, 
  error,
  refetch 
} = userApi.index(query)

// ✅ Mutation with 자동 invalidation
const createUser = userApi.create()
createUser.mutate(newUser, {
  onSuccess: () => {
    toast.success('사용자가 생성되었습니다!')
    // 🔄 자동으로 사용자 목록 다시 불러오기
  }
})
```

---

## 🔒 인증 시스템

### **JWT 토큰 자동 관리**
```typescript
// 🔐 자동 토큰 관리 (백그라운드에서 동작)
- Access Token 자동 갱신
- Refresh Token 순환 갱신
- 토큰 만료 5분 전 프로액티브 갱신
- 401 에러 시 자동 재시도
- 토큰 만료 시 자동 로그아웃
```

### **권한 기반 라우트 보호**
```typescript
// 🛡️ 컴포넌트 레벨 권한 체크
const { isAuthenticated, canManageUsers } = useAuth()

// 🚪 자동 리다이렉트
if (!isAuthenticated) {
  redirect('/auth/signin') 
}

// 👤 권한별 UI 표시
{canManageUsers && (
  <AdminPanel />
)}
```

### **하이드레이션 최적화**
```typescript
// 💧 클라이언트 하이드레이션 대응
const { hydrated } = useAuth()

if (!hydrated) {
  return <LoadingSpinner /> // SSR/CSR 불일치 방지
}
```

---

## 📊 대시보드 기능

### **🎛️ 통합 네비게이션 허브**
- **권한별 메뉴 자동 표시**: 일반 사용자 vs 관리자
- **시각적 카드 기반 네비게이션**: 아이콘 + 설명
- **개발 상태 표시**: 완료된 기능 vs 개발 예정
- **원클릭 이동**: 모든 주요 페이지로 즉시 이동

### **📈 관리자 전용 통계**
- 총 사용자 수
- 활성 사용자 수  
- 이번 달 신규 가입자
- 시스템 로그 현황

---

## 🎨 UI/UX 특징

### **shadcn/ui 기반 컴포넌트**
```typescript
// 🎨 일관된 디자인 시스템
import { Button, Card, Input } from '@/components/ui'

// 🎯 커스텀 컴포넌트에서 확장
<Button variant="outline" size="sm">
  클릭하세요
</Button>
```

### **반응형 디자인**
```scss
/* 📱 Mobile First 접근 */
.container {
  @apply w-full px-4;
  @apply md:max-w-2xl md:mx-auto;
  @apply lg:max-w-4xl;
  @apply xl:max-w-6xl;
}
```

### **다크 모드 지원 준비**
```typescript
// 🌙 다크 모드 토글 (확장 가능)
const { theme, setTheme } = useTheme()
```

---

## 🛠️ 개발 도구 및 설정

### **TypeScript 엄격 모드**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### **ESLint + Prettier**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ]
}
```

### **경로 별칭 설정**
```typescript
// tsconfig.json
{
  "paths": {
    "@/*": ["./app/*"],
    "@/components/*": ["./components/*"],
    "@/lib/*": ["./lib/*"],
    "@/hooks/*": ["./hooks/*"],
    "@/types/*": ["./types/*"],
    "@/store/*": ["./store/*"]
  }
}
```

---

## 📖 상세 문서

### **📚 추가 가이드**
- [📡 **API 사용 가이드**](./README-API.md) - API 훅 사용법 상세 설명
- [🔧 **상세 사용법**](./USAGE-GUIDE.md) - 컴포넌트별 사용 방법
- [⚡ **개발 속도 가이드**](./SPEED-GUIDE.md) - 생산성 도구 활용법

### **🎯 외주 개발 팁**
1. **CRUD 생성기로 기본 구조 30초 완성**
2. **쿼리 빌더로 복잡한 필터링 구현**  
3. **VSCode 스니펫으로 보일러플레이트 자동화**
4. **클래스 기반 API로 일관성 유지**
5. **권한 시스템으로 사용자별 기능 제한**

---

## 🚀 성능 최적화

### **Next.js 15 최적화**
- **App Router**: 향상된 라우팅 및 레이아웃
- **Server Components**: 자동 서버 사이드 렌더링
- **Image Optimization**: `next/image` 자동 최적화
- **Bundle Splitting**: 자동 코드 스플리팅

### **TanStack Query 캐싱**
```typescript
// 🚀 자동 캐싱 및 백그라운드 갱신
queryClient.setDefaultOptions({
  queries: {
    staleTime: 5 * 60 * 1000, // 5분간 fresh
    cacheTime: 10 * 60 * 1000, // 10분간 캐시
    refetchOnWindowFocus: false,
  }
})
```

### **번들 사이즈 최적화**
```typescript
// 🎯 Tree shaking 및 동적 임포트
const HeavyComponent = lazy(() => import('./HeavyComponent'))
```

---

## 🔧 커스터마이징

### **새로운 API 엔드포인트 추가**
```typescript
// 1. constants.ts에 엔드포인트 추가
export const API_ENDPOINTS = {
  // ...existing
  POSTS: 'posts',
  CATEGORIES: 'categories',
} as const

// 2. 타입 정의
export interface Post {
  id: string
  title: string
  content: string
  authorId: string
}

// 3. API 훅 생성 (스니펫 또는 자동 생성기 사용)
export class PostApi {
  index = (query?: CrudQuery) => { /* ... */ }
  show = (id: string) => { /* ... */ }
  create = () => { /* ... */ }
  update = (id: string) => { /* ... */ }
  destroy = (id: string) => { /* ... */ }
}
```

### **새로운 권한 추가**
```typescript
// store/auth-store.ts
export const usePermissions = () => {
  const { user } = useAuth()
  
  return {
    canManageUsers: user?.role === 'admin',
    canManagePosts: ['admin', 'editor'].includes(user?.role),
    canViewAnalytics: user?.role === 'admin',
  }
}
```

---

## 🧪 테스트

### **테스트 환경 설정**
```bash
# 단위 테스트
npm run test

# E2E 테스트 (Playwright)
npm run test:e2e

# 테스트 커버리지
npm run test:coverage
```

### **테스트 작성 패턴**
```typescript
// __tests__/components/UserList.test.tsx
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UserList from '@/components/common/user-list'

test('사용자 목록이 올바르게 렌더링된다', async () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  })
  
  render(
    <QueryClientProvider client={queryClient}>
      <UserList />
    </QueryClientProvider>
  )
  
  expect(screen.getByText('사용자 목록')).toBeInTheDocument()
})
```

---

## 🚀 배포

### **Vercel 배포 (권장)**
```bash
# Vercel CLI 설치
npm i -g vercel

# 프로젝트 배포
vercel --prod
```

### **Docker 배포**
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### **환경 변수 설정**
```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
NEXT_PUBLIC_APP_ENV=production
```

---

## 🤝 기여 가이드

### **개발 워크플로우**
1. **이슈 생성** - 새로운 기능이나 버그 리포트
2. **브랜치 생성** - `feature/기능명` 또는 `fix/버그명`
3. **개발 및 테스트** - 기능 구현 후 테스트 작성
4. **PR 생성** - 코드 리뷰 요청
5. **병합** - 승인 후 main 브랜치로 병합

### **코딩 컨벤션**
- **파일명**: `kebab-case.tsx`
- **컴포넌트명**: `PascalCase`
- **함수명**: `camelCase`
- **상수명**: `UPPER_SNAKE_CASE`
- **브랜치명**: `feature/기능명` 또는 `fix/버그명`

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 🙋‍♂️ 지원 및 문의

### **문제 해결**
1. **[이슈 트래커](https://github.com/your-repo/issues)** - 버그 리포트 및 기능 요청
2. **[위키](https://github.com/your-repo/wiki)** - 상세 문서 및 FAQ
3. **[디스커션](https://github.com/your-repo/discussions)** - 질문 및 아이디어 공유

### **연락처**
- **이메일**: your-email@example.com
- **GitHub**: [@your-username](https://github.com/your-username)

---

## 🎉 마무리

이 템플릿으로 **외주 개발 프로젝트의 생산성을 극대화**하세요!

### **개발 시간 단축 예상**
- **CRUD 개발**: 2-3일 → **30초** ⚡
- **API 연동**: 1-2일 → **10분** 🚀  
- **인증 시스템**: 1주일 → **즉시 사용** 🔐
- **UI 컴포넌트**: 2-3일 → **1시간** 🎨

**총 개발 시간 단축: 70-80% 단축 예상** 📈

---

<div align="center">

**⭐ 이 템플릿이 도움이 되었다면 별표를 눌러주세요! ⭐**

[🚀 **지금 시작하기**](#-설치-및-실행) | [📖 **API 가이드**](./README-API.md) | [⚡ **속도 가이드**](./SPEED-GUIDE.md)

</div>
