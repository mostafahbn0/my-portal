"use client";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function MovieSlider({ type }: { type: string }) {
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    async function getMovies() {
      const { data } = await supabase.from('media').select('*').eq('type', type).limit(10);
      if (data) setMovies(data);
    }
    getMovies();
  }, [type]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {movies.map((movie) => (
        <Link href={`/watch/${movie.id}`} key={movie.id} className="group">
          <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10">
            <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="font-bold text-sm">{movie.title}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
