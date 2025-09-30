

// backend/.../__tests__/controllers/userController.test.js
// Mocks adaptés pour méthodes chainables de Mongoose (find().sort(), findById(...).select(...))

// backend/.../__tests__/controllers/userController.test.js
// NOTE : on **n**e **mocke pas** userModel en top-level (hoisting casse les doMock/isolates).
// On garde un mock global pour bcrypt (ok d'être hoisted).
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('salt'),
  compare: jest.fn().mockResolvedValue(false),
  hash: jest.fn().mockResolvedValue('hashed'),
}));

// Utilitaires réutilisables
const pathToController = '../../Controllers/userController';

describe('userController (isolated mocks per test)', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis()
    };
    // Important : clear les modules entre tests pour garantir isolation
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getAllUsers -> returns 200 with list (mock find().sort())', async () => {
    await jest.isolateModulesAsync(async () => {
      // mock userModel pour ce test : find().sort() -> resolves array
      jest.doMock('../../models/userModel', () => ({
        find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue([{ _id: 'u1', name: 'A' }]) })),
        // autres méthodes si besoin
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
      }));

      const userController = require(pathToController);
      await userController.getAllUsers(req, res);

      // assertions
      const userModel = require('../../models/userModel');
      expect(userModel.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([{ _id: 'u1', name: 'A' }]);
    });
  });

  test('getAllUsers -> empty list -> triggers error path (returns 500)', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../models/userModel', () => ({
        find: jest.fn(() => ({ sort: jest.fn().mockResolvedValue([]) })),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
      }));

      const userController = require(pathToController);
      await userController.getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  test('getUserById -> success 200 (findById(...).select(...))', async () => {
    await jest.isolateModulesAsync(async () => {
      const user = { _id: 'u2', name: 'Bob' };
      jest.doMock('../../models/userModel', () => ({
        find: jest.fn(),
        findById: jest.fn(() => ({ select: jest.fn().mockResolvedValue(user) })),
        findByIdAndDelete: jest.fn(),
        findOne: jest.fn(),
        findByIdAndUpdate: jest.fn(),
      }));

      const userController = require(pathToController);
      req.params = { id: 'u2' };
      await userController.getUserById(req, res);

      const userModel = require('../../models/userModel');
      expect(userModel.findById).toHaveBeenCalledWith('u2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(user);
    });
  });

  test('deleteUserById -> success 200', async () => {
    await jest.isolateModulesAsync(async () => {
      // for delete we can mock findByIdAndDelete directly
      jest.doMock('../../models/userModel', () => ({
        findByIdAndDelete: jest.fn().mockResolvedValue({ _id: 'u3' }),
      }));

      const userController = require(pathToController);
      req.params = { id: 'u3' };
      await userController.deleteUserById(req, res);

      const userModel = require('../../models/userModel');
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith('u3');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith('deleted');
    });
  });

  test('addClient -> saves and returns the created user (constructor + save)', async () => {
    await jest.isolateModulesAsync(async () => {
      // Ici on fournit un constructeur (fonction) qui retourne .save() promise
      jest.doMock('../../models/userModel', () => {
        return function MockUserCtor(data) {
          return {
            ...data,
            save: jest.fn().mockResolvedValue({ _id: 'x', ...data })
          };
        };
      });

      // Aucun findOne nommé nécessaire ici, controller utilisera new userModel(...)
      const userController = require(pathToController);
      const body = { name: 'New', email: 'n@x.com', password: 'Pass123!' };
      req.body = body;

      await userController.addClient(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'x', name: 'New' }));
    });
  });

});
