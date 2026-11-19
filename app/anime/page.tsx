import { supabaseServer } from '@/lib/supabase/server'
import MediaCard from '@/components/MediaCard'
import AdSlot from '@/components/AdSlot'
import { Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AnimePage() {
  const supabase = supabaseServer() // نداء الدالة هنا
  const { data: anime } = await supabase
    .from('media')
    .select('*')
    .eq('type', 'anime')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="border-r-4 border-yellow-500 pr-4">
        <h1 className="text-3xl font-extrabold text-white">⚔️ مكتبة الأنمي</h1>
        <p className="text-slate-400 text-sm mt-1">أحدث حلقات ومواسم الأنمي المترجم</p>
      </div>
      <AdSlot type="banner" />
      {anime && anime.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(anime as Media[]).map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          لا توجد أفلام أو مسلسلات أنمي حالياً.
        </div>
      )}
    </div>
  )
}
