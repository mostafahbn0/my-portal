'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Play, Film, Tv, Sparkles, Star, Globe, Flame } from 'lucide-react';

export default function HomePage() {
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'movies' | 'anime' | 'arabic' | 'series'>('all');
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

  // Helper Classification
  const isAnimeItem = (item: any) => {
    return (
      item.original_language === 'ja' ||
      (item.title && /(أنمي|انمي|anime|hunter|piece|titan|kaisen|naruto|dragon|bleach|solo|jujutsu|demon|death|hero)/i.test(item.title))
    );
  };

  const isArabicItem = (item: any) => {
    return (
      (item.original_language === 'ar' || (item.title && /[\u0600-\u06FF]/.test(item.title))) &&
      !isAnimeItem(item)
    );
  };

  // 1. Hollywood Movies (Pure Western/Global Movies)
  const hollywoodMovies = allMedia.filter(
    (m) => (m.type === 'movie' || m.media_type === 'movie' || (!m.type && !m.media_type)) && !isArabicItem(m) && !isAnimeItem(m)
  );

  // 2. Anime Series
  const animeList = allMedia.filter((m) => isAnimeItem(m));

  // 3. Arabic & Egyptian Cinema
  const arabicCinema = allMedia.filter((m) => isArabicItem(m));

  // 4. Regular TV Series (Western/Global)
  const tvSeries = allMedia.filter(
    (m) => (m.type === 'series' || m.type === 'tv' || m.media_type === 'series' || m.media_type === 'tv') && !isAnimeItem(m)
  );

  const getFilteredData = () => {
    switch (activeTab) {
      case 'movies': return hollywoodMovies;
      case 'anime': return animeList;
      case 'arabic': return arabicCinema;
      case 'series': return tvSeries;
      default: return allMedia;
    }
  };

  const heroItem = allMedia[0];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24" dir="rtl">
      {/* 1. Hero Spotlight */}
      {heroItem && (
        <section className="relative h-[65vh] sm:h-[75vh] w-full overflow-hidden">
          <img
            src={heroItem.backdrop_url || (heroItem.backdrop_path ? `https://image.tmdb.org/t/p/original${heroItem.backdrop_path}` : heroItem.poster_url)}
            alt={heroItem.title}
            className="w-full h-full object-cover object-top opacity-35 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-transparent to-transparent" />

          <div className="absolute bottom-16 right-6 sm:right-12 max-w-2xl z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-lg shadow-red-600/40">
                <Flame className="w-3.5 h-3.5 fill-white" /> الأكثر مشاهدة
              </span>
              <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold">
                ⭐ {heroItem.vote_average ? Number(heroItem.vote_average).toFixed(1) : '8.8'}
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold">4K ULTRA HD</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black mb-4 leading-tight">{heroItem.title}</h1>
            <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 mb-6 max-w-xl">{heroItem.overview}</p>

            <Link
              href={`/media/${heroItem.id}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-red-600/40 transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>مشاهدة التفاصيل</span>
            </Link>
          </div>
        </section>
      )}

      {/* 2. Quick Category Filter Pills */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-20">
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
          {[
            { id: 'all', label: 'الكل الحصري', icon: Sparkles, count: allMedia.length },
            { id: 'movies', label: 'أفلام هوليوود 🍿', icon: Film, count: hollywoodMovies.length },
            { id: 'anime', label: 'مسلسلات الأنمي ⛩️', icon: Tv, count: animeList.length },
            { id: 'arabic', label: 'السينما العربية 🇪🇬', icon: Globe, count: arabicCinema.length },
            { id: 'series', label: 'المسلسلات والدراما 📺', icon: Tv, count: tvSeries.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 scale-105'
                    : 'bg-[#121218] text-gray-400 hover:text-white hover:bg-white/5 border border-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-black/30' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Filtered Grid Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
            <h2 className="text-xl sm:text-2xl font-black">
              {activeTab === 'all' && 'أحدث الإضافات الحصرية 🎬'}
              {activeTab === 'movies' && 'أفلام هوليوود السينمائية 🍿'}
              {activeTab === 'anime' && 'أقوى مسلسلات الأنمي المترجمة ⛩️'}
              {activeTab === 'arabic' && 'السينما العربية والمصرية 🇪🇬'}
              {activeTab === 'series' && 'المسلسلات والدراما التلفزيونية 📺'}
            </h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {getFilteredData().map((item) => {
              const anime = isAnimeItem(item);
              const poster = item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg');

              return (
                <Link
                  key={item.id}
                  href={`/media/${item.id}`}
                  className="group bg-[#121218] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 shadow-lg hover:shadow-red-600/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    {/* Tag Badge */}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-md shadow">
                        {anime ? 'أنمي' : item.type === 'series' || item.type === 'tv' ? 'مسلسل' : 'فيلم'}
                      </span>
                    </div>

                    <div className="absolute top-2 left-2">
                      <span className="px-1.5 py-0.5 bg-black/80 text-yellow-400 text-[10px] font-bold rounded flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-yellow-400" />
                        {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 text-right">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-red-400 transition truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between mt-1 text-[11px] text-gray-400">
                      <span>{item.release_date ? new Date(item.release_date).getFullYear() : '2024'}</span>
                      <span className="text-emerald-400 font-medium">مترجم</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Dedicated Anime Row (if on 'all' tab) */}
      {activeTab === 'all' && animeList.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-xl sm:text-2xl font-black text-white">عالم الأنمي الياباني المترجم ⛩️</h2>
            </div>
            <button
              onClick={() => setActiveTab('anime')}
              className="text-xs font-bold text-red-500 hover:text-red-400 transition"
            >
              عرض كل الأنمي ({animeList.length}) ←
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.slice(0, 6).map((item) => (
              <Link
                key={item.id}
                href={`/media/${item.id}`}
                className="group bg-[#121218] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all duration-300"
              >
                <div className="relative aspect-[2/3] overflow-hidden">
                  <img
                    src={item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg')}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-600 text-white text-[10px] font-black rounded-md">
                    حلقات كاملة
                  </span>
                </div>
                <div className="p-3 text-right">
                  <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">
                    {item.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
