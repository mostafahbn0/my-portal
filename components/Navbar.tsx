"use client";
import Link from 'next/link';
import { Search, PlayCircle, Tv, Film, Ghost, HelpCircle, Shuffle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-[#08080a]/90 backdrop-blur-xl sticky top-0 z-50 border-b border-white/5 py-3">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-2xl font-black text-red-600 flex items-center gap-2 tracking-tighter">
            <PlayCircle size={32} fill="currentColor" /> سينما بلاس
          </Link>
          <div className="hidden lg:flex gap-5 text-sm font-bold text-gray-300">
            <Link href="/" className="hover:text-white transition flex items-center gap-1"><Film size={16}/> الرئيسية</Link>
            <Link href="/explore?type=movie" className="hover:text-white transition flex items-center gap-1"><Film size={16}/> الأفلام</Link>
            <Link href="/explore?type=series" className="hover:text-white transition flex items-center gap-1"><Tv size={16}/> المسلسلات</Link>
            <Link href="/explore?type=anime" className="hover:text-white transition flex items-center gap-1"><Ghost size={16}/> الأنمي</Link>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-2.5 text-gray-500" size={18} />
            <input placeholder="ابحث عن فيلم أو مسلسل..." className="bg-white/5 border border-white/10 rounded-xl py-2 pr-10 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 w-72 transition-all" />
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold hidden sm:flex items-center gap-2">
            <HelpCircle size={18} /> اطلب عملك
          </button>
        </div>
      </div>
    </nav>
  );
}
