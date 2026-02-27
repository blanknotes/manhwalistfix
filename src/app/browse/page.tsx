"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { GENRES } from "@/app/lib/db";
import { ManhwaCard } from "@/components/manhwa-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUpDown, Loader2, Globe, ArrowLeft, Star, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUnifiedTop, unifiedSearch } from "@/lib/manhwa-service";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

function BrowseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [manhwas, setManhwas] = useState<UnifiedManhwa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [source, setSource] = useState("all");
  const [sortBy, setSortBy] = useState("rank");
  const [isMounted, setIsMounted] = useState(false);
  
  const [suggestions, setSuggestions] = useState<UnifiedManhwa[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (initialQuery) {
      setSearchQuery(initialQuery);
      performSearch(initialQuery);
    } else {
      loadInitialData();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [initialQuery]);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (searchQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await unifiedSearch(searchQuery);
      setSuggestions(results.slice(0, 8));
    }, 400);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const loadInitialData = async () => {
    setLoading(true);
    const data = await getUnifiedTop(100);
    setManhwas(data);
    setLoading(false);
  };

  const performSearch = async (query: string) => {
    setLoading(true);
    setShowSuggestions(false);
    if (!query.trim()) {
      await loadInitialData();
    } else {
      const results = await unifiedSearch(query);
      setManhwas(results);
    }
    setLoading(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    performSearch(searchQuery);
  };

  if (!isMounted) return null;

  let filteredManhwa = manhwas.filter(m => {
    const matchesGenres = selectedGenres.length === 0 || 
      selectedGenres.some(g => m.genres?.some(mg => mg.toLowerCase().includes(g.toLowerCase())));
    
    if (source === 'mal') return matchesGenres && m.source === 'mal';
    return matchesGenres;
  });

  filteredManhwa = [...filteredManhwa].sort((a, b) => {
    if (sortBy === 'rank') return (a.rank || 9999) - (b.rank || 9999);
    if (sortBy === 'rating') return (b.score || 0) - (a.score || 0);
    return 0;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <header className="space-y-8 mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter">Explore Manhwa</h1>
              <p className="text-muted-foreground font-bold text-lg">Integrated Database: MyAnimeList & MangaUpdates</p>
            </div>
            
            <div className="bg-secondary/30 p-1 rounded-2xl flex gap-1">
              <Button variant={source === 'all' ? 'default' : 'ghost'} onClick={() => setSource('all')} className="rounded-xl font-bold">All</Button>
              <Button variant={source === 'mal' ? 'default' : 'ghost'} onClick={() => setSource('mal')} className="rounded-xl font-bold">MAL</Button>
              <Button variant={source === 'mu' ? 'default' : 'ghost'} onClick={() => setSource('mu')} className="rounded-xl font-bold">MangaUpdates</Button>
            </div>
          </div>

          <div className="relative" ref={containerRef}>
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground" />
                <Input 
                  placeholder="Search across all databases..." 
                  className="pl-14 h-16 rounded-3xl bg-white border-none text-xl font-medium shadow-sm"
                  value={searchQuery}
                  autoComplete="off"
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button type="submit" className="h-16 rounded-3xl px-10 font-black text-lg">Search</Button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-3xl shadow-2xl border border-primary/5 z-[100] overflow-hidden">
                <ScrollArea className="max-h-[400px]">
                  <div className="p-3">
                    {suggestions.map((s, index) => (
                      <button
                        key={`${s.id}-${index}`}
                        type="button"
                        onClick={() => {
                          setSearchQuery(s.title);
                          performSearch(s.title);
                        }}
                        className="w-full p-3 text-left hover:bg-primary/5 rounded-2xl flex items-center gap-4 transition-all group"
                      >
                        <div className="w-12 h-16 bg-secondary rounded-xl overflow-hidden relative shadow-sm">
                          <img src={s.imageUrl} alt="" className="object-cover w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-black block truncate text-lg">{s.title}</span>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge className={s.source === 'mal' ? 'bg-orange-500' : 'bg-blue-500'}>{s.source.toUpperCase()}</Badge>
                            <span className="text-xs font-black text-primary flex items-center gap-1"><Star className="w-3 h-3 fill-primary" />{s.score}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </header>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-40">
            <Loader2 className="w-20 h-20 animate-spin text-primary" />
            <p className="text-2xl font-black mt-4">Merging Databases...</p>
          </div>
        ) : filteredManhwa.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
            {filteredManhwa.map((manhwa, index) => (
              <ManhwaCard key={`${manhwa.id}-${index}`} manhwa={manhwa} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40 bg-secondary/10 rounded-[40px] border-4 border-dashed border-primary/10">
             <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-6 opacity-20" />
             <h2 className="text-3xl font-black">No Match Found</h2>
          </div>
        )}
      </main>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}