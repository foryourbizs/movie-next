import { Checkbox } from "@/components/ui/checkbox";

interface FilterCheckboxItemProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function FilterCheckboxItem({
  label,
  checked,
  onChange,
  className = "",
}: FilterCheckboxItemProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Checkbox
        className="w-5 h-5"
        checked={checked}
        onCheckedChange={onChange}
      />
      <p className="text-sm">{label}</p>
    </div>
  );
}
