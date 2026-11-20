'use client';
import React, { useState } from 'react';
import { X } from 'lucide-react';

export function StickyBanner() {
  const [closed, setClosed] = useState(false);
  if (closed) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 flex flex-col items-center justify-center pointer-events-none pb-2">
      <div className="relative pointer-events-auto bg-[#101014]/95 border border-white/10 p-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-center max-w-[750px] w-full mx-4">
        <button 
          onClick={() => setClosed(true)} 
          className="absolute -top-3 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow-lg transition"
          title="إغلاق الإعلان"
        >
          <X size={14} />
        </button>
        <div className="w-full h-[70px] md:h-[90px] border border-dashed border-white/20 rounded-lg flex items-center justify-center bg-black/40 text-gray-400 text-xs font-mono">
          <span>مساحة إعلانية عائمة (Sticky Banner 728x90) - ضع كود شركتك هنا</span>
        </div>
      </div>
    </div>
  );
}

export function ContentBanner({ text = "مساحة إعلانية (Responsive Banner)" }: { text?: string }) {
  return (
    <div className="my-8 max-w-[1400px] mx-auto px-4">
      <div className="w-full h-[90px] md:h-[120px] border border-dashed border-white/15 rounded-2xl flex items-center justify-center bg-[#101014]/50 text-gray-500 text-xs font-mono">
        {text}
      </div>
    </div>
  );
}
