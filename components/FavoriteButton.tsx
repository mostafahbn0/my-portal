'use client'
import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { Media } from '@/lib/types'
import { isFavorite, toggleFavorite } from '@/lib/favorites'

interface Props {
  media: Media
  className?: string
  showText?: boolean
}

export default function FavoriteButton({ media, className = '', showText = false }: Props) {
  const [fav, setFav] = useState(false)

  useEffect(() => {
    setFav(isFavorite(media.id))
    const handleUpdate = () => setFav(isFavorite(media.id))
    window.addEventListener('favorites_updated', handleUpdate)
    return () => window.removeEventListener('favorites_updated', handleUpdate)
  }, [media.id])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const newState = toggleFavorite(media)
    setFav(newState)
  }

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-xl transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
        fav
          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
          : 'bg-black/60 backdrop-blur-md text-slate-300 hover:text-white hover:bg-black/90 border border-white/10'
      } ${className}`}
      title={fav ? 'إزالة من قائمتي' : 'إضافة إلى قائمتي'}
    >
      <Bookmark className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
      {showText && (
        <span className="text-xs font-bold">
          {fav ? 'في قائمتك' : 'إضافة لقائمتي'}
        </span>
      )}
    </button>
  )
}
