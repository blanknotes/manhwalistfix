"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { type UnifiedManhwa } from "@/lib/unified-manhwa";

interface Props {
  manhwa: UnifiedManhwa;
  showRank?: boolean;
  variant?: "grid" | "list";
}

export function ManhwaCard({ manhwa, showRank, variant = "list" }: Props) {
  // DESAIN LIST (UNTUK RANKING)
  if (variant === "list") {
    return (
      <Link href={`/manhwa/${manhwa.id}`} className="group block w-full">
        <div className="flex items-center gap-6 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-black/5 hover:border-primary/20 hover:shadow-2xl transition-all duration-500">
          <div className="w-12 text-center flex-shrink-0">
            <span className="text-4xl font-black text-primary/10 group-hover:text-primary transition-colors italic">
              {manhwa.rank}
            </span>
          </div>
          <div className="relative w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
            <Image src={manhwa.imageUrl} alt={manhwa.title} fill className="object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/10 border-none font-bold uppercase text-[10px]">
                {manhwa.genres[0]}
              </Badge>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-black text-sm">{manhwa.score}</span>
              </div>
            </div>
            <h3 className="text-2xl font-black truncate group-hover:text-primary transition-colors tracking-tight">
              {manhwa.title}
            </h3>
            <p className="text-sm opacity-50 line-clamp-2 mt-1 font-medium">{manhwa.synopsis}</p>
          </div>
          <div className="p-4 bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-all">
            <ChevronRight className="w-6 h-6 text-primary" />
          </div>
        </div>
      </Link>
    );
  }

  // DESAIN GRID (UNTUK GENRE)
  return (
    <Link href={`/manhwa/${manhwa.id}`} className="group block h-full">
      <div className="flex flex-col h-full bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border border-black/5 hover:shadow-xl transition-all">
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image src={manhwa.imageUrl} alt={manhwa.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-black">{manhwa.score}</span>
          </div>
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem] leading-tight mb-2 group-hover:text-primary">
            {manhwa.title}
          </h3>
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase text-primary border-primary/20">
            {manhwa.status}
          </Badge>
        </div>
      </div>
    </Link>
  );
}