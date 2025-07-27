#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function toPascalCase(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function toCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1).toLowerCase()
}

function toKebabCase(str) {
  return str.toLowerCase().replace(/ /g, '-')
}

function pluralize(word) {
  const irregulars = {
    'person': 'people',
    'child': 'children',
    'tooth': 'teeth',
    'foot': 'feet',
    'mouse': 'mice',
    'man': 'men',
    'woman': 'women'
  }

  if (irregulars[word.toLowerCase()]) {
    return irregulars[word.toLowerCase()]
  }

  if (word.endsWith('y') && !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])) {
    return word.slice(0, -1) + 'ies'
  }

  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es'
  }

  return word + 's'
}

async function generateCRUD() {
  try {
    const entityName = await new Promise((resolve) => {
      rl.question('🎯 생성할 엔티티명을 입력하세요 (예: Product, Order, Post): ', resolve)
    })

    const fields = await new Promise((resolve) => {
      rl.question('📝 필드를 입력하세요 (예: title:string,description:string,price:number,isActive:boolean): ', resolve)
    })

    const includeAuth = await new Promise((resolve) => {
      rl.question('🔐 인증이 필요한 리소스인가요? (y/n): ', (answer) => {
        resolve(answer.toLowerCase() === 'y')
      })
    })

    rl.close()

    const entity = toPascalCase(entityName)
    const entityLower = toCamelCase(entityName)
    const entityKebab = toKebabCase(entityName)
    const entityPlural = pluralize(entityLower)
    const entityPluralKebab = toKebabCase(pluralize(entityName))

    console.log(`\n🚀 ${entity} CRUD 생성 중...`)

    // 필드 파싱
    const parsedFields = fields.split(',').map(field => {
      const [name, type] = field.trim().split(':')
      return { name: name.trim(), type: type?.trim() || 'string' }
    })

    // 1. 타입 정의 생성
    await generateTypes(entity, entityLower, parsedFields)

    // 2. API 훅 생성
    await generateApiHook(entity, entityLower, entityPlural, entityPluralKebab)

    // 3. 폼 컴포넌트 생성
    await generateFormComponent(entity, entityLower, entityKebab, parsedFields, includeAuth)

    // 4. 리스트 컴포넌트 생성
    await generateListComponent(entity, entityLower, entityKebab, entityPlural, parsedFields, includeAuth)

    // 5. 페이지 생성
    await generatePages(entity, entityLower, entityPluralKebab, includeAuth)

    // 6. 상수 추가
    await updateConstants(entity, entityLower, entityPlural, entityPluralKebab)

    console.log(`\n✅ ${entity} CRUD 생성 완료!`)
    console.log(`\n📁 생성된 파일들:`)
    console.log(`   - types/${entityLower}.ts`)
    console.log(`   - hooks/use-${entityKebab}-api.ts`)
    console.log(`   - components/forms/${entityKebab}-form.tsx`)
    console.log(`   - components/common/${entityKebab}-list.tsx`)
    console.log(`   - app/${entityPluralKebab}/page.tsx`)
    console.log(`   - app/${entityPluralKebab}/create/page.tsx`)
    console.log(`\n🎉 이제 http://localhost:3000/${entityPluralKebab} 로 접속해보세요!`)

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    rl.close()
  }
}

async function generateTypes(entity, entityLower, fields) {
  const typeContent = `// ${entity} 관련 타입 정의
export interface ${entity} {
  id: string
${fields.map(field => `  ${field.name}: ${getTypeScriptType(field.type)}`).join('\n')}
  createdAt: string
  updatedAt: string
}

export interface Create${entity}Request {
${fields.map(field => `  ${field.name}: ${getTypeScriptType(field.type)}`).join('\n')}
}

export interface Update${entity}Request {
${fields.map(field => `  ${field.name}?: ${getTypeScriptType(field.type)}`).join('\n')}
}
`

  const filePath = `types/${entityLower}.ts`
  await fs.promises.writeFile(filePath, typeContent)
  console.log(`✅ 타입 정의 생성: ${filePath}`)
}

