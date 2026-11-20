import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieSlider from '@/components/MovieSlider';
import AdBanner from '@/components/AdBanner';
import { Film, Tv, Flame, Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080a] text-white" dir="rtl">
      <Navbar />
      <Hero />
      <AdBanner type="top" />

      <div className="container mx-auto px-4 py-6 space-y-10">
        {/* أحدث الأفلام */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Flame size={20} className="text-red-600" /> أحدث الأفلام المضافة
            </h2>
          </div>
          <MovieSlider type="movie" />
        </section>

        {/* بانر إعلاني فاصل */}
        <AdBanner type="inline" />

        {/* أحدث المسلسلات */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Tv size={20} className="text-red-600" /> أحدث المسلسلات
            </h2>
          </div>
          <MovieSlider type="series" />
        </section>

        {/* الأنمي */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 border-r-4 border-red-600 pr-3">
              <Sparkles size={20} className="text-red-600" /> عالم الأنمي
            </h2>
          </div>
          <MovieSlider type="anime" />
        </section>
      </div>

      <AdBanner type="sticky" />
    </main>
  );
}
