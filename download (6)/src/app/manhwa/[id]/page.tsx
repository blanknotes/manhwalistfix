"use client";

import { use, useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import Image from "next/image";
import { Star, Loader2, ExternalLink, BookmarkPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getUnifiedDetail } from "@/lib/manhwa-service";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";
import { useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";

export default function ManhwaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [manhwa, setManhwa] = useState<UnifiedManhwa | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();
  const db = useFirestore();

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      try {
        const data = await getUnifiedDetail(id);
        setManhwa(data);
      } catch (err) {
        console.error("Failed to load detail:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  const handleStatusChange = (status: string) => {
    if (!user || !manhwa) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please log in to save manhwa to your list.",
      });
      return;
    }

    const entryRef = doc(db, 'users', user.uid, 'readingLists', 'default', 'entries', manhwa.id);
    
    setDocumentNonBlocking(entryRef, {
      manhwaId: manhwa.id,
      title: manhwa.title,
      coverImageUrl: manhwa.imageUrl,
      status: status,
      score: manhwa.score || 0,
      updatedAt: new Date().toISOString(),
      userId: user.uid,
      source: manhwa.source
    }, { merge: true });

    toast({
      title: "List Updated",
      description: `"${manhwa.title}" is now marked as ${status}.`,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!manhwa) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
          <h2 className="text-3xl font-black opacity-30">Manhwa Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4 rounded-full">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-[1200px]">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black text-primary hover:bg-primary/10">
          <ArrowLeft className="w-5 h-5 mr-2" /> Kembali
        </Button>

        <div className="grid md:grid-cols-[320px_1fr] gap-10">
          {/* Sisi Kiri: Poster & Aksi */}
          <aside className="space-y-6">
            <div className="relative aspect-[2/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-zinc-900 bg-secondary">
              <Image 
                src={manhwa.imageUrl || 'https://placehold.co/400x600'} 
                alt={manhwa.title} 
                fill 
                className="object-cover" 
                priority
              />
              <div className="absolute top-4 right-4">
                 <Badge className="bg-blue-600 font-black">MAL</Badge>
              </div>
            </div>
            
            <Card className="border-none bg-secondary/30 rounded-[2.5rem]">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Score</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                      <span className="text-3xl font-black">{manhwa.score || "N/A"}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Status</p>
                    <p className="text-lg font-bold text-primary">{manhwa.status}</p>
                  </div>
                </div>
                
                <Select onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-full bg-primary text-primary-foreground h-14 rounded-2xl font-bold shadow-lg border-none hover:opacity-90 transition-opacity">
                    <BookmarkPlus className="w-5 h-5 mr-2" />
                    <SelectValue placeholder="Save to List" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    <SelectItem value="Currently Reading" className="font-bold">Currently Reading</SelectItem>
                    <SelectItem value="Completed" className="font-bold">Completed</SelectItem>
                    <SelectItem value="Plan to Read" className="font-bold">Plan to Read</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full h-12 rounded-2xl font-bold border-2" onClick={() => {
              window.open(`https://myanimelist.net/manga/${manhwa.id}`, '_blank');
            }}>
              <ExternalLink className="w-4 h-4 mr-2" /> View on MyAnimeList
            </Button>
          </aside>

          {/* Sisi Kanan: Detail Tulisan */}
          <section className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {manhwa.genres.map(genre => (
                  <Badge key={genre} variant="secondary" className="px-4 py-1.5 rounded-full font-bold bg-primary/5 text-primary border border-primary/10">
                    {genre}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-tight text-balance">
                {manhwa.title}
              </h1>
            </div>

            <Tabs defaultValue="synopsis" className="w-full">
              <TabsList className="bg-secondary/40 p-1.5 h-16 w-full md:w-fit justify-start rounded-[2rem] mb-8">
                <TabsTrigger value="synopsis" className="rounded-3xl px-10 h-full font-black text-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Synopsis</TabsTrigger>
                <TabsTrigger value="info" className="rounded-3xl px-10 h-full font-black text-lg data-[state=active]:bg-white data-[state=active]:shadow-md">Info</TabsTrigger>
              </TabsList>
              
              <TabsContent value="synopsis" className="mt-0">
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-[2.5rem] p-8 md:p-12 border border-primary/5 shadow-inner">
                  <p className="text-xl md:text-2xl leading-relaxed text-muted-foreground font-medium">
                    {manhwa.synopsis}
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="info" className="mt-0">
                <div className="bg-white/50 dark:bg-zinc-900/50 p-10 rounded-[2.5rem] grid sm:grid-cols-2 gap-12 border border-primary/5">
                   <div className="space-y-1">
                     <p className="text-xs font-black text-primary uppercase tracking-widest">Authors</p>
                     <p className="text-2xl font-bold">
                       {/* Perbaikan Keamanan: authors dipastikan array */}
                       {Array.isArray(manhwa.authors) && manhwa.authors.length > 0 
                         ? manhwa.authors.join(", ") 
                         : "Unknown Author"}
                     </p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-xs font-black text-primary uppercase tracking-widest">Global Rank</p>
                     <p className="text-2xl font-bold">#{manhwa.rank || "N/A"}</p>
                   </div>
                   <div className="space-y-1">
                     <p className="text-xs font-black text-primary uppercase tracking-widest">Source</p>
                     <p className="text-2xl font-bold uppercase">{manhwa.source}</p>
                   </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
    </div>
  );
}