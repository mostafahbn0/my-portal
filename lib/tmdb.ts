const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export interface TMDBResult {
  title: string; overview: string; poster_url: string;
  backdrop_url: string; release_year: number;
  rating: number; genres: string[];
}

export async function fetchFromTMDB(tmdbId: number, type: 'movie' | 'tv'): Promise<TMDBResult> {
  const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${process.env.TMDB_API_KEY}&language=ar-SA`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('TMDB Error: ' + res.status);
  const data = await res.json();
  const title = type === 'movie' ? data.title : data.name;
  const date = type === 'movie' ? data.release_date : data.first_air_date;
  return {
    title,
    overview: data.overview || '',
    poster_url: data.poster_path ? `${IMG_BASE}/w500${data.poster_path}` : '',
    backdrop_url: data.backdrop_path ? `${IMG_BASE}/original${data.backdrop_path}` : '',
    release_year: date ? parseInt(date.slice(0, 4)) : 0,
    rating: Math.round((data.vote_average || 0) * 10) / 10,
    genres: (data.genres || []).map((g: { name: string }) => g.name),
  };
}

export function slugify(title: string, year: number): string {
  return `${title}-${year}`.toLowerCase()
    .replace(/[^\w\u0600-\u06FF\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-');
}
