'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Calendar, Film, ListFilter, Star, Globe } from 'lucide-react'

const genres = ['أكشن', 'رومانسية', 'دراما', 'كوميدي', 'رعب', 'خيال علمي', 'مغامرة', 'جريمة', 'عربي', 'أنمي']
const years = Array.from({ length: 35 }, (_, i) => 2025 - i)
const types = [
  { label: 'الكل', value: '' },
  { label: 'أفلام', value: 'movie' },
  { label: 'مسلسلات', value: 'series' },
  { label: 'أنمي', value: 'anime' }
]

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-slate-400 ml-2">
        <ListFilter className="w-5 h-5 text-red-500" />
        <span className="text-sm font-bold">تصفية حسب:</span>
      </div>

      {/* فلتر النوع */}
      <select 
        onChange={(e) => updateFilter('type', e.target.value)}
        value={searchParams.get('type') || ''}
        className="bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 outline-none focus:border-red-500 transition"
      >
        <option value="">كل التصنيفات</option>
        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>

      {/* فلتر السنة */}
      <select 
        onChange={(e) => updateFilter('year', e.target.value)}
        value={searchParams.get('year') || ''}
        className="bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 outline-none focus:border-red-500 transition"
      >
        <option value="">سنة الإنتاج</option>
        {years.map(y => <option key={y} value={y}>{y}</option>)}
      </select>

      {/* فلتر التصنيف (Genre) */}
      <select 
        onChange={(e) => updateFilter('genre', e.target.value)}
        value={searchParams.get('genre') || ''}
        className="bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 outline-none focus:border-red-500 transition"
      >
        <option value="">التصنيف (أكشن، دراما...)</option>
        {genres.map(g => <option key={g} value={g}>{g}</option>)}
      </select>

      {/* فلتر الترتيب */}
      <select 
        onChange={(e) => updateFilter('order', e.target.value)}
        value={searchParams.get('order') || 'newest'}
        className="bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-xl border border-slate-700 outline-none focus:border-red-500 transition mr-auto"
      >
        <option value="newest">الأحدث مضافاً</option>
        <option value="rating">الأعلى تقييماً</option>
        <option value="views">الأكثر مشاهدة</option>
        <option value="year_desc">الأحدث إنتاجاً</option>
      </select>
    </div>
  )
}
