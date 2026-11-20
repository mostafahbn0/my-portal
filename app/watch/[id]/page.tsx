'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Play, Star, Calendar, Film, Tv, Share2, Download, Server, Subtitles } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [activeServer, setActiveServer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // رابط الربح المباشر من موني تاج
  const monetagDirectLink = "https://uplcm.com/4/12311730";

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      setMedia(data);
    }
    load();
  }, [id]);

  if (!media) return <div className="min-h-screen bg-[#08080a]" />;

  const tmdbId = media.tmdb_id;
  const isMovie = !media.media_type || media.media_type === 'movie';
  const servers = [
    { name: 'سيرفر VIP 1 (مترجم)', url: `https://vidlink.pro/${isMovie ? 'movie' : 'tv'}/${tmdbId}?sub.ar=true&primaryColor=dc2626` },
    { name: 'سيرفر EmbedSU', url: `https://embed.su/embed/${isMovie ? 'movie' : 'tv'}/${tmdbId}` },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />
      <div className="relative h-[50vh] w-full">
        <img src={getMediaBackdrop(media)} className="w-full h-full object-cover brightness-[0.3]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-56 flex-shrink-0 mx-auto md:mx-0">
             <img src={getMediaPoster(media)} className="w-full rounded-2xl shadow-2xl border border-white/10" />
          </div>
          <div className="flex-1 space-y-5 pt-10 md:pt-24 text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-black" dir="ltr" style={{textAlign:'right'}}>{media.title}</h1>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold">
              <span className="text-yellow-400 flex items-center gap-1"><Star className="w-4 h-4 fill-yellow-400" /> {getMediaRating(media)}</span>
              <span className="text-gray-400 bg-white/5 px-2 py-1 rounded">{getMediaYear(media)}</span>
              <span className="text-red-500">مشاهدة مباشرة مترجمة</span>
            </div>
            <p className="text-gray-400 max-w-2xl leading-relaxed">{media.overview}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={() => { setIsPlaying(true); setTimeout(() => playerRef.current?.scrollIntoView({behavior:'smooth'}), 100); }} 
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-red-600/30 transition-all"
              >
                <Play className="w-6 h-6 fill-white" /> مشاهدة الفيلم
              </button>
              
              {/* زر التحميل المربح بالرابط المباشر */}
              <a 
                href={monetagDirectLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2"
              >
                <Download className="w-5 h-5" /> تحميل مباشر (Ads)
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12"><AdBanner slot="watch-middle" /></div>

        {isPlaying && (
          <div ref={playerRef} className="mt-12 space-y-6">
            <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10">
              <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              {servers.map((s, i) => (
                <button key={i} onClick={() => setActiveServer(i)} className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${activeServer === i ? 'bg-red-600' : 'bg-white/5 text-gray-400'}`}>
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
