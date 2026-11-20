import Link from 'next/link';
import { Search, PlayCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-[#08080a]/80 backdrop-blur-md sticky top-0 z-50 border-b border-white/5 py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-red-600 flex items-center gap-2">
            <PlayCircle fill="currentColor" /> سينما بلاس
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-medium">
            <Link href="/" className="hover:text-red-500 transition">الرئيسية</Link>
            <Link href="/explore?type=movie" className="hover:text-red-500 transition">الأفلام</Link>
            <Link href="/explore?type=series" className="hover:text-red-500 transition">المسلسلات</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
            <input placeholder="ابحث عن فيلمك..." className="bg-white/5 border border-white/10 rounded-full py-2 pr-10 pl-4 text-sm focus:outline-none focus:border-red-600 w-64" />
          </div>
        </div>
      </div>
    </nav>
  );
}
