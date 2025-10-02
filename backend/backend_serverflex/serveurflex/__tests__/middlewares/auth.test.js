// __tests__/middlewares/auth.test.js
describe('auth middleware', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'testsecret';
  });

  test('no Authorization header -> 401', async () => {
    jest.doMock('../../models/userModel', () => ({}));
    const auth = require('../../middlewares/auth');

    const req = { headers: {} };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non authentifié' });
    expect(next).not.toHaveBeenCalled();
  });

  test('invalid token (jwt.verify throws) -> 401', async () => {
    // mock jsonwebtoken.verify to throw
    jest.doMock('jsonwebtoken', () => ({
      verify: jest.fn(() => { throw new Error('invalid token'); })
    }));
    jest.doMock('../../models/userModel', () => ({}));

    const auth = require('../../middlewares/auth');

    const req = { headers: { authorization: 'Bearer badtoken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non authentifié' });
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token but user not found -> 401', async () => {
    jest.doMock('jsonwebtoken', () => ({
      verify: jest.fn().mockReturnValue({ id: 'u1' })
    }));
    jest.doMock('../../models/userModel', () => ({
      findById: jest.fn().mockResolvedValue(null)
    }));

    const auth = require('../../middlewares/auth');

    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await auth(req, res, next);

    // findById is async, middleware awaits it; verify output
    expect(require('../../models/userModel').findById).toHaveBeenCalledWith('u1');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Utilisateur non authentifié' });
    expect(next).not.toHaveBeenCalled();
  });

  test('valid token and user found -> next called and req.user set', async () => {
    const fakeUser = { _id: 'u2', name: 'Alice' };
    jest.doMock('jsonwebtoken', () => ({
      verify: jest.fn().mockReturnValue({ id: 'u2' })
    }));
    jest.doMock('../../models/userModel', () => ({
      findById: jest.fn().mockResolvedValue(fakeUser)
    }));

    const auth = require('../../middlewares/auth');

    const req = { headers: { authorization: 'Bearer goodtoken' } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await auth(req, res, next);

    expect(require('../../models/userModel').findById).toHaveBeenCalledWith('u2');
    expect(next).toHaveBeenCalled();
    // the middleware attaches the user object to req
    expect(req.user).toEqual(fakeUser);
    expect(res.status).not.toHaveBeenCalledWith(401);
  });
});
