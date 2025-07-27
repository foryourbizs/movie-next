# 🚀 Next.js 15 + TypeScript 프로덕션 레디 템플릿

> **AI 시대를 위한 초고속 개발 플랫폼**  
> 백엔드와 완전 동기화된 자동 코드 생성으로 개발 속도를 10배 향상시키는 차세대 풀스택 템플릿

[![Next.js](https://img.shields.io/badge/Next.js-15.0+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0+-06B6D4)](https://tailwindcss.com/)

## ✨ 핵심 특징

### 🤖 **AI급 자동 코드 생성**
- **백엔드 스키마 API 연동**: 실제 데이터베이스 스키마에서 직접 타입과 API 생성
- **동적 CRUD 생성**: 백엔드 권한 설정에 따라 허용된 메서드만 선택적 생성
- **제로 설정**: 엔티티명만 입력하면 완전한 CRUD 시스템 30초 완성
- **100% 타입 안전**: 백엔드와 완벽 동기화된 TypeScript 타입

### 🏗️ **현대적 아키텍처**
- **클래스 기반 API**: 일관된 인터페이스로 개발자 경험 극대화
- **모듈형 구조**: 엔티티별 독립적인 타입/훅 관리
- **상속 패턴**: 자동 생성 코드를 덮어쓰지 않고 확장 가능
- **프로덕션 최적화**: 실제 서비스에 바로 적용 가능한 코드 품질

### 🔒 **기업급 인증 시스템**
- **JWT 자동 관리**: Access/Refresh Token 순환 갱신
- **프로액티브 토큰 갱신**: 만료 5분 전 자동 갱신으로 사용자 경험 최적화
- **권한 기반 UI**: 사용자 권한에 따른 동적 인터페이스
- **보안 최우선**: XSS, CSRF 방어 및 토큰 보안 강화

---

## 📦 빠른 시작

### **환경 요구사항**
- Node.js 18.17+
- 백엔드 API 서버 (NestJS + @foryourdev/nestjs-crud 권장)

### **설치 및 실행**
```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd template-typescript-nextjs

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:4000 설정

# 4. 개발 서버 실행
npm run dev
```

### **백엔드 연동 확인**
```bash
# 스키마 API 응답 확인
curl http://localhost:4000/api/v1/schema/user

# 정상 응답 예시:
# {
#   "data": {
#     "entityName": "User",
#     "columns": [...],
#     "relations": [...],
#     "crudInfo": {
#       "isConfigured": true,
#       "allowedMethods": ["index", "show", "create"],
#       "routeSettings": {...}
#     }
#   }
# }
```

---

## 🚀 핵심 기능 상세

### 1. **🤖 백엔드 연동 자동 CRUD 생성**

#### **30초 만에 완전한 CRUD 시스템 생성**
```bash
npm run generate-crud
# > 엔티티명 입력: post
# 🔍 백엔드에서 스키마 정보 자동 조회
# ✅ 타입, API 훅, 컴포넌트 자동 생성
```

#### **백엔드 설정 기반 동적 생성**
```typescript
// 백엔드에서 허용된 메서드만 생성
// 예: User 엔티티 - index, show만 허용
class CrudUserApi {
  index = (query) => { /* 목록 조회 */ }
  show = (id) => { /* 단일 조회 */ }
  // create, update, destroy는 생성되지 않음
}

// Post 엔티티 - 전체 CRUD 허용  
class CrudPostApi {
  index = (query) => { /* 목록 조회 */ }
  show = (id) => { /* 단일 조회 */ }
  create = (data) => { /* 생성 */ }
  update = (id, data) => { /* 수정 */ }
  destroy = (id) => { /* 삭제 */ }
}
```

#### **메서드별 세부 권한 반영**
```typescript
// 백엔드 routeSettings 기반 타입 생성
interface CreatePostRequest {
  title: string      // ✅ create에서 허용
  content: string    // ✅ create에서 허용
  userId: string     // ✅ create에서 허용
  // summary, isPublished 등은 제외됨
}

interface UpdatePostRequest {
  title?: string     // ✅ update에서 허용  
  content?: string   // ✅ update에서 허용
  // userId는 수정 불가로 제외됨
}

interface PostFilter {
  title?: string     // ✅ index 필터링 허용
  userId?: string    // ✅ index 필터링 허용
  // content는 필터링 불가로 제외됨
}
```

### 2. **🏗️ 모듈형 파일 구조**

#### **엔티티별 독립 관리**
```
📦 types/
├── 📁 user/
│   ├── crud-user.ts      # 🤖 자동 생성 (덮어쓰기됨)
│   └── user.ts           # 🔧 확장용 (보존됨)
├── 📁 post/  
│   ├── crud-post.ts      # 🤖 자동 생성
│   └── post.ts           # 🔧 확장용
└── 📁 category/
    ├── crud-category.ts  # 🤖 자동 생성
    └── category.ts       # 🔧 확장용

📦 hooks/
├── 📁 user/
│   ├── use-crud-user-api.ts  # 🤖 자동 생성
│   └── use-user-api.ts       # 🔧 확장용
└── 📁 post/
    ├── use-crud-post-api.ts  # 🤖 자동 생성
    └── use-post-api.ts       # 🔧 확장용
```

#### **상속 패턴으로 안전한 확장**
```typescript
// 🤖 자동 생성된 기본 CRUD (덮어쓰기됨)
// hooks/user/use-crud-user-api.ts
export class CrudUserApi {
  protected readonly baseUrl = 'users'
  
  index = (query) => { /* 자동 생성된 로직 */ }
  show = (id) => { /* 자동 생성된 로직 */ }
}

// 🔧 수동 확장 (보존됨)  
// hooks/user/use-user-api.ts
export class UserApi extends CrudUserApi {
  // 커스텀 메서드 추가
  me = () => {
    return useQuery({
      queryKey: [...QUERY_KEYS.USER.details(), 'me'],
      queryFn: () => apiUtils.get(`${this.baseUrl}/me`)
    })
  }
  
  stats = () => {
    // 사용자 통계 조회 로직
  }
}
```

### 3. **🎯 클래스 기반 API 패턴**

#### **일관된 인터페이스**
```typescript
// 모든 엔티티가 동일한 패턴 사용
const userApi = useUserApi()
const postApi = usePostApi() 
const categoryApi = useCategoryApi() // 자동 생성

// CRUD 작업 - 동일한 메서드명
const { data: users } = userApi.index(query)
const { data: posts } = postApi.index(query)
const { data: categories } = categoryApi.index(query)

// 상세 조회 - 동일한 패턴
const { data: user } = userApi.show(userId)
const { data: post } = postApi.show(postId)

// 생성 - 동일한 패턴 
const createUser = userApi.create()
const createPost = postApi.create()
```

#### **TanStack Query 완전 통합**
```typescript
// ✅ 자동 캐싱, 백그라운드 갱신
const { data, isLoading, error, refetch } = postApi.index({
  page: { offset: 0, limit: 20 },
  filter: { title_like: '%검색어%' },
  sort: '-createdAt'
})

// ✅ 낙관적 업데이트
const updatePost = postApi.update(postId)
updatePost.mutate(updateData, {
  onSuccess: () => {
    // 🔄 관련 쿼리 자동 무효화
    toast.success('포스트가 수정되었습니다!')
  }
})

// ✅ 에러 처리 자동화
const deletePost = postApi.destroy(postId)  
deletePost.mutate(undefined, {
  onError: (error) => {
    // 🚨 백엔드 에러 메시지 자동 표시
    toast.error(error.message)
  }
})
```

### 4. **⚡ 쿼리 빌더 시스템**

#### **체이닝으로 복잡한 쿼리 구성**
```typescript
import { createQuery } from '@/lib/query-builder'

// 🔗 직관적인 체이닝 API
const query = createQuery()
  .paginate(1, 20)                    // 페이지네이션
  .sortDesc('createdAt')              // 최신순 정렬
  .filterEq('status', 'published')    // 상태 필터
  .filterLike('title', '검색어')       // 제목 검색
  .include(['author', 'category'])    // 관계 포함
  .build()

// 📡 생성된 쿼리로 API 호출
const { data } = postApi.index(query)
```

#### **미리 정의된 쿼리 템플릿**
```typescript
import { QueryTemplates } from '@/lib/query-builder'

// 📋 자주 사용하는 패턴들
const activeUsers = QueryTemplates.activeUsers()
const recentPosts = QueryTemplates.recentPosts() 
const adminUsers = QueryTemplates.adminUsers()

// 🎯 바로 사용 가능
const { data } = userApi.index(activeUsers)
```

#### **상태 관리 훅과 연동**
```typescript
import { useQueryState } from '@/hooks/use-query-state'

function PostList() {
  // 🎮 페이지네이션, 정렬, 필터 상태 자동 관리
  const queryState = useQueryState({
    defaultLimit: 20,
    defaultSort: '-createdAt'
  })
  
  // 📡 상태 변경시 자동으로 API 재호출
  const { data } = postApi.index(queryState.query)
  
  return (
    <div>
      {/* 🔍 실시간 검색 */}
      <input 
        placeholder="제목 검색..."
        onChange={(e) => queryState.searchBy('title', e.target.value)}
      />
      
      {/* 📊 정렬 변경 */}
      <select onChange={(e) => queryState.setSort(e.target.value)}>
        <option value="-createdAt">최신순</option>
        <option value="title">제목순</option>
        <option value="-viewCount">조회수순</option>
      </select>
      
      {/* 📄 페이지네이션 */}
      <Pagination 
        current={queryState.page}
        total={data?.metadata.pagination.total || 0}
        onChange={queryState.setPage}
      />
    </div>
  )
}
```

---

## 🔒 고급 인증 시스템

### **자동 토큰 관리**
```typescript
// 🔄 백그라운드에서 자동 실행
✅ Access Token 만료 5분 전 자동 갱신
✅ Refresh Token 순환 갱신으로 보안 강화  
✅ 401 에러 시 자동 재시도 (최대 2회)
✅ 토큰 만료 시 자동 로그아웃 및 리다이렉트
✅ 프로액티브 갱신으로 사용자 경험 끊김 없음
```

### **권한 기반 UI 제어**
```typescript
// 🛡️ 컴포넌트 레벨 권한 체크
function AdminPanel() {
  const { isAuthenticated, canManageUsers } = useAuth()
  
  // 🚪 인증 확인
  if (!isAuthenticated) {
    redirect('/auth/signin')
  }
  
  // 👤 권한 확인
  if (!canManageUsers) {
    return <div>권한이 없습니다.</div>
  }
  
  return <UserManagementPanel />
}
```

### **하이드레이션 최적화**
```typescript
// 💧 SSR/CSR 불일치 해결
function ProtectedPage() {
  const { hydrated, isAuthenticated } = useAuth()
  
  // ⏳ 하이드레이션 대기
  if (!hydrated) {
    return <LoadingSpinner />
  }
  
  // 🔐 인증 상태 확인
  if (!isAuthenticated) {
    redirect('/auth/signin')
  }
  
  return <ProtectedContent />
}
```

---

## 🎨 UI/UX 시스템

### **shadcn/ui 기반 디자인 시스템**
```typescript
// 🎨 일관된 컴포넌트 사용
import { Button, Card, Input, Select } from '@/components/ui'

function UserForm() {
  return (
    <Card className="p-6">
      <Input 
        placeholder="사용자명 입력"
        className="mb-4"
      />
      <Select>
        <option value="admin">관리자</option>
        <option value="user">일반 사용자</option>
      </Select>
      <Button variant="outline" size="sm">
        저장하기
      </Button>
    </Card>
  )
}
```

### **완성도 높은 폼 시스템**
```typescript
// 📝 React Hook Form + Zod 통합
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const userSchema = z.object({
  name: z.string().min(2, '이름은 2글자 이상이어야 합니다'),
  email: z.string().email('올바른 이메일을 입력하세요'),
  role: z.enum(['admin', 'user'])
})

function UserForm() {
  const form = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'user' }
  })
  
  const createUser = userApi.create()
  
  const onSubmit = form.handleSubmit((data) => {
    createUser.mutate(data, {
      onSuccess: () => {
        toast.success('사용자가 생성되었습니다!')
        form.reset()
      }
    })
  })
  
  return (
    <form onSubmit={onSubmit}>
      {/* 🎯 자동 에러 표시 */}
      <Input 
        {...form.register('name')}
        error={form.formState.errors.name?.message}
      />
      {/* ... */}
    </form>
  )
}
```

### **반응형 레이아웃**
```scss
/* 📱 Mobile First 설계 */
.dashboard-grid {
  @apply grid grid-cols-1 gap-4;
  @apply md:grid-cols-2;
  @apply lg:grid-cols-3;
  @apply xl:grid-cols-4;
}

.sidebar {
  @apply hidden;
  @apply lg:block lg:w-64;
  @apply xl:w-80;
}
```

---

## 📊 대시보드 시스템

### **권한별 네비게이션**
```typescript
function DashboardNav() {
  const { canManageUsers, canViewAnalytics } = useAuth()
  
  return (
    <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* 📊 기본 메뉴 */}
      <NavCard icon={User} title="내 프로필" href="/profile" />
      <NavCard icon={FileText} title="포스트" href="/posts" />
      
      {/* 👥 관리자 전용 */}
      {canManageUsers && (
        <NavCard icon={Users} title="사용자 관리" href="/users" />
      )}
      
      {/* 📈 분석 전용 */}  
      {canViewAnalytics && (
        <NavCard icon={BarChart} title="분석" href="/analytics" />
      )}
    </nav>
  )
}
```

### **실시간 통계 카드**
```typescript
function StatsCards() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats'),
    refetchInterval: 30000 // 30초마다 갱신
  })
  
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="전체 사용자"
        value={stats?.totalUsers}
        icon={Users}
        trend={+12}
      />
      <StatCard 
        title="활성 사용자" 
        value={stats?.activeUsers}
        icon={UserCheck}
        trend={+5}
      />
      <StatCard 
        title="이번달 가입"
        value={stats?.monthlySignups}
        icon={UserPlus}
        trend={+18}
      />
      <StatCard 
        title="총 포스트"
        value={stats?.totalPosts}
        icon={FileText}
        trend={+7}
      />
    </div>
  )
}
```

---

## 🛠️ 개발 도구 및 설정

### **TypeScript 엄격 모드**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### **ESLint + Prettier 설정**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "prefer-const": "error",
    "no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### **절대 경로 임포트**
```typescript
// ✅ 절대 경로로 깔끔한 임포트
import { Button } from '@/components/ui/button'
import { useUserApi } from '@/hooks/user/use-user-api'
import { QueryBuilder } from '@/lib/query-builder'
import { AuthStore } from '@/store/auth-store'
import { User } from '@/types/user/user'
```

---

## 🚀 성능 최적화

### **Next.js 15 최적화**
```typescript
// 🚀 App Router 최적화
export default function Layout({ children }) {
  return (
    <html>
      <body>
        {/* 🎯 스트리밍 렌더링 */}
        <Suspense fallback={<PageSkeleton />}>
          {children}
        </Suspense>
      </body>
    </html>
  )
}

// 📦 동적 임포트로 번들 최적화
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

### **TanStack Query 캐싱 전략**
```typescript
// 🔄 전역 캐싱 설정
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5분간 fresh 
      cacheTime: 10 * 60 * 1000,     // 10분간 캐시 유지
      refetchOnWindowFocus: false,   // 창 포커스시 재요청 안함
      retry: (failureCount, error) => {
        if (error?.status === 404) return false
        return failureCount < 3
      }
    }
  }
})

