'use client'
import { useState } from 'react'
import { Play, Server, AlertTriangle, Moon, Sun, CheckCircle, ChevronRight, ChevronLeft, ExternalLink } from 'lucide-react'
import { Link as MediaLink } from '@/lib/types'
import Link from 'next/link'

interface Props {
  links: MediaLink[]
  title: string
  mediaId: string
  prevEpisode?: number | null
  nextEpisode?: number | null
  mediaSlug: string
  isSeries?: boolean
  currentEpisode?: number
}

export default function WatchPlayer({
  links,
  title,
  mediaId,
  prevEpisode,
  nextEpisode,
  mediaSlug,
  isSeries,
  currentEpisode
}: Props) {
  const [activeLinkIndex, setActiveLinkIndex] = useState(0)
  const [cinemaMode, setCinemaMode] = useState(false)
  const [reportModal, setReportModal] = useState(false)
  const [reporting, setReporting] = useState(false)
  const [reported, setReported] = useState(false)

  const activeLink = links[activeLinkIndex]

  const handleReport = async () => {
    setReporting(true)
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaId,
          serverName: activeLink?.server_name || 'سيرفر غير محدد',
          issueType: 'server_down',
          details: `عطل في سيرفر المشاهدة: ${activeLink?.server_name || 'تلقائي'}`
        })
      })
      setReported(true)
      setTimeout(() => {
        setReported(false)
        setReportModal(false)
      }, 2000)
    } catch (e) {
      alert('حدث خطأ أثناء إرسال البلاغ')
    } finally {
      setReporting(false)
    }
  }

  return (
    <>
      {/* طبقة وضع السينما (تعتيم كامل للشاشة) */}
      {cinemaMode && (
        <div 
          onClick={() => setCinemaMode(false)}
          className="fixed inset-0 bg-black/95 z-40 transition-opacity duration-300"
        />
      )}

      <div className={`space-y-4 ${cinemaMode ? 'relative z-50 max-w-6xl mx-auto' : ''}`}>
        
        {/* شريط التحكم العلوي: سيرفرات + وضع السينما + تبليغ */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800">
          
          {/* قائمة أزرار السيرفرات */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 max-w-full">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 pl-2 border-l border-slate-800">
              <Server className="w-3.5 h-3.5 text-red-500" /> السيرفرات:
            </span>
            {links && links.length > 0 ? (
              links.map((link, idx) => (
                <button
                  key={link.id || idx}
                  onClick={() => setActiveLinkIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                    activeLinkIndex === idx
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Play className="w-3 h-3 fill-current" />
                  {link.server_name || `سيرفر ${idx + 1}`}
                  <span className="text-[10px] opacity-75">({link.quality || 'HD'})</span>
                </button>
              ))
            ) : (
              <span className="text-xs text-amber-500 font-medium">جاري تجهيز السيرفرات...</span>
            )}
          </div>

          {/* أزرار الخدمات: سينما / تبليغ */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCinemaMode(!cinemaMode)}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                cinemaMode 
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={cinemaMode ? 'إلغاء وضع السينما' : 'تفعيل وضع السينما'}
            >
              {cinemaMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="hidden sm:inline">{cinemaMode ? 'إنارة الشاشة' : 'وضع السينما'}</span>
            </button>

            <button
              onClick={() => setReportModal(true)}
              className="p-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-red-500/20 text-slate-300 hover:text-red-400 border border-slate-700/60 transition flex items-center gap-1.5"
              title="تبليغ عن سيرفر معطل"
            >
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="hidden sm:inline">تبليغ عن عطل</span>
            </button>
          </div>

        </div>

        {/* حاوية الفيديو (iframe المشغل) */}
        <div className="relative aspect-video w-full bg-black rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
          {activeLink?.url ? (
            <iframe
              src={activeLink.url}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-slate-950">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Play className="w-8 h-8 translate-x-[-2px]" />
              </div>
              <h3 className="text-lg font-bold text-white">لا يتوفر سيرفر تشغيل حالياً</h3>
              <p className="text-slate-400 text-sm max-w-md">
                قم بإضافة روابط السيرفرات لهذا المحتوى من لوحة التحكم لتظهر هنا فوراً.
              </p>
            </div>
          )}
        </div>

        {/* أزرار التنقل السريع بين الحلقات للمسلسلات */}
        {isSeries && (
          <div className="flex items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
            {prevEpisode ? (
              <Link
                href={`/watch/${mediaSlug}?episode=${prevEpisode}`}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-600 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition"
              >
                <ChevronRight className="w-4 h-4" />
                <span>الحلقة السابقة ({prevEpisode})</span>
              </Link>
            ) : <div />}

            <span className="text-white font-extrabold text-sm sm:text-base">
              الحلقة {currentEpisode}
            </span>

            {nextEpisode ? (
              <Link
                href={`/watch/${mediaSlug}?episode=${nextEpisode}`}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-lg shadow-red-600/20"
              >
                <span>الحلقة التالية ({nextEpisode})</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            ) : <div />}
          </div>
        )}

      </div>

      {/* نافذة التبليغ المنبثقة (Modal) */}
      {reportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 text-right shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                تبليغ عن سيرفر معطل
              </h3>
              <button 
                onClick={() => setReportModal(false)}
                className="text-slate-400 hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            {reported ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                <h4 className="text-lg font-bold text-white">شكراً لك! تم استلام البلاغ</h4>
                <p className="text-slate-400 text-sm">سيقوم فريق الموقع بإصلاح السيرفر في أقرب وقت.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-300 text-sm leading-relaxed">
                  هل تواجه مشكلة في تشغيل <b>{activeLink?.server_name || 'هذا السيرفر'}</b>؟ أبلغنا فوراً لنقوم بتحديثه أو توفير بديل صالح.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                  المادة: <span className="text-white font-bold">{title}</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    disabled={reporting}
                    onClick={handleReport}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
                  >
                    {reporting ? 'جاري الإرسال...' : 'تأكيد إرسال البلاغ'}
                  </button>
                  <button
                    onClick={() => setReportModal(false)}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
