interface SectionHeaderProps {
  title: string;
}

export function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex flex-col space-y-3 mb-6">
      <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
      <div className="h-px w-full bg-gray-200"></div>
    </div>
  );
}
