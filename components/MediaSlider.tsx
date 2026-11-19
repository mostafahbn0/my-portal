import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import MediaCard from './MediaCard'
import { Media } from '@/lib/types'

interface Props {
  title: string
  items: Media[]
  seeMoreHref?: string
}

export default function MediaSlider({ title, items, seeMoreHref }: Props) {
  if (!items || items.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-white border-r-4 border-red-600 pr-3">
          {title}
        </h2>
        {seeMoreHref && (
          <Link 
            href={seeMoreHref} 
            className="flex items-center gap-1 text-slate-400 hover:text-red-500 transition-colors text-sm font-bold"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {items.map((item) => (
          <MediaCard key={item.id} media={item} />
        ))}
      </div>
    </section>
  )
}