// 🎯 선택적 프리페칭
function UserList() {
  const queryClient = useQueryClient()
  
  const prefetchUser = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['user', userId],
      queryFn: () => userApi.show(userId)
    })
  }
  
  return (
    <div>
      {users.map(user => (
        <UserCard 
          key={user.id}
          user={user}
          onMouseEnter={() => prefetchUser(user.id)}
        />
      ))}
    </div>
  )
}
```

---

## 🎯 프로덕션 배포

### **빌드 최적화**
```bash
# 🏗️ 프로덕션 빌드
npm run build

# 📊 번들 분석
npm run analyze

# 🔍 타입 체크
npm run type-check

# 🧹 린트 체크  
npm run lint
```

### **환경별 설정**
```bash
# 🔧 개발 환경
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_ENV=development

# 🚀 프로덕션 환경  
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_APP_ENV=production
```

### **Docker 컨테이너**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🔧 커스터마이징 가이드

### **새로운 엔티티 추가**
```bash
# 1. 백엔드에 새 엔티티 구현
# 2. 스키마 API 확인
curl http://localhost:4000/api/v1/schema/product

# 3. 프론트엔드 CRUD 자동 생성
npm run generate-crud
# > product 입력
# ✅ 완전한 Product CRUD 시스템 생성 완료
```

### **커스텀 API 메서드 추가** 
```typescript
// hooks/user/use-user-api.ts (확장용 파일)
export class UserApi extends CrudUserApi {
  // 🔧 커스텀 메서드 추가
  sendWelcomeEmail = (userId: string) => {
    return useMutation({
      mutationFn: () => apiUtils.post(`${this.baseUrl}/${userId}/welcome-email`),
      onSuccess: () => {
        toast.success('환영 이메일이 발송되었습니다!')
      }
    })
  }
  