async function generateApiHook(entity, entityLower, entityPlural, entityPluralKebab) {
  const hookContent = `import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { 
  ${entity}, 
  Create${entity}Request, 
  Update${entity}Request, 
  CrudQuery, 
  PaginatedResponse, 
  QueryError 
} from '@/types/api'
import type { ${entity} as ${entity}Type } from '@/types/${entityLower}'

type MutationOptions<TData, TVariables> = {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: QueryError, variables: TVariables) => void
}

class ${entity}Api {
  private queryClient = useQueryClient()
  private router = useRouter()

  // 목록 조회
  index(
    query?: CrudQuery,
    options?: Omit<UseQueryOptions<PaginatedResponse<${entity}Type>, QueryError>, 'queryKey' | 'queryFn'>
  ) {
    const queryString = query ? \`?\${apiUtils.buildCrudQuery(query)}\` : ''
    
    return useQuery({
      queryKey: [...QUERY_KEYS.${entity.toUpperCase()}_LIST, query],
      queryFn: async (): Promise<PaginatedResponse<${entity}Type>> => {
        return apiUtils.get<PaginatedResponse<${entity}Type>>(\`\${API_ENDPOINTS.${entity.toUpperCase()}.BASE}\${queryString}\`)
      },
      staleTime: 5 * 60 * 1000, // 5분
      ...options,
    })
  }

  // 단일 조회
  show(
    id: string,
    options?: Omit<UseQueryOptions<${entity}Type, QueryError>, 'queryKey' | 'queryFn'>
  ) {
    return useQuery({
      queryKey: QUERY_KEYS.${entity.toUpperCase()}_BY_ID(id),
      queryFn: async (): Promise<${entity}Type> => {
        return apiUtils.get<${entity}Type>(API_ENDPOINTS.${entity.toUpperCase()}.BY_ID(id))
      },
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      ...options,
    })
  }

  // 생성
  create(options?: MutationOptions<${entity}Type, Create${entity}Request>) {
    return useMutation({
      mutationFn: async (data: Create${entity}Request): Promise<${entity}Type> => {
        return apiUtils.post<${entity}Type>(API_ENDPOINTS.${entity.toUpperCase()}.BASE, data)
      },
      onSuccess: (data, variables) => {
        toast.success('${entity} 생성이 완료되었습니다')
        this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.${entity.toUpperCase()}_LIST[0]] })
        this.router.push('/${entityPluralKebab}')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 생성 중 오류가 발생했습니다')
        options?.onError?.(error, variables)
      },
    })
  }

  // 수정
  update(options?: MutationOptions<${entity}Type, { id: string; data: Update${entity}Request }>) {
    return useMutation({
      mutationFn: async ({ id, data }: { id: string; data: Update${entity}Request }): Promise<${entity}Type> => {
        return apiUtils.put<${entity}Type>(API_ENDPOINTS.${entity.toUpperCase()}.BY_ID(id), data)
      },
      onSuccess: (data, variables) => {
        toast.success('${entity} 수정이 완료되었습니다')
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entity.toUpperCase()}_BY_ID(variables.id) })
        this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.${entity.toUpperCase()}_LIST[0]] })
        this.router.push('/${entityPluralKebab}')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 수정 중 오류가 발생했습니다')
        options?.onError?.(error, variables)
      },
    })
  }

  // 삭제
  destroy(options?: MutationOptions<void, string>) {
    return useMutation({
      mutationFn: async (id: string): Promise<void> => {
        return apiUtils.delete<void>(API_ENDPOINTS.${entity.toUpperCase()}.BY_ID(id))
      },
      onSuccess: (data, variables) => {
        toast.success('${entity} 삭제가 완료되었습니다')
        this.queryClient.removeQueries({ queryKey: QUERY_KEYS.${entity.toUpperCase()}_BY_ID(variables) })
        this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.${entity.toUpperCase()}_LIST[0]] })
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 삭제 중 오류가 발생했습니다')
        options?.onError?.(error, variables)
      },
    })
  }

  // 캐시 무효화
  invalidateQueries() {
    return {
      all: () => this.queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.${entity.toUpperCase()}_LIST[0]] }),
      byId: (id: string) => this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entity.toUpperCase()}_BY_ID(id) }),
    }
  }

  // 프리페치
  prefetch() {
    return {
      ${entityPlural}: async (query?: CrudQuery) => {
        const queryString = query ? \`?\${apiUtils.buildCrudQuery(query)}\` : ''
        
        return this.queryClient.prefetchQuery({
          queryKey: [...QUERY_KEYS.${entity.toUpperCase()}_LIST, query],
          queryFn: async (): Promise<PaginatedResponse<${entity}Type>> => {
            return apiUtils.get<PaginatedResponse<${entity}Type>>(\`\${API_ENDPOINTS.${entity.toUpperCase()}.BASE}\${queryString}\`)
          },
          staleTime: 2 * 60 * 1000,
        })
      },
      ${entityLower}: async (id: string) => {
        return this.queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.${entity.toUpperCase()}_BY_ID(id),
          queryFn: async (): Promise<${entity}Type> => {
            return apiUtils.get<${entity}Type>(API_ENDPOINTS.${entity.toUpperCase()}.BY_ID(id))
          },
          staleTime: 2 * 60 * 1000,
        })
      },
    }
  }
}

export const use${entity}Api = () => {
  return new ${entity}Api()
}
`

  const filePath = `hooks/use-${toKebabCase(entity)}-api.ts`
  await fs.promises.writeFile(filePath, hookContent)
  console.log(`✅ API 훅 생성: ${filePath}`)
}

