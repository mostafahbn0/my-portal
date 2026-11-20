'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Play, Star, Calendar, Film, Tv, Share2, Download, 
  ArrowRight, Check, AlertCircle, Sparkles, Server, Subtitles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [activeServer, setActiveServer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);

      const { data: mediaData } = await supabase
        .from('media')
        .select('*')
        .eq('id', id)
        .single();

      if (mediaData) {
        setMedia(mediaData);

        const tmdbId = mediaData.tmdb_id;
        if (tmdbId) {
          const { data: eps } = await supabase
            .from('episodes')
            .select('*')
            .eq('tmdb_id', String(tmdbId))
            .order('episode_number', { ascending: true });

          if (eps && eps.length > 0) {
            setEpisodes(eps);
          }
        }
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-xl">عذراً، لم يتم العثور على هذا العمل.</p>
        <Link href="/" className="bg-red-600 px-4 py-2 rounded-lg text-sm font-bold">العودة للرئيسية</Link>
      </div>
    );
  }

  const tmdbId = media.tmdb_id;
  const isMovie = !media.media_type || media.media_type === 'movie';
  const realTitle = media.original_title || media.title;
  const arabicTitle = media.title !== realTitle ? media.title : null;
  const poster = getMediaPoster(media);
  const backdrop = getMediaBackdrop(media);
  const year = getMediaYear(media);
  const rating = getMediaRating(media);

  // سيرفرات تشغيل فائقة السرعة تدعم الترجمة العربية
  const servers = [
    {
      name: 'سيرفر VIP 1 (مترجم عربي تلقائي)',
      quality: '1080p Ultra HD',
      url: isMovie 
        ? `https://vidlink.pro/movie/${tmdbId}?sub.ar=true&primaryColor=dc2626&secondaryColor=ffffff`
        : `https://vidlink.pro/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}?sub.ar=true&primaryColor=dc2626&secondaryColor=ffffff`
    },
    {
      name: 'سيرفر EmbedSU (ترجمة مدمجة)',
      quality: '1080p Multi-Sub',
      url: isMovie 
        ? `https://embed.su/embed/movie/${tmdbId}`
        : `https://embed.su/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      name: 'سيرفر VidSrc VIP',
      quality: '1080p Fast',
      url: isMovie
        ? `https://vidsrc.cc/v2/embed/movie/${tmdbId}`
        : `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      name: 'سيرفر AutoEmbed',
      quality: '720p / 1080p',
      url: isMovie
        ? `https://player.autoembed.cc/embed/movie/${tmdbId}`
        : `https://player.autoembed.cc/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
    },
    {
      name: 'سيرفر MultiEmbed الاحتياطي',
      quality: 'HD Stream',
      url: isMovie
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
        : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}`
    }
  ];

  const handleStartWatching = () => {
    setIsPlaying(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />

      {/* خلفية البانر العلوي */}
      <div className="relative h-[45vh] md:h-[60vh] w-full overflow-hidden">
        <img 
          src={backdrop} 
          alt={realTitle} 
          className="w-full h-full object-cover object-top filter brightness-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
      </div>

      {/* المحتوى الرئيسي للمعلومات */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-36 md:-mt-48 relative z-10">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* بوستر الفيلم الجانبي */}
          <div className="w-48 sm:w-60 flex-shrink-0 rounded-2xl overflow-hidden shadow-2xl shadow-red-600/10 border border-white/10 mx-auto md:mx-0">
            <img src={poster} alt={realTitle} className="w-full aspect-[2/3] object-cover" />
          </div>

          {/* التفاصيل والأزرار */}
          <div className="flex-1 space-y-4 text-center md:text-right">
            <div>
              {/* الاسم الحقيقي الإنجليزي */}
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-wide" dir="ltr" style={{ textAlign: 'right' }}>
                {realTitle}
              </h1>
              {/* الاسم العربي */}
              {arabicTitle && (
                <h2 className="text-xl md:text-2xl text-red-500 font-bold mt-1">
                  {arabicTitle}
                </h2>
              )}
            </div>

            {/* البادجات والمعلومات */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-gray-300">
              {Number(rating) > 0 && (
                <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-lg font-bold">
                  <Star className="w-4 h-4 fill-yellow-400" />
                  <span>{rating} / 10</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{year}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-red-600/10 border border-red-600/20 text-red-400 px-3 py-1 rounded-lg font-semibold">
                {isMovie ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                <span>{isMovie ? 'فيلم سينمائي' : 'مسلسل'}</span>
              </div>
              <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-emerald-400 font-bold">
                مترجم للعربية بالكامل
              </div>
            </div>

            {/* ملخص العمل */}
            <p className="text-gray-300 leading-relaxed max-w-3xl text-sm md:text-base">
              {media.overview || 'مشاهدة وتحميل بأعلى دقة متوفرة مع سيرفرات متعددة وسريعة حصرياً على سينما بلاس.'}
            </p>

            {/* أزرار الإجراءات الرئيسية */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-2">
              <button
                onClick={handleStartWatching}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-red-600/30 hover:scale-105 transition-all"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>مشاهدة الآن</span>
              </button>

              <button
                onClick={handleShare}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold px-5 py-3.5 rounded-xl border border-white/10 transition-all"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Share2 className="w-5 h-5" />}
                <span>{copied ? 'تم نسخ الرابط!' : 'مشاركة العمل'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* مشغل الفيديو (يظهر عند الضغط على مشاهدة الآن) */}
        {isPlaying && (
          <div ref={playerRef} className="mt-12 space-y-4">
            
            {/* نصيحة الترجمة */}
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 px-4 py-2.5 rounded-xl text-xs md:text-sm">
              <Subtitles className="w-5 h-5 flex-shrink-0 text-blue-400" />
              <span>
                <strong>الترجمة العربية:</strong> مفعلة تلقائياً. في حال أردت تغيير حجم الخط أو تفعيلها يدوياً اضغط على أيقونة (CC) أو الترس ⚙️ داخل شاشة المشغل، أو بدّل السيرفر من القائمة أدناه.
              </span>
            </div>

            {/* شاشة العرض (Iframe بدون حظر الساندبوكس) */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                src={servers[activeServer].url}
                className="w-full h-full border-0"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>

            {/* قائمة تبديل السيرفرات */}
            <div className="bg-[#121318] p-4 rounded-xl border border-white/5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-gray-300">
                <Server className="w-4 h-4 text-red-500" />
                <span>سيرفرات المشاهدة البديلة (في حال توقف السيرفر الحالي):</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {servers.map((srv, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveServer(idx)}
                    className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                      activeServer === idx
                        ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    <span>{srv.name}</span>
                    <span className="text-[10px] opacity-75 bg-black/30 px-1.5 py-0.5 rounded">{srv.quality}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* عرض الحلقات لو كان مسلسلاً */}
        {!isMovie && episodes.length > 0 && (
          <div className="mt-12 space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-white">
              <Tv className="w-5 h-5 text-red-500" />
              <span>حلقات المسلسل ({episodes.length} حلقة متوفرة)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {episodes.map((ep) => (
                <button
                  key={ep.id || ep.episode_number}
                  onClick={() => {
                    setSelectedEpisode(ep.episode_number);
                    setIsPlaying(true);
                    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`relative rounded-xl overflow-hidden border transition-all text-right group ${
                    selectedEpisode === ep.episode_number
                      ? 'border-red-600 ring-2 ring-red-600/30'
                      : 'border-white/5 hover:border-white/20 bg-[#121318]'
                  }`}
                >
                  <div className="relative aspect-video w-full bg-[#181a20]">
                    <img 
                      src={ep.still_path || poster} 
                      alt={ep.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                    />
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">
                      الحلقة {ep.episode_number}
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-white truncate">{ep.title || `الحلقة ${ep.episode_number}`}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* بانر إعلاني */}
        <div className="my-10">
          <AdBanner slot="watch-middle" />
        </div>
      </div>
    </div>
  );
}
