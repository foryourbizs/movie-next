import { RotateCcw } from "lucide-react";
import { FilterSection } from "./filter-section";

const genreItems = [
  "다큐멘터리",
  "코미디",
  "드라마",
  "액션",
  "로맨스",
  "스릴러",
  "호러",
  "SF",
];
const countryItems = [
  "한국",
  "미국",
  "일본",
  "영국",
  "프랑스",
  "독일",
  "이탈리아",
  "스페인",
];
const yearItems = ["2024", "2023", "2022", "2021", "2020"];
const ratingItems = ["9점 이상", "8점 이상", "7점 이상", "6점 이상"];

export function FilterSidebar() {
  return (
    <div className="hidden md:flex md:flex-col w-72 bg-white">
      <div className="flex justify-between items-center font-medium text-lg mb-6">
        <span>필터</span>
        <button className="flex items-center gap-1">
          <RotateCcw className="w-4 h-4" />
          <p className="font-medium text-sm">전체 초기화</p>
        </button>
      </div>
      <div className="w-full h-0.5 bg-gray-300 mb-6"></div>
      <div className="pr-2">
        <div className="flex flex-col">
          <FilterSection title="장르" items={genreItems} />
          <div className="w-full h-0.5 bg-gray-300 my-6"></div>
          <FilterSection title="국가" items={countryItems} />
          <div className="w-full h-0.5 bg-gray-300 my-6"></div>
          <FilterSection title="연도" items={yearItems} />
          <div className="w-full h-0.5 bg-gray-300 my-6"></div>
          <FilterSection title="평점" items={ratingItems} />
        </div>
      </div>
    </div>
  );
}
