'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import MovieCard from '@/components/MovieCard';
import AdBanner from '@/components/AdBanner';
import { Search } from 'lucide-react';

function ExploreContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('cat') || '';

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(queryParam);
  const [selectedType, setSelectedType] = useState(categoryParam || 'all');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase.from('media').select('*');

        if (searchTerm.trim()) {
          const q = searchTerm.trim();
          query = query.or(`title.ilike.%${q}%,overview.ilike.%${q}%`);
        }

        if (selectedType === 'movies') {
          query = query.eq('media_type', 'movie');
        } else if (selectedType === 'series') {
          query = query.or('media_type.eq.series,media_type.eq.tv');
        }

        query = query.order('id', { ascending: false }).limit(60);

        const { data } = await query;
        if (data) {
          setItems(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchData, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedType]);

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white">مكتبة الأعمال السينمائية</h1>
            <p className="text-sm text-gray-400 mt-1">ابحث وتصفح أحدث الأفلام والمسلسلات بأعلى دقة</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم الحقيقي..."
                className="w-full bg-[#121318] text-sm text-white rounded-xl pl-4 pr-10 py-2.5 border border-white/10 focus:border-red-600 focus:outline-none"
              />
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center gap-1.5 bg-[#121318] p-1 rounded-xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'all' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setSelectedType('movies')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'movies' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                أفلام
              </button>
              <button
                onClick={() => setSelectedType('series')}
                className={`px-3 py-1.5 rounded-lg transition-all ${selectedType === 'series' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                مسلسلات
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-pulse">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-white/5 rounded-xl" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <MovieCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">لم يتم العثور على أي أعمال مطابقة لبحثك.</p>
          </div>
        )}

        <div className="my-10">
          <AdBanner slot="explore-bottom" />
        </div>
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#08080a] flex items-center justify-center"><div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
