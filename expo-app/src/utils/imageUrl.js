let _counter = 0;

/**
 * 给图片 URL 追加缓存失效参数，每次调用生成不同的值
 * @param {string|null|undefined} url
 * @returns {string|null}
 */
export function imageUrl(url) {
  if (!url) return null;
  if (typeof url !== 'string') return null;
  // 只对用户上传的 URI 做 cache busting
  if (url.startsWith('http')) {
    _counter = (_counter + 1) % 99999;
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}t=${_counter}_${Date.now()}`;
  }
  return url;
}