async function generateFormComponent(entity, entityLower, entityKebab, fields, includeAuth) {
  const formContent = `'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { use${entity}Api } from '@/hooks/use-${entityKebab}-api'
import type { ${entity} } from '@/types/${entityLower}'
${includeAuth ? "import { useAuth } from '@/hooks/use-auth'" : ''}

// 폼 스키마 정의
const ${entityLower}Schema = z.object({
${fields.map(field => `  ${field.name}: ${getZodSchema(field.type)}`).join(',\n')}
})

type ${entity}FormData = z.infer<typeof ${entityLower}Schema>

interface ${entity}FormProps {
  ${entityLower}?: ${entity}
  onSuccess?: () => void
}

export function ${entity}Form({ ${entityLower}, onSuccess }: ${entity}FormProps) {
  const ${entityLower}Api = use${entity}Api()
  const isEditing = !!${entityLower}?.id
${includeAuth ? '  const { user } = useAuth()' : ''}

  const form = useForm<${entity}FormData>({
    resolver: zodResolver(${entityLower}Schema),
    defaultValues: ${entityLower} ? {
${fields.map(field => `      ${field.name}: ${entityLower}.${field.name}`).join(',\n')}
    } : {
${fields.map(field => `      ${field.name}: ${getDefaultValue(field.type)}`).join(',\n')}
    },
  })

  const createMutation = ${entityLower}Api.create({
    onSuccess: () => {
      form.reset()
      onSuccess?.()
    },
  })

  const updateMutation = ${entityLower}Api.update({
    onSuccess: () => {
      onSuccess?.()
    },
  })

  const onSubmit = (data: ${entity}FormData) => {
    if (isEditing && ${entityLower}?.id) {
      updateMutation.mutate({ id: ${entityLower}.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isEditing ? '${entity} 수정' : '새 ${entity} 생성'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
${fields.map(field => generateFormField(field)).join('\n\n')}

          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : isEditing ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
`

  const filePath = `components/forms/${entityKebab}-form.tsx`
  await fs.promises.writeFile(filePath, formContent)
  console.log(`✅ 폼 컴포넌트 생성: ${filePath}`)
}

