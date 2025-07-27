import { useQueryClient } from '@tanstack/react-query'

import { useCrudPostApi, CrudPostApi } from './use-crud-post-api'

/**
 * Post API 훅 (확장 가능)
 * 
 * 이 파일은 자동 덮어쓰기되지 않습니다. 커스텀 메서드를 여기에 추가하세요.
 */
export class PostApi extends CrudPostApi {
  // 여기에 커스텀 메서드들을 추가하세요...
}

/**
 * Post API 훅
 * 
 * CRUD 기능 + 커스텀 확장 기능 포함
 */
export function usePostApi() {
  const queryClient = useQueryClient()
  
  return new PostApi(queryClient)
}

// 편의를 위한 개별 export
export { useCrudPostApi }
