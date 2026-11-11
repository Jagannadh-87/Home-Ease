const r = require('express').Router();
const { h } = require('../middleware/async');
const { auth } = require('../middleware/auth');
const A = require('../controllers/auth');
const D = require('../controllers/data');
const AI = require('../controllers/ai');

r.post('/auth/register', h(A.register));
r.post('/auth/login', h(A.login));

r.get('/services', h(D.listServices));
r.post('/services', auth('admin'), h(D.addService));
r.delete('/services/:id', auth('admin'), h(D.deleteService));

r.get('/providers', h(D.listProviders));
r.get('/providers/me', auth('provider'), h(D.myProvider));

r.post('/bookings', auth('customer'), h(D.createBooking));
r.get('/bookings', auth(), h(D.listBookings));
r.patch('/bookings/:id/status', auth(), h(D.updateStatus));

r.post('/payments', auth('customer'), h(D.pay));
r.get('/reviews', h(D.listReviews));
r.post('/reviews', auth('customer'), h(D.addReview));

r.post('/ai/analyze', h(AI.analyze));

r.get('/admin/stats', auth('admin'), h(D.stats));
r.get('/admin/users', auth('admin'), h(D.listUsers));
r.delete('/admin/users/:id', auth('admin'), h(D.deleteUser));
module.exports = r;
