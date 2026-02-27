
"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy, where, addDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Plus, Loader2, ArrowLeft, MessageSquare, User, Calendar, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { adminDb } from '@/lib/firebase-admin';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [newThreadTitle, setNewThreadTitle] = useState("");
  const [newThreadContent, setNewThreadContent] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const threadsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "forumThreads"), 
      where("categoryId", "==", id),
      orderBy("lastReplyAt", "desc")
    );
  }, [db, id]);

  const { data: threads, isLoading } = useCollection(threadsQuery);

  const handleCreateThread = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Sign in required", description: "You must be logged in to start a discussion." });
      return;
    }
    if (!newThreadTitle.trim() || !newThreadContent.trim()) return;

    setIsCreating(true);
    try {
      const threadsRef = collection(db, "forumThreads");
      const timestamp = new Date().toISOString();
      await addDoc(threadsRef, {
        title: newThreadTitle,
        content: newThreadContent,
        categoryId: id,
        authorId: user.uid,
        authorName: user.email?.split('@')[0] || "Anonymous",
        createdAt: timestamp,
        lastReplyAt: timestamp,
        replyCount: 0
      });
      setNewThreadTitle("");
      setNewThreadContent("");
      toast({ title: "Thread Created!", description: "Your new topic is now live." });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteThread = async (docId: string, authorId: string) => {
    if (!user) return;
    
    // Konfirmasi sebelum hapus
    if (!confirm("Are you sure you want to delete this thread?")) return;
  
    try {
      const res = await fetch('/api/forum/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docId: docId,
          collectionName: 'forumThreads',
          authorId: authorId // Ini penting untuk divalidasi oleh API Route kamu
        }),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        toast({ title: "Success", description: "Thread deleted successfully." });
        // Halaman akan otomatis update karena useCollection bersifat real-time
      } else {
        toast({ variant: "destructive", title: "Error", description: data.error });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to delete thread." });
    }
  };

  const categoryName = id.charAt(0).toUpperCase() + id.slice(1);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <header className="mb-12 space-y-6">
          <Button variant="ghost" onClick={() => router.push("/forums")} className="font-black text-primary hover:bg-primary/5 rounded-full">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Forums
          </Button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl font-black tracking-tighter">{categoryName} Discussion</h1>
              <p className="text-muted-foreground font-bold text-lg">Discuss all things related to {categoryName}.</p>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button className="h-14 px-8 rounded-2xl font-black text-lg shadow-xl shadow-primary/20">
                  <Plus className="w-5 h-5 mr-2" /> Start New Thread
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2.5rem] p-10 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-black mb-6">Create New Discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <p className="font-black text-sm uppercase text-primary tracking-widest">Topic Title</p>
                    <Input 
                      placeholder="Give your topic a clear title" 
                      className="h-14 rounded-2xl bg-secondary/30 border-none font-bold text-lg"
                      value={newThreadTitle}
                      onChange={(e) => setNewThreadTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="font-black text-sm uppercase text-primary tracking-widest">Content</p>
                    <Textarea 
                      placeholder="Describe what you want to discuss..." 
                      className="min-h-[200px] rounded-2xl bg-secondary/30 border-none font-bold text-lg p-6"
                      value={newThreadContent}
                      onChange={(e) => setNewThreadContent(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-3">
                    <Button onClick={handleCreateThread} disabled={isCreating || !newThreadTitle.trim() || !newThreadContent.trim()} className="h-14 rounded-2xl font-black text-lg">
                      {isCreating ? <Loader2 className="animate-spin" /> : "Post Thread"}
                    </Button>
                    <DialogClose asChild>
                      <Button variant="ghost" className="font-bold">Cancel</Button>
                    </DialogClose>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="w-16 h-16 animate-spin text-primary" />
            </div>
          ) : threads && threads.length > 0 ? (
            threads.map((thread) => (
              <div key={thread.id} className="relative group"> 
                {/* Tombol Hapus - Hanya muncul untuk pemilik */}
                {user && user.uid === thread.authorId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-12 top-1/2 -translate-y-1/2 z-20 text-destructive hover:bg-destructive/10 rounded-full"
                    onClick={(e) => {
                      e.preventDefault();    // Stop Link agar tidak pindah halaman
                      e.stopPropagation();   // Stop klik tembus ke kartu
                      handleDeleteThread(thread.id, thread.authorId);
                    }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
            
                {/* Tampilan Kartu Asli kamu */}
                <Link href={`/forums/thread/${thread.id}`}>
                  <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-primary/20 hover:shadow-2xl transition-all flex items-center gap-6">
                      <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-secondary/50 group-hover:bg-primary group-hover:text-white transition-all">
                        <MessageSquare className="w-6 h-6" />
                        <span className="text-[10px] font-black uppercase">{thread.replyCount || 0}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-black line-clamp-1 group-hover:text-primary transition-colors">{thread.title}</h2>
                        <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm font-bold">
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {thread.authorName}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" /> {new Date(thread.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="text-center py-40 bg-secondary/10 rounded-[4rem] border-4 border-dashed border-primary/10">
               <MessageSquare className="w-16 h-16 text-primary/20 mx-auto mb-6" />
               <h3 className="text-2xl font-black">No discussions yet</h3>
               <p className="text-muted-foreground font-bold">Be the first to start a conversation!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
