"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronRight, ListFilter, RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <div className="h-full flex flex-col md:px-12">
        <div className="my-4 px-6 md:px-0 md:mb-6">
          <p className="text-3xl font-semibold">영화</p>
        </div>
        <div className="md:flex md:gap-x-7">
          <div className="hidden md:flex md:flex-col w-72 bg-white">
            <div className="flex justify-between items-center font-medium text-lg mb-6">
              <span>필터</span>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                <p className="font-medium text-sm">전체 초기화</p>
              </div>
            </div>
            <div className="w-full h-0.5 bg-gray-300 mb-6"></div>
            <div className="pr-2">
              <div className="flex flex-col">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-medium">장르</p>
                    <div className="flex items-center gap-0.5 text-gray-500">
                      <p className="text-sm">더보기</p>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">다큐멘터리</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">코미디</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">드라마</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">액션</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">로맨스</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">스릴러</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">호러</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">SF</p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-0.5 bg-gray-300 my-6"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-medium">국가</p>
                    <div className="flex items-center gap-0.5 text-gray-500">
                      <p className="text-sm">더보기</p>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">한국</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">미국</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">일본</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">영국</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">프랑스</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">독일</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">이탈리아</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">스페인</p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-0.5 bg-gray-300 my-6"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-medium">연도</p>
                    <div className="flex items-center gap-0.5 text-gray-500">
                      <p className="text-sm">더보기</p>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">2024</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">2023</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">2022</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">2021</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">2020</p>
                    </div>
                  </div>
                </div>
                <div className="w-full h-0.5 bg-gray-300 my-6"></div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-medium">평점</p>
                    <div className="flex items-center gap-0.5 text-gray-500">
                      <p className="text-sm">더보기</p>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">9점 이상</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">8점 이상</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">7점 이상</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox className="w-5 h-5" />
                      <p className="text-sm">6점 이상</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-300 md:hidden">
              <p className="text-sm">선택된 필터</p>
              http://localhost:3000/_next/image?url=%2Fph.png&w=256&q=75
              <button
                className="rounded-sm flex items-center gap-1 border border-gray-300 px-2 py-1"
                onClick={() => setIsFilterOpen(true)}
              >
                <ListFilter className="w-4 h-4" />
                <span className="text-sm">필터</span>
              </button>
            </div>
            <div className="h-14 md:h-auto flex items-center justify-between px-6 border-b border-gray-300 md:border-none md:mb-6">
              <p className="text-sm md:text-base">
                총 100개의 작품이 검색되었어요!
              </p>
              <div className="relative">
                <button
                  className="rounded-sm flex items-center gap-1"
                  onClick={() => {
                    setIsOpen(!isOpen);
                  }}
                >
                  <span className="text-sm">기본순</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <div
                  className={`absolute -left-26 top-8 py-2 bg-white border border-gray-300 rounded-sm px-4 shadow-md ${
                    isOpen ? "block" : "hidden"
                  }`}
                >
                  <div className="flex flex-col gap-2 w-32 text-sm">
                    <div
                      className="h-11 flex items-center justify-center"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      기본순
                    </div>
                    <div
                      className="h-11 flex items-center justify-center"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      최신순
                    </div>
                    <div
                      className="h-11 flex items-center justify-center"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      인기순
                    </div>
                    <div
                      className="h-11 flex items-center justify-center"
                      onClick={() => {
                        setIsOpen(false);
                      }}
                    >
                      평점순
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="py-6 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 md:gap-y-10 gap-x-2">
                {Array.from({ length: 30 }).map((_, index) => (
                  <div className="flex flex-col gap-1.5" key={index}>
                    <div className="w-full min-h-28 aspect-video bg-gray-300 rounded-sm overflow-hidden">
                      <Image
                        src="/ph.png"
                        alt="movie"
                        width={100}
                        height={100}
                        className="w-full min-h-28 aspect-video object-cover"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-gray-500 line-clamp-1">
                        미국 · 2016 · 다큐멘터리 · 나탈리 헬트젤, 레인 발데즈
                      </p>
                      <p className="text-md">영화 제목 {index + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFilterOpen && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-end"
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            className="w-72 h-full bg-white overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-14 flex items-center justify-between px-4 border-b border-gray-300">
              <p className="font-medium">필터</p>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-4 h-4" />
                <p className="font-medium text-sm">전체 초기화</p>
              </div>
            </div>
            <Accordion
              type="single"
              collapsible
              className="flex items-center justify-between border-b border-gray-300"
            >
              <AccordionItem value="item-1" className="w-full h-14">
                <AccordionTrigger className="text-md font-medium px-4">
                  장르
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-2">
                  <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                    <p className="text-sm">다큐멘터리</p>
                    <Checkbox className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                    <p className="text-sm">코미디</p>
                    <Checkbox className="w-4 h-4" />
                  </div>
                  <div className="flex items-center justify-between h-14 pl-8 pr-5.5 border-b border-gray-300">
                    <p className="text-sm">드라마</p>
                    <Checkbox className="w-4 h-4" />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      )}
    </>
  );
}
