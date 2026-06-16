export function getCategoryIcon(category) {
  switch (category) {
    case 'park':
      return 'leaf';
    case 'cafe':
      return 'cafe';
    case 'restaurant':
      return 'restaurant';
    case 'mall':
      return 'storefront';
    default:
      return 'location';
  }
}
