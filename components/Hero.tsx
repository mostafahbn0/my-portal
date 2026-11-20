'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, Star, Calendar, Clapperboard, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { getMediaBackdrop, getMediaYear, getMediaRating } from '@/lib/utils';

export default function Hero({ items = [] }: { items?: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);

  const heroList = Array.isArray(items) && items.length > 0 ? items.slice(0, 5) : [];

  // تقليب تلقائي كل 6 ثوانٍ
  useEffect(() => {
    if (heroList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroList.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroList.length]);

  if (heroList.length === 0) {
    return (
      <div className="relative w-full h-[60vh] bg-[#0c0d12] flex items-center justify-center border-b border-white/5">
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-5xl font-black text-white">سينما بلاس VIP</h1>
          <p className="text-gray-400 text-sm">أضخم مكتبة سينمائية عربية وأجنبية بجودة 4K</p>
        </div>
      </div>
    );
  }

  const currentItem = heroList[currentIndex] || heroList[0];
  const backdrop = getMediaBackdrop(currentItem);
  const realTitle = currentItem.title || 'عمل سينمائي مميز';
  const year = getMediaYear(currentItem);
  const rating = getMediaRating(currentItem);

  return (
    <div className="relative w-full h-[70vh] md:h-[82vh] bg-[#08080a] overflow-hidden group">
      
      {/* خلفية البوستر مع تلاشي متحرك */}
      <div 
        key={currentItem.id}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out filter brightness-60 scale-105 group-hover:scale-100"
        style={{ backgroundImage: `url(${backdrop})` }}
      />

      {/* التدرجات اللونية الفخمة لمنع تشويه النص */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/40 to-transparent" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60 pointer-events-none" />

      {/* المحتوى النصي داخل البانر */}
      <div className="absolute bottom-16 right-0 left-0 max-w-7xl mx-auto px-4 sm:px-6 space-y-5 z-20">
        
        {/* البادجات */}
        <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-300">
          <span className="bg-red-600 text-white font-black px-3 py-1 rounded-full text-[11px] tracking-wide uppercase shadow-lg shadow-red-600/40">
            🔥 متصدر المشاهدات الآن
          </span>

          {Number(rating) > 0 && (
            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full font-bold border border-yellow-500/30 text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-yellow-400" />
              <span>{rating} / 10</span>
            </div>
          )}

          {year && (
            <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-gray-200 font-semibold">
              {year}
            </span>
          )}

          <span className="bg-white/5 backdrop-blur-md px-3 py-1 rounded-full border border-white/5 text-emerald-400 font-bold">
            Ultra HD 4K
          </span>
        </div>

        {/* العنوان الرئيسي */}
        <div className="max-w-3xl space-y-2">
          <h1 
            className="text-4xl sm:text-6xl md:text-7xl font-black text-white leading-tight drop-shadow-2xl" 
            dir="ltr"
            style={{ textAlign: 'right' }}
          >
            {realTitle}
          </h1>
        </div>

        {/* ملخص العمل */}
        <p className="text-gray-300 text-sm md:text-base max-w-2xl line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-md">
          {currentItem.overview || 'مشاهدة وتحميل بأعلى دقة متوفرة مع سيرفرات متعددة سريعة وترجمة عربية معتمدة على سينما بلاس.'}
        </p>

        {/* الأزرار التفاعلية */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href={`/watch/${currentItem.id}`}
            className="flex items-center gap-2.5 bg-red-600 hover:bg-red-700 text-white font-black px-8 py-3.5 rounded-2xl transition-all shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 text-sm md:text-base"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>مشاهدة العمل</span>
          </Link>

          <Link
            href={`/watch/${currentItem.id}`}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold px-6 py-3.5 rounded-2xl border border-white/15 transition-all text-sm md:text-base"
          >
            <Info className="w-5 h-5" />
            <span>تفاصيل السيرفرات</span>
          </Link>
        </div>
      </div>

      {/* مؤشرات التقليب (Dots) وأزرار الأسهم */}
      {heroList.length > 1 && (
        <div className="absolute bottom-6 left-6 z-20 flex items-center gap-2">
          {heroList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentIndex === idx ? 'w-8 bg-red-600' : 'w-2 bg-white/30 hover:bg-white/60'
              }`}
              title={`انتقل للشريحة ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
