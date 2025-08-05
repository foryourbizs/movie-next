export interface Episode {
  id: number;
  title: string;
  duration: string;
  date: string;
  description: string;
  thumbnail: string;
}

export interface MovieDetail {
  id: string;
  title: string;
  originalTitle: string;
  rating: number;
  genre: string;
  network: string;
  ageRating: string;
  year: string;
  country: string;
  director: string;
  cast: string[];
  synopsis: string;
  imageUrl: string;
  episodes?: Episode[];
}

export interface MovieCard {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
}
