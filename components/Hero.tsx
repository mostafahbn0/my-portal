"use client";
import React from 'react';
import Link from 'next/link';
import { Play, Info, Star } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative h-[48vh] min-h-[360px] w-full overflow-hidden flex items-end">
      <img 
        src="https://image.tmdb.org/t/p/original/r236m7vSjU0VvSVeYmptDIvjv3f.jpg" 
        alt="Inception" 
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/90 via-transparent to-transparent" />

      <div className="relative z-10 container mx-auto px-4 pb-8">
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">عمل مميز</span>
            <span className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
              <Star size={13} fill="currentColor" /> 8.8
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-white mb-2 leading-tight">Inception: بداية الحلم</h1>
          <p className="text-gray-300 text-xs md:text-sm mb-4 line-clamp-2">
            سارق يمتلك قدرة الدخول إلى أحلام الآخرين لسرقة أفكارهم، يُعرض عليه فرصة أخيرة لاستعادة حياته الطبيعية من خلال زرع فكرة داخل عقل شخص آخر.
          </p>
          <div className="flex items-center gap-3">
            <Link 
              href="/explore?type=movie"
              className="bg-red-600 hover:bg-red-700 text-white text-xs md:text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition shadow-lg shadow-red-600/30"
            >
              <Play size={16} fill="currentColor" /> تصفح الآن
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
