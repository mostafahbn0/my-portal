export const getImg = (path: string | null, size: string = 'w500') => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Image";
  if (path.startsWith('http')) return path;
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
