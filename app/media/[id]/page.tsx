'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Play, Star, Layers, Info, Clock, ArrowRight, Download, Sparkles, Filter } from 'lucide-react';
import Link from 'next/link';

export default function MediaDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSeries, setIsSeries] = useState(false);
  const [isAnime, setIsAnime] = useState(false);
  
  // Seasons & Episodes
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [allEpisodes, setAllEpisodes] = useState<any[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Smart Part/Cour Pagination for single-season anime
  const [parts, setParts] = useState<{ label: string; start: number; end: number }[]>([]);
  const [activePart, setActivePart] = useState(0);

  const TMDB_KEY = '204ce203e280acdfec221ea09ea5e763';
  const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setItem(data);
        const isTv = data.type === 'series' || data.type === 'tv' || data.media_type === 'series' || data.media_type === 'tv';
        const animeDetected = data.original_language === 'ja' || (data.title && /(أنمي|انمي|anime|hunter|piece|titan|kaisen|naruto|dragon|bleach|solo|demon)/i.test(data.title));
        
        setIsSeries(isTv);
        setIsAnime(animeDetected);

        if (isTv && data.tmdb_id) {
          fetchSeriesMetadata(data.tmdb_id);
        }
      }
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  async function fetchSeriesMetadata(tmdbId: number) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`);
      const tvData = await res.json();
      
      if (tvData.seasons && tvData.seasons.length > 0) {
        const valid = tvData.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(valid.length > 0 ? valid : tvData.seasons);
        const startSeason = valid.length > 0 ? valid[0].season_number : 1;
        setSelectedSeason(startSeason);
        fetchEpisodes(tmdbId, startSeason);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchEpisodes(tmdbId: number, seasonNum: number) {
    setLoadingEpisodes(true);
    try {
      let res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar-SA`);
      let data = await res.json();
      
      // Fallback to English if Arabic episodes are not translated
      if (!data.episodes || data.episodes.length === 0) {
        res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}`);
        data = await res.json();
      }

      const eps = data.episodes || [];
      setAllEpisodes(eps);

      // Smart Split: If season has more than 14 episodes (like Anime arcs/parts)
      if (eps.length > 14) {
        const chunkSize = 12;
        const totalParts = Math.ceil(eps.length / chunkSize);
        const partsArr = [];
        for (let i = 0; i < totalParts; i++) {
          const start = i * chunkSize + 1;
          const end = Math.min((i + 1) * chunkSize, eps.length);
          partsArr.push({
            label: `الجزء ${i + 1} (الحلقات ${start}-${end})`,
            start: i * chunkSize,
            end: end
          });
        }
        setParts(partsArr);
        setActivePart(0);
        setFilteredEpisodes(eps.slice(0, chunkSize));
      } else {
        setParts([]);
        setFilteredEpisodes(eps);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEpisodes(false);
    }
  }

  const handlePartChange = (partIndex: number) => {
    setActivePart(partIndex);
    const targetPart = parts[partIndex];
    if (targetPart) {
      setFilteredEpisodes(allEpisodes.slice(targetPart.start, targetPart.end));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">العمل غير متوفر</h2>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-xl font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  const poster = item.poster_url || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '/placeholder.jpg');
  const backdrop = item.backdrop_url || (item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : poster);

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24" dir="rtl">
      {/* Hero Banner Header */}
      <div className="relative h-[55vh] w-full overflow-hidden">
        <img src={backdrop} alt={item.title} className="w-full h-full object-cover opacity-35 filter blur-[1px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
        
        <div className="absolute top-6 right-6 z-20">
          <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-black/70 rounded-xl text-xs font-bold border border-white/10 hover:bg-black transition">
            <ArrowRight className="w-4 h-4 text-red-500" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        <div className="absolute bottom-8 right-6 left-6 max-w-7xl mx-auto flex flex-col md:flex-row gap-6 items-center md:items-end text-center md:text-right">
          <img src={poster} alt={item.title} className="w-40 md:w-52 rounded-2xl shadow-2xl border-2 border-white/10" />
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-black">
                {isAnime ? 'أنمي ياباني ⛩️' : isSeries ? 'مسلسل حصري 📺' : 'فيلم سينمائي 🎬'}
              </span>
              <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
              </span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-xs font-bold">
                {item.release_date ? new Date(item.release_date).getFullYear() : '2024'}
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold">
                مترجم للعربية
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black mb-2">{item.title}</h1>
            {item.original_title && item.original_title !== item.title && (
              <p className="text-gray-400 text-sm font-mono mb-4">{item.original_title}</p>
            )}

            {!isSeries && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                <Link
                  href={`/watch/${item.id}`}
                  className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-sm flex items-center gap-2 shadow-xl shadow-red-600/30 transition hover:scale-105"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>مشاهدة الفيلم الآن</span>
                </Link>
                <a
                  href={DIRECT_AD_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>تحميل مباشر</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Body */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-[#111116] p-6 rounded-2xl border border-white/5 mb-8">
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-red-500">
            <Info className="w-5 h-5" />
            <span>قصة العمل:</span>
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {item.overview || 'استمتع بأقوى تجربة مشاهدة وتحميل بجودة فائقة وترجمة مدمجة بدون إعلانات مزعجة.'}
          </p>
        </div>

        {/* Series / Anime Multi-Season & Multi-Part Navigator */}
        {isSeries && (
          <div className="bg-[#111116] p-6 rounded-3xl border border-white/10">
            
            {/* 1. Seasons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <h2 className="text-xl font-black flex items-center gap-2">
                <Layers className="text-red-500" />
                <span>اختر الموسم / الجزء:</span>
              </h2>

              {seasons.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        setSelectedSeason(s.season_number);
                        fetchEpisodes(item.tmdb_id, s.season_number);
                      }}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedSeason === s.season_number
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      {s.name || `الموسم ${s.season_number}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Parts / Cour Selector (For Long Anime Seasons like 36 episodes) */}
            {parts.length > 0 && (
              <div className="flex items-center gap-2 mb-6 p-2 bg-black/40 rounded-2xl border border-white/5 overflow-x-auto">
                <span className="text-xs text-yellow-500 font-bold px-3 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> أقسام الموسم:
                </span>
                {parts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePartChange(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                      activePart === idx
                        ? 'bg-red-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}

            {/* 3. Episodes Grid */}
            {loadingEpisodes ? (
              <div className="py-12 text-center text-gray-400 animate-pulse">جاري تحميل الحلقات...</div>
            ) : filteredEpisodes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredEpisodes.map((ep) => (
                  <Link
                    key={ep.episode_number}
                    href={`/watch/${item.id}?season=${selectedSeason}&episode=${ep.episode_number}`}
                    className="p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/50 rounded-2xl transition group flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-lg">
                        الموسم {selectedSeason} - حلقة {ep.episode_number}
                      </span>
                      <Play className="w-4 h-4 text-red-500 group-hover:scale-125 transition" />
                    </div>
                    <p className="text-xs font-bold text-gray-200 group-hover:text-red-400 transition truncate">
                      {ep.name || `الحلقة ${ep.episode_number}`}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400">جاري تحديث بيانات حلقات هذا الموسم...</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
