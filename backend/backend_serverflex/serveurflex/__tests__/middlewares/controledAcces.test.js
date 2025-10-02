// __tests__/middlewares/controledAcces.test.js
describe('controledAcces middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    req = { user: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('calls next when user is admin', async () => {
    // require the middleware directly
    const { controledAcces } = require('../../middlewares/controledAcces');
    req.user.role = 'admin';

    await controledAcces(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('returns 401 when user is not admin', async () => {
    const { controledAcces } = require('../../middlewares/controledAcces');
    req.user.role = 'client';

    await controledAcces(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith('Unauthorized');
  });
});
