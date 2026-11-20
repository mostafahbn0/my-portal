'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Play, Star, Calendar, Download, Server, Volume2, FastForward, ShieldCheck } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [activeServer, setActiveServer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  const [adStep, setAdStep] = useState(0); // 0: Idle, 1: Fake Ad, 2: Play Movie
  
  const playerRef = useRef<HTMLDivElement>(null);
  const monetagDirectLink = "https://uplcm.com/4/12311730";

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      setMedia(data);
    }
    load();
  }, [id]);

  const handleAction = (type: 'play' | 'download') => {
    // الضغطة الأولى تفتح الإعلان دائماً لضمان الربح
    window.open(monetagDirectLink, '_blank');
    
    if (type === 'play') {
      setShowAdOverlay(true);
      setTimeout(() => {
        playerRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const startRealMovie = () => {
    setShowAdOverlay(false);
    setIsPlaying(true);
  };

  if (!media) return <div className="min-h-screen bg-[#08080a]" />;

  const isMovie = !media.media_type || media.media_type === 'movie';
  const servers = [
    { name: 'سيرفر VIP 1 (سريع جداً)', url: `https://vidlink.pro/${isMovie ? 'movie' : 'tv'}/${media.tmdb_id}?sub.ar=true` },
    { name: 'سيرفر EmbedSU (احتياطي)', url: `https://embed.su/embed/${isMovie ? 'movie' : 'tv'}/${media.tmdb_id}` },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />

      {/* خلفية البانر */}
      <div className="relative h-[50vh] w-full">
        <img src={getMediaBackdrop(media)} className="w-full h-full object-cover brightness-[0.2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-56 flex-shrink-0 mx-auto md:mx-0">
             <img src={getMediaPoster(media)} className="w-full rounded-2xl shadow-2xl border border-white/10" />
          </div>
          
          <div className="flex-1 space-y-6 pt-10 md:pt-32 text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-black">{media.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold">
              <span className="text-yellow-400 flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400" /> {getMediaRating(media)}
              </span>
              <span className="text-gray-400">{getMediaYear(media)}</span>
              <span className="bg-red-600/10 text-red-500 px-2 py-0.5 rounded">4K ULTRA HD</span>
            </div>

            <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">{media.overview}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => handleAction('play')}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-red-600/20 transition-all hover:scale-105"
              >
                <Play className="w-6 h-6 fill-white" /> مشاهدة بجودة عالية
              </button>
              
              <button 
                onClick={() => handleAction('download')}
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> تحميل مباشر
              </button>
            </div>
          </div>
        </div>

        {/* قسم المشغل الإعلاني / الحقيقي */}
        <div ref={playerRef} className="mt-16">
          {showAdOverlay && (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-[#0c0d12] border border-red-600/30 shadow-2xl flex flex-col items-center justify-center text-center p-6">
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded">SPONSORED AD</div>
              
              <div className="space-y-6 max-w-md animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center mx-auto text-red-600 border border-red-600/20">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-white">سيرفر المشاهدة VIP جاهز الآن</h3>
                  <p className="text-gray-400 text-xs mt-2">لقد قمت بفتح السيرفر فائق السرعة بنجاح. اضغط على الزر أدناه لبدء التشغيل الفوري.</p>
                </div>
                
                <button 
                  onClick={startRealMovie}
                  className="w-full bg-white text-black hover:bg-gray-200 font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl"
                >
                  <Play className="w-5 h-5 fill-black" /> تشغيل الفيلم الآن
                </button>
                <p className="text-[10px] text-gray-600">سيتم تفعيل المشغل في نافذة المشاهدة الحالية</p>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen />
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center bg-[#121318] p-3 rounded-2xl border border-white/5">
                {servers.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      window.open(monetagDirectLink, '_blank');
                      setActiveServer(i);
                    }} 
                    className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeServer === i ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* إعلان بانر ذكي */}
        <AdBanner slot="bottom" className="mt-12" />
      </div>
    </div>
  );
}
