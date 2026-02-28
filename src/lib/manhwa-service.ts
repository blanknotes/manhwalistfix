import { 
  getRankingData, 
  getManyTopManhwa, 
  searchManhwa, 
  filterManhwa, // Ini yang tadi kurang (penyebab garis merah)
  type MALManhwa 
} from "./mal-api";
import { type UnifiedManhwa } from "./unified-manhwa";

// Helper untuk mengubah data dari MAL ke format aplikasi kita
export function normalizeMAL(m: MALManhwa): UnifiedManhwa {
  return {
    id: String(m.mal_id),
    title: m.title || "Untitled",
    imageUrl: m.images?.webp?.large_image_url || m.images?.webp?.image_url || "",
    score: Number(m.score) || 0,
    source: 'mal' as const,
    rank: m.rank || 0,
    synopsis: m.synopsis || "No synopsis available.",
    status: m.status || "Unknown",
    genres: Array.isArray(m.genres) ? m.genres.map(g => g.name) : [],
    authors: Array.isArray(m.authors) ? m.authors.map(a => a.name) : ["Unknown Author"]
  };
}

// Fungsi Ranking (Data yang muncul di halaman Ranking)
export async function getUnifiedRanking(page: number = 1): Promise<UnifiedManhwa[]> {
  const malData = await getRankingData(page);
  return malData.map(normalizeMAL);
}

// Fungsi Genre (Solusi untuk halaman Genre yang kosong)
export async function getUnifiedByGenre(genreId: string, page: number = 1): Promise<UnifiedManhwa[]> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga?genres=${genreId}&type=manhwa&order_by=score&sort=desc&page=${page}`);
    if (!res.ok) return [];
    
    const json = await res.json();
    
    // filterManhwa sekarang sudah dikenali karena di-import di atas
    const filteredData = filterManhwa(json.data || []);
    return filteredData.map(normalizeMAL);
  } catch (error) {
    console.error("Genre Error:", error);
    return [];
  }
}

// Fungsi Detail (Untuk halaman detail manhwa)
export async function getUnifiedDetail(id: string): Promise<UnifiedManhwa | null> {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
    if (!res.ok) return null;
    const json = await res.json();
    return normalizeMAL(json.data);
  } catch (error) {
    return null;
  }
}

// Fungsi Search
export async function searchUnified(query: string): Promise<UnifiedManhwa[]> {
  const malData = await searchManhwa(query);
  return malData.map(normalizeMAL);
}

// Tambahkan ini di paling bawah file manhwa-service.ts
// Ini berfungsi sebagai "cadangan" agar halaman Home tidak error
export const getUnifiedTop = getUnifiedRanking;
export const unifiedSearch = searchUnified;