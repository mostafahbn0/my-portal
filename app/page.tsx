import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieSlider from '@/components/MovieSlider';

export const revalidate = 60;

export default async function HomePage() {
  const { data } = await supabase.from('media').select('*').order('id', { ascending: false }).limit(40);
  const mediaList = data || [];

  return (
    <div className="min-h-screen bg-[#08080a] text-white">
      <Navbar />
      <main>
        <Hero item={mediaList[0]} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <MovieSlider title="أحدث الأفلام والمسلسلات الحصرية 🎬" items={mediaList} />
        </div>
      </main>
    </div>
  );
}
