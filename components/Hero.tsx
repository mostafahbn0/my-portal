export default function Hero() {
  return (
    <div className="relative h-[60vh] flex items-center justify-center bg-gradient-to-r from-red-900/20 to-black">
      <div className="text-center z-10">
        <h1 className="text-5xl md:text-7xl font-black mb-4">عالم السينما بين يديك</h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">شاهد أحدث الأفلام والمسلسلات بجودة عالية وبدون إعلانات مزعجة</p>
      </div>
      <div className="absolute inset-0 bg-[url('https://image.tmdb.org/t/p/original/r236m7vSjU0VvSVeYmptDIvjv3f.jpg')] bg-cover bg-center opacity-30"></div>
    </div>
  );
}
