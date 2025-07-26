'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, usePermissions } from '@/store/auth-store'
import { useMe } from '@/hooks/use-api'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, hydrated } = useAuth()
  const { canManageUsers } = usePermissions()
  
  // 사용자 정보가 없으면 서버에서 가져오기
  const { data: userData, isLoading: isLoadingUser } = useMe({
    enabled: hydrated && isAuthenticated && !user
  })

  React.useEffect(() => {
    // hydration이 완료되고 인증되지 않은 경우에만 리디렉션
    if (hydrated && !isAuthenticated) {
      router.push('/auth/signin')
    }
  }, [hydrated, isAuthenticated, router])

  // 사용자 정보를 받아왔을 때 스토어에 업데이트
  React.useEffect(() => {
    if (userData && !user) {
      updateUser(userData)
    }
  }, [userData, user, updateUser])

  // Hydration이 완료되지 않은 경우 로딩 표시
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">앱을 초기화하는 중...</span>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 사용자 정보 로딩 중
  if (!user && isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">사용자 정보를 불러오는 중...</span>
        </div>
      </div>
    )
  }

  // 사용자 정보를 사용 (로컬 상태 또는 서버에서 가져온 데이터)
  const currentUser = user || userData

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">사용자 정보를 불러올 수 없습니다.</p>
          <Button onClick={() => router.push('/auth/signin')}>
            다시 로그인
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            안녕하세요, {currentUser.name}님! 👋
          </h1>
          <p className="mt-2 text-gray-600">
            대시보드에 오신 것을 환영합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 내 정보 카드 */}
          <Card>
            <CardHeader>
              <CardTitle>내 정보</CardTitle>
              <CardDescription>
                계정 정보를 확인하고 수정할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p><span className="font-medium">이메일:</span> {currentUser.email}</p>
                <p><span className="font-medium">권한:</span> {currentUser.role === 'admin' ? '관리자' : '사용자'}</p>
                <p><span className="font-medium">가입일:</span> {new Date(currentUser.createdAt).toLocaleDateString('ko-KR')}</p>
              </div>
              <Button
                onClick={() => router.push('/profile')}
                className="w-full"
              >
                내 정보 관리
              </Button>
            </CardContent>
          </Card>

          {/* 사용자 관리 카드 (관리자만) */}
          {canManageUsers && (
            <Card>
              <CardHeader>
                <CardTitle>사용자 관리</CardTitle>
                <CardDescription>
                  등록된 사용자들을 관리할 수 있습니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    모든 사용자의 정보를 확인하고 관리할 수 있습니다.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/users')}
                  className="w-full"
                >
                  사용자 목록 보기
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 빠른 액션 카드 */}
          <Card className={canManageUsers ? 'md:col-span-2' : ''}>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>
                자주 사용하는 기능들에 빠르게 접근할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/profile')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">👤</span>
                  <span className="text-sm">내 정보</span>
                </Button>
                
                {canManageUsers && (
                  <Button
                    variant="outline"
                    onClick={() => router.push('/users')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">👥</span>
                    <span className="text-sm">사용자 관리</span>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={() => router.push('/auth/signup')}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  disabled={!canManageUsers}
                >
                  <span className="text-2xl">➕</span>
                  <span className="text-sm">사용자 추가</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.reload()
                  }}
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <span className="text-2xl">🔄</span>
                  <span className="text-sm">새로고침</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 