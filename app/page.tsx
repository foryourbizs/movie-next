"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        {/* 메인 헤더 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            새로운 프로젝트 시작 🚀
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Next.js 15 + TypeScript 기반의 현대적인 웹 애플리케이션을
            시작하세요. 모든 필수 기능이 준비되어 있습니다.
          </p>
        </div>

        {/* 기능 카드들 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔧</span>
                <span>자동 CRUD 생성</span>
              </CardTitle>
              <CardDescription>
                백엔드 스키마 기반으로 완전한 CRUD 시스템을 자동 생성합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  npm run generate-crud
                </code>{" "}
                명령으로 30초 만에 완성!
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🎨</span>
                <span>shadcn/ui 디자인</span>
              </CardTitle>
              <CardDescription>
                모던하고 아름다운 UI 컴포넌트가 이미 설치되어 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                TailwindCSS + shadcn/ui로 빠른 개발이 가능합니다.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>⚡</span>
                <span>최적화된 성능</span>
              </CardTitle>
              <CardDescription>
                TanStack Query, Zustand, ky 등 최신 라이브러리로 구축되었습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                캐싱, 상태 관리, API 통신이 모두 최적화되어 있습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🔐</span>
                <span>인증 시스템</span>
              </CardTitle>
              <CardDescription>
                JWT 토큰 기반 인증과 권한 관리 시스템이 준비되어 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm" className="w-full">
                    로그인
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="outline" size="sm" className="w-full">
                    회원가입
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>📱</span>
                <span>반응형 디자인</span>
              </CardTitle>
              <CardDescription>
                모바일부터 데스크톱까지 모든 기기에서 완벽하게 작동합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Mobile First 접근 방식으로 설계되었습니다.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>🛠️</span>
                <span>개발자 도구</span>
              </CardTitle>
              <CardDescription>
                TypeScript, ESLint, Prettier가 모두 설정되어 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                코드 품질과 일관성을 보장하는 도구들이 준비되어 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 시작하기 버튼 */}
        <div className="text-center">
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              지금 바로 개발을 시작하세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                프로젝트 시작하기
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                문서 보기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
