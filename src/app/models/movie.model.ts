export type MovieStatus = 'Watching' | 'Watched' | 'Plan to Watch';

export interface Movie {
  id?: string;
  title: string;
  director: string;
  genre: string;
  releaseYear: number;
  rating: number;
  status: MovieStatus;
}