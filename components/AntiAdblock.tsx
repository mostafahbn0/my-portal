'use client'
import { useState, useEffect } from 'react'
import { ShieldAlert, XCircle, RefreshCw } from 'lucide-react'

export default function AntiAdblock() {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    // طريقة بسيطة للكشف عن Adblock عبر محاولة جلب ملف وهمي باسم إعلاني
    async function checkAdBlock() {
      const googleAdUrl = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
      try {
        const res = await fetch(googleAdUrl, { method: 'HEAD', mode: 'no-cors' })
      } catch (e) {
        setIsBlocked(true)
      }
    }
    
    // تأخير بسيط للتأكد من تحميل كافة الإضافات
    const timer = setTimeout(checkAdBlock, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!isBlocked) return null

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-red-500/30 rounded-[2.5rem] p-8 max-w-md w-full text-center space-y-6 shadow-2xl shadow-red-600/20 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white">تنبيه: مانع الإعلانات مفعل</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            نحن نعتمد على الإعلانات لتوفير المحتوى مجاناً وبأعلى جودة. يرجى إغلاق مانع الإعلانات (AdBlock) لتتمكن من تصفح الموقع والمشاهدة.
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right space-y-2">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <XCircle className="w-4 h-4 text-red-500" /> اضغط على أيقونة الإضافة في متصفحك
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <XCircle className="w-4 h-4 text-red-500" /> اختر &quot;إيقاف في هذا الموقع&quot;
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl transition flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-5 h-5" /> لقد قمت بإغلاقه، أعد التحميل
        </button>
      </div>
    </div>
  )
}
