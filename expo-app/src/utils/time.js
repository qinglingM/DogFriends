export function formatPostTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMin = Math.floor((now - date) / 60000);
  const diffHour = Math.floor((now - date) / 3600000);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin}分钟前`;
  if (isToday) return `${diffHour}小时前`;

  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (isYesterday) return `昨天 ${hh}:${mm}`;
  if (isThisYear) return `${month}月${day}日`;
  return `${date.getFullYear()}年${month}月${day}日`;
}
