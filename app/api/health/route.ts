import { NextRequest, NextResponse } from "next/server";

/**
 * 헬스체크 API 엔드포인트
 * Railway.app과 다른 모니터링 서비스에서 사용
 */
export async function GET(request: NextRequest) {
  try {
    // 기본 헬스체크 정보
    const healthData = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
      service: "Next.js TypeScript Template",
      region: process.env.RAILWAY_REGION || "unknown",
      replica: process.env.RAILWAY_REPLICA_ID || "local",
    };

    // 선택적 추가 체크들
    const checks = {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        status: "ok",
      },
      uptime: {
        seconds: process.uptime(),
        status: process.uptime() > 0 ? "ok" : "error",
      },
      timestamp: {
        current: Date.now(),
        iso: new Date().toISOString(),
        status: "ok",
      },
    };

    // 환경변수 체크 (민감한 정보는 존재 여부만 확인)
    const envChecks = {
      hasApiUrl: !!process.env.NEXT_PUBLIC_API_URL,
      hasAppEnv: !!process.env.NEXT_PUBLIC_APP_ENV,
      nodeEnv: process.env.NODE_ENV,
      status: process.env.NEXT_PUBLIC_API_URL ? "ok" : "warning",
    };

    // 전체 상태 결정
    const overallStatus =
      checks.uptime.status === "ok" && envChecks.status !== "error"
        ? "healthy"
        : "unhealthy";

    const response = {
      ...healthData,
      status: overallStatus,
      checks,
      environment: envChecks,
      metadata: {
        requestId: crypto.randomUUID(),
        userAgent: request.headers.get("user-agent"),
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
      },
    };

    // 상태에 따른 HTTP 상태 코드 설정
    const statusCode = overallStatus === "healthy" ? 200 : 503;

    return NextResponse.json(response, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // 헬스체크 자체에서 에러가 발생한 경우
    const errorResponse = {
      status: "error",
      timestamp: new Date().toISOString(),
      error: {
        message: "Health check failed",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Internal server error",
      },
      service: "Next.js TypeScript Template",
    };

    return NextResponse.json(errorResponse, {
      status: 500,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Content-Type": "application/json",
      },
    });
  }
}

/**
 * HEAD 요청도 지원 (일부 헬스체크 도구에서 사용)
 */
export async function HEAD() {
  try {
    // 간단한 헬스체크 (응답 본문 없이)
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
