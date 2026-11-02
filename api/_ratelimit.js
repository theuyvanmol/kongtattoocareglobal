// api/_ratelimit.js
// Simple in-memory rate limiter for Vercel serverless functions.
// Each function instance has its own memory so this acts as a per-instance
// throttle — combined with Vercel's WAF it provides strong bot protection.

const store = new Map();

/**
 * Check and record a request. Returns true if the request should be blocked.
 * @param {string} key      - unique key (IP + endpoint)
 * @param {number} limit    - max requests
 * @param {number} windowMs - time window in milliseconds
 */
function isRateLimited(key, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const entry = store.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > entry.resetAt) {
    // Window expired — reset
    entry.count = 1;
    entry.resetAt = now + windowMs;
  } else {
    entry.count++;
  }

  store.set(key, entry);

  // Prune old entries every ~500 requests to avoid memory leak
  if (store.size > 500) {
    for (const [k, v] of store.entries()) {
      if (now > v.resetAt) store.delete(k);
    }
  }

  return entry.count > limit;
}

/**
 * Get the real client IP from Vercel request headers.
 */
function getClientIp(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Express-style middleware: call at the top of each handler.
 * Returns true if request was rate-limited (response already sent).
 *
 * Usage:
 *   if (await rateLimit(req, res, { limit: 20, windowMs: 60000 })) return;
 */
function rateLimit(req, res, { limit = 30, windowMs = 60_000, endpoint = '' } = {}) {
  const ip = getClientIp(req);
  const key = `${ip}:${endpoint || req.url || ''}`;

  if (isRateLimited(key, limit, windowMs)) {
    res.setHeader('Retry-After', Math.ceil(windowMs / 1000));
    res.status(429).json({ error: 'Too many requests. Please slow down.' });
    return true;
  }
  return false;
}

module.exports = { rateLimit, getClientIp };
