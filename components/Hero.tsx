import Link from 'next/link';
import { Play, Info, Star } from 'lucide-react';
import { getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function Hero({ item }: { item?: any }) {
  if (!item || !item.id) {
    return (
      <div className="relative w-full h-[55vh] md:h-[70vh] bg-[#0c0d12] flex items-center justify-center border-b border-white/5">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-4xl font-black text-white">سينما بلاس</h1>
          <p className="text-gray-400 text-sm">أقوى الأفلام والمسلسلات الحصرية بأعلى دقة</p>
        </div>
      </div>
    );
  }

  const backdrop = getMediaBackdrop(item);
  const realTitle = item.original_title || item.title || 'عمل مميز';
  const arabicTitle = item.title && item.title !== realTitle ? item.title : null;
  const year = getMediaYear(item);
  const rating = getMediaRating(item);

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] bg-[#08080a] overflow-hidden">
      <img
        src={backdrop}
        alt={realTitle}
        className="w-full h-full object-cover object-center filter brightness-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-transparent to-transparent" />

      <div className="absolute bottom-12 right-0 left-0 max-w-7xl mx-auto px-4 sm:px-6 space-y-4">
        <div className="flex items-center gap-3 text-xs md:text-sm text-gray-300">
          {Number(rating) > 0 && (
            <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded font-bold border border-yellow-500/30">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{rating}</span>
            </div>
          )}
          {year && <span className="bg-white/10 px-2 py-0.5 rounded">{year}</span>}
          <span className="bg-red-600/80 text-white px-2 py-0.5 rounded font-bold">حصرياً</span>
        </div>

        <div>
          <h1 className="text-3xl md:text-6xl font-black text-white max-w-2xl leading-tight" dir="ltr" style={{ textAlign: 'right' }}>
            {realTitle}
          </h1>
          {arabicTitle && (
            <p className="text-xl md:text-2xl text-red-500 font-bold mt-1">
              {arabicTitle}
            </p>
          )}
        </div>

        <p className="text-gray-300 text-xs md:text-sm max-w-xl line-clamp-2 md:line-clamp-3">
          {item.overview || 'مشاهدة وتحميل بأعلى دقة متوفرة مع سيرفرات سريعة حصرياً على سينما بلاس.'}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/watch/${item.id}`}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-red-600/30 hover:scale-105"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>مشاهدة الآن</span>
          </Link>

          <Link
            href={`/watch/${item.id}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-3 rounded-xl border border-white/10 transition-all"
          >
            <Info className="w-5 h-5" />
            <span>التفاصيل</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
