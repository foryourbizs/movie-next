'use client'

import { useTokenMonitor } from '@/hooks/use-token-monitor'

interface TokenMonitorProviderProps {
  children: React.ReactNode
}

/**
 * 토큰 모니터링 Provider
 * 앱 전체에서 토큰 상태를 자동으로 모니터링합니다.
 */
export function TokenMonitorProvider({ children }: TokenMonitorProviderProps) {
  useTokenMonitor()
  
  return <>{children}</>
} 