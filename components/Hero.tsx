"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Star, Calendar, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMediaBackdrop, getMediaPoster, getMediaYear, getMediaRating } from '@/lib/utils';

export default function Hero() {
  const [featured, setFeatured] = useState<any>(null);

  useEffect(() => {
    async function getFeaturedMovie() {
      // جلب أحدث عمل مميز مضاف عندك في قاعدة البيانات
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setFeatured(data[0]);
      }
    }
    getFeaturedMovie();
  }, []);

  // صورة سينمائية فائقة الجودة تعمل 100% كخلفية بديلة
  const fallbackBackdrop = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&auto=format&fit=crop&q=80";
  
  const backdropImg = featured ? getMediaBackdrop(featured) : fallbackBackdrop;
  const title = featured?.title || featured?.name || "سينما بلاس | عالم الترفيه";
  const overview = featured?.overview || "شاهد أحدث الأفلام والمسلسلات والأنمي بجودة فائقة الدقة وبدون إعلانات مزعجة مع سيرفرات مشاهدة وتحميل مباشرة.";
  const year = featured ? getMediaYear(featured) : "2026";
  const rating = featured ? getMediaRating(featured) : "8.9";
  const watchUrl = featured ? `/watch/${featured.id}` : "/explore?type=movie";

  return (
    <div className="relative h-[55vh] min-h-[400px] w-full overflow-hidden flex items-end bg-[#0c0c10] border-b border-white/5">
      {/* خلفية الهيرو */}
      <img 
        src={backdropImg} 
        alt={title}
        onError={(e) => {
          e.currentTarget.src = fallbackBackdrop;
        }}
        className="absolute inset-0 w-full h-full object-cover object-center filter brightness-75 scale-105 transition-transform duration-1000"
      />

      {/* التدرجات اللونية السينمائية لضمان قراءة النصوص بوضوح */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] via-[#08080a]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080a]/90 via-[#08080a]/40 to-transparent" />

      {/* محتوى العمل */}
      <div className="relative z-10 container mx-auto px-4 pb-10">
        <div className="max-w-2xl text-right">
          
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-red-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded shadow">مميز اليوم</span>
            {Number(rating) > 0 && (
              <span className="bg-black/60 backdrop-blur-md text-yellow-400 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/10">
                <Star size={12} fill="currentColor" /> {rating}
              </span>
            )}
            {year && (
              <span className="bg-white/10 text-gray-300 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border border-white/5">
                <Calendar size={12} /> {year}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-3 leading-tight drop-shadow-md">
            {title}
          </h1>

          <p className="text-gray-300 text-xs sm:text-sm mb-6 line-clamp-3 leading-relaxed max-w-xl drop-shadow">
            {overview}
          </p>

          <div className="flex items-center gap-3">
            <Link 
              href={watchUrl}
              className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition shadow-lg shadow-red-600/30 hover:scale-105"
            >
              <Play size={18} fill="currentColor" /> مشاهدة العمل
            </Link>
            <Link 
              href={watchUrl}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition border border-white/10"
            >
              <Info size={18} /> التفاصيل والتحميل
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
