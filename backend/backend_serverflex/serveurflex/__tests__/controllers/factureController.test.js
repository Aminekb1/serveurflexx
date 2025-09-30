// __tests__/controllers/factureController.test.js
const pathToController = '../../Controllers/factureController';

describe('factureController (isolated mocks)', () => {
  let req, res;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  test('createFacture -> should create and respond 201, update user', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../models/factureModel', () =>
        jest.fn().mockImplementation(function (data) {
          return { ...data, save: jest.fn().mockResolvedValue({ _id: 'f1', ...data }) };
        })
      );

      jest.doMock('../../models/userModel', () => ({
        findByIdAndUpdate: jest.fn().mockResolvedValue(true)
      }));

      const factureController = require(pathToController);

      req.body = {
        id: 'FAC-1',
        montant: 50,
        methodePaiement: 'carte',
        statutPaiement: 'pending',
        client: 'c1',
        commande: 'cmd1'
      };

      await factureController.createFacture(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ id: 'FAC-1', montant: 50 }));
      const userModel = require('../../models/userModel');
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('c1', expect.any(Object));
    });
  });

  test('getFactureById -> returns facture (populate chain)', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeFacture = { _id: 'fX', id: 'FACX' };

      // Mock findById -> .populate().populate() -> resolves fakeFacture
      jest.doMock('../../models/factureModel', () => ({
        findById: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockReturnValue({
            populate: jest.fn().mockResolvedValue(fakeFacture)
          })
        }))
      }));

      const factureController = require(pathToController);

      req.params = { id: 'fX' };
      await factureController.getFactureById(req, res);

      const factureModel = require('../../models/factureModel');
      expect(factureModel.findById).toHaveBeenCalledWith('fX');
      expect(res.json).toHaveBeenCalledWith(fakeFacture);
    });
  });

  test('calculateTotal -> computes total and updates montant (mock populate chain)', async () => {
    await jest.isolateModulesAsync(async () => {
      // factureModel.findOne doit renvoyer un objet dont .populate(...) **résout** en la facture finale
      const fakeFactureResolved = {
        id: 'FAC-A',
        commande: {
          ressources: [
            { _id: 'r1', prix: 10, nombreHeure: 2 },
            { _id: 'r2', prix: 5, nombreHeure: 3 }
          ]
        }
      };

      jest.doMock('../../models/factureModel', () => ({
        // findOne returns an object with a populate method that returns a Promise resolving to the facture
        findOne: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(fakeFactureResolved)
        })),
        updateOne: jest.fn().mockResolvedValue({ acknowledged: true })
      }));

      const factureController = require(pathToController);

      req.params = { id: 'FAC-A' };
      await factureController.calculateTotal(req, res);

      // expected total = 10*2 + 5*3 = 35
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        total: 35
      }));

      const factureModel = require('../../models/factureModel');
      expect(factureModel.updateOne).toHaveBeenCalledWith({ id: 'FAC-A' }, expect.any(Object));
    });
  });

  test('getAllFactures -> returns 500 when no factures', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('../../models/factureModel', () => ({
        find: jest.fn().mockResolvedValue([])
      }));
      const factureController = require(pathToController);

      await factureController.getAllFactures(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });
});
