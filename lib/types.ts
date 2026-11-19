export type MediaType = 'movie' | 'series' | 'anime'
export type LinkType = 'stream' | 'download'

export interface Media {
  id: string
  tmdb_id?: number
  title: string
  title_ar: string
  slug: string
  type: MediaType
  description: string
  poster_url: string
  banner_url: string
  rating: number
  release_year: number
  genres: string[]
  quality: string
  is_featured: boolean
  status: string
  views: number
  created_at: string
  updated_at: string
}

export interface Season {
  id: string
  media_id: string
  season_number: number
  title: string
  created_at: string
  episodes?: Episode[]
}

export interface Episode {
  id: string
  season_id: string
  media_id: string
  episode_number: number
  title: string
  duration: number
  thumbnail_url?: string
  created_at: string
}

export interface Link {
  id: string
  media_id: string
  episode_id?: string
  server_name: string
  url: string
  quality: string
  link_type: LinkType
  created_at: string
}
