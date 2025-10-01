// __tests__/routes/index.test.js
const express = require('express');
const request = require('supertest');

describe('routes/index router', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('GET / should return "index"', async () => {
    const router = require('../../routes/index'); // adapte si ton chemin diffère
    const app = express();
    app.use('/', router);

    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    // res.json('index') renvoie la chaîne "index" en body
    expect(res.body).toEqual('index');
  });
});
