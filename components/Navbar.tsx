'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Film, Tv, Menu, X, Sparkles, Popcorn, Flame } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
      setIsOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#08080a]/95 backdrop-blur-md border-b border-white/5" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-red-600/40 group-hover:scale-105 transition">
                ▶
              </div>
              <span className="text-xl font-black text-white tracking-wide">
                سينما <span className="text-red-500">بلاس</span>
              </span>
            </Link>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="ابحث عن فيلم، مسلسل، أو أنمي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#121218] border border-white/10 rounded-2xl py-2 pr-10 pl-4 text-xs font-medium text-white placeholder-gray-400 focus:outline-none focus:border-red-600 transition"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-3.5 top-2.5" />
            </form>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-gray-300 hover:text-white transition">الرئيسية</Link>
            <a href="https://uplcm.com/4/12311730" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-yellow-400 transition">
              <Popcorn className="w-3.5 h-3.5 text-yellow-500" />
              <span>فشار الحظ</span>
            </a>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="p-2 text-gray-300 hover:text-white bg-white/5 rounded-xl border border-white/5"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-300 hover:text-white bg-white/5 rounded-xl border border-white/5"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Search Dropdown */}
        {showMobileSearch && (
          <div className="md:hidden py-3 border-t border-white/5 animate-fade-in">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="اكتب اسم الفيلم أو المسلسل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-[#121218] border border-red-600 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white focus:outline-none"
              />
              <Search className="w-4 h-4 text-red-500 absolute right-3.5 top-3" />
            </form>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-white/5 space-y-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-xs font-bold text-gray-200 hover:bg-white/5 rounded-xl"
            >
              🏠 الرئيسية
            </Link>
            <a
              href="https://uplcm.com/4/12311730"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-4 py-2 text-xs font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-xl"
            >
              <span>🍿 فشار الحظ (فيلم عشوائي)</span>
              <span className="text-[10px] bg-yellow-500/20 px-2 py-0.5 rounded">VIP</span>
            </a>
          </div>
        )}

      </div>
    </nav>
  );
}
