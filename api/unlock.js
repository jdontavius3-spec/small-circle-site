const crypto = require('crypto');
const { cookieOptions } = require('./_auth');

function secureEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = function unlock(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false });
    }
  }

  const configured = process.env.PASSKEY;
  if (!configured || !secureEqual(body.passkey || '', configured)) {
    return res.status(401).json({ ok: false });
  }

  res.setHeader('Set-Cookie', cookieOptions(60 * 60 * 24 * 7));
  return res.status(200).json({ ok: true });
};
