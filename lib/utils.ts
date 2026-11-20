export const getImg = (path: string | null, size: 'w500' | 'original' = 'w500') => {
  if (!path) return "https://images.unsplash.com/photo-1518676599649-7c70b475982e?w=500&auto=format&fit=crop&q=60";
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
