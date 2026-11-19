import Image from 'next/image'
import Link from 'next/link'
import { Play, Info, Star, Calendar, Flame } from 'lucide-react'
import { Media } from '@/lib/types'

interface Props {
  media: Media
}

export default function HeroBanner({ media }: Props) {
  if (!media) return null

  return (
    <div className="relative w-full h-[500px] sm:h-[620px] overflow-hidden -mt-6">
      
      {/* صورة الخلفية الكبيرة */}
      <div className="absolute inset-0">
        <Image
          src={media.banner_url || media.poster_url}
          alt={media.title_ar || media.title}
          fill
          priority
          className="object-cover object-center filter brightness-90"
        />
        {/* التدرجات اللونية لحجب الحواف وجعل النصوص واضحة كلياً */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* المحتوى النصي والأزرار */}
      <div className="container mx-auto px-4 h-full flex items-end pb-16 sm:pb-20 relative z-10">
        <div className="max-w-2xl space-y-4 text-right">
          
          {/* بادج مميز ومشتعل */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-black tracking-wide shadow-lg shadow-red-600/40">
              <Flame className="w-3.5 h-3.5 fill-current animate-pulse" /> عمل مميز اليوم
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-slate-300 text-xs font-bold border border-slate-700/60">
              {media.quality || '1080p BluRay'}
            </span>
          </div>

          {/* العنوان الرئيسي العربي */}
          <h1 className="text-3xl sm:text-6xl font-black text-white leading-tight drop-shadow-md">
            {media.title_ar || media.title}
          </h1>

          {/* العنوان الإنجليزي والبيانات السريعة */}
          <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm font-semibold">
            {media.rating > 0 && (
              <div className="flex items-center gap-1 text-amber-400 bg-black/50 px-2 py-0.5 rounded-md border border-amber-500/20">
                <Star className="w-4 h-4 fill-current" />
                <span>{media.rating.toFixed(1)} IMDB</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{media.release_year || '2024'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-red-400 font-bold">
                {media.type === 'movie' ? 'فيلم كامل' : media.type === 'series' ? 'مسلسل تلفزيوني' : 'أنمي ياباني'}
              </span>
            </div>
          </div>

          {/* القصة المختصرة */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-xl text-shadow">
            {media.description || 'تابع أحدث المغامرات والإثارة حصرياً بأعلى جودة ترجمة ودقة صوت.'}
          </p>

          {/* الأزرار الرئيسية */}
          <div className="flex items-center gap-3 pt-3">
            <Link
              href={media.type === 'movie' ? `/watch/${media.slug}` : `/media/${media.slug}`}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-sm sm:text-base rounded-xl flex items-center gap-2.5 shadow-xl shadow-red-600/30 transition-all hover:scale-105"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>مشاهدة الآن</span>
            </Link>

            <Link
              href={`/media/${media.slug}`}
              className="px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-sm sm:text-base rounded-xl flex items-center gap-2 backdrop-blur-md border border-slate-700/80 transition"
            >
              <Info className="w-5 h-5 text-slate-400" />
              <span>تفاصيل أكثر</span>
            </Link>
          </div>

        </div>
      </div>

    </div>
  )
}
