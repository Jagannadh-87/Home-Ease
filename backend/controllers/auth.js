const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Provider = require('../models/Provider');
const { sign } = require('../middleware/auth');
const { fail } = require('../middleware/async');
const safe = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

exports.register = async (req, res) => {
  const { name, email, password, role = 'customer', category } = req.body;
  if (!name || !email || !password) fail(400, 'name, email and password are required');
  if (role === 'admin') fail(403, 'Cannot self-register as admin');
  if (await User.findOne({ email: email.toLowerCase() })) fail(409, 'Email already registered');
  const u = await User.create({ name, email: email.toLowerCase(), password: await bcrypt.hash(password, 10), role });
  if (role === 'provider') await Provider.create({ user: u._id, name, category: category || 'Electrician', rating: 4, experience: 1, jobsDone: 0, available: true, city: 'Visakhapatnam' });
  res.status(201).json({ token: sign(u), user: safe(u) });
};
exports.login = async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) fail(401, 'Invalid email or password');
  res.json({ token: sign(u), user: safe(u) });
};
