"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getMediaPoster, getMediaRating } from '@/lib/utils';
import { Flame, Star } from 'lucide-react';

export default function Top10Slider() {
  const [topItems, setTopItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadTop10() {
      const { data } = await supabase
        .from('media')
        .select('*')
        .order('vote_average', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setTopItems(data);
      }
    }
    loadTop10();
  }, []);

  if (topItems.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-black flex items-center gap-2 border-r-4 border-red-600 pr-3 text-white">
          <Flame size={22} className="text-red-600" /> توب 10: الأكثر شعبية وتقييماً
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none pt-2">
        {topItems.map((item, index) => {
          const rank = index + 1;
          const poster = getMediaPoster(item);
          const rating = getMediaRating(item);

          return (
            <Link
              key={item.id}
              href={`/watch/${item.id}`}
              className="group flex-shrink-0 relative flex items-end w-44 sm:w-48 transition-transform duration-300 hover:scale-105"
            >
              {/* الرقم العملاق على طريقة نتفليكس */}
              <span className="text-7xl sm:text-8xl font-black tracking-tighter text-transparent select-none leading-none -ml-5 z-20 font-mono"
                style={{
                  WebkitTextStroke: '2px #dc2626',
                  textShadow: '0 0 20px rgba(220, 38, 38, 0.4)'
                }}
              >
                {rank}
              </span>

              {/* كارت البوستر */}
              <div className="relative w-32 sm:w-36 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-[#121216] z-10 flex-shrink-0">
                <img 
                  src={poster} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70" />
                <div className="absolute top-1.5 right-1.5 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] text-yellow-400 font-bold flex items-center gap-1 border border-white/10">
                  <Star size={10} fill="currentColor" /> {rating}
                </div>
                <div className="absolute bottom-1.5 inset-x-1.5 text-right">
                  <p className="text-[11px] font-bold text-white truncate group-hover:text-red-500 transition">
                    {item.title}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
