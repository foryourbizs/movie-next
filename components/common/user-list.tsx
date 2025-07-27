'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useUserApi } from '@/hooks/use-user-api'
import { useAuth, usePermissions } from '@/store/auth-store'
import { useQueryState } from '@/hooks/use-query-state'
import { cn } from '@/lib/utils'

interface UserListProps {
  className?: string
}

const ITEMS_PER_PAGE = 10

export function UserList({ className }: UserListProps) {
  const { user: currentUser } = useAuth()
  const { canManageUsers } = usePermissions()
  const userApi = useUserApi()

  // 🚀 Query Builder로 대폭 단순화!
  const queryState = useQueryState({
    defaultLimit: ITEMS_PER_PAGE,
    defaultSort: '-createdAt',
  })

  // 사용자 목록 조회
  const { data: usersData, isLoading, error } = userApi.index(queryState.query)
  
  // 사용자 삭제 뮤테이션
  const deleteMutation = userApi.destroy()

  // 총 페이지 수 계산
  const totalPages = usersData ? Math.ceil(usersData.metadata.pagination.total / queryState.limit) : 0

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <p className="text-red-600">데이터를 불러오는 중 오류가 발생했습니다.</p>
        </CardContent>
      </Card>
    )
  }

  const handleDelete = (id: string) => {
    if (window.confirm('정말로 삭제하시겠습니까?')) {
      deleteMutation.mutate(id)
    }
  }

  // 권한 체크
  if (!canManageUsers) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <p className="text-gray-600">사용자 목록을 볼 권한이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle>사용자 목록</CardTitle>
          <CardDescription>
            등록된 모든 사용자를 확인할 수 있습니다. ({usersData?.metadata.pagination.total || 0}명)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 - 🚀 대폭 단순화됨! */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="이메일 검색..."
                value={queryState.filters.email || ''}
                onChange={(e) => queryState.searchBy('email', e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={queryState.sort}
                onChange={(e) => queryState.setSort(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="-createdAt">최신 가입순</option>
                <option value="createdAt">오래된 가입순</option>
                <option value="name">이름순 (A-Z)</option>
                <option value="-name">이름순 (Z-A)</option>
              </select>
            </div>
          </div>

          {/* 🎯 빠른 필터 버튼들 - 새로운 기능! */}
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryState.clearFilters()}
              disabled={Object.keys(queryState.filters).length === 0}
            >
              전체
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryState.clearFilters()
                queryState.queryBuilder.filterActive().build()
                queryState.setFilter('isActive_eq', 'true')
              }}
            >
              활성 사용자
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryState.clearFilters()
                queryState.queryBuilder.filterRecent(7).build()
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                queryState.setFilter('createdAt_gte', weekAgo.toISOString().split('T')[0])
              }}
            >
              최근 가입
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                queryState.clearFilters()
                queryState.setFilter('role_eq', 'admin')
              }}
            >
              관리자만
            </Button>
          </div>

          {/* 테이블 */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>로딩 중...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>전화번호</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.data.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? '관리자' : '사용자'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'secondary'}>
                            {user.isActive ? '활성' : '비활성'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="sm">
                            수정
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={deleteMutation.isPending || user.id === currentUser?.id}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 페이지네이션 - 🚀 대폭 단순화됨! */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    총 {usersData?.metadata.pagination.total}명 중 {Math.min((queryState.page - 1) * queryState.limit + 1, usersData?.metadata.pagination.total || 0)}-
                    {Math.min(queryState.page * queryState.limit, usersData?.metadata.pagination.total || 0)}명 표시
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={queryState.prevPage}
                      disabled={queryState.page === 1}
                    >
                      이전
                    </Button>
                    <span className="text-sm">
                      {queryState.page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={queryState.nextPage}
                      disabled={queryState.page === totalPages}
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
    </div>
  )
} 