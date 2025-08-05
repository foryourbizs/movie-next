"use client";

import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  onReady?: () => void;
  onClose?: () => void;
}

export function VideoPlayer({
  src,
  poster,
  onReady,
  onClose,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReturnType<typeof videojs> | null>(null);

  useEffect(() => {
    // Video.js 초기화
    if (videoRef.current && !playerRef.current) {
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        poster: poster,
        playbackRates: [0.5, 1, 1.25, 1.5, 2],
        sources: [
          {
            src: src,
            type: "application/x-mpegURL", // HLS
          },
        ],
      }));

      player.ready(() => {
        console.log("Player is ready");
        onReady?.();
      });
    }
  }, [src, poster, onReady]);

  // 컴포넌트 정리
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl mx-4">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 text-white hover:bg-opacity-70 rounded-full p-2"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* 비디오 플레이어 */}
        <div
          ref={videoRef}
          className="video-js-responsive-container"
          style={{ paddingBottom: "56.25%", position: "relative" }}
        />
      </div>
    </div>
  );
}
