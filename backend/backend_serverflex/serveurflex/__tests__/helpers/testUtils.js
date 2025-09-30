// __tests__/helpers/testUtils.js
// Helpers réutilisables pour les tests unitaires.
// Ce fichier contient aussi un petit test qui vérifie que les helpers sont exportés,
// afin que Jest ne se plaigne pas "Your test suite must contain at least one test."

function createReqRes() {
  const req = { params: {}, body: {}, user: {} };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
  };
  return { req, res };
}

/**
 * Helper pour simuler un constructeur Mongoose (new Model(data)) qui expose .save()
 * usage: jest.doMock('../../models/foo', () => mockConstructorModel(savedValue))
 */
function mockConstructorModel(savedValue) {
  return function (data) {
    return {
      ...data,
      save: jest.fn().mockResolvedValue({ _id: savedValue || 'mockId', ...data })
    };
  };
}

/**
 * Helper pour retourner un objet chainable find()/populate()/populate()...
 * finalResolvedValue : valeur que renverra la dernière populate().mockResolvedValue(...)
 *
 * Retourne un objet { find: jest.fn() } convenant pour:
 *   const model = require('...'); model.find() -> .populate().populate() -> resolves finalResolvedValue
 */
function mockFindChain(finalResolvedValue) {
  return {
    find: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(finalResolvedValue)
      })
    }))
  };
}

/**
 * Helper pour mocker findById chainable -> findById(...).populate(...).populate(...).mockResolvedValue(...)
 */
function mockFindByIdChain(finalResolvedValue) {
  return {
    findById: jest.fn().mockImplementation(() => ({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(finalResolvedValue)
      })
    }))
  };
}

module.exports = {
  createReqRes,
  mockConstructorModel,
  mockFindChain,
  mockFindByIdChain,
};

/* Petit test d'existence :  
   Jest exécutera ce fichier (car il est sous __tests__), mais ce test est minimal : il
   vérifie juste que les helpers sont exportés et fonctionnent sommairement. Cela évite
   l'erreur "Your test suite must contain at least one test." tout en restant non intrusif.
*/
if (typeof describe === 'function') {
  describe('testUtils smoke test (exports)', () => {
    test('helpers are exported and callable', () => {
      const {
        createReqRes: crr,
        mockConstructorModel: mcm,
        mockFindChain: mfc,
        mockFindByIdChain: mfid
      } = module.exports;

      // fonctions définies
      expect(typeof crr).toBe('function');
      expect(typeof mcm).toBe('function');
      expect(typeof mfc).toBe('function');
      expect(typeof mfid).toBe('function');

      // comportement minimal
      const { req, res } = crr();
      expect(req).toHaveProperty('params');
      expect(res).toHaveProperty('json');
      // constructor mock returns an object with save() that resolves
      const Ctor = mcm('s1');
      const instance = Ctor({ a: 1 });
      expect(typeof instance.save).toBe('function');
    });
  });
}
