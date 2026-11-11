const User = require('../models/User');
const Provider = require('../models/Provider');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { fail } = require('../middleware/async');

// ---- services & providers ----
exports.listServices = async (req, res) => res.json(await Service.find({}));
exports.addService = async (req, res) => res.status(201).json(await Service.create(req.body));
exports.deleteService = async (req, res) => { await Service.findByIdAndDelete(req.params.id); res.json({ ok: true }); };
exports.listProviders = async (req, res) => {
  const p = await Provider.find(req.query.category ? { category: req.query.category } : {});
  res.json(p.sort((a, b) => b.rating - a.rating));
};
exports.myProvider = async (req, res) => res.json(await Provider.findOne({ user: req.user.id }));

// ---- bookings ----
exports.createBooking = async (req, res) => {
  const { serviceId, address, date, notes, providerId } = req.body;
  const s = await Service.findById(serviceId);
  if (!s) fail(404, 'Service not found');
  const p = providerId ? await Provider.findById(providerId) : null;
  const b = await Booking.create({ customer: req.user.id, customerName: req.user.name, service: s._id, serviceName: s.name, category: s.category,
    provider: p ? p._id : null, providerName: p ? p.name : '', address, date, notes, price: s.price, paid: false, status: 'pending' });
  res.status(201).json(b);
};
exports.listBookings = async (req, res) => {
  const { role, id } = req.user;
  let all = await Booking.find({});
  if (role === 'customer') all = all.filter(b => String(b.customer) === id);
  if (role === 'provider') {
    const me = await Provider.findOne({ user: id });
    all = all.filter(b => me && (String(b.provider) === String(me._id) || (!b.provider && b.status === 'pending' && b.category === me.category)));
  }
  res.json(all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
};
exports.updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!['accepted', 'rejected', 'in-progress', 'completed', 'cancelled'].includes(status)) fail(400, 'Invalid status');
  const b = await Booking.findById(req.params.id);
  if (!b) fail(404, 'Booking not found');
  if (req.user.role === 'customer' && (String(b.customer) !== req.user.id || status !== 'cancelled')) fail(403, 'Not allowed');
  if (req.user.role === 'provider' && status === 'accepted' && !b.provider) {
    const me = await Provider.findOne({ user: req.user.id });
    b.provider = me._id; b.providerName = me.name;
  }
  b.status = status;
  await b.save();
  if (status === 'completed' && b.provider) {
    const p = await Provider.findById(b.provider);
    if (p) { p.jobsDone = (p.jobsDone || 0) + 1; await p.save(); }
  }
  res.json(b);
};

// ---- payments (simulated) & reviews ----
exports.pay = async (req, res) => {
  const b = await Booking.findById(req.body.bookingId);
  if (!b || String(b.customer) !== req.user.id) fail(404, 'Booking not found');
  if (b.paid) fail(400, 'Already paid');
  const pay = await Payment.create({ booking: b._id, customer: req.user.id, amount: b.price, method: req.body.method || 'UPI (demo)', status: 'SUCCESS', txnId: 'TXN' + Date.now() });
  b.paid = true; await b.save();
  res.status(201).json(pay);
};
exports.addReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body;
  const b = await Booking.findById(bookingId);
  if (!b || String(b.customer) !== req.user.id) fail(404, 'Booking not found');
  if (b.status !== 'completed') fail(400, 'Only completed bookings can be reviewed');
  const r = await Review.create({ booking: b._id, provider: b.provider, customer: req.user.id, customerName: req.user.name, rating: Number(rating), comment });
  const p = await Provider.findById(b.provider);
  if (p) {
    const rs = await Review.find({ provider: b.provider });
    p.rating = Math.round(rs.reduce((s, x) => s + x.rating, 0) / rs.length * 10) / 10; p.reviewCount = rs.length;
    await p.save();
  }
  res.status(201).json(r);
};
exports.listReviews = async (req, res) => res.json(await Review.find({}));

// ---- admin ----
exports.stats = async (req, res) => {
  const [users, bookings, payments] = await Promise.all([User.find({}), Booking.find({}), Payment.find({})]);
  res.json({
    customers: users.filter(u => u.role === 'customer').length,
    providers: users.filter(u => u.role === 'provider').length,
    bookings: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    revenue: payments.reduce((s, p) => s + (p.amount || 0), 0),
  });
};
exports.listUsers = async (req, res) => res.json((await User.find({})).map(u => ({ _id: u._id, name: u.name, email: u.email, role: u.role })));
exports.deleteUser = async (req, res) => {
  const u = await User.findById(req.params.id);
  if (!u || u.role === 'admin') fail(400, 'Cannot delete this user');
  await User.deleteOne({ _id: u._id });
  await Provider.deleteOne({ user: u._id });
  res.json({ ok: true });
};
