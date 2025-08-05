import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

import Header from "@/components/header";
import { QueryProvider } from "@/providers/query-provider";
import { TokenMonitorProvider } from "@/providers/token-monitor-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "제안용 영화 서비스",
  description: "제안용 영화 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin=""
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
          <TokenMonitorProvider>
            <div className="h-full flex flex-col">
              <div className="w-full py-4 text-center text-sm text-white bg-black">
                <p>본 서비스는 제안 목적으로 제작되었습니다.</p>
                <p>
                  검색 페이지 및 상세페이지 디자인 초안만 구현되어 있습니다.
                </p>
              </div>
              <Header />
              <main>{children}</main>
            </div>
          </TokenMonitorProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#363636",
                color: "#fff",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}
