'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, Clock, 
  Calendar, Layers, ShieldCheck, Film, Tv, CheckCircle2, AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjgwNzc3MywiZXhwIjoyMDUyMzgzNzczfQ.c47YAnq5Ede_bYpWqYc1nLso19QpPZJ2fXqI3Xv1bX0'
);

const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';

export default function WatchPage() {
  const { id } = useParams();
  const router = useRouter();

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(1);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showAdNotice, setShowAdNotice] = useState(false);

  // إعدادات المسلسلات والمواسم
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activePart, setActivePart] = useState(0);

  // جلب تفاصيل العمل
  useEffect(() => {
    async function fetchMediaData() {
      if (!id) return;
      setLoading(true);

      // 1. البحث في Supabase أولاً
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setMedia(data);
        if (data.media_type === 'tv') {
          fetchSeriesDetails(data.id);
        }
      } else {
        // 2. الجلب من TMDB كخطة بديلة
        try {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
          const movieData = await res.json();
          if (movieData.id) {
            setMedia({ ...movieData, media_type: 'movie' });
          } else {
            const tvRes = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
            const tvData = await tvRes.json();
            if (tvData.id) {
              setMedia({ ...tvData, media_type: 'tv', title: tvData.name });
              fetchSeriesDetails(tvData.id);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }

    fetchMediaData();
  }, [id]);

  // جلب مواسم وحلقات المسلسل
  async function fetchSeriesDetails(tvId: any) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      if (data.seasons && data.seasons.length > 0) {
        const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(validSeasons.length > 0 ? validSeasons : [{ season_number: 1, episode_count: 24, name: 'الموسم 1' }]);
        loadEpisodes(tvId, validSeasons[0]?.season_number || 1);
      } else {
        generateFallbackEpisodes(1);
      }
    } catch {
      generateFallbackEpisodes(1);
    }
  }

  // تحميل حلقات موسم معين
  async function loadEpisodes(tvId: any, seasonNum: number) {
    setSelectedSeason(seasonNum);
    setActivePart(0);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNum}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      if (data.episodes && data.episodes.length > 0) {
        setEpisodes(data.episodes);
      } else {
        generateFallbackEpisodes(seasonNum);
      }
    } catch {
      generateFallbackEpisodes(seasonNum);
    }
  }

  function generateFallbackEpisodes(seasonNum: number) {
    const defaultEpisodes = Array.from({ length: 24 }, (_, i) => ({
      episode_number: i + 1,
      name: `الحلقة ${i + 1}`,
      still_path: null
    }));
    setEpisodes(defaultEpisodes);
  }

  // فتح المشغل بعد نقرة الإعلان
  const handlePlayClick = () => {
    if (!isUnlocked) {
      window.open(DIRECT_AD_LINK, '_blank');
      setIsUnlocked(true);
      setShowAdNotice(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">عذراً، لم يتم العثور على العمل</h2>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">العودة للرئيسية</Link>
      </div>
    );
  }

  const isTv = media.media_type === 'tv';

  // قائمة السيرفرات المحدثة بالكامل
  const servers = [
    {
      id: 1,
      name: 'سيرفر VIP 1 (VidLink - ترجمة فورية)',
      url: isTv 
        ? `https://vidlink.pro/tv/${media.id}/${selectedSeason}/${selectedEpisode}?sub.ar=true`
        : `https://vidlink.pro/movie/${media.id}?sub.ar=true`
    },
    {
      id: 2,
      name: 'سيرفر VIP 2 (SuperEmbed - سريع جداً)',
      url: isTv
        ? `https://multiembed.mov/?video_id=${media.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/?video_id=${media.id}&tmdb=1`
    },
    {
      id: 3,
      name: 'سيرفر VIP 3 (Vidsrc Pro)',
      url: isTv
        ? `https://vidsrc.pro/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pro/embed/movie/${media.id}`
    },
    {
      id: 4,
      name: 'سيرفر VIP 4 (Vidsrc CC)',
      url: isTv
        ? `https://vidsrc.cc/v2/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.cc/v2/embed/movie/${media.id}`
    },
    {
      id: 5,
      name: 'سيرفر VIP 5 (AutoEmbed Player)',
      url: isTv
        ? `https://player.autoembed.cc/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}`
        : `https://player.autoembed.cc/embed/movie/${media.id}`
    },
    {
      id: 6,
      name: 'سيرفر VIP 6 (SmashyStream)',
      url: isTv
        ? `https://player.smashy.stream/tv/${media.id}?s=${selectedSeason}&e=${selectedEpisode}`
        : `https://player.smashy.stream/movie/${media.id}`
    }
  ];

  // إضافة السيرفر العربي المباشر إذا كان مخزناً في قاعدة البيانات
  if (media.video_url) {
    servers.unshift({
      id: 0,
      name: '⚡ سيرفر المصدر العربي الأصلي (مترجم مدمج)',
      url: media.video_url
    });
  }

  const currentServerUrl = servers.find(s => s.id === activeServer)?.url || servers[0].url;

  // تقسيم الحلقات (Parts) إذا كانت الحلقات أكثر من 12
  const PART_SIZE = 12;
  const totalParts = Math.ceil(episodes.length / PART_SIZE);
  const visibleEpisodes = episodes.slice(activePart * PART_SIZE, (activePart + 1) * PART_SIZE);

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* رأس الصفحة والتنقل */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition bg-zinc-900/60 px-4 py-2 rounded-lg border border-zinc-800">
            <ArrowRight className="w-5 h-5" />
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold rounded-full">
              {isTv ? 'مسلسل تلفزيوني' : 'فيلم سينمائي'}
            </span>
          </div>
        </div>

        {/* المشغل الإعلاني المتطور */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 hover:bg-black/70 cursor-pointer transition group"
              style={{
                backgroundImage: media.backdrop_path ? `url(${media.backdrop_path})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/75"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-600/50 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">انقر هنا لبدء المشاهدة بأعلى جودة</h3>
                <p className="text-sm text-zinc-400 max-w-md">يتم تفعيل السيرفرات فائقة السرعة مع الترجمة العربية التلقائية بنقرة واحدة</p>
                <div className="flex items-center gap-2 bg-zinc-900/90 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفرات آمنة وبدون تقطيع</span>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              key={`${activeServer}-${selectedSeason}-${selectedEpisode}`}
              src={currentServerUrl}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            ></iframe>
          )}
        </div>

        {/* مبدل السيرفرات */}
        <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-zinc-300 font-bold text-sm">
            <Server className="w-4 h-4 text-red-500" />
            <span>اختر سيرفر المشاهدة (إذا واجهت بطء قم بالتبديل فوراً):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {servers.map((srv) => (
              <button
                key={srv.id}
                onClick={() => setActiveServer(srv.id)}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeServer === srv.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name.split(' ')[0] + ' ' + srv.name.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* أدوات الحلقات والمواسم (إذا كان مسلسلاً) */}
        {isTv && (
          <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-5 space-y-4">
            {/* اختيار الموسم */}
            {seasons.length > 1 && (
              <div>
                <h4 className="text-sm font-bold text-zinc-400 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-red-500" />
                  المواسم المتاحة:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => loadEpisodes(media.id, s.season_number)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        selectedSeason === s.season_number
                          ? 'bg-red-600 text-white'
                          : 'bg-zinc-850 text-zinc-400 hover:bg-zinc-700 hover:text-white bg-zinc-800'
                      }`}
                    >
                      {s.name || `الموسم ${s.season_number}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* تقسيم الأجزاء إذا كان هناك حلقات كثيرة */}
            {totalParts > 1 && (
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800/60">
                <span className="text-xs text-zinc-500 font-bold">عرض الحلقات:</span>
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: totalParts }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePart(i)}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        activePart === i ? 'bg-zinc-200 text-black' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      من {i * PART_SIZE + 1} إلى {Math.min((i + 1) * PART_SIZE, episodes.length)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* قائمة الحلقات */}
            <div>
              <h4 className="text-sm font-bold text-zinc-400 mb-3 flex items-center gap-2">
                <Tv className="w-4 h-4 text-red-500" />
                الحلقات:
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {visibleEpisodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => {
                      setSelectedEpisode(ep.episode_number);
                      if (!isUnlocked) handlePlayClick();
                    }}
                    className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                      selectedEpisode === ep.episode_number
                        ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <span>الحلقة {ep.episode_number}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* تفاصيل العمل والقصة والممثلين */}
        <div className="bg-[#121216] border border-zinc-800/80 rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <img
            src={media.poster_path?.startsWith('http') ? media.poster_path : `https://image.tmdb.org/t/p/w500${media.poster_path}`}
            alt={media.title || media.name}
            className="w-full md:w-52 aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow-lg"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-white">{media.title || media.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="w-4 h-4 fill-yellow-500" />
                {media.vote_average || '8.5'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {media.release_date || media.first_air_date || '2024'}
              </span>
              {media.genres && (
                <span className="flex items-center gap-1">
                  <Film className="w-4 h-4" />
                  {Array.isArray(media.genres) ? media.genres.join(' • ') : media.genres}
                </span>
              )}
            </div>

            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              {media.overview || 'لا يوجد ملخص متاح حالياً لهذا العمل.'}
            </p>

            {/* قسم الممثلين وطاقم العمل إن وجد */}
            {media.cast && (
              <div className="pt-2">
                <span className="text-xs text-zinc-500 block mb-1">طاقم العمل والبطولة:</span>
                <p className="text-sm font-semibold text-zinc-200">
                  {Array.isArray(media.cast) ? media.cast.join('، ') : media.cast}
                </p>
              </div>
            )}

            {/* زر التحميل فائق السرعة */}
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تحميل العمل بدقة 1080p (سيرفر مباشر)</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
