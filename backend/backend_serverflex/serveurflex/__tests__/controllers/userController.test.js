// backend/.../__tests__/controllers/userController.test.js
// Mocks adaptés pour méthodes chainables de Mongoose (find().sort(), findById(...).select(...))

// NOTE : on **n**e **mocke pas** userModel en top-level (hoisting casse les doMock/isolates).
// On garde un mock global pour bcrypt (ok d'être hoisted).
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  compare: jest.fn().mockResolvedValue(false),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

const pathToController = '../../Controllers/userController';
const { createReqRes, mockConstructorModel } = require('../helpers/testUtils');

/**
 * runIsolated : réduit l'imbrication dans chaque test en centralisant
 * resetModules / isolateModules / require du controller.
 *
 * - setupMocks : doit appeler jest.doMock(...) synchronously
 * - testBody : async ({ controller, req, res }) => { ... assertions ... }
 */
async function runIsolated(setupMocks, testBody) {
  await jest.isolateModulesAsync(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    setupMocks();
    const userController = require(pathToController);
    const { req, res } = createReqRes();
    await testBody({ userController, req, res });
  });
}

describe('userController (isolated mocks per test)', () => {
  test('getAllUsers -> returns 200 with list (mock find().sort())', async () => {
    await runIsolated(
      () => {
        // Mock chainable find().sort() -> resolves array
        jest.doMock('../../models/userModel', () => ({
          find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue([{ _id: 'u1', name: 'A' }]) })),
          // stubs utiles pour d'autres tests
          findById: jest.fn(),
          findByIdAndDelete: jest.fn(),
          findOne: jest.fn(),
          findByIdAndUpdate: jest.fn(),
        }));
      },
      async ({ userController, req, res }) => {
        await userController.getAllUsers(req, res);
        const userModel = require('../../models/userModel');
        expect(userModel.find).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith([{ _id: 'u1', name: 'A' }]);
      }
    );
  });

  test('getAllUsers -> empty list -> triggers error path (returns 500)', async () => {
    await runIsolated(
      () => {
        jest.doMock('../../models/userModel', () => ({
          find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue([]) })),
          findById: jest.fn(),
          findByIdAndDelete: jest.fn(),
          findOne: jest.fn(),
          findByIdAndUpdate: jest.fn(),
        }));
      },
      async ({ userController, req, res }) => {
        await userController.getAllUsers(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
      }
    );
  });

  test('getUserById -> success 200 (findById(...).select(...))', async () => {
    await runIsolated(
      () => {
        const user = { _id: 'u2', name: 'Bob' };
        jest.doMock('../../models/userModel', () => ({
          find: jest.fn(),
          findById: jest.fn(() => ({ select: jest.fn().mockResolvedValue(user) })),
          findByIdAndDelete: jest.fn(),
          findOne: jest.fn(),
          findByIdAndUpdate: jest.fn(),
        }));
      },
      async ({ userController, req, res }) => {
        req.params = { id: 'u2' };
        await userController.getUserById(req, res);
        const userModel = require('../../models/userModel');
        expect(userModel.findById).toHaveBeenCalledWith('u2');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ _id: 'u2', name: 'Bob' });
      }
    );
  });

  test('deleteUserById -> success 200', async () => {
    await runIsolated(
      () => {
        jest.doMock('../../models/userModel', () => ({
          findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'u3' }),
        }));
      },
      async ({ userController, req, res }) => {
        req.params = { id: 'u3' };
        await userController.deleteUserById(req, res);
        const userModel = require('../../models/userModel');
        expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u3');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith('deleted');
      }
    );
  });

  test('addClient -> saves and returns the created user (constructor + save)', async () => {
    await runIsolated(
      () => {
        // Provide a constructor that acts like "new userModel(data)"
        jest.doMock('../../models/userModel', () => mockConstructorModel('x'));
      },
      async ({ userController, req, res }) => {
        const body = { name: 'New', email: 'n@x.com', password: 'Pass123!' };
        req.body = body;
        await userController.addClient(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'x', name: 'New' }));
      }
    );
  });
});
