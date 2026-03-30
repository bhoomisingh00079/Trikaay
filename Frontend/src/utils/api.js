import axiosInstance from './axiosInstance';

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

// ============================================
// ADMIN API HELPERS
// ============================================

// Site Settings
export const getSiteSettings = () =>
  axiosInstance.get('/api/admin/site-settings');

export const getPublicSiteSettings = () =>
  axiosInstance.get('/api/site-settings');

export const updateSiteSettings = (data) =>
  axiosInstance.patch('/api/admin/site-settings', data);

// Google Sheets
export const getSheetVolunteers = () =>
  axiosInstance.get('/api/admin/sheets/volunteers');

export const getSheetContacts = () =>
  axiosInstance.get('/api/admin/sheets/contacts');

export const getSheetComments = () =>
  axiosInstance.get('/api/admin/sheets/comments');

export const getSheetSubscribers = () =>
  axiosInstance.get('/api/admin/sheets/subscribers');

export const updateVolunteerRow = (rowIndex, data) =>
  axiosInstance.patch(`/api/admin/sheets/volunteers/${rowIndex}`, data);

export const approveVolunteer = (rowIndex) =>
  axiosInstance.post(`/api/admin/sheets/volunteers/${rowIndex}/approve`);

export const approveComment = (rowNumber) =>
  axiosInstance.post(`/api/admin/sheets/comments/${rowNumber}/approve`);

// Media
export const uploadMedia = (formData) =>
  axiosInstance.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteMedia = (id) =>
  axiosInstance.delete(`/api/media/${id}`);

export const deleteMediaByName = (fileName) =>
  axiosInstance.delete(`/api/media/name/${encodeURIComponent(fileName)}`);

export const getMediaDocs = () =>
  axiosInstance.get('/api/media/docs');

export const getMediaDocsAll = () =>
  axiosInstance.get('/api/media/docs', {
    params: { includeCertificates: 'true' },
  });

// Projects
export const getProjects = () =>
  axiosInstance.get('/api/admin/projects');

export const createProject = (data) =>
  axiosInstance.post('/api/admin/projects', data);

export const updateProject = (id, data) =>
  axiosInstance.patch(`/api/admin/projects/${id}`, data);

export const deleteProject = (id) =>
  axiosInstance.delete(`/api/admin/projects/${id}`);

export const getTeamMembers = () =>
  axiosInstance.get('/api/admin/team');
