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

function getTypeScriptType(type) {
  const typeMap = {
    'string': 'string',
    'text': 'string',
    'number': 'number',
    'integer': 'number',
    'float': 'number',
    'boolean': 'boolean',
    'date': 'string',
    'datetime': 'string',
    'email': 'string',
    'url': 'string',
    'phone': 'string'
  }

  return typeMap[type] || 'string'
}

async function generateCRUD() {
  try {
    const entityName = await new Promise((resolve) => {
      rl.question('🎯 생성할 엔티티명을 입력하세요 (예: Product, Order, Post): ', resolve)
    })

    const fields = await new Promise((resolve) => {
      rl.question('📝 필드를 입력하세요 (예: title:string,description:string,price:number,isActive:boolean): ', resolve)
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

    // 2. API 훅 생성 (클래스 기반)
    await generateApiHook(entity, entityLower, entityKebab, entityPlural, entityPluralKebab)

    // 3. constants.ts 업데이트
    await updateConstants(entity, entityLower, entityPlural, entityPluralKebab)

    console.log(`\n✅ ${entity} CRUD 생성 완료!`)
    console.log(`\n📁 생성된 파일들:`)
    console.log(`   - types/${entityLower}.ts`)
    console.log(`   - hooks/use-${entityKebab}-api.ts`)
    console.log(`\n🎯 사용법:`)
    console.log(`   const ${entityLower}Api = use${entity}Api()`)
    console.log(`   const { data } = ${entityLower}Api.index() // 목록 조회`)
    console.log(`   const { data } = ${entityLower}Api.show(id) // 단일 조회`)
    console.log(`   const create = ${entityLower}Api.create() // 생성`)
    console.log(`   const update = ${entityLower}Api.update(id) // 수정`)
    console.log(`   const remove = ${entityLower}Api.destroy(id) // 삭제`)

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    rl.close()
  }
}

async function generateTypes(entity, entityLower, fields) {
  const typeContent = `/**
 * ${entity} 관련 타입 정의
 */

// ${entity} 기본 인터페이스
export interface ${entity} {
  id: string
${fields.map(field => `  ${field.name}: ${getTypeScriptType(field.type)}`).join('\n')}
  createdAt: string
  updatedAt: string
}

// ${entity} 생성 요청 타입
export interface Create${entity}Request {
${fields.map(field => `  ${field.name}: ${getTypeScriptType(field.type)}`).join('\n')}
}

// ${entity} 수정 요청 타입
export interface Update${entity}Request {
${fields.map(field => `  ${field.name}?: ${getTypeScriptType(field.type)}`).join('\n')}
}

// ${entity} 필터 타입
export interface ${entity}Filter {
  ${fields.filter(f => f.type === 'string').map(f => `${f.name}?: string`).join('\n  ')}
  ${fields.filter(f => f.type === 'boolean').map(f => `${f.name}?: boolean`).join('\n  ')}
  ${fields.filter(f => f.type === 'number').map(f => `${f.name}?: number`).join('\n  ')}
}
`

  const filePath = `types/${entityLower}.ts`
  await fs.promises.writeFile(filePath, typeContent)
  console.log(`✅ 타입 정의 생성: ${filePath}`)
}

async function generateApiHook(entity, entityLower, entityKebab, entityPlural, entityPluralKebab) {
  const hookContent = `import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { API_ENDPOINTS, QUERY_KEYS } from '@/lib/constants'
import type { ${entity}, Create${entity}Request, Update${entity}Request } from '@/types/${entityLower}'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * ${entity} API 훅 클래스
 */
export class ${entity}Api {
  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

  /**
   * ${entity} 목록 조회
   */
  index = (query?: CrudQuery, options?: UseQueryOptions<PaginatedResponse<${entity}>>) => {
    return useQuery({
      queryKey: [...QUERY_KEYS.${entityLower.toUpperCase()}.lists(), query],
      queryFn: () => apiUtils.get(API_ENDPOINTS.${entityLower.toUpperCase()}, { query }),
      ...options,
    })
  }

  /**
   * ${entity} 단일 조회
   */
  show = (id: string, options?: UseQueryOptions<${entity}>) => {
    return useQuery({
      queryKey: [...QUERY_KEYS.${entityLower.toUpperCase()}.detail(id)],
      queryFn: () => apiUtils.get(\`\${API_ENDPOINTS.${entityLower.toUpperCase()}}/\${id}\`),
      enabled: !!id,
      ...options,
    })
  }

  /**
   * ${entity} 생성
   */
  create = (options?: MutationOptions<${entity}, Create${entity}Request>) => {
    return useMutation({
      mutationFn: (data: Create${entity}Request) =>
        apiUtils.post(API_ENDPOINTS.${entityLower.toUpperCase()}, data),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })
        toast.success('${entity}가 생성되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 생성에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * ${entity} 수정
   */
  update = (id: string, options?: MutationOptions<${entity}, Update${entity}Request>) => {
    return useMutation({
      mutationFn: (data: Update${entity}Request) =>
        apiUtils.put(\`\${API_ENDPOINTS.${entityLower.toUpperCase()}}/\${id}\`, data),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.detail(id) })
        toast.success('${entity}가 수정되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 수정에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }

  /**
   * ${entity} 삭제
   */
  destroy = (id: string, options?: MutationOptions<void, string>) => {
    return useMutation({
      mutationFn: () => apiUtils.delete(\`\${API_ENDPOINTS.${entityLower.toUpperCase()}}/\${id}\`),
      onSuccess: (data, variables) => {
        this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })
        this.queryClient.removeQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.detail(id) })
        toast.success('${entity}가 삭제되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 삭제에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }
}

/**
 * ${entity} API 훅
 */
export function use${entity}Api() {
  const queryClient = useQueryClient()
  
  return new ${entity}Api(queryClient)
}
`

  const filePath = `hooks/use-${entityKebab}-api.ts`
  await fs.promises.writeFile(filePath, hookContent)
  console.log(`✅ API 훅 생성: ${filePath}`)
}

async function updateConstants(entity, entityLower, entityPlural, entityPluralKebab) {
  const constantsPath = 'lib/constants.ts'

  try {
    let content = await fs.promises.readFile(constantsPath, 'utf8')

    // API_ENDPOINTS 업데이트
    const endpointsRegex = /export const API_ENDPOINTS = \{([^}]+)\}/s
    const endpointsMatch = content.match(endpointsRegex)

    if (endpointsMatch) {
      const endpointsContent = endpointsMatch[1]
      if (!endpointsContent.includes(`${entityLower.toUpperCase()}:`)) {
        const newEndpoint = `  ${entityLower.toUpperCase()}: '${entityPluralKebab}',`
        const updatedEndpoints = endpointsContent.trim() + '\n' + newEndpoint
        content = content.replace(endpointsRegex, `export const API_ENDPOINTS = {\n${updatedEndpoints}\n}`)
      }
    }

    // QUERY_KEYS 업데이트
    const queryKeysRegex = /export const QUERY_KEYS = \{([^}]+)\}/s
    const queryKeysMatch = content.match(queryKeysRegex)

    if (queryKeysMatch) {
      const queryKeysContent = queryKeysMatch[1]
      if (!queryKeysContent.includes(`${entityLower.toUpperCase()}:`)) {
        const newQueryKey = `  ${entityLower.toUpperCase()}: {
    all: ['${entityLower}'] as const,
    lists: () => [...QUERY_KEYS.${entityLower.toUpperCase()}.all, 'list'] as const,
    list: (filters?: Record<string, unknown>) => [...QUERY_KEYS.${entityLower.toUpperCase()}.lists(), filters] as const,
    details: () => [...QUERY_KEYS.${entityLower.toUpperCase()}.all, 'detail'] as const,
    detail: (id: string) => [...QUERY_KEYS.${entityLower.toUpperCase()}.details(), id] as const,
  },`
        const updatedQueryKeys = queryKeysContent.trim() + '\n' + newQueryKey
        content = content.replace(queryKeysRegex, `export const QUERY_KEYS = {\n${updatedQueryKeys}\n}`)
      }
    }

    await fs.promises.writeFile(constantsPath, content)
    console.log(`✅ 상수 업데이트: ${constantsPath}`)

  } catch (error) {
    console.warn(`⚠️  상수 파일 업데이트 실패: ${error.message}`)
  }
}

// 스크립트 실행
if (require.main === module) {
  generateCRUD().catch(console.error)
}

module.exports = { generateCRUD } 