'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, ShieldCheck, Film, Tv, Sparkles, Users, 
  Clock, Share2, Heart, Check, Youtube, Info, 
  Globe, DollarSign, Layers, Volume2, Eye
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4MDc3NzMsImV4cCI6MjA1MjM4Mzc3M30.b8nF7R4w04iT3vjXU8p2kM7aV8xG7g4_6Xb0fXqI3Xv'
);

const TMDB_API_KEY = "204ce203e280acdfec221ea09ea5e763";
const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';

export default function WatchPage() {
  const { id } = useParams();

  const [media, setMedia] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeServerUrl, setActiveServerUrl] = useState<string>('');
  const [activeServerName, setActiveServerName] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);

  // إعدادات المسلسلات
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // جلب البيانات من Supabase + TMDB لإثراء الصفحة بالتفاصيل الكاملة
  useEffect(() => {
    async function loadFullData() {
      if (!id) return;
      setLoading(true);

      // 1. جلب من Supabase
      const { data: dbData } = await supabase.from('media').select('*').eq('id', id).single();
      
      const mediaType = dbData?.media_type || 'movie';
      setMedia(dbData);

      // 2. جلب بيانات غنية من TMDB (الممثلين، التريلر، التوصيات، الإيرادات، المدة)
      try {
        const tmdbUrl = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&language=ar&append_to_response=credits,videos,recommendations,similar`;
        const res = await fetch(tmdbUrl);
        const tmdbData = await res.json();
        
        if (tmdbData.id) {
          setDetails(tmdbData);
          
          // العثور على التريلر
          const trailer = tmdbData.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') 
                       || tmdbData.videos?.results?.[0];
          if (trailer?.key) {
            setTrailerKey(trailer.key);
          }

          if (mediaType === 'tv') {
            const validSeasons = tmdbData.seasons?.filter((s: any) => s.season_number > 0) || [];
            setSeasons(validSeasons);
            if (validSeasons.length > 0) {
              loadEpisodes(id, validSeasons[0].season_number);
            }
          }
        }
      } catch (err) {
        console.error("TMDB Enrichment error:", err);
      }

      // فحص قائمة المفضلة
      try {
        const wl = JSON.parse(localStorage.getItem('cinema_watchlist') || '[]');
        setInWatchlist(wl.some((item: any) => item.id === Number(id)));
      } catch (e) {}

      setLoading(false);
    }

    loadFullData();
  }, [id]);

  async function loadEpisodes(tvId: any, sNum: number) {
    setSelectedSeason(sNum);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${sNum}?api_key=${TMDB_API_KEY}&language=ar`);
      const data = await res.json();
      setEpisodes(data.episodes || Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    } catch {
      setEpisodes(Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    }
  }

  const isTv = (media?.media_type || details?.media_type) === 'tv';
  const targetId = media?.id || details?.id;

  // سيرفرات VIP مجهزة بأقوى خطوط وترجمة عربية مدمجة
  const servers = [
    {
      name: 'سيرفر VIP 1 (VidLink - مترجم للعربية فوراً)',
      url: isTv 
        ? `https://vidlink.pro/tv/${targetId}/${selectedSeason}/${selectedEpisode}?sub.ar=true&primaryColor=dc2626`
        : `https://vidlink.pro/movie/${targetId}?sub.ar=true&primaryColor=dc2626`
    },
    {
      name: 'سيرفر VIP 2 (SuperEmbed - سريع وثابت)',
      url: isTv 
        ? `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/?video_id=${targetId}&tmdb=1`
    },
    {
      name: 'سيرفر VIP 3 (EmbedSu - ترجمات متعددة)',
      url: isTv 
        ? `https://embed.su/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.su/embed/movie/${targetId}`
    },
    {
      name: 'سيرفر VIP 4 (VidSrc Pro)',
      url: isTv 
        ? `https://vidsrc.pro/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${targetId}`
    },
    {
      name: 'سيرفر VIP 5 (AutoEmbed Player)',
      url: isTv 
        ? `https://player.autoembed.cc/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : `https://player.autoembed.cc/embed/movie/${targetId}`
    }
  ];

  // إضافة السيرفر الخاص إن وجد
  if (media?.video_url) {
    servers.unshift({
      name: '⚡ سيرفر المصدر الأصلي',
      url: media.video_url
    });
  }

  const currentIframe = activeServerUrl || servers[0].url;

  const handlePlayClick = () => {
    if (!isUnlocked) {
      window.open(DIRECT_AD_LINK, '_blank');
      setIsUnlocked(true);
    }
  };

  const toggleWatchlist = () => {
    try {
      const wl = JSON.parse(localStorage.getItem('cinema_watchlist') || '[]');
      let updated;
      if (inWatchlist) {
        updated = wl.filter((item: any) => item.id !== targetId);
        setInWatchlist(false);
      } else {
        updated = [...wl, {
          id: targetId,
          title: media?.title || details?.title || details?.name,
          poster_path: media?.poster_path || `https://image.tmdb.org/t/p/w500${details?.poster_path}`,
          vote_average: media?.vote_average || details?.vote_average,
          media_type: isTv ? 'tv' : 'movie'
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

  const scrollToPlayer = () => {
    document.getElementById('cinema-player-section')?.scrollIntoView({ behavior: 'smooth' });
    if (!isUnlocked) handlePlayClick();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-sm font-semibold animate-pulse">جاري تجهيز تجربة المشاهدة VIP...</span>
        </div>
      </div>
    );
  }

  const title = media?.title || details?.title || details?.name || 'تفاصيل العمل';
  const originalTitle = media?.original_title || details?.original_title || details?.original_name;
  const overview = details?.overview || media?.overview || 'قصة العمل السينمائي متوفرة بأعلى دقة مشاهدة مع ترجمة احترافية.';
  const poster = media?.poster_path?.startsWith('http') ? media.poster_path : (details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg');
  const backdrop = details?.backdrop_path ? `https://image.tmdb.org/t/p/original${details.backdrop_path}` : poster;
  const rating = details?.vote_average ? details.vote_average.toFixed(1) : (media?.vote_average || '8.5');
  const voteCount = details?.vote_count ? `${details.vote_count.toLocaleString()} تقييم` : 'تقييم ممتاز';
  const releaseYear = (details?.release_date || details?.first_air_date || media?.release_date || '2024').substring(0, 4);
  const runtime = details?.runtime ? `${Math.floor(details.runtime / 60)}س و ${details.runtime % 60}د` : (details?.episode_run_time?.[0] ? `${details.episode_run_time[0]} دقيقة لكل حلقة` : 'ساعتان تقريباً');
  const genres = details?.genres?.map((g: any) => g.name) || media?.genres || ['سينما بلاس', 'أكشن', 'مترجم'];
  const cast = details?.credits?.cast?.slice(0, 8) || [];
  const recommendations = details?.recommendations?.results?.slice(0, 6) || details?.similar?.results?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-16 pb-20 selection:bg-red-600 selection:text-white">

      {/* 🌟 هيدر سينمائي ضخم عالي الإبهار (Hero Cinematic Backdrop) */}
      <div className="relative w-full min-h-[550px] md:min-h-[620px] flex items-end pb-12 px-4 md:px-12 overflow-hidden">
        {/* صورة الخلفية مع تأثير نيون وضباب سينمائي */}
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105 filter blur-[1px] transform transition-transform duration-1000"
          style={{ backgroundImage: `url(${backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-[#08080a]/30"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-transparent to-[#08080a]/60"></div>
        </div>

        {/* محتوى البانر الرئيسي */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center md:items-end gap-8">
          
          {/* بوستر الفيلم مع إطار فخم وتأثير 3D */}
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

          {/* نصوص ومعلومات الهيدر */}
          <div className="flex-1 space-y-4 text-center md:text-right">
            
            {/* الشارات والوسوم */}
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
                ترجمة عربية مدمجة
              </span>
            </div>

            {/* العنوان الرئيسي والاسم الأصلي */}
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

            {/* تصنيفات العمل */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-1">
              {genres.map((g: string, i: number) => (
                <span key={i} className="text-xs text-zinc-300 bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/5 transition">
                  {g}
                </span>
              ))}
            </div>

            {/* أزرار العمليات الرئيسية */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3">
              <button
                onClick={scrollToPlayer}
                className="px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-red-600/50 hover:shadow-red-600/80 transition-all transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>مشاهدة العمل الآن</span>
              </button>

              {trailerKey && (
                <button
                  onClick={() => setShowTrailer(!showTrailer)}
                  className="px-5 py-3.5 bg-zinc-900/90 hover:bg-zinc-800 text-white rounded-xl font-bold text-sm border border-zinc-700 flex items-center gap-2 transition"
                >
                  <Youtube className="w-5 h-5 text-red-500" />
                  <span>{showTrailer ? 'إخفاء الإعلان' : 'الإعلان الرسمي'}</span>
                </button>
              )}

              <button
                onClick={toggleWatchlist}
                className={`p-3.5 rounded-xl border transition flex items-center gap-2 text-sm font-bold ${
                  inWatchlist 
                    ? 'bg-red-600/20 border-red-500 text-red-400' 
                    : 'bg-zinc-900/90 hover:bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}
                title="أضف إلى قائمتي"
              >
                <Heart className={`w-5 h-5 ${inWatchlist ? 'fill-red-500 text-red-500' : ''}`} />
                <span className="hidden sm:inline">{inWatchlist ? 'في قائمتي' : 'أضف لقائمتي'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-3.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-300 hover:text-white transition flex items-center gap-1.5 text-sm font-bold"
                title="مشاركة"
              >
                {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
                <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'مشاركة'}</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 🎬 نافذة الإعلان الترويجي الرسمي (Trailer) إن وجد وتم النقر عليه */}
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

      {/* 📺 قسم مشغل الفيديو الفخم (Cinema Player Section) */}
      <div id="cinema-player-section" className="max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-6">

        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
            <h2 className="text-xl md:text-2xl font-black text-white">مشغل سينما بلاس VIP</h2>
          </div>
          <div className="text-xs text-zinc-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>ترجمة عربية فورية تلقائية</span>
          </div>
        </div>

        {/* شاشة العرض الرئيسية */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 hover:bg-black/65 cursor-pointer transition group"
              style={{
                backgroundImage: `url(${backdrop})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/60 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">انقر هنا لبدء المشاهدة بأعلى دقة</h3>
                <p className="text-sm text-zinc-400 max-w-md">يتم تفعيل الترجمة العربية تلقائياً فور بدء المشغل</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفرات فائقة السرعة وبدون تقطيع</span>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              key={`${currentIframe}-${selectedSeason}-${selectedEpisode}`}
              src={currentIframe}
              referrerPolicy="no-referrer"
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            ></iframe>
          )}
        </div>

        {/* مبدل السيرفرات وإرشادات الترجمة */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2 text-zinc-300">
              <Server className="w-4 h-4 text-red-500" />
              <span>سيرفرات العرض (إذا واجهت أي بطء بدّل السيرفر فوراً):</span>
            </div>
            <span className="text-zinc-400 text-xs bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              💡 يمكنك اختيار الخط وتعديل الترجمة من أيقونة [CC] داخل الفيديو
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {servers.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveServerUrl(srv.url);
                  setActiveServerName(srv.name);
                  if (!isUnlocked) handlePlayClick();
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  currentIframe === srv.url
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-850 bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* اختيار المواسم والحلقات للمسلسلات */}
        {isTv && (
          <div className="bg-[#121216] border border-zinc-800 rounded-xl p-5 space-y-4">
            {seasons.length > 1 && (
              <div>
                <span className="text-xs text-zinc-400 font-bold block mb-2 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-red-500" />
                  المواسم المتاحة:
                </span>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => loadEpisodes(targetId, s.season_number)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        selectedSeason === s.season_number 
                          ? 'bg-red-600 text-white shadow-md' 
                          : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                      }`}
                    >
                      {s.name || `الموسم ${s.season_number}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-zinc-400 font-bold block mb-2 flex items-center gap-1.5">
                <Tv className="w-4 h-4 text-red-500" />
                الحلقات ({episodes.length} حلقة):
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1">
                {episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => {
                      setSelectedEpisode(ep.episode_number);
                      if (!isUnlocked) handlePlayClick();
                    }}
                    className={`py-2 px-2 rounded-lg text-xs font-bold transition border ${
                      selectedEpisode === ep.episode_number
                        ? 'bg-red-600 border-red-500 text-white shadow-md'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    الحلقة {ep.episode_number}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 📑 قسم القصة، طاقم العمل، والتفاصيل الكاملة */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* العمود الأيمن: القصة + الممثلين + الأعمال المشابهة */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* قصة العمل */}
          <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-red-500" />
              <span>قصة العمل:</span>
            </h3>
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base font-normal">
              {overview}
            </p>
          </div>

          {/* طاقم التمثيل والنجوم (Cast) مع صورهم */}
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
                    href={`/watch/${item.id}`} 
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

        {/* العمود الأيسر: بطاقة البيانات الفنية + بوابات التحميل */}
        <div className="space-y-6">

          {/* بطاقة معلومات العمل */}
          <div className="bg-[#121216] border border-zinc-800/80 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white border-b border-zinc-800 pb-3">
              بطاقة معلومات العمل
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">النوع / التصنيف:</span>
                <span className="font-bold text-zinc-200">{genres.join('، ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">سنة الإنتاج:</span>
                <span className="font-bold text-zinc-200">{releaseYear}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">التقييم العام:</span>
                <span className="font-bold text-yellow-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-yellow-400" />
                  {rating} / 10 ({voteCount})
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">مدة العرض:</span>
                <span className="font-bold text-zinc-200">{runtime}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                <span className="text-zinc-400">لغة العمل:</span>
                <span className="font-bold text-zinc-200">
                  {details?.original_language === 'en' ? 'الإنجليزية (مترجم)' : details?.original_language === 'ar' ? 'العربية' : details?.original_language || 'أصلي'}
                </span>
              </div>
              {details?.budget > 0 && (
                <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">الميزانية:</span>
                  <span className="font-bold text-emerald-400">${(details.budget / 1000000).toFixed(1)} مليون</span>
                </div>
              )}
              {details?.revenue > 0 && (
                <div className="flex justify-between py-1.5 border-b border-zinc-800/50">
                  <span className="text-zinc-400">الإيرادات:</span>
                  <span className="font-bold text-emerald-400">${(details.revenue / 1000000).toFixed(1)} مليون</span>
                </div>
              )}
            </div>
          </div>

          {/* بوابة التحميل فائقة السرعة */}
          <div className="bg-gradient-to-br from-[#121216] to-[#1a1414] border border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              <span>تحميل مباشر بأعلى جودة:</span>
            </h3>
            <p className="text-xs text-zinc-400">
              روابط تحميل مباشرة وسريعة تدعم استكمال التحميل على جميع الأجهزة
            </p>

            <div className="space-y-2.5 pt-2">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-between transition shadow-lg shadow-emerald-600/20"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>تحميل 1080p Full HD</span>
                </div>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">~ 2.4 GB</span>
              </a>

              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 rounded-xl font-bold text-xs flex items-center justify-between transition border border-zinc-700"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>تحميل 720p HD</span>
                </div>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">~ 1.1 GB</span>
              </a>

              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-bold text-xs flex items-center justify-between transition border border-zinc-800"
              >
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>تحميل 480p SD (للموبايل)</span>
                </div>
                <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">~ 450 MB</span>
              </a>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
