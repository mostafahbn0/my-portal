"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import { getImg } from '@/lib/utils';

export default function MovieSlider({ type }: { type: string }) {
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    async function getMovies() {
      const { data } = await supabase.from('media').select('*').eq('type', type).order('created_at', { ascending: false }).limit(10);
      if (data) setMovies(data);
    }
    getMovies();
  }, [type]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
      {movies.map((movie) => (
        <Link href={`/watch/${movie.id}`} key={movie.id} className="group relative block rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-red-600/50 transition-all shadow-lg">
          <div className="relative aspect-[2/3] overflow-hidden">
            <img src={getImg(movie.poster_path)} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-yellow-500 text-xs font-bold flex items-center gap-1 border border-white/10">
               <Star size={12} fill="currentColor" /> {movie.vote_average?.toFixed(1)}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="bg-red-600 p-3 rounded-full shadow-xl transform scale-75 group-hover:scale-100 transition-transform">
                  <Play size={24} fill="currentColor" />
               </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-bold text-sm truncate group-hover:text-red-500 transition-colors">{movie.title}</h3>
            <p className="text-[10px] text-gray-500 mt-1">{movie.release_date?.split('-')[0]}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
