import { type Episode } from "@/types/movie";
import Image from "next/image";

interface EpisodeListProps {
  episodes: Episode[];
}

export function EpisodeList({ episodes }: EpisodeListProps) {
  return (
    <div className="space-y-1">
      {/* Episodes List */}
      {episodes.map((episode) => (
        <div
          key={episode.id}
          className="flex gap-3 py-3 hover:bg-gray-900/30 rounded-lg cursor-pointer transition-colors"
        >
          {/* Episode Thumbnail */}
          <div className="flex-shrink-0">
            <div className="relative w-16 h-12 bg-gray-800 rounded overflow-hidden">
              <Image
                src={episode.thumbnail}
                alt={episode.title}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-medium text-sm mb-1">
                  {episode.id}. {episode.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <span>{episode.duration}</span>
                  <span>•</span>
                  <span>{episode.date}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
                  {episode.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
