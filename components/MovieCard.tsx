"use client";
import React from 'react';
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { getImg } from '@/lib/utils';

export default function MovieCard({ movie }: { movie: any }) {
  return (
    <Link 
      href={`/watch/${movie.id}`} 
      className="group relative block rounded-xl overflow-hidden bg-[#101014] border border-white/5 hover:border-red-600/40 transition-all duration-300 shadow-md hover:-translate-y-1"
    >
      {/* الحاوية بنظام poster-box لمنع انهيار الارتفاع */}
      <div className="poster-box">
        <img
          src={getImg(movie.poster_path)}
          alt={movie.title || 'فيلم'}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
          }}
          className="transition-transform duration-500 group-hover:scale-105"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
        
        {/* التقييم والشارة */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end z-10">
          <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow">HD</span>
          <span className="bg-black/80 backdrop-blur-md text-yellow-500 text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 border border-white/10">
            <Star size={11} fill="currentColor" /> {movie.vote_average ? Number(movie.vote_average).toFixed(1) : '6.5'}
          </span>
        </div>

        {/* زر التشغيل الشفاف */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <div className="bg-red-600 text-white p-3 rounded-full shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
            <Play size={20} fill="currentColor" />
          </div>
        </div>
      </div>
      
      <div className="p-2.5 bg-[#101014]">
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
