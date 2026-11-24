'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcgwfnevqoowerjeyhgk.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZ3dmbmV2cW9vd2VyamV5aGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEyMzg3NjgsImV4cCI6MjA1NjgxNDc2OH0.m9bQ21Qv9aI6L-f3gEsqFp2rU8P4eB3qVfT-YgM2UeU';
const supabase = createClient(supabaseUrl, supabaseKey);

const TMDB_API_KEY = '204ce203e280acdfec221ea09ea5e763';

export default function WatchPage() {
  const params = useParams();
  const id = params?.id as string;

  const [media, setMedia] = useState<any>(null);
  const [imdbId, setImdbId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [activeServer, setActiveServer] = useState<number>(0);
  const [season, setSeason] = useState<number>(1);
  const [episode, setEpisode] = useState<number>(1);

  // إعدادات الأدمن الديناميكية
  const [adLink, setAdLink] = useState('https://uplcm.com/4/12311730');
  const [clicksNeeded, setClicksNeeded] = useState(2);
  const [clicksCount, setClicksCount] = useState<number>(0);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  // حالة نافذة البلاغات
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportComment, setReportComment] = useState<string>('');
  const [reportSubmitting, setReportSubmitting] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        // 1. جلب إعدادات الإعلانات من لوحة التحكم
        const { data: setts } = await supabase.from('site_settings').select('monetag_direct_link, unlock_clicks_count').eq('id', 'global_config').single();
        if (setts) {
          if (setts.monetag_direct_link) setAdLink(setts.monetag_direct_link);
          if (setts.unlock_clicks_count !== undefined) setClicksNeeded(setts.unlock_clicks_count);
        }

        // 2. جلب بيانات الفيلم من Supabase
        const { data } = await supabase.from('media').select('*').eq('id', id).single();
        if (data) {
          setMedia(data);
          const tmdbType = data.media_type === 'tv' ? 'tv' : 'movie';
          const extRes = await fetch(`https://api.themoviedb.org/3/${tmdbType}/${id}/external_ids?api_key=${TMDB_API_KEY}`);
          const extData = await extRes.json();
          if (extData?.imdb_id) setImdbId(extData.imdb_id);
        } else {
          // جلب مباشر من TMDB
          const mRes = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${TMDB_API_KEY}&language=ar-SA&append_to_response=external_ids`);
          const mData = await mRes.json();
          if (mData?.id) {
            setMedia({
              id: mData.id,
              title: mData.title || mData.name,
              media_type: 'movie',
              overview: mData.overview,
              poster_path: `https://image.tmdb.org/t/p/w500${mData.poster_path}`
            });
            if (mData.external_ids?.imdb_id) setImdbId(mData.external_ids.imdb_id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) loadData();
  }, [id]);

  const targetId = imdbId || id;
  const isTV = media?.media_type === 'tv';

  // سيرفرات التشغيل الـ 6 المجهزة بفرض الترجمة العربية
  const servers = [
    {
      name: 'سيرفر VIP 1 (الترجمة التلقائية SubDL)',
      url: isTV
        ? `https://vidlink.pro/tv/${id}/${season}/${episode}?sub.ar=true&sub_default=ar&sub_lang=ar&primaryColor=dc2626`
        : `https://vidlink.pro/movie/${id}?sub.ar=true&sub_default=ar&sub_lang=ar&primaryColor=dc2626`
    },
    {
      name: 'سيرفر VIP 2 (SuperEmbed فائق السرعة)',
      url: isTV
        ? `https://multiembed.mov/?video_id=${targetId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${targetId}&tmdb=1`
    },
    {
      name: 'سيرفر VIP 3 (AutoEmbed - OpenSubtitles)',
      url: isTV
        ? `https://player.autoembed.cc/embed/tv/${id}/${season}/${episode}?sub_lang=ar&default_sub=ar`
        : `https://player.autoembed.cc/embed/movie/${id}?sub_lang=ar&default_sub=ar`
    },
    {
      name: 'سيرفر VIP 4 (EmbedSu بدون إعلانات)',
      url: isTV
        ? `https://embed.su/embed/tv/${id}/${season}/${episode}`
        : `https://embed.su/embed/movie/${id}`
    },
    {
      name: 'سيرفر VIP 5 (VidSrc Pro 4K)',
      url: isTV
        ? `https://vidsrc.pro/embed/tv/${targetId}/${season}/${episode}`
        : `https://vidsrc.pro/embed/movie/${targetId}`
    },
    {
      name: 'سيرفر VIP 6 (VidSrc السحابي الاحتياطي)',
      url: isTV
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`
    }
  ];

  // نظام فك القفل مع الربح الإعلاني
  const handleUnlockClick = () => {
    window.open(adLink, '_blank', 'noopener,noreferrer');
    const newCount = clicksCount + 1;
    setClicksCount(newCount);
    if (newCount >= clicksNeeded) {
      setIsUnlocked(true);
    }
  };

  // إرسال البلاغ مباشرة للوحة الأدمن
  const handleSendReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setReportSubmitting(true);
    try {
      await supabase.from('media_reports').insert({
        media_id: Number(id),
        media_title: media?.title || `عمل #${id}`,
        server_name: servers[activeServer].name,
        issue_type: 'server_down',
        user_comment: reportComment || 'السيرفر لا يعمل',
        status: 'pending'
      });
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setShowReportModal(false);
        setReportComment('');
      }, 2000);
    } catch (err) {
      alert('تعذر إرسال البلاغ حالياً');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans" dir="rtl">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-bold text-slate-400">جاري تجهيز سيرفرات المشاهدة VIP...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans" dir="rtl">
      {/* الشريط العلوي */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <Link href={`/media/${id}`} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1">
          ← عودة لتفاصيل العمل
        </Link>
        <div className="text-center">
          <h1 className="text-sm md:text-base font-black text-white">{media?.title}</h1>
          <span className="text-[10px] text-red-500 font-bold">بث مباشر فائق السرعة 4K</span>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-xs bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black px-3 py-2 rounded-xl transition border border-amber-500/40 flex items-center gap-1 font-bold"
        >
          🚨 إبلاغ عن مشكلة
        </button>
      </header>

      {/* منطقة المشغل */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 space-y-5">
        <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {!isUnlocked ? (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-20 h-20 bg-red-600/20 text-red-500 border border-red-500/30 rounded-3xl flex items-center justify-center text-4xl mb-4 animate-pulse">
                ▶️
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mb-2">اضغط لبدء المشاهدة بجودة VIP</h2>
              <p className="text-slate-400 text-xs md:text-sm max-w-md mb-6">
                انقر على الزر أدناه لتفعيل المشغل السحابي المجاني وفك قفل السيرفرات فائقة السرعة
              </p>
              <button
                onClick={handleUnlockClick}
                className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-sm md:text-base rounded-2xl transition shadow-xl shadow-red-600/30 active:scale-95 flex items-center gap-2"
              >
                <span>تشغيل الفيلم الآن</span>
                <span className="text-xs bg-red-800 px-2.5 py-0.5 rounded-full">
                  ({clicksCount} / {clicksNeeded})
                </span>
              </button>
            </div>
          ) : (
            <iframe
              src={servers[activeServer]?.url}
              className="w-full h-full border-0"
              allowFullScreen
              referrerPolicy="no-referrer"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            />
          )}
        </div>

        {/* اختيار السيرفرات */}
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300">اختر سيرفر المشاهدة:</span>
            <span className="text-[10px] text-emerald-400">جميع السيرفرات تدعم الترجمة العربية أوتوماتيكياً</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {servers.map((srv, idx) => (
              <button
                key={idx}
                onClick={() => setActiveServer(idx)}
                className={`p-3 rounded-xl text-xs font-bold text-center transition border ${
                  activeServer === idx
                    ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                {srv.name}
              </button>
            ))}
          </div>
        </div>

        {/* اختيار الموسم والحلقة لو كان مسلسلاً */}
        {isTV && (
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400">الموسم:</label>
              <select
                value={season}
                onChange={(e) => setSeason(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>الموسم {s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-400">الحلقة:</label>
              <select
                value={episode}
                onChange={(e) => setEpisode(Number(e.target.value))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white"
              >
                {Array.from({ length: 30 }, (_, i) => i + 1).map((ep) => (
                  <option key={ep} value={ep}>الحلقة {ep}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </main>

      {/* نافذة الإبلاغ عن مشكلة (Report Modal) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md text-right shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              🚨 إبلاغ عن مشكلة في السيرفر
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              هل تواجه مشكلة في الصوت أو السيرفر؟ اكتب لنا التفاصيل ليقوم فريق الدعم بحلها فوراً.
            </p>

            {reportSuccess ? (
              <div className="p-4 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl text-center font-bold">
                ✔️ تم استلام بلاغك بنجاح وسنقوم بمراجعته فوراً، شكراً لمساعدتك!
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">السيرفر الحالي:</label>
                  <input
                    type="text"
                    disabled
                    value={servers[activeServer]?.name}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">تفاصيل المشكلة:</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="مثال: السيرفر بطيء، أو الفيلم لا يحتوي على ترجمة عربية..."
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={reportSubmitting}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    {reportSubmitting ? 'جاري الإرسال...' : 'إرسال البلاغ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
