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
  Zap,
  TrendingUp,
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

  // 1. SMART ANIME CLASSIFIER (Arabic + English + Japanese)
  const isAnimeItem = (m: any) => {
    if (!m) return false;
    if (m.type === 'anime' || m.category === 'anime' || m.original_language === 'ja') return true;

    const fullText = `${m.title || ''} ${m.original_title || ''} ${m.overview || ''}`.toLowerCase();
    
    // Check Japanese Kanji/Hiragana/Katakana characters
    if (/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(fullText)) return true;

    // Comprehensive Arabic and English Anime Keywords
    const animeKeywords = [
      'أنمي', 'انمي', 'anime', 'animation', 'مانجا', 'اوتاكو',
      'ون بيس', 'one piece', 'هجوم العمالقة', 'attack on titan', 'shingeki',
      'ناروتو', 'naruto', 'شيبودن', 'shippuden', 'بوروتو', 'boruto',
      'دراغون بول', 'dragon ball', 'بليتش', 'bleach',
      'قاتل الشياطين', 'demon slayer', 'kimetsu',
      'جوجيتسو', 'jujutsu kaisen', 'كايسن',
      'سولو ليفلينج', 'solo leveling',
      'هنتر', 'القناص', 'hunter x hunter',
      'ديث نوت', 'مذكرة الموت', 'death note',
      'طوكيو غول', 'tokyo ghoul',
      'دكتور ستون', 'dr. stone', 'dr stone',
      'فيري تيل', 'fairy tail',
      'اكاديمية بطلي', 'my hero academia', 'boku no hero',
      'فينلاند', 'vinland saga',
      'تشينسو مان', 'chainsaw man',
      'بلاك كلوفر', 'black clover',
      'كود غياس', 'code geass',
      'هايكيو', 'haikyuu',
      'اوفرلورد', 'overlord',
      'سباي فاميلي', 'spy x family',
      'سبيس تون', 'spacetoon',
      'كيميتسو', 'مونسستر', 'monster'
    ];

    return animeKeywords.some(keyword => fullText.includes(keyword));
  };

  // 2. ARABIC CLASSIFIER
  const isArabicItem = (m: any) => {
    if (isAnimeItem(m)) return false;
    return m.original_language === 'ar' || (m.title && /[\u0600-\u06FF]/.test(m.title));
  };

  // 3. ASIAN DRAMA CLASSIFIER (Korean/Chinese, NOT Anime)
  const isAsianDrama = (m: any) => {
    if (isAnimeItem(m)) return false;
    return (
      m.original_language === 'ko' ||
      m.original_language === 'zh' ||
      (m.title && /(كوري|كورية|اسيوي|اسيوية|دراما كورية|korea|drama)/i.test(m.title))
    );
  };

  // ==========================================================
  // FILTERED LISTS (STRICTLY CLEAN - NO CROSS LEAKAGE)
  // ==========================================================
  
  // Hero: Blockbuster Movie or Major Series (Never random anime overriding)
  const heroItem = allMedia.find(m => !isAnimeItem(m)) || allMedia[0];

  // 1. Anime Only
  const animeList = allMedia.filter(m => isAnimeItem(m));

  // 2. Netflix & Global Blockbusters (No Anime)
  const netflixList = allMedia.filter(m => !isAnimeItem(m) && !isArabicItem(m)).slice(0, 10);

  // 3. Hollywood Movies (Pure Western Movies - No Series, No Anime, No Arabic)
  const hollywoodMovies = allMedia.filter(
    m => (m.type === 'movie' || m.media_type === 'movie' || (!m.type && !m.media_type)) &&
         !isAnimeItem(m) &&
         !isArabicItem(m)
  );

  // 4. Global TV Series (Western TV Shows - No Anime)
  const tvSeries = allMedia.filter(
    m => (m.type === 'series' || m.type === 'tv' || m.media_type === 'series' || m.media_type === 'tv') &&
         !isAnimeItem(m) &&
         !isArabicItem(m)
  );

  // 5. Asian Drama (Korean/Chinese - No Anime)
  const asianDrama = allMedia.filter(m => isAsianDrama(m));

  // 6. Egyptian & Arabic Cinema (No Anime)
  const arabicCinema = allMedia.filter(m => isArabicItem(m));

  // 7. Top Rated of All Time (Movies & Series)
  const topRated = [...allMedia]
    .filter(m => !isAnimeItem(m))
    .sort((a, b) => (Number(b.vote_average) || 0) - (Number(a.vote_average) || 0))
    .slice(0, 10);

  // Helper Card Component
  const MediaCard = ({ item }: { item: any }) => {
    const poster = item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg');
    const isAnime = isAnimeItem(item);
    const isTv = item.type === 'series' || item.type === 'tv' || isAnime;

    return (
      <Link
        href={`/media/${item.id}`}
        className="min-w-[150px] sm:min-w-[175px] max-w-[175px] flex-shrink-0 group bg-[#121218] rounded-2xl overflow-hidden border border-white/5 hover:border-red-600/50 shadow-lg hover:shadow-red-600/20 transition-all duration-300 flex flex-col justify-between"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img src={poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
            {isAnime ? 'أنمي ⛩️' : isTv ? 'مسلسل 📺' : 'فيلم 🎬'}
          </div>

          <div className="absolute top-2 left-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
            <Star className="w-2.5 h-2.5 fill-yellow-400" />
            {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
          </div>

          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
              <Play className="w-4 h-4 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        <div className="p-3 text-right">
          <h3 className="text-xs font-bold text-white group-hover:text-red-400 transition truncate">{item.title}</h3>
          <span className="text-[10px] text-gray-500 block mt-1">
            {item.release_date ? new Date(item.release_date).getFullYear() : '2024'}
          </span>
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
              <Flame className="w-3.5 h-3.5 fill-white" /> الأكثر مشاهدة اليوم
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 leading-tight">{heroItem.title}</h1>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-14 mt-8">

        {/* ======================================================== */}
        {/* SLIDER 1: NETFLIX & GLOBAL BLOCKBUSTERS (NO ANIME)       */}
        {/* ======================================================== */}
        {netflixList.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">أحدث إصدارات نيتفلكس والعالمية 🍿</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {netflixList.map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDER 2: HOLLYWOOD MOVIES (STRICTLY MOVIES - NO ANIME)  */}
        {/* ======================================================== */}
        {hollywoodMovies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">أقوى أفلام هوليوود السينمائية 🎬</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {hollywoodMovies.map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SECTION 3: SIDE-BY-SIDE (BANNER + ASIAN DRAMA SLIDER)    */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
          <div className="lg:col-span-1 rounded-3xl overflow-hidden relative bg-gradient-to-br from-red-950 via-[#181822] to-black p-6 flex flex-col justify-between border border-red-600/30 shadow-2xl">
            <div>
              <span className="bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg">سيرفرات VIP</span>
              <h3 className="text-xl font-black mt-3 leading-snug">تجربة سينمائية فريدة بدقة 4K</h3>
              <p className="text-xs text-gray-400 mt-2">سيرفرات فائقة السرعة، بدون تقطيع وبترجمة حصرية متزامنة.</p>
            </div>
            <a href="https://uplcm.com/4/12311730" target="_blank" rel="noreferrer" className="mt-6 w-full py-3 bg-red-600 hover:bg-red-700 text-center text-xs font-black rounded-xl transition">
              تحميل تطبيق سينما بلاس مجاناً
            </a>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">الدراما الآسيوية والكورية 🇰🇷</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {(asianDrama.length > 0 ? asianDrama : hollywoodMovies.slice(0, 10)).map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SECTION 4: SIDE-BY-SIDE (LATEST ANIME EPISODES + SLIDER) */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          
          {/* Side Widget: Only Anime Episodes */}
          <div className="lg:col-span-1 bg-[#111116] border border-white/10 rounded-3xl p-5">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h3 className="text-sm font-black text-white">أحدث حلقات الأنمي ⚡</h3>
            </div>
            <div className="space-y-3">
              {animeList.length > 0 ? (
                animeList.slice(0, 5).map((anime) => (
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
                ))
              ) : (
                <p className="text-xs text-gray-500 text-center py-4">جاري تحديث الحلقات...</p>
              )}
            </div>
          </div>

          {/* Anime Main Slider */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">عالم الأنمي الياباني المترجم ⛩️</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {animeList.length > 0 ? (
                animeList.map((m) => <MediaCard key={m.id} item={m} />)}
              ) : (
                <p className="text-xs text-gray-500 py-6">جاري إضافة مسلسلات الأنمي...</p>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* SLIDER 3: TV SERIES (GLOBAL SHOWS - NO ANIME)            */}
        {/* ======================================================== */}
        {tvSeries.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">المسلسلات والدراما الأجنبية 📺</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {tvSeries.map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* RECENTLY ADDED GRID (تحت خالص مع كل الإضافات)            */}
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
        {/* SLIDER 4: ARABIC & EGYPTIAN CINEMA (NO ANIME)            */}
        {/* ======================================================== */}
        {arabicCinema.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">السينما العربية والمصرية 🇪🇬</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {arabicCinema.map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* SLIDER 5: TOP RATED (NO ANIME)                           */}
        {/* ======================================================== */}
        {topRated.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
              <h2 className="text-lg sm:text-xl font-black">الأعلى تقييماً عبر التاريخ 🏆</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {topRated.map((m) => <MediaCard key={m.id} item={m} />)}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
