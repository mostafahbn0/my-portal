"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { Play, Star, Download } from 'lucide-react';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) setMedia(data);
    }
    fetchData();
  }, [id]);

  if (!media) return <div className="p-20 text-center">جاري التحميل...</div>;

  const videoUrl = media.type === 'movie' 
    ? `https://vidsrc.to/embed/movie/${media.tmdb_id}` 
    : `https://vidsrc.to/embed/tv/${media.tmdb_id}/1/1`;

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          <img src={media.poster_path} className="w-64 rounded-2xl shadow-2xl border border-white/10" alt="" />
          <div className="flex-1">
            <h1 className="text-5xl font-black mb-4">{media.title}</h1>
            <p className="text-gray-400 text-xl mb-6">{media.overview}</p>
            <div className="flex gap-4">
              <button onClick={() => setShowPlayer(true)} className="bg-red-600 px-10 py-4 rounded-xl font-bold flex items-center gap-2"><Play fill="currentColor" /> مشاهدة الآن</button>
            </div>
          </div>
        </div>

        {showPlayer && (
          <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden border border-white/10">
            <iframe src={videoUrl} className="w-full h-full" allowFullScreen />
          </div>
        )}
      </div>
    </main>
  );
}
