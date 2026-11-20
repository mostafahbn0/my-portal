import Link from 'next/link';
import { getMediaPoster, getMediaRating } from '@/lib/utils';
import { Star } from 'lucide-react';

export default function Top10Slider({ items = [] }: { items: any[] }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  const topItems = items.slice(0, 10);

  return (
    <section className="my-10">
      <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 mb-4">
        <span className="w-1.5 h-5 bg-red-600 rounded-full" />
        <span>أفضل 10 أعمال اليوم 🔥</span>
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none scroll-smooth">
        {topItems.map((item, index) => {
          if (!item || !item.id) return null;
          const poster = getMediaPoster(item);
          const realTitle = item.original_title || item.title || 'عمل مميز';
          const rating = getMediaRating(item);

          return (
            <Link
              key={item.id}
              href={`/watch/${item.id}`}
              className="relative flex-shrink-0 w-36 sm:w-44 group"
            >
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#181a20] border border-white/5 group-hover:border-red-600/50 transition-all">
                <img 
                  src={poster} 
                  alt={realTitle}
                  className="poster-box group-hover:scale-105 transition-transform duration-300" 
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {Number(rating) > 0 && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[11px] font-bold text-yellow-400">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    <span>{rating}</span>
                  </div>
                )}
              </div>

              {/* رقم الترتيب النيتفلكسي العملاق */}
              <span className="absolute -bottom-3 -right-2 text-6xl sm:text-7xl font-black text-black select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(220,38,38,0.8)] font-sans">
                {index + 1}
              </span>

              <p className="text-white text-xs font-bold mt-2 truncate group-hover:text-red-500 transition-colors" dir="ltr" style={{ textAlign: 'right' }}>
                {realTitle}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
