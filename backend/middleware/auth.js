const jwt = require('jsonwebtoken');
const secret = () => process.env.JWT_SECRET || 'dev-only-secret';
exports.sign = u => jwt.sign({ id: String(u._id), role: u.role, name: u.name }, secret(), { expiresIn: '1d' });
exports.auth = (...roles) => (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), secret());
  } catch { return res.status(401).json({ message: 'Login required' }); }
  if (roles.length && !roles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