  getActivityLog = (userId: string, days = 30) => {
    return useQuery({
      queryKey: ['user', userId, 'activity', days],
      queryFn: () => apiUtils.get(`${this.baseUrl}/${userId}/activity?days=${days}`)
    })
  }
}
```

### **새로운 권한 추가**
```typescript
// store/auth-store.ts
export const usePermissions = () => {
  const { user } = useAuth()
  
  return useMemo(() => ({
    canManageUsers: user?.role === 'admin',
    canManagePosts: ['admin', 'editor'].includes(user?.role || ''),
    canViewAnalytics: user?.role === 'admin',
    canModerateComments: ['admin', 'moderator'].includes(user?.role || ''),
    canBulkExport: user?.role === 'admin'
  }), [user?.role])
}
```

---

## 📈 개발 워크플로우

### **일반적인 개발 순서**
```bash
# 1. 백엔드 엔티티 구현
# 2. 스키마 API 확인
# 3. 프론트엔드 CRUD 생성
npm run generate-crud

# 4. 커스텀 기능 개발 (확장 파일에서)
# 5. 페이지 및 컴포넌트 구현
# 6. 권한 설정 및 UI 최적화
```

### **코드 품질 관리** 
```bash
# 🔍 개발 중 실시간 체크
npm run dev          # 개발 서버 + 타입 체크
npm run lint:watch   # 실시간 린트 체크

# ✅ 커밋 전 최종 검증
npm run type-check   # TypeScript 검증
npm run lint         # ESLint 검증  
npm run test         # 테스트 실행
npm run build        # 빌드 검증
```

### **디버깅 도구**
```typescript
// 🐛 개발 모드에서 디버깅 정보
if (process.env.NODE_ENV === 'development') {
  console.log('🔍 Current user:', user)
  console.log('🔍 Permissions:', permissions)
  console.log('🔍 Query state:', queryState)
}

// 🔧 React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <>
      <YourApp />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </>
  )
}
```

---

이 템플릿은 **실제 프로덕션 환경에서 검증된** 아키텍처와 패턴을 기반으로 구축되었습니다. 백엔드와의 완벽한 동기화, 타입 안전성, 개발 속도 최적화를 통해 **현대적인 웹 애플리케이션을 빠르고 안정적으로 구축**할 수 있습니다.