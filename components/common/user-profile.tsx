'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useUserApi } from '@/hooks/user/use-user-api'
import { useAuthApi } from '@/hooks/use-auth-api'
import { useAuth } from '@/store/auth-store'
import { cn } from '@/lib/utils'

const updateProfileSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.'),
  email: z.string().email('올바른 이메일 형식을 입력해주세요.'),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { user, logout: authLogout } = useAuth()
  const userApi = useUserApi()
  const authApi = useAuthApi()

  // 현재 사용자 정보 조회
  const { data: currentUser, isLoading } = userApi.show(user?.id || '')

  // 로그아웃 뮤테이션
  const logoutMutation = authApi.logout({
    onSuccess: () => {
      authLogout()
    },
  })

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    },
  })

  // 사용자 정보가 로드되면 폼 기본값 업데이트
  React.useEffect(() => {
    if (currentUser) {
      form.reset({
        name: currentUser.name,
        email: currentUser.email,
      })
    }
  }, [currentUser, form])

  const handleLogout = () => {
    if (confirm('로그아웃하시겠습니까?')) {
      logoutMutation.mutate()
    }
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full max-w-2xl', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>프로필</CardTitle>
            <CardDescription>개인 정보를 확인하고 수정할 수 있습니다.</CardDescription>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                수정
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            )}
            <Button variant="destructive" onClick={handleLogout} disabled={logoutMutation.isPending}>
              {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          // 프로필 보기 모드
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">이름</label>
              <p className="mt-1 text-sm text-gray-900">{currentUser?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">이메일</label>
              <p className="mt-1 text-sm text-gray-900">{currentUser?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">가입일</label>
              <p className="mt-1 text-sm text-gray-900">
                {currentUser?.createdAt
                  ? new Date(currentUser.createdAt).toLocaleDateString('ko-KR')
                  : '-'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">상태</label>
              <div className="mt-1">
                <Badge variant="default">활성</Badge>
              </div>
            </div>
          </div>
        ) : (
          // 프로필 수정 모드
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이름</FormLabel>
                    <FormControl>
                      <Input placeholder="이름을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="이메일을 입력해주세요" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
} 