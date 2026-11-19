import { supabaseServer } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Download } from 'lucide-react'
import WatchPlayer from './WatchPlayer'
import AdSlot from '@/components/AdSlot'
import MediaSlider from '@/components/MediaSlider'
import { Media, Link as MediaLink, Episode } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ slug: string }> | { slug: string }
  searchParams: Promise<{ episode?: string }> | { episode?: string }
}

export default async function WatchPage({ params, searchParams }: Props) {
  const resolvedParams = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const rawSlug = resolvedParams.slug || ''
  const decodedSlug = decodeURIComponent(rawSlug)
  const episodeNum = resolvedSearchParams.episode ? parseInt(resolvedSearchParams.episode) : 1

  const supabase = supabaseServer()

  let { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('slug', decodedSlug)
    .maybeSingle()

  if (!media) {
    const { data: fb } = await supabase.from('media').select('*').eq('slug', rawSlug).maybeSingle()
    media = fb
  }

  if (!media) notFound()
  const item = media as Media

  let links: MediaLink[] = []
  let allEpisodes: Episode[] = []
  let prevEp: number | null = null
  let nextEp: number | null = null

  if (item.type === 'movie') {
    const { data: lData } = await supabase
      .from('links')
      .select('*')
      .eq('media_id', item.id)
      .eq('link_type', 'stream')
    if (lData) links = lData
  } else {
    const { data: epList } = await supabase
      .from('episodes')
      .select('*')
      .eq('media_id', item.id)
      .order('episode_number', { ascending: true })

    if (epList && epList.length > 0) {
      allEpisodes = epList
      const currentIdx = epList.findIndex(e => e.episode_number === episodeNum)
      if (currentIdx > 0) prevEp = epList[currentIdx - 1].episode_number
      if (currentIdx >= 0 && currentIdx < epList.length - 1) nextEp = epList[currentIdx + 1].episode_number

      const currentEpisodeId = epList[currentIdx >= 0 ? currentIdx : 0]?.id
      if (currentEpisodeId) {
        const { data: lData } = await supabase
          .from('links')
          .select('*')
          .eq('episode_id', currentEpisodeId)
          .eq('link_type', 'stream')
        if (lData) links = lData
      }
    }
  }

  const { data: related } = await supabase
    .from('media')
    .select('*')
    .eq('type', item.type)
    .neq('id', item.id)
    .limit(6)

  return (
    <div className="container mx-auto px-4 py-6 space-y-8 text-right" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 text-xs font-bold border border-red-500/30">
            {item.type === 'movie' ? 'مشاهدة فيلم' : `مشاهدة مسلسل - حلقة ${episodeNum}`}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {item.title_ar || item.title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/download/${encodeURIComponent(item.slug)}${item.type !== 'movie' ? `?episode=${episodeNum}` : ''}`}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 rounded-xl transition"
          >
            <Download className="w-4 h-4" />
            تحميل
          </Link>
          <Link
            href={`/media/${encodeURIComponent(item.slug)}`}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition"
          >
            التفاصيل
          </Link>
        </div>
      </div>

      <AdSlot type="banner" />

      <WatchPlayer
        links={links}
        title={item.title_ar || item.title}
        mediaId={item.id}
        mediaSlug={item.slug}
        prevEpisode={prevEp}
        nextEpisode={nextEp}
        isSeries={item.type !== 'movie'}
        currentEpisode={episodeNum}
      />

      {related && related.length > 0 && (
        <MediaSlider title="🔥 قد يعجبك أيضاً" items={related as Media[]} />
      )}
    </div>
  )
}
