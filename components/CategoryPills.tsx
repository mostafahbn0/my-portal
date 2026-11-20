'use client';

import Link from 'next/link';
import { Flame, Film, Tv, Sparkles, Clock, Globe, Swords } from 'lucide-react';

export default function CategoryPills() {
  const categories = [
    { name: 'الكل', href: '/explore', icon: Sparkles, color: 'text-red-500' },
    { name: 'أفلام هوليوود', href: '/explore?cat=movies', icon: Film, color: 'text-blue-400' },
    { name: 'سينما عربية', href: '/explore?q=عربي', icon: Globe, color: 'text-amber-400' },
    { name: 'أحدث المسلسلات', href: '/explore?cat=series', icon: Tv, color: 'text-emerald-400' },
    { name: 'عالم الأنمي', href: '/explore?q=anime', icon: Swords, color: 'text-purple-400' },
    { name: 'الأكثر تداولاً', href: '/explore', icon: Flame, color: 'text-orange-500' },
  ];

  return (
    <div className="py-6 border-b border-white/5">
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {categories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <Link
              key={i}
              href={cat.href}
              className="flex items-center gap-2 bg-[#121318] hover:bg-white/10 text-gray-200 hover:text-white px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold border border-white/5 hover:border-red-600/40 transition-all flex-shrink-0 group hover:-translate-y-0.5"
            >
              <Icon className={`w-4 h-4 ${cat.color} group-hover:scale-110 transition-transform`} />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
