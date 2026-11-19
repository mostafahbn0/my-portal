'use client'
import { useState } from 'react'
import { Share2, Check } from 'lucide-react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: window.location.href,
        })
      } catch {
        // تم إلغاء المشاركة بواسطة الزائر
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-slate-400 hover:text-white transition text-sm cursor-pointer"
      title="مشاركة العمل"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-400" />
          <span className="text-green-400 text-xs font-bold">تم نسخ الرابط!</span>
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          <span className="text-xs">مشاركة</span>
        </>
      )}
    </button>
  )
}
