'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, Layers, ShieldCheck, Film, Tv, AlertCircle
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
  const [activeServerId, setActiveServerId] = useState<number>(1);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // إعدادات المسلسلات
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  useEffect(() => {
    async function fetchMediaData() {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setMedia(data);
        // إذا كان هناك رابط فيديو مسحوب نجعله الافتراضي
        if (data.video_url) {
          setActiveServerUrl(data.video_url);
          setActiveServerId(0);
        } else {
          setActiveServerUrl(
            data.media_type === 'tv'
              ? `https://vidsrc.to/embed/tv/${data.id}/1/1`
              : `https://vidsrc.to/embed/movie/${data.id}`
          );
        }

        if (data.media_type === 'tv') {
          fetchSeriesDetails(data.id);
        }
      } else {
        // Fallback TMDB
        try {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
          const movieData = await res.json();
          if (movieData.id) {
            setMedia({ ...movieData, media_type: 'movie' });
            setActiveServerUrl(`https://vidsrc.to/embed/movie/${movieData.id}`);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }

    fetchMediaData();
  }, [id]);

  async function fetchSeriesDetails(tvId: any) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      if (data.seasons && data.seasons.length > 0) {
        const validSeasons = data.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(validSeasons);
        loadEpisodes(tvId, validSeasons[0]?.season_number || 1);
      }
    } catch {
      // حلقات افتراضية
      setEpisodes(Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1 })));
    }
  }

  async function loadEpisodes(tvId: any, seasonNum: number) {
    setSelectedSeason(seasonNum);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/season/${seasonNum}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
      const data = await res.json();
      setEpisodes(data.episodes || Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    } catch {
      setEpisodes(Array.from({ length: 20 }, (_, i) => ({ episode_number: i + 1 })));
    }
  }

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
        <h2 className="text-2xl font-bold">عذراً، لم يتم العثور على العمل المطلوب</h2>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-lg font-bold hover:bg-red-700 transition">العودة للرئيسية</Link>
      </div>
    );
  }

  const isTv = media.media_type === 'tv';

  // إعداد قائمة السيرفرات المتوافقة
  const availableServers = [];

  if (media.video_url) {
    availableServers.push({
      id: 0,
      name: '⚡ سيرفر المصدر الأصلي (مترجم مدمج)',
      url: media.video_url
    });
  }

  availableServers.push(
    {
      id: 1,
      name: 'سيرفر VIP 1 (VidSrc TO)',
      url: isTv ? `https://vidsrc.to/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}` : `https://vidsrc.to/embed/movie/${media.id}`
    },
    {
      id: 2,
      name: 'سيرفر VIP 2 (SuperEmbed)',
      url: isTv ? `https://multiembed.mov/?video_id=${media.id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}` : `https://multiembed.mov/?video_id=${media.id}&tmdb=1`
    },
    {
      id: 3,
      name: 'سيرفر VIP 3 (VidSrc Pro)',
      url: isTv ? `https://vidsrc.pro/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}` : `https://vidsrc.pro/embed/movie/${media.id}`
    },
    {
      id: 4,
      name: 'سيرفر VIP 4 (AutoEmbed Player)',
      url: isTv ? `https://player.autoembed.cc/embed/tv/${media.id}/${selectedSeason}/${selectedEpisode}` : `https://player.autoembed.cc/embed/movie/${media.id}`
    }
  );

  const currentIframeSrc = availableServers.find(s => s.id === activeServerId)?.url || availableServers[0].url;

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
            {isTv ? 'مسلسل' : 'فيلم'}
          </span>
        </div>

        {/* شاشة المشغل */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 hover:bg-black/70 cursor-pointer transition group"
              style={{
                backgroundImage: media.poster_path ? `url(${media.poster_path})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/80"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-xl shadow-red-600/50 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">انقر هنا لبدء العرض بدقة فائقة</h3>
                <p className="text-sm text-zinc-400">مشاهدة مباشرة بدون إعلانات مزعجة مع ترجمة عربية مدمجة</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفر آمن وسريع 1080p</span>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              key={`${activeServerId}-${selectedSeason}-${selectedEpisode}`}
              src={currentIframeSrc}
              className="w-full h-full border-0"
              allowFullScreen
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            ></iframe>
          )}
        </div>

        {/* قائمة السيرفرات */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3 text-zinc-300 font-bold text-sm">
            <Server className="w-4 h-4 text-red-500" />
            <span>سيرفرات المشاهدة المتاحة:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableServers.map((srv) => (
              <button
                key={srv.id}
                onClick={() => {
                  setActiveServerId(srv.id);
                  if (!isUnlocked) handlePlayClick();
                }}
                className={`py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
                  activeServerId === srv.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* تفاصيل العمل والقصة */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <img
            src={media.poster_path}
            alt={media.title}
            className="w-full md:w-56 aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow-md"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-white">{media.title}</h1>
            
            <div className="flex items-center gap-4 text-xs text-zinc-400">
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
                {Array.isArray(media.genres) ? media.genres.join(' • ') : 'أكشن • سينما'}
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              {media.overview || 'قصة العمل متوفرة للمشاهدة المباشرة بأعلى جودة.'}
            </p>

            <div className="pt-4">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تحميل الفيلم بجودة 1080p (مباشر)</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
