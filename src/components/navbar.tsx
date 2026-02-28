
"use client";

import Link from "next/link";
import { Search, Sparkles, Trophy, LayoutGrid, Bookmark, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { searchManhwa, type MALManhwa } from "@/lib/mal-api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [navSearchQuery, setNavSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MALManhwa[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (navSearchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchManhwa(navSearchQuery);
      setSuggestions(results.slice(0, 5));
    }, 300);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [navSearchQuery]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery("");
      setShowSuggestions(false);
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full border-b bg-white/95 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-8">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex-shrink-0">
            Manhwa<span className="text-primary">List</span>
          </Link>
          
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/ranking" className="text-sm font-black flex items-center gap-2 hover:text-primary transition-colors">
              <Trophy className="w-4 h-4" />
              Ranking
            </Link>
            <Link href="/genres" className="text-sm font-black flex items-center gap-2 hover:text-primary transition-colors">
              <LayoutGrid className="w-4 h-4" />
              Genres
            </Link>
            <Link href="/forums" className="text-sm font-black flex items-center gap-2 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" />
              Forums
            </Link>
            <Link href="/recommendations" className="text-sm font-black flex items-center gap-2 hover:text-primary transition-colors">
              <Sparkles className="w-4 h-4" />
              AI Recs
            </Link>
          </nav>
        </div>

        <div className="flex-1 max-w-xl relative hidden md:block" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Instant search..." 
              className="pl-11 bg-secondary/30 border-none focus-visible:ring-2 focus-visible:ring-primary h-11 rounded-2xl font-bold"
              value={navSearchQuery}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setNavSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
            />
          </form>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-[2rem] shadow-2xl border border-primary/5 z-[110] overflow-hidden">
              <ScrollArea className="max-h-80">
                <div className="p-3">
                  {suggestions.map((s) => (
                    <button
                      key={s.mal_id}
                      onClick={() => {
                        setNavSearchQuery("");
                        setShowSuggestions(false);
                        router.push(`/manhwa/mal-${s.mal_id}`);
                      }}
                      className="w-full p-3 text-left hover:bg-primary/5 rounded-2xl flex items-center gap-4 transition-all group"
                    >
                      <div className="w-10 h-14 bg-secondary rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={s.images?.webp?.image_url} alt="" className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-black block truncate text-sm group-hover:text-primary">{s.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex items-center gap-5">
          <Link href="/profile" className="text-muted-foreground hover:text-primary transition-colors hidden sm:block">
            <Bookmark className="w-6 h-6" />
          </Link>

          {user ? (
            <Button variant="ghost" className="relative h-11 w-11 rounded-[1.2rem] p-0 overflow-hidden" asChild>
              <Link href="/profile">
                <Avatar className="h-full w-full rounded-none">
                  <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200`} alt={user.email || ""} />
                  <AvatarFallback className="font-black bg-primary text-primary-foreground">
                    {user.email?.[0].toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          ) : (
            <Button className="rounded-2xl font-black px-6 h-11" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
