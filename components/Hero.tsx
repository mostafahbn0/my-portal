'use client';
import React from 'react';
import { Play, Info, Star, Calendar, Clock, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Hero() {
  return (
    <div className="relative h-[65vh] md:h-[75vh] w-full bg-black overflow-hidden flex items-center px-6 md:px-16 text-right">
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#08080a] via-[#08080a]/40 to-transparent" />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#08080a]/90 via-transparent to-transparent" />
      <img 
        src="https://image.tmdb.org/t/p/original/o5cl6vS5Ur87N6YvY86YAg0p969.jpg" 
        className="absolute inset-0 w-full h-full object-cover opacity-45" 
        alt="Inception" 
      />

      <div className="relative z-20 max-w-2xl mr-0 ml-auto pt-12">
        <div className="flex items-center gap-2.5 mb-4 justify-end">
          <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
            <Sparkles size={12} /> فيلم مميز
          </span>
          <span className="text-yellow-400 font-bold text-xs flex items-center gap-1 bg-black/60 backdrop-blur px-2 py-0.5 rounded border border-white/10">
            <Star size={13} fill="currentColor" /> 8.4
          </span>
          <span className="text-gray-300 text-xs flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            <Calendar size={13} /> 2010
          </span>
          <span className="text-gray-300 text-xs flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded border border-white/10">
            <Clock size={13} /> 148 دقيقة
          </span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight">استهلال</h1>
        <p className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed line-clamp-3">
          يسرق (كوب) الأسرار القيمة من أعماق العقل الباطن خلال حالة الحلم، والآن يُعرض عليه فرصة لاستعادة حياته الطبيعية مقابل زرع فكرة في عقل أحدهم.
        </p>

        <div className="flex items-center gap-3 justify-end">
          <button className="bg-white/10 hover:bg-white/15 text-white px-5 py-2.5 rounded-xl font-bold text-sm border border-white/10 backdrop-blur-md transition flex items-center gap-1.5">
            <Info size={16} /> تفاصيل العمل
          </button>
          <Link 
            href="/explore?type=movie"
            className="bg-red-600 hover:bg-red-700 text-white px-7 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-lg shadow-red-600/30 transition hover:scale-105"
          >
            <Play fill="white" size={16} /> مشاهدة الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
