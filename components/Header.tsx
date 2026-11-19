'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Film, Clapperboard, Tv, Heart, Shuffle, PlusCircle } from 'lucide-react'
import LiveSearch from './LiveSearch'
import { useFavoritesCount } from '@/lib/favorites'

export default function Header() {
  const pathname = usePathname()
  const favCount = useFavoritesCount()

  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: Film },
    { href: '/explore?type=movie', label: 'الأفلام', icon: Clapperboard },
    { href: '/explore?type=series', label: 'المسلسلات', icon: Tv },
    { href: '/explore?type=anime', label: 'الأنمي', icon: Film },
  ]

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="container mx-auto px-4 max-w-7xl h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black text-rose-500 tracking-tight">
            <Film className="w-7 h-7" />
            <span>سينما<span className="text-white">بلس</span></span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                    isActive 
                      ? 'text-rose-500 bg-rose-500/10' 
                      : 'text-slate-300 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Live Search & Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <LiveSearch />

          {/* Random Surprise Button */}
          <a
            href="/api/random"
            title="اختر لي عملاً عشوائياً"
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/50 transition-all flex items-center justify-center"
          >
            <Shuffle className="w-4 h-4" />
          </a>

          {/* Request Button */}
          <Link
            href="/request"
            title="اطلب فيلماً أو مسلسلاً"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-rose-500" />
            <span>اطلب عملك</span>
          </Link>

          {/* Watchlist / Favorites */}
          <Link
            href="/favorites"
            className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 transition-all flex items-center justify-center"
            title="قائمتي المفضلة"
          >
            <Heart className="w-4 h-4" />
            {favCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
                {favCount > 99 ? '99+' : favCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
