"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ManhwaCard } from "@/components/manhwa-card";
import { getUnifiedRanking } from "@/lib/manhwa-service";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function RankingPage() {
  const [manhwas, setManhwas] = useState<UnifiedManhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getUnifiedRanking(currentPage);
      setManhwas(data);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    loadData();
  }, [currentPage]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-[1000px]">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 font-bold text-primary">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </Button>

        <header className="mb-10">
          <h1 className="text-5xl font-black tracking-tighter text-primary italic">Global Leaderboard</h1>
          <p className="opacity-50 font-medium">Peringkat manhwa terbaik berdasarkan skor komunitas.</p>
        </header>

        {loading ? (
          <div className="flex justify-center py-40"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>
        ) : (
          <div className="flex flex-col gap-6">
            {manhwas.map((manhwa, index) => {
              // RUMUS URUTAN: (Halaman - 1) * 25 + (index + 1)
              const displayRank = (currentPage - 1) * 25 + (index + 1);
              return (
                <ManhwaCard 
                  key={manhwa.id} 
                  manhwa={{ ...manhwa, rank: displayRank }} 
                  variant="list" 
                  showRank={true} 
                />
              );
            })}

            {/* Pagination */}
            <div className="flex justify-center items-center gap-4 py-10 mt-6 border-t border-primary/10">
              <Button variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="rounded-full">Prev</Button>
              <div className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-full font-black">{currentPage}</div>
              <Button variant="outline" onClick={() => setCurrentPage(p => p + 1)} className="rounded-full">Next</Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}