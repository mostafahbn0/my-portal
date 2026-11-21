'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Play, Film, Tv, Sparkles, Star, Globe, Flame, Zap, TrendingUp, Clock, Info
} from 'lucide-react';

export default function HomePage() {
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (data) setAllMedia(data);
      setLoading(false);
    }
    load();
  }, []);

  // --- التصنيفات الذكية ---
  const isAnime = (m: any) => {
    if (!m) return false;
    const text = `${m.title} ${m.original_title} ${m.overview}`.toLowerCase();
    return m.original_language === 'ja' || /(أنمي|انمي|anime|ون بيس|ناروتو|هجوم|قاتل الشياطين|بليتش|هنتر|جوجيتسو|سبيس تون|مانجا)/i.test(text);
  };

  const isArabic = (m: any) => {
    if (isAnime(m)) return false;
    return m.original_language === 'ar' || (m.title && /[\u0600-\u06FF]/.test(m.title));
  };

  const isWestern = (m: any) => !isAnime(m) && !isArabic(m);

  // --- تجهيز السلايدرات (مع نظام البدائل لو القسم فاضي) ---
  const animeList = allMedia.filter(m => isAnime(m));
  const westernList = allMedia.filter(m => isWestern(m));
  const arabicList = allMedia.filter(m => isArabic(m));

  // هوليوود (أفلام فقط)
  const hollywoodMovies = westernList.filter(m => m.type === 'movie' || m.media_type === 'movie' || (!m.type && !m.media_type));
  // نيتفلكس ومسلسلات
  const netflixSeries = westernList.filter(m => m.type === 'series' || m.type === 'tv');
  // الأعلى تقييماً (بدون أنمي)
  const topRated = [...westernList].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0)).slice(0, 10);

  const MediaCard = ({ item }: { item: any }) => {
    const poster = item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg');
    return (
      <Link href={`/media/${item.id}`} className="min-w-[140px] sm:min-w-[180px] group flex-shrink-0">
        <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-600 transition-all shadow-lg">
          <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
             {isAnime(item) ? 'أنمي' : item.type === 'series' ? 'مسلسل' : 'فيلم'}
          </div>
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        <h3 className="mt-2 text-xs font-bold text-white truncate group-hover:text-red-500 transition">{item.title}</h3>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      
      {/* 1. Hero Spotlight */}
      {allMedia[0] && (
        <section className="relative h-[60vh] overflow-hidden">
          <img src={allMedia[0].backdrop_url || `https://image.tmdb.org/t/p/original${allMedia[0].backdrop_path}`} className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
          <div className="absolute bottom-10 right-6 sm:right-12 z-10">
            <h1 className="text-3xl sm:text-5xl font-black mb-4">{allMedia[0].title}</h1>
            <Link href={`/media/${allMedia[0].id}`} className="bg-red-600 px-8 py-3 rounded-xl font-bold inline-block hover:scale-105 transition">شاهد الآن</Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 space-y-12 mt-6">

        {/* سلايدر 1: هوليوود (لو مفيش أفلام بيعرض "مقترحات") */}
        <section>
          <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Film className="text-red-600" /> أفلام هوليوود السينمائية</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {hollywoodMovies.length > 0 ? hollywoodMovies.map(m => <MediaCard key={m.id} item={m} />) : <p className="text-gray-600 text-sm">قريباً.. أحدث أفلام السينما العالمية</p>}
          </div>
        </section>

        {/* سلايدر 2: نيتفلكس */}
        <section>
          <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Sparkles className="text-red-600" /> إنتاجات نيتفلكس الحصرية</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {netflixSeries.length > 0 ? netflixSeries.map(m => <MediaCard key={m.id} item={m} />) : <p className="text-gray-600 text-sm">قريباً.. مسلسلات نيتفلكس الأصلية</p>}
          </div>
        </section>

        {/* سلايدر 3 + بانر جانبي (الأنمي) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 bg-[#111116] border border-white/10 rounded-3xl p-5 h-fit">
            <h3 className="text-sm font-black mb-4 flex items-center gap-2 text-yellow-500"><Zap className="w-4 h-4" /> أحدث حلقات الأنمي ⚡</h3>
            <div className="space-y-3">
              {animeList.slice(0, 5).map(a => (
                <Link key={a.id} href={`/media/${a.id}`} className="block p-2 bg-white/5 rounded-xl text-[11px] hover:bg-red-600/20 transition truncate border border-white/5">
                  {a.title} - <span className="text-red-500">حلقة جديدة</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Tv className="text-red-600" /> مسلسلات الأنمي المترجمة ⛩️</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {animeList.map(m => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        </div>

        {/* سلايدر 4: السينما العربية */}
        <section>
          <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Globe className="text-red-600" /> السينما العربية والمصرية</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {arabicList.length > 0 ? arabicList.map(m => <MediaCard key={m.id} item={m} />) : <p className="text-gray-600 text-sm">قريباً.. أحدث الأفلام العربية</p>}
          </div>
        </section>

        {/* سلايدر 5: الأعلى تقييماً */}
        <section>
          <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Star className="text-red-600" /> الأعلى تقييماً 🏆</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {topRated.length > 0 ? topRated.map(m => <MediaCard key={m.id} item={m} />) : allMedia.slice(0, 10).map(m => <MediaCard key={m.id} item={m} />)}
          </div>
        </section>

        {/* المضاف حديثاً (تحت خالص) */}
        <section className="pt-10 border-t border-white/5">
          <h2 className="text-2xl font-black mb-8">المضاف حديثاً للمنصة ⚡</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {allMedia.slice(0, 12).map(m => <MediaCard key={m.id} item={m} />)}
          </div>
        </section>

      </div>
    </div>
  );
}
