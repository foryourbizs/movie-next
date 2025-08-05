interface InfoTagProps {
  children: React.ReactNode;
}

export function InfoTag({ children }: InfoTagProps) {
  return (
    <span className="bg-white bg-opacity-80 text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
      {children}
    </span>
  );
}