"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import MovieCard from './MovieCard';

export default function MovieSlider({ type }: { type: string }) {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    async function loadContent() {
      const { data } = await supabase
        .from('media')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && data.length > 0) {
        setItems(data);
      }
    }
    loadContent();
  }, [type]);

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
      {items.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
}
