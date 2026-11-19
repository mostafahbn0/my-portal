'use client'
import { useState, useEffect } from 'react'
import { Bookmark, Film, Trash2 } from 'lucide-react'
import MediaCard from '@/components/MediaCard'
import { Media } from '@/lib/types'
import { getFavorites } from '@/lib/favorites'
import Link from 'next/link'

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Media[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setFavorites(getFavorites())
    setLoaded(true)

    const handleUpdate = () => setFavorites(getFavorites())
    window.addEventListener('favorites_updated', handleUpdate)
    return () => window.removeEventListener('favorites_updated', handleUpdate)
  }, [])

  const handleClearAll = () => {
    if (!confirm('هل تريد مسح كل الأعمال من قائمتك؟')) return
    localStorage.removeItem('cinemaplus_favorites')
    setFavorites([])
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 text-right" dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-red-500 fill-current" />
            قائمتي المفضلة
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            الأفلام والمسلسلات التي حفظتها لمشاهدتها لاحقاً ({favorites.length} عمل)
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-slate-900 hover:bg-red-600/20 text-slate-400 hover:text-red-400 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start"
          >
            <Trash2 className="w-4 h-4" /> مسح القائمة كاملة
          </button>
        )}
      </div>

      {/* المحتوى */}
      {loaded && favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {favorites.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ) : loaded ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-16 text-center space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">قائمتك فارغة حالياً</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            اضغط على علامة الحفظ (🔖) في أي فيلم أو مسلسل ترغب بمشاهدته لاحقاً وسيظهر هنا فوراً.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition"
          >
            تصفح أحدث الأعمال
          </Link>
        </div>
      ) : null}

    </div>
  )
}
