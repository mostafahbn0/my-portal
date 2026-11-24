'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg3NjgsImV4cCI6MjA1NjgxNDc2OH0.m9bQ21Qv9aI6L-f3gEsqFp2rU8P4eB3qVfT-YgM2UeU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API_KEY = '204ce203e280acdfec221ea09ea5e763';

// مكوّن السلايدر الأفقي المرن الاحترافي
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
      {/* عنوان السلايدر وأزرار التحكم */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h2 className={`text-base md:text-lg font-black tracking-wide ${isGold ? 'text-amber-400' : 'text-white'}`}>
            {title}
          </h2>
          <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {items.length} عمل
          </span>
        </div>

        {/* أزرار الأسهم */}
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

      {/* شريط الكروت المتحرك */}
      <div
        ref={rowRef}
        className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, idx) => {
          const displayBadge = badgeText || (isUpcoming ? 'قريباً في السينما' : item.media_type === 'tv' ? 'حلقة جديدة' : 'فيلم VIP');
          return (
            <Link
              key={`${item.id}-${idx}`}
              href={isUpcoming ? `/media/${item.id}` : `/media/${item.id}`}
              style={{ scrollSnapAlign: 'start' }}
              className={`flex-shrink-0 w-32 sm:w-44 md:w-48 group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-slate-950 flex flex-col ${
                isGold
                  ? 'border-amber-500/30 hover:border-amber-400 shadow-amber-950/20'
                  : isUpcoming
                  ? 'border-indigo-500/30 hover:border-indigo-400'
                  : 'border-slate-800/80 hover:border-red-500/50 shadow-red-950/20'
              }`}
            >
              {/* البوستر */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900">
                <img
                  src={item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`) : 'https://placehold.co/300x450'}
                  alt={item.title || item.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* الشارات الذكية */}
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

                {/* زر الهوفر التفاعلي */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className={`w-full py-2 text-white text-[10px] font-black text-center rounded-xl shadow-lg ${isUpcoming ? 'bg-indigo-600' : 'bg-red-600'}`}>
                    {isUpcoming ? '🎬 الإعلان الترويجي' : '▶️ مشاهدة الآن'}
                  </span>
                </div>
              </div>

              {/* بيانات العمل */}
              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">
                    {item.title || item.name}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{item.release_date?.substring(0, 4) || item.first_air_date?.substring(0, 4) || '2025'}</span>
                    {item.media_type === 'tv' && (
                      <span className="text-emerald-400 font-medium">مترجم عربي</span>
                    )}
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
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ ramadan_mode: true });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    async function initData() {
      try {
        setLoading(true);

        // 1. الإعدادات من Supabase
        const { data: setts } = await supabase.from('site_settings').select('*').eq('id', 'global_config').single();
        if (setts) setSettings(setts);

        // 2. الوسائط المخزنة
        const { data: media } = await supabase.from('media').select('*').order('created_at', { ascending: false });
        if (media) setMediaList(media);

        // 3. جلب أفلام "قريباً في السينما" (Upcoming & Announced) مباشرة من TMDB
        const upRes = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=ar-SA&page=1`);
        const upData = await upRes.json();
        if (upData.results) {
          setUpcomingMovies(upData.results);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  // فئات السلايدرات الذكية
  const latestAdded = [...mediaList].sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()).slice(0, 15);
  const latestMovies = mediaList.filter(m => m.media_type === 'movie');
  const latestSeries = mediaList.filter(m => m.media_type === 'tv' && m.original_language !== 'ja');
  const latestAnime = mediaList.filter(m => m.original_language === 'ja' || (m.genres && m.genres.includes('أنمي')));
  const ramadanItems = mediaList.filter(m => m.original_language === 'ar' || (m.genres && m.genres.includes('رمضان')));
  const trendingNow = [...mediaList].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 12);

  // البحث
  const searchResults = mediaList.filter(m =>
    (m.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.original_title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const heroItems = mediaList.slice(0, 5);
  const currentHero = heroItems[heroIndex] || heroItems[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* النافبار العلوي الفاخر */}
      <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-md border-b border-slate-900 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 bg-red-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-red-600/30">
              C+
            </span>
            <div className="leading-tight">
              <span className="font-black text-lg text-white block">سينما بلاس</span>
              <span className="text-[10px] text-red-500 font-bold tracking-wider uppercase">VIP PORTAL</span>
            </div>
          </Link>
        </div>

        {/* شريط البحث المباشر */}
        <div className="flex items-center flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن فيلم، مسلسل، أو أنمي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-full py-2 px-10 text-xs text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
            />
            <span className="absolute right-3.5 top-2.5 text-slate-500 text-xs">🔍</span>
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute left-3 top-2.5 text-slate-400 text-xs">✕</button>
            )}
          </div>
        </div>

        <Link
          href="/admin"
          className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3.5 py-2 rounded-xl border border-slate-800 transition font-bold flex items-center gap-1.5"
        >
          ⚙️ <span className="hidden sm:inline">لوحة التحكم</span>
        </Link>
      </header>

      {/* محتوى الصفحة */}
      {searchQuery ? (
        <main className="max-w-7xl w-full mx-auto p-4 md:p-8 space-y-4">
          <h2 className="text-sm font-bold text-slate-400">نتائج البحث عن: "{searchQuery}" ({searchResults.length})</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {searchResults.map((item) => (
              <Link key={item.id} href={`/media/${item.id}`} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-red-500 transition">
                <img src={item.poster_path} alt={item.title} className="w-full aspect-[2/3] object-cover" />
                <p className="p-2 text-xs font-bold text-white truncate">{item.title}</p>
              </Link>
            ))}
          </div>
        </main>
      ) : (
        <>
          {/* 🌟 البانر الهيرو السينمائي الكبير */}
          {currentHero && (
            <section className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden bg-black">
              <img
                src={currentHero.backdrop_path || currentHero.poster_path}
                alt={currentHero.title}
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
                  <span className="text-slate-400 text-xs">| {currentHero.release_date?.substring(0, 4)}</span>
                </div>

                <h1 className="text-2xl md:text-5xl font-black text-white leading-tight">
                  {currentHero.title}
                </h1>

                <p className="text-slate-300 text-xs md:text-sm line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl">
                  {currentHero.overview}
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <Link
                    href={`/watch/${currentHero.id}`}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-black rounded-xl transition shadow-xl shadow-red-600/30 flex items-center gap-2"
                  >
                    ▶️ مشاهدة الفيلم الآن
                  </Link>
                  <Link
                    href={`/media/${currentHero.id}`}
                    className="px-5 py-3 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs md:text-sm font-bold rounded-xl border border-slate-700/60 transition backdrop-blur-md"
                  >
                    ℹ️ تفاصيل العمل
                  </Link>
                </div>
              </div>

              {/* نقاط السلايدر */}
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

          {/* 🎬 باقة السلايدرات المتكاملة (Shahid + Akwam + Netflix Style) */}
          <main className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-10">
            {/* 1. سلايدر مسلسلات رمضان 2025 الذهبي */}
            {settings.ramadan_mode && ramadanItems.length > 0 && (
              <div className="bg-gradient-to-r from-amber-950/20 via-slate-900/50 to-amber-950/10 p-4 rounded-3xl border border-amber-500/20">
                <MediaSlider title="مسلسلات رمضان 2025 الحصرية" icon="🌙" items={ramadanItems} isGold={true} badgeText="رمضان 2025" />
              </div>
            )}

            {/* 2. سلايدر آخر الإضافات (جديد المنصة اليوم) */}
            <MediaSlider title="آخر الإضافات على سينما بلاس" icon="⚡" items={latestAdded} badgeText="أضيف حديثاً" />

            {/* 3. سلايدر أحدث أفلام هوليوود والسينما 2024/2025 */}
            <MediaSlider title="أحدث الأفلام والسينما العالمية" icon="🎬" items={latestMovies} badgeText="فيلم VIP" />

            {/* 4. سلايدر أحدث حلقات المسلسلات */}
            <MediaSlider title="أحدث حلقات المسلسلات التلفزيونية" icon="📺" items={latestSeries} badgeText="حلقة جديدة" />

            {/* 5. سلايدر آخر حلقات مسلسلات الأنمي */}
            <MediaSlider title="آخر حلقات الأنمي الأسبوعية المترجمة" icon="⚔️" items={latestAnime} badgeText="أنمي أسبوعي" />

            {/* 6. سلايدر قريباً في السينما (Upcoming & Announced) */}
            <div className="bg-slate-900/30 p-4 rounded-3xl border border-indigo-500/20">
              <MediaSlider
                title="قريباً في السينما (أفلام أعلن عنها عالمياً)"
                icon="⏳"
                items={upcomingMovies}
                isUpcoming={true}
                badgeText="قريباً 2025"
              />
            </div>

            {/* 7. الأكثر مشاهدة والتريند */}
            <MediaSlider title="الأكثر مشاهدة والأعلى تقييماً هذا الأسبوع" icon="🔥" items={trendingNow} badgeText="تريند VIP" />
          </main>
        </>
      )}

      {/* الفوتر */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-8 px-6 text-center text-xs text-slate-500 space-y-2">
        <p className="font-bold text-slate-400">منصة سينما بلاس VIP — أكبر بوابة للمشاهدة والتحميل المجاني</p>
        <p className="text-[10px]">ترجمة عربية احترافية وسيرفرات فائقة السرعة 4K © 2025</p>
      </footer>
    </div>
  );
}
