'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg3NjgsImV4cCI6MjA1NjgxNDc2OH0.m9bQ21Qv9aI6L-f3gEsqFp2rU8P4eB3qVfT-YgM2UeU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API_KEY = '204ce203e280acdfec221ea09ea5e763';

function MediaSlider({
  title,
  icon,
  items,
  isGold = false,
  badgeText = '',
  isUpcoming = false
}: {
  title: string;
  icon: string;
  items: any[];
  isGold?: boolean;
  badgeText?: string;
  isUpcoming?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'right' ? scrollLeft + scrollAmount : scrollLeft - scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="space-y-3 relative group/slider">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className={`text-base md:text-lg font-black tracking-wide ${isGold ? 'text-amber-400' : 'text-white'}`}>
            {title}
          </h2>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-mono">
            {items.length}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover/slider:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-red-600 text-white flex items-center justify-center border border-slate-800 transition shadow-md"
          >
            ←
          </button>
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-slate-900/90 hover:bg-red-600 text-white flex items-center justify-center border border-slate-800 transition shadow-md"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, idx) => {
          const displayBadge = badgeText || (isUpcoming ? 'قريباً' : item.media_type === 'tv' ? 'مسلسل VIP' : 'فيلم VIP');
          const posterUrl = item.poster_path
            ? item.poster_path.startsWith('http')
              ? item.poster_path
              : `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500';

          return (
            <Link
              key={`${item.id}-${idx}`}
              href={`/media/${item.id}`}
              style={{ scrollSnapAlign: 'start' }}
              className={`flex-shrink-0 w-32 sm:w-44 md:w-48 group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-slate-950 flex flex-col ${
                isGold
                  ? 'border-amber-500/30 hover:border-amber-400 shadow-amber-950/20'
                  : isUpcoming
                  ? 'border-indigo-500/30 hover:border-indigo-400'
                  : 'border-slate-800/80 hover:border-red-500/50 shadow-red-950/20'
              }`}
            >
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                <img
                  src={posterUrl}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow ${
                      isGold
                        ? 'bg-amber-500 text-slate-950'
                        : isUpcoming
                        ? 'bg-indigo-600 text-white'
                        : item.media_type === 'tv'
                        ? 'bg-red-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {displayBadge}
                  </span>

                  {item.vote_average && Number(item.vote_average) > 0 && (
                    <span className="bg-black/75 backdrop-blur-md text-amber-400 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      ⭐ {Number(item.vote_average).toFixed(1)}
                    </span>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className={`w-full py-2 text-white text-[10px] font-black text-center rounded-xl shadow-lg ${isUpcoming ? 'bg-indigo-600' : 'bg-red-600'}`}>
                    {isUpcoming ? '🎬 الإعلان' : '▶️ مشاهدة'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2025'}</span>
                    <span className="text-emerald-400 font-medium">{item.media_type === 'tv' ? 'مترجم' : '4K VIP'}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [fallbackSeries, setFallbackSeries] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ ramadan_mode: true });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);

        const { data: setts } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
        if (setts) setSettings(setts);

        const { data: media } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (media && media.length > 0) {
          setMediaList(media);
        }

        const tvRes = await fetch(`https://api.themoviedb.org/3/trending/tv/week?api_key=${TMDB_API_KEY}&language=ar-SA`);
        const tvData = await tvRes.json();
        if (tvData.results) {
          setFallbackSeries(tvData.results.map((t: any) => ({ ...t, media_type: 'tv' })));
        }

        const upRes = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=ar-SA&page=1`);
        const upData = await upRes.json();
        if (upData.results) {
          setUpcomingMovies(upData.results.map((m: any) => ({ ...m, media_type: 'movie' })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleLuckyPopcorn = () => {
    const pool = mediaList.length > 0 ? mediaList : fallbackSeries;
    if (pool.length > 0) {
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      router.push(`/watch/${randomItem.id}`);
    }
  };

  const latestAdded = mediaList.slice(0, 15);
  const latestMovies = mediaList.filter(m => m.media_type === 'movie');
  const dbSeries = mediaList.filter(m => m.media_type === 'tv');
  const activeSeries = dbSeries.length >= 4 ? dbSeries : fallbackSeries;
  const latestAnime = mediaList.filter(m => m.original_language === 'ja' || (m.genres && m.genres.includes('أنمي')));
  const ramadanItems = mediaList.filter(m => m.original_language === 'ar' || (m.genres && m.genres.includes('رمضان')));
  const trendingNow = [...mediaList, ...fallbackSeries].slice(0, 15);

  const heroItems = (mediaList.length > 0 ? mediaList : fallbackSeries).slice(0, 5);
  const currentHero = heroItems[heroIndex] || heroItems[0];

  const searchResults = [...mediaList, ...fallbackSeries].filter(m =>
    (m.title || m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.original_title || m.original_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-x-hidden" dir="rtl">
      {/* هيدر متناسق بدقة */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-900 px-4 md:px-8 py-3 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/30">
              ▶
            </span>
            <div className="leading-tight">
              <span className="font-black text-lg text-white block">سينما <span className="text-red-500">بلاس</span></span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">VIP PORTAL</span>
            </div>
          </Link>

          <div className="flex-1 max-w-md mx-2 sm:mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن فيلم، مسلسل، أو أنمي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-full py-2 px-9 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
              />
              <span className="absolute right-3 top-2.5 text-slate-500 text-xs">🔍</span>
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute left-3 top-2 text-slate-400 text-xs hover:text-white">✕</button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleLuckyPopcorn}
              title="اختر عملاً عشوائياً لمشاهدته الآن!"
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <span>🍿</span>
              <span className="hidden sm:inline">فشار الحظ</span>
            </button>

            <Link
              href="/admin"
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              ⚙️ <span className="hidden md:inline">الإدارة</span>
            </Link>
          </div>
        </div>
      </header>

      {searchQuery ? (
        <main className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-400">نتائج البحث عن: "{searchQuery}" ({searchResults.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {searchResults.map((item) => (
              <Link key={item.id} href={`/media/${item.id}`} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-500 transition">
                <img
                  src={item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`) : 'https://placehold.co/300x450'}
                  alt={item.title || item.name}
                  className="w-full aspect-[2/3] object-cover"
                />
                <p className="p-2 text-xs font-bold text-white truncate">{item.title || item.name}</p>
              </Link>
            ))}
          </div>
        </main>
      ) : (
        <>
          {currentHero && (
            <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-black">
              <img
                src={
                  currentHero.backdrop_path
                    ? currentHero.backdrop_path.startsWith('http')
                      ? currentHero.backdrop_path
                      : `https://image.tmdb.org/t/p/original${currentHero.backdrop_path}`
                    : currentHero.poster_path
                }
                alt={currentHero.title || currentHero.name}
                className="w-full h-full object-cover object-center opacity-40 scale-105 transition-all duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent"></div>

              <div className="absolute bottom-8 right-6 md:right-12 max-w-2xl z-10 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase">
                    عمل الأسبوع الحصري
                  </span>
                  <span className="text-amber-400 font-bold text-xs">
                    ⭐ {currentHero.vote_average ? Number(currentHero.vote_average).toFixed(1) : '8.5'}
                  </span>
                  <span className="text-slate-400 text-xs">| {currentHero.release_date?.substring(0, 4) || currentHero.first_air_date?.substring(0, 4) || '2025'}</span>
                </div>

                <h1 className="text-2xl md:text-5xl font-black text-white leading-tight">
                  {currentHero.title || currentHero.name}
                </h1>

                <p className="text-slate-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
                  {currentHero.overview || 'استمتع بمشاهدة أحدث وأقوى الأعمال السينمائية بجودة VIP فائقة وسيرفرات متعددة.'}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/watch/${currentHero.id}`}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-black rounded-xl transition shadow-xl shadow-red-600/30 flex items-center gap-2"
                  >
                    ▶️ مشاهدة الآن VIP
                  </Link>
                  <Link
                    href={`/media/${currentHero.id}`}
                    className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-bold rounded-xl border border-slate-700/60 transition backdrop-blur-md"
                  >
                    ℹ️ تفاصيل العمل
                  </Link>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 z-10 flex gap-1.5">
                {heroItems.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setHeroIndex(i)}
                    className={`h-2 rounded-full transition-all ${
                      heroIndex === i ? 'w-8 bg-red-600' : 'w-2 bg-slate-600/60 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </section>
          )}

          <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-10">
            {settings.ramadan_mode && ramadanItems.length > 0 && (
              <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/50 to-amber-950/10 p-4 rounded-3xl border border-amber-500/20">
                <MediaSlider title="مسلسلات رمضان 2025 الحصرية" icon="🌙" items={ramadanItems} isGold={true} badgeText="رمضان 2025" />
              </div>
            )}

            <MediaSlider
              title="أحدث المسلسلات العالمية ونتفليكس (كامل الحلقات)"
              icon="📺"
              items={activeSeries}
              badgeText="مسلسل VIP"
            />

            {latestAdded.length > 0 && (
              <MediaSlider title="آخر الإضافات على سينما بلاس" icon="⚡" items={latestAdded} badgeText="جديد اليوم" />
            )}

            <MediaSlider title="أحدث أفلام السينما العالمية 2024 / 2025" icon="🎬" items={latestMovies} badgeText="فيلم VIP" />

            {latestAnime.length > 0 && (
              <MediaSlider title="آخر حلقات الأنمي الأسبوعية المترجمة" icon="⚔️" items={latestAnime} badgeText="أنمي أسبوعي" />
            )}

            <div className="bg-slate-900/30 p-4 rounded-3xl border border-indigo-500/20">
              <MediaSlider
                title="قريباً في السينما (أفلام أعلن عنها قادمة 2025)"
                icon="⏳"
                items={upcomingMovies}
                isUpcoming={true}
                badgeText="قريباً"
              />
            </div>

            <MediaSlider title="الأكثر مشاهدة والأعلى تقييماً هذا الأسبوع" icon="🔥" items={trendingNow} badgeText="تريند VIP" />
          </main>
        </>
      )}

      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-400">منصة سينما بلاس VIP — بوابتك الترفيهية الأولى</p>
        <p className="text-[10px]">سيرفرات سريعة بدقة 4K مع ترجمة عربية فورية © 2025</p>
      </footer>
    </div>
  );
}
