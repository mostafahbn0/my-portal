'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Star, Calendar, Film, Tv, Clock, 
  Users, Youtube, Info, Globe, ArrowRight, Heart, 
  Share2, Check, Sparkles, DollarSign, Layers
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MDc3NzMsImV4cCI6MjA1MjM4Mzc3M30.b8nF7R4w04iT3vjXU8p2kM7aV8xG7g4_6Xb0fXqI3Xv'
);

const TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763";
const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';

export default function MediaDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [media, setMedia] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);

      // 1. جلب من Supabase
      const { data: dbData } = await supabase.from('media').select('*').eq('id', id).single();
      setMedia(dbData);

      const mediaType = dbData?.media_type || 'movie';

      // 2. إثراء الصفحة بالتفاصيل الكاملة من TMDB
      try {
        const res = await fetch(`https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=ar&append_to_response=credits,videos,recommendations,similar`);
        const tmdbData = await res.json();
        if (tmdbData.id) {
          setDetails(tmdbData);

          // استخراج التريلر
          const trailer = tmdbData.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
                       || tmdbData.videos?.results?.[0];
          if (trailer?.key) {
            setTrailerKey(trailer.key);
          }
        }
      } catch (e) {
        console.error(e);
      }

      // فحص قائمة المفضلة
      try {
        const wl = JSON.parse(localStorage.getItem('cinema_watchlist') || '[]');
        setInWatchlist(wl.some((item: any) => item.id === Number(id)));
      } catch (e) {}

      setLoading(false);
    }

    loadData();
  }, [id]);

  const toggleWatchlist = () => {
    try {
      const wl = JSON.parse(localStorage.getItem('cinema_watchlist') || '[]');
      let updated;
      const targetId = media?.id || details?.id;
      if (inWatchlist) {
        updated = wl.filter((item: any) => item.id !== targetId);
        setInWatchlist(false);
      } else {
        updated = [...wl, {
          id: targetId,
          title: media?.title || details?.title || details?.name,
          poster_path: media?.poster_path || `https://image.tmdb.org/t/p/w500${details?.poster_path}`,
          vote_average: media?.vote_average || details?.vote_average,
          media_type: media?.media_type || 'movie'
        }];
        setInWatchlist(true);
      }
      localStorage.setItem('cinema_watchlist', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-sm font-semibold animate-pulse">جاري تحميل تفاصيل العمل...</span>
        </div>
      </div>
    );
  }

  const title = media?.title || details?.title || details?.name || 'تفاصيل الفيلم';
  const originalTitle = media?.original_title || details?.original_title || details?.original_name;
  const overview = details?.overview || media?.overview || 'قصة العمل السينمائي متوفرة للمشاهدة المباشرة بأعلى جودة.';
  const poster = media?.poster_path?.startsWith('http') ? media.poster_path : (details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg');
  const backdrop = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : poster;
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : (media?.vote_average || '8.5');
  const releaseYear = (details?.release_date || details?.first_air_date || media?.release_date || '2024').substring(0, 4);
  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}س و ${details.runtime % 60}د` : (details?.episode_run_time?.[0] ? `${details.episode_run_time[0]} دقيقة` : 'ساعتان تقريباً');
  const genres = details?.genres?.map((g: any) => g.name) || media?.genres || ['سينما بلاس', 'أكشن', 'مترجم'];
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const recommendations = details?.recommendations?.results?.slice(0, 6) || details?.similar?.results?.slice(0, 6) || [];
  const isTv = (media?.media_type || details?.media_type) === 'tv';

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-16 pb-20 selection:bg-red-600 selection:text-white">

      {/* 🌟 الهيدر السينمائي العريض مع البوستر والتفاصيل */}
      <div className="relative w-full min-h-[520px] md:min-h-[580px] flex items-end pb-12 px-4 md:px-12 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center filter blur-[2px] scale-105"
          style={{ backgroundImage: `url(${backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/85 to-[#08080a]/40"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-transparent to-[#08080a]/70"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          
          {/* بوستر الفيلم مع التقييم */}
          <div className="relative flex-shrink-0 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-2xl blur-md opacity-40 group-hover:opacity-75 transition duration-500"></div>
            <img 
              src={poster} 
              alt={title}
              className="relative w-48 sm:w-56 md:w-64 aspect-[2/3] object-cover rounded-2xl shadow-2xl border border-white/10"
            />
            <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1 text-xs font-bold text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{rating}</span>
            </div>
          </div>

          {/* تفاصيل العمل وأزرار المشاهدة والتحميل */}
          <div className="flex-1 space-y-4 text-center md:text-right">
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-bold">
              <span className="px-3 py-1 bg-red-600 text-white rounded-md shadow-md shadow-red-600/40">
                {isTv ? 'مسلسل VIP' : 'فيلم سينمائي'}
              </span>
              <span className="px-2.5 py-1 bg-zinc-900/90 border border-zinc-700/80 rounded-md text-zinc-300">
                4K Ultra HD
              </span>
              <span className="px-2.5 py-1 bg-zinc-900/90 border border-zinc-700/80 rounded-md text-zinc-300">
                {releaseYear}
              </span>
              <span className="px-2.5 py-1 bg-zinc-900/90 border border-zinc-700/80 rounded-md text-zinc-300 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                {runtime}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md">
                مترجم للعربية
              </span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight drop-shadow-lg">
                {title}
              </h1>
              {originalTitle && originalTitle !== title && (
                <p className="text-sm md:text-base text-zinc-400 font-medium mt-1 dir-ltr">
                  {originalTitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {genres.map((g: string, i: number) => (
                <span key={i} className="text-xs text-zinc-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                  {g}
                </span>
              ))}
            </div>

            {/* الأزرار التفاعلية: المشاهدة، التريلر، المفضلة، المشاركة */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <Link
                href={`/watch/${id}`}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>مشاهدة الفيلم الآن</span>
              </Link>

              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(!showTrailer)}
                  className="px-5 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm border border-zinc-700 flex items-center gap-2 transition"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span>{showTrailer ? 'إخفاء الإعلان' : 'الإعلان الرسمي (Trailer)'}</span>
                </button>
              )}

              <button
                onClick={toggleWatchlist}
                className={`p-3.5 rounded-xl border transition flex items-center gap-2 text-sm font-bold ${
                  inWatchlist 
                    ? 'bg-red-600/20 border-red-500 text-red-400' 
                    : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWatchlist ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden sm:inline">{inWatchlist ? 'في قائمتي' : 'أضف لقائمتي'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-sm font-bold"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'مشاركة'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🎬 نافذة الإعلان الترويجي الرسمي (Trailer) */}
      {showTrailer && trailerKey && (
        <div className="max-w-5xl mx-auto px-4 py-6 transition-all duration-500">
          <div className="bg-[#121216] border border-red-600/40 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 text-sm font-bold text-zinc-300">
              <span className="flex items-center gap-2 text-red-500">
                <Youtube className="w-5 h-5" />
                الإعلان الترويجي الرسمي (Official Trailer)
              </span>
              <button onClick={() => setShowTrailer(false)} className="text-zinc-400 hover:text-white">✕ إغلاق</button>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                className="w-full h-full border-0"
                allowFullScreen
                allow="autoplay; encrypted-media"
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* 📑 القصة وطاقم العمل والممثلين والتحميل */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* العمود الأيمن */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* قصة العمل */}
          <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-red-500" />
              <span>قصة العمل:</span>
            </h3>
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              {overview}
            </p>
          </div>

          {/* طاقم الممثلين مع صورهم وأدوارهم */}
          {cast.length > 0 && (
            <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-red-500" />
                <span>أبرز نجوم وطاقم العمل:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {cast.map((actor: any) => (
                  <div key={actor.id} className="flex items-center gap-3 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                    <img 
                      src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://image.tmdb.org/t/p/w185/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg'} 
                      alt={actor.name}
                      className="w-12 h-12 rounded-full object-cover border border-zinc-700 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate">{actor.name}</h4>
                      <p className="text-[11px] text-zinc-400 truncate">{actor.character || 'دور رئيسي'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* أعمال مقترحة ومشابهة */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-red-500" />
                <span>أعمال قد تنال إعجابك أيضاً:</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {recommendations.map((item: any) => (
                  <Link 
                    key={item.id} 
                    href={`/media/${item.id}`} 
                    className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 hover:border-red-600 transition"
                  >
                    <img 
                      src={item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : poster} 
                      alt={item.title || item.name}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="p-2 text-center">
                      <h4 className="text-xs font-bold text-zinc-200 group-hover:text-red-400 truncate">
                        {item.title || item.name}
                      </h4>
                      <span className="text-[10px] text-zinc-500">
                        {item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}` : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* العمود الأيسر: بطاقة البيانات + التحميل */}
        <div className="space-y-6">

          <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white border-b border-zinc-800 pb-3">
              بطاقة معلومات العمل
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">التصنيف:</span>
                <span className="font-bold text-zinc-200">{genres.join('، ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">سنة الإنتاج:</span>
                <span className="font-bold text-zinc-200">{releaseYear}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">التقييم:</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {rating} / 10
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">المدة:</span>
                <span className="font-bold text-zinc-200">{runtime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">اللغة:</span>
                <span className="font-bold text-zinc-200">
                  {details?.original_language === 'en' ? 'الإنجليزية (مترجم)' : details?.original_language === 'ar' ? 'العربية' : details?.original_language || 'أصلي'}
                </span>
              </div>
            </div>

            <Link
              href={`/watch/${id}`}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>فتح مشغل الفيديو الآن</span>
            </Link>
          </div>

          {/* أزرار التحميل */}
          <div className="bg-gradient-to-br from-[#121216] to-[#1a1414] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>تحميل مباشر بأعلى جودة:</span>
            </h3>

            <div className="space-y-2.5 pt-2">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-between transition shadow-lg shadow-emerald-600/20"
              >
                <span>تحميل 1080p Full HD</span>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">مباشر</span>
              </a>

              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs flex items-center justify-between transition border border-zinc-700"
              >
                <span>تحميل 720p HD</span>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">مباشر</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
