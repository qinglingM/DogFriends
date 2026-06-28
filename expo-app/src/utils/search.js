export function fuzzySearch(query, items, keys) {
  if (!query?.trim()) return [];
  const lower = query.toLowerCase().trim();
  return items
    .map(item => {
      let score = 0;
      for (const key of keys) {
        const val = String(item[key] || '').toLowerCase();
        if (val === lower) score += 100;
        else if (val.startsWith(lower)) score += 50;
        else if (val.includes(lower)) score += 10;
      }
      return { item, score };
    })
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(x => x.item);
}
