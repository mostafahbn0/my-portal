"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Play, Star, Calendar, Download, Users, Film, Info } from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import { getImg } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [tmdbData, setTmdbData] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setMedia(data);
        try {
          const res = await fetch(`https://api.themoviedb.org/3/${data.type === 'movie' ? 'movie' : 'tv'}/${data.tmdb_id}?api_key=204ce203e280acdfec221ea09ea5e763&append_to_response=credits,videos&language=ar-SA`);
          setTmdbData(await res.json());
        } catch (e) { console.error(e); }
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-red-600 font-bold">جاري تحميل السينما...</div>;
  if (!media) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">العمل غير موجود</div>;

  const servers = [
    { name: 'سيرفر الأساسي', url: media.type === 'movie' ? `https://vidsrc.to/embed/movie/${media.tmdb_id}` : `https://vidsrc.to/embed/tv/${media.tmdb_id}/1/1` },
    { name: 'سيرفر VIP', url: media.type === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${media.tmdb_id}` : `https://vidsrc.me/embed/tv?tmdb=${media.tmdb_id}&sea=1&epi=1` },
    { name: 'سيرفر مباشر', url: media.type === 'movie' ? `https://embed.su/embed/movie/${media.tmdb_id}` : `https://embed.su/embed/tv/${media.tmdb_id}/1/1` },
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative h-[65vh] w-full">
        <img src={getImg(media.backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a/40] to-transparent" />
        
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-10">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end w-full">
            <img src={getImg(media.poster_path)} className="w-48 md:w-64 rounded-2xl shadow-2xl border border-white/10" alt={media.title} />
            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                <span className="bg-red-600 px-3 py-1 rounded font-bold text-sm">HD</span>
                <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={18} fill="currentColor" /> {media.vote_average?.toFixed(1)}</span>
                <span className="text-gray-300 flex items-center gap-1"><Calendar size={18} /> {media.release_date}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4">{media.title}</h1>
              <p className="text-gray-300 text-lg max-w-3xl mb-8 line-clamp-3">{media.overview}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button onClick={() => setShowPlayer(true)} className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105"><Play size={24} fill="currentColor" /> مشاهدة الآن</button>
                <button className="bg-white/10 hover:bg-white/20 px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"><Download size={24} /> تحميل</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {showPlayer && (
          <div className="mb-12">
            <div className="flex gap-2 mb-4 bg-white/5 p-2 rounded-xl inline-flex border border-white/10">
              {servers.map((s, i) => (
                <button key={i} onClick={() => setActiveServer(i)} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeServer === i ? 'bg-red-600 shadow-lg' : 'hover:bg-white/10 text-gray-400'}`}>{s.name}</button>
              ))}
            </div>
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen scrolling="no" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            {tmdbData?.credits?.cast && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-red-600" /> طاقم العمل</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {tmdbData.credits.cast.slice(0, 8).map((p: any) => (
                    <div key={p.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer">
                      <img src={getImg(p.profile_path)} className="w-12 h-12 rounded-full object-cover border border-red-600/50" alt="" />
                      <div className="overflow-hidden"><p className="font-bold text-sm truncate">{p.name}</p><p className="text-xs text-gray-500 truncate">{p.character}</p></div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold text-xl mb-4 border-r-4 border-red-600 pr-3">التصنيف</h3>
              <div className="flex flex-wrap gap-2">
                {media.genres?.map((g: any) => (
                  <span key={g} className="bg-white/10 px-3 py-1 rounded-md text-sm">{g}</span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
      <AdBanner type="sticky" />
    </main>
  );
}
