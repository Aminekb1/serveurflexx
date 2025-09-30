
// backend/.../__tests__/models/ressource.model.test.js
const Ressource = require('../../models/ressourceModel');

describe('Ressource model', () => {
  test('model is exported', () => {
    expect(Ressource).toBeDefined();
  });

  test('modelName is Ressource', () => {
    expect(Ressource.modelName).toBe('Ressource');
  });

  test('schema contains expected paths (including nested connectionDetails.* as literal keys)', () => {
    const paths = Ressource.schema.paths;
    const keys = Object.keys(paths);

    // chemins racine attendus
    expect(keys).toContain('nom');
    expect(keys).toContain('cpu');
    expect(keys).toContain('ram');
    expect(keys).toContain('stockage');
    expect(keys).toContain('nombreHeure');
    expect(keys).toContain('disponibilite');

    // vérifier presence d'au moins un sous-chemin connectionDetails.*
    const hasConnectionDetails = keys.some(p => p.startsWith('connectionDetails.'));
    expect(hasConnectionDetails).toBe(true);

    // assertions plus précises sur les clés littérales dot-notated
    expect(keys).toContain('connectionDetails.ipAddress');
    expect(keys).toContain('connectionDetails.username');
    expect(keys).toContain('connectionDetails.password');
    expect(keys).toContain('connectionDetails.protocol');
  });
});
