import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface PersonProfileProps {
  id: number;
  name: string;
  originalName: string;
  description: string;
  imageUrl: string;
  variant?: "desktop" | "mobile";
}

export function PersonProfile({
  id,
  name,
  originalName,
  description,
  imageUrl,
  variant = "desktop",
}: PersonProfileProps) {
  if (variant === "mobile") {
    return (
      <div key={id} className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={imageUrl} />
          <AvatarFallback>
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <div className="text-base font-medium">{name}</div>
            <div className="text-sm text-gray-500">|</div>
            <div className="text-sm text-gray-500">{originalName}</div>
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </div>
    );
  }

  return (
    <div key={id} className="space-y-4">
      <div className="flex items-center space-x-6">
        <div>
          <Avatar className="w-26 h-26 ring-4 ring-gray-100">
            <AvatarImage src={imageUrl} />
            <AvatarFallback>
              <User className="w-6 h-6" />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 flex flex-col justify-center gap-2 min-w-0">
          <div className="space-y-2">
            <div>
              <p className="text-xl font-bold text-gray-900">{name}</p>
              <p className="text-sm text-gray-500">{originalName}</p>
            </div>
          </div>
          <div className="prose prose-base text-gray-700 leading-relaxed">
            <p>{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
