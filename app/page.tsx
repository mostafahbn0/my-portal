'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Play, Film, Tv, Sparkles, Star, Globe, Flame, Zap } from 'lucide-react';

export default function HomePage() {
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (data) setAllMedia(data);
      setLoading(false);
    }
    load();
  }, []);

  // الفلتر الحديدي للأنمي
  const isAnime = (m: any) => {
    const text = `${m.title} ${m.original_title}`.toLowerCase();
    return m.original_language === 'ja' || /(أنمي|انمي|anime|one piece|naruto|titan|hunter|bleach|kaisen|solo)/i.test(text);
  };

  const isArabic = (m: any) => !isAnime(m) && (m.original_language === 'ar' || /[\u0600-\u06FF]/.test(m.title));
  
  // تصفية المحتوى (بناء السلايدرات)
  const animeList = allMedia.filter(m => isAnime(m));
  const hollywoodMovies = allMedia.filter(m => !isAnime(m) && !isArabic(m) && (m.type === 'movie' || !m.type));
  const netflixSeries = allMedia.filter(m => !isAnime(m) && !isArabic(m) && (m.type === 'series' || m.type === 'tv'));
  const arabicCinema = allMedia.filter(m => isArabic(m));

  const MediaCard = ({ item }: { item: any }) => (
    <Link href={`/media/${item.id}`} className="min-w-[150px] sm:min-w-[180px] group flex-shrink-0">
      <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-600 transition shadow-lg">
        <img src={item.poster_url || `https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition" />
        <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
           {isAnime(item) ? 'أنمي' : item.type === 'series' ? 'مسلسل' : 'فيلم'}
        </div>
      </div>
      <h3 className="mt-2 text-xs font-bold text-white truncate group-hover:text-red-500 transition">{item.title}</h3>
    </Link>
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      {/* 1. Hero */}
      {allMedia.find(m => !isAnime(m)) && (
        <section className="relative h-[60vh]">
          <img src={allMedia.find(m => !isAnime(m)).backdrop_url || `https://image.tmdb.org/t/p/original${allMedia.find(m => !isAnime(m)).backdrop_path}`} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
          <div className="absolute bottom-10 right-10 z-10">
            <h1 className="text-4xl font-black mb-4">{allMedia.find(m => !isAnime(m)).title}</h1>
            <Link href={`/media/${allMedia.find(m => !isAnime(m)).id}`} className="bg-red-600 px-8 py-3 rounded-xl font-bold">شاهد الآن</Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 space-y-12 mt-8">
        {/* هوليوود - لن يعرض أنمي أبداً */}
        {hollywoodMovies.length > 0 && (
          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Film className="text-red-600" /> أفلام هوليوود</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {hollywoodMovies.map(m => <MediaCard key={m.id} item={m} />)}
            </div>
          </section>
        )}

        {/* نيتفلكس - لن يعرض أنمي أبداً */}
        {netflixSeries.length > 0 && (
          <section>
            <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Sparkles className="text-red-600" /> مسلسلات نيتفلكس</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {netflixSeries.map(m => <MediaCard key={m.id} item={m} />)}
            </div>
          </section>
        )}

        {/* قسم الأنمي + بانر جانبي */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-[#111116] border border-white/10 rounded-3xl p-5 h-fit">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-yellow-500"><Zap className="w-4 h-4" /> أحدث حلقات الأنمي ⚡</h3>
            <div className="space-y-3">
              {animeList.slice(0, 5).map(a => (
                <Link key={a.id} href={`/media/${a.id}`} className="block p-2 bg-white/5 rounded-xl text-[11px] hover:bg-red-600/10 transition border border-white/5 truncate">
                  {a.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Tv className="text-red-600" /> مسلسلات الأنمي</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {animeList.map(m => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        </div>

        {/* المضاف حديثاً - الكل */}
        <section className="pt-10 border-t border-white/5">
          <h2 className="text-2xl font-black mb-6">المضاف حديثاً ⚡</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {allMedia.slice(0, 12).map(m => <MediaCard key={m.id} item={m} />)}
          </div>
        </section>
      </div>
    </div>
  );
}
