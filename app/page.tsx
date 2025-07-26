'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/store/auth-store'

export default function HomePage() {
  const router = useRouter()
  const { isAuthenticated, user, hydrated } = useAuth()

  React.useEffect(() => {
    // hydration이 완료되고 인증된 경우에만 리디렉션
    if (hydrated && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [hydrated, isAuthenticated, router])

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

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              환영합니다! 👋
            </CardTitle>
            <CardDescription className="text-lg">
              계정이 있으시면 로그인하시고, 없으시면 회원가입을 해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => router.push('/auth/signin')}
              className="w-full"
              size="lg"
            >
              로그인
            </Button>
            <Button
              onClick={() => router.push('/auth/signup')}
              variant="outline"
              className="w-full"
              size="lg"
            >
              회원가입
            </Button>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 로그인되어 있다면 자동으로 대시보드로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  )
}
