import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { SortDropdownItem } from "./sort-dropdown-item";

const sortOptions = [
  { label: "기본순", value: "default" },
  { label: "최신순", value: "latest" },
  { label: "인기순", value: "popular" },
  { label: "평점순", value: "rating" },
];

export function SortDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("기본순");

  const handleSortChange = (label: string) => {
    setSelectedSort(label);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="rounded-sm flex items-center gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm">{selectedSort}</span>
        <ChevronDown className="w-4 h-4" />
      </button>
      <div
        className={`absolute -left-26 top-8 py-2 bg-white border border-gray-300 rounded-sm px-4 shadow-md ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex flex-col gap-2 w-32 text-sm">
          {sortOptions.map((option) => (
            <SortDropdownItem
              key={option.value}
              label={option.label}
              onClick={() => handleSortChange(option.label)}
              isActive={selectedSort === option.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
