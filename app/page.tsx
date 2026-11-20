import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Top10Slider from '@/components/Top10Slider';
import MovieSlider from '@/components/MovieSlider';
import CategoryPills from '@/components/CategoryPills';
import FeatureBadges from '@/components/FeatureBadges';
import Footer from '@/components/Footer';
import AdBanner from '@/components/AdBanner';

export const revalidate = 60; // تحديث تلقائي دوري

export default async function HomePage() {
  let mediaList: any[] = [];

  try {
    const { data, error } = await supabase
      .from('media')
      .select('*')
      .order('id', { ascending: false })
      .limit(80);

    if (!error && data && Array.isArray(data)) {
      mediaList = data.filter((item) => item && item.id);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }

  // 1. أعمال الهيرو الدوار (أول 5 أعمال مميزة)
  const heroItems = mediaList.slice(0, 5);

  // 2. قائمة توب 10 الأكثر شهرة
  const top10 = mediaList.slice(0, 10);

  // 3. تصنيف ذكي للأفلام الأجنبية
  const hollywoodMovies = mediaList.filter(
    (m) => (m.media_type === 'movie' || !m.media_type) && !/[\u0600-\u06FF]/.test(m.title?.slice(0, 5) || '')
  );

  // 4. تصنيف الأفلام والإنتاجات العربية
  const arabicCinema = mediaList.filter(
    (m) => (m.media_type === 'movie' || !m.media_type) && /[\u0600-\u06FF]/.test(m.title || '')
  );

  // 5. تصنيف المسلسلات والأنمي
  const tvSeries = mediaList.filter(
    (m) => m.media_type === 'series' || m.media_type === 'tv'
  );

  return (
    <div className="min-h-screen bg-[#08080a] text-white selection:bg-red-600/30">
      <Navbar />

      <main>
        {/* البانر البطولي الدوار */}
        <Hero items={heroItems} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* شريط الفئات السريعة */}
          <CategoryPills />

          {/* بانر إعلاني علوي أنيق */}
          <AdBanner slot="top" className="my-6" />

          {/* توب 10 نيتفلكس اليوم */}
          {top10.length > 0 && <Top10Slider items={top10} />}

          {/* أحدث الإضافات الحصرية */}
          {mediaList.length > 0 && (
            <MovieSlider 
              title="🔥 أحدث الأعمال المضافة مؤخراً" 
              items={mediaList.slice(0, 12)} 
            />
          )}

          {/* سينما هوليوود المتصدرة */}
          {hollywoodMovies.length > 0 && (
            <MovieSlider 
              title="🎬 أقوى أفلام هوليوود المترجمة (Blockbusters)" 
              items={hollywoodMovies.slice(0, 12)} 
            />
          )}

          {/* السينما العربية والمصرية */}
          {arabicCinema.length > 0 && (
            <MovieSlider 
              title="🇪🇬 أحدث الأفلام العربية والمصرية" 
              items={arabicCinema.slice(0, 12)} 
            />
          )}

          {/* إعلان منتصف المحتوى */}
          <AdBanner slot="bottom" className="my-8" />

          {/* أحدث المسلسلات والأنمي */}
          {tvSeries.length > 0 && (
            <MovieSlider 
              title="📺 أحدث المسلسلات وحلقات الأنمي" 
              items={tvSeries.slice(0, 12)} 
            />
          )}

          {/* مميزات منصة سينما بلاس */}
          <FeatureBadges />

        </div>
      </main>

      {/* الفوتر السينمائي */}
      <Footer />
    </div>
  );
}
