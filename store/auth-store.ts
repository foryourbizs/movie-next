import React from 'react'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { tokenManager } from '@/lib/api'
import type { AuthStore, AuthResponse, User } from '@/types/api'

/**
 * 인증 상태 관리 스토어
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // 상태 초기값
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      // 로그인 액션
      login: (response: AuthResponse) => {
        console.log('🔐 Zustand login action called with response:', {
          hasAccessToken: !!response.accessToken,
          hasRefreshToken: !!response.refreshToken,
          hasUser: !!response.user
        })

        const { accessToken, refreshToken, user } = response

        // 토큰 매니저에 토큰 설정
        tokenManager.setTokens(accessToken, refreshToken)

        // 스토어 상태 업데이트
        set({
          user: user || null,
          accessToken,
          refreshToken,
          isAuthenticated: true,
        })

        console.log('✅ Zustand store updated with authentication data')
      },

      // 로그아웃 액션
      logout: () => {
        // 토큰 매니저에서 토큰 제거
        tokenManager.clearTokens()

        // 스토어 상태 초기화
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      // 사용자 정보 업데이트 액션
      updateUser: (updatedUser: Partial<User>) => {
        const currentUser = get().user
        if (!currentUser) return

        set({
          user: {
            ...currentUser,
            ...updatedUser,
          },
        })
      },

      // 토큰 설정 액션
      setTokens: (accessToken: string, refreshToken?: string) => {
        // 토큰 매니저에 토큰 설정
        tokenManager.setTokens(accessToken, refreshToken)

        // 스토어 상태 업데이트
        set((state) => ({
          accessToken,
          refreshToken: refreshToken || state.refreshToken,
          isAuthenticated: true,
        }))
      },
    }),
    {
      name: 'auth-storage', // localStorage 키
      storage: createJSONStorage(() => localStorage),
      // 민감한 토큰 정보는 저장하지 않고 tokenManager에서 관리
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // 스토어 복원 시 토큰 복원
      onRehydrateStorage: () => (state) => {
        if (state) {
          const accessToken = tokenManager.getAccessToken()
          const refreshToken = tokenManager.getRefreshToken()

          if (accessToken && refreshToken) {
            state.accessToken = accessToken
            state.refreshToken = refreshToken
            state.isAuthenticated = true
          } else {
            state.isAuthenticated = false
            state.user = null
          }
        }
      },
    }
  )
)

/**
 * Hydration 상태 관리
 */
const useHydration = () => {
  const [hydrated, setHydrated] = React.useState(false)

  React.useEffect(() => {
    setHydrated(true)
  }, [])

  return hydrated
}

/**
 * 인증 관련 셀렉터들
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const updateUser = useAuthStore((state) => state.updateUser)
  const setTokens = useAuthStore((state) => state.setTokens)
  const hydrated = useHydration()

  return {
    user,
    isAuthenticated: hydrated ? isAuthenticated : false,
    login,
    logout,
    updateUser,
    setTokens,
    hydrated,
    // 편의 메서드들
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    userId: user?.id,
    userEmail: user?.email,
    userName: user?.name,
  }
}

/**
 * 사용자 권한 확인 훅
 */
export const usePermissions = () => {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return {
    // 인증된 사용자인지 확인
    canAccess: isAuthenticated,

    // 관리자 권한 확인
    canManageUsers: user?.role === 'admin',
    canDeleteUsers: user?.role === 'admin',
    canCreateUsers: user?.role === 'admin',

    // 사용자 본인 데이터 접근 권한 확인
    canEditProfile: (targetUserId?: string) => {
      if (!isAuthenticated || !user) return false
      return user.role === 'admin' || user.id === targetUserId
    },

    // 소셜 로그인 사용자인지 확인
    isSocialUser: user?.provider !== 'local',

    // 활성 사용자인지 확인
    isActiveUser: user?.isActive === true,
  }
} 