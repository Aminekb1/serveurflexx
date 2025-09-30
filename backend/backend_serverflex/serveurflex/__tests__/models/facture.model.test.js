// __tests__/models/facture.model.test.js
const Facture = require('../../models/factureModel');

describe('Facture model', () => {
  test('model is exported', () => {
    expect(Facture).toBeDefined();
  });

  test('modelName is Facture', () => {
    expect(Facture.modelName).toBe('Facture');
  });

  test('schema contains expected paths', () => {
    const paths = Object.keys(Facture.schema.paths);
    expect(paths).toContain('id');
    expect(paths).toContain('client');
    expect(paths).toContain('commande');
    expect(paths).toContain('montant');
    expect(paths).toContain('statutPaiement');
  });
});
