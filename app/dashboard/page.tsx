'use client'

import React from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Home, 
  User, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Shield,
  ArrowRight 
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth, usePermissions } from '@/store/auth-store'
import { useUserApi } from '@/hooks/use-user-api'

export default function DashboardPage() {
  const { isAuthenticated, user, hydrated } = useAuth()
  const { canManageUsers } = usePermissions()
  const userApi = useUserApi()

  // 🚀 모든 훅을 조건부 렌더링 이전에 호출!
  const { data: currentUser, isLoading } = userApi.show(user?.id || '')

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

  const displayUser = currentUser || user

  // 네비게이션 메뉴 데이터
  const navigationItems = [
    {
      title: '홈',
      description: '메인 페이지로 돌아가기',
      href: '/',
      icon: Home,
      color: 'bg-blue-500',
      available: true,
    },
    {
      title: '내 프로필',
      description: '개인 정보 확인 및 수정',
      href: '/profile',
      icon: User,
      color: 'bg-green-500',
      available: true,
    },
    {
      title: '사용자 관리',
      description: '전체 사용자 목록 및 관리',
      href: '/users',
      icon: Users,
      color: 'bg-purple-500',
      available: canManageUsers,
    },
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-2">
          {isLoading ? '사용자 정보를 불러오는 중...' : `환영합니다, ${displayUser?.name}님!`}
        </p>
      </div>

      {/* 🚀 페이지 네비게이션 섹션 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 네비게이션</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {navigationItems
            .filter(item => item.available)
            .map((item) => {
              const Icon = item.icon
              return (
                <Card 
                  key={item.href}
                  className={`transition-all duration-200 hover:shadow-lg hover:scale-105 cursor-pointer`}
                >
                    <Link href={item.href}>
                      <div className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`p-3 rounded-lg ${item.color} text-white`}>
                              <Icon size={24} />
                            </div>
                            <div>
                              <h3 className="font-semibold">{item.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            </div>
                          </div>
                          <ArrowRight size={20} className="text-gray-400" />
                        </div>
                      </div>
                    </Link>
                </Card>
              )
            })}
        </div>
      </div>

      {/* 📊 대시보드 정보 카드들 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">계정 정보</h2>
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

          {/* 시스템 상태 카드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield size={20} />
                <span>시스템 상태</span>
              </CardTitle>
              <CardDescription>현재 시스템 상태 및 접근 권한</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">서버 상태</span>
                  <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                    정상
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">사용자 권한</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    canManageUsers ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {canManageUsers ? '관리자' : '일반 사용자'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">마지막 로그인</span>
                  <span className="text-xs text-gray-500">
                    {new Date().toLocaleDateString('ko-KR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 🔧 관리자 전용 섹션 */}
      {canManageUsers && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">관리자 도구</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <Users className="mx-auto mb-2 text-blue-500" size={32} />
                  <h3 className="font-medium text-sm">총 사용자</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-1">--</p>
                  <p className="text-xs text-gray-500">데이터 로딩 중</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <Shield className="mx-auto mb-2 text-green-500" size={32} />
                  <h3 className="font-medium text-sm">활성 사용자</h3>
                  <p className="text-2xl font-bold text-green-600 mt-1">--</p>
                  <p className="text-xs text-gray-500">데이터 로딩 중</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <BarChart3 className="mx-auto mb-2 text-purple-500" size={32} />
                  <h3 className="font-medium text-sm">이번 달 가입</h3>
                  <p className="text-2xl font-bold text-purple-600 mt-1">--</p>
                  <p className="text-xs text-gray-500">데이터 로딩 중</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="text-center">
                  <FileText className="mx-auto mb-2 text-orange-500" size={32} />
                  <h3 className="font-medium text-sm">시스템 로그</h3>
                  <p className="text-2xl font-bold text-orange-600 mt-1">--</p>
                  <p className="text-xs text-gray-500">데이터 로딩 중</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
} 