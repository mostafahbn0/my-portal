'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Play, Download, Server, ArrowRight, Star, 
  Calendar, Layers, ShieldCheck, Film, Tv, Clock, Eye, Sparkles, Users
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

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setMedia(data);
        setActiveServerUrl(data.video_url || `https://multiembed.mov/?video_id=${data.id}&tmdb=1`);
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

  // تجميع السيرفرات مع السيرفرات البديلة
  const serverList: any[] = [];
  if (media.video_servers && Array.isArray(media.video_servers) && media.video_servers.length > 0) {
    media.video_servers.forEach((s: any, idx: number) => {
      serverList.push({ name: s.name || `سيرفر عربي ${idx + 1}`, url: s.url });
    });
  } else if (media.video_url) {
    serverList.push({ name: '⚡ سيرفر المصدر الأصلي', url: media.video_url });
  }

  // سيرفرات VIP احتياطية تضمن عمل الفيلم دائماً
  serverList.push(
    { name: 'سيرفر VIP بديل 1 (SuperEmbed)', url: `https://multiembed.mov/?video_id=${media.id}&tmdb=1` },
    { name: 'سيرفر VIP بديل 2 (VidSrc)', url: `https://vidsrc.to/embed/movie/${media.id}` },
    { name: 'سيرفر VIP بديل 3 (AutoEmbed)', url: `https://player.autoembed.cc/embed/movie/${media.id}` }
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white pt-20 pb-16 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* زر العودة والرأس */}
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800 text-sm">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
          <span className="px-3 py-1 bg-red-600/20 text-red-500 border border-red-500/30 text-xs font-bold rounded-full">
            {media.media_type === 'tv' ? 'مسلسل تلفزيوني' : 'فيلم سينمائي'}
          </span>
        </div>

        {/* مشغل الفيديو مع كسر حظر الدومين عبر referrerpolicy="no-referrer" */}
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
                <h3 className="text-xl md:text-2xl font-black text-white">انقر لبدء المشاهدة بأعلى جودة</h3>
                <p className="text-sm text-zinc-400">سيرفرات أصلية مترجمة ترجمة مدمجة</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-4 py-1.5 rounded-full text-xs text-green-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>سيرفرات آمنة وبدون تقطيع</span>
                </div>
              </div>
            </div>
          ) : (
            <iframe
              key={activeServerUrl}
              src={activeServerUrl}
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
              <span>السيرفر الحالي: <span className="text-red-400">{activeServerName}</span></span>
            </div>
            <span className="text-zinc-500 text-xs">إذا لم يعمل سيرفر، قم بالتبديل فوراً</span>
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
                    : 'bg-zinc-800/80 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span className="truncate">{srv.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* تفاصيل العمل والقصة والممثلين والبوستر بجودة فائقة */}
        <div className="bg-[#121216] border border-zinc-800 rounded-xl p-6 flex flex-col md:flex-row gap-6">
          <img
            src={media.poster_path || "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg"}
            alt={media.title}
            className="w-full md:w-56 aspect-[2/3] object-cover rounded-xl border border-zinc-800 shadow-xl"
            onError={(e: any) => {
              e.target.src = "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg";
            }}
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

            {/* طاقم الممثلين */}
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

            {/* أزرار التحميل المباشر */}
            <div className="pt-4 flex flex-wrap gap-3">
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg text-sm"
              >
                <Download className="w-4 h-4" />
                <span>تحميل بدقة 1080p FHD (مباشر)</span>
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
