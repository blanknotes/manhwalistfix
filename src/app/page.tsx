
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ManhwaCard } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, ChevronRight, Loader2, Globe, LayoutGrid, Star } from "lucide-react";
import Link from "next/link";
import { getUnifiedTop } from "@/lib/manhwa-service";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [recommendedManhwa, setRecommendedManhwa] = useState<UnifiedManhwa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUnifiedTop(24);
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      setRecommendedManhwa(shuffled.slice(0, 8));
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 space-y-16">
        {/* Hero Section */}
        <section className="relative rounded-[3rem] overflow-hidden bg-primary p-8 md:p-20 text-primary-foreground shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-8">
            <Badge className="bg-white/20 text-white py-1.5 px-4 rounded-full font-bold border-none">
              AI-Powered Discovery Engine
            </Badge>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Find Your Next Favorite Story
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/90 font-medium max-w-xl">
              Tired of the same old titles? Let our AI recommend the manhwa that best fits your taste.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full font-black px-10 h-14 shadow-xl text-lg" asChild>
                <Link href="/recommendations">
                  <Sparkles className="mr-2 w-5 h-5" />
                  Try AI Recs
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 rounded-full font-black px-10 h-14 shadow-xl text-lg" asChild>
                <Link href="/genres">
                  <LayoutGrid className="mr-2 w-5 h-5" />
                  Explore Genres
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Picked For You Section */}
        <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Compass className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-tighter">Picked For You</h2>
            <p className="text-muted-foreground font-medium">Interesting titles you might have missed</p>
          </div>
        </div>

        {/* GRID SYSTEM: Menggunakan 2 kolom seperti di halaman rekomendasi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedManhwa.map((manhwa) => (
            <div 
              key={manhwa.id} 
              className="flex bg-white rounded-[2.5rem] shadow-sm border border-black/5 hover:shadow-xl transition-all group overflow-hidden h-52"
            >
              {/* SISI KIRI: Gambar (Isolasi dengan variant="grid") */}
              <div className="relative h-full aspect-[2/3] shrink-0 overflow-hidden bg-secondary/20">
                <ManhwaCard manhwa={manhwa} variant="grid" />
              </div>
              
              {/* SISI KANAN: Informasi Manhwa */}
              <div className="flex-1 p-6 flex flex-col justify-center min-w-0 bg-white">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] uppercase">
                    {manhwa.genres[0]}
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-black text-xs">{manhwa.score}</span>
                  </div>
                </div>

                <Link href={`/manhwa/${manhwa.id}`}>
                  <h3 className="font-black text-xl line-clamp-1 leading-tight group-hover:text-primary transition-colors cursor-pointer mb-2">
                    {manhwa.title}
                  </h3>
                </Link>
                
                <p className="text-xs text-muted-foreground font-medium line-clamp-3 leading-relaxed">
                  {manhwa.synopsis}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      </main>

      <footer className="border-t bg-white py-16 mt-20 text-center space-y-4">
        <p className="text-primary font-black text-4xl tracking-tighter">Manhwa<span className="text-foreground">List</span></p>
        <p className="text-sm text-muted-foreground font-bold tracking-widest uppercase">Powered by Jikan API & AI Discovery Engine</p>
      </footer>
    </div>
  );
}
