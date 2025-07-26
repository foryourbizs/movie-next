'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useMe, useUpdateMe, useLogout } from '@/hooks/use-api'
import { useAuth } from '@/store/auth-store'
import { cn } from '@/lib/utils'

// 프로필 업데이트 스키마 정의
const updateProfileSchema = z.object({
  name: z.string()
    .min(2, '이름은 최소 2글자 이상이어야 합니다.')
    .max(50, '이름은 최대 50글자까지 입력 가능합니다.'),
  phone: z.string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
    .optional()
    .or(z.literal(''))
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface UserProfileProps {
  className?: string
}

export function UserProfile({ className }: UserProfileProps) {
  const { user, updateUser, hydrated } = useAuth()
  const { data: userData, isLoading, error } = useMe({
    enabled: hydrated
  })
  const updateMeMutation = useUpdateMe({
    onSuccess: (data) => {
      updateUser(data)
    }
  })
  const logoutMutation = useLogout()

  const [isEditing, setIsEditing] = React.useState(false)

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: userData?.name || '',
      phone: userData?.phone || ''
    }
  })

  // 사용자 데이터가 로드되면 폼 값 업데이트
  React.useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name,
        phone: userData.phone || ''
      })
    }
  }, [userData, form])

  const handleSubmit = (data: UpdateProfileFormData) => {
    updateMeMutation.mutate({
      name: data.name,
      phone: data.phone || undefined
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    form.reset({
      name: userData?.name || '',
      phone: userData?.phone || ''
    })
    setIsEditing(false)
  }

  const handleLogout = () => {
    logoutMutation.mutate()
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">사용자 정보를 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            사용자 정보를 불러오는데 실패했습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentUser = userData || user

  if (!currentUser) {
    return (
      <Card className={cn('w-full max-w-2xl mx-auto', className)}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            사용자 정보를 찾을 수 없습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">내 정보</CardTitle>
          <CardDescription>
            계정 정보를 확인하고 수정할 수 있습니다
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              수정
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isEditing ? (
          // 읽기 모드
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">이름</label>
                <p className="text-lg">{currentUser.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">이메일</label>
                <p className="text-lg">{currentUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">전화번호</label>
                <p className="text-lg">{currentUser.phone || '등록되지 않음'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">권한</label>
                <div className="mt-1">
                  <Badge variant={currentUser.role === 'admin' ? 'default' : 'secondary'}>
                    {currentUser.role === 'admin' ? '관리자' : '사용자'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">가입 방법</label>
                <p className="text-lg">
                  {currentUser.provider === 'local' ? '이메일' : currentUser.provider}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">계정 상태</label>
                <div className="mt-1">
                  <Badge variant={currentUser.isActive ? 'default' : 'destructive'}>
                    {currentUser.isActive ? '활성' : '비활성'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">가입일</label>
                <p className="text-lg">
                  {new Date(currentUser.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">최종 수정일</label>
                <p className="text-lg">
                  {new Date(currentUser.updatedAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          // 수정 모드
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="홍길동"
                          {...field}
                          disabled={updateMeMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <label className="text-sm font-medium">이메일</label>
                  <Input
                    value={currentUser.email}
                    disabled
                    className="mt-1.5 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    이메일은 변경할 수 없습니다
                  </p>
                </div>
              </div>

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>전화번호 (선택)</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="010-1234-5678"
                        {...field}
                        disabled={updateMeMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={updateMeMutation.isPending}
                >
                  {updateMeMutation.isPending ? '저장 중...' : '저장'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateMeMutation.isPending}
                >
                  취소
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  )
} 