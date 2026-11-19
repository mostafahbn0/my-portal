'use client'
import { useState, useEffect } from 'react'
import { Download, ShieldCheck, Zap, Clock, ArrowDownCircle, ExternalLink, CheckCircle } from 'lucide-react'
import AdSlot from '@/components/AdSlot'

export default function DownloadPage({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { episode?: string }
}) {
  const [seconds, setSeconds] = useState(10)
  const [ready, setReady] = useState(false)
  const [media, setMedia] = useState<any>(null)
  const [links, setLinks] = useState<any[]>([])
  const [selectedQuality, setSelectedQuality] = useState('ALL')

  // العداد التنازلي الإعلاني
  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setReady(true)
    }
  }, [seconds])

  // جلب البيانات
  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/search/live?q=${params.slug}`)
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        setMedia(data.results[0])
      }
    }
    loadData()
  }, [params.slug])

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8 text-right" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 bg-green-500/10 rounded-2xl text-green-400 mb-1">
          <ShieldCheck className="w-10 h-10" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          مركز تحميل {media?.title_ar || 'المحتوى'}
        </h1>
        <p className="text-slate-400 text-sm">
          روابط تحميل مباشرة وسريعة تدعم استكمال التحميل على مدار 24 ساعة
        </p>
      </div>

      <AdSlot type="banner" />

      {/* العداد التنازلي الإعلاني (سر أرباح الإعلانات) */}
      {!ready ? (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="w-full h-full rounded-full border-4 border-slate-800 border-t-red-600 animate-spin" />
            <span className="absolute text-3xl font-black text-white">{seconds}</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
              جاري فحص وتجهيز روابط التحميل المباشرة...
            </h3>
            <p className="text-slate-400 text-xs">يرجى الانتظار بضع ثوانٍ لحين تجهيز خوادم التحميل السريعة</p>
          </div>

          {/* إعلان مدمج تحت العداد */}
          <div className="max-w-md mx-auto pt-2">
            <AdSlot type="in-feed" />
          </div>
        </div>
      ) : (
        /* جدول الروابط بعد انتهاء العداد */
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          <div className="p-6 border-b border-slate-800 bg-slate-800/40 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h2 className="text-lg font-bold text-white">روابط التحميل جاهزة الآن</h2>
            </div>
            
            {/* تبويبات الفلترة حسب الجودة */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['ALL', '1080p', '720p', '480p'].map((q) => (
                <button
                  key={q}
                  onClick={() => setSelectedQuality(q)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition ${
                    selectedQuality === q
                      ? 'bg-red-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {q === 'ALL' ? 'كل الجودات' : q}
                </button>
              ))}
            </div>
          </div>

          {/* قائمة السيرفرات */}
          <div className="divide-y divide-slate-800/80">
            {[
              { name: 'Google Drive VIP', quality: '1080p FHD', speed: 'سرعة فائقة', color: 'text-blue-400' },
              { name: 'MediaFire Direct', quality: '720p HD', speed: 'مباشر وسريع', color: 'text-amber-400' },
              { name: 'Mega Cloud Server', quality: '1080p FHD', speed: 'استكمال غير محدود', color: 'text-red-400' },
              { name: '1Fichier High Speed', quality: '480p SD', speed: 'حجم اقتصادي', color: 'text-emerald-400' },
            ]
              .filter(s => selectedQuality === 'ALL' || s.quality.includes(selectedQuality))
              .map((server, idx) => (
                <div
                  key={idx}
                  className="p-5 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:bg-green-600 group-hover:text-white transition shadow">
                      <Download className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-white font-extrabold flex items-center gap-2">
                        {server.name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {server.speed}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        الجودة: <span className="font-bold text-slate-200">{server.quality}</span> • الصوت: عربي/مترجم
                      </div>
                    </div>
                  </div>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault()
                      alert('سيتم فتح رابط التحميل المباشر الآن...')
                    }}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-black rounded-xl transition shadow-lg shadow-green-600/20 flex items-center gap-2 group-hover:scale-105"
                  >
                    <ArrowDownCircle className="w-4 h-4" />
                    تحميل مباشر
                  </a>
                </div>
              ))}
          </div>

        </div>
      )}

      {/* نصيحة للمستخدم */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
        <p className="text-slate-400 text-xs">
          💡 نوصي باستخدام متصفح يدعم استكمال التحميل أو برامج التحميل المباشرة لضمان عدم انقطاع التنزيل.
        </p>
      </div>

    </div>
  )
}
