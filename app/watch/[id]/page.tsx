'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Play, Download, Star, Layers, Sparkles, AlertCircle, CheckCircle2, ShieldCheck 
} from 'lucide-react';
import Link from 'next/link';

function WatchContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const initialSeason = parseInt(searchParams.get('season') || searchParams.get('s') || '1') || 1;
  const initialEpisode = parseInt(searchParams.get('episode') || searchParams.get('e') || '1') || 1;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // 5 Global Video Embed Servers
  const [activeServer, setActiveServer] = useState<'superembed' | 'vidsrc' | 'vidlink' | 'autoembed' | 'embedsu'>('superembed');

  // Series State
  const [isSeries, setIsSeries] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Monetization State
  const [hasTriggeredPreRoll, setHasTriggeredPreRoll] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [downloadReady, setDownloadReady] = useState(false);

  const DIRECT_AD_LINK = 'https://uplcm.com/4/12311730';
  const TMDB_KEY = '204ce203e280acdfec221ea09ea5e763';

  useEffect(() => {
    async function fetchMedia() {
      if (!id) return;
      setLoading(true);

      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      if (data) {
        setItem(data);
        const isTv = data.type === 'series' || data.type === 'tv' || data.media_type === 'series' || data.media_type === 'tv';
        setIsSeries(isTv);

        if (isTv && data.tmdb_id) {
          fetchSeriesData(data.tmdb_id, initialSeason);
        }
      }
      setLoading(false);
    }
    fetchMedia();
  }, [id]);

  // Safe Non-blocking Episodes Fetcher
  async function fetchSeriesData(tmdbId: number, seasonNum: number) {
    setLoadingEpisodes(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 seconds max

      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${TMDB_KEY}&language=ar-SA`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const tvData = await res.json();

      if (tvData.seasons && tvData.seasons.length > 0) {
        const valid = tvData.seasons.filter((s: any) => s.season_number > 0);
        setSeasons(valid.length > 0 ? valid : tvData.seasons);
      } else {
        setSeasons([{ season_number: 1, name: 'الموسم 1' }]);
      }

      // Fetch Episodes
      fetchSeasonEpisodes(tmdbId, seasonNum);
    } catch {
      // Fallback: Never hang!
      setSeasons([{ season_number: 1, name: 'الموسم 1' }]);
      setEpisodes(Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1, name: `الحلقة ${i + 1}` })));
      setLoadingEpisodes(false);
    }
  }

  async function fetchSeasonEpisodes(tmdbId: number, seasonNum: number) {
    setLoadingEpisodes(true);
    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${tmdbId}/season/${seasonNum}?api_key=${TMDB_KEY}&language=ar-SA`);
      const sData = await res.json();
      if (sData.episodes && sData.episodes.length > 0) {
        setEpisodes(sData.episodes);
      } else {
        setEpisodes(Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1, name: `الحلقة ${i + 1}` })));
      }
    } catch {
      setEpisodes(Array.from({ length: 24 }, (_, i) => ({ episode_number: i + 1, name: `الحلقة ${i + 1}` })));
    } finally {
      setLoadingEpisodes(false);
    }
  }

  // 5 Universal Multi-Server URLs
  const getEmbedUrl = () => {
    if (!item?.tmdb_id) return '';
    const tmdbId = item.tmdb_id;
    const s = Number(selectedSeason) || 1;
    const e = Number(selectedEpisode) || 1;

    if (isSeries) {
      switch (activeServer) {
        case 'superembed':
          return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${s}&e=${e}`;
        case 'vidsrc':
          return `https://vidsrc.pro/embed/tv/${tmdbId}/${s}/${e}`;
        case 'vidlink':
          return `https://vidlink.pro/tv/${tmdbId}/${s}/${e}?sub.ar=true&primaryColor=dc2626`;
        case 'autoembed':
          return `https://player.autoembed.cc/embed/tv/${tmdbId}/${s}/${e}`;
        case 'embedsu':
          return `https://embed.su/embed/tv/${tmdbId}/${s}/${e}`;
      }
    } else {
      switch (activeServer) {
        case 'superembed':
          return `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`;
        case 'vidsrc':
          return `https://vidsrc.pro/embed/movie/${tmdbId}`;
        case 'vidlink':
          return `https://vidlink.pro/movie/${tmdbId}?sub.ar=true&primaryColor=dc2626`;
        case 'autoembed':
          return `https://player.autoembed.cc/embed/movie/${tmdbId}`;
        case 'embedsu':
          return `https://embed.su/embed/movie/${tmdbId}`;
      }
    }
  };

  // High CPM Pre-Roll Ad Trigger
  const handlePlayerClick = () => {
    if (!hasTriggeredPreRoll) {
      window.open(DIRECT_AD_LINK, '_blank');
      setHasTriggeredPreRoll(true);
    }
  };

  // Download Trigger
  const handleDownload = () => {
    window.open(DIRECT_AD_LINK, '_blank');
    setCountdown(5);
    setDownloadReady(false);
    setShowDownloadModal(true);

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
      <div className="min-h-screen bg-[#08080a] flex flex-col items-center justify-center text-white">
        <p className="text-lg font-bold mb-4">العمل غير متوفر</p>
        <Link href="/" className="px-6 py-2 bg-red-600 rounded-xl font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        {/* Title Info Header */}
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-black">
              {isSeries ? `الموسم ${selectedSeason} - الحلقة ${selectedEpisode}` : 'فيلم سينمائي 4K'}
            </span>
            <span className="px-2.5 py-1 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-bold">
              ⭐ {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.6'}
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> مترجم للعربية
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black">{item.title}</h1>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          
          {/* High-CPM Simulated Pre-Roll Click */}
          {!hasTriggeredPreRoll && (
            <div 
              onClick={handlePlayerClick}
              className="absolute inset-0 z-30 cursor-pointer flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm group hover:bg-black/30 transition"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 transition duration-300">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 ml-1 fill-white" />
              </div>
              <p className="mt-4 font-bold text-xs sm:text-sm bg-black/80 px-5 py-2 rounded-full border border-white/10 text-white group-hover:border-red-600 transition">
                اضغط هنا لبدء التشغيل الفوري بجودة VIP
              </p>
            </div>
          )}

          <iframe
            key={`${activeServer}-${selectedSeason}-${selectedEpisode}`}
            src={getEmbedUrl()}
            className="w-full h-full border-0"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
        </div>

        {/* 5 Multi-Server VIP Switcher */}
        <div className="mt-4 p-4 bg-[#111116] border border-white/5 rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-400 font-bold ml-1">اختر السيرفر:</span>
              {[
                { id: 'superembed', name: 'سيرفر VIP 1 (الأساسي العالمي)' },
                { id: 'vidsrc', name: 'سيرفر VIP 2 (سريع جداً)' },
                { id: 'vidlink', name: 'سيرفر VIP 3 (سحابي)' },
                { id: 'autoembed', name: 'سيرفر VIP 4 (بديل)' },
                { id: 'embedsu', name: 'سيرفر VIP 5 (احتياطي)' },
              ].map((srv) => (
                <button
                  key={srv.id}
                  onClick={() => setActiveServer(srv.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    activeServer === srv.id
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {srv.name}
                </button>
              ))}
            </div>

            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span>تحميل العمل</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[11px] text-yellow-500/90">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>إذا واجهت أي بطء أو رسالة في السيرفر، بدل بين السيرفرات (VIP 1 أو VIP 2) وسيعمل معك فوراً بأعلى سرعة وترجمة.</span>
          </div>
        </div>

        {/* TV Series / Anime Episodes Browser */}
        {isSeries && (
          <div className="mt-8 bg-[#111116] border border-white/10 rounded-3xl p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-white/5">
              <h3 className="text-base font-black flex items-center gap-2">
                <Layers className="text-red-500 w-5 h-5" />
                <span>قائمة الحلقات والمواسم</span>
              </h3>

              {seasons.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        setSelectedSeason(s.season_number);
                        if (item?.tmdb_id) fetchSeasonEpisodes(item.tmdb_id, s.season_number);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                        selectedSeason === s.season_number
                          ? 'bg-red-600 text-white shadow'
                          : 'bg-white/5 text-gray-300'
                      }`}
                    >
                      {s.name || `الموسم ${s.season_number}`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {loadingEpisodes ? (
              <div className="py-8 text-center text-xs text-gray-400">جاري تجهيز الحلقات...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {episodes.map((ep) => (
                  <button
                    key={ep.episode_number}
                    onClick={() => setSelectedEpisode(ep.episode_number)}
                    className={`p-3 rounded-xl border text-right transition flex items-center justify-between ${
                      selectedEpisode === ep.episode_number
                        ? 'bg-red-600/20 border-red-600 text-white shadow'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold">الحلقة {ep.episode_number}</span>
                    <Play className="w-3.5 h-3.5 text-red-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#121218] border border-white/10 rounded-3xl p-6 max-w-sm w-full text-center relative">
            <button 
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-4 left-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <Download className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-black mb-1">تحميل: {item.title}</h3>
            <p className="text-xs text-gray-400 mb-6">جودة 1080p Full HD الأصلية</p>

            {countdown !== null && countdown > 0 && (
              <div className="py-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-xs text-gray-400 mb-2">جاري تجهيز رابط التحميل المباشر...</p>
                <span className="text-3xl font-black text-emerald-400 font-mono">{countdown}s</span>
              </div>
            )}

            {downloadReady && (
              <a
                href={DIRECT_AD_LINK}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl flex items-center justify-center gap-2 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>اضغط هنا لبدء التحميل المباشر الآن</span>
              </a>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default function WatchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080a] flex items-center justify-center text-white text-xs">جاري تجهيز السيرفرات...</div>}>
      <WatchContent />
    </Suspense>
  );
}
