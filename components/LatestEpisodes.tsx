import Link from 'next/link'
import Image from 'next/image'
import { Play, Sparkles } from 'lucide-react'

interface EpisodeItem {
  id: string
  episode_number: number
  title?: string
  created_at: string
  media: {
    title_ar: string
    title: string
    slug: string
    poster_url: string
    type: string
  }
}

interface Props {
  episodes: EpisodeItem[]
}

export default function LatestEpisodes({ episodes }: Props) {
  if (!episodes || episodes.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 border-r-4 border-red-600 pr-3">
        <Sparkles className="w-5 h-5 text-red-500 animate-pulse" />
        <h2 className="text-xl sm:text-2xl font-black text-white">
          أحدث الحلقات المضافة اليوم
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {episodes.map((ep) => (
          <Link
            key={ep.id}
            href={`/watch/${encodeURIComponent(ep.media.slug)}?episode=${ep.episode_number}`}
            className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all shadow-md block"
          >
            <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden">
              <Image
                src={ep.media.poster_url || '/placeholder.jpg'}
                alt={ep.media.title_ar}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300 filter brightness-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              
              {/* بادج رقم الحلقة العملاق */}
              <div className="absolute top-2 right-2 px-2.5 py-1 bg-red-600 text-white font-black text-xs rounded-lg shadow-lg">
                الحلقة {ep.episode_number}
              </div>

              {/* أيقونة تشغيل عند الوقوف */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 fill-current translate-x-[-1px]" />
                </div>
              </div>
            </div>

            <div className="p-2.5 text-right">
              <h4 className="text-white text-xs font-bold truncate group-hover:text-red-400 transition-colors">
                {ep.media.title_ar || ep.media.title}
              </h4>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                {ep.media.type === 'anime' ? 'أنمي مترجم' : 'مسلسل'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
