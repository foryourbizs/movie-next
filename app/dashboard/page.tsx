'use client'

import React from 'react'
import { redirect } from 'next/navigation'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, usePermissions } from '@/store/auth-store'
import { useUserApi } from '@/hooks/use-user-api'

export default function DashboardPage() {
  const { isAuthenticated, user, hydrated } = useAuth()
  const { canManageUsers } = usePermissions()
  const userApi = useUserApi()

  // 하이드레이션이 완료되지 않았으면 로딩 표시
  if (!hydrated) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 인증되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isAuthenticated) {
    redirect('/auth/signin')
  }

  // 현재 사용자 정보 조회
  const { data: currentUser, isLoading } = userApi.me()

  const displayUser = currentUser || user

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-2">
          {isLoading ? '사용자 정보를 불러오는 중...' : `환영합니다, ${displayUser?.name}님!`}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* 프로필 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>내 프로필</CardTitle>
            <CardDescription>개인 정보를 확인하고 수정할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">이름: {displayUser?.name}</p>
                <p className="text-sm text-gray-600">이메일: {displayUser?.email}</p>
                <p className="text-sm text-gray-600">
                  가입일: {displayUser?.createdAt 
                    ? new Date(displayUser.createdAt).toLocaleDateString('ko-KR') 
                    : '-'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 권한 정보 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>권한 정보</CardTitle>
            <CardDescription>현재 계정의 권한을 확인할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                             <div className="flex items-center justify-between">
                 <span className="text-sm text-gray-600">사용자 조회</span>
                 <span className={`text-xs px-2 py-1 rounded ${canManageUsers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                   {canManageUsers ? '허용' : '제한'}
                 </span>
               </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">사용자 관리</span>
                <span className={`text-xs px-2 py-1 rounded ${canManageUsers ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {canManageUsers ? '허용' : '제한'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 빠른 액션 카드 */}
        <Card>
          <CardHeader>
            <CardTitle>빠른 액션</CardTitle>
            <CardDescription>자주 사용하는 기능에 빠르게 접근할 수 있습니다</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <a 
                href="/profile" 
                className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors"
              >
                프로필 수정
              </a>
                             {canManageUsers && (
                 <a 
                   href="/users" 
                   className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors"
                 >
                   사용자 목록
                 </a>
               )}
              <button className="block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 transition-colors text-red-600">
                로그아웃
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

             {/* 추가 통계 정보 (권한이 있는 경우) */}
       {canManageUsers && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>시스템 통계</CardTitle>
              <CardDescription>전체 시스템 현황을 확인할 수 있습니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                통계 정보는 개발 중입니다...
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 