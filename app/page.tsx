import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import MovieSlider from '../components/MovieSlider';
import { StickyBanner, ContentBanner } from '../components/AdBanner';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080a] pb-24">
      <Navbar />
      <Hero />

      <div className="relative z-30 -mt-16 space-y-2">
        <MovieSlider title="أحدث الأفلام المضافة" type="movie" />
        
        {/* بنر إعلاني وسطي بين السلايدرات */}
        <ContentBanner text="مساحة إعلانية بين الأقسام (Leaderboard 728x90 / Banner)" />

        <MovieSlider title="أحدث المسلسلات الحصرية" type="series" />
        <MovieSlider title="عالم الأنمي والكرتون" type="anime" />
      </div>

      {/* الإعلان العائم بأسفل الصفحة مع زرار الإغلاق */}
      <StickyBanner />
    </main>
  );
}
