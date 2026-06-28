export function getPostImages(post) {
  if (post.images?.length > 0) return post.images;
  if (post.mediaUrl) return [post.mediaUrl];
  return [];
}
