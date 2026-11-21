'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, Layers, ShieldCheck, Film, Tv, Clock, Eye, Sparkles
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
  const [activeServerName, setActiveServerName] = useState<string>('سيرفر VIP الأصلي');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [sisterSeasons, setSisterSeasons] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setMedia(data);
        setActiveServerUrl(data.video_url || `https://vidsrc.to/embed/movie/${data.id}`);

        // حفظ في Continue Watching
        try {
          const stored = JSON.parse(localStorage.getItem('cinema_continue') || '[]');
          const filtered = stored.filter((item: any) => item.id !== data.id);
          filtered.unshift({
            id: data.id,
            title: data.title,
            poster: data.poster_path,
            type: data.media_type,
            date: new Date().toLocaleDateString('ar-EG')
          });
          localStorage.setItem('cinema_continue', JSON.stringify(filtered.slice(0, 10)));
        } catch (e) {}

        // البحث عن المواسم المرتبطة
        if (data.parent_id || data.media_type === 'tv') {
          const pId = data.parent_id || data.id;
          const { data: seasons } = await supabase
            .from('media')
            .select('*')
            .or(`parent_id.eq.${pId},id.eq.${pId}`)
            .neq('id', data.id);
          if (seasons) setSisterSeasons(seasons);
        }
      }
      setLoading(false);
    }

    loadData();
  }, [id]);

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
        <h2 className="text-2xl font-bold">عذراً، العمل غير متاح</h2>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-lg">العودة للرئيسية</Link>
      </div>
    );
  }

  // تجميع السيرفرات المتاحة
  const serverList = [];
  if (media.video_servers && Array.isArray(media.video_servers) && media.video_servers.length > 0) {
    media.video_servers.forEach((s: any, idx: number) => {
      serverList.push({ name: s.name || `سيرفر سينما ${idx + 1}`, url: s.url });
    });
  } else if (media.video_url) {
    serverList.push({ name: '⚡ سيرفر المصدر الأصلي (مترجم)', url: media.video_url });
  }

  // سيرفرات VIP إضافية احتياطية
  serverList.push(
    { name: 'سيرفر VIP 2 (VidSrc)', url: `https://vidsrc.to/embed/${media.media_type === 'tv' ? 'tv' : 'movie'}/${media.id}` },
    { name: 'سيرفر VIP 3 (SuperEmbed)', url: `https://multiembed.mov/?video_id=${media.id}&tmdb=1` },
    { name: 'سيرفر VIP 4 (AutoEmbed)', url: `https://player.autoembed.cc/embed/${media.media_type === 'tv' ? 'tv' : 'movie'}/${media.id}` }
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* رأس الصفحة */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-sm">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <div className="flex items-center gap-2">
            {media.season_number && media.media_type === 'tv' && (
              <span className="px-3 py-1 bg-zinc-800 border border-zinc-700 text-xs font-bold rounded-full text-zinc-300">
                الموسم {media.season_number}
              </span>
            )}
            <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold rounded-full">
              {media.media_type === 'tv' ? 'مسلسل' : 'فيلم سينمائي'}
            </span>
          </div>
        </div>

        {/* مشغل سينما بلاس المطور */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
          
          {/* علامة مائية باسم الموقع Logo Watermark */}
          <div className="absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-md border border-white/10 text-xs font-black tracking-wider text-red-500">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span>سينما بلاس VIP</span>
          </div>

          {!isUnlocked ? (
            <div 
              onClick={handlePlayClick}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 hover:bg-black/65 cursor-pointer transition"
              style={{
                backgroundImage: media.poster_path ? `url(${media.poster_path})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              <div className="absolute inset-0 bg-black/80 backdrop-blur-[2px]"></div>
              <div className="relative z-10 flex flex-col items-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-red-600 group-hover:bg-red-500 flex items-center justify-center text-white shadow-2xl shadow-red-600/60 transition-all transform group-hover:scale-110">
                  <Play className="w-10 h-10 fill-white translate-x-1" />
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white">بدء المشاهدة بأعلى جودة</h3>
                <p className="text-sm text-zinc-400">سيرفرات فائقة السرعة مع ترجمة عربية مدمجة</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفر آمن بدون تقطيع</span>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              key={activeServerUrl}
              src={activeServerUrl}
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
              <span>السيرفر الحالي: <span className="text-red-400">{activeServerName}</span></span>
            </div>
            <span className="text-zinc-500 text-xs">قم بالتبديل فوراً في حال البطء</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {serverList.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveServerUrl(srv.url);
                  setActiveServerName(srv.name);
                  if (!isUnlocked) handlePlayClick();
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  activeServerUrl === srv.url
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'bg-zinc-850 bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* قسم المواسم المرتبطة (إن وُجدت) مع بوسترات مختلفة */}
        {sisterSeasons.length > 0 && (
          <div className="bg-[#121216] border border-zinc-800 rounded-xl p-5 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-red-500" />
              <span>المواسم الأخرى لهذا المسلسل:</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {sisterSeasons.map((s) => (
                <Link
                  key={s.id}
                  href={`/watch/${s.id}`}
                  className="group relative rounded-lg overflow-hidden border border-zinc-800 hover:border-red-600 transition"
                >
                  <img src={s.poster_path} alt={s.title} className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex flex-col justify-end p-2 text-center">
                    <span className="text-xs font-bold text-white group-hover:text-red-400">
                      الموسم {s.season_number || 'الجديد'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* تفاصيل العمل وأزرار التحميل */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <img
            src={media.poster_path}
            alt={media.title}
            className="w-full md:w-56 aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow-md"
          />
          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-black text-white">{media.title}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star className="w-4 h-4 fill-yellow-500" />
                {media.vote_average || '8.6'}
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
              {media.overview || 'قصة العمل متوفرة للمشاهدة المباشرة بدقة أصلية.'}
            </p>

            {/* أزرار التحميل المباشر بأعلى عائد */}
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
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold px-5 py-3 rounded-xl transition border border-zinc-700 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تحميل بدقة 720p HD</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
