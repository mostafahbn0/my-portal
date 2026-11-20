'use client';

import { useState } from 'react';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface AdBannerProps {
  slot: string;
  className?: string;
  sticky?: boolean;
}

export default function AdBanner({ slot, className = "", sticky = false }: AdBannerProps) {
  const [closed, setClosed] = useState(false);
  const directLink = "https://uplcm.com/4/12311730";

  if (closed) return null;

  // إذا كان إعلان شريط سفلي لاصق
  if (sticky) {
    return (
      <aside aria-label="إعلان ممول" className="fixed bottom-0 left-0 right-0 z-40 bg-[#121318]/95 backdrop-blur-md border-t border-red-600/30 p-2 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded">إعلان</span>
            <p className="text-xs sm:text-sm text-gray-200 font-bold truncate">
              🔥 شاهد وحمّل أحدث أفلام 2025 بجودة 4K وبدون انقطاع!
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-black px-4 py-1.5 rounded-lg transition-all shadow-md shadow-red-600/30"
            >
              اضغط هنا
            </a>
            <button
              onClick={() => setClosed(true)}
              className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
              title="إغلاق الإعلان"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // بانرات داخل المحتوى (Leaderboard / In-Content)
  return (
    <div className={`relative mx-auto my-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-[#121318] via-[#1a1c24] to-[#121318] p-4 text-center shadow-xl transition-all hover:border-red-600/40 group ${className}`}>
      <span className="absolute top-1.5 right-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
        ADVERTISEMENT
      </span>

      <a
        href={directLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-2"
      >
        <div className="flex items-center gap-3 text-right">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center flex-shrink-0 border border-red-600/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-black text-white group-hover:text-red-400 transition-colors">
              أسرع سيرفرات التحميل والمشاهدة بدقة 4K VIP
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              انقر هنا لفتح السيرفر فائق السرعة بدون إعلانات مزعجة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-red-600/30 transition-all flex-shrink-0">
          <span>دخول السيرفر</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </a>
    </div>
  );
}
