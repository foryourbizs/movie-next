import { type MovieDetail } from "@/types/movie";

interface MovieInfoProps {
  movie: MovieDetail;
}

export function MovieInfo({ movie }: MovieInfoProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="text-white font-semibold text-2xl">프로그램 노트</p>
          <p className="text-gray-300 leading-relaxed">
            영화 초창기 유행하던 도시영화의 포스트 펑크 버전. 도시는 우리가
            살기에 우리의 것이며 전 세계는 자본주의가부장제제국주의로
            통일되었기에 그에 대한 저항도 전 세계적이어야 한다. 어떻게 저항할 수
            있는가? 스케이트보드, 트위터, 음악, 춤, 낙서, 카메라, 방독면, 군중,
            시위, 속도, 달리기, 그림자가 도시를 뒤덮어야 한다. 누가? 모두의
            다름을 인정하면서 함께할 수 있는 사랑의 다중 (마이클 하트)이 있어야
            한다. 길들여지지 말고 봉기하라 그리하면 자유로워지리라. [김선아] ​
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-white font-semibold text-2xl">감독</p>
          <p className="text-gray-300 leading-relaxed">
            영화 초창기 유행하던 도시영화의 포스트 펑크 버전. 도시는 우리가
            살기에 우리의 것이며 전 세계는 자본주의가부장제제국주의로
            통일되었기에 그에 대한 저항도 전 세계적이어야 한다. 어떻게 저항할 수
            있는가? 스케이트보드, 트위터, 음악, 춤, 낙서, 카메라, 방독면, 군중,
            시위, 속도, 달리기, 그림자가 도시를 뒤덮어야 한다. 누가? 모두의
            다름을 인정하면서 함께할 수 있는 사랑의 다중 (마이클 하트)이 있어야
            한다. 길들여지지 말고 봉기하라 그리하면 자유로워지리라. [김선아] ​
          </p>
        </div>
      </div>
    </div>
  );
}
