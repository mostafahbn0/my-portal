"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Play, Star, Calendar, Download, Users, Info, Clock } from 'lucide-react';
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

  if (loading) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-red-600 font-bold">جاري التحميل...</div>;
  if (!media) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white text-2xl font-bold">العمل غير موجود</div>;

  const servers = [
    { name: 'سيرفر VIP', url: media.type === 'movie' ? `https://vidsrc.to/embed/movie/${media.tmdb_id}` : `https://vidsrc.to/embed/tv/${media.tmdb_id}/1/1` },
    { name: 'سيرفر مباشر', url: media.type === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${media.tmdb_id}` : `https://vidsrc.me/embed/tv?tmdb=${media.tmdb_id}&sea=1&epi=1` },
    { name: 'سيرفر احتياطي', url: media.type === 'movie' ? `https://embed.su/embed/movie/${media.tmdb_id}` : `https://embed.su/embed/tv/${media.tmdb_id}/1/1` },
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white dir-rtl" dir="rtl">
      <Navbar />
      
      {/* Hero Header */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img src={getImg(media.backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a/60] to-transparent" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-end">
            <img src={getImg(media.poster_path)} className="w-56 rounded-2xl shadow-2xl border border-white/10" alt={media.title} />
            <div className="flex-1 text-center md:text-right">
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mb-4">
                <span className="bg-red-600 px-3 py-1 rounded font-bold text-sm">HD</span>
                <span className="flex items-center gap-1 text-yellow-500 font-bold"><Star size={18} fill="currentColor" /> {media.vote_average?.toFixed(1)}</span>
                <span className="text-gray-300 flex items-center gap-1"><Calendar size={18} /> {media.release_date}</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{media.title}</h1>
              <p className="text-gray-300 text-lg max-w-3xl mb-8 line-clamp-3">{media.overview}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <button onClick={() => { setShowPlayer(true); window.scrollTo({top: 600, behavior: 'smooth'}); }} className="bg-red-600 hover:bg-red-700 px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-xl shadow-red-600/20"><Play size={24} fill="currentColor" /> مشاهدة الآن</button>
                <button className="bg-white/10 hover:bg-white/20 px-10 py-4 rounded-xl font-bold flex items-center gap-2 transition-all"><Download size={24} /> تحميل</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {showPlayer && (
          <div className="mb-16">
            <div className="flex flex-wrap gap-2 mb-4 bg-white/5 p-2 rounded-xl inline-flex border border-white/10">
              {servers.map((s, i) => (
                <button key={i} onClick={() => setActiveServer(i)} className={`px-6 py-2 rounded-lg font-bold transition-all ${activeServer === i ? 'bg-red-600 shadow-lg shadow-red-600/20' : 'hover:bg-white/10 text-gray-400'}`}>{s.name}</button>
              ))}
            </div>
            <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen scrolling="no" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {tmdbData?.credits?.cast && (
              <section>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Users className="text-red-600" /> طاقم العمل</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {tmdbData.credits.cast.slice(0, 8).map((p: any) => (
                    <div key={p.id} className="bg-white/5 rounded-xl p-3 flex items-center gap-3 border border-white/5 hover:bg-white/10 transition-all group">
                      <img src={getImg(p.profile_path)} className="w-12 h-12 rounded-full object-cover border border-red-600/30 group-hover:border-red-600" alt="" />
                      <div className="overflow-hidden leading-tight">
                        <p className="font-bold text-sm truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.character}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="font-bold text-xl mb-4 border-r-4 border-red-600 pr-3 flex items-center gap-2">
                <Info size={20} className="text-red-600" /> تفاصيل العمل
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                  <span className="text-gray-400 font-medium">النوع</span>
                  <div className="flex gap-1">
                    {media.genres?.slice(0,2).map((g: any) => (
                      <span key={g} className="bg-white/10 px-2 py-0.5 rounded text-xs">{g}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5 text-sm">
                  <span className="text-gray-400 font-medium">التقييم</span>
                  <span className="text-yellow-500 font-bold">★ {media.vote_average?.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-2 text-sm">
                  <span className="text-gray-400 font-medium">الحالة</span>
                  <span className="text-green-500 font-bold">متاح للمشاهدة</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
