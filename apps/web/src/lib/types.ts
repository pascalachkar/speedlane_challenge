export type Role = 'MEMBER' | 'ADMIN';
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}
export interface Genre {
  id: string;
  name: string;
  slug: string;
}
export interface Director {
  id: string;
  name: string;
  slug: string;
}
export interface Movie {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  releaseDate: string;
  runtimeMinutes: number;
  contentRating?: string;
  posterUrl: string;
  backdropUrl?: string;
  averageRating: string;
  directors: { director: Director }[];
  genres: { genre: Genre }[];
}
export interface MoviePage {
  data: Movie[];
  meta: {
    offset: number;
    limit: number;
    total: number;
    hasMore: boolean;
    nextOffset: number | null;
  };
}
