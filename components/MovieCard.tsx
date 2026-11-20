import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import { getMediaPoster, getMediaYear, getMediaRating } from '@/lib/utils';

export default function MovieCard({ item }: { item: any }) {
  if (!item || !item.id) return null;

  const poster = getMediaPoster(item);
  const year = getMediaYear(item);
  const rating = getMediaRating(item);

  const realTitle = item.original_title || item.title || 'عمل سينمائي';
  const arabicTitle = item.title && item.title !== realTitle ? item.title : null;

  return (
    <Link 
      href={`/watch/${item.id}`} 
      className="group relative flex flex-col bg-[#121318] rounded-xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-600/10 hover:-translate-y-1.5"
    >
      <div className="relative w-full aspect-[2/3] bg-[#1a1c23] overflow-hidden">
        <img 
          src={poster} 
          alt={realTitle}
          className="poster-box group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#121318] via-transparent to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

        {Number(rating) > 0 && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-xs font-bold text-yellow-400">
            <Star className="w-3 h-3 fill-yellow-400" />
            <span>{rating}</span>
          </div>
        )}

        <div className="absolute top-2.5 left-2.5 bg-red-600/90 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
          WEB-DL
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/50 scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {year && (
          <div className="absolute bottom-2 left-2 text-[11px] font-semibold text-gray-300 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded">
            {year}
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col justify-between flex-1 gap-1">
        <h3 
          className="text-white font-bold text-sm line-clamp-1 group-hover:text-red-500 transition-colors" 
          dir="ltr"
          style={{ textAlign: 'right' }}
          title={realTitle}
        >
          {realTitle}
        </h3>

        {arabicTitle && (
          <p className="text-gray-400 text-xs line-clamp-1" title={arabicTitle}>
            {arabicTitle}
          </p>
        )}
      </div>
    </Link>
  );
}
