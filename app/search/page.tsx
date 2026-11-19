'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Search, Loader2, Frown } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import type { Media } from '@/lib/types';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setResults(d.results || []))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-xl">
          <Search className="w-7 h-7 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">نتائج البحث</h1>
          <p className="text-slate-400 text-sm mt-1">
            {q ? `نتائج البحث عن "${q}"` : 'اكتب كلمة للبحث'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((m) => (
            <MediaCard key={m.id} media={m} />
          ))}
        </div>
      ) : q ? (
        <div className="text-center py-20 animate-fade-in">
          <Frown className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-xl font-semibold">لا توجد نتائج لـ "{q}"</p>
          <p className="text-slate-500 text-sm mt-2">جرّب كلمات بحث مختلفة</p>
        </div>
      ) : null}
    </div>
  );
}
