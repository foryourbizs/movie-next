#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const readline = require('readline')

// .env 파일 로드 시도
try {
  const envFiles = ['.env.local', '.env']
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile)
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8')
      envContent.split('\n').forEach(line => {
        const cleanLine = line.trim()
        if (cleanLine && !cleanLine.startsWith('#')) {
          const [key, ...valueParts] = cleanLine.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim()
            if (!process.env[key]) {
              process.env[key] = value
            }
          }
        }
      })
      break // 첫 번째로 찾은 파일만 사용
    }
  }
} catch (error) {
  // .env 파일 로드 실패는 무시
}

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

function getTypeScriptType(column) {
  const { metadata, isNullable, enum: enumValues } = column

  // Enum 타입 처리
  if (metadata.isEnum && enumValues) {
    const enumType = enumValues.map(val => `'${val}'`).join(' | ')
    return isNullable ? `${enumType} | null` : enumType
  }

  // 기본 타입 매핑
  const typeMap = {
    'string': 'string',
    'varchar': 'string',
    'text': 'string',
    'Date': 'string',
    'timestamp': 'string',
    'number': 'number',
    'integer': 'number',
    'float': 'number',
    'boolean': 'boolean',
    'unknown': 'string'
  }

  let baseType = typeMap[metadata.jsType] || 'string'

  return isNullable ? `${baseType} | null` : baseType
}

