'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, Star, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MovieSlider({ title, type }: { title: string, type: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function getData() {
      const { data } = await supabase.from('media').select('*').eq('type', type).limit(14);
      setItems(data || []);
    }
    getData();
  }, [type]);

  if (items.length === 0) return null;

  return (
    <div className="mb-10 px-4 md:px-12 relative z-20">
      <div className="flex items-center justify-between mb-4 border-r-2 border-red-600 pr-3">
        <h2 className="text-lg md:text-xl font-black text-white">{title}</h2>
        <Link href={`/explore?type=${type}`} className="text-xs text-red-500 hover:text-red-400 font-bold">
          عرض المزيد ←
        </Link>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 scroll-smooth">
        {items.map((item) => {
          const poster = item.poster_path?.startsWith('http') 
            ? item.poster_path 
            : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

          return (
            <Link key={item.id} href={`/watch/${item.id}`} className="flex-none w-[140px] md:w-[185px] group">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#121216] border border-white/5 group-hover:border-red-600/60 transition-all duration-300 shadow-md">
                <img 
                  src={poster} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={item.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="bg-red-600 p-3 rounded-full shadow-lg scale-75 group-hover:scale-100 transition-transform">
                    <Play fill="white" size={20} />
                  </div>
                </div>

                {/* Quality & Rating badges */}
                <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-white/10">
                  <Star size={10} fill="currentColor" /> {Number(item.vote_average || 7.5).toFixed(1)}
                </div>
                <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                  FHD
                </div>
              </div>

              <div className="mt-2 text-right">
                <h3 className="font-bold text-xs truncate text-gray-200 group-hover:text-red-500 transition">
                  {item.title}
                </h3>
                <span className="text-[10px] text-gray-500 flex items-center gap-1 justify-end mt-0.5">
                  <Calendar size={10} /> {item.release_date?.split('-')[0] || '2024'}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
