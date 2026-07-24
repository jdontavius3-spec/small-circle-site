const crypto = require('crypto');

const COOKIE_NAME = 'sc_access';
const TOKEN_PAYLOAD = 'small-circle-access-v1';

function getSecret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error('AUTH_SECRET must be set and contain at least 16 characters.');
  }
  return value;
}

function createToken() {
  return crypto
    .createHmac('sha256', getSecret())
    .update(TOKEN_PAYLOAD)
    .digest('hex');
}

function parseCookies(req) {
  const header = req.headers && req.headers.cookie ? req.headers.cookie : '';
  const cookies = {};
  for (const part of header.split(';')) {
    const item = part.trim();
    if (!item) continue;
    const index = item.indexOf('=');
    if (index < 0) continue;
    const key = item.slice(0, index).trim();
    const raw = item.slice(index + 1);
    try {
      cookies[key] = decodeURIComponent(raw);
    } catch {
      cookies[key] = raw;
    }
  }
  return cookies;
}

function isUnlocked(req) {
  const value = parseCookies(req)[COOKIE_NAME];
  if (!value) return false;
  const expected = createToken();
  const left = Buffer.from(value);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cookieOptions(maxAge) {
  return [
    `${COOKIE_NAME}=${maxAge === 0 ? '' : createToken()}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Secure',
    `Max-Age=${maxAge}`
  ].join('; ');
}

module.exports = { COOKIE_NAME, isUnlocked, cookieOptions };
