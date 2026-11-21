'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, ShieldCheck, Film, Tv, Sparkles, 
  Clock, Globe, Layers, ArrowLeft, Subtitles, CheckCircle2
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
  const [imdbId, setImdbId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeServerUrl, setActiveServerUrl] = useState<string>('');
  const [activeServerName, setActiveServerName] = useState<string>('سيرفر VIP 1 (مترجم عربي تلقائي)');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // إعدادات المسلسلات
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    async function loadWatchData() {
      if (!id) return;
      setLoading(true);

      // 1. جلب من Supabase
      const { data: dbData } = await supabase.from('media').select('*').eq('id', id).single();
      setMedia(dbData);

      const mediaType = dbData?.media_type || 'movie';

      // 2. جلب معرف الـ IMDb ID لضمان الترجمة 100%
      try {
        const extUrl = `https://api.themoviedb.org/3/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
        const res = await fetch(extUrl);
        const extData = await res.json();
        
        const extractedImdb = extData?.external_ids?.imdb_id || extData?.imdb_id;
        if (extractedImdb) {
          setImdbId(extractedImdb);
        }

        if (mediaType === 'tv') {
          const validSeasons = extData?.seasons?.filter((s: any) => s.season_number > 0) || [];
          setSeasons(validSeasons);
          if (validSeasons.length > 0) {
            loadEpisodes(id, validSeasons[0].season_number);
          }
        }
      } catch (err) {
        console.error("IMDb Fetch error:", err);
      }

      setLoading(false);
    }

    loadWatchData();
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

  const isTv = media?.media_type === 'tv';
  const targetId = media?.id || id;
  const targetImdb = imdbId || targetId;

  // ترسانة السيرفرات الذكية مع فرض الترجمة العربية التلقائية
  const servers = [
    {
      name: 'سيرفر VIP 1 (VidLink Pro - ترجمة عربية تلقائية)',
      url: isTv 
        ? `https://vidlink.pro/tv/${targetId}/${selectedSeason}/${selectedEpisode}?sub.ar=true&sub_default=ar&sub_lang=ar&primaryColor=dc2626`
        : `https://vidlink.pro/movie/${targetId}?sub.ar=true&sub_default=ar&sub_lang=ar&primaryColor=dc2626`
    },
    {
      name: 'سيرفر VIP 2 (SuperEmbed - متعدد الترجمات بدعم IMDb)',
      url: isTv 
        ? `https://multiembed.mov/?video_id=${targetImdb}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
        : `https://multiembed.mov/?video_id=${targetImdb}&tmdb=1`
    },
    {
      name: 'سيرفر VIP 3 (AutoEmbed VIP - لغة عربية مدمجة)',
      url: isTv 
        ? `https://player.autoembed.cc/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}?sub_lang=ar&default_sub=ar`
        : `https://player.autoembed.cc/embed/movie/${targetId}?sub_lang=ar&default_sub=ar`
    },
    {
      name: 'سيرفر VIP 4 (EmbedSu - جودة 1080p فائقة)',
      url: isTv 
        ? `https://embed.su/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : `https://embed.su/embed/movie/${targetId}`
    },
    {
      name: 'سيرفر VIP 5 (VidSrc Pro)',
      url: isTv 
        ? `https://vidsrc.pro/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : (imdbId ? `https://vidsrc.pro/embed/movie/${imdbId}` : `https://vidsrc.pro/embed/movie/${targetId}`)
    },
    {
      name: 'سيرفر VIP 6 (VidSrc CC)',
      url: isTv 
        ? `https://vidsrc.cc/v2/embed/tv/${targetId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.cc/v2/embed/movie/${targetId}`
    }
  ];

  // إذا كان هناك سيرفر عربي أصلي مرفوع
  if (media?.video_url) {
    servers.unshift({
      name: '⚡ سيرفر المصدر الأصلي (ترجمة مدمجة Hardsub)',
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-zinc-400 text-sm font-semibold animate-pulse">جاري تحضير سيرفرات الترجمة العربية...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* رأس الصفحة مع زر الرجوع للتفاصيل */}
        <div className="flex items-center justify-between">
          <Link 
            href={`/media/${id}`} 
            className="inline-flex items-center gap-2 text-zinc-300 hover:text-white transition bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-xs md:text-sm font-bold"
          >
            <ArrowRight className="w-4 h-4 text-red-500" />
            <span>العودة لصفحة تفاصيل الفيلم</span>
          </Link>

          <div className="flex items-center gap-2">
            {imdbId && (
              <span className="px-2.5 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded-md">
                IMDb: {imdbId}
              </span>
            )}
            <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold rounded-full">
              {isTv ? 'مسلسل VIP' : 'فيلم سينمائي'}
            </span>
          </div>
        </div>

        {/* شاشة العرض والمشغل السينمائي */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs font-black text-red-500">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span>سينما بلاس VIP</span>
          </div>

          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 hover:bg-black/65 cursor-pointer transition group"
              style={{
                backgroundImage: media?.backdrop_path ? `url(${media.backdrop_path})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/60 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">انقر لبدء المشاهدة بأعلى جودة</h3>
                <p className="text-sm text-zinc-400">سيرفرات فائقة السرعة مع ترجمة عربية مدمجة</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفرات آمنة 1080p بدون تقطيع</span>
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

        {/* إشعار الترجمة ومبدل السيرفرات */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs md:text-sm font-bold">
            <div className="flex items-center gap-2 text-zinc-300">
              <Server className="w-4 h-4 text-red-500" />
              <span>السيرفر الحالي: <span className="text-red-400">{activeServerName}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-xs bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>الترجمة العربية مفعلة تلقائياً</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
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
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name.split('(')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* مواسم وحلقات المسلسلات إن وجدت */}
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
    </div>
  );
}
