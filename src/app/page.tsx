
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { ManhwaCard } from "@/components/manhwa-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Compass, ChevronRight, Loader2, Globe, LayoutGrid } from "lucide-react";
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
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
                <div className="bg-primary/10 p-2 rounded-2xl">
                  <Compass className="text-primary w-8 h-8" />
                </div>
                Picked For You
              </h2>
              <p className="text-muted-foreground font-bold">Interesting titles you might have missed</p>
            </div>
            <Button variant="ghost" className="text-primary font-black text-lg group" asChild>
              <Link href="/browse" className="flex items-center">
                Explore More <ChevronRight className="ml-1 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="font-bold text-muted-foreground mt-4 italic">Finding gems for you...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10">
              {recommendedManhwa.map((manhwa, index) => (
                <ManhwaCard key={`${manhwa.id}-${index}`} manhwa={manhwa} />
              ))}
            </div>
          )}
        </section>

        {/* Info Banner */}
        <section className="bg-secondary/20 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12 border-4 border-dashed border-primary/10">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl rotate-3 shrink-0">
            <Globe className="w-16 h-16 text-primary" />
          </div>
          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tighter">Expanded Global Database</h3>
            <p className="text-xl text-muted-foreground font-medium max-w-2xl leading-relaxed">
              We've integrated high-quality metadata from MyAnimeList to provide the most accurate tracking for your favorite webtoons and manhwa releases.
            </p>
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
