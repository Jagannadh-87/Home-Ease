for (const m of ['User', 'Provider', 'Service', 'Booking', 'Payment', 'Review']) jest.mock(`../models/${m}`, () => require('./fakeModel')());
const request = require('supertest');
const app = require('../app');
const Service = require('../models/Service');
const Provider = require('../models/Provider');

describe('HomeEase API', () => {
  test('health endpoint returns status, database and timestamp', async () => {
    const res = await request(app).get('/api/health');
    expect(['UP', 'DEGRADED']).toContain(res.body.status);
    expect(res.body.database).toBe('disconnected'); // no DB in unit tests
    expect(res.body.timestamp).toBeDefined();
  });

  test('info endpoint exposes build metadata from env', async () => {
    process.env.BUILD_NUMBER = '42'; process.env.GIT_COMMIT = 'abc123';
    const res = await request(app).get('/api/info');
    expect(res.body.buildNumber).toBe('42');
    expect(res.body.gitCommit).toBe('abc123');
  });

  test('register then login', async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Test', email: 'T@x.com', password: 'pw123' });
    expect(reg.status).toBe(201);
    expect(reg.body.token).toBeDefined();
    const ok = await request(app).post('/api/auth/login').send({ email: 't@x.com', password: 'pw123' });
    expect(ok.status).toBe(200);
    const bad = await request(app).post('/api/auth/login').send({ email: 't@x.com', password: 'wrong' });
    expect(bad.status).toBe(401);
  });

  test('service listing', async () => {
    await Service.create({ name: 'Tap Repair', category: 'Plumber', price: 349 });
    const res = await request(app).get('/api/services');
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  test('booking creation needs login and returns a pending booking', async () => {
    const s = (await Service.find({}))[0];
    const noAuth = await request(app).post('/api/bookings').send({ serviceId: s._id });
    expect(noAuth.status).toBe(401);
    const login = await request(app).post('/api/auth/login').send({ email: 't@x.com', password: 'pw123' });
    const res = await request(app).post('/api/bookings').set('Authorization', 'Bearer ' + login.body.token)
      .send({ serviceId: s._id, address: 'Vizag', date: '2026-12-01' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
    expect(res.body.serviceName).toBe('Tap Repair');
  });

  test('AI endpoint classifies a complaint and recommends providers', async () => {
    await Provider.create({ name: 'Ravi', category: 'AC Technician', rating: 4.8 });
    const res = await request(app).post('/api/ai/analyze').send({ text: 'My AC is not cooling' });
    expect(res.body.category).toBe('AC Technician');
    expect(res.body.providers.length).toBe(1);
  });
});
