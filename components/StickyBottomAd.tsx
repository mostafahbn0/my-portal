'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export default function StickyBottomAd() {
  const [closed, setClosed] = useState(false)

  if (closed) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 border-t border-slate-800 p-2 shadow-2xl backdrop-blur-md">
      <div className="container mx-auto max-w-5xl relative flex items-center justify-center">
        <button
          onClick={() => setClosed(true)}
          className="absolute -top-3 left-2 bg-slate-800 hover:bg-rose-600 text-white rounded-full p-1 border border-slate-700 transition-colors shadow-lg"
          title="إغلاق الإعلان"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="w-full flex justify-center items-center py-1">
          <div className="w-full max-w-[728px] h-[50px] md:h-[60px] bg-slate-900 border border-dashed border-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400 font-semibold">
            <span>مساحة إعلانية عائمة (Sticky Banner 728x90)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
