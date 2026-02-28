export interface MALManhwa {
  mal_id: number;
  title: string;
  images: {
    webp: {
      image_url: string;
      large_image_url: string;
    };
  };
  score: number;
  rank: number;
  synopsis: string;
  status: string;
  genres: { name: string }[];
  authors: { name: string }[]; // Tambahkan ini
}

const EXCLUDED_GENRES = [
  "Ecchi", "Hentai", "Erotica", 
  "Boys Love", "Yaoi", "Shounen Ai" // Tambahkan ini untuk memblokir BL
];

export function filterManhwa(data: MALManhwa[]): MALManhwa[] {
  if (!data || !Array.isArray(data)) return [];
  return data.filter((m) => {
    // Cek apakah ada genre yang dilarang
    const hasExcludedGenre = m.genres?.some((g) => 
      EXCLUDED_GENRES.includes(g.name)
    );
    return !hasExcludedGenre;
  });
}

export async function getRankingData(page: number = 1): Promise<MALManhwa[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/top/manga?type=manhwa&page=${page}&limit=25`);
    if (res.status === 429) return []; 
    const json = await res.json();
    return filterManhwa(json.data || []);
  } catch (error) {
    return [];
  }
}

export async function getManyTopManhwa(page: number = 1): Promise<MALManhwa[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/top/manga?type=manhwa&page=${page}&limit=50`);
    const json = await res.json();
    return filterManhwa(json.data || []);
  } catch (error) {
    return [];
  }
}

export async function searchManhwa(query: string): Promise<MALManhwa[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&type=manhwa`);
    const json = await res.json();
    return filterManhwa(json.data || []);
  } catch (error) {
    return [];
  }
}