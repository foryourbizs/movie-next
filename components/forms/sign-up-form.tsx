'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useSignUp } from '@/hooks/use-api'
import { useAuth } from '@/store/auth-store'
import { cn } from '@/lib/utils'

// 회원가입 스키마 정의
const signUpSchema = z.object({
  name: z.string()
    .min(2, '이름은 최소 2글자 이상이어야 합니다.')
    .max(50, '이름은 최대 50글자까지 입력 가능합니다.'),
  email: z.string()
    .min(1, '이메일을 입력해주세요.')
    .email('올바른 이메일 형식을 입력해주세요.'),
  password: z.string()
    .min(8, '비밀번호는 최소 8글자 이상이어야 합니다.')
    .max(100, '비밀번호는 최대 100글자까지 입력 가능합니다.')
    .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '비밀번호는 영문과 숫자를 포함해야 합니다.'),
  confirmPassword: z.string()
    .min(1, '비밀번호 확인을 입력해주세요.'),
  phone: z.string()
    .regex(/^010-\d{4}-\d{4}$/, '올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
    .optional()
    .or(z.literal(''))
})
.refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword']
})

type SignUpFormData = z.infer<typeof signUpSchema>

interface SignUpFormProps {
  className?: string
  onSuccess?: () => void
}

export function SignUpForm({ className, onSuccess }: SignUpFormProps) {
  const router = useRouter()
  const { login } = useAuth()
  
  const signUpMutation = useSignUp({
    onSuccess: (data) => {
      login(data)
      onSuccess?.()
      router.push('/dashboard')
    }
  })

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: ''
    }
  })

  const handleSubmit = (data: SignUpFormData) => {
    const { confirmPassword, ...signUpData } = data
    
    signUpMutation.mutate({
      ...signUpData,
      phone: data.phone || undefined
    })
  }

  return (
    <Card className={cn('w-full max-w-md mx-auto', className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        <CardDescription className="text-center">
          새 계정을 만들어 시작하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                      disabled={signUpMutation.isPending}
                    />
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
                    <Input
                      type="email"
                      placeholder="hong@example.com"
                      {...field}
                      disabled={signUpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="영문과 숫자를 포함한 8글자 이상"
                      {...field}
                      disabled={signUpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="비밀번호를 다시 입력하세요"
                      {...field}
                      disabled={signUpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      disabled={signUpMutation.isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={signUpMutation.isPending}
            >
              {signUpMutation.isPending ? '가입 중...' : '회원가입'}
            </Button>
          </form>
        </Form>

        <div className="mt-4 text-center text-sm">
          <span className="text-muted-foreground">이미 계정이 있으신가요? </span>
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            onClick={() => router.push('/auth/signin')}
          >
            로그인하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 