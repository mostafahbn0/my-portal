import { supabaseServer } from '@/lib/supabase/server';
import MediaCard from '@/components/MediaCard';
import AdSlot from '@/components/AdSlot';
import { Layers } from 'lucide-react';
import type { Media } from '@/lib/types';
import type { Metadata } from 'next';

export const revalidate = 300;
export const metadata: Metadata = { title: 'مواسم كاملة' };

export default async function SeasonsPage() {
  const { data } = await supabaseServer
    .from('media')
    .select('*')
    .in('type', ['series', 'anime'])
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(60);

  const items = (data as Media[]) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-green-600/20 rounded-xl">
          <Layers className="w-7 h-7 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">📦 مواسم كاملة</h1>
          <p className="text-slate-400 text-sm mt-1">مسلسلات وأنمي مكتملة جاهزة للتحميل</p>
        </div>
      </div>

      <AdSlot height={100} id="ad-seasons-top" />

      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((m) => (
            <MediaCard key={m.id} media={m} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-slate-400 text-xl">لا توجد مواسم مكتملة حالياً</p>
        </div>
      )}

      <AdSlot height={100} id="ad-seasons-bottom" />
    </div>
  );
}
