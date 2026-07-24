const { isUnlocked } = require('./_auth');

module.exports = function session(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json({ unlocked: isUnlocked(req) });
};
