// __tests__/routes/usersRouter.test.js
const express = require('express');
const request = require('supertest');

describe('usersRouter wiring', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('users routes are wired and middlewares are bypassed', async () => {
    // Mock controller methods
    jest.doMock('../../Controllers/userController', () => ({
      getAllUsers: jest.fn((req, res) => res.status(200).json({ route: 'getAllUsers' })),
      getUserById: jest.fn((req, res) => res.status(200).json({ route: 'getUserById', id: req.params.id })),
      addClient: jest.fn((req, res) => res.status(201).json({ route: 'addClient', body: req.body })),
      addClientWithImg: jest.fn((req, res) => res.status(201).json({ route: 'addClientWithImg' })),
      addAdmin: jest.fn((req, res) => res.status(201).json({ route: 'addAdmin' })),
      getUserByEmail: jest.fn((req, res) => res.status(200).json({ route: 'getUserByEmail' })),
      updateUser: jest.fn((req, res) => res.status(200).json({ route: 'updateUser', id: req.params.id })),
      updatePassword: jest.fn((req, res) => res.status(200).json({ route: 'updatePassword', id: req.params.id })),
      deleteUserById: jest.fn((req, res) => res.status(200).json({ route: 'deleteUserById', id: req.params.id })),
      getAdmin: jest.fn((req, res) => res.status(200).json({ route: 'getAdmin' })),
      getClient: jest.fn((req, res) => res.status(200).json({ route: 'getClient' })),
      loginUser: jest.fn((req, res) => res.status(200).json({ route: 'loginUser' })),
      logout: jest.fn((req, res) => res.status(200).json({ route: 'logout' })),
      signup: jest.fn((req, res) => res.status(201).json({ route: 'signup' })),
    }));

    // Mock upload middleware: single(field) -> middleware function (pass-through)
    jest.doMock('../../middlewares/uploadFileMiddlewares', () => ({
      single: jest.fn(() => (req, res, next) => next())
    }));

    // Mock authMiddleware requireAuthUser (pass-through)
    jest.doMock('../../middlewares/authMiddleware', () => ({
      requireAuthUser: (req, res, next) => next()
    }));

    // Mock controledAcces (pass-through)
    jest.doMock('../../middlewares/controledAcces', () => ({
      controledAcces: (req, res, next) => next()
    }));

    const router = require('../../routes/usersRouter');
    const app = express();
    app.use(express.json());
    app.use('/', router);

    // Endpoints
    const r1 = await request(app).get('/getAllUsers');
    expect(r1.status).toBe(200);
    expect(r1.body).toMatchObject({ route: 'getAllUsers' });

    const r2 = await request(app).get('/getUserById/abc');
    expect(r2.status).toBe(200);
    expect(r2.body).toMatchObject({ route: 'getUserById', id: 'abc' });

    const r3 = await request(app).post('/addClient').send({ name: 'X' });
    expect(r3.status).toBe(201);
    expect(r3.body).toMatchObject({ route: 'addClient', body: { name: 'X' } });

    const r4 = await request(app).post('/addClientWithImg').send({}); // upload middleware bypassed
    expect(r4.status).toBe(201);
    expect(r4.body).toMatchObject({ route: 'addClientWithImg' });

    const r5 = await request(app).post('/login');
    expect(r5.status).toBe(200);
    expect(r5.body).toMatchObject({ route: 'loginUser' });

    const r6 = await request(app).post('/logout');
    expect(r6.status).toBe(200);
    expect(r6.body).toMatchObject({ route: 'logout' });
  });
});
