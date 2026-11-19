import { Media } from '@/lib/types'
import MediaCard from './MediaCard'
import { Trophy } from 'lucide-react'

interface Props {
  items: Media[]
}

export default function TopRanking({ items }: Props) {
  if (!items || items.length === 0) return null

  return (
    <section className="container mx-auto px-4 space-y-4">
      <div className="flex items-center gap-3 border-r-4 border-amber-500 pr-3">
        <Trophy className="w-6 h-6 text-amber-500" />
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">أفضل 10 أعمال هذا الأسبوع</h2>
          <p className="text-slate-400 text-xs">الأكثر طلباً ومشاهدة بين الجمهور</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.slice(0, 5).map((item, index) => (
          <MediaCard key={item.id} media={item} rank={index + 1} />
        ))}
      </div>
    </section>
  )
}
