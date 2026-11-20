import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Top10Slider from '@/components/Top10Slider';
import MovieSlider from '@/components/MovieSlider';
import AdBanner from '@/components/AdBanner';
import { Film, Tv, Sparkles, Compass, ChevronLeft, ShieldAlert } from 'lucide-react';

export default function Home() {
  const quickGenres = [
    { label: 'أكشن ومغامرات', icon: '🔥', href: '/explore?genre=أكشن' },
    { label: 'أحدث المسلسلات', icon: '📺', href: '/explore?type=series' },
    { label: 'أفلام رعب وإثارة', icon: '👻', href: '/explore?genre=رعب' },
    { label: 'أنمي مترجم', icon: '⚡', href: '/explore?type=anime' },
    { label: 'كوميديا وعائلي', icon: '🍿', href: '/explore?genre=كوميدي' },
    { label: 'أفلام خيال علمي', icon: '🚀', href: '/explore?genre=خيال علمي' }
  ];

  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      
      {/* هيرو رئيسي ديناميكي */}
      <Hero />

      {/* شريط الأقسام السريعة الحماسي */}
      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickGenres.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="bg-[#121216]/90 backdrop-blur-md border border-white/10 hover:border-red-600/50 p-3 rounded-xl flex items-center justify-between text-xs font-bold transition-all hover:-translate-y-1 shadow-lg group"
            >
              <div className="flex items-center gap-2">
                <span>{item.icon}</span>
                <span className="text-gray-200 group-hover:text-red-500 transition">{item.label}</span>
              </div>
              <ChevronLeft size={14} className="text-gray-500 group-hover:text-white group-hover:-translate-x-1 transition" />
            </Link>
          ))}
        </div>
      </div>

      <AdBanner type="top" />

      <div className="container mx-auto px-4 py-6 space-y-12">
        
        {/* صف الـ Top 10 المميز (زي نتفليكس) */}
        <Top10Slider />

        {/* أحدث الأفلام */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Film size={20} className="text-red-600" /> أحدث الأفلام السينمائية
            </h2>
            <Link href="/explore?type=movie" className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1">
              عرض المزيد <ChevronLeft size={14} />
            </Link>
          </div>
          <MovieSlider type="movie" />
        </section>

        <AdBanner type="inline" />

        {/* أحدث المسلسلات */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Tv size={20} className="text-red-600" /> أحدث المسلسلات التلفزيونية
            </h2>
            <Link href="/explore?type=series" className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1">
              عرض المزيد <ChevronLeft size={14} />
            </Link>
          </div>
          <MovieSlider type="series" />
        </section>

        {/* عالم الأنمي */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-black flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Sparkles size={20} className="text-red-600" /> عالم الأنمي المترجم
            </h2>
            <Link href="/explore?type=anime" className="text-xs text-red-500 hover:text-red-400 font-bold flex items-center gap-1">
              عرض المزيد <ChevronLeft size={14} />
            </Link>
          </div>
          <MovieSlider type="anime" />
        </section>

      </div>

      <AdBanner type="sticky" />
    </main>
  );
}