async function fetchSchemaFromAPI(entityName) {
  try {
    // 환경변수 또는 기본값으로 API URL 설정
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const url = `${baseUrl}/api/v1/schema/${entityName.toLowerCase()}`

    console.log(`🔍 스키마 정보 조회 중: ${url}`)

    // Node.js에서 fetch 사용 (Node 18+)
    const response = await fetch(url)

    if (!response.ok) {
      // 404: 엔티티가 존재하지 않음
      if (response.status === 404) {
        console.error(`❌ 엔티티 '${entityName}'가 존재하지 않습니다.`)
        console.error(`💡 백엔드에서 해당 엔티티가 정의되어 있는지 확인해주세요.`)
        process.exit(1)
      }

      // 403: 스키마 API가 비활성화됨
      if (response.status === 403) {
        console.error(`❌ Schema API가 비활성화되어 있습니다.`)
        console.error(`💡 백엔드 설정에서 스키마 API를 활성화해주세요.`)
        process.exit(1)
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const schemaData = await response.json()
    return schemaData.data

  } catch (error) {
    // fetch 에러 (네트워크 오류 등)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn(`⚠️  백엔드 서버에 연결할 수 없습니다: ${error.message}`)
      console.log('💡 백엔드 서버가 실행 중인지 확인하거나 수동 입력 모드를 사용하세요.')
    } else {
      console.warn(`⚠️  스키마 API 호출 실패: ${error.message}`)
    }
    console.log('💡 수동 입력 모드로 전환합니다.')
    return null
  }
}

async function generateCRUD() {
  try {
    const entityName = await new Promise((resolve) => {
      rl.question('🎯 생성할 엔티티명을 입력하세요 (예: user, product, order): ', resolve)
    })

    // 1. 스키마 API에서 정보 가져오기 시도
    let schemaData = await fetchSchemaFromAPI(entityName)
    let fields = []
    let relations = []
    let crudInfo = null

    if (schemaData) {
      console.log(`✅ 스키마 정보를 성공적으로 가져왔습니다!`)
      console.log(`📋 엔티티: ${schemaData.entityName}`)
      console.log(`📋 테이블: ${schemaData.tableName}`)
      console.log(`📋 컬럼 수: ${schemaData.columns.length}개`)

      // 스키마에서 필드 정보 추출
      fields = schemaData.columns
        .filter(col => !['id', 'createdAt', 'updatedAt'].includes(col.name)) // 기본 필드 제외
        .map(col => ({
          name: col.name,
          type: getTypeScriptType(col),
          isNullable: col.isNullable,
          isEnum: col.metadata?.isEnum || false,
          enumValues: col.enum || null,
          length: col.length
        }))

      // 관계 정보 추출
      relations = schemaData.relations || []

      crudInfo = schemaData.crudInfo

      console.log(`📝 추출된 필드들:`)
      fields.forEach(field => {
        console.log(`   - ${field.name}: ${field.type}${field.isEnum ? ` (enum: ${field.enumValues?.join(', ')})` : ''}`)
      })

      if (relations.length > 0) {
        console.log(`🔗 관계 필드들:`)
        relations.forEach(relation => {
          const relationType = relation.type === 'one-to-many' || relation.type === 'many-to-many' ? `${relation.target}[]` : relation.target
          console.log(`   - ${relation.name}: ${relationType} (${relation.type})`)
        })


      }

    } else {
      // 2. 수동 입력 모드
      const fieldsInput = await new Promise((resolve) => {
        rl.question('📝 필드를 입력하세요 (예: title:string,description:string,price:number,isActive:boolean): ', resolve)
      })

      fields = fieldsInput.split(',').map(field => {
        const [name, type] = field.trim().split(':')
        return {
          name: name.trim(),
          type: type?.trim() || 'string',
          isNullable: false,
          isEnum: false,
          enumValues: null
        }
      })

      relations = [] // 수동 모드에서는 관계 없음
    }

    rl.close()

    const entity = toPascalCase(entityName)
    const entityLower = toCamelCase(entityName)
    const entityKebab = toKebabCase(entityName)
    const entityPlural = pluralize(entityLower)
    const entityPluralKebab = toKebabCase(pluralize(entityName))

    // 타입 생성 정보 출력
    if (crudInfo && crudInfo.routeSettings) {
      console.log(`🎯 백엔드 기반 타입 제약사항:`)

      const createSettings = crudInfo.routeSettings.create || {}
      const createParams = createSettings.hasOwnProperty('allowedParams')
        ? createSettings.allowedParams
        : (crudInfo.allowedParams || [])
      if (createParams.length > 0) {
        console.log(`   Create${entity}Request: ${createParams.join(', ')}`)
      }

      const updateSettings = crudInfo.routeSettings.update || {}
      const updateParams = updateSettings.hasOwnProperty('allowedParams')
        ? updateSettings.allowedParams
        : (crudInfo.allowedParams || [])
      if (updateParams.length > 0) {
        console.log(`   Update${entity}Request: ${updateParams.join(', ')}`)
      }

      const indexSettings = crudInfo.routeSettings.index || {}
      const filterParams = indexSettings.hasOwnProperty('allowedFilters')
        ? indexSettings.allowedFilters
        : (crudInfo.allowedFilters || [])
      if (filterParams.length > 0) {
        console.log(`   ${entity}Filter: ${filterParams.join(', ')}`)
      }
    }

    console.log(`\n🚀 ${entity} CRUD 생성 중...`)

    // 1. 폴더 생성
    await createDirectories(entityLower)

    // 2. CRUD 타입 정의 생성
    await generateCrudTypes(entity, entityLower, fields, relations, crudInfo)

    // 3. 확장 가능한 타입 정의 생성 (존재하지 않을 때만)
    await generateExtendableTypes(entity, entityLower, entityKebab)

    // 4. CRUD API 훅 생성 (클래스 기반)
    await generateCrudApiHook(entity, entityLower, entityKebab, entityPlural, entityPluralKebab, crudInfo)

    // 5. 확장 가능한 API 훅 생성 (존재하지 않을 때만)
    await generateExtendableApiHook(entity, entityLower, entityKebab)

    // 6. constants.ts 업데이트
    await updateConstants(entity, entityLower, entityPlural, entityPluralKebab)

    console.log(`\n✅ ${entity} CRUD 생성 완료!`)
    console.log(`\n📁 생성된 파일들:`)
    console.log(`   - types/${entityLower}/crud-${entityLower}.ts (자동 생성)`)
    console.log(`   - types/${entityLower}/${entityLower}.ts (확장용, 존재시 스킵)`)
    console.log(`   - hooks/${entityLower}/use-crud-${entityKebab}-api.ts (자동 생성)`)
    console.log(`   - hooks/${entityLower}/use-${entityKebab}-api.ts (확장용, 존재시 스킵)`)
    console.log(`\n🎯 사용법:`)
    console.log(`   const ${entityLower}Api = use${entity}Api()`)

    // 실제 허용된 메서드만 표시
    if (crudInfo && crudInfo.isConfigured && crudInfo.allowedMethods) {
      const allowedMethods = crudInfo.allowedMethods
      if (allowedMethods.includes('index')) {
        console.log(`   const { data } = ${entityLower}Api.index() // 목록 조회`)
      }
      if (allowedMethods.includes('show')) {
        console.log(`   const { data } = ${entityLower}Api.show(id) // 단일 조회`)
      }
      if (allowedMethods.includes('create')) {
        console.log(`   const create = ${entityLower}Api.create() // 생성`)
      }
      if (allowedMethods.includes('update')) {
        console.log(`   const update = ${entityLower}Api.update(id) // 수정`)
      }
      if (allowedMethods.includes('destroy')) {
        console.log(`   const remove = ${entityLower}Api.destroy(id) // 삭제`)
      }

      if (allowedMethods.length === 0) {
        console.log(`   // ❌ 허용된 메서드가 없습니다.`)
      }
    } else {
      console.log(`   // ❌ CRUD 컨트롤러가 설정되지 않았습니다.`)
    }
    console.log(`\n💡 커스텀 확장:`)
    console.log(`   types/${entityLower}/${entityLower}.ts 에서 타입 확장`)
    console.log(`   hooks/${entityLower}/use-${entityKebab}-api.ts 에서 메서드 확장`)

  } catch (error) {
    console.error('❌ 오류 발생:', error.message)
    rl.close()
  }
}

async function createDirectories(entityLower) {
  const typesDir = `types/${entityLower}`
  const hooksDir = `hooks/${entityLower}`

  try {
    if (!fs.existsSync(typesDir)) {
      await fs.promises.mkdir(typesDir, { recursive: true })
      console.log(`📁 폴더 생성: ${typesDir}`)
    }

    if (!fs.existsSync(hooksDir)) {
      await fs.promises.mkdir(hooksDir, { recursive: true })
      console.log(`📁 폴더 생성: ${hooksDir}`)
    }
  } catch (error) {
    console.warn(`⚠️  폴더 생성 실패: ${error.message}`)
  }
}

async function generateCrudTypes(entity, entityLower, fields, relations = [], crudInfo = null) {
  // 관계 타입 처리 함수
  function getRelationType(relation) {
    const targetEntity = relation.target
    const isArray = relation.type === 'one-to-many' || relation.type === 'many-to-many'
    const baseType = isArray ? `${targetEntity}[]` : targetEntity
    return relation.nullable ? `${baseType} | null` : baseType
  }

  // 관계에서 필요한 import 타입들 추출
  const relationImports = relations
    .map(rel => rel.target)
    .filter((target, index, arr) => arr.indexOf(target) === index) // 중복 제거

  // Import 문 생성
  const importStatements = relationImports.length > 0
    ? `// 관계 타입 import\n${relationImports.map(target => `import type { ${target} } from '@/types/${target.toLowerCase()}/${target.toLowerCase()}'`).join('\n')}\n\n`
    : ''

  // Enum 타입들 먼저 정의
  const enumTypes = fields
    .filter(field => field.isEnum && field.enumValues)
    .map(field => {
      const enumName = `${entity}${toPascalCase(field.name)}`
      const enumValues = field.enumValues.map(val => `  ${val.toUpperCase()} = '${val}'`).join(',\n')
      return `export enum ${enumName} {\n${enumValues}\n}`
    })
    .join('\n\n')

  // 백엔드 설정에서 허용된 파라미터 추출
  function getAllowedFields(method) {
    if (!crudInfo || !crudInfo.routeSettings) return fields.map(f => f.name)

    const routeSettings = crudInfo.routeSettings?.[method] || {}
    const globalSettings = crudInfo

    const allowedParams = routeSettings.hasOwnProperty('allowedParams')
      ? routeSettings.allowedParams
      : (globalSettings.allowedParams || fields.map(f => f.name))

    return allowedParams
  }

  // 백엔드 설정에서 허용된 필터 추출
  function getAllowedFilters() {
    if (!crudInfo || !crudInfo.routeSettings) return fields.filter(field => field.type.includes('string') || field.isEnum).map(f => f.name)

    const indexSettings = crudInfo.routeSettings?.index || {}
    const globalSettings = crudInfo

    const allowedFilters = indexSettings.hasOwnProperty('allowedFilters')
      ? indexSettings.allowedFilters
      : (globalSettings.allowedFilters || [])

    return allowedFilters
  }

  const createAllowedFields = getAllowedFields('create')
  const updateAllowedFields = getAllowedFields('update')
  const filterAllowedFields = getAllowedFilters()

  const typeContent = `/**
 * ${entity} 관련 타입 정의
 */

${importStatements}${enumTypes ? enumTypes + '\n\n' : ''}// ${entity} 기본 인터페이스
export interface ${entity} {
  id: string
${fields.map(field => {
    let fieldType = field.type
    // Enum 타입인 경우 enum 타입명으로 변경
    if (field.isEnum && field.enumValues) {
      const enumName = `${entity}${toPascalCase(field.name)}`
      fieldType = field.isNullable ? `${enumName} | null` : enumName
    }
    const optional = field.isNullable ? '?' : ''
    return `  ${field.name}${optional}: ${fieldType}`
  }).join('\n')}${relations.length > 0 ? '\n' + relations.map(relation => {
    const relationType = getRelationType(relation)
    return `  ${relation.name}?: ${relationType}`
  }).join('\n') : ''}
  createdAt: string
  updatedAt: string
}

// ${entity} 생성 요청 타입
export interface Create${entity}Request {${createAllowedFields.length > 0 ? '\n' + fields
      .filter(field => createAllowedFields.includes(field.name))
      .map(field => {
        let fieldType = field.type
        if (field.isEnum && field.enumValues) {
          const enumName = `${entity}${toPascalCase(field.name)}`
          fieldType = field.isNullable ? `${enumName} | null` : enumName
        }
        const optional = field.isNullable || ['password'].includes(field.name) ? '?' : ''
        return `  ${field.name}${optional}: ${fieldType}`
      }).join('\n') : '\n  // 백엔드에서 허용된 생성 파라미터가 없습니다'}
}

// ${entity} 수정 요청 타입
export interface Update${entity}Request {${updateAllowedFields.length > 0 ? '\n' + fields
      .filter(field => updateAllowedFields.includes(field.name))
      .map(field => {
        let fieldType = field.type
        if (field.isEnum && field.enumValues) {
          const enumName = `${entity}${toPascalCase(field.name)}`
          fieldType = field.isNullable ? `${enumName} | null` : enumName
        }
        return `  ${field.name}?: ${fieldType}`
      }).join('\n') : '\n  // 백엔드에서 허용된 수정 파라미터가 없습니다'}
}

// ${entity} 필터 타입
export interface ${entity}Filter {${filterAllowedFields.length > 0 ? '\n' + fields
      .filter(field => filterAllowedFields.includes(field.name))
      .map(field => {
        if (field.isEnum && field.enumValues) {
          const enumName = `${entity}${toPascalCase(field.name)}`
          return `  ${field.name}?: ${enumName}`
        }
        return `  ${field.name}?: string`
      }).join('\n') : '\n  // 백엔드에서 허용된 필터가 없습니다'}
}
`

  const filePath = `types/${entityLower}/crud-${entityLower}.ts`
  await fs.promises.writeFile(filePath, typeContent)
  console.log(`✅ CRUD 타입 정의 생성: ${filePath}`)
}

async function generateExtendableTypes(entity, entityLower, entityKebab) {
  const filePath = `types/${entityLower}/${entityLower}.ts`

  // 파일이 이미 존재하면 스킵
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  타입 확장 파일 존재함 (스킵): ${filePath}`)
    return
  }

  const typeContent = `/**
 * ${entity} 타입 확장
 * 
 * 이 파일은 자동 덮어쓰기되지 않습니다. 커스텀 타입을 여기에 추가하세요.
 */

import type {
  ${entity} as Crud${entity},
  Create${entity}Request as CrudCreate${entity}Request,
  Update${entity}Request as CrudUpdate${entity}Request,
  ${entity}Filter as Crud${entity}Filter
} from './crud-${entityLower}'

// 기본 타입 재사용 (필요시 확장 가능)
export interface ${entity} extends Crud${entity} {
  // 여기에 추가 필드를 정의하세요
  // customField?: string
}

// 생성 요청 타입 확장
export interface Create${entity}Request extends CrudCreate${entity}Request {
  // 여기에 추가 필드를 정의하세요
}

// 수정 요청 타입 확장  
export interface Update${entity}Request extends CrudUpdate${entity}Request {
  // 여기에 추가 필드를 정의하세요
}

// 필터 타입 확장
export interface ${entity}Filter extends Crud${entity}Filter {
  // 여기에 추가 필터를 정의하세요
  // customFilter?: string
}
`

  await fs.promises.writeFile(filePath, typeContent)
  console.log(`✅ 확장 가능한 타입 정의 생성: ${filePath}`)
}

async function generateCrudApiHook(entity, entityLower, entityKebab, entityPlural, entityPluralKebab, crudInfo) {
  // CRUD 컨트롤러가 설정되지 않은 경우 처리
  if (!crudInfo || !crudInfo.isConfigured) {
    console.log(`⚠️  ${entity} 엔티티는 CRUD 컨트롤러가 설정되지 않았습니다.`)
    console.log(`💡 백엔드에서 ${entity} CRUD 컨트롤러를 설정한 후 다시 시도하세요.`)

    // 기본 클래스만 생성 (메서드 없음)
    const hookContent = `import { useQueryClient } from '@tanstack/react-query'

/**
 * ${entity} CRUD API 훅 클래스 (자동 생성)
 * 
 * ⚠️  이 파일은 덮어쓰기 됩니다. 직접 수정하지 마세요.
 * 커스텀 기능은 use-${entityKebab}-api.ts 파일에 추가하세요.
 * 
 * ❌ 백엔드에 CRUD 컨트롤러가 설정되지 않았습니다.
 * 💡 백엔드 설정 후 다시 생성하세요.
 */
export class Crud${entity}Api {
  protected readonly baseUrl = '${entityPluralKebab}'

  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

  // 🚫 CRUD 컨트롤러가 설정되지 않아 메서드를 사용할 수 없습니다.
  // 백엔드에서 ${entity} CRUD 컨트롤러를 설정한 후 다시 생성하세요.
}

/**
 * ${entity} CRUD API 훅 (자동 생성)
 */
export function useCrud${entity}Api() {
  const queryClient = useQueryClient()
  
  return new Crud${entity}Api(queryClient)
}
`

    const filePath = `hooks/${entityLower}/use-crud-${entityKebab}-api.ts`
    await fs.promises.writeFile(filePath, hookContent)
    console.log(`✅ CRUD API 훅 생성 (컨트롤러 미설정): ${filePath}`)
    return
  }

  // CRUD 정보가 있으면 허용된 메서드만 생성
  const allowedMethods = crudInfo.allowedMethods || []
  console.log(`📋 허용된 메서드: ${allowedMethods.join(', ') || '없음'}`)

  // 메서드별 세부 설정 추출 함수
  function getMethodConfig(method) {
    const routeSettings = crudInfo.routeSettings?.[method] || {}
    const globalSettings = crudInfo

    return {
      allowedFilters: routeSettings.hasOwnProperty('allowedFilters') ? routeSettings.allowedFilters : (globalSettings.allowedFilters || []),
      allowedParams: routeSettings.hasOwnProperty('allowedParams') ? routeSettings.allowedParams : (globalSettings.allowedParams || []),
      allowedIncludes: routeSettings.hasOwnProperty('allowedIncludes') ? routeSettings.allowedIncludes : (globalSettings.allowedIncludes || [])
    }
  }

  // 메서드별 생성 여부 및 설정 결정
  const methods = {
    index: {
      enabled: allowedMethods.includes('index'),
      config: getMethodConfig('index')
    },
    show: {
      enabled: allowedMethods.includes('show'),
      config: getMethodConfig('show')
    },
    create: {
      enabled: allowedMethods.includes('create'),
      config: getMethodConfig('create')
    },
    update: {
      enabled: allowedMethods.includes('update'),
      config: getMethodConfig('update')
    },
    destroy: {
      enabled: allowedMethods.includes('destroy'),
      config: getMethodConfig('destroy')
    }
  }

  // 메서드별 설정 출력
  Object.entries(methods).forEach(([method, { enabled, config }]) => {
    if (enabled) {
      console.log(`   ${method}:`)
      if (config.allowedFilters.length > 0) {
        console.log(`     filters: ${config.allowedFilters.join(', ')}`)
      }
      if (config.allowedParams.length > 0) {
        console.log(`     params: ${config.allowedParams.join(', ')}`)
      }
      if (config.allowedIncludes.length > 0) {
        console.log(`     includes: ${config.allowedIncludes.join(', ')}`)
      }
    }
  })

  // 각 메서드를 별도로 생성
  const methodsArray = []

  if (methods.index.enabled) {
    const indexConfig = methods.index.config
    const filterInfo = indexConfig.allowedFilters.length > 0
      ? `\n   * @filters 허용된 필터: ${indexConfig.allowedFilters.join(', ')}`
      : ''
    const includeInfo = indexConfig.allowedIncludes.length > 0
      ? `\n   * @includes 허용된 관계: ${indexConfig.allowedIncludes.join(', ')}`
      : ''

    methodsArray.push(`  /**
   * ${entity} 목록 조회${filterInfo}${includeInfo}
   */
  index = (query?: CrudQuery, options?: UseQueryOptions<PaginatedResponse<${entity}>>) => {
    return useQuery({
      queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.list(query as Record<string, unknown>),
      queryFn: () => {
        const queryString = query ? \`?\${apiUtils.buildCrudQuery(query as Record<string, unknown>)}\` : ''
        return apiUtils.get<PaginatedResponse<${entity}>>(\`\${this.baseUrl}\${queryString}\`)
      },
      ...options,
    })
  }`)
  }

  if (methods.show.enabled) {
    const showConfig = methods.show.config
    const includeInfo = showConfig.allowedIncludes.length > 0
      ? `\n   * @includes 허용된 관계: ${showConfig.allowedIncludes.join(', ')}`
      : ''

    methodsArray.push(`  /**
   * ${entity} 단일 조회${includeInfo}
   */
  show = (id: string, options?: UseQueryOptions<${entity}>) => {
    return useQuery({
      queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.detail(id),
      queryFn: () => apiUtils.get<${entity}>(\`\${this.baseUrl}/\${id}\`),
      enabled: !!id,
      ...options,
    })
  }`)
  }

  if (methods.create.enabled) {
    const createConfig = methods.create.config
    const paramInfo = createConfig.allowedParams.length > 0
      ? `\n   * @params 허용된 파라미터: ${createConfig.allowedParams.join(', ')}`
      : ''

    const invalidations = []
    if (methods.index.enabled) invalidations.push(`this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })`)

    methodsArray.push(`  /**
   * ${entity} 생성${paramInfo}
   */
  create = (options?: MutationOptions<${entity}, Create${entity}Request>) => {
    return useMutation({
      mutationFn: (data: Create${entity}Request) =>
        apiUtils.post<${entity}>(this.baseUrl, data),
      onSuccess: (data, variables) => {
        ${invalidations.join('\n        ')}${invalidations.length > 0 ? '\n        ' : ''}toast.success('${entity}가 생성되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 생성에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }`)
  }

  if (methods.update.enabled) {
    const updateConfig = methods.update.config
    const paramInfo = updateConfig.allowedParams.length > 0
      ? `\n   * @params 허용된 파라미터: ${updateConfig.allowedParams.join(', ')}`
      : ''

    const invalidations = []
    if (methods.index.enabled) invalidations.push(`this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })`)
    if (methods.show.enabled) invalidations.push(`this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.detail(id) })`)

    methodsArray.push(`  /**
   * ${entity} 수정${paramInfo}
   */
  update = (id: string, options?: MutationOptions<${entity}, Update${entity}Request>) => {
    return useMutation({
      mutationFn: (data: Update${entity}Request) =>
        apiUtils.put<${entity}>(\`\${this.baseUrl}/\${id}\`, data),
      onSuccess: (data, variables) => {
        ${invalidations.join('\n        ')}${invalidations.length > 0 ? '\n        ' : ''}toast.success('${entity}가 수정되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 수정에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }`)
  }

  if (methods.destroy.enabled) {
    const invalidations = []
    if (methods.index.enabled) invalidations.push(`this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.lists() })`)
    if (methods.show.enabled) invalidations.push(`this.queryClient.removeQueries({ queryKey: QUERY_KEYS.${entityLower.toUpperCase()}.detail(id) })`)

    methodsArray.push(`  /**
   * ${entity} 삭제
   */
  destroy = (id: string, options?: MutationOptions<void, string>) => {
    return useMutation({
      mutationFn: () => apiUtils.delete<void>(\`\${this.baseUrl}/\${id}\`),
      onSuccess: (data, variables) => {
        ${invalidations.join('\n        ')}${invalidations.length > 0 ? '\n        ' : ''}toast.success('${entity}가 삭제되었습니다.')
        options?.onSuccess?.(data, variables)
      },
      onError: (error, variables) => {
        toast.error('${entity} 삭제에 실패했습니다.')
        options?.onError?.(error, variables)
      },
      ...options,
    })
  }`)
  }

  // 메서드가 하나도 없는 경우 경고 추가
  if (methodsArray.length === 0) {
    methodsArray.push(`  // 🚫 허용된 CRUD 메서드가 없습니다.
  // 백엔드에서 ${entity} 엔티티의 allowedMethods를 설정해주세요.`)
  }

  const hookContent = `import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { apiUtils } from '@/lib/api'
import { QUERY_KEYS } from '@/lib/constants'
import type { ${entity}, Create${entity}Request, Update${entity}Request } from '@/types/${entityLower}/crud-${entityLower}'
import type { PaginatedResponse } from '@/types/api'
import type { CrudQuery } from '@/types/crud'
import type { QueryError, MutationOptions } from '@/types/query'

/**
 * ${entity} CRUD API 훅 클래스 (자동 생성)
 * 
 * ⚠️  이 파일은 덮어쓰기 됩니다. 직접 수정하지 마세요.
 * 커스텀 기능은 use-${entityKebab}-api.ts 파일에 추가하세요.
 * 
 * 백엔드에서 허용된 메서드: ${allowedMethods.join(', ')}
 */
export class Crud${entity}Api {
  protected readonly baseUrl = '${entityPluralKebab}'

  constructor(
    private queryClient: ReturnType<typeof useQueryClient>
  ) {}

${methodsArray.join('\n\n')}
}

/**
 * ${entity} CRUD API 훅 (자동 생성)
 */
export function useCrud${entity}Api() {
  const queryClient = useQueryClient()
  
  return new Crud${entity}Api(queryClient)
}
`

  const filePath = `hooks/${entityLower}/use-crud-${entityKebab}-api.ts`
  await fs.promises.writeFile(filePath, hookContent)
  console.log(`✅ CRUD API 훅 생성: ${filePath}`)
}

async function generateExtendableApiHook(entity, entityLower, entityKebab) {
  const filePath = `hooks/${entityLower}/use-${entityKebab}-api.ts`

  // 파일이 이미 존재하면 스킵
  if (fs.existsSync(filePath)) {
    console.log(`⏭️  API 훅 확장 파일 존재함 (스킵): ${filePath}`)
    return
  }

  const hookContent = `import { useQueryClient } from '@tanstack/react-query'

import { useCrud${entity}Api, Crud${entity}Api } from './use-crud-${entityKebab}-api'

/**
 * ${entity} API 훅 (확장 가능)
 * 
 * 이 파일은 자동 덮어쓰기되지 않습니다. 커스텀 메서드를 여기에 추가하세요.
 */
export class ${entity}Api extends Crud${entity}Api {
  // 여기에 커스텀 메서드들을 추가하세요...
}

/**
 * ${entity} API 훅
 * 
 * CRUD 기능 + 커스텀 확장 기능 포함
 */
export function use${entity}Api() {
  const queryClient = useQueryClient()
  
  return new ${entity}Api(queryClient)
}

// 편의를 위한 개별 export
export { useCrud${entity}Api }
`

  await fs.promises.writeFile(filePath, hookContent)
  console.log(`✅ 확장 가능한 API 훅 생성: ${filePath}`)
}

async function updateConstants(entity, entityLower, entityPlural, entityPluralKebab) {
  const constantsPath = 'lib/constants.ts'

  try {
    let content = await fs.promises.readFile(constantsPath, 'utf8')

    // API_ENDPOINTS는 더 이상 사용하지 않으므로 업데이트하지 않습니다.

    // QUERY_KEYS 업데이트 - 중첩 객체를 올바르게 처리
    const queryKeysStart = content.indexOf('export const QUERY_KEYS = {')
    if (queryKeysStart !== -1) {
      // 중괄호 매칭으로 전체 QUERY_KEYS 객체 찾기
      let braceCount = 0
      let start = content.indexOf('{', queryKeysStart)
      let end = start

      for (let i = start; i < content.length; i++) {
        if (content[i] === '{') braceCount++
        if (content[i] === '}') braceCount--
        if (braceCount === 0) {
          end = i
          break
        }
      }

      const queryKeysContent = content.substring(start + 1, end)

      if (!queryKeysContent.includes(`${entityLower.toUpperCase()}:`)) {
        const newQueryKey = `  ${entityLower.toUpperCase()}: {
    all: ['${entityLower}'] as const,
    lists: () => ['${entityLower}', 'list'] as const,
    list: (filters?: Record<string, unknown>) => ['${entityLower}', 'list', filters] as const,
    details: () => ['${entityLower}', 'detail'] as const,
    detail: (id: string) => ['${entityLower}', 'detail', id] as const,
  },`

        // 마지막 항목 뒤에 콤마가 있는지 확인하고 추가
        const trimmedContent = queryKeysContent.trim()
        const needsComma = !trimmedContent.endsWith(',') && trimmedContent.length > 0
        const updatedQueryKeys = trimmedContent + (needsComma ? ',' : '') + '\n' + newQueryKey

        content = content.substring(0, start + 1) + '\n' + updatedQueryKeys + '\n' + content.substring(end)
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