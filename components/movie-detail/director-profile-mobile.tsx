import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface DirectorProfileMobileProps {
  id: number;
  name: string;
  originalName: string;
  description: string;
  imageUrl: string;
}

export function DirectorProfileMobile({
  id,
  name,
  originalName,
  description,
  imageUrl,
}: DirectorProfileMobileProps) {
  return (
    <div key={id} className="flex flex-col items-center gap-3">
      <Avatar className="w-32 h-32">
        <AvatarImage src={imageUrl} />
        <AvatarFallback>
          <User className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-center">
        <div className="text-md text-gray-500">{originalName}</div>
        <div className="text-lg font-medium">{name}</div>
        <p className="text-sm text-gray-500 mt-2">{description}</p>
      </div>
    </div>
  );
}
