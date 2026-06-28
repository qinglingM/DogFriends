import { supabase } from '../lib/supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

const BUCKET = 'photos';

/**
 * 将本地图片上传到 Supabase Storage，返回 public URL
 * @param {string} localUri 本地文件 URI
 * @param {string} folder 文件夹名（avatars / covers / dogs / posts / locations / validations / walks）
 * @param {string} fileName 文件名（建议含扩展名）
 * @param {object} [opts]
 * @param {number} [opts.resizeWidth] 可选，压缩宽度
 * @returns {Promise<string>} public URL
 */
export async function uploadImage(localUri, folder, fileName, opts = {}) {
  if (!localUri || localUri.startsWith('http')) return localUri;

  let uri = localUri;

  // 可选：压缩图片
  const { resizeWidth = 1200 } = opts;
  if (resizeWidth) {
    try {
      const result = await manipulateAsync(uri, [{ resize: { width: resizeWidth } }], {
        compress: 0.8,
        format: SaveFormat.JPEG,
      });
      uri = result.uri;
    } catch (e) {
      console.warn('[uploadService] resize failed, using original', e);
    }
  }

  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${folder}/${fileName}.${ext === 'heic' ? 'jpg' : ext}`;

  // 读文件为 base64（兼容 content://、file://、ph:// 所有平台）
  const contentType = `image/${ext === 'png' ? 'png' : 'jpeg'}`;
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const blob = await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `data:${contentType};base64,${base64}`, true);
    xhr.responseType = 'blob';
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = reject;
    xhr.send();
  });

  const { data, error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error('[uploadService] upload error:', error);
    throw error;
  }

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);
  return urlData.publicUrl;
}

/**
 * 批量上传图片
 * @param {string[]} localUris
 * @param {string} folder
 * @param {string} baseName
 * @returns {Promise<string[]>} public URL 数组
 */
export async function uploadImages(localUris, folder, baseName) {
  return Promise.all(
    localUris.map((uri, i) => uploadImage(uri, folder, `${baseName}_${i}`))
  );
}
