const configuredBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

export const API_BASE_URL = configuredBase;

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return configuredBase ? `${configuredBase}${normalizedPath}` : normalizedPath;
};

export const mediaFileUrl = (fileName) =>
  apiUrl(`/api/media/file/${encodeURIComponent(fileName)}`);

export const normalizeAssetUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/api/')) return apiUrl(url);
  return url;
};
