// __tests__/routes/factureRouter.test.js
const express = require('express');
const request = require('supertest');

describe('factureRouter wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('facture routes are wired to controller', async () => {
    jest.doMock('../../Controllers/factureController', () => ({
      getAllFactures: jest.fn((req, res) => res.status(200).json({ route: 'getAllFactures' })),
      createFacture: jest.fn((req, res) => res.status(201).json({ route: 'createFacture', body: req.body })),
      getFactureById: jest.fn((req, res) => res.status(200).json({ route: 'getFactureById', id: req.params.id })),
      updateFacture: jest.fn((req, res) => res.status(200).json({ route: 'updateFacture', id: req.params.id })),
      deleteFactureById: jest.fn((req, res) => res.status(200).json({ route: 'deleteFactureById', id: req.params.id })),
      calculateTotal: jest.fn((req, res) => res.status(200).json({ route: 'calculateTotal', id: req.params.id })),
      payerFacture: jest.fn((req, res) => res.status(200).json({ route: 'payerFacture', id: req.params.id })),
      generatePdf: jest.fn((req, res) => res.status(200).json({ route: 'generatePdf' })),
    }));

    const router = require('../../routes/factureRouter');
    const app = express();
    app.use(express.json());
    app.use('/', router);

    const r1 = await request(app).get('/getAllFactures');
    expect(r1.status).toBe(200);
    expect(r1.body).toMatchObject({ route: 'getAllFactures' });

    const r2 = await request(app).post('/createFacture').send({ id: 'F1' });
    expect(r2.status).toBe(201);
    expect(r2.body).toMatchObject({ route: 'createFacture', body: { id: 'F1' } });

    const r3 = await request(app).post('/F1/calculateTotal');
    expect(r3.status).toBe(200);
    expect(r3.body).toMatchObject({ route: 'calculateTotal', id: 'F1' });

    const r4 = await request(app).post('/generate-pdf').send({ latex: 'X' });
    expect(r4.status).toBe(200);
    expect(r4.body).toMatchObject({ route: 'generatePdf' });
  });
});
