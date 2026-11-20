'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { supabase } from '../../lib/supabase';
import { StickyBanner } from '../../components/AdBanner';
import { Star, Play, Calendar, Filter } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialType = searchParams.get('type') || 'movie';
  const [currentType, setCurrentType] = useState(initialType);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      let query = supabase.from('media').select('*').order('created_at', { ascending: false });
      if (currentType === 'movie') query = query.eq('type', 'movie');
      else if (currentType === 'series') query = query.or('type.eq.series,type.eq.tv');
      else if (currentType === 'anime') query = query.eq('type', 'anime');

      const { data } = await query.limit(36);
      setItems(data || []);
      setLoading(false);
    }
    fetchContent();
  }, [currentType]);

  const genres = ['الكل', 'أكشن', 'كوميديا', 'رعب', 'دراما', 'خيال علمي', 'أنمي'];

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-24">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-28">
        
        {/* Header والتبديل بين الأقسام */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6 mb-6">
          <div className="text-right">
            <h1 className="text-2xl font-black text-white">
              {currentType === 'movie' ? 'قسم الأفلام الأجنبية والعربية' : currentType === 'series' ? 'قسم المسلسلات' : 'قسم الأنمي المترجم'}
            </h1>
            <p className="text-xs text-gray-400 mt-1">تصفح أحدث الإصدارات بجودات متعددة وسيرفرات سريعة</p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#121216] p-1.5 rounded-xl border border-white/5">
            {['movie', 'series', 'anime'].map((t) => (
              <button
                key={t}
                onClick={() => setCurrentType(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
                  currentType === t ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'movie' ? 'أفلام' : t === 'series' ? 'مسلسلات' : 'أنمي'}
              </button>
            ))}
          </div>
        </div>

        {/* فلاتر التصنيف */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6">
          {genres.map((g, i) => (
            <button
              key={i}
              className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition ${
                i === 0 ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {/* شبكة الأعمال (Grid) المنسقة */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => {
              const poster = item.poster_path?.startsWith('http') 
                ? item.poster_path 
                : `https://image.tmdb.org/t/p/w500${item.poster_path}`;

              return (
                <Link key={item.id} href={`/watch/${item.id}`} className="group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-[#121216] border border-white/5 group-hover:border-red-600/60 transition shadow">
                    <img src={poster} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={item.title} />
                    <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-white/10 flex items-center gap-0.5">
                      <Star size={10} fill="currentColor" /> {Number(item.vote_average || 7.5).toFixed(1)}
                    </div>
                  </div>
                  <h3 className="mt-2 text-xs font-bold truncate text-right text-gray-200 group-hover:text-red-500">{item.title}</h3>
                </Link>
              );
            })}
          </div>
        )}

      </div>

      <StickyBanner />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}
