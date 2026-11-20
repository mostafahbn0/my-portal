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
