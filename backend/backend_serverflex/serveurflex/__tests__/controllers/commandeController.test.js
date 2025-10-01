// __tests__/controllers/commandeController.test.js
const pathToController = '../../Controllers/commandeController';
const { createReqRes, mockConstructorModel, mockFindChain, mockFindByIdChain } = require('../helpers/testUtils');

async function runIsolated(setupMocks, testBody) {
  // helper pour réduire l'imbrication: setupMocks() doit faire jest.doMock(...) synchronously
  await jest.isolateModulesAsync(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    setupMocks();
    const commandeController = require(pathToController);
    const { req, res } = createReqRes();
    await testBody({ commandeController, req, res });
  });
}

describe('commandeController (isolated mocks per test)', () => {
  test('createCommande -> should create and respond 201', async () => {
    await runIsolated(
      () => {
        jest.doMock('../../models/commandeModel', () => mockConstructorModel('cmd1'));
        jest.doMock('../../models/userModel', () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue(true) }));
        jest.doMock('../../models/ressourceModel', () => ({}));
      },
      async ({ commandeController, req, res }) => {
        req.body = { id: 'CMD-1', client: 'c1', montant: 100 };
        await commandeController.createCommande(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ client: 'c1', montant: 100 }));
      }
    );
  });

  test('getAllCommandes -> returns commandes (mock chain populate/populate)', async () => {
    await runIsolated(
      () => {
        const fakeList = [{ _id: 'cmdA' }];
        jest.doMock('../../models/commandeModel', () => ({
          find: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockReturnValue({
              populate: jest.fn().mockResolvedValue(fakeList),
            }),
          })),
        }));
        jest.doMock('../../models/userModel', () => ({}));
        jest.doMock('../../models/ressourceModel', () => ({}));
      },
      async ({ commandeController, req, res }) => {
        await commandeController.getAllCommandes(req, res);
        const commandeModel = require('../../models/commandeModel');
        expect(commandeModel.find).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.any(Array));
      }
    );
  });

  test('updateCommandeById -> accept order: mark resources & update user -> 200', async () => {
    await runIsolated(
      () => {
        // findById first returns plain object with save, second usage returns chainable populate
        let call = 0;
        jest.doMock('../../models/commandeModel', () => ({
          findById: jest.fn().mockImplementation((id) => {
            call++;
            if (call === 1) return { _id: id, ressources: ['r1'], save: jest.fn().mockResolvedValue({}) };
            return { populate: jest.fn().mockResolvedValue({ _id: id, ressources: ['r1'], status: 'accepté' }) };
          }),
        }));
        jest.doMock('../../models/ressourceModel', () => ({ findById: jest.fn().mockResolvedValue({}) }));
        jest.doMock('../../models/userModel', () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue(true) }));
      },
      async ({ commandeController, req, res }) => {
        req.params = { id: 'cmdOK' };
        await commandeController.updateCommandeById(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalled();
      }
    );
  });
});
