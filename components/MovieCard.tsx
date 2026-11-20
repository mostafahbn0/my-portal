"use client";
import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import { getImg } from '@/lib/utils';

export default function MovieCard({ movie }: { movie: any }) {
  return (
    <Link href={`/watch/${movie.id}`} className="group relative block rounded-xl overflow-hidden bg-[#121214] transition-all hover:scale-105 hover:z-10 shadow-lg">
      <div className="aspect-[2/3] relative">
        <img
          src={getImg(movie.poster_path)}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1 text-yellow-500 text-xs font-bold">
          <Star size={12} fill="currentColor" />
          {movie.vote_average?.toFixed(1)}
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-red-600 p-3 rounded-full shadow-2xl">
            <Play size={24} fill="currentColor" className="text-white" />
          </div>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[10px] text-gray-400">{movie.release_date?.split('-')[0]}</span>
          <span className="text-[10px] px-1.5 py-0.5 border border-gray-700 rounded text-gray-400">
            {movie.type === 'movie' ? 'فيلم' : 'مسلسل'}
          </span>
        </div>
      </div>
    </Link>
  );
}
