import { InfoTag } from "@/components/movie-detail/info-tag";
import { Button } from "@/components/ui/button";

interface MovieOverlayProps {
  title: string;
  originalTitle: string;
  directors: string[];
  country: string;
  year: string;
  runtime: string;
  genre: string;
  ageRating: string;
  keywords: string;
  festival: string;
  onPreviewClick?: () => void;
}

export function MovieOverlay({
  title,
  originalTitle,
  directors,
  country,
  year,
  runtime,
  genre,
  ageRating,
  keywords,
  festival,
  onPreviewClick,
}: MovieOverlayProps) {
  return (
    <div className="absolute bottom-8 inset-x-0 flex justify-center">
      <div className="text-gray-100 max-w-7xl w-full px-8 md:px-12">
        <div className="mb-4">
          <h1 className="text-4xl font-bold mb-2">#{title}</h1>
          <p className="text-xl mb-2">#{originalTitle}</p>
          <p className="text-base text-gray-300">{directors.join(", ")}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <InfoTag>{country}</InfoTag>
          <InfoTag>{year}</InfoTag>
          <InfoTag>{runtime}</InfoTag>
          <InfoTag>{genre}</InfoTag>
          <InfoTag>{ageRating}</InfoTag>
          <InfoTag>{keywords}</InfoTag>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded">
            작품대여
          </Button>
          <Button
            onClick={onPreviewClick}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            미리보기
          </Button>
        </div>

        <div className="text-sm text-gray-300 mb-4">
          <p className="font-semibold">{festival}</p>
        </div>
      </div>
    </div>
  );
}
