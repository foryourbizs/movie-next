"use client";

import { ChevronLeft, Menu, PlayCircle, Search, Star, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Input } from "./ui/input";

export default function Header() {
  const [activeScreen, setActiveScreen] = useState<"menu" | "search" | null>(
    null
  );

  return (
    <>
      <div className="h-16 flex items-center px-4 border-b border-gray-300 md:justify-between w-full md:px-12">
        <div className="flex-1 md:hidden"></div>
        <div className="flex-1 md:flex md:gap-10">
          <div className="text-center text-lg font-bold md:text-xl">
            <Link href="/">서비스명</Link>
          </div>
          <div className="hidden md:flex items-center justify-center gap-4 font-medium text-sm">
            <p className="text-primary">영화</p>
            <p>큐레이션</p>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center gap-8 font-medium text-sm">
          <div className="flex items-center gap-2">
            <Input
              className="min-w-80 h-12 text-sm"
              placeholder="제목, 감독이름으로 검색"
            />
          </div>
          <div className="flex items-center gap-2">
            <p>로그인/가입</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-end gap-4 md:hidden">
          <Search
            className="w-5.5 h-5.5 cursor-pointer"
            onClick={() => setActiveScreen("search")}
          />
          <Menu
            className="w-5.5 h-5.5 cursor-pointer"
            onClick={() => setActiveScreen("menu")}
          />
        </div>
      </div>
      {activeScreen === "menu" && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-end">
          <div className="w-72 h-full bg-white">
            <div className="p-4">
              <div className="flex items-center justify-end">
                <X
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setActiveScreen(null)}
                />
              </div>
              <div className="flex flex-col mt-4 gap-1">
                <p className="text-xl font-bold text-primary">서비스명</p>
                <p className="text-md">
                  서비스명에 오신것을 <br />
                  환영합니다.
                </p>
              </div>
              <button className="w-full h-12 bg-primary text-white font-bold rounded-sm mt-6 hover:bg-primary/80 transition-colors">
                로그인·가입
              </button>
            </div>
            <div className="py-2 px-4 flex flex-col">
              <div className="flex items-center h-11 gap-2">
                <PlayCircle className="w-5 h-5" />
                <p className="text-md">영화</p>
              </div>
              <div className="flex items-center h-11 gap-2">
                <Star className="w-5 h-5" />
                <p className="text-md">큐레이션</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeScreen === "search" && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex flex-col bg-white">
          <div className="py-3 px-4 flex items-center gap-4 border-b border-gray-300">
            <ChevronLeft
              className="w-8 h-8 cursor-pointer"
              onClick={() => setActiveScreen(null)}
            />
            <Input
              className="w-full h-12 text-sm"
              placeholder="제목, 감독이름으로 검색"
            />
            <Search className="w-8 h-8" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col px-4">
              <div className="flex items-center gap-2 py-4">
                <p className="text-lg text-primary font-bold">검색 기록</p>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-md text-gray-500">신세계</p>
                <p className="text-md text-gray-500">아이언맨 2</p>
                <p className="text-md text-gray-500">괴물</p>
                <p className="text-md text-gray-500">블랙 호크 다운</p>
                <p className="text-md text-gray-500">엣지 투모로우</p>
                <p className="text-md text-gray-500">영화 제목 1</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
