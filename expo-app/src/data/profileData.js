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
    case 'scenic':
      return 'map';
    case 'hotel':
      return 'bed';
    case 'other':
      return 'ellipsis-horizontal';
    default:
      return 'location';
  }
}
