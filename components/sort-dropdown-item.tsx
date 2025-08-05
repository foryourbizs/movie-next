interface SortDropdownItemProps {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}

export function SortDropdownItem({
  label,
  onClick,
  isActive = false,
}: SortDropdownItemProps) {
  return (
    <div
      className={`h-11 flex items-center justify-center cursor-pointer hover:bg-gray-50 ${
        isActive ? "font-medium" : ""
      }`}
      onClick={onClick}
    >
      {label}
    </div>
  );
}
