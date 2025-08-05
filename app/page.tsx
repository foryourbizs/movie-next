"use client";

import { FilterSidebar } from "@/components/filter-sidebar";
import { MobileFilterModal } from "@/components/mobile-filter-modal";
import { MovieCard } from "@/components/movie-card";
import { SortDropdown } from "@/components/sort-dropdown";
import { ListFilter } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <>
      <div className="h-full flex flex-col md:px-12">
        <div className="my-4 px-6 md:px-0 md:mb-6">
          <p className="text-3xl font-semibold">영화</p>
        </div>
        <div className="md:flex md:gap-x-7">
          <FilterSidebar />
          <div className="flex flex-col flex-1">
            <div className="h-14 flex items-center justify-between px-6 border-b border-gray-300 md:hidden">
              <p className="text-sm">선택된 필터</p>
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
                총 30개의 작품이 검색되었어요!
              </p>
              <SortDropdown />
            </div>
            <div className="py-6 px-4 md:py-0 md:pb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 md:gap-y-10 gap-x-2">
                {Array.from({ length: 30 }).map((_, index) => {
                  const imageNumber = (index % 10) + 1;
                  return (
                    <MovieCard
                      key={index}
                      id={`movie-${index + 1}`}
                      title={`영화 제목 ${index + 1}`}
                      subtitle="미국 · 2016 · 다큐멘터리 · 나탈리 헬트젤, 레인 발데즈"
                      imageUrl={`/images/${imageNumber}.jpg`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <MobileFilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </>
  );
}
