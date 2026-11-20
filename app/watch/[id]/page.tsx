"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getImg } from '@/lib/utils';
import { Play, Star, Calendar, Clock, Download, Users, Film, Tv, ShieldCheck } from 'lucide-react';

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
        // تحميل الحلقات إذا كان مسلسل
        if (data.type !== 'movie') {
          const { data: epData } = await supabase
            .from('episodes')
            .select('*')
            .eq('media_id', data.id)
            .order('episode_number', { ascending: true });
          
          if (epData && epData.length > 0) {
            setEpisodes(epData);
          } else {
            // توليد حلقات افتراضية بالصور إذا لم تكن موجودة
            const dummy = Array.from({ length: 12 }, (_, i) => ({
              id: i + 1,
              season_number: 1,
              episode_number: i + 1,
              title: `الحلقة ${i + 1}`,
              image: data.backdrop_path || data.poster_path
            }));
            setEpisodes(dummy);
          }
        }

        // جلب تفاصيل طاقم العمل من TMDB
        try {
          const tmdbEndpoint = data.type === 'movie' ? 'movie' : 'tv';
          const res = await fetch(`https://api.themoviedb.org/3/${tmdbEndpoint}/${data.tmdb_id}?api_key=204ce203e280acdfec221ea09ea5e763&append_to_response=credits&language=ar-SA`);
          const info = await res.json();
          setTmdbData(info);
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    loadWork();
  }, [id]);

  // دالة المشاهدة المربحة: تفتح رابط إعلاني في نافذة جديدة ثم تظهر المشغل
  const handleStartWatching = () => {
    // فتح نافذة إعلانية جديدة (Pop-under Simulation / Smartlink)
    window.open("https://www.google.com", "_blank");
    setShowPlayer(true);
    setTimeout(() => {
      document.getElementById('player-screen')?.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-red-600 font-bold">جاري تحميل السينما...</div>;
  }

  if (!media) {
    return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">العمل غير موجود</div>;
  }

  const isMovie = media.type === 'movie';
  const servers = [
    { name: 'سيرفر VIP السريع', url: isMovie ? `https://vidsrc.to/embed/movie/${media.tmdb_id}` : `https://vidsrc.to/embed/tv/${media.tmdb_id}/${selectedSeason}/${selectedEpisode}` },
    { name: 'سيرفر VidSrc Direct', url: isMovie ? `https://vidsrc.me/embed/movie?tmdb=${media.tmdb_id}` : `https://vidsrc.me/embed/tv?tmdb=${media.tmdb_id}&sea=${selectedSeason}&epi=${selectedEpisode}` },
    { name: 'سيرفر Multi-Quality', url: isMovie ? `https://embed.su/embed/movie/${media.tmdb_id}` : `https://embed.su/embed/tv/${media.tmdb_id}/${selectedSeason}/${selectedEpisode}` }
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      <AdBanner type="top" />

      {/* خلفية العمل والبوستر وتفاصيل البداية */}
      <div className="relative w-full py-8 md:py-12 overflow-hidden border-b border-white/5">
        <img 
          src={getImg(media.backdrop_path, 'original')} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/80 to-transparent" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
            
            {/* البوستر بالحجم المتناسق */}
            <div className="w-48 sm:w-56 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img src={getImg(media.poster_path)} alt={media.title} className="w-full h-auto object-cover" />
            </div>

            {/* تفاصيل العمل وأزرار المشاهدة */}
            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mb-3">
                <span className="bg-red-600 text-white font-bold text-xs px-2 py-0.5 rounded">WEB-DL</span>
                <span className="bg-yellow-500/20 text-yellow-400 font-bold text-xs px-2 py-0.5 rounded flex items-center gap-1 border border-yellow-500/30">
                  <Star size={13} fill="currentColor" /> {media.vote_average ? Number(media.vote_average).toFixed(1) : '6.5'}
                </span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Calendar size={13} /> {media.release_date || '2024'}
                </span>
                <span className="text-gray-400 text-xs flex items-center gap-1">
                  <Clock size={13} /> {media.duration || 'ساعتان'}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black mb-3 text-white leading-tight">{media.title}</h1>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mb-4">
                {media.genres && media.genres.map((g: string) => (
                  <span key={g} className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[11px] text-gray-300">
                    {g}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed max-w-2xl mb-6 line-clamp-3">
                {media.overview || 'لا يوجد ملخص متاح حالياً لهذا العمل، يمكنك الاستمتاع بمشاهدته بجودة عالية فوراً.'}
              </p>

              {/* أزرار المشاهدة والتحميل */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <button 
                  onClick={handleStartWatching}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-600/30 hover:scale-105"
                >
                  <Play size={18} fill="currentColor" /> مشاهدة الآن (أعلى جودة)
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
        
        {/* شاشة العرض (مشغل الفيديو) يظهر عند الضغط */}
        {showPlayer && (
          <div id="player-screen" className="mb-12 scroll-mt-20">
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-sm text-red-500 flex items-center gap-2">
                <Film size={18} /> مشغل الفيديو
              </span>
              <div className="flex gap-1.5 bg-white/5 p-1 rounded-lg border border-white/10">
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

            <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe
                src={servers[activeServer].url}
                className="w-full h-full"
                allowFullScreen
                scrolling="no"
              />
            </div>
          </div>
        )}

        {/* إذا كان العمل مسلسلاً: عرض الحلقات في هيئة مربعات مصغرة بالصور */}
        {!isMovie && (
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Tv size={20} className="text-red-600" /> حلقات المسلسل (اختر الحلقة للمشاهدة)
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => {
                const isCurrent = selectedEpisode === ep.episode_number;
                return (
                  <button
                    key={ep.id}
                    onClick={() => {
                      setSelectedEpisode(ep.episode_number);
                      handleStartWatching();
                    }}
                    className={`group text-right rounded-xl overflow-hidden border transition-all ${isCurrent ? 'border-red-600 bg-red-600/10' : 'border-white/5 bg-[#121216] hover:border-red-600/50'}`}
                  >
                    <div className="relative aspect-video overflow-hidden bg-black/60">
                      <img 
                        src={getImg(ep.image || media.backdrop_path)} 
                        alt={ep.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <Play size={20} fill="currentColor" className="text-white bg-red-600 p-1 rounded-full" />
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/70 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">
                        حلقة {ep.episode_number}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-white truncate">{ep.title}</p>
                      <span className="text-[10px] text-gray-400">سيرفر سريع</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* طاقم العمل والإعلانات الجانبية */}
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
                      <img 
                        src={getImg(actor.profile_path)} 
                        alt={actor.name} 
                        className="w-10 h-10 rounded-full object-cover border border-red-600/40" 
                      />
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-white truncate">{actor.name}</p>
                        <p className="text-[10px] text-gray-400 truncate">{actor.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* روابط التحميل المباشر */}
            <div id="downloads" className="bg-[#121216] border border-white/5 p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-r-4 border-red-600 pr-3">
                <Download size={18} className="text-red-600" /> روابط التحميل المباشر
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <a 
                  href="#" 
                  onClick={handleStartWatching} 
                  className="bg-white/5 hover:bg-red-600 hover:text-white border border-white/5 p-3 rounded-xl flex justify-between items-center transition group"
                >
                  <div>
                    <p className="font-bold text-xs">جودة 1080p FHD</p>
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
                    <p className="font-bold text-xs">جودة 720p HD</p>
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
                    <p className="font-bold text-xs">جودة 480p SD</p>
                    <span className="text-[10px] text-gray-400 group-hover:text-white">حجم 450 ميجا</span>
                  </div>
                  <Download size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* عمود إعلاني جانبي */}
          <aside className="space-y-6">
            <AdBanner type="rectangle" />
            <div className="bg-[#121216] border border-white/5 p-4 rounded-xl text-xs space-y-2 text-gray-400">
              <div className="flex items-center gap-2 text-green-400 font-bold mb-1">
                <ShieldCheck size={16} /> سيرفرات آمنة ومحدثة
              </div>
              <p>إذا واجهت بطئاً في المشغل أو لم يعمل، جرب التبديل بين السيرفرات بالأعلى أو إعادة تحميل الصفحة.</p>
            </div>
          </aside>
        </div>

      </div>

      <AdBanner type="sticky" />
    </main>
  );
}
