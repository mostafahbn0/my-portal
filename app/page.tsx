'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Play, Film, Tv, Sparkles, Star } from 'lucide-react';

export default function HomePage() {
  const [allMedia, setAllMedia] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('media').select('*').order('created_at', { ascending: false });
      if (data) setAllMedia(data);
      setLoading(false);
    }
    load();
  }, []);

  const movies = allMedia.filter(m => m.type === 'movie' || m.media_type === 'movie' || (!m.type && !m.media_type));
  const series = allMedia.filter(m => m.type === 'series' || m.type === 'tv' || m.media_type === 'series' || m.media_type === 'tv');

  const getDisplayData = () => {
    if (activeTab === 'movies') return movies;
    if (activeTab === 'series') return series;
    return allMedia;
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-white pb-20" dir="rtl">
      {/* Hero Section */}
      <section className="relative h-[65vh] w-full overflow-hidden">
        {allMedia[0] && (
          <>
            <img src={allMedia[0].backdrop_url || `https://image.tmdb.org/t/p/original${allMedia[0].backdrop_path}`} className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080a] to-transparent" />
            <div className="absolute bottom-20 right-6 md:right-10 max-w-2xl">
              <span className="bg-red-600 px-3 py-1 rounded text-[10px] font-black mb-4 inline-block">الأكثر شهرة اليوم</span>
              <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight">{allMedia[0].title}</h1>
              <Link href={`/media/${allMedia[0].id}`} className="bg-white text-black px-10 py-4 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all shadow-xl">شاهد التفاصيل</Link>
            </>
        )}
      </section>

      {/* Tabs / Filters */}
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 -mt-8 relative z-10 overflow-x-auto pb-4 scrollbar-none">
        <button onClick={() => setActiveTab('all')} className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition ${activeTab === 'all' ? 'bg-red-600 shadow-lg shadow-red-600/40' : 'bg-[#121218] border border-white/5'}`}>الكل</button>
        <button onClick={() => setActiveTab('movies')} className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition ${activeTab === 'movies' ? 'bg-red-600 shadow-lg shadow-red-600/40' : 'bg-[#121218] border border-white/5'}`}>الأفلام</button>
        <button onClick={() => setActiveTab('series')} className={`px-8 py-3 rounded-2xl font-bold whitespace-nowrap transition ${activeTab === 'series' ? 'bg-red-600 shadow-lg shadow-red-600/40' : 'bg-[#121218] border border-white/5'}`}>المسلسلات</button>
      </div>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">
                {activeTab === 'all' ? 'اكتشف أحدث الإضافات' : activeTab === 'movies' ? 'أقوى الأفلام السينمائية' : 'أحدث المسلسلات الحصرية'}
            </h2>
        </div>
        
        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-6 animate-pulse">
                {[1,2,3,4,5,6].map(i => <div key={i} className="aspect-[2/3] bg-white/5 rounded-2xl"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {getDisplayData().map((item: any) => (
                <Link key={item.id} href={`/media/${item.id}`} className="group relative">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-red-600 transition-all duration-300 shadow-lg group-hover:shadow-red-600/20">
                    <img src={item.poster_url || `https://image.tmdb.org/t/p/w500${item.poster_path}`} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-bold border border-white/10">⭐ {item.vote_average}</div>
                </div>
                <h3 className="mt-3 text-xs md:text-sm font-bold truncate group-hover:text-red-500 transition">{item.title}</h3>
                <div className="text-[10px] text-gray-500">{item.release_date ? new Date(item.release_date).getFullYear() : '2024'}</div>
                </Link>
            ))}
            </div>
        )}
      </section>
    </div>
  );
}
