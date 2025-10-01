// __tests__/routes/osRouter.test.js
const request = require('supertest');
const express = require('express');

describe('osRouter routes', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('routes wired -> GET /getInformationFromPc, /cpus, /cpusById/:id', async () => {
    await jest.isolateModulesAsync(async () => {
      // Mock du controller pour ne pas dépendre de 'os' ici.
      jest.doMock('../../Controllers/osController', () => ({
        getOsInformatin: jest.fn((req, res) => res.status(200).json({ hostname: 'mocked' })),
        osCpus: jest.fn((req, res) => res.status(200).json([{ model: 'm1' }])),
        osCpusById: jest.fn((req, res) => res.status(200).json({ model: 'm1', id: req.params.id }))
      }));

      const router = require('../../routes/osRouter'); // le router utilise le controller mocké
      const app = express();
      // monter le router à la racine (les routes du router sont définies sans préfixe)
      app.use('/', router);

      // 1) GET /getInformationFromPc
      const r1 = await request(app).get('/getInformationFromPc');
      expect(r1.status).toBe(200);
      expect(r1.body).toEqual(expect.objectContaining({ hostname: 'mocked' }));

      // 2) GET /cpus
      const r2 = await request(app).get('/cpus');
      expect(r2.status).toBe(200);
      expect(Array.isArray(r2.body)).toBe(true);
      expect(r2.body[0]).toEqual(expect.objectContaining({ model: 'm1' }));

      // 3) GET /cpusById/:id
      const r3 = await request(app).get('/cpusById/42');
      expect(r3.status).toBe(200);
      expect(r3.body).toEqual(expect.objectContaining({ model: 'm1', id: '42' }));
    });
  });
});
