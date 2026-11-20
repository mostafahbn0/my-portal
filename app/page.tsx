import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Top10Slider from '@/components/Top10Slider';
import MovieSlider from '@/components/MovieSlider';
import AdBanner from '@/components/AdBanner';

export const revalidate = 60; // تحديث تلقائي كل 60 ثانية

export default async function HomePage() {
  let mediaList: any[] = [];

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('id', { ascending: false })
      .limit(60);

    if (!error && data && Array.isArray(data)) {
      mediaList = data.filter((item) => item && item.id);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }

  // توزيع الميديا بشكل آمن
  const heroItem = mediaList.length > 0 ? mediaList[0] : null;
  const top10 = mediaList.slice(0, 10);
  
  // تصنيف الأفلام والمسلسلات
  const movies = mediaList.filter((m) => m.media_type === 'movie' || !m.media_type);
  const series = mediaList.filter((m) => m.media_type === 'series' || m.media_type === 'tv');

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />

      <main>
        {/* البانر البطولي */}
        <Hero item={heroItem} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* بانر إعلاني علوي */}
          <div className="my-6">
            <AdBanner slot="home-top" />
          </div>

          {/* توب 10 */}
          {top10.length > 0 && <Top10Slider items={top10} />}

          {/* أحدث الإضافات */}
          {mediaList.length > 0 && (
            <MovieSlider title="أحدث الأعمال المضافة 🍿" items={mediaList.slice(0, 12)} />
          )}

          {/* الأفلام المتصدرة */}
          {movies.length > 0 && (
            <MovieSlider title="أقوى الأفلام العالمية المترجمة 🎬" items={movies.slice(0, 12)} />
          )}

          {/* المسلسلات */}
          {series.length > 0 && (
            <MovieSlider title="أحدث المسلسلات والأنمي 📺" items={series.slice(0, 12)} />
          )}

          {/* بانر إعلاني سفلي */}
          <div className="my-10">
            <AdBanner slot="home-bottom" />
          </div>
        </div>
      </main>
    </div>
  );
}
