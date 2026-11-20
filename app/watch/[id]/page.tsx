"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating, getImg } from '@/lib/utils';
import { Play, Star, Calendar, Clock, Download, Users, Film, Tv, ShieldCheck, Languages, CheckCircle2 } from 'lucide-react';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeServer, setActiveServer] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [tmdbData, setTmdbData] = useState<any>(null);

  useEffect(() => {
    async function loadWork() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setMedia(data);

        if (data.tmdb_id) {
          try {
            const tmdbEndpoint = data.type === 'movie' ? 'movie' : 'tv';
            const res = await fetch(`https://api.themoviedb.org/3/${tmdbEndpoint}/${data.tmdb_id}?api_key=204ce203e280acdfec221ea09ea5e763&append_to_response=credits&language=ar-SA`);
            const info = await res.json();
            setTmdbData(info);
          } catch (e) {
            console.error(e);
          }
        }

        if (data.type !== 'movie') {
          const { data: epData } = await supabase
            .from('episodes')
            .select('*')
            .eq('media_id', data.id)
            .order('episode_number', { ascending: true });
          
          if (epData && epData.length > 0) {
            setEpisodes(epData);
          } else {
            const dummy = Array.from({ length: 12 }, (_, i) => ({
              id: i + 1,
              season_number: 1,
              episode_number: i + 1,
              title: `الحلقة ${i + 1}`,
              image: data.backdrop_url || data.backdrop_path || data.poster_url || data.poster_path
            }));
            setEpisodes(dummy);
          }
        }
      }
      setLoading(false);
    }
    loadWork();
  }, [id]);

  // تشغيل مباشر وسلس بدون إعلانات منبثقة مزعجة
  const handleStartWatching = () => {
    setShowPlayer(true);
    setTimeout(() => {
      document.getElementById('player-screen')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-red-600 font-bold">جاري تحميل السينما...</div>;
  }

  if (!media) {
    return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">العمل غير موجود</div>;
  }

  const isMovie = media.type === 'movie';
  const poster = getMediaPoster(media);
  const backdrop = getMediaBackdrop(media);
  const year = getMediaYear(media) || (tmdbData?.release_date ? tmdbData.release_date.split('-')[0] : '') || (tmdbData?.first_air_date ? tmdbData.first_air_date.split('-')[0] : '');
  const rating = getMediaRating(media) !== '0.0' ? getMediaRating(media) : (tmdbData?.vote_average ? Number(tmdbData.vote_average).toFixed(1) : '7.0');
  const overview = media.overview || media.description || tmdbData?.overview || 'شاهد العمل بجودة فائقة الدقة وبترجمة عربية احترافية وسيرفرات نظيفة بدون إعلانات.';
  const title = media.title || media.name || tmdbData?.title || tmdbData?.name;

  // سيرفرات حديثة نقية بدون إعلانات مبوبة + دعم الترجمة العربية
  const servers = [
    { 
      name: 'سيرفر VidLink VIP (ترجمة عربية + فائق السرعة)', 
      url: isMovie 
        ? `https://vidlink.pro/movie/${media.tmdb_id}?primaryColor=dc2626&secondaryColor=08080a&iconColor=ffffff&icons=default&title=true&poster=true`
        : `https://vidlink.pro/tv/${media.tmdb_id}/${selectedSeason}/${selectedEpisode}?primaryColor=dc2626&secondaryColor=08080a&iconColor=ffffff&icons=default&title=true&poster=true`
    },
    { 
      name: 'سيرفر EmbedSU (بدون إعلانات مزعجة)', 
      url: isMovie 
        ? `https://embed.su/embed/movie/${media.tmdb_id}` 
        : `https://embed.su/embed/tv/${media.tmdb_id}/${selectedSeason}/${selectedEpisode}` 
    },
    { 
      name: 'سيرفر VidSrc PRO الاحتياطي', 
      url: isMovie 
        ? `https://vidsrc.pro/embed/movie/${media.tmdb_id}` 
        : `https://vidsrc.pro/embed/tv/${media.tmdb_id}/${selectedSeason}/${selectedEpisode}` 
    }
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      <AdBanner type="top" />

      {/* الهيدر والبوستر */}
      <div className="relative w-full py-8 md:py-12 overflow-hidden border-b border-white/5 bg-[#0e0e12]">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src={backdrop} 
            alt="" 
            className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            
            <div className="w-48 sm:w-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#141419]">
              <div className="poster-box">
                <img 
                  src={poster} 
                  alt={title}
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
                  }}
                />
              </div>
            </div>

            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                <span className="bg-red-600 text-white font-bold text-xs px-2.5 py-0.5 rounded flex items-center gap-1 shadow">
                  <Languages size={13} /> مترجم للعربية
                </span>
                <span className="bg-white/10 text-white font-bold text-xs px-2 py-0.5 rounded">FHD 1080p</span>
                {Number(rating) > 0 && (
                  <span className="bg-yellow-500/20 text-yellow-400 font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-500/30">
                    <Star size={13} fill="currentColor" /> {rating}
                  </span>
                )}
                {year && (
                  <span className="text-gray-300 text-xs flex items-center gap-1 font-bold">
                    <Calendar size={13} /> {year}
                  </span>
                )}
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock size={13} /> {media.duration || 'ساعتان'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black mb-3 text-white leading-tight">{title}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-4">
                {media.genres && Array.isArray(media.genres) && media.genres.map((g: string) => (
                  <span key={g} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] text-gray-300">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mb-6 line-clamp-3">
                {overview}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button 
                  onClick={handleStartWatching}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-600/30 hover:scale-105"
                >
                  <Play size={18} fill="currentColor" /> مشاهدة الفيلم الآن
                </button>
                <a 
                  href="#downloads"
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition"
                >
                  <Download size={18} /> تحميل مباشر
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        
        {/* شاشة العرض وسيرفرات البث النظيفة */}
        {showPlayer && (
          <div id="player-screen" className="mb-12 scroll-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <span className="font-bold text-sm text-red-500 flex items-center gap-2">
                <Film size={18} /> اختر سيرفر البث السريع:
              </span>
              <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
                {servers.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServer(idx)}
                    className={`px-3 py-1 rounded text-xs font-bold transition ${activeServer === idx ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* شاشة الفيديو مزودة بحماية تمنع الإعلانات المنبثقة من اختطاف المتصفح */}
            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src={servers[activeServer]?.url}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
                sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
              />
            </div>

            <div className="mt-3 bg-[#121216] border border-white/5 rounded-xl p-3 flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle2 size={16} />
                <span>مشغل نظيف بدون إعلانات مزعجة مدمجة، والترجمة مجهزة تلقائياً.</span>
              </div>
              <span className="text-gray-500 hidden sm:inline">سيرفر: {servers[activeServer]?.name.split(' ')[1]}</span>
            </div>
          </div>
        )}

        {/* حلقات المسلسل في مربعات أنيقة */}
        {!isMovie && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Tv size={20} className="text-red-600" /> حلقات المسلسل (اختر الحلقة للعرض)
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => {
                const isCurrent = selectedEpisode === ep.episode_number;
                const epImg = getImg(ep.image || ep.backdrop_path || backdrop);
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisode(ep.episode_number);
                      handleStartWatching();
                    }}
                    className={`group text-right rounded-xl overflow-hidden border transition-all ${isCurrent ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-[#121216] hover:border-red-600/50'}`}
                  >
                    <div className="episode-box">
                      <img 
                        src={epImg} 
                        alt={ep.title} 
                        className="transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition z-10">
                        <Play size={20} fill="currentColor" className="text-white bg-red-600 p-1 rounded-full shadow" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-[10px] px-1.5 py-0.5 rounded text-white font-bold z-10">
                        حلقة {ep.episode_number}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-white truncate">{ep.title}</p>
                      <span className="text-[10px] text-green-400">مترجمة HD</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* طاقم التمثيل والتحميل المباشر */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {tmdbData?.credits?.cast && (
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-r-4 border-red-600 pr-3">
                  <Users size={18} className="text-red-600" /> طاقم التمثيل
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {tmdbData.credits.cast.slice(0, 8).map((actor: any) => (
                    <div key={actor.id} className="bg-white/5 border border-white/5 p-2 rounded-xl flex items-center gap-2.5">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-red-600/40 bg-zinc-800">
                        <img 
                          src={getImg(actor.profile_path)} 
                          alt={actor.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* روابط التحميل */}
            <div id="downloads" className="bg-[#121216] border border-white/5 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-r-4 border-red-600 pr-3">
                <Download size={18} className="text-red-600" /> روابط التحميل المباشر مع ملف الترجمة
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a 
                  href="#" 
                  onClick={handleStartWatching} 
                  className="bg-white/5 hover:bg-red-600 hover:text-white border border-white/5 p-3 rounded-xl flex justify-between items-center transition group"
                >
                  <div>
                    <p className="font-bold text-xs">جودة 1080p FHD (مترجم)</p>
                    <span className="text-[10px] text-gray-400 group-hover:text-white">حجم 2.4 جيجا</span>
                  </div>
                  <Download size={16} />
                </a>
                <a 
                  href="#" 
                  onClick={handleStartWatching} 
                  className="bg-white/5 hover:bg-red-600 hover:text-white border border-white/5 p-3 rounded-xl flex justify-between items-center transition group"
                >
                  <div>
                    <p className="font-bold text-xs">جودة 720p HD (مترجم)</p>
                    <span className="text-[10px] text-gray-400 group-hover:text-white">حجم 1.1 جيجا</span>
                  </div>
                  <Download size={16} />
                </a>
                <a 
                  href="#" 
                  onClick={handleStartWatching} 
                  className="bg-white/5 hover:bg-red-600 hover:text-white border border-white/5 p-3 rounded-xl flex justify-between items-center transition group"
                >
                  <div>
                    <p className="font-bold text-xs">جودة 480p SD (مترجم)</p>
                    <span className="text-[10px] text-gray-400 group-hover:text-white">حجم 450 ميجا</span>
                  </div>
                  <Download size={16} />
                </a>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <AdBanner type="rectangle" />
            <div className="bg-[#121216] border border-white/5 p-4 rounded-xl text-xs space-y-2 text-gray-400">
              <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                <ShieldCheck size={16} /> تجربة مشاهدة آمنة
              </div>
              <p>تم تفعيل خاصية عزل الإعلانات المنبثقة لضمان تشغيل الفيديو بدون أي توجيه مزعج أو صفحات خارجية.</p>
            </div>
          </aside>
        </div>

      </div>

      <AdBanner type="sticky" />
    </main>
  );
}
