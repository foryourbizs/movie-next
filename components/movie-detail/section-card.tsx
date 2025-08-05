interface SectionCardProps {
  children: React.ReactNode;
}

export function SectionCard({ children }: SectionCardProps) {
  return (
    <div className="bg-white rounded-2xl">
      {children}
    </div>
  );
}