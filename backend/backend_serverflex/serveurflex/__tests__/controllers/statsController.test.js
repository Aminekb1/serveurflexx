// __tests__/controllers/statsController.test.js
describe('statsController', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  function makeRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  }

  test('getCommandeStats -> aggregates and returns composed stats (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      // Préparer les valeurs renvoyées par commandeModel.aggregate (appelé 2x dans le controller)
      const orderStatsObj = {
        totalCommandes: 3,
        totalMontant: 300,
        commandesParMois: [
          { mois: '2023-01', count: 2 },
          { mois: '2023-02', count: 1 }
        ]
      };
      const mostConsumedRaw = [
        { name: 'Ressource A', count: 5 }
      ];

      // Mock du modèle commandeModel avec aggregate qui résout deux fois (orderStats puis mostConsumed)
      jest.doMock('../../models/commandeModel', () => {
        const aggregate = jest.fn()
          .mockResolvedValueOnce([orderStatsObj])   // premier appel -> orderStats
          .mockResolvedValueOnce(mostConsumedRaw); // second appel -> mostConsumed
        return { aggregate };
      });

      // autres modèles pas utilisés dans ce test -> mock vide
      jest.doMock('../../models/factureModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/notificationModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/ressourceModel', () => ({ aggregate: jest.fn() }));

      const controller = require('../../Controllers/statsController');
      const req = {};
      const res = makeRes();

      await controller.getCommandeStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // vérifier quelques propriétés centrales
      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg).toMatchObject({
        totalCommandes: 3,
        totalMontant: 300,
        montantMoyen: 100,
        commandesParMois: { '2023-01': 2, '2023-02': 1 },
      });
      expect(jsonArg.peakMonth).toBe('2023-01'); // mois avec le plus de commandes
      expect(Array.isArray(jsonArg.mostConsumed)).toBe(true);
      expect(jsonArg.mostConsumed[0]).toMatchObject({ name: 'Ressource A', count: 5 });
    });
  });

  test('getFactureStats -> returns facture payment stats (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      // Simuler résultat de aggregation du modèle factureModel
      // Ici on simule la structure transformée par ton controller (stats[0])
      const factureAgg = [{
        totalFactures: 3,
        totalMontant: 600,
        totalPaye: 200,
        parStatut: [
          { statut: 'payé', count: 1 },
          { statut: 'pending', count: 2 }
        ]
      }];

      jest.doMock('../../models/commandeModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/factureModel', () => ({ aggregate: jest.fn().mockResolvedValue(factureAgg) }));
      jest.doMock('../../models/notificationModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/ressourceModel', () => ({ aggregate: jest.fn() }));

      const controller = require('../../Controllers/statsController');
      const req = {};
      const res = makeRes();

      await controller.getFactureStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const out = res.json.mock.calls[0][0];
      expect(out.totalFactures).toBe(3);
      expect(out.totalMontant).toBe(600);
      // tauxPaiement = (paidCount / totalFactures) * 100 = (1/3)*100
      expect(out.tauxPaiement).toBeCloseTo((1 / 3) * 100);
      expect(out.parStatut).toMatchObject({ 'payé': 1, 'pending': 2 });
    });
  });

  test('getNotificationStats -> returns notification aggregates (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      // Simuler la structure attendue par le controller
      const notifAgg = [{
        totalNotifications: 4,
        tauxLu: 0.5, // avg luCount (comme dans ton code)
        parType: [
          { type: 'Email', count: 3 },
          { type: 'SMS', count: 1 }
        ]
      }];

      jest.doMock('../../models/commandeModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/factureModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/notificationModel', () => ({ aggregate: jest.fn().mockResolvedValue(notifAgg) }));
      jest.doMock('../../models/ressourceModel', () => ({ aggregate: jest.fn() }));

      const controller = require('../../Controllers/statsController');
      const req = {};
      const res = makeRes();

      await controller.getNotificationStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const out = res.json.mock.calls[0][0];
      expect(out.totalNotifications).toBe(4);
      expect(out.tauxLu).toBe(0.5);
      expect(out.parType).toMatchObject({ Email: 3, SMS: 1 });
    });
  });

  test('getRessourceStats -> returns resource availability stats (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      const ressAgg = [{
        totalRessources: 10,
        tauxDisponibilite: 0.7,
        parType: [
          { type: 'server', count: 6 },
          { type: 'vm', count: 4 }
        ]
      }];

      jest.doMock('../../models/commandeModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/factureModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/notificationModel', () => ({ aggregate: jest.fn() }));
      jest.doMock('../../models/ressourceModel', () => ({ aggregate: jest.fn().mockResolvedValue(ressAgg) }));

      const controller = require('../../Controllers/statsController');
      const req = {};
      const res = makeRes();

      await controller.getRessourceStats(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const out = res.json.mock.calls[0][0];
      expect(out.totalRessources).toBe(10);
      expect(out.tauxDisponibilite).toBeCloseTo(0.7);
      expect(out.parType).toMatchObject({ server: 6, vm: 4 });
    });
  });
});
