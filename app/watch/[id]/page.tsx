"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Play, Star, Calendar, Download, Users } from 'lucide-react';
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
      try {
        const { data } = await supabase.from('media').select('*').eq('id', id).single();
        if (data) {
          setMedia(data);
          const res = await fetch(`https://api.themoviedb.org/3/${data.type === 'movie' ? 'movie' : 'tv'}/${data.tmdb_id}?api_key=204ce203e280acdfec221ea09ea5e763&append_to_response=credits,videos&language=ar-SA`);
          setTmdbData(await res.json());
        }
      } catch (e) { console.error(e); }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-red-600">جاري التحميل...</div>;
  if (!media) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white">العمل غير موجود</div>;

  const servers = [
    { name: 'سيرفر 1', url: media.type === 'movie' ? `https://vidsrc.to/embed/movie/${media.tmdb_id}` : `https://vidsrc.to/embed/tv/${media.tmdb_id}/1/1` },
    { name: 'سيرفر 2', url: media.type === 'movie' ? `https://vidsrc.me/embed/movie?tmdb=${media.tmdb_id}` : `https://vidsrc.me/embed/tv?tmdb=${media.tmdb_id}&sea=1&epi=1` }
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      <div className="relative h-[50vh] w-full">
        <img src={getImg(media.backdrop_path, 'original')} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
        <div className="relative z-10 container mx-auto px-4 h-full flex items-end pb-10">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-end w-full">
            <img src={getImg(media.poster_path)} className="w-40 md:w-56 rounded-xl shadow-2xl border border-white/10" alt="" />
            <div className="flex-1 text-center md:text-right">
              <h1 className="text-3xl md:text-5xl font-black mb-4">{media.title}</h1>
              <div className="flex justify-center md:justify-start gap-4">
                <button onClick={() => setShowPlayer(true)} className="bg-red-600 px-8 py-3 rounded-lg font-bold flex items-center gap-2"><Play size={20} fill="currentColor" /> مشاهدة</button>
                <button className="bg-white/10 px-8 py-3 rounded-lg font-bold flex items-center gap-2"><Download size={20} /> تحميل</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {showPlayer && (
          <div className="mb-10">
            <div className="flex gap-2 mb-4">
              {servers.map((s, i) => (
                <button key={i} onClick={() => setActiveServer(i)} className={`px-4 py-2 rounded-lg font-bold ${activeServer === i ? 'bg-red-600' : 'bg-white/5'}`}>{s.name}</button>
              ))}
            </div>
            <div className="aspect-video w-full bg-black rounded-xl overflow-hidden border border-white/10">
              <iframe src={servers[activeServer].url} className="w-full h-full" allowFullScreen />
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold mb-4">قصة العمل</h2>
            <p className="text-gray-400 leading-relaxed">{media.overview}</p>
          </div>
          <div className="bg-white/5 p-6 rounded-xl h-fit">
            <h3 className="font-bold mb-4">تفاصيل</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2"><span>التقييم</span><span className="text-yellow-500">★ {media.vote_average}</span></div>
              <div className="flex justify-between border-b border-white/5 pb-2"><span>السنة</span><span>{media.release_date}</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
