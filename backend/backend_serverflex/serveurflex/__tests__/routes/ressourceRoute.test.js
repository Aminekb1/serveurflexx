// __tests__/routes/ressourceRoute.test.js
const express = require('express');
const request = require('supertest');

describe('ressourceRoute wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('ressource routes are wired and protected routes call controller', async () => {
    jest.doMock('../../Controllers/ressourceController', () => ({
      getAllRessources: jest.fn((req, res) => res.status(200).json({ route: 'getAllRessources' })),
      getRessourceById: jest.fn((req, res) => res.status(200).json({ route: 'getRessourceById', id: req.params.id })),
      addRessource: jest.fn((req, res) => res.status(201).json({ route: 'addRessource' })),
      updateRessource: jest.fn((req, res) => res.status(200).json({ route: 'updateRessource', id: req.params.id })),
      deleteRessourceById: jest.fn((req, res) => res.status(200).json({ route: 'deleteRessourceById', id: req.params.id })),
      removeResourceFromClient: jest.fn((req, res) => res.status(200).json({ route: 'removeResourceFromClient', id: req.params.id })),
      getVMConnectionDetails: jest.fn((req, res) => res.status(200).json({ route: 'getVMConnectionDetails', id: req.params.id })),
      getVMConsole: jest.fn((req, res) => res.status(200).json({ route: 'getVMConsole', id: req.params.id })),
      getAvailableNetworks: jest.fn((req, res) => res.status(200).json({ route: 'getAvailableNetworks' })),
      getAvailableResources: jest.fn((req, res) => res.status(200).json({ route: 'getAvailableResources' })),
      getAvailableISOs: jest.fn((req, res) => res.status(200).json({ route: 'getAvailableISOs' })),
      createCustomVM: jest.fn((req, res) => res.status(201).json({ route: 'createCustomVM' })),
      checkVMStatus: jest.fn((req, res) => res.status(200).json({ route: 'checkVMStatus', id: req.params.id })),
    }));

    // Mock auth middleware required by several routes
    jest.doMock('../../middlewares/authMiddleware', () => ({
      requireAuthUser: (req, res, next) => next()
    }));

    const router = require('../../routes/ressourceRoute');
    const app = express();
    app.use(express.json());
    app.use('/', router);

    const r1 = await request(app).get('/getAllRessources');
    expect(r1.status).toBe(200);
    expect(r1.body).toMatchObject({ route: 'getAllRessources' });

    const r2 = await request(app).get('/123/connection');
    expect(r2.status).toBe(200);
    expect(r2.body).toMatchObject({ route: 'getVMConnectionDetails', id: '123' });

    const r3 = await request(app).post('/createCustomVM').send({ name: 'vm' });
    expect(r3.status).toBe(201);
    expect(r3.body).toMatchObject({ route: 'createCustomVM' });

    const r4 = await request(app).get('/123/status');
    expect(r4.status).toBe(200);
    expect(r4.body).toMatchObject({ route: 'checkVMStatus', id: '123' });
  });
});
