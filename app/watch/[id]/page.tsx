'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Play, 
  Download, 
  Star, 
  Clock, 
  Calendar, 
  Share2, 
  Tv, 
  Film, 
  CheckCircle2, 
  ChevronDown, 
  Sparkles, 
  Layers,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface Episode {
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
}

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeServer, setActiveServer] = useState<'vidlink' | 'embedsu' | 'autoembed'>('vidlink');
  
  // TV Series States
  const [isSeries, setIsSeries] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Monetization & Download Modal
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [hasTriggeredPreRoll, setHasTriggeredPreRoll] = useState(false);

  const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';
  const TMDB_KEY = '204ce203e280acdfec221ea09ea5e763';

  // 1. Fetch Item Data from Supabase
  useEffect(() => {
    async function fetchMedia() {
      if (!id) return;
      setLoading(true);

      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Error fetching media:', error);
        setLoading(false);
        return;
      }

      setItem(data);
      const isTv = data.type === 'series' || data.type === 'tv' || data.media_type === 'series' || data.media_type === 'tv';
      setIsSeries(isTv);

      // If it's a TV series, fetch seasons from TMDB
      if (isTv && data.tmdb_id) {
        fetchSeriesDetails(data.tmdb_id);
      }

      setLoading(false);
    }

    fetchMedia();
  }, [id]);

  // 2. Fetch Seasons from TMDB
  async function fetchSeriesDetails(tmdbId: number) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`);
      const tvData = await res.json();
      
      if (tvData.seasons && tvData.seasons.length > 0) {
        // Filter out specials (season 0) if desired, or keep all
        const validSeasons = tvData.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(validSeasons.length > 0 ? validSeasons : tvData.seasons);
        const initialSeason = validSeasons.length > 0 ? validSeasons[0].season_number : 1;
        setSelectedSeason(initialSeason);
        fetchSeasonEpisodes(tmdbId, initialSeason);
      }
    } catch (err) {
      console.error('Error fetching seasons:', err);
    }
  }

  // 3. Fetch Episodes for Selected Season
  async function fetchSeasonEpisodes(tmdbId: number, seasonNum: number) {
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar-SA`);
      const seasonData = await res.json();
      if (seasonData.episodes) {
        setEpisodes(seasonData.episodes);
        setSelectedEpisode(seasonData.episodes[0]?.episode_number || 1);
      }
    } catch (err) {
      console.error('Error fetching episodes:', err);
    } finally {
      setLoadingEpisodes(false);
    }
  }

  const handleSeasonChange = (seasonNum: number) => {
    setSelectedSeason(seasonNum);
    if (item?.tmdb_id) {
      fetchSeasonEpisodes(item.tmdb_id, seasonNum);
    }
  };

  // Video Embed URL Generator
  const getEmbedUrl = () => {
    if (!item?.tmdb_id) return '';

    if (isSeries) {
      switch (activeServer) {
        case 'vidlink':
          return `https://vidlink.pro/tv/${item.tmdb_id}/${selectedSeason}/${selectedEpisode}?sub.ar=true&primaryColor=dc2626`;
        case 'embedsu':
          return `https://embed.su/embed/tv/${item.tmdb_id}/${selectedSeason}/${selectedEpisode}`;
        case 'autoembed':
          return `https://player.autoembed.cc/embed/tv/${item.tmdb_id}/${selectedSeason}/${selectedEpisode}`;
        default:
          return `https://vidlink.pro/tv/${item.tmdb_id}/${selectedSeason}/${selectedEpisode}?sub.ar=true&primaryColor=dc2626`;
      }
    } else {
      switch (activeServer) {
        case 'vidlink':
          return `https://vidlink.pro/movie/${item.tmdb_id}?sub.ar=true&primaryColor=dc2626`;
        case 'embedsu':
          return `https://embed.su/embed/movie/${item.tmdb_id}`;
        case 'autoembed':
          return `https://player.autoembed.cc/embed/movie/${item.tmdb_id}`;
        default:
          return `https://vidlink.pro/movie/${item.tmdb_id}?sub.ar=true&primaryColor=dc2626`;
      }
    }
  };

  // 2-Click Play Monetization Pre-Roll
  const handlePlayerOverlayClick = () => {
    if (!hasTriggeredPreRoll) {
      window.open(DIRECT_AD_LINK, '_blank');
      setHasTriggeredPreRoll(true);
    }
  };

  // Download Trigger
  const handleStartDownload = () => {
    window.open(DIRECT_AD_LINK, '_blank');
    setCountdown(5);
    setDownloadReady(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          setDownloadReady(true);
          return 0;
        }
        return prev !== null ? prev - 1 : 0;
      });
    }, 1000);
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
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white text-center p-6">
        <h2 className="text-2xl font-bold mb-4">عذراً، العمل غير متوفر حالياً</h2>
        <Link href="/" className="px-6 py-2.5 bg-red-600 rounded-xl font-bold hover:bg-red-700">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      
      {/* Top Breadcrumb Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">الرئيسية</Link>
          <span>/</span>
          <Link href={isSeries ? '/series' : '/movies'} className="hover:text-white transition">
            {isSeries ? 'مسلسلات' : 'أفلام'}
          </Link>
          <span>/</span>
          <span className="text-red-500 font-bold truncate max-w-[200px] sm:max-w-md">
            {item.title} {isSeries && `- موسم ${selectedSeason} حلقة ${selectedEpisode}`}
          </span>
        </div>

        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: item.title, url: window.location.href });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('تم نسخ الرابط بنجاح!');
            }
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-300 transition"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>مشاركة</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        
        {/* Main Title Banner */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-red-600 text-white rounded text-xs font-black uppercase tracking-wider">
              {isSeries ? 'مسلسل حصري' : 'فيلم VIP'}
            </span>
            <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-500" />
              {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}
            </span>
            <span className="px-2.5 py-0.5 bg-white/5 text-gray-300 rounded text-xs font-medium">
              4K ULTRA HD
            </span>
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-medium">
              مترجم للعربية
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {item.title}
          </h1>
          {item.original_title && item.original_title !== item.title && (
            <p className="text-gray-400 text-sm mt-1 font-mono">{item.original_title}</p>
          )}
        </div>

        {/* Video Player Section */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          
          {/* Simulated First-Click High-CPM Pre-Roll Overlay */}
          {!hasTriggeredPreRoll && (
            <div 
              onClick={handlePlayerOverlayClick}
              className="absolute inset-0 z-30 cursor-pointer flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm group hover:bg-black/20 transition"
            >
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-600/60 group-hover:scale-110 transition duration-300">
                <Play className="w-10 h-10 ml-1 fill-white" />
              </div>
              <p className="mt-4 font-bold text-white text-base bg-black/80 px-4 py-1.5 rounded-full border border-white/10">
                اضغط هنا لبدء المشاهدة بأعلى جودة سيرفر
              </p>
            </div>
          )}

          <iframe
            src={getEmbedUrl()}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* Server & Action Controls */}
        <div className="mt-4 p-4 bg-[#111116] border border-white/5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-400 font-bold ml-2">سيرفر المشاهدة:</span>
            <button
              onClick={() => setActiveServer('vidlink')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeServer === 'vidlink' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              سيرفر VIP 1 (الأساسي)
            </button>

            <button
              onClick={() => setActiveServer('embedsu')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeServer === 'embedsu' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              سيرفر VIP 2 (احتياطي)
            </button>

            <button
              onClick={() => setActiveServer('autoembed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeServer === 'autoembed' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              سيرفر VIP 3 (سريع)
            </button>
          </div>

          <button
            onClick={() => setShowDownloadModal(true)}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>تحميل {isSeries ? `الحلقة (${selectedEpisode})` : 'العمل'}</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TV SERIES: SEASONS & EPISODES SELECTOR                   */}
        {/* ======================================================== */}
        {isSeries && (
          <div className="mt-8 bg-[#111116] border border-white/10 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-600/30 flex items-center justify-center text-red-500">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">قائمة المواسم والحلقات</h3>
                  <p className="text-xs text-gray-400">اختر الموسم ثم اضغط على رقم الحلقة للتشغيل الفوري</p>
                </div>
              </div>

              {/* Seasons Selector Tabs */}
              {seasons.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {seasons.map((season) => (
                    <button
                      key={season.season_number}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedSeason === season.season_number
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                          : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                      }`}
                    >
                      {season.name || `الموسم ${season.season_number}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Episodes Grid */}
            {loadingEpisodes ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : episodes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {episodes.map((ep) => {
                  const isCurrent = selectedEpisode === ep.episode_number;
                  return (
                    <button
                      key={ep.episode_number}
                      onClick={() => setSelectedEpisode(ep.episode_number)}
                      className={`p-3 rounded-xl border text-right transition group relative overflow-hidden flex flex-col justify-between ${
                        isCurrent 
                          ? 'bg-red-600/10 border-red-600 text-white shadow-md shadow-red-600/20' 
                          : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCurrent ? 'bg-red-600 text-white' : 'bg-white/10 text-gray-300'}`}>
                          الحلقة {ep.episode_number}
                        </span>
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </div>
                      <p className="text-xs font-medium text-gray-200 line-clamp-1 group-hover:text-red-400 transition">
                        {ep.name || `الحلقة ${ep.episode_number}`}
                      </p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-gray-400 text-sm">
                جاري إعداد حلقات هذا الموسم...
              </div>
            )}
          </div>
        )}

        {/* Media Story & Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-[#111116] border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">قصة العمل</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {item.overview || 'تدور أحداث هذا العمل في إطار شيق ومليء بالإثارة والتشويق مع نخبة من ألمع النجوم.'}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
              <div>
                <span className="text-xs text-gray-500 block mb-1">النوع</span>
                <span className="text-sm font-bold text-white">{isSeries ? 'مسلسل تلفزيوني' : 'فيلم سينمائي'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">سنة الإصدار</span>
                <span className="text-sm font-bold text-white">{item.release_date ? new Date(item.release_date).getFullYear() : '2024'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block mb-1">اللغة والترجمة</span>
                <span className="text-sm font-bold text-emerald-400">مترجم حصرياً</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111116] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-4">مميزات المشاهدة على سينما بلاس</h3>
              <ul className="space-y-3 text-xs text-gray-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>سيرفرات فائقة السرعة بدون تقطيع</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>جودة أصلية 1080p Full HD و 4K</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>ترجمة عربية متزامنة ودقيقة</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>دعم المشاهدة والتحميل على الهاتف والتلفاز</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => window.open(DIRECT_AD_LINK, '_blank')}
              className="mt-6 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-yellow-400 flex items-center justify-center gap-2 transition"
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>ترقية الحساب إلى VIP مجاناً</span>
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* HIGH-CONVERTING DOWNLOAD MODAL                           */}
      {/* ======================================================== */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-white/10 rounded-3xl p-6 max-w-md w-full shadow-2xl relative text-center">
            
            <button 
              onClick={() => {
                setShowDownloadModal(false);
                setCountdown(null);
                setDownloadReady(false);
              }}
              className="absolute top-4 left-4 text-gray-400 hover:text-white text-lg font-bold"
            >
              ✕
            </button>

            <div className="w-16 h-16 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              <Download className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-white mb-1">
              تحميل: {item.title}
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              {isSeries ? `الموسم ${selectedSeason} - الحلقة ${selectedEpisode}` : 'نسخة BluRay الأصلية'}
            </p>

            {/* Quality Options */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              {['1080p FHD', '720p HD', '480p SD'].map((quality) => (
                <button
                  key={quality}
                  onClick={() => setSelectedQuality(quality)}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    selectedQuality === quality 
                      ? 'bg-emerald-600 border-emerald-500 text-white' 
                      : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>

            {/* Download Logic */}
            {countdown === null && !downloadReady && (
              <button
                onClick={handleStartDownload}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-black text-sm shadow-xl shadow-emerald-600/30 transition active:scale-95"
              >
                توليد رابط التحميل المباشر
              </button>
            )}

            {countdown !== null && countdown > 0 && (
              <div className="py-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 mb-2">جاري تجهيز سيرفر التحميل السريع...</p>
                <span className="text-3xl font-black text-emerald-400 font-mono">{countdown}s</span>
              </div>
            )}

            {downloadReady && (
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded-xl shadow-xl shadow-emerald-500/40 flex items-center justify-center gap-2 transition animate-bounce"
              >
                <CheckCircle2 className="w-5 h-5 text-black" />
                <span>اضغط هنا لبدء التحميل الآن ({selectedQuality})</span>
              </a>
            )}

            <p className="text-[11px] text-gray-500 mt-4">
              الروابط مجانية ومباشرة بدون انتظار طويل
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