async function generateListComponent(entity, entityLower, entityKebab, entityPlural, fields, includeAuth) {
  const listContent = `'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { use${entity}Api } from '@/hooks/use-${entityKebab}-api'
import type { CrudQuery } from '@/types/api'
${includeAuth ? "import { useAuth } from '@/hooks/use-auth'" : ''}

const ITEMS_PER_PAGE = 10

export function ${entity}List() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchFilter, setSearchFilter] = useState('')
  const [sortBy, setSortBy] = useState<string>('-createdAt')
${includeAuth ? '  const { user: currentUser } = useAuth()' : ''}
  
  const ${entityLower}Api = use${entity}Api()

  // 쿼리 파라미터 구성
  const query = useMemo((): CrudQuery => {
    const baseQuery: CrudQuery = {
      page: {
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
        limit: ITEMS_PER_PAGE,
      },
      sort: [sortBy],
    }

    if (searchFilter.trim()) {
      baseQuery.filter = {
        '${fields.find(f => f.type === 'string')?.name || 'name'}_like': \`%\${searchFilter.trim()}%\`
      }
    }

    return baseQuery
  }, [currentPage, searchFilter, sortBy])

  // ${entity} 목록 조회
  const { data: ${entityPlural}Data, isLoading, error } = ${entityLower}Api.index(query)
  
  // 삭제 뮤테이션
  const deleteMutation = ${entityLower}Api.destroy()

  // 총 페이지 수 계산
  const totalPages = ${entityPlural}Data ? Math.ceil(${entityPlural}Data.metadata.pagination.total / ITEMS_PER_PAGE) : 0

  if (error) {
    return (
      <Card className="w-full">
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>${entity} 목록</CardTitle>
          <CardDescription>
            등록된 모든 ${entity}을 확인할 수 있습니다. ({${entityPlural}Data?.metadata.pagination.total || 0}개)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="${entity} 검색..."
                value={searchFilter}
                onChange={(e) => {
                  setSearchFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="-createdAt">최신순</option>
                <option value="createdAt">오래된 순</option>
${fields.filter(f => f.type === 'string').map(field =>
    `                <option value="${field.name}">${field.name} (A-Z)</option>
                <option value="-${field.name}">${field.name} (Z-A)</option>`
  ).join('\n')}
              </select>
              <Link href="/${toKebabCase(pluralize(entity))}/create">
                <Button>새 ${entity} 생성</Button>
              </Link>
            </div>
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
${fields.slice(0, 4).map(field => `                      <TableHead>${field.name}</TableHead>`).join('\n')}
                      <TableHead>생성일</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {${entityPlural}Data?.data.map((${entityLower}) => (
                      <TableRow key={${entityLower}.id}>
${fields.slice(0, 4).map(field => `                        <TableCell>${generateTableCell(field, entityLower)}</TableCell>`).join('\n')}
                        <TableCell>
                          {new Date(${entityLower}.createdAt).toLocaleDateString('ko-KR')}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={\`/${toKebabCase(pluralize(entity))}/\${${entityLower}.id}/edit\`}>
                            <Button variant="outline" size="sm">수정</Button>
                          </Link>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(${entityLower}.id)}
                            disabled={deleteMutation.isPending}
                          >
                            삭제
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-500">
                    총 {${entityPlural}Data?.metadata.pagination.total}개 중 {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, ${entityPlural}Data?.metadata.pagination.total || 0)}-
                    {Math.min(currentPage * ITEMS_PER_PAGE, ${entityPlural}Data?.metadata.pagination.total || 0)}개 표시
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      이전
                    </Button>
                    <span className="text-sm">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
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
`

  const filePath = `components/common/${entityKebab}-list.tsx`
  await fs.promises.writeFile(filePath, listContent)
  console.log(`✅ 리스트 컴포넌트 생성: ${filePath}`)
}

async function generatePages(entity, entityLower, entityPluralKebab, includeAuth) {
  // 메인 페이지
  const mainPageContent = `${includeAuth ? "'use client'\n\nimport { useAuth } from '@/hooks/use-auth'" : ''}
import { ${entity}List } from '@/components/common/${toKebabCase(entity)}-list'

export default function ${entity}sPage() {
${includeAuth ? '  const { user, isAuthenticated } = useAuth()\n\n  if (!isAuthenticated) {\n    return <div>로그인이 필요합니다.</div>\n  }' : ''}

  return (
    <div className="container mx-auto px-4 py-8">
      <${entity}List />
    </div>
  )
}
`

  // 생성 페이지
  const createPageContent = `${includeAuth ? "'use client'\n\nimport { useAuth } from '@/hooks/use-auth'" : ''}
import { ${entity}Form } from '@/components/forms/${toKebabCase(entity)}-form'

export default function Create${entity}Page() {
${includeAuth ? '  const { user, isAuthenticated } = useAuth()\n\n  if (!isAuthenticated) {\n    return <div>로그인이 필요합니다.</div>\n  }' : ''}

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">새 ${entity} 생성</h1>
      <${entity}Form />
    </div>
  )
}
`

  // 디렉토리 생성
  await fs.promises.mkdir(`app/${entityPluralKebab}`, { recursive: true })
  await fs.promises.mkdir(`app/${entityPluralKebab}/create`, { recursive: true })

  await fs.promises.writeFile(`app/${entityPluralKebab}/page.tsx`, mainPageContent)
  await fs.promises.writeFile(`app/${entityPluralKebab}/create/page.tsx`, createPageContent)

  console.log(`✅ 페이지 생성: app/${entityPluralKebab}/page.tsx`)
  console.log(`✅ 페이지 생성: app/${entityPluralKebab}/create/page.tsx`)
}

