"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import AdBanner from '@/components/AdBanner';
import { Film, Tv, Sparkles, Filter, Search } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get('type') || 'all';
  const queryParam = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || 'all';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(typeParam);
  const [selectedGenre, setSelectedGenre] = useState(genreParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);

  const genres = ['الكل', 'أكشن', 'كوميدي', 'دراما', 'رعب', 'خيال علمي', 'أنمي', 'مغامرة', 'جريمة', 'عائلي'];

  useEffect(() => {
    setSelectedType(typeParam);
    setSearchQuery(queryParam);
    setSelectedGenre(genreParam);
  }, [typeParam, queryParam, genreParam]);

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      let query = supabase.from('media').select('*');

      if (selectedType !== 'all') {
        query = query.eq('type', selectedType);
      }

      if (searchQuery.trim() !== '') {
        query = query.ilike('title', `%${searchQuery}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (data && data.length > 0) {
        if (selectedGenre !== 'all') {
          const filtered = data.filter((item: any) => 
            item.genres && Array.isArray(item.genres) && item.genres.includes(selectedGenre)
          );
          setItems(filtered);
        } else {
          setItems(data);
        }
      } else {
        setItems([]);
      }
      setLoading(false);
    }

    fetchMedia();
  }, [selectedType, selectedGenre, searchQuery]);

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    router.push(`/explore?type=${type}&genre=${selectedGenre}&q=${searchQuery}`);
  };

  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    router.push(`/explore?type=${selectedType}&genre=${genre}&q=${searchQuery}`);
  };

  const getPageTitle = () => {
    if (searchQuery) return `نتائج البحث عن: "${searchQuery}"`;
    if (selectedType === 'movie') return 'الأفلام السينمائية';
    if (selectedType === 'series') return 'المسلسلات التلفزيونية';
    if (selectedType === 'anime') return 'عالم الأنمي المترجم';
    return 'جميع الأعمال المتوفرة';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* رأس الصفحة وفلاتر النوع */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2 border-r-4 border-red-600 pr-3">
            {getPageTitle()}
          </h1>
          <p className="text-gray-400 text-xs mt-1">تصفح وشاهد بدقة عالية وبدون إعلانات مزعجة</p>
        </div>

        {/* أزرار التبديل السريع */}
        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
          <button 
            onClick={() => handleTypeChange('all')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition ${selectedType === 'all' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            الكل
          </button>
          <button 
            onClick={() => handleTypeChange('movie')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${selectedType === 'movie' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Film size={14} /> الأفلام
          </button>
          <button 
            onClick={() => handleTypeChange('series')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${selectedType === 'series' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Tv size={14} /> المسلسلات
          </button>
          <button 
            onClick={() => handleTypeChange('anime')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 ${selectedType === 'anime' ? 'bg-red-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
          >
            <Sparkles size={14} /> الأنمي
          </button>
        </div>
      </div>

      {/* شريط التصنيفات (Genres Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
        <span className="text-xs text-gray-500 font-bold flex items-center gap-1 flex-shrink-0 ml-2">
          <Filter size={14} /> التصنيف:
        </span>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => handleGenreChange(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
              (selectedGenre === g || (g === 'الكل' && selectedGenre === 'all'))
                ? 'bg-red-600/20 text-red-500 border-red-600'
                : 'bg-white/5 border-white/5 text-gray-300 hover:border-white/20'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <AdBanner type="top" />

      {/* شبكة الأعمال */}
      {loading ? (
        <div className="py-20 text-center text-red-600 font-bold">جاري تحميل الأعمال...</div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {items.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 p-8">
          <Search size={40} className="mx-auto text-gray-500 mb-3 opacity-40" />
          <h3 className="text-lg font-bold text-white mb-1">لم نعثر على أي أعمال</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            جرب اختيار تصنيف آخر أو البحث بكلمات مختلفة، أو يمكنك طلب إضافة العمل من زر "اطلب عملك".
          </p>
        </div>
      )}

      <AdBanner type="inline" />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      {/* الـ Suspense ده هو اللي بيمنع الـ Crash في Next.js 14 تماماً */}
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-red-600 font-bold">جاري التحميل...</div>}>
        <ExploreContent />
      </Suspense>
      <AdBanner type="sticky" />
    </main>
  );
}
