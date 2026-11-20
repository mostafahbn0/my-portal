import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Film } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SeriesPage() {
  const supabase = supabaseServer()
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('type', 'series')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 max-w-7xl py-10 space-y-6">
      <h1 className="text-2xl md:text-3xl font-black text-white">أحدث المسلسلات</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {media?.map((item) => (
          <Link
            key={item.id}
            href={`/media/${item.slug}`}
            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/50 transition-all"
          >
            <div className="relative aspect-[2/3] w-full bg-slate-950">
              {item.poster_url ? (
                <Image src={item.poster_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Film className="w-8 h-8" />
                </div>
              )}
            </div>
            <div className="p-3">
              <h3 className="font-bold text-xs text-white truncate">{item.title_ar || item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
