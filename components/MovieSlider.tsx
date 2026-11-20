import MovieCard from './MovieCard';

export default function MovieSlider({ title, items = [] }: { title: string; items: any[] }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
          <span className="w-1.5 h-5 bg-red-600 rounded-full" />
          <span>{title}</span>
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {items.map((item, idx) => (
          <MovieCard key={item?.id || idx} item={item} />
        ))}
      </div>
    </section>
  );
}
