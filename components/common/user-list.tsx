'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useUsers } from '@/hooks/use-api'
import { useAuth, usePermissions } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import type { CrudQuery } from '@/types/api'

// 필터 스키마 정의
const filterSchema = z.object({
  email: z.string().optional()
})

type FilterFormData = z.infer<typeof filterSchema>

interface UserListProps {
  className?: string
}

export function UserList({ className }: UserListProps) {
  const { canManageUsers } = usePermissions()
  const { hydrated } = useAuth()
  const [currentPage, setCurrentPage] = React.useState(1)
  const [query, setQuery] = React.useState<CrudQuery>({
    limit: 10,
    offset: 0,
    sort: ['-created_at']
  })

  const { data: usersData, isLoading, error } = useUsers(query, {
    enabled: hydrated
  })
  
  const form = useForm<FilterFormData>({
    resolver: zodResolver(filterSchema),
    defaultValues: {
      email: ''
    }
  })

  const handleFilter = (data: FilterFormData) => {
    const newQuery: CrudQuery = {
      limit: 10,
      offset: 0,  // 첫 페이지이므로 offset 0
      sort: ['-created_at']  // 내림차순은 - 접두사 사용
    }

    // @foryourdev/nestjs-crud 형식: filter[field_operator]=value
    if (data.email && data.email.trim()) {
      newQuery.filter = {
        email_like: `%${data.email.trim()}%`  // LIKE 패턴
      }
    }

    setQuery(newQuery)
    setCurrentPage(1)
  }

  const handleClearFilter = () => {
    form.reset({ email: '' })
    setQuery({
      limit: 10,
      offset: 0,
      sort: ['-created_at']
    })
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const offset = (page - 1) * 10  // 페이지당 10개씩
    setQuery(prev => ({ ...prev, offset }))
    setCurrentPage(page)
  }

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary'
  }

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? 'default' : 'destructive'
  }

  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">사용자 목록을 불러오는 중...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            사용자 목록을 불러오는데 실패했습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  const users = usersData?.data || []
  const totalPages = usersData?.pageCount || 1

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold">사용자 목록</CardTitle>
            <CardDescription>
              등록된 모든 사용자를 확인할 수 있습니다
              {usersData && (
                <span className="ml-2">
                  (총 {usersData.total}명)
                </span>
              )}
            </CardDescription>
          </div>
        </div>

        {/* 필터 폼 */}
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFilter)} className="flex flex-col sm:flex-row gap-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="sr-only">이메일 검색</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="이메일로 검색..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  검색
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilter}
                >
                  초기화
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardHeader>

      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            검색 결과가 없습니다.
          </div>
        ) : (
          <>
            {/* 사용자 테이블 */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>전화번호</TableHead>
                    <TableHead>권한</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>가입방법</TableHead>
                    <TableHead>가입일</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                      </TableCell>
                      <TableCell>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {user.phone || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role === 'admin' ? '관리자' : '사용자'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.isActive)}>
                          {user.isActive ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.provider === 'local' ? '이메일' : user.provider}
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  페이지 {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    이전
                  </Button>
                  
                  {/* 페이지 번호 버튼들 */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    다음
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 