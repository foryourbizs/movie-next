import { ChevronRight } from "lucide-react";
import { FilterCheckboxItem } from "./filter-checkbox-item";

interface FilterSectionProps {
  title: string;
  items: string[];
  showMoreButton?: boolean;
  onShowMore?: () => void;
  className?: string;
}

export function FilterSection({
  title,
  items,
  showMoreButton = true,
  onShowMore,
  className = "",
}: FilterSectionProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-base font-medium">{title}</p>
        {showMoreButton && (
          <button
            className="flex items-center gap-0.5 text-gray-500"
            onClick={onShowMore}
          >
            <p className="text-sm">더보기</p>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <FilterCheckboxItem key={index} label={item} />
        ))}
      </div>
    </div>
  );
}
