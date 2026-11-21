'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Play, Star, Layers, Info, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function MediaDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setItem(data);
        if (data.type === 'series' || data.type === 'tv') fetchSeasons(data.tmdb_id);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  async function fetchSeasons(tmdbId: number) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar-SA`);
    const data = await res.json();
    if (data.seasons) {
      const valid = data.seasons.filter((s:any) => s.season_number > 0);
      setSeasons(valid);
      fetchEpisodes(tmdbId, valid[0]?.season_number || 1);
    }
  }

  async function fetchEpisodes(tmdbId: number, sNum: number) {
    setLoadingEpisodes(true);
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${sNum}?api_key=204ce203e280acdfec221ea09ea5e763&language=ar-SA`);
    const data = await res.json();
    setEpisodes(data.episodes || []);
    setLoadingEpisodes(false);
  }

  if (loading) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center animate-pulse text-white">جاري التحميل...</div>;
  if (!item) return <div className="text-white text-center mt-20">غير موجود</div>;

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      <div className="relative h-[50vh]">
        <img src={item.backdrop_url || `https://image.tmdb.org/t/p/original${item.backdrop_path}`} className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
        <div className="absolute bottom-10 right-10 flex gap-6 items-end">
          <img src={item.poster_url || `https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-40 rounded-xl shadow-2xl border border-white/10" />
          <div>
            <h1 className="text-4xl font-black mb-4">{item.title}</h1>
            {item.type !== 'series' && (
              <Link href={`/watch/${item.id}`} className="bg-red-600 px-8 py-3 rounded-xl font-bold flex items-center gap-2">
                <Play className="w-5 h-5 fill-white" /> مشاهدة الآن
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <p className="text-gray-400 bg-white/5 p-6 rounded-2xl border border-white/5 mb-10">{item.overview}</p>
        {seasons.length > 0 && (
          <div className="bg-[#111116] p-6 rounded-3xl border border-white/10">
            <div className="flex gap-2 overflow-x-auto mb-8">
              {seasons.map(s => (
                <button key={s.season_number} onClick={() => {setSelectedSeason(s.season_number); fetchEpisodes(item.tmdb_id, s.season_number)}} 
                className={`px-6 py-2 rounded-xl whitespace-nowrap ${selectedSeason === s.season_number ? 'bg-red-600' : 'bg-white/5'}`}>
                  الموسم {s.season_number}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {episodes.map(ep => (
                <Link key={ep.episode_number} href={`/watch/${item.id}?s=${selectedSeason}&e=${ep.episode_number}`} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:border-red-600 transition">
                  <span className="text-sm font-bold">الحلقة {ep.episode_number}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
