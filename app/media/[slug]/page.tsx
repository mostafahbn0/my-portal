import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Download, Star, Calendar, Film, CheckCircle2, Tv } from 'lucide-react'
import ViewCounter from '@/components/ViewCounter'
import ShareButton from '@/components/ShareButton'
import FavoriteButton from '@/components/FavoriteButton'
import AdSlot from '@/components/AdSlot'
import JsonLd from '@/components/JsonLd'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const rawSlug = resolvedParams.slug
  const decodedSlug = decodeURIComponent(rawSlug)

  const supabase = supabaseServer()
  const { data: media } = await supabase
    .from('media')
    .select('title, title_ar, description, poster_url')
    .or(`slug.eq.${decodedSlug},slug.eq.${rawSlug}`)
    .single()

  if (!media) return { title: 'العمل غير موجود | سينما بلس' }

  const displayTitle = media.title_ar || media.title
  return {
    title: `مشاهدة وتحميل ${displayTitle} مترجم HD | سينما بلس`,
    description: media.description || `مشاهدة وتحميل ${displayTitle} بجودة عالية وبدون إعلانات مزعجة.`,
    openGraph: {
      title: `${displayTitle} | سينما بلس`,
      description: media.description || '',
      images: media.poster_url ? [media.poster_url] : []
    }
  }
}

export default async function MediaDetailsPage({ params }: Props) {
  const resolvedParams = await params
  const rawSlug = resolvedParams.slug
  const decodedSlug = decodeURIComponent(rawSlug)

  const supabase = supabaseServer()
  const { data: media } = await supabase
    .from('media')
    .select('*')
    .or(`slug.eq.${decodedSlug},slug.eq.${rawSlug}`)
    .single()

  if (!media) notFound()

  // Fetch seasons & episodes if series or anime
  let seasonsData = null
  if (media.type !== 'movie') {
    const { data: seasons } = await supabase
      .from('seasons')
      .select('*, episodes(*)')
      .eq('media_id', media.id)
      .order('season_number', { ascending: true })
    seasonsData = seasons
  }

  // Related Media
  const { data: related } = await supabase
    .from('media')
    .select('*')
    .eq('type', media.type)
    .neq('id', media.id)
    .limit(6)

  const displayTitle = media.title_ar || media.title

  return (
    <div className="min-h-screen pb-20">
      <JsonLd media={media} />
      <ViewCounter mediaId={media.id} />

      {/* Backdrop Header */}
      <div className="relative h-[400px] md:h-[500px] w-full">
        {media.banner_url || media.poster_url ? (
          <Image
            src={media.banner_url || media.poster_url}
            alt={displayTitle}
            fill
            className="object-cover opacity-20 filter blur-sm"
            priority
          />
        ) : (
          <div className="w-full h-full bg-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
      </div>

      <div className="container mx-auto px-4 max-w-7xl -mt-72 md:-mt-80 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Poster Column */}
          <div className="md:col-span-1 space-y-4">
            <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900 group">
              {media.poster_url ? (
                <Image src={media.poster_url} alt={displayTitle} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <Film className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Favorite & Share Buttons */}
            <div className="flex gap-2">
              <div className="flex-1">
                <FavoriteButton media={media} />
              </div>
              <ShareButton title={displayTitle} />
            </div>
          </div>

          {/* Details Column */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-xs">
                  {media.type === 'movie' ? 'فيلم' : media.type === 'series' ? 'مسلسل' : 'أنمي'}
                </span>
                <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-lg text-xs">
                  {media.quality || '1080p FHD'}
                </span>
                {media.status === 'completed' ? (
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold rounded-lg text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>مكتمل</span>
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-semibold rounded-lg text-xs">
                    مستمر
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
                {displayTitle}
              </h1>
              {media.title_ar && media.title && (
                <p className="text-slate-400 text-lg font-medium">{media.title}</p>
              )}
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-300 py-3 border-y border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{media.rating ? media.rating : '8.5'} / 10</span>
              </div>
              {media.release_year && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{media.release_year}</span>
                </div>
              )}
            </div>

            {/* Overview */}
            <div className="space-y-2">
              <h3 className="text-white font-bold text-lg">القصة والأحداث:</h3>
              <p className="text-slate-300 leading-relaxed text-sm md:text-base">
                {media.description || 'لم يتم إضافة قصة لهذا العمل بعد.'}
              </p>
            </div>

            {/* Action Buttons for Movie */}
            {media.type === 'movie' && (
              <div className="flex flex-wrap gap-4 pt-4">
                <Link
                  href={`/watch/${media.slug}`}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all text-base"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>مشاهدة الفيلم الآن</span>
                </Link>
                <Link
                  href={`/download/${media.slug}`}
                  className="flex-1 sm:flex-none px-8 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold flex items-center justify-center gap-2 transition-all text-base"
                >
                  <Download className="w-5 h-5" />
                  <span>تحميل مباشر</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Ad Space */}
        <div className="mt-10">
          <AdSlot position="header" />
        </div>

        {/* Seasons & Episodes Accordion (If TV or Anime) */}
        {media.type !== 'movie' && seasonsData && (
          <div className="mt-12 space-y-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <Tv className="w-6 h-6 text-rose-500" />
              <span>المواسم والحلقات</span>
            </h3>

            <div className="space-y-4">
              {seasonsData.map((season) => (
                <div key={season.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h4 className="text-lg font-bold text-white">الموسم {season.season_number}</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {season.episodes?.map((ep: any) => (
                      <Link
                        key={ep.id}
                        href={`/watch/${media.slug}?episode=${ep.id}`}
                        className="p-3 bg-slate-950 hover:bg-rose-600 border border-slate-800 hover:border-rose-500 rounded-xl text-center group transition-all"
                      >
                        <span className="block text-xs text-slate-400 group-hover:text-white/80">حلقة</span>
                        <span className="block text-lg font-black text-white">{ep.episode_number}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Content Slider */}
        {related && related.length > 0 && (
          <div className="mt-16 space-y-4">
            <h3 className="text-2xl font-bold text-white">أعمال قد تعجبك أيضاً</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/media/${item.slug}`}
                  className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-rose-500/50 transition-all"
                >
                  <div className="relative aspect-[2/3] w-full bg-slate-950">
                    {item.poster_url ? (
                      <Image src={item.poster_url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                    ) : null}
                  </div>
                  <div className="p-2.5">
                    <h4 className="font-bold text-xs text-white truncate">{item.title_ar || item.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
