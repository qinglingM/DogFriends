export function imageUrl(url) {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  return url;
}
