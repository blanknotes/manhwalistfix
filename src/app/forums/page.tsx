
"use client";

import { Navbar } from "@/components/navbar";
import { useCollection, useFirestore } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy } from "firebase/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Bell, Star, TrendingUp, Loader2, ChevronRight, User } from "lucide-react";
import Link from "next/link";

const STATIC_CATEGORIES = [
  { id: "announcements", title: "Updates & Announcements", description: "Official news and updates from ManhwaList.", icon: <Bell className="w-5 h-5" /> },
  { id: "general", title: "General Discussion", description: "Talk about anything related to manhwa and webtoons.", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "recommendations", title: "Recommendations", description: "Looking for something to read? Ask the community here.", icon: <Star className="w-5 h-5" /> }
];

export default function ForumsPage() {
  const db = useFirestore();
  
  const threadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "forumThreads"), orderBy("lastReplyAt", "desc"));
  }, [db]);

  const { data: recentThreads, isLoading } = useCollection(threadsQuery);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 space-y-4">
          <div className="flex items-center gap-3 text-primary">
            <MessageSquare className="w-8 h-8" />
            <span className="text-sm font-black uppercase tracking-widest">Community Hub</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter">ManhwaList Forums</h1>
          <p className="text-muted-foreground font-bold text-lg max-w-2xl">Connect with other readers and discuss your favorite manhwas.</p>
        </header>

        <div className="grid lg:grid-cols-[1fr_350px] gap-10">
          <section className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-2xl font-black px-4">Categories</h2>
              <div className="grid gap-4">
                {STATIC_CATEGORIES.map((cat) => (
                  <Link key={cat.id} href={`/forums/category/${cat.id}`}>
                    <Card className="rounded-[2.5rem] border-none bg-white hover:shadow-xl transition-all group overflow-hidden">
                      <CardContent className="p-8 flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                          {cat.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-black group-hover:text-primary transition-colors">{cat.title}</h3>
                          <p className="text-muted-foreground font-medium line-clamp-1">{cat.description}</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-muted-foreground/30 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                 <h2 className="text-2xl font-black flex items-center gap-2">
                   <TrendingUp className="text-primary" /> Recent Topics
                 </h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
              ) : recentThreads && recentThreads.length > 0 ? (
                <div className="grid gap-3">
                   {recentThreads.slice(0, 10).map((thread) => (
                     <Link key={thread.id} href={`/forums/thread/${thread.id}`}>
                       <div className="bg-white p-5 rounded-3xl flex items-center gap-5 hover:shadow-lg transition-all border border-primary/5 group">
                         <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                           <User className="w-6 h-6 text-primary" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <h4 className="font-black text-lg line-clamp-1 group-hover:text-primary transition-colors">{thread.title}</h4>
                            <p className="text-xs text-muted-foreground font-bold">
                              By {thread.authorName} • {new Date(thread.createdAt).toLocaleDateString()}
                            </p>
                         </div>
                         <div className="bg-primary/5 text-primary px-4 py-1 rounded-full text-xs font-black">
                           {thread.replyCount || 0} replies
                         </div>
                       </div>
                     </Link>
                   ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-4 border-dashed border-primary/10">
                   <p className="font-black text-muted-foreground opacity-50">No active discussions yet.</p>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-primary/5 space-y-6">
              <h3 className="text-xl font-black">Community Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-muted-foreground font-bold">Total Threads</span>
                  <span className="font-black">{recentThreads?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-muted-foreground font-bold">Categories</span>
                  <span className="font-black">3</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
