const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Provider = require('./models/Provider');
const Service = require('./models/Service');
const Booking = require('./models/Booking');
const Payment = require('./models/Payment');
const Review = require('./models/Review');

const SERVICES = [
  ['AC Service & Repair', 'AC Technician', 499, '60–90 min'], ['AC Gas Refill', 'AC Technician', 1499, '90 min'],
  ['Fan & Switch Repair', 'Electrician', 299, '30–60 min'], ['Home Wiring Check', 'Electrician', 599, '60 min'],
  ['Tap & Pipe Repair', 'Plumber', 349, '45–90 min'], ['Drain Unblocking', 'Plumber', 449, '60 min'],
  ['Full Home Deep Clean', 'Home Cleaner', 2499, '4 hours'], ['Bathroom Cleaning', 'Home Cleaner', 599, '90 min'],
  ['Furniture Repair', 'Carpenter', 699, '1–3 hours'], ['Wardrobe Installation', 'Carpenter', 1299, '3 hours'],
  ['Interior Wall Painting', 'Painter', 3999, '1 day'], ['Waterproofing / Seepage Fix', 'Painter', 2999, '6 hours'],
];
// first provider is the demo login: provider@homeease.com
const PROVIDERS = [['Ravi Kumar', 'AC Technician', 4.8, 6, 'provider'], ['Suresh Babu', 'Electrician', 4.6, 8, 'suresh'], ['Anil Reddy', 'Plumber', 4.7, 5, 'anil'],
  ['Lakshmi Devi', 'Home Cleaner', 4.9, 4, 'lakshmi'], ['Venkat Rao', 'Carpenter', 4.5, 10, 'venkat'], ['Srinivas M', 'Painter', 4.4, 7, 'srinivas']];

exports.run = async () => {
  if ((await User.countDocuments()) > 0) return console.log('Seed skipped (data exists)');
  const hash = pw => bcrypt.hash(pw, 10);
  await User.create({ name: 'Admin', email: 'admin@homeease.com', password: await hash('admin123'), role: 'admin' });
  const cust = await User.create({ name: 'Gnanesh', email: 'customer@homeease.com', password: await hash('customer123'), role: 'customer' });
  await User.create({ name: 'Priya Sharma', email: 'priya@homeease.com', password: await hash('customer123'), role: 'customer' });
  const services = await Service.insertMany(SERVICES.map(([name, category, price, duration]) => ({ name, category, price, duration, description: `Professional ${name.toLowerCase()} by verified experts.` })));
  const provs = [];
  for (const [name, category, rating, experience, em] of PROVIDERS) {
    const u = await User.create({ name, email: `${em}@homeease.com`, password: await hash('provider123'), role: 'provider' });
    provs.push(await Provider.create({ user: u._id, name, category, rating, reviewCount: 12, experience, jobsDone: 40 + experience * 7, available: true, city: 'Visakhapatnam' }));
  }
  const mk = async (si, status, paid, day) => {
    const s = services[si], p = provs.find(x => x.category === s.category);
    const b = await Booking.create({ customer: cust._id, customerName: cust.name, service: s._id, serviceName: s.name, category: s.category, provider: status === 'pending' ? null : p._id,
      providerName: status === 'pending' ? '' : p.name, address: 'Flat 202, Sea View Apts, Visakhapatnam', date: day, notes: 'Please call before arriving', price: s.price, paid, status });
    if (paid) await Payment.create({ booking: b._id, customer: cust._id, amount: s.price, method: 'UPI (demo)', status: 'SUCCESS', txnId: 'TXN' + Math.floor(Math.random() * 1e9) });
    return b;
  };
  const done = await mk(0, 'completed', true, '2026-10-20');
  await mk(4, 'completed', true, '2026-10-25');
  await mk(6, 'accepted', false, '2026-11-14');
  await mk(2, 'pending', false, '2026-11-16');
  await mk(10, 'pending', false, '2026-11-18');
  await Review.create({ booking: done._id, provider: provs[0]._id, customer: cust._id, customerName: cust.name, rating: 5, comment: 'Quick and professional. AC cooling like new!' });
  console.log('Seed complete: demo accounts, services, providers, bookings');
};

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/homeease').then(exports.run).then(() => process.exit(0));
}
