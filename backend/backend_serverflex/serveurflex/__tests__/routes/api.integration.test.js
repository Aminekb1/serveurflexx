/* const request = require('supertest');
const app = require('../../app'); // doit exporter Express app : module.exports = app;

describe('API integration smoke', () => {
  test('GET / (root) responds', async () => {
    const res = await request(app).get('/');
    // Accept either 200 or redirect or 404 — just ensure request doesn't crash
    expect([200, 302, 404]).toContain(res.statusCode);
  }, 10000);
}); */
