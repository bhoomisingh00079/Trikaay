/**
 * Cache Control Middleware
 * Sets appropriate cache headers for different response types
 */

function cacheControl(maxAge = 3600) {
  return (req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAge}`);
    next();
  };
}

function noCacheControl(req, res, next) {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
}

/**
 * Cache durations (in seconds)
 * - Static assets: 1 year (31536000s)
 * - Media files: 1 month (2592000s)
 * - API data (projects/team): 5 minutes (300s) - frequently updated
 * - Admin data: no cache - always fresh
 * - Auth endpoints: no cache - security
 */
const CACHE_DURATIONS = {
  STATIC: 31536000,      // 1 year
  MEDIA: 2592000,        // 1 month (images/PDFs from MongoDB)
  API_GENERAL: 300,      // 5 minutes (projects, team, etc.)
  ADMIN: 0,              // No cache
  AUTH: 0,               // No cache
};

module.exports = { cacheControl, noCacheControl, CACHE_DURATIONS };
