import { useState, useMemo, useCallback } from 'react'
import { createQuery, QueryBuilder } from '@/lib/query-builder'
import type { CrudQuery } from '@/types/api'

interface UseQueryStateOptions {
  defaultPage?: number
  defaultLimit?: number
  defaultSort?: string
  defaultFilters?: Record<string, unknown>
}

interface QueryState {
  page: number
  limit: number
  sort: string
  filters: Record<string, string>
}

export function useQueryState(options: UseQueryStateOptions = {}) {
  const {
    defaultPage = 1,
    defaultLimit = 10,
    defaultSort = '-createdAt',
    defaultFilters = {},
  } = options

  // 상태 관리
  const [state, setState] = useState<QueryState>({
    page: defaultPage,
    limit: defaultLimit,
    sort: defaultSort,
    filters: defaultFilters as Record<string, string>,
  })

  // 페이지 변경
  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }))
  }, [])

  // 다음 페이지
  const nextPage = useCallback(() => {
    setState(prev => ({ ...prev, page: prev.page + 1 }))
  }, [])

  // 이전 페이지
  const prevPage = useCallback(() => {
    setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))
  }, [])

  // 페이지 크기 변경
  const setLimit = useCallback((limit: number) => {
    setState(prev => ({ ...prev, limit, page: 1 })) // 페이지 크기 변경 시 첫 페이지로
  }, [])

  // 정렬 변경
  const setSort = useCallback((sort: string) => {
    setState(prev => ({ ...prev, sort, page: 1 })) // 정렬 변경 시 첫 페이지로
  }, [])

  // 필터 설정
  const setFilter = useCallback((key: string, value: string) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1, // 필터 변경 시 첫 페이지로
    }))
  }, [])

  // 여러 필터 한번에 설정
  const setFilters = useCallback((filters: Record<string, string>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...filters },
      page: 1,
    }))
  }, [])

  // 필터 제거
  const removeFilter = useCallback((key: string) => {
    setState(prev => {
      const newFilters = { ...prev.filters }
      delete newFilters[key]
      return { ...prev, filters: newFilters, page: 1 }
    })
  }, [])

  // 모든 필터 초기화
  const clearFilters = useCallback(() => {
    setState(prev => ({ ...prev, filters: {}, page: 1 }))
  }, [])

  // 전체 상태 초기화
  const reset = useCallback(() => {
    setState({
      page: defaultPage,
      limit: defaultLimit,
      sort: defaultSort,
      filters: defaultFilters as Record<string, string>,
    })
  }, [defaultPage, defaultLimit, defaultSort, defaultFilters])

  // Query Builder 생성
  const queryBuilder = useMemo(() => {
    const builder = createQuery()
      .paginate(state.page, state.limit)
      .sortBy(state.sort)

    // 필터 적용
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        if (key.includes('_')) {
          // 이미 연산자가 포함된 필터 (예: email_like)
          builder.filter({ [key]: value })
        } else {
          // 기본 LIKE 검색
          builder.filterLike(key, value)
        }
      }
    })

    return builder
  }, [state])

  // 최종 쿼리
  const query = useMemo(() => queryBuilder.build(), [queryBuilder])

  return {
    // 상태
    state,
    query,
    queryBuilder,

    // 페이지네이션
    page: state.page,
    limit: state.limit,
    setPage,
    nextPage,
    prevPage,
    setLimit,

    // 정렬
    sort: state.sort,
    setSort,

    // 필터링
    filters: state.filters,
    setFilter,
    setFilters,
    removeFilter,
    clearFilters,

    // 유틸리티
    reset,

    // 편의 메서드들
    searchBy: (field: string, value: string) => setFilter(`${field}_like`, value ? `%${value}%` : ''),
    filterBy: (field: string, value: string) => setFilter(`${field}_eq`, value),
    sortAsc: (field: string) => setSort(field),
    sortDesc: (field: string) => setSort(`-${field}`),
  }
}

// 미리 정의된 쿼리 패턴들을 위한 훅
export function useCommonQueries() {
  return {
    // 기본 목록 (최신순)
    basicList: (page: number = 1, limit: number = 10) =>
      createQuery().paginate(page, limit).sortDesc('createdAt').build(),

    // 검색
    search: (searchTerm: string, field: string = 'name', page: number = 1, limit: number = 10) =>
      createQuery()
        .paginate(page, limit)
        .filterLike(field, searchTerm)
        .sortDesc('createdAt')
        .build(),

    // 활성 항목만
    activeOnly: (page: number = 1, limit: number = 10) =>
      createQuery()
        .paginate(page, limit)
        .filterActive()
        .sortDesc('createdAt')
        .build(),

    // 최근 7일
    recent: (days: number = 7, page: number = 1, limit: number = 10) =>
      createQuery()
        .paginate(page, limit)
        .filterRecent(days)
        .sortDesc('createdAt')
        .build(),

    // 이번 달
    thisMonth: (page: number = 1, limit: number = 10) =>
      createQuery()
        .paginate(page, limit)
        .filterThisMonth()
        .sortDesc('createdAt')
        .build(),
  }
} 