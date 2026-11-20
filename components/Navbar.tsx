'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Film, Tv, Flame, Shuffle, MessageSquarePlus, X, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { getMediaPoster, getMediaYear, getMediaRating } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // رابط الربح المباشر من موني تاج
  const monetagDirectLink = "https://uplcm.com/4/12311730";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const q = searchQuery.trim();
      if (q.length >= 1) {
        setLoading(true);
        const { data } = await supabase.from('media').select('*').ilike('title', `%${q}%`).limit(8);
        setResults(data || []);
        setIsOpen(true);
        setLoading(false);
      } else {
        setResults([]); setIsOpen(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-50 bg-[#08080a]/95 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-black bg-gradient-to-r from-red-600 to-amber-500 bg-clip-text text-transparent">
          سينما بلاس
        </Link>

        <div ref={searchRef} className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && router.push(`/explore?q=${searchQuery}`)}
            placeholder="ابحث عن الأفلام والمسلسلات..."
            className="w-full bg-[#121318] text-white text-sm rounded-full px-10 py-2 border border-white/10 focus:border-red-600 focus:outline-none"
          />
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#121318] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
              {results.length > 0 ? results.map((item) => (
                <Link key={item.id} href={`/watch/${item.id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-3 p-2 hover:bg-white/5 transition-colors group">
                  <img src={getMediaPoster(item)} className="w-8 h-12 object-cover rounded" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-red-500" dir="ltr" style={{textAlign:'right'}}>{item.title}</p>
                  </div>
                </Link>
              )) : <div className="p-4 text-center text-xs text-gray-400">لا توجد نتائج</div>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* زر فشار الحظ المربح (يفتح إعلان في نافذة جديدة) */}
          <a 
            href={monetagDirectLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-white/5 hover:bg-red-600/20 text-gray-300 px-3 py-1.5 rounded-full text-xs font-semibold border border-white/5"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فشار الحظ</span>
          </a>

          <button onClick={() => router.push('/explore')} className="bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold">استكشف</button>
        </div>
      </div>
    </header>
  );
}
