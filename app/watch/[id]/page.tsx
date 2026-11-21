'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, ShieldCheck, Film, Tv, Sparkles, Users, AlertCircle
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjgwNzc3MywiZXhwIjoyMDUyMzgzNzczfQ.c47YAnq5Ede_bYpWqYc1nLso19QpPZJ2fXqI3Xv1bX0'
);

const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';

export default function WatchPage() {
  const { id } = useParams();

  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeServerUrl, setActiveServerUrl] = useState<string>('');
  const [activeServerName, setActiveServerName] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // إعدادات المسلسلات
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    async function loadMedia() {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setMedia(data);
        if (data.media_type === 'tv') {
          fetchSeriesSeasons(data.id);
        }
      }
      setLoading(false);
    }

    loadMedia();
  }, [id]);

  async function fetchSeriesSeasons(tvId: any) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      if (data.seasons && data.seasons.length > 0) {
        const valid = data.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(valid);
        loadEpisodes(tvId, valid[0]?.season_number || 1);
      }
    } catch {
      setEpisodes(Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1 })));
    }
  }

  async function loadEpisodes(tvId: any, sNum: number) {
    setSelectedSeason(sNum);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${sNum}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      setEpisodes(data.episodes || Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    } catch {
      setEpisodes(Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    }
  }

  const isTv = media?.media_type === 'tv';

  // بناء السيرفرات الذكية المتاحة
  const buildServers = () => {
    if (!media) return [];
    const list: any[] = [];

    // 1. إذا كان الفيلم/المسلسل له سيرفرات خاصة (سينما عربية / ترجمة مدمجة)
    if (media.video_servers && Array.isArray(media.video_servers) && media.video_servers.length > 0) {
      media.video_servers.forEach((s: any, idx: number) => {
        list.push({ name: s.name || `سيرفر عربي ${idx + 1}`, url: s.url });
      });
    } else if (media.video_url) {
      list.push({ name: '⚡ سيرفر المصدر الأصلي (مترجم)', url: media.video_url });
    }

    // 2. سيرفرات VIP العالمية الأساسية (ترجمة عربية تلقائية)
    list.push(
      {
        name: 'سيرفر VIP 1 (VidLink - سريع)',
        url: isTv 
          ? `https://vidlink.pro/tv/${media.id}/${selectedSeason}/${selectedEpisode}?sub.ar=true` 
          : `https://vidlink.pro/movie/${media.id}?sub.ar=true`
      },
      {
        name: 'سيرفر VIP 2 (SuperEmbed)',
        url: isTv 
          ? `https://multiembed.mov/?video_id=${media.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}` 
          : `https://multiembed.mov/?video_id=${media.id}&tmdb=1`
      },
      {
        name: 'سيرفر VIP 3 (VidSrc Pro)',
        url: isTv 
          ? `https://vidsrc.pro/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}` 
          : `https://vidsrc.pro/embed/movie/${media.id}`
      },
      {
        name: 'سيرفر VIP 4 (AutoEmbed)',
        url: isTv 
          ? `https://player.autoembed.cc/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}` 
          : `https://player.autoembed.cc/embed/movie/${media.id}`
      }
    );

    return list;
  };

  const servers = buildServers();
  const currentIframe = activeServerUrl || servers[0]?.url || '';

  const handlePlayClick = () => {
    if (!isUnlocked) {
      window.open(DIRECT_AD_LINK, '_blank');
      setIsUnlocked(true);
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
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white space-y-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <h2 className="text-2xl font-bold">عذراً، العمل غير متوفر حالياً</h2>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-lg font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-sm">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold rounded-full">
            {isTv ? 'مسلسل تلفزيوني' : 'فيلم سينمائي'}
          </span>
        </div>

        {/* مشغل سينما بلاس المطور */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
          <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs font-black text-red-500">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span>سينما بلاس VIP</span>
          </div>

          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 hover:bg-black/65 cursor-pointer transition"
              style={{
                backgroundImage: media.backdrop_path ? `url(${media.backdrop_path})` : (media.poster_path ? `url(${media.poster_path})` : 'none'),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/60 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">انقر هنا لبدء العرض بدقة فائقة</h3>
                <p className="text-sm text-zinc-400">سيرفرات سريعة تدعم الترجمة العربية التلقائية</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>بث مباشر وسيرفرات آمنة</span>
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

        {/* مبدل السيرفرات */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2 text-zinc-300">
              <Server className="w-4 h-4 text-red-500" />
              <span>اختر سيرفر المشاهدة:</span>
            </div>
            <span className="text-zinc-500 text-xs">إذا واجهت أي بطء قم بالتبديل فوراً</span>
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
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  currentIframe === srv.url
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* قسم المسلسلات: المواسم والحلقات */}
        {isTv && (
          <div className="bg-[#121216] border border-zinc-800 rounded-xl p-5 space-y-4">
            {seasons.length > 1 && (
              <div>
                <span className="text-xs text-zinc-400 font-bold block mb-2">المواسم:</span>
                <div className="flex flex-wrap gap-2">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => loadEpisodes(media.id, s.season_number)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                        selectedSeason === s.season_number ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                      }`}
                    >
                      {s.name || `الموسم ${s.season_number}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <span className="text-xs text-zinc-400 font-bold block mb-2">الحلقات:</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-2">
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

        {/* تفاصيل العمل والقصة والممثلين */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <img
            src={media.poster_path}
            alt={media.title}
            className="w-full md:w-56 aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow-xl"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-white">{media.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="w-4 h-4 fill-yellow-500" />
                {media.vote_average || '8.5'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {media.release_date || '2024'}
              </span>
              <span className="flex items-center gap-1">
                <Film className="w-4 h-4" />
                {Array.isArray(media.genres) ? media.genres.join(' • ') : 'سينما بلاس VIP'}
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              {media.overview || 'قصة الفيلم متوفرة للمشاهدة المباشرة بدقة أصلية عالية.'}
            </p>

            {/* الممثلين */}
            {media.cast_list && media.cast_list.length > 0 && (
              <div className="pt-2">
                <span className="text-xs text-zinc-500 flex items-center gap-1 mb-1 font-bold">
                  <Users className="w-3.5 h-3.5 text-red-500" />
                  طاقم العمل والبطولة:
                </span>
                <p className="text-xs md:text-sm text-zinc-300 font-semibold">
                  {Array.isArray(media.cast_list) ? media.cast_list.join(' • ') : media.cast_list}
                </p>
              </div>
            )}

            {/* زر التحميل المباشر */}
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تحميل بدقة 1080p FHD (سيرفر مباشر)</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
