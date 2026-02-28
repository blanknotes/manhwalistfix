"use client";

import { use, useState } from "react";
import { Navbar } from "@/components/navbar";
import { useDoc, useCollection, useFirestore, useUser, useAuth } from "@/firebase";
import { useMemoFirebase } from "@/firebase/provider";
import { collection, query, orderBy, doc, addDoc, updateDoc, increment } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, Send, User, Calendar, MessageSquare, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const threadQuery = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, "forumThreads", id);
  }, [db, id]);

  const commentsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "forumThreads", id, "comments"), orderBy("createdAt", "asc"));
  }, [db, id]);

  const { data: thread, isLoading: isThreadLoading } = useDoc(threadQuery);
  const { data: comments, isLoading: isCommentsLoading } = useCollection(commentsQuery);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: "destructive", title: "Sign in required", description: "Log in to join the discussion." });
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const timestamp = new Date().toISOString();
      const commentsRef = collection(db, "forumThreads", id, "comments");
      await addDoc(commentsRef, {
        text: newComment,
        authorId: user.uid,
        authorName: user.email?.split('@')[0] || "Anonymous",
        createdAt: timestamp
      });

      const threadRef = doc(db, "forumThreads", id);
      await updateDoc(threadRef, {
        replyCount: increment(1),
        lastReplyAt: timestamp
      });

      setNewComment("");
      toast({ title: "Comment posted", description: "Your reply has been added." });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteThread = async () => {
    if (!thread || !user) return;
    setIsDeleting(true);
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/forum/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          docId: id,
          collectionName: 'forumThreads',
          authorId: thread.authorId
        })
      });

      if (!response.ok) throw new Error('Failed to delete thread');

      toast({ title: "Thread Deleted", description: "The discussion has been removed." });
      router.push("/forums");
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string, authorId: string) => {
    if (!user) return;
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/forum/delete', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          docId: commentId,
          collectionName: `forumThreads/${id}/comments`,
          authorId: authorId
        })
      });

      if (!response.ok) throw new Error('Failed to delete comment');

      const threadRef = doc(db, "forumThreads", id);
      await updateDoc(threadRef, {
        replyCount: increment(-1)
      });
      
      toast({ title: "Comment Deleted", description: "Your reply has been removed." });
      window.location.reload();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (isThreadLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-black">Thread Not Found</h2>
          <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const isThreadAuthor = user?.uid === thread.authorId;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-8 font-black text-primary hover:bg-primary/5 rounded-full">
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>

        <article className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-primary/5 mb-8 relative group">
          {isThreadAuthor && (
            <div className="absolute top-8 right-8">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 rounded-full">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-black">Delete Thread?</AlertDialogTitle>
                    <AlertDialogDescription>This action cannot be undone. All comments will also be inaccessible.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteThread(); }} className="rounded-xl font-bold bg-destructive text-destructive-foreground">
                      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          <header className="mb-8 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight pr-12">{thread.title}</h1>
            <div className="flex items-center gap-6 text-muted-foreground font-bold text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" /> {thread.authorName}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {new Date(thread.createdAt).toLocaleDateString()}
              </div>
            </div>
          </header>
          <div className="text-xl leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
            {thread.content}
          </div>
        </article>

        <section className="space-y-6 mb-12">
          <h2 className="text-2xl font-black flex items-center gap-3 px-4">
            <MessageSquare className="w-6 h-6 text-primary" />
            Replies ({thread.replyCount || 0})
          </h2>

          {isCommentsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : comments && comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={comment.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-primary/5 flex gap-6 group relative">
                <div className="hidden sm:block">
                  <Avatar className="w-12 h-12 rounded-2xl">
                    <AvatarImage src={`https://picsum.photos/seed/${comment.authorId}/200`} />
                    <AvatarFallback className="bg-primary text-white font-black">{comment.authorName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="font-black text-primary text-lg">{comment.authorName}</span>
                     <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase font-black opacity-30">#{index + 1}</span>
                        {user?.uid === comment.authorId && (
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                 <Trash2 className="w-4 h-4" />
                               </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent className="rounded-3xl">
                               <AlertDialogHeader>
                                 <AlertDialogTitle className="font-black">Delete Comment?</AlertDialogTitle>
                                 <AlertDialogDescription>Remove your reply from this discussion.</AlertDialogDescription>
                               </AlertDialogHeader>
                               <AlertDialogFooter>
                                 <AlertDialogCancel className="rounded-xl font-bold">Cancel</AlertDialogCancel>
                                 <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDeleteComment(comment.id, comment.authorId); }} className="rounded-xl font-bold bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                               </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                        )}
                     </div>
                  </div>
                  <p className="text-lg leading-relaxed text-muted-foreground font-medium whitespace-pre-wrap">
                    {comment.text}
                  </p>
                  <div className="pt-4 border-t border-dashed border-primary/10 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-4 border-dashed border-primary/10">
               <p className="font-black text-muted-foreground opacity-50">Be the first to share your thoughts!</p>
            </div>
          )}
        </section>

        <section className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-primary/10">
           <h3 className="text-2xl font-black mb-6">Join the Discussion</h3>
           <form onSubmit={handlePostComment} className="space-y-4">
              <Textarea 
                placeholder="Write your reply here..." 
                className="min-h-[150px] rounded-2xl bg-secondary/20 border-none p-6 font-medium text-lg focus-visible:ring-primary"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  disabled={isSubmitting || !newComment.trim()} 
                  className="h-14 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/30"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                  Post Reply
                </Button>
              </div>
           </form>
        </section>
      </main>
    </div>
  );
}