const { cookieOptions } = require('./_auth');

module.exports = function lock(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false });
  }
  res.setHeader('Set-Cookie', cookieOptions(0));
  return res.status(200).json({ ok: true });
};
