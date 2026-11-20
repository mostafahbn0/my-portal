export const getMediaPoster = (item: any) => {
  if (!item) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  const path = item.poster_url || item.poster_path || item.poster || item.image || item.backdrop_path || item.backdrop_url;
  return getImg(path);
};

export const getMediaBackdrop = (item: any) => {
  if (!item) return "https://images.unsplash.com/photo-1518676599649-7c70b475982e?w=1200&auto=format&fit=crop&q=60";
  const path = item.backdrop_url || item.backdrop_path || item.backdrop || item.cover || item.poster_url || item.poster_path;
  return getImg(path, 'original');
};

export const getMediaYear = (item: any) => {
  if (!item) return '';
  const dateVal = item.release_date || item.release_year || item.year || item.first_air_date;
  if (!dateVal) return '';
  // استخراج السنة فقط (مثلاً 2026 من 2026-05-12 أو 2026 مباشرة)
  return String(dateVal).trim().split('-')[0];
};

export const getMediaRating = (item: any) => {
  if (!item) return '0.0';
  const val = item.vote_average ?? item.rating ?? 0;
  return Number(val).toFixed(1);
};

export const getImg = (path: string | null | undefined, size: 'w500' | 'original' = 'w500') => {
  if (!path || typeof path !== 'string' || path === 'null' || path === 'undefined' || path.trim() === '') {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
  }
  const clean = path.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }
  const formatted = clean.startsWith('/') ? clean : `/${clean}`;
  return `https://image.tmdb.org/t/p/${size}${formatted}`;
};
