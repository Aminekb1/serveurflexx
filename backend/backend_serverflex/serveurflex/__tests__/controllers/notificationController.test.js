// __tests__/controllers/notificationController.test.js
const pathToController = '../../Controllers/notificationController';
const { createReqRes, mockConstructorModel } = require('../helpers/testUtils');

async function runIsolated(setupMocks, testBody) {
  await jest.isolateModulesAsync(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    setupMocks();
    const notificationController = require(pathToController);
    const { req, res } = createReqRes();
    await testBody({ notificationController, req, res });
  });
}

describe('notificationController (isolated mocks)', () => {
  test('createNotification -> saves and updates user', async () => {
    await runIsolated(
      () => {
        jest.doMock('../../models/notificationModel', () => mockConstructorModel('n1'));
        jest.doMock('../../models/userModel', () => ({ findByIdAndUpdate: jest.fn().mockResolvedValue(true) }));
      },
      async ({ notificationController, req, res }) => {
        req.body = { type: 'Info', message: 'Test', userId: 'u1' };
        await notificationController.createNotification(req, res);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ type: 'Info' }));
        const userModel = require('../../models/userModel');
        expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith('u1', expect.any(Object));
      }
    );
  });

  test('getNotificationById -> 404 when not found', async () => {
    await runIsolated(
      () => {
        jest.doMock('../../models/notificationModel', () => ({
          findById: jest.fn().mockImplementation(() => ({
            populate: jest.fn().mockResolvedValue(null)
          }))
        }));
      },
      async ({ notificationController, req, res }) => {
        req.params = { id: 'notfound' };
        await notificationController.getNotificationById(req, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
      }
    );
  });

  test('getAllNotifications -> 200 when found', async () => {
    await runIsolated(
      () => {
        const list = [{ _id: 'n1' }];
        jest.doMock('../../models/notificationModel', () => ({
          find: jest.fn().mockImplementation(() => ({ populate: jest.fn().mockResolvedValue(list) }))
        }));
      },
      async ({ notificationController, req, res }) => {
        await notificationController.getAllNotifications(req, res);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(expect.any(Array));
      }
    );
  });
});
