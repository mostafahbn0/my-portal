'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Play, Star, Layers, Info, Clock, ArrowRight, Download } from 'lucide-react';
import Link from 'next/link';

export default function MediaDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSeries, setIsSeries] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const TMDB_KEY = '204ce203e280acdfec221ea09ea5e763';

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setItem(data);
        const isTv = data.type === 'series' || data.type === 'tv' || data.media_type === 'series' || data.media_type === 'tv';
        setIsSeries(isTv);
        if (isTv && data.tmdb_id) fetchSeriesMetadata(data.tmdb_id);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  async function fetchSeriesMetadata(tmdbId: number) {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`);
    const tvData = await res.json();
    if (tvData.seasons) {
      const valid = tvData.seasons.filter((s: any) => s.season_number > 0);
      setSeasons(valid.length > 0 ? valid : tvData.seasons);
      fetchEpisodes(tmdbId, valid[0]?.season_number || 1);
    }
  }

  async function fetchEpisodes(tmdbId: number, seasonNum: number) {
    setLoadingEpisodes(true);
    const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar-SA`);
    const data = await res.json();
    setEpisodes(data.episodes || []);
    setLoadingEpisodes(false);
  }

  if (loading) return <div className="min-h-screen bg-[#08080a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (!item) return <div className="text-white text-center mt-20">العمل غير موجود</div>;

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      <div className="relative h-[50vh]">
        <img src={item.backdrop_url || `https://image.tmdb.org/t/p/original${item.backdrop_path}`} className="w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
        <div className="absolute bottom-10 right-6 md:right-10 flex flex-col md:flex-row gap-6 items-center md:items-end text-center md:text-right">
            <img src={item.poster_url || `https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-40 md:w-48 rounded-2xl shadow-2xl border border-white/10" />
            <div className="mb-4">
                <h1 className="text-3xl md:text-5xl font-black mb-4">{item.title}</h1>
                <div className="flex justify-center md:justify-start gap-3 mb-6">
                    <span className="bg-red-600 px-3 py-1 rounded-lg text-xs font-bold">{isSeries ? 'مسلسل' : 'فيلم'}</span>
                    <span className="bg-white/10 px-3 py-1 rounded-lg text-xs font-bold">⭐ {item.vote_average}</span>
                </div>
                {!isSeries && (
                    <Link href={`/watch/${item.id}`} className="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-bold flex items-center gap-2 w-fit mx-auto md:mx-0 transition active:scale-95">
                        <Play className="w-5 h-5 fill-white" /> مشاهدة الفيلم الآن
                    </Link>
                )}
            </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-10">
        <div className="bg-[#111116] p-6 rounded-2xl border border-white/5 mb-10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-500"><Info className="w-5 h-5" /> قصة العمل</h2>
            <p className="text-gray-300 leading-relaxed">{item.overview || 'تدور الأحداث في إطار من الإثارة والتشويق.'}</p>
        </div>
        {isSeries && (
            <div className="bg-[#111116] p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Layers className="text-red-500" /> حلقات المسلسل</h2>
                <div className="flex gap-2 overflow-x-auto mb-8 pb-2 scrollbar-none">
                    {seasons.map(s => (
                        <button key={s.season_number} onClick={() => {setSelectedSeason(s.season_number); fetchEpisodes(item.tmdb_id, s.season_number)}} 
                        className={`px-6 py-2 rounded-xl whitespace-nowrap transition ${selectedSeason === s.season_number ? 'bg-red-600 shadow-lg shadow-red-600/30' : 'bg-white/5 hover:bg-white/10'}`}>
                            الموسم {s.season_number}
                        </button>
                    ))}
                </div>
                {loadingEpisodes ? <div className="text-center py-10">جاري تحميل الحلقات...</div> : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {episodes.map(ep => (
                            <Link key={ep.episode_number} href={`/watch/${item.id}?s=${selectedSeason}&e=${ep.episode_number}`} 
                            className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-red-600/50 transition group">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold group-hover:text-red-500">الحلقة {ep.episode_number}</span>
                                    <Play className="w-4 h-4 text-red-500" />
                                </div>
                                <p className="text-[10px] text-gray-500 mt-2 truncate">{ep.name || 'مشاهدة الآن'}</p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}
