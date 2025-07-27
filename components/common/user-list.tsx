'use client'

import React, { useState, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
// Select component 대신 간단한 버튼으로 대체
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useUserApi } from '@/hooks/use-user-api'
import { useAuth, usePermissions } from '@/store/auth-store'
import { cn } from '@/lib/utils'
import type { CrudQuery } from '@/types/api'

interface UserListProps {
  className?: string
}

const ITEMS_PER_PAGE = 10

export function UserList({ className }: UserListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [emailFilter, setEmailFilter] = useState('')
  const [sortBy, setSortBy] = useState<string>('-createdAt')
  
  const { user: currentUser } = useAuth()
  const { canManageUsers } = usePermissions()
  const userApi = useUserApi()

  // 쿼리 파라미터 구성
  const query = useMemo((): CrudQuery => {
    const baseQuery: CrudQuery = {
      page: {
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      },
      sort: [sortBy],
    }

    if (emailFilter.trim()) {
      baseQuery.filter = {
        'email_like': `%${emailFilter.trim()}%`
      }
    }

    return baseQuery
  }, [currentPage, emailFilter, sortBy])

  // 사용자 목록 조회
  const { data: usersData, isLoading, error } = userApi.index(query)

  // 사용자 삭제 뮤테이션
  const deleteUserMutation = userApi.destroy()

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`정말로 "${userName}" 사용자를 삭제하시겠습니까?`)) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleEmailFilterChange = (value: string) => {
    setEmailFilter(value)
    setCurrentPage(1) // 필터 변경 시 첫 페이지로 이동
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1) // 정렬 변경 시 첫 페이지로 이동
  }

  // 총 페이지 수 계산
  const totalPages = usersData ? Math.ceil(usersData.metadata.pagination.total / ITEMS_PER_PAGE) : 0

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            사용자 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle>사용자 목록</CardTitle>
                 <CardDescription>
           등록된 모든 사용자를 확인할 수 있습니다. ({usersData?.metadata.pagination.total || 0}명)
         </CardDescription>
      </CardHeader>
      <CardContent>
        {/* 필터 및 정렬 컨트롤 */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="이메일로 검색..."
              value={emailFilter}
              onChange={(e) => handleEmailFilterChange(e.target.value)}
              className="w-full"
            />
          </div>
                     <div className="w-full sm:w-48">
             <select 
               value={sortBy} 
               onChange={(e) => handleSortChange(e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
             >
                                <option value="-createdAt">최신 가입순</option>
                 <option value="createdAt">오래된 가입순</option>
               <option value="name">이름순 (A-Z)</option>
               <option value="-name">이름순 (Z-A)</option>
               <option value="email">이메일순 (A-Z)</option>
               <option value="-email">이메일순 (Z-A)</option>
             </select>
           </div>
        </div>

        {/* 사용자 테이블 */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : usersData?.data.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {emailFilter ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>상태</TableHead>
                    {canManageUsers && <TableHead className="text-right">작업</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData?.data.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name}
                        {currentUser?.id === user.id && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            본인
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">활성</Badge>
                      </TableCell>
                      {canManageUsers && (
                        <TableCell className="text-right">
                          {currentUser?.id !== user.id && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.name)}
                              disabled={deleteUserMutation.isPending}
                            >
                              삭제
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                                 <p className="text-sm text-gray-500">
                   총 {usersData?.metadata.pagination.total}명 중 {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, usersData?.metadata.pagination.total || 0)}-
                   {Math.min(currentPage * ITEMS_PER_PAGE, usersData?.metadata.pagination.total || 0)}명 표시
                 </p>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    이전
                  </Button>
                  <span className="text-sm">
                    {currentPage} / {totalPages}
                  </span>
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