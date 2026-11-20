'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Play, Star, Calendar, Film, Tv, Share2, Download, 
  Server, Info, Users, Clapperboard, Layers, Volume2, FastForward
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [activeServer, setActiveServer] = useState(0);
  
  // حالات مشغل الفيديو وإعلان الـ Pre-Roll
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPreRoll, setShowPreRoll] = useState(false);
  const [adCountdown, setAdCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  
  const playerRef = useRef<HTMLDivElement>(null);
  const monetagDirectLink = "https://uplcm.com/4/12311730";

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (!data) return;
      setMedia(data);

      const { data: rel } = await supabase
        .from('media')
        .select('*')
        .neq('id', id)
        .limit(6);
      setRelated(rel || []);

      try {
        const type = data.media_type === 'tv' || data.media_type === 'series' ? 'tv' : 'movie';
        const res = await fetch(`https://api.themoviedb.org/3/${type}/${data.tmdb_id}/credits?api_key=204ce203e280acdfec221ea09ea5e763&language=ar`);
        const credits = await res.json();
        setCast(credits.cast?.slice(0, 10) || []);
      } catch (e) { console.error(e); }
    }
    loadData();
  }, [id]);

  // تشغيل العد التنازلي لإعلان الفيديو التمهيدي
  useEffect(() => {
    let timer: any;
    if (showPreRoll && adCountdown > 0) {
      timer = setInterval(() => {
        setAdCountdown((prev) => {
          if (prev <= 1) {
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [showPreRoll, adCountdown]);

  const handleStartWatching = () => {
    setShowPreRoll(true);
    setAdCountdown(5);
    setCanSkip(false);
    setIsPlaying(false);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleSkipAd = () => {
    window.open(monetagDirectLink, '_blank');
    setShowPreRoll(false);
    setIsPlaying(true);
  };

  if (!media) return <div className="min-h-screen bg-[#08080a]" />;

  const isMovie = !media.media_type || media.media_type === 'movie';
  const servers = [
    { name: 'سيرفر VIP 1 (مترجم تلقائي)', url: `https://vidlink.pro/${isMovie ? 'movie' : 'tv'}/${media.tmdb_id}?sub.ar=true&primaryColor=dc2626` },
    { name: 'سيرفر EmbedSU (ترجمة مدمجة)', url: `https://embed.su/embed/${isMovie ? 'movie' : 'tv'}/${media.tmdb_id}` },
    { name: 'سيرفر AutoEmbed الاحتياطي', url: `https://player.autoembed.cc/embed/${isMovie ? 'movie' : 'tv'}/${media.tmdb_id}` },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24">
      <Navbar />

      <div className="relative h-[55vh] w-full">
        <img src={getMediaBackdrop(media)} className="w-full h-full object-cover brightness-[0.25]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-48 relative z-10 space-y-12">
        {/* قسم تفاصيل العمل الرئيسي */}
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-56 sm:w-64 flex-shrink-0 mx-auto md:mx-0">
             <img src={getMediaPoster(media)} className="w-full rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.15)] border border-white/10" />
          </div>
          
          <div className="flex-1 space-y-6 pt-10 md:pt-32 text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-black tracking-tight" dir="ltr" style={{textAlign:'right'}}>{media.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
              <span className="text-yellow-400 flex items-center gap-1.5 bg-yellow-400/10 px-3 py-1.5 rounded-xl border border-yellow-400/20 font-bold">
                <Star className="w-4 h-4 fill-yellow-400" /> {getMediaRating(media)}
              </span>
              <span className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-gray-300 font-bold">{getMediaYear(media)}</span>
              <span className="bg-red-600/10 text-red-500 px-3 py-1.5 rounded-xl border border-red-600/20 font-black">1080p UltraHD</span>
            </div>

            <p className="text-gray-400 max-w-3xl leading-relaxed text-base md:text-lg">{media.overview}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={handleStartWatching}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-2xl shadow-red-600/40 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-6 h-6 fill-white" /> مشاهدة الفيلم
              </button>
              
              <a 
                href={monetagDirectLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all"
              >
                <Download className="w-5 h-5" /> تحميل مباشر (VIP)
              </a>
            </div>
          </div>
        </div>

        {/* مشغل الفيديو مع إعلان الـ Pre-Roll */}
        <div ref={playerRef} className="pt-6">
          {showPreRoll && (
            <div className="relative aspect-video w-full rounded-[2rem] overflow-hidden bg-black border border-red-600/40 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
              <div className="absolute inset-0 bg-cover bg-center filter blur-lg opacity-30" style={{ backgroundImage: `url(${getMediaBackdrop(media)})` }} />
              
              <div className="relative z-10 space-y-4 max-w-md">
                <span className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  إعلان فيديو راعي
                </span>
                
                <h3 className="text-xl md:text-2xl font-black text-white">
                  جاري تجهيز سيرفر المشاهدة فائق السرعة...
                </h3>

                <p className="text-xs text-gray-300">
                  انقر على الزر بالأسفل لفتح سيرفر VIP في نافذة جديدة بدون أي تقطيع
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={monetagDirectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-500 hover:brightness-110 text-white font-black px-6 py-3 rounded-xl text-sm transition-all shadow-lg"
                  >
                    دخول سيرفر VIP الآن 🚀
                  </a>

                  <button
                    onClick={handleSkipAd}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      canSkip 
                        ? 'bg-white text-black hover:bg-gray-200 cursor-pointer shadow-lg' 
                        : 'bg-white/10 text-gray-400 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    <FastForward className="w-4 h-4" />
                    <span>{canSkip ? 'تخطي الإعلان والتشغيل' : `تخطي بعد (${adCountdown})`}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-6">
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl ring-1 ring-white/5">
                <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen />
              </div>

              <div className="flex flex-wrap gap-3 justify-center bg-[#121318] p-3 rounded-2xl border border-white/5">
                {servers.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveServer(i)} 
                    className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${activeServer === i ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* بانر إعلاني في منتصف الصفحة */}
        <AdBanner slot="watch-middle" />

        {/* قسم طاقم العمل (Cast) */}
        {cast.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Users className="w-6 h-6 text-red-600" />
              <span>أبطال العمل</span>
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
              {cast.map((person) => (
                <div key={person.id} className="flex-shrink-0 w-24 text-center space-y-2">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/5 bg-[#181a20]">
                    <img 
                      src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=185&auto=format&fit=crop&q=60'} 
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] font-bold text-white line-clamp-1">{person.name}</p>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{person.character || 'ممثل'}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* قسم أعمال مشابهة */}
        {related.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <Layers className="w-6 h-6 text-red-600" />
              <span>أعمال قد تعجبك</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {related.map((item) => (
                <MovieCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* البانر السفلي اللاصق الاحترافي */}
      <AdBanner slot="sticky-footer" sticky={true} />
    </div>
  );
}
