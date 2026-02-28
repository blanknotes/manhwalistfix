export interface UnifiedManhwa {
  id: string;
  title: string;
  imageUrl: string;
  score: number;
  source: 'mal';
  rank: number;
  synopsis: string;
  status: string;
  genres: string[];
  authors: string[]; // Wajib ada
}