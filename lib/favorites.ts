'use client'

import { useState, useEffect } from 'react'

export interface FavoriteItem {
  id: string
  slug: string
  title: string
  title_ar?: string | null
  type: string
  poster_url?: string | null
  rating?: number | null
  release_year?: number | null
}

const STORAGE_KEY = 'cinema_plus_favorites'

export function getFavorites(): FavoriteItem[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function isFavorite(id: string): boolean {
  if (typeof window === 'undefined') return false
  const list = getFavorites()
  return list.some(item => item.id === id)
}

export function toggleFavorite(item: FavoriteItem): boolean {
  if (typeof window === 'undefined') return false
  const list = getFavorites()
  const exists = list.some(i => i.id === item.id)

  let updated: FavoriteItem[]
  if (exists) {
    updated = list.filter(i => i.id !== item.id)
  } else {
    updated = [item, ...list]
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    // Trigger custom event so Header updates badge count immediately
    window.dispatchEvent(new Event('favorites_updated'))
  } catch (e) {
    console.error('Failed to save favorites', e)
  }

  return !exists
}

// React Hook to get real-time count of favorites in header
export function useFavoritesCount(): number {
  const [count, setCount] = useState<number>(0)

  useEffect(() => {
    const updateCount = () => {
      setCount(getFavorites().length)
    }

    updateCount()

    window.addEventListener('favorites_updated', updateCount)
    window.addEventListener('storage', updateCount)

    return () => {
      window.removeEventListener('favorites_updated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  return count
}
