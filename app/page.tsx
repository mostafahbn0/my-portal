import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import MovieSlider from '@/components/MovieSlider';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080a]">
      <Navbar />
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 border-r-4 border-red-600 pr-3">أحدث الإضافات</h2>
        <MovieSlider type="movie" />
        <h2 className="text-2xl font-bold my-6 border-r-4 border-red-600 pr-3">المسلسلات</h2>
        <MovieSlider type="series" />
      </div>
    </main>
  );
}
