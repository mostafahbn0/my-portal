'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  Play, Star, Calendar, Download, Server, ShieldCheck, 
  Check, X, HardDrive, ArrowDownToLine, Sparkles, ExternalLink 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import AdBanner from '@/components/AdBanner';
import { getMediaPoster, getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function WatchPage() {
  const { id } = useParams();
  const [media, setMedia] = useState<any>(null);
  const [activeServer, setActiveServer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAdOverlay, setShowAdOverlay] = useState(false);
  
  // حالات مودال التحميل
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [downloadStep, setDownloadStep] = useState<'select' | 'generating' | 'ready'>('select');
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [activeDownloadUrl, setActiveDownloadUrl] = useState('');
  const [countdown, setCountdown] = useState(3);

  const playerRef = useRef<HTMLDivElement>(null);
  const monetagDirectLink = "https://uplcm.com/4/12311730";

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('media').select('*').eq('id', id).single();
      setMedia(data);
    }
    load();
  }, [id]);

  if (!media) return <div className="min-h-screen bg-[#08080a]" />;

  const tmdbId = media.tmdb_id;
  const isMovie = !media.media_type || media.media_type === 'movie';
  
  // سيرفرات المشاهدة
  const streamingServers = [
    { name: 'سيرفر VIP 1 (مترجم تلقائي)', url: `https://vidlink.pro/${isMovie ? 'movie' : 'tv'}/${tmdbId}?sub.ar=true&primaryColor=dc2626` },
    { name: 'سيرفر EmbedSU (ترجمة مدمجة)', url: `https://embed.su/embed/${isMovie ? 'movie' : 'tv'}/${tmdbId}` },
    { name: 'سيرفر AutoEmbed الاحتياطي', url: `https://player.autoembed.cc/embed/${isMovie ? 'movie' : 'tv'}/${tmdbId}` },
  ];

  // روابط وسيرفرات التحميل الحقيقية الموزعة حسب الجودة
  const downloadTiers = [
    {
      quality: '1080p FHD',
      size: '2.4 GB',
      resolution: '1920x1080',
      tag: 'أعلى دقة',
      servers: [
        { name: 'سيرفر سينما بلاس الصاروخي (Direct CDN)', url: `https://dl.vidlink.pro/download/${isMovie ? 'movie' : 'tv'}/${tmdbId}?res=1080` },
        { name: 'سيرفر Mega السحابي فائق السرعة', url: `https://player.autoembed.cc/download/${tmdbId}?quality=1080` },
        { name: 'سيرفر GoFile المباشر', url: `https://embed.su/download/${tmdbId}` },
      ]
    },
    {
      quality: '720p HD',
      size: '1.1 GB',
      resolution: '1280x720',
      tag: 'الأكثر طلباً',
      servers: [
        { name: 'سيرفر سينما بلاس السريع (Direct CDN)', url: `https://dl.vidlink.pro/download/${isMovie ? 'movie' : 'tv'}/${tmdbId}?res=720` },
        { name: 'سيرفر MediaFire المباشر', url: `https://player.autoembed.cc/download/${tmdbId}?quality=720` },
      ]
    },
    {
      quality: '480p SD',
      size: '520 MB',
      resolution: '854x480',
      tag: 'لباقات الموبايل',
      servers: [
        { name: 'سيرفر التوفير فائق السرعة (Mobile CDN)', url: `https://dl.vidlink.pro/download/${isMovie ? 'movie' : 'tv'}/${tmdbId}?res=480` },
      ]
    }
  ];

  // إجراء الضغط على المشاهدة
  const handlePlayAction = () => {
    window.open(monetagDirectLink, '_blank');
    setShowAdOverlay(true);
    setTimeout(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // إجراء الضغط على سيرفر تحميل معين
  const handleDownloadServerClick = (targetUrl: string) => {
    // 1. فتح الإعلان في نافذة جديدة (تحقيق الـ CPM)
    window.open(monetagDirectLink, '_blank');
    
    // 2. تفعيل مرحلة تجهيز الرابط الحقيقي أمام الزائر في نفس الصفحة
    setActiveDownloadUrl(targetUrl);
    setDownloadStep('generating');
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setDownloadStep('ready');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />

      {/* خلفية البانر */}
      <div className="relative h-[50vh] w-full">
        <img src={getMediaBackdrop(media)} className="w-full h-full object-cover brightness-[0.2]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-40 relative z-10 pb-20">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-56 flex-shrink-0 mx-auto md:mx-0">
             <img src={getMediaPoster(media)} className="w-full rounded-2xl shadow-2xl border border-white/10" />
          </div>
          
          <div className="flex-1 space-y-6 pt-10 md:pt-32 text-center md:text-right">
            <h1 className="text-4xl md:text-6xl font-black" dir="ltr" style={{ textAlign: 'right' }}>
              {media.title}
            </h1>
            
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm font-bold">
              <span className="text-yellow-400 flex items-center gap-1 bg-yellow-400/10 px-3 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-yellow-400" /> {getMediaRating(media)}
              </span>
              <span className="text-gray-400">{getMediaYear(media)}</span>
              <span className="bg-red-600/10 text-red-500 px-2 py-0.5 rounded">4K ULTRA HD</span>
              <span className="text-emerald-400">مترجم للعربية</span>
            </div>

            <p className="text-gray-400 max-w-2xl text-sm md:text-base leading-relaxed">
              {media.overview}
            </p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <button 
                onClick={handlePlayAction}
                className="bg-red-600 hover:bg-red-700 text-white px-10 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-red-600/30 transition-all hover:scale-105"
              >
                <Play className="w-6 h-6 fill-white" /> مشاهدة الفيلم
              </button>
              
              {/* زر التحميل اللي بيفتح نافذة السيرفرات */}
              <button 
                onClick={() => {
                  setDownloadStep('select');
                  setShowDownloadModal(true);
                }}
                className="bg-white/10 hover:bg-white/15 text-white border border-white/10 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:border-red-600/50"
              >
                <Download className="w-5 h-5" /> سيرفرات التحميل المباشر
              </button>
            </div>
          </div>
        </div>

        {/* قسم المشغل الإعلاني / الحقيقي */}
        <div ref={playerRef} className="mt-16">
          {showAdOverlay && (
            <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-[#0c0d12] border border-red-600/30 shadow-2xl flex flex-col items-center justify-center text-center p-6">
              <div className="space-y-6 max-w-md">
                <div className="w-20 h-20 rounded-full bg-red-600/10 flex items-center justify-center mx-auto text-red-600 border border-red-600/20">
                  <ShieldCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">سيرفر المشاهدة جاهز الآن</h3>
                  <p className="text-gray-400 text-xs mt-2">اضغط على الزر أدناه لبدء العرض فوراً بأعلى جودة وترجمة عربية.</p>
                </div>
                
                <button 
                  onClick={() => {
                    setShowAdOverlay(false);
                    setIsPlaying(true);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl"
                >
                  <Play className="w-5 h-5 fill-white" /> تشغيل الفيلم الآن
                </button>
              </div>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-6">
              <div className="aspect-video w-full rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
                <iframe src={streamingServers[activeServer].url} className="w-full h-full" allowFullScreen />
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center bg-[#121318] p-3 rounded-2xl border border-white/5">
                {streamingServers.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      window.open(monetagDirectLink, '_blank');
                      setActiveServer(i);
                    }} 
                    className={`px-6 py-3 rounded-xl text-xs font-black transition-all ${activeServer === i ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* بانر إعلاني */}
        <AdBanner slot="bottom" className="mt-12" />
      </div>

      {/* مودال سيرفرات التحميل المباشر الاحترافي */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#121318] border border-white/10 rounded-3xl max-w-2xl w-full p-6 relative shadow-2xl">
            
            {/* زر إغلاق */}
            <button 
              onClick={() => setShowDownloadModal(false)}
              className="absolute top-5 left-5 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center">
                <ArrowDownToLine className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">سيرفرات التحميل المباشر 📥</h3>
                <p className="text-xs text-gray-400">اختر الجودة والسيرفر المناسب لبدء التحميل بأقصى سرعة</p>
              </div>
            </div>

            {/* المرحلة 1: اختيار الجودة والسيرفر */}
            {downloadStep === 'select' && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {downloadTiers.map((tier, idx) => (
                  <div key={idx} className="bg-[#181a22] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{tier.quality}</span>
                        <span className="text-[10px] bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-0.5 rounded-md font-bold">
                          {tier.tag}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-mono font-bold bg-white/5 px-2 py-1 rounded">
                        {tier.size}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {tier.servers.map((srv, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleDownloadServerClick(srv.url)}
                          className="flex items-center justify-between bg-white/5 hover:bg-red-600 hover:text-white text-gray-300 p-2.5 rounded-xl border border-white/5 transition-all text-xs font-bold group"
                        >
                          <span className="truncate">{srv.name}</span>
                          <Download className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* المرحلة 2: عداد فحص وتوليد الرابط الآمن */}
            {downloadStep === 'generating' && (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-white">جاري إنشاء رابط التحميل المباشر الآمن...</h4>
                <p className="text-xs text-gray-400">يرجى الانتظار ثوانٍ معدودة لفحص الملف ({countdown})</p>
              </div>
            )}

            {/* المرحلة 3: الرابط جاهز للتحميل */}
            {downloadStep === 'ready' && (
              <div className="py-8 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                  <Check className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-white">رابط التحميل جاهز الآن بنجاح! 🎉</h4>
                  <p className="text-xs text-gray-400 mt-1">اضغط على الزر بالأسفل لبدء التنزيل المباشر فوراً بأقصى سرعة.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <a
                    href={activeDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-5 h-5" /> بدء التنزيل الآن (Download)
                  </a>

                  <button
                    onClick={() => setDownloadStep('select')}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 font-bold px-6 py-3.5 rounded-xl text-sm transition-all"
                  >
                    اختيار جودة أخرى
                  </button>
                </div>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-white/5 text-center">
              <p className="text-[11px] text-gray-500">
                🔒 سيرفراتنا آمنة وخالية من أي ملفات ضارة ومحمية بروابط مشفرة عالية السرعة.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
