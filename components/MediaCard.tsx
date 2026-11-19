import Image from 'next/image'
import Link from 'next/link'
import { Star, Play } from 'lucide-react'
import { Media } from '@/lib/types'
import FavoriteButton from './FavoriteButton'

interface Props {
  media: Media
  rank?: number
}

export default function MediaCard({ media, rank }: Props) {
  const isArabic = media.genres?.includes('عربي') || media.title_ar === media.title
  const typeText = media.type === 'movie' ? 'فيلم' : media.type === 'series' ? 'مسلسل' : 'أنمي'

  return (
    <div className="group relative flex flex-col bg-slate-900/60 rounded-2xl overflow-hidden border border-slate-800/80 hover:border-red-500/50 hover:shadow-xl hover:shadow-red-600/10 transition-all duration-300">
      
      {/* البوستر */}
      <Link href={`/media/${encodeURIComponent(media.slug)}`} className="relative aspect-[2/3] w-full overflow-hidden block">
        <Image
          src={media.poster_url || '/placeholder.jpg'}
          alt={media.title_ar || media.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
          className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/60 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* بادجات أعلى اليمين */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-end z-10">
          <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] tracking-wider uppercase rounded-md shadow">
            {media.quality || '1080p FHD'}
          </span>
          <span className="px-1.5 py-0.5 bg-slate-900/90 backdrop-blur-md text-amber-400 font-bold text-[10px] rounded-md border border-amber-500/20">
            {isArabic ? 'عربي' : 'مترجم'}
          </span>
        </div>

        {/* زر المفضلة أعلى اليسار */}
        <div className="absolute top-2.5 left-2.5 z-20">
          <FavoriteButton media={media} />
        </div>

        {/* زر تشغيل سريع */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-current translate-x-[-1px]" />
          </div>
        </div>

        {/* الترتيب لقسم التوب 10 */}
        {rank && (
          <div className="absolute bottom-1 right-2 text-6xl font-black text-white/20 italic select-none pointer-events-none group-hover:text-red-500/30 transition-colors">
            #{rank}
          </div>
        )}

        {/* السنة والتقييم أسفل البوستر */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-slate-300 z-10">
          <span className="font-semibold bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm">
            {media.release_year || '2024'}
          </span>
          {media.rating > 0 && (
            <span className="flex items-center gap-1 font-black text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-amber-500/20">
              <Star className="w-3 h-3 fill-current" />
              {media.rating.toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      {/* العنوان تحت الكرت */}
      <div className="p-3 text-right">
        <Link href={`/media/${encodeURIComponent(media.slug)}`} className="block">
          <h3 className="text-white text-sm font-bold truncate group-hover:text-red-400 transition-colors">
            {media.title_ar || media.title}
          </h3>
          <p className="text-slate-400 text-[11px] truncate mt-0.5">
            {typeText} • {media.genres?.[0] || 'منوع'}
          </p>
        </Link>
      </div>

    </div>
  )
}
