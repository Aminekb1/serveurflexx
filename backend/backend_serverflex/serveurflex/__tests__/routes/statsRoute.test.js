// __tests__/routes/statsRoute.test.js
const express = require('express');
const request = require('supertest');

describe('statsRoute wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('routes are wired to controller methods', async () => {
    await jest.isolateModulesAsync(async () => {
      // Mock du controller : on se contente de retourner un indicateur simple sur chaque route
      jest.doMock('../../Controllers/statsController', () => ({
        getCommandeStats: jest.fn((req, res) => res.status(200).json({ route: 'commandes' })),
        getFactureStats: jest.fn((req, res) => res.status(200).json({ route: 'factures' })),
        getNotificationStats: jest.fn((req, res) => res.status(200).json({ route: 'notifications' })),
        getRessourceStats: jest.fn((req, res) => res.status(200).json({ route: 'ressources' })),
      }));

      const router = require('../../routes/statsRoute');
      const app = express();
      app.use('/', router);

      const r1 = await request(app).get('/commandes');
      expect(r1.status).toBe(200);
      expect(r1.body).toEqual(expect.objectContaining({ route: 'commandes' }));

      const r2 = await request(app).get('/factures');
      expect(r2.status).toBe(200);
      expect(r2.body).toEqual(expect.objectContaining({ route: 'factures' }));

      const r3 = await request(app).get('/notifications');
      expect(r3.status).toBe(200);
      expect(r3.body).toEqual(expect.objectContaining({ route: 'notifications' }));

      const r4 = await request(app).get('/ressources');
      expect(r4.status).toBe(200);
      expect(r4.body).toEqual(expect.objectContaining({ route: 'ressources' }));
    });
  });
});
