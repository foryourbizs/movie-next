"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type MovieDetail } from "@/types/movie";
import { User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface MovieDetailPageProps {
  params: {
    id: string;
  };
}

export default function MovieDetailPage({ params }: MovieDetailPageProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("한국");
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  // 임시 데이터 - 실제로는 API에서 가져올 데이터
  const movieData: MovieDetail = {
    id: "1",
    title: "봉기하라",
    originalTitle: "Rise",
    rating: 4.8,
    genre: "시즌 2기 • 범죄",
    network: "original",
    ageRating: "15",
    year: "2024",
    country: "한국",
    director: "박성후",
    cast: ["배우1", "배우2", "배우3"],
    synopsis: `한 젊은 액티비스트 여성이 거리를 가로질러 달려간다. 스케이트보드를 탄 남자는 아스팔트 도로를 미끄러져 간다. 페인트 폭탄이 설치되고 폭발하면 경찰이 도착한다. 어디에든 사람들이 있다. 밤에는 투석전이 있고, 차들이 불타고, 최루탄 가스가 퍼져나간다. 대통령궁은 여전히 보호되고 있다. 트위터에는 사건들이 포스팅되고, 그리고 전 세계로 퍼져나간다. "시장은 글로벌하다. 저항 역시 그러하다."`,
    imageUrl: "/ph.png",
  };

  return (
    <div className="min-h-screen text-black">
      {/* Header with Close Button */}
      <div className="relative">
        {/* Poster Section */}
        <div className="relative h-96 bg-gradient-to-b from-gray-900 to-black">
          <div className="absolute inset-0 bg-black bg-opacity-40" />
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
              <div className="absolute top-full mt-1 left-0 bg-gray-900 border border-gray-600 rounded-md shadow-lg z-10 min-w-full">
                {["한국", "English", "日本語"].map((language) => (
                  <button
                    key={language}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800"
                    onClick={() => {
                      setSelectedLanguage(language);
                      setIsLanguageDropdownOpen(false);
                    }}
                  >
                    {language}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rent Button */}
          <Button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium">
            대여하기
          </Button>

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
              <div className="flex flex-col items-center gap-2">
                <Avatar className="w-36 h-36">
                  <AvatarImage src="/ph.png" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-center">
                  <div className="text-md text-gray-500">Florencia ROVLICH</div>
                  <div className="text-lg font-medium">플로렌시아 로블리</div>
                  <p className="text-sm text-gray-500 mt-2">
                    브라질 출생. 어렸을 때부터 도시, 정치, 영화에 대한 열정을
                    갖고 있 었다. 그의 첫 작품들은 끊임없이 바뀌는 도시의 생활
                    환경과 일상생 활을 비디오와 핸드폰 카메라에 담았다. 그의
                    연출작들은 시민 불복 종 운동이 도시 개발에 미치는 영향을
                    묘사했으며, 여러 국제영화제 에서 상영됐다.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="cast" className="py-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/ph.png" />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <div className="text-base font-medium">박성호</div>
                    <div className="text-sm text-gray-500">|</div>
                    <div className="text-sm text-gray-500">Park Sung-ho</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">브라질 출신 배우</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="esg" className="py-4">
              영화 초창기 유행하던 도시영화의 포스트 펑크 버전. 도시는 우리가
              살기에 우리의 것이며 전 세계는 자본주의가부장제제국주의로
              통일되었기에 그에 대한 저항도 전 세계적이어야 한다. 어떻게 저항할
              수 있는가? 스케이트보드, 트위터, 음악, 춤, 낙서, 카메라, 방독면,
              군중, 시위, 속도, 달리기, 그림자가 도시를 뒤덮어야 한다. 누가?
              모두의 다름을 인정하면서 함께할 수 있는 사랑의 다중 (마이클
              하트)이 있어야 한다. 길들여지지 말고 봉기하라 그리하면
              자유로워지리라. [김선아] ​
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
