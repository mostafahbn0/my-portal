'use client'

import { useState, useEffect } from 'react'
import { ShieldAlert, RefreshCw } from 'lucide-react'

export default function AntiAdblockModal() {
  const [isBlocked, setIsBlocked] = useState(false)

  useEffect(() => {
    const checkAdblock = () => {
      try {
        const bait = document.createElement('div')
        bait.className = 'pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads'
        bait.style.cssText = 'width: 1px !important; height: 1px !important; position: absolute !important; left: -10000px !important; top: -1000px !important;'
        document.body.appendChild(bait)

        setTimeout(() => {
          if (bait.offsetParent === null || bait.offsetHeight === 0 || bait.offsetLeft === 0) {
            setIsBlocked(true)
          }
          bait.remove()
        }, 100)
      } catch {
        setIsBlocked(true)
      }
    }

    checkAdblock()
  }, [])

  if (!isBlocked) return null

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">برجاء إيقاف مانع الإعلانات (AdBlock)</h3>
        <p className="text-sm text-slate-400 leading-relaxed">
          موقع سينما بلس يقدم خدماته مجاناً بالكامل. نرجو منك إيقاف مانع الإعلانات لدعم استمرار الموقع وتحديث السيرفرات يومياً.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/30"
        >
          <RefreshCw className="w-4 h-4" />
          <span>أوقفت مانع الإعلانات، إعادة التحميل</span>
        </button>
      </div>
    </div>
  )
}
