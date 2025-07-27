#!/usr/bin/env node

/**
 * 환경변수 검증 스크립트 (JavaScript 버전)
 * 
 * 사용법:
 * npm run validate-env
 * 또는
 * node scripts/validate-env.js
 */

// Node.js 직접 실행 시 NODE_ENV 기본값 설정
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

// .env 파일 직접 로드 (Next.js 없이 실행될 때)
function loadEnvFile() {
  const fs = require('fs')
  const path = require('path')

  const envFiles = ['.env.local', '.env.development', '.env']

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)

    try {
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8')

        envContent.split('\n').forEach(line => {
          const trimmedLine = line.trim()
          if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=')
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=')
              // 기존 환경변수가 없는 경우에만 설정
              if (!process.env[key]) {
                process.env[key] = value
              }
            }
          }
        })

        console.log(`📄 환경변수 파일 로드됨: ${envFile}`)
      }
    } catch (error) {
      // 파일 로드 실패는 무시
    }
  }
}

// 환경변수 파일 로드
loadEnvFile()

// 환경변수 스키마 정의
const SERVER_ENV_SCHEMA = {
  NODE_ENV: {
    required: false, // 직접 실행 시에는 기본값으로 처리
    choices: ['development', 'production', 'test'],
    default: 'development',
    description: 'Application environment',
  },
  NEXT_PUBLIC_API_URL: {
    required: false, // 기본값이 있으므로 필수가 아님
    type: 'url',
    default: 'http://localhost:4000',
    description: 'Backend API base URL',
  },
  NEXT_PUBLIC_APP_ENV: {
    choices: ['development', 'staging', 'production'],
    default: 'development',
    description: 'Public app environment identifier',
  },
  DATABASE_URL: {
    required: false,
    type: 'url',
    description: 'Database connection URL (if needed)',
  },
  NEXTAUTH_SECRET: {
    required: false,
    pattern: /^.{32,}$/,
    description: 'NextAuth secret (32+ characters)',
  },
  NEXTAUTH_URL: {
    required: false,
    type: 'url',
    description: 'NextAuth base URL',
  },
}

/**
 * 값 타입 변환
 */
function parseValue(value, type = 'string') {
  switch (type) {
    case 'string':
    case 'url':
      return value

    case 'number':
      const num = Number(value)
      return isNaN(num) ? undefined : num

    case 'boolean':
      const lowerValue = value.toLowerCase()
      if (['true', '1', 'yes', 'on'].includes(lowerValue)) return true
      if (['false', '0', 'no', 'off'].includes(lowerValue)) return false
      return undefined

    default:
      return value
  }
}

/**
 * 단일 환경변수 검증
 */
function validateSingleVariable(key, rawValue, config) {
  // 필수 값 검증
  if (config.required && (rawValue === undefined || rawValue === '')) {
    return {
      error: {
        key,
        message: `Required environment variable '${key}' is missing`,
        severity: 'error',
      },
    }
  }

  // 값이 없는 경우 기본값 사용
  if (rawValue === undefined || rawValue === '') {
    if (config.default !== undefined) {
      return {
        value: parseValue(config.default, config.type || 'string'),
        warning: {
          key,
          message: `Using default value for '${key}': ${config.default}`,
          severity: 'warning',
        },
      }
    }
    return {}
  }

  // 타입 변환 및 검증
  const parsedValue = parseValue(rawValue, config.type || 'string')
  if (parsedValue === undefined) {
    return {
      error: {
        key,
        message: `Invalid type for '${key}'. Expected ${config.type || 'string'}, got: ${rawValue}`,
        severity: 'error',
      },
    }
  }

  // 패턴 검증
  if (config.pattern && typeof parsedValue === 'string') {
    if (!config.pattern.test(parsedValue)) {
      return {
        error: {
          key,
          message: `Value for '${key}' does not match required pattern: ${config.pattern.source}`,
          severity: 'error',
        },
      }
    }
  }

  // 선택지 검증
  if (config.choices && config.choices.length > 0) {
    if (!config.choices.includes(String(parsedValue))) {
      return {
        error: {
          key,
          message: `Invalid value for '${key}'. Must be one of: ${config.choices.join(', ')}. Got: ${parsedValue}`,
          severity: 'error',
        },
      }
    }
  }

  // URL 타입 특별 검증
  if (config.type === 'url') {
    try {
      new URL(String(parsedValue))
    } catch {
      return {
        error: {
          key,
          message: `Invalid URL format for '${key}': ${parsedValue}`,
          severity: 'error',
        },
      }
    }
  }

  return { value: parsedValue }
}

/**
 * 모든 환경변수 검증
 */
function validateEnvironment(schema) {
  const errors = []
  const warnings = []
  const values = {}

  for (const [key, config] of Object.entries(schema)) {
    const rawValue = process.env[key]

    try {
      const result = validateSingleVariable(key, rawValue, config)

      if (result.error) {
        errors.push(result.error)
      }

      if (result.warning) {
        warnings.push(result.warning)
      }

      if (result.value !== undefined) {
        values[key] = result.value
      }
    } catch (error) {
      errors.push({
        key,
        message: `Unexpected validation error: ${error.message}`,
        severity: 'error',
      })
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    values,
  }
}

/**
 * 검증 결과 출력
 */
function printValidationResult(result) {
  if (result.isValid) {
    console.log('✅ Environment validation passed')
  } else {
    console.error('❌ Environment validation failed')
  }

  if (result.errors.length > 0) {
    console.error('\n🚨 Errors:')
    result.errors.forEach(error => {
      console.error(`  - ${error.key}: ${error.message}`)
    })
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  Warnings:')
    result.warnings.forEach(warning => {
      console.warn(`  - ${warning.key}: ${warning.message}`)
    })
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('\n📋 Resolved values:')
    Object.entries(result.values).forEach(([key, value]) => {
      const displayValue = typeof value === 'string' && value.length > 50
        ? value.substring(0, 50) + '...'
        : value
      console.log(`  - ${key}: ${displayValue}`)
    })
  }
}

// 메인 실행 로직
console.log('🔍 환경변수 검증을 시작합니다...\n')

try {
  // 환경변수 검증 실행
  const result = validateEnvironment(SERVER_ENV_SCHEMA)

  // 결과 출력
  printValidationResult(result)

  if (!result.isValid) {
    console.error('\n💥 애플리케이션을 시작할 수 없습니다.')
    console.error('💡 .env.local 파일을 확인하고 필요한 환경변수를 설정해주세요.')
    console.error('\n필수 환경변수:')
    console.error('  - NEXT_PUBLIC_API_URL (예: http://localhost:4000)')
    console.error('\n선택 환경변수:')
    console.error('  - NEXT_PUBLIC_APP_ENV (development|staging|production)')
    console.error('  - DATABASE_URL')
    console.error('  - NEXTAUTH_SECRET')
    console.error('  - NEXTAUTH_URL')

    process.exit(1)
  }

  if (result.warnings.length > 0) {
    console.warn('\n⚠️  애플리케이션이 경고와 함께 시작됩니다.')
  }

  console.log('\n✅ 환경변수 검증이 완료되었습니다!')
  console.log('🚀 애플리케이션을 안전하게 시작할 수 있습니다.')

} catch (error) {
  console.error('\n❌ 예상치 못한 오류가 발생했습니다:', error.message)
  process.exit(1)
} 