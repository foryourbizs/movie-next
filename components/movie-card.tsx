import Image from "next/image";
import Link from "next/link";

interface MovieCardProps {
  id?: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  onClick?: () => void;
}

export function MovieCard({
  id,
  title,
  subtitle,
  imageUrl = "/ph.png",
  onClick,
}: MovieCardProps) {
  const content = (
    <div className="flex flex-col gap-1.5 cursor-pointer">
      <div className="w-full min-h-28 aspect-video bg-gray-300 rounded-sm overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          width={100}
          height={100}
          className="w-full min-h-28 aspect-video object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-xs text-gray-500 line-clamp-1">{subtitle}</p>
        <p className="text-md">{title}</p>
      </div>
    </div>
  );

  if (id) {
    return <Link href={`/movie/${id}`}>{content}</Link>;
  }

  return <div onClick={onClick}>{content}</div>;
}