async function updateConstants(entity, entityLower, entityPlural, entityPluralKebab) {
  try {
    const constantsPath = 'lib/constants.ts'
    let content = await fs.promises.readFile(constantsPath, 'utf8')

    // API_ENDPOINTS에 추가
    const endpointToAdd = `
  ${entity.toUpperCase()}: {
    BASE: '${entityPluralKebab}',
    BY_ID: (id: string) => \`${entityPluralKebab}/\${id}\`,
  },`

    if (!content.includes(`${entity.toUpperCase()}:`)) {
      content = content.replace(
        /export const API_ENDPOINTS = {([^}]+)}/s,
        `export const API_ENDPOINTS = {$1${endpointToAdd}
}`
      )
    }

    // QUERY_KEYS에 추가
    const queryKeyToAdd = `
  ${entity.toUpperCase()}_LIST: ['${entityPlural}'] as const,
  ${entity.toUpperCase()}_BY_ID: (id: string) => ['${entityPlural}', id] as const,`

    if (!content.includes(`${entity.toUpperCase()}_LIST:`)) {
      content = content.replace(
        /export const QUERY_KEYS = {([^}]+)}/s,
        `export const QUERY_KEYS = {$1${queryKeyToAdd}
}`
      )
    }

    await fs.promises.writeFile(constantsPath, content)
    console.log(`✅ 상수 업데이트: ${constantsPath}`)
  } catch (error) {
    console.log(`⚠️  상수 파일 업데이트 실패: ${error.message}`)
  }
}

// 헬퍼 함수들
function getTypeScriptType(type) {
  const typeMap = {
    'string': 'string',
    'number': 'number',
    'boolean': 'boolean',
    'date': 'string',
    'array': 'string[]',
    'object': 'Record<string, unknown>'
  }
  return typeMap[type] || 'string'
}

function getZodSchema(type) {
  const schemaMap = {
    'string': 'z.string().min(1, "필수 입력 항목입니다")',
    'number': 'z.number().min(0, "0 이상의 숫자를 입력해주세요")',
    'boolean': 'z.boolean()',
    'date': 'z.string().min(1, "날짜를 선택해주세요")',
    'array': 'z.array(z.string())',
    'object': 'z.record(z.unknown())'
  }
  return schemaMap[type] || 'z.string().min(1, "필수 입력 항목입니다")'
}

function getDefaultValue(type) {
  const defaultMap = {
    'string': "''",
    'number': '0',
    'boolean': 'false',
    'date': "''",
    'array': '[]',
    'object': '{}'
  }
  return defaultMap[type] || "''"
}

function generateFormField(field) {
  const { name, type } = field

  switch (type) {
    case 'boolean':
      return `          <div className="flex items-center space-x-2">
            <Checkbox
              id="${name}"
              checked={form.watch('${name}')}
              onCheckedChange={(checked) => form.setValue('${name}', checked as boolean)}
            />
            <label htmlFor="${name}" className="text-sm font-medium">
              ${name}
            </label>
            {form.formState.errors.${name} && (
              <p className="text-sm text-red-600">
                {form.formState.errors.${name}?.message}
              </p>
            )}
          </div>`

    case 'number':
      return `          <div className="space-y-2">
            <label htmlFor="${name}" className="text-sm font-medium">
              ${name}
            </label>
            <Input
              id="${name}"
              type="number"
              {...form.register('${name}', { valueAsNumber: true })}
              placeholder="${name}을 입력하세요"
            />
            {form.formState.errors.${name} && (
              <p className="text-sm text-red-600">
                {form.formState.errors.${name}?.message}
              </p>
            )}
          </div>`

    default: // string, date 등
      const isTextarea = name.includes('description') || name.includes('content') || name.includes('bio')
      const Component = isTextarea ? 'Textarea' : 'Input'
      const inputType = type === 'date' ? 'date' : 'text'

      return `          <div className="space-y-2">
            <label htmlFor="${name}" className="text-sm font-medium">
              ${name}
            </label>
            <${Component}
              id="${name}"
              ${!isTextarea ? `type="${inputType}"` : ''}
              {...form.register('${name}')}
              placeholder="${name}을 입력하세요"
              ${isTextarea ? 'rows={4}' : ''}
            />
            {form.formState.errors.${name} && (
              <p className="text-sm text-red-600">
                {form.formState.errors.${name}?.message}
              </p>
            )}
          </div>`
  }
}

function generateTableCell(field, entityLower) {
  const { name, type } = field

  switch (type) {
    case 'boolean':
      return `
                          <Badge variant={${entityLower}.${name} ? 'default' : 'secondary'}>
                            {${entityLower}.${name} ? '활성' : '비활성'}
                          </Badge>`

    case 'number':
      return `{${entityLower}.${name}?.toLocaleString()}`

    default:
      if (name.includes('description') || name.includes('content')) {
        return `
                          <div className="max-w-xs truncate" title={${entityLower}.${name}}>
                            {${entityLower}.${name}}
                          </div>`
      }
      return `{${entityLower}.${name}}`
  }
}

// 스크립트 실행
generateCRUD() 