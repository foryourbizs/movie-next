"use client";

import { DirectorProfileMobile } from "@/components/movie-detail/director-profile-mobile";
import { MovieOverlay } from "@/components/movie-detail/movie-overlay";
import { PersonProfile } from "@/components/movie-detail/person-profile";
import { SectionCard } from "@/components/movie-detail/section-card";
import { SectionHeader } from "@/components/movie-detail/section-header";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video-player";
import Image from "next/image";
import { useState } from "react";

export default function MovieDetailPage() {
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  // 실제 "봉기하라" 영화 데이터
  const movieData = {
    id: "1",
    title: "봉기하라",
    originalTitle: "Rise",
    rating: 4.8,
    country: "아르헨티나, 독일",
    year: "2014",
    runtime: "15min",
    genre: "실험",
    ageRating: "12세 이상",
    keywords: "도시 사회운동 예술 음악",
    festival: "2015 베를린국제영화제",
    directors: [
      {
        id: 1,
        name: "플로렌시아 로블리",
        originalName: "Florencia ROVLICH",
        description:
          "아르헨티나 출생. 제65회 베를린국제영화제에서 월드 프리미어로 공개된 단편 영화 <#봉기하라>를 공동 연출했다. 영화 제작사 미그 라시네에서 영화감독으로 일하고 있으며, 현재 장편 영화 두 작품을 제작 중이다.",
        imageUrl: "/images/director1.jpg",
      },
      {
        id: 2,
        name: "이호르 가마",
        originalName: "Ygor GAMA",
        description:
          "브라질 출생. 어렸을 때부터 도시, 정치, 영화에 대한 열정을 갖고 있었다. 그의 첫 작품들은 끊임없이 바뀌는 도시의 생활 환경과 일상생활을 비디오와 핸드폰 카메라에 담았다. 그의 연출작들은 시민 불복종 운동이 도시 개발에 미치는 영향을 묘사했으며, 여러 국제영화제에서 상영됐다.",
        imageUrl: "/images/director2.jpg",
      },
    ],
    cast: [
      {
        id: 1,
        name: "마누엘라 히달고",
        originalName: "Manuela HIDALGO",
        description: "아르헨티나 출신 배우",
        imageUrl: "/ph.png",
      },
      {
        id: 2,
        name: "마리아노 파스",
        originalName: "Mariano PAZ",
        description: "아르헨티나 출신 배우",
        imageUrl: "/ph.png",
      },
    ],
    credits: {
      producer: ["Sofa QUIROS", "Francisca Saez AGURTO"],
      screenwriter: ["Ygor GAMA", "Florencia ROVLICH", "Francisca Saez AGURTO"],
      cinematography: ["Francisca Saez AGURTO"],
      editor: ["Ygor GAMA"],
      music: ["Fran VILLALBA"],
      sound: ["Lautaro AICHENBAUM"],
    },
    synopsis: `한 젊은 액티비스트 여성이 거리를 가로질러 달려간다. 스케이트보드를 탄 남자는 아스팔트 도로를 미끄러져 간다. 페인트 폭탄이 설치되고 폭발하면 경찰이 도착한다. 어디에든 사람들이 있다. 밤에는 투석전이 있고, 차들이 불타고, 최루탄 가스가 퍼져나간다. 대통령궁은 여전히 보호되고 있다. 트위터에는 사건들이 포스팅되고, 그리고 전 세계로 퍼져나간다. "시장은 글로벌하다. 저항 역시 그러하다."`,
    programNote: `영화 초창기 유행하던 도시영화의 포스트 펑크 버전. 도시는 우리가 살기에 우리의 것이며 전 세계는 자본주의가부장제제국주의로 통일되었기에 그에 대한 저항도 전 세계적이어야 한다. 어떻게 저항할 수 있는가? 스케이트보드, 트위터, 음악, 춤, 낙서, 카메라, 방독면, 군중, 시위, 속도, 달리기, 그림자가 도시를 뒤덮어야 한다. 누가? 모두의 다름을 인정하면서 함께할 수 있는 사랑의 다중 (마이클 하트)이 있어야 한다. 길들여지지 말고 봉기하라 그리하면 자유로워지리라. [김선아]`,
    imageUrl: "/images/rise.jpg",
    streamUrl:
      "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {/* PC Layout - Desktop Only */}
      <div className="hidden md:block">
        {/* Main Content Area */}
        <div className="flex flex-col">
          {/* Top Poster Area */}
          <div className="relative">
            <div className="relative h-[698px]">
              <Image
                src={movieData.imageUrl}
                alt={movieData.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-gray-900 opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900 opacity-70" />

              {/* Movie Info Overlay */}
              <MovieOverlay
                title={movieData.title}
                originalTitle={movieData.originalTitle}
                directors={movieData.directors.map((d) => d.name)}
                country={movieData.country}
                year={movieData.year}
                runtime={movieData.runtime}
                genre={movieData.genre}
                ageRating={movieData.ageRating}
                keywords={movieData.keywords}
                festival={movieData.festival}
                onPreviewClick={() => setIsVideoPlayerOpen(true)}
              />
            </div>
          </div>

          {/* Bottom Info Area */}
          <div className="py-16 md:px-12 lg:w-7xl mx-auto">
            <div className="space-y-16">
              {/* 시놉시스 */}
              <SectionCard>
                <SectionHeader title="시놉시스" />
                <div className="prose prose-lg text-gray-700 leading-relaxed">
                  <p>{movieData.synopsis}</p>
                </div>
              </SectionCard>

              {/* ESG */}
              <SectionCard>
                <SectionHeader title="ESG" />
                <div className="prose prose-lg text-gray-700 leading-relaxed">
                  <p>{movieData.programNote}</p>
                </div>
              </SectionCard>

              {/* 감독 정보 */}
              <SectionCard>
                <SectionHeader title="감독" />
                <div className="space-y-12">
                  {movieData.directors.map((director) => (
                    <PersonProfile
                      key={director.id}
                      id={director.id}
                      name={director.name}
                      originalName={director.originalName}
                      description={director.description}
                      imageUrl={director.imageUrl}
                      variant="desktop"
                    />
                  ))}
                </div>
              </SectionCard>

              {/* 출연진 정보 */}
              <SectionCard>
                <SectionHeader title="출연진" />
                <div className="space-y-12">
                  {movieData.cast.map((actor) => (
                    <PersonProfile
                      key={actor.id}
                      id={actor.id}
                      name={actor.name}
                      originalName={actor.originalName}
                      description={actor.description}
                      imageUrl={actor.imageUrl}
                      variant="desktop"
                    />
                  ))}
                </div>
              </SectionCard>

              {/* 크레딧 정보 */}
              <SectionCard>
                <SectionHeader title="Credit" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Producer
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.producer.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Cast</h4>
                      <p className="text-gray-700">
                        {movieData.cast
                          .map((actor) => actor.originalName)
                          .join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Screenwriter
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.screenwriter.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Cinematography
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.cinematography.join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Editor
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.editor.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Music
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.music.join(", ")}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Sound
                      </h4>
                      <p className="text-gray-700">
                        {movieData.credits.sound.join(", ")}
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Mobile Only */}
      <div className="md:hidden">
        {/* Header with Close Button */}
        <div className="relative">
          {/* Poster Section */}
          <div className="relative h-96 bg-gradient-to-b from-gray-700 to-gray-900">
            <div className="absolute inset-0 bg-gray-800 bg-opacity-40" />
            <Image
              src={movieData.imageUrl}
              alt={movieData.title}
              fill
              className="object-cover opacity-60"
            />
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-6 space-y-6">
          {/* Title and Info */}
          <div className="space-y-3">
            <div>
              <h1 className="text-2xl font-bold mb-1">{movieData.title}</h1>
              <p className="text-lg text-gray-500">{movieData.originalTitle}</p>
            </div>

            {/* Genre Info */}
            <p className="text-sm text-gray-500">{movieData.genre}</p>

            {/* Language Selector */}
            <div className="relative">
              {isLanguageDropdownOpen && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-full">
                  {["한국", "English", "日본語"].map((language) => (
                    <button
                      key={language}
                      className="block w-full text-left px-4 py-2 text-sm text-black hover:bg-gray-100"
                      onClick={() => {
                        setIsLanguageDropdownOpen(false);
                      }}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium">
                대여하기
              </Button>
              <Button
                onClick={() => setIsVideoPlayerOpen(true)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-md font-medium"
              >
                미리보기
              </Button>
            </div>

            {/* Synopsis */}
            <div className="space-y-2">
              <p className="text-sm text-gray-500 leading-relaxed">
                {movieData.synopsis}
              </p>
            </div>

            <Tabs defaultValue="director" className="w-full mt-6">
              <TabsList className="w-full">
                <TabsTrigger value="director" className="w-full">
                  감독
                </TabsTrigger>
                <TabsTrigger value="cast" className="w-full">
                  출연진
                </TabsTrigger>
                <TabsTrigger value="esg" className="w-full">
                  ESG
                </TabsTrigger>
              </TabsList>
              <TabsContent value="director" className="py-4">
                <div className="space-y-6">
                  {movieData.directors.map((director) => (
                    <DirectorProfileMobile
                      key={director.id}
                      id={director.id}
                      name={director.name}
                      originalName={director.originalName}
                      description={director.description}
                      imageUrl={director.imageUrl}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="cast" className="py-4">
                <div className="space-y-4">
                  {movieData.cast.map((actor) => (
                    <PersonProfile
                      key={actor.id}
                      id={actor.id}
                      name={actor.name}
                      originalName={actor.originalName}
                      description={actor.description}
                      imageUrl={actor.imageUrl}
                      variant="mobile"
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="esg" className="py-4">
                영화 초창기 유행하던 도시영화의 포스트 펑크 버전. 도시는 우리가
                살기에 우리의 것이며 전 세계는 자본주의가부장제제국주의로
                통일되었기에 그에 대한 저항도 전 세계적이어야 한다. 어떻게
                저항할 수 있는가? 스케이트보드, 트위터, 음악, 춤, 낙서, 카메라,
                방독면, 군중, 시위, 속도, 달리기, 그림자가 도시를 뒤덮어야 한다.
                누가? 모두의 다름을 인정하면서 함께할 수 있는 사랑의 다중
                (마이클 하트)이 있어야 한다. 길들여지지 말고 봉기하라 그리하면
                자유로워지리라. [김선아] ​
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Video Player Modal */}
      {isVideoPlayerOpen && (
        <VideoPlayer
          src={movieData.streamUrl}
          poster={movieData.imageUrl}
          onClose={() => setIsVideoPlayerOpen(false)}
          onReady={() => console.log("Video player is ready")}
        />
      )}
    </div>
  );
}
