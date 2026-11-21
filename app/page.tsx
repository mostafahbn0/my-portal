'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Play, 
  Film, 
  Tv, 
  Sparkles, 
  Star, 
  Globe, 
  Flame, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  Zap,
  Clock
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

  // Classifiers
  const isAnimeItem = (m: any) => {
    return (
      m.original_language === 'ja' ||
      (m.title && /(أنمي|انمي|anime|hunter|piece|titan|kaisen|naruto|dragon|bleach|solo|demon|jujutsu)/i.test(m.title))
    );
  };

  const isArabicItem = (m: any) => {
    return (
      (m.original_language === 'ar' || (m.title && /[\u0600-\u06FF]/.test(m.title))) &&
      !isAnimeItem(m)
    );
  };

  const isAsianItem = (m: any) => {
    return (
      (m.original_language === 'ko' || m.original_language === 'zh' || (m.title && /(كوري|اسيوي|korea|drama)/i.test(m.title))) &&
      !isAnimeItem(m)
    );
  };

  // Content Buckets for Sliders
  const heroItem = allMedia[0];
  const netflixList = allMedia.slice(0, 10);
  
  const hollywoodMovies = allMedia.filter(
    (m) => (m.type === 'movie' || m.media_type === 'movie' || (!m.type && !m.media_type)) && !isArabicItem(m) && !isAnimeItem(m)
  );

  const animeList = allMedia.filter((m) => isAnimeItem(m));
  const asianDrama = allMedia.filter((m) => isAsianItem(m));
  const tvSeries = allMedia.filter((m) => (m.type === 'series' || m.type === 'tv') && !isAnimeItem(m));
  const arabicCinema = allMedia.filter((m) => isArabicItem(m));
  const topRated = [...allMedia].sort((a, b) => (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0)).slice(0, 10);

  // Helper Card Component
  const MediaCard = ({ item }: { item: any }) => {
    const poster = item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg');
    return (
      <Link
        href={`/media/${item.id}`}
        className="min-w-[150px] sm:min-w-[180px] max-w-[180px] flex-shrink-0 group bg-[#121218] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 shadow-lg hover:shadow-red-600/20 transition-all duration-300"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
            {isAnimeItem(item) ? 'أنمي' : item.type === 'series' ? 'مسلسل' : 'فيلم'}
          </div>
          <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
          </div>
        </div>
        <div className="p-3 text-right">
          <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">{item.title}</h3>
          <span className="text-[10px] text-gray-400 block mt-1">{item.release_date ? new Date(item.release_date).getFullYear() : '2024'}</span>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24" dir="rtl">
      
      {/* ======================================================== */}
      {/* 1. HERO SPOTLIGHT                                        */}
      {/* ======================================================== */}
      {heroItem && (
        <section className="relative h-[60vh] sm:h-[75vh] w-full overflow-hidden">
          <img
            src={heroItem.backdrop_url || (heroItem.backdrop_path ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}` : heroItem.poster_url)}
            alt={heroItem.title}
            className="w-full h-full object-cover opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/50 to-transparent" />
          <div className="absolute bottom-16 right-6 sm:right-12 max-w-2xl z-10">
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg flex items-center gap-1 w-fit mb-3">
              <Flame className="w-3.5 h-3.5 fill-white" /> الأكثر شهرة وتفضيلاً
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-tight">{heroItem.title}</h1>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-6 max-w-xl">{heroItem.overview}</p>
            <Link
              href={`/media/${heroItem.id}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-600/40 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>شاهد التفاصيل والحلقات</span>
            </Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14 mt-6">

        {/* ======================================================== */}
        {/* SLIDER 1: NETFLIX & TRENDING GLOBAL                      */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">أحدث إصدارات نيتفلكس والعالمية 🍿</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {netflixList.map((m) => <MediaCard key={m.id} item={m} />)}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDER 2: HOLLYWOOD MOVIES (STRICTLY MOVIES)             */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">أقوى أفلام هوليوود السينمائية 🎬</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {hollywoodMovies.slice(0, 10).map((m) => <MediaCard key={m.id} item={m} />)}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: SIDE-BY-SIDE (BANNER + ASIAN DRAMA SLIDER)    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          {/* Side Promo Banner */}
          <div className="lg:col-span-1 rounded-3xl overflow-hidden relative bg-gradient-to-br from-red-950 via-[#181822] to-black p-6 flex flex-col justify-between border border-red-600/30 shadow-2xl">
            <div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">سيرفرات VIP</span>
              <h3 className="text-xl font-black mt-3 leading-snug">تجربة سينمائية فريدة بدقة 4K</h3>
              <p className="text-xs text-gray-400 mt-2">سيرفرات فائقة السرعة، بدون تقطيع وبترجمة حصرية متزامنة.</p>
            </div>
            <a href="https://uplcm.com/4/12311730" target="_blank" rel="noreferrer" className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-center text-xs font-black rounded-xl transition">
              تحميل تطبيق المنصة مجاناً
            </a>
          </div>

          {/* Asian Drama Slider */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">الدراما الآسيوية والكورية 🇰🇷</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {(asianDrama.length > 0 ? asianDrama : allMedia.slice(10, 20)).map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: SIDE-BY-SIDE (RECENT ANIME EPISODES + SLIDER) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Side Widget: Latest Anime Episodes Added */}
          <div className="lg:col-span-1 bg-[#111116] border border-white/10 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-black text-white">أحدث حلقات الأنمي ⚡</h3>
            </div>
            <div className="space-y-3">
              {(animeList.length > 0 ? animeList.slice(0, 5) : allMedia.slice(0, 5)).map((anime, i) => (
                <Link
                  key={anime.id}
                  href={`/media/${anime.id}`}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 hover:border-red-600/30 transition group"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    <span className="text-xs font-bold text-gray-200 group-hover:text-red-400 transition truncate">{anime.title}</span>
                  </div>
                  <span className="text-[10px] font-black bg-red-600/20 text-red-400 px-2 py-0.5 rounded">حلقة جديدة</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Anime Series Main Slider */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">عالم الأنمي الياباني المترجم ⛩️</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {(animeList.length > 0 ? animeList : allMedia.slice(5, 15)).map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDER 3: TV SERIES (GLOBAL)                             */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">المسلسلات والدراما الأجنبية 📺</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {(tvSeries.length > 0 ? tvSeries : allMedia.slice(15, 25)).map((m) => <MediaCard key={m.id} item={m} />)}
          </div>
        </div>

        {/* ======================================================== */}
        {/* RECENTLY ADDED GRID (المضاف حديثاً في الأسفل)            */}
        {/* ======================================================== */}
        <section className="pt-4">
          <div className="flex items-center gap-2 mb-6">
            <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
            <h2 className="text-xl sm:text-2xl font-black">المضاف حديثاً إلى المنصة ⚡</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {allMedia.slice(0, 12).map((item) => (
              <MediaCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* SLIDER 4: ARABIC & EGYPTIAN CINEMA                       */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">السينما العربية والمصرية 🇪🇬</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {(arabicCinema.length > 0 ? arabicCinema : allMedia.slice(0, 10)).map((m) => <MediaCard key={m.id} item={m} />)}
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDER 5: TOP RATED OF ALL TIME                          */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">الأعلى تقييماً عبر التاريخ 🏆</h2>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
            {topRated.map((m) => <MediaCard key={m.id} item={m} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
