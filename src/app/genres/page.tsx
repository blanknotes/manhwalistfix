"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ManhwaCard } from "@/components/manhwa-card"; 
import { getUnifiedByGenre, getUnifiedRanking } from "@/lib/manhwa-service";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const GENRE_MAP = [
  { id: "", name: "All Genres" }, 
  { id: "1", name: "Action" },
  { id: "10", name: "Fantasy" },
  { id: "22", name: "Romance" },
  { id: "4", name: "Comedy" },
  { id: "8", name: "Drama" },
  { id: "7", name: "Mystery" },
  { id: "14", name: "Horror" },
];

export default function GenresPage() {
  const [selectedGenre, setSelectedGenre] = useState(""); 
  const [manhwas, setManhwas] = useState<UnifiedManhwa[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadGenreData = async () => {
      setLoading(true);
      try {
        // Logika Campuran: Jika All, panggil ranking. Jika ada ID, panggil genre.
        const data = selectedGenre === "" 
          ? await getUnifiedRanking(currentPage) 
          : await getUnifiedByGenre(selectedGenre, currentPage);
        
        setManhwas(data);
      } catch (error) {
        console.error("Gagal memuat data genre:", error);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    loadGenreData();
  }, [selectedGenre, currentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-[1400px]">
        <h1 className="text-4xl font-black mb-8 text-primary italic tracking-tighter">Explore Genres</h1>
        
        {/* Genre Selector */}
        <div className="flex flex-wrap gap-2 mb-12">
          {GENRE_MAP.map((g) => (
            <Button
              key={g.name}
              variant={selectedGenre === g.id ? "default" : "outline"}
              onClick={() => { 
                setSelectedGenre(g.id); 
                setCurrentPage(1); // Reset ke halaman 1 setiap ganti genre
              }}
              className="rounded-full font-bold px-6 border-2 transition-all"
            >
              {g.name}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-12">
            {/* Grid Tampilan Manhwa */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {manhwas.length > 0 ? (
                manhwas.map((m) => (
                  <ManhwaCard key={m.id} manhwa={m} variant="grid" />
                ))
              ) : (
                <div className="col-span-full text-center py-20 opacity-30 font-bold">
                  Data tidak ditemukan...
                </div>
              )}
            </div>

            {/* TOMBOL NAVIGASI HALAMAN (PAGINATION) */}
            <div className="flex justify-center items-center gap-6 py-10 border-t border-primary/5">
              <Button 
                variant="outline" 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(p => p - 1)}
                className="rounded-2xl h-12 px-8 font-bold border-2"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Prev
              </Button>
              
              <div className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-2xl font-black text-xl shadow-lg">
                {currentPage}
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => setCurrentPage(p => p + 1)}
                className="rounded-2xl h-12 px-8 font-bold border-2"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}