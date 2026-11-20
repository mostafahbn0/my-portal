'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, ChevronLeft, Film } from 'lucide-react'

interface Props {
  title: string
  subtitle?: string
  items: any[]
  icon?: React.ReactNode
  viewAllHref?: string
  type?: string
}

export default function MediaSlider({ title, subtitle, items, icon, viewAllHref }: Props) {
  if (!items || items.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {icon}
            <h2 className="text-xl md:text-2xl font-black text-white">{title}</h2>
          </div>
          {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-400 transition-colors"
          >
            <span>عرض الكل</span>
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/media/${item.slug}`}
            className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-rose-500/50 hover:shadow-xl hover:shadow-rose-600/10 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-[2/3] w-full bg-slate-950 overflow-hidden">
              {item.poster_url ? (
                <Image
                  src={item.poster_url}
                  alt={item.title_ar || item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Film className="w-8 h-8" />
                </div>
              )}
              <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg text-[10px] font-bold text-amber-400 flex items-center gap-1 border border-slate-800">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{item.rating || '8.0'}</span>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <h3 className="font-bold text-xs text-white truncate group-hover:text-rose-400 transition-colors">
                {item.title_ar || item.title}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{item.release_year || '—'}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">
                  {item.quality || 'FHD'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
