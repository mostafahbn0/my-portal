import { supabaseServer } from '@/lib/supabase/server'
import MediaCard from '@/components/MediaCard'
import AdSlot from '@/components/AdSlot'
import { Media } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function SeriesPage() {
  const supabase = supabaseServer() // نداء الدالة هنا
  const { data: series } = await supabase
    .from('media')
    .select('*')
    .eq('type', 'series')
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="border-r-4 border-blue-500 pr-4">
        <h1 className="text-3xl font-extrabold text-white">📺 مكتبة المسلسلات</h1>
        <p className="text-slate-400 text-sm mt-1">تابع أقوى المسلسلات العربية والأجنبية</p>
      </div>
      <AdSlot type="banner" />
      {series && series.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {(series as Media[]).map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          لا توجد مسلسلات مضافة حالياً.
        </div>
      )}
    </div>
  )
}
