// backend/.../__tests__/models/commande.model.test.js
const Commande = require('../../models/commandeModel');

describe('Commande model', () => {
  test('model is exported', () => {
    expect(Commande).toBeDefined();
  });

  test('modelName is Commande', () => {
    expect(Commande.modelName).toBe('Commande');
  });

  test('schema contains expected paths', () => {
    const paths = Commande.schema.paths;
    expect(paths).toHaveProperty('client');
    expect(paths).toHaveProperty('ressources');
    expect(paths).toHaveProperty('dateCommande');
    expect(paths).toHaveProperty('montant');
  });
});
