import { supabaseServer } from '@/lib/supabase/server'
import HeroBanner from '@/components/HeroBanner'
import MediaSlider from '@/components/MediaSlider'
import TopRanking from '@/components/TopRanking'
import LatestEpisodes from '@/components/LatestEpisodes'
import AdSlot from '@/components/AdSlot'
import Link from 'next/link'
import { Flame, Film, Tv, Sparkles, Star, LayoutGrid, Clapperboard } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GENRES = [
  { name: 'أكشن', icon: '💥', href: '/explore?genre=أكشن' },
  { name: 'دراما', icon: '🎭', href: '/explore?genre=دراما' },
  { name: 'كوميديا', icon: '😂', href: '/explore?genre=كوميديا' },
  { name: 'رعب', icon: '👻', href: '/explore?genre=رعب' },
  { name: 'خيال علمي', icon: '🚀', href: '/explore?genre=خيال علمي' },
  { name: 'غموض وإثارة', icon: '🕵️', href: '/explore?genre=غموض' },
  { name: 'مغامرة', icon: '🗺️', href: '/explore?genre=مغامرة' },
  { name: 'أنيميشن', icon: '🎨', href: '/explore?genre=رسوم متحركة' },
]

export default async function HomePage() {
  const supabase = supabaseServer()

  // Fetch all varied sections in parallel for super fast loading
  const [
    { data: featuredMedia },
    { data: trendingMedia },
    { data: latestMovies },
    { data: latestSeries },
    { data: latestAnime },
    { data: topRatedMedia },
    { data: latestEpisodes }
  ] = await Promise.all([
    supabase.from('media').select('*').eq('is_featured', true).limit(5),
    supabase.from('media').select('*').order('views', { ascending: false }).limit(12),
    supabase.from('media').select('*').eq('type', 'movie').order('created_at', { ascending: false }).limit(12),
    supabase.from('media').select('*').eq('type', 'series').order('created_at', { ascending: false }).limit(12),
    supabase.from('media').select('*').eq('type', 'anime').order('created_at', { ascending: false }).limit(12),
    supabase.from('media').select('*').order('rating', { ascending: false }).limit(12),
    supabase.from('episodes').select('*, media:media_id(*)').order('created_at', { ascending: false }).limit(8)
  ])

  return (
    <div className="space-y-12 pb-20">
      {/* 1. Main Hero Banner Carousel */}
      {featuredMedia && featuredMedia.length > 0 ? (
        <HeroBanner items={featuredMedia} />
      ) : trendingMedia && trendingMedia.length > 0 ? (
        <HeroBanner items={trendingMedia.slice(0, 5)} />
      ) : null}

      <div className="container mx-auto px-4 max-w-7xl space-y-12">
        {/* Ad Spot: Under Hero Banner */}
        <AdSlot position="header" />

        {/* 2. Quick Genre Picker Bar */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-rose-500" />
            <span>تصفح حسب التصنيف المفضل</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {GENRES.map((g) => (
              <Link
                key={g.name}
                href={g.href}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-800 text-slate-200 text-sm font-bold transition-all shadow-sm"
              >
                <span>{g.icon}</span>
                <span>{g.name}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. Trending Now Slider */}
        {trendingMedia && trendingMedia.length > 0 && (
          <MediaSlider
            title="الأكثر مشاهدة وتريند الآن"
            subtitle="أعلى الأعمال طلباً ومشاهدة هذا الأسبوع"
            items={trendingMedia}
            icon={<Flame className="w-6 h-6 text-rose-500" />}
            viewAllHref="/explore?sort=views"
          />
        )}

        {/* 4. Latest Episodes Section */}
        {latestEpisodes && latestEpisodes.length > 0 && (
          <LatestEpisodes episodes={latestEpisodes} />
        )}

        {/* Ad Spot: In-Feed Banner */}
        <AdSlot position="banner" />

        {/* 5. Latest Movies Slider */}
        {latestMovies && latestMovies.length > 0 && (
          <MediaSlider
            title="أحدث الأفلام المترجمة"
            subtitle="أفلام هوليوود والسينما العالمية بجودة FHD"
            items={latestMovies}
            icon={<Film className="w-6 h-6 text-rose-500" />}
            viewAllHref="/explore?type=movie"
          />
        )}

        {/* 6. Top 10 Ranking */}
        {trendingMedia && trendingMedia.length >= 5 && (
          <TopRanking items={trendingMedia.slice(0, 10)} />
        )}

        {/* 7. Latest Series Slider */}
        {latestSeries && latestSeries.length > 0 && (
          <MediaSlider
            title="أحدث المسلسلات الحصرية"
            subtitle="مواسم كاملة وحلقات متجددة يومياً"
            items={latestSeries}
            icon={<Tv className="w-6 h-6 text-rose-500" />}
            viewAllHref="/explore?type=series"
          />
        )}

        {/* 8. Top Rated IMDB Slider */}
        {topRatedMedia && topRatedMedia.length > 0 && (
          <MediaSlider
            title="أعلى الأعمال تقييماً (Top IMDB)"
            subtitle="أفضل الأفلام والمسلسلات في تاريخ السينما"
            items={topRatedMedia}
            icon={<Star className="w-6 h-6 text-amber-400 fill-amber-400" />}
            viewAllHref="/explore?sort=rating"
          />
        )}

        {/* 9. Latest Anime Zone Slider */}
        {latestAnime && latestAnime.length > 0 && (
          <MediaSlider
            title="عالم الأنمي المترجم"
            subtitle="أحدث حلقات الأنمي الياباني والكرتون"
            items={latestAnime}
            icon={<Sparkles className="w-6 h-6 text-rose-500" />}
            viewAllHref="/explore?type=anime"
          />
        )}

        {/* Ad Spot: Footer Banner */}
        <AdSlot position="footer" />
      </div>
    </div>
  )
}
