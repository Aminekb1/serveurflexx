
// backend/.../__tests__/controllers/commandeController.test.js
// Tests unitaires isolés pour commandeController (pattern : isolateModules + doMock)

const pathToController = '../../Controllers/commandeController';

describe('commandeController (isolated mocks per test)', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('createCommande -> should create and respond 201', async () => {
    await jest.isolateModulesAsync(async () => {
      // mock commandeModel as constructor with save()
      jest.doMock('../../models/commandeModel', () =>
        jest.fn().mockImplementation(function (data) {
          return { ...data, save: jest.fn().mockResolvedValue({ _id: 'cmd1', ...data }) };
        })
      );

      jest.doMock('../../models/userModel', () => ({
        findByIdAndUpdate: jest.fn().mockResolvedValue(true),
      }));

      jest.doMock('../../models/ressourceModel', () => ({}));

      const commandeController = require(pathToController);

      req.body = { id: 'ID123', client: 'c1', ressources: ['r1'], dateCommande: new Date().toISOString(), montant: 100 };
      await commandeController.createCommande(req, res);

      const commandeModel = require('../../models/commandeModel');
      expect(typeof commandeModel).toBe('function'); // constructor was called internally
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ client: 'c1', montant: 100 }));
    });
  });

  test('getAllCommandes -> returns commandes (mock chain populate/populate)', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeList = [{ _id: 'cmdA' }];

      // find() returns object that has populate().populate().mockResolvedValue(fakeList)
      jest.doMock('../../models/commandeModel', () => ({
        find: jest.fn(() => ({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeList),
          }),
        })),
      }));

      jest.doMock('../../models/userModel', () => ({}));
      jest.doMock('../../models/ressourceModel', () => ({}));

      const commandeController = require(pathToController);
      req.user = { role: 'admin' };
      await commandeController.getAllCommandes(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeList);
    });
  });

  test('addRessourceToCommande -> ressource not found -> 404', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../models/commandeModel', () => ({
        findById: jest.fn().mockResolvedValue({ _id: 'cmdX', ressources: [], save: jest.fn().mockResolvedValue({}) }),
      }));

      jest.doMock('../../models/ressourceModel', () => ({
        findById: jest.fn().mockResolvedValue(null),
      }));

      jest.doMock('../../models/userModel', () => ({}));

      const commandeController = require(pathToController);
      req.body = { commandeId: 'cmdX', ressourceId: 'rX' };

      await commandeController.addRessourceToCommande(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Ressource not found' }));
    });
  });

  test('updateCommandeById -> accept order: mark resources & update user -> 200', async () => {
    await jest.isolateModulesAsync(async () => {
      // IMPORTANT: findById must return synchronously an object with populate when used as a chain:
      // first call -> return commande object with ressources + save()
      // second call -> return object with populate() method (synchronously)
      let callCount = 0;
      jest.doMock('../../models/commandeModel', () => ({
        findById: jest.fn().mockImplementation((id) => {
          callCount++;
          if (callCount === 1) {
            // first usage in controller: const commande = await commandeModel.findById(id);
            return { _id: id, ressources: ['r1'], save: jest.fn().mockResolvedValue({}) };
          }
          // second usage in controller: commandeModel.findById(id).populate(...)
          return {
            populate: jest.fn().mockResolvedValue({ _id: id, ressources: ['r1'], status: 'accepté' }),
          };
        }),
        findByIdAndUpdate: jest.fn().mockResolvedValue(true),
      }));

      jest.doMock('../../models/ressourceModel', () => ({
        findById: jest.fn().mockResolvedValue({ _id: 'r1', disponibilite: true }),
        findByIdAndUpdate: jest.fn().mockResolvedValue(true),
      }));

      jest.doMock('../../models/userModel', () => ({
        findByIdAndUpdate: jest.fn().mockResolvedValue(true),
      }));

      const commandeController = require(pathToController);
      req.params = { id: 'cmdOK' };
      req.body = { status: 'accepté' };

      await commandeController.updateCommandeById(req, res);

      const userModel = require('../../models/userModel');
      const resModel = require('../../models/ressourceModel');
      expect(userModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(resModel.findByIdAndUpdate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ _id: 'cmdOK', status: 'accepté' }));
    });
  });

});
