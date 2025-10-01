// __tests__/db/db.test.js
describe('db.connectToMongoDB', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    process.env.Mongo_Url = 'mongodb://localhost/test';
  });

  test('calls mongoose.set and mongoose.connect -> success logs "connect to DB"', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    // mock mongoose
    jest.doMock('mongoose', () => ({
      set: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
    }));

    // require module after mock
    const { connectToMongoDB } = require('../../db/db');

    // call the function
    connectToMongoDB();

    // wait a tick so that the connect().then(...) handler can run reliably
    await new Promise((resolve) => setImmediate(resolve));

    expect(require('mongoose').set).toHaveBeenCalledWith('strictQuery', false);
    expect(require('mongoose').connect).toHaveBeenCalledWith(process.env.Mongo_Url);
    // the then handler logs "connect to DB"
    expect(consoleLogSpy).toHaveBeenCalledWith('connect to DB');

    consoleLogSpy.mockRestore();
  });

  test('when mongoose.connect rejects it logs the error message', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const err = new Error('connect-failed');

    jest.doMock('mongoose', () => ({
      set: jest.fn(),
      connect: jest.fn().mockRejectedValue(err),
    }));

    const { connectToMongoDB } = require('../../db/db');

    connectToMongoDB();

    // wait a tick so that the connect().catch(...) handler can run reliably
    await new Promise((resolve) => setImmediate(resolve));

    expect(require('mongoose').connect).toHaveBeenCalledWith(process.env.Mongo_Url);
    expect(consoleLogSpy).toHaveBeenCalledWith(err.message);

    consoleLogSpy.mockRestore();
  });
});
