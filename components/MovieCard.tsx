"use client";
import React from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { getImg } from '@/lib/utils';

export default function MovieCard({ movie }: { movie: any }) {
  return (
    <Link 
      href={`/watch/${movie.id}`} 
      className="group relative block rounded-xl overflow-hidden bg-[#101014] border border-white/5 hover:border-red-600/40 transition-all duration-300 shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-black/40">
        <img
          src={getImg(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        
        {/* شارة الجودة والتقييم */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
          <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">HD</span>
          <span className="bg-black/70 backdrop-blur-md text-yellow-500 text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Star size={11} fill="currentColor" /> {movie.vote_average ? Number(movie.vote_average).toFixed(1) : '6.5'}
          </span>
        </div>

        {/* زر التشغيل عند التمرير */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-red-600 text-white p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </div>
      
      <div className="p-2.5">
        <h3 className="text-xs font-bold text-white truncate group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center mt-1 text-[11px] text-gray-400">
          <span>{movie.release_date ? movie.release_date.split('-')[0] : '2024'}</span>
          <span className="text-red-500/80 font-medium">
            {movie.type === 'movie' ? 'فيلم' : movie.type === 'anime' ? 'أنمي' : 'مسلسل'}
          </span>
        </div>
      </div>
    </Link>
  );
}
