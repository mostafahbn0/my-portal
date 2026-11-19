'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Star, Loader2, X, Film } from 'lucide-react'

export default function LiveSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setOpen(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/search/live?q=${encodeURIComponent(query)}`)
        const data = await res.json()
        setResults(data.results || [])
        setOpen(true)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setOpen(true)}
          placeholder="ابحث عن فيلم، مسلسل، أنمي..."
          className="w-full bg-slate-900/90 text-white placeholder-slate-400 text-sm rounded-full pr-11 pl-10 py-2.5 border border-slate-700/60 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none transition-all shadow-inner"
        />
        <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        
        {loading ? (
          <Loader2 className="w-4 h-4 text-red-500 animate-spin absolute left-4 top-1/2 -translate-y-1/2" />
        ) : query ? (
          <button
            type="button"
            onClick={() => { setQuery(''); setOpen(false); }}
            className="w-4 h-4 text-slate-400 hover:text-white absolute left-4 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </form>

      {/* نتائج البحث المنسدلة */}
      {open && (
        <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
          {results.length > 0 ? (
            <>
              <div className="p-2 space-y-1">
                {results.map((item) => (
                  <Link
                    key={item.id}
                    href={`/media/${item.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition group"
                  >
                    <div className="relative w-11 h-15 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                      <Image
                        src={item.poster_url || '/placeholder.jpg'}
                        alt={item.title_ar}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="text-sm font-bold text-white group-hover:text-red-400 truncate">
                        {item.title_ar || item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                        <span className="text-red-400 font-semibold">
                          {item.type === 'movie' ? 'فيلم' : item.type === 'series' ? 'مسلسل' : 'أنمي'}
                        </span>
                        <span>•</span>
                        <span>{item.release_year}</span>
                        {item.rating > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              <Star className="w-3 h-3 fill-current" /> {item.rating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setOpen(false)}
                className="block p-3 text-center text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
              >
                عرض جميع نتائج البحث لـ &quot;{query}&quot;
              </Link>
            </>
          ) : (
            <div className="p-6 text-center text-slate-400 text-sm">
              لا توجد نتائج تطابق بحثك
            </div>
          )}
        </div>
      )}
    </div>
  )
}
