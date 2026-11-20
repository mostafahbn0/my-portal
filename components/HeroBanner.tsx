'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Star, Calendar } from 'lucide-react'

interface Props {
  items?: any[]
  media?: any[]
  featured?: any[]
}

export default function HeroBanner({ items, media, featured }: Props) {
  const list = items || media || featured || []
  if (!list || list.length === 0) return null

  const item = list[0]
  const displayTitle = item.title_ar || item.title

  return (
    <div className="relative h-[480px] md:h-[580px] w-full overflow-hidden bg-slate-950">
      {item.banner_url || item.poster_url ? (
        <Image
          src={item.banner_url || item.poster_url}
          alt={displayTitle}
          fill
          priority
          className="object-cover opacity-40 filter brightness-90"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />

      <div className="container mx-auto px-4 max-w-7xl h-full flex items-end pb-12 relative z-10">
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center gap-3 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-md bg-rose-600 text-white">
              {item.type === 'movie' ? 'فيلم مميز' : item.type === 'series' ? 'مسلسل مميز' : 'أنمي مميز'}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
              {item.quality || '1080p FHD'}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating || '8.5'}</span>
            </div>
            {item.release_year && (
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
                <span>{item.release_year}</span>
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
            {displayTitle}
          </h1>

          <p className="text-slate-300 text-sm md:text-base line-clamp-3 leading-relaxed">
            {item.description || 'شاهد وحمل الآن بجودة فائقة مترجم حصرياً على سينما بلس.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={item.type === 'movie' ? `/watch/${item.slug}` : `/media/${item.slug}`}
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all text-sm"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{item.type === 'movie' ? 'مشاهدة الآن' : 'عرض الحلقات'}</span>
            </Link>

            <Link
              href={`/media/${item.slug}`}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-white font-bold flex items-center gap-2 transition-all text-sm"
            >
              <Info className="w-4 h-4" />
              <span>تفاصيل أكثر</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
