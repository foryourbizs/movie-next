'use client'

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createInvalidationManager } from '@/lib/query-invalidation'

interface QueryProviderProps {
  children: React.ReactNode
}

// QueryClient 인스턴스 생성
const createQueryClient = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // 기본 stale time (데이터가 fresh 상태로 유지되는 시간)
        staleTime: 60 * 1000, // 1분
        // 기본 cache time (비활성 쿼리가 캐시에 유지되는 시간)
        gcTime: 5 * 60 * 1000, // 5분 (구 cacheTime)
        // 윈도우 포커스 시 자동 refetch 비활성화
        refetchOnWindowFocus: false,
        // 네트워크 재연결 시 자동 refetch
        refetchOnReconnect: true,
        // 재시도 설정
        retry: (failureCount, error) => {
          // 401, 403, 404 에러는 재시도하지 않음
          if (error && typeof error === 'object' && 'status' in error) {
            const status = error.status as number
            if ([401, 403, 404].includes(status)) {
              return false
            }
          }
          // 최대 3번까지 재시도
          return failureCount < 3
        },
        // 재시도 지연 시간 (exponential backoff)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        // 뮤테이션 재시도 설정
        retry: false,
        // 뮤테이션 에러 핸들링
        onError: (error) => {
          console.error('Mutation error:', error)
        },
      },
    },
  })

  // QueryClient 생성 후 무효화 관리자 초기화
  createInvalidationManager(queryClient)

  return queryClient
}

// 전역 QueryClient 인스턴스
let queryClient: QueryClient | undefined

// QueryClient 싱글톤 패턴
const getQueryClient = () => {
  if (typeof window === 'undefined') {
    // 서버 사이드에서는 매번 새로운 인스턴스 생성
    return createQueryClient()
  }
  
  // 클라이언트 사이드에서는 싱글톤 사용
  if (!queryClient) {
    queryClient = createQueryClient()
  }
  
  return queryClient
}

export function QueryProvider({ children }: QueryProviderProps) {
  // React state가 아닌 ref를 사용하여 불필요한 리렌더링 방지
  const client = React.useMemo(() => getQueryClient(), [])

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
} 