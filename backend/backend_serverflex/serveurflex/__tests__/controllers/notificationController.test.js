// __tests__/controllers/notificationController.test.js
const pathToController = '../../Controllers/notificationController';

describe('notificationController (isolated mocks)', () => {
  let req, res;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() };
  });

  test('createNotification -> saves and updates user', async () => {
    await jest.isolateModulesAsync(async () => {
      // Mock constructeur qui expose save()
      jest.doMock('../../models/notificationModel', () =>
        jest.fn().mockImplementation(function (data) {
          return { ...data, save: jest.fn().mockResolvedValue({ _id: 'n1', ...data }) };
        })
      );

      jest.doMock('../../models/userModel', () => ({
        findByIdAndUpdate: jest.fn().mockResolvedValue(true)
      }));

      const notificationController = require(pathToController);
      req.body = { type: 'Email', message: 'Test', userId: 'u1' }; // "Email" valide par convention
      await notificationController.createNotification(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'Email' }));
      const userModel = require('../../models/userModel');
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', expect.any(Object));
    });
  });

  test('getNotificationById -> 404 when not found (mock chainable populate)', async () => {
    await jest.isolateModulesAsync(async () => {
      // findById(...).populate('user') -> resolves to null (not found)
      jest.doMock('../../models/notificationModel', () => ({
        findById: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(null)
        }))
      }));

      const notificationController = require(pathToController);

      req.params = { id: 'notfound' };
      await notificationController.getNotificationById(req, res);

      expect(require('../../models/notificationModel').findById).toHaveBeenCalledWith('notfound');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
    });
  });

  test('getAllNotifications -> 200 when found (mock chainable populate)', async () => {
    await jest.isolateModulesAsync(async () => {
      const list = [{ _id: 'n1' }];
      // find().populate('user') -> resolves to list
      jest.doMock('../../models/notificationModel', () => ({
        find: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(list)
        }))
      }));

      const notificationController = require(pathToController);

      await notificationController.getAllNotifications(req, res);

      expect(require('../../models/notificationModel').find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(list);
    });
  });
});
