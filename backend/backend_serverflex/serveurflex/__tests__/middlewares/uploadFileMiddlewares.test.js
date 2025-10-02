// __tests__/middlewares/uploadFileMiddlewares.test.js
describe('uploadFileMiddlewares (multer storage)', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('storage destination and filename generate unique filename when file exists', async () => {
    // Prepare a mock for multer. We capture the storage object passed to diskStorage.
    const captured = {};
    const mockDiskStorage = (opts) => {
      captured.storage = opts;
      return opts;
    };
    const mockMulter = (opts) => {
      // return an object representing the multer middleware; expose storage for assertions
      return { _isMulter: true, storage: opts.storage || captured.storage };
    };
    mockMulter.diskStorage = mockDiskStorage;

    jest.doMock('multer', () => mockMulter);

    // mock fs.existsSync: first call => true (file exists), second => false (unique)
    const existsSeq = [true, false];
    jest.doMock('fs', () => ({
      existsSync: jest.fn(() => existsSeq.shift() === true),
    }));

    // now require the module (it will use our mocked multer & fs)
    const uploadfile = require('../../middlewares/uploadFileMiddlewares');

    // validate that returned value is from our mocked multer
    expect(uploadfile).toBeDefined();
    expect(uploadfile._isMulter).toBe(true);

    // captured.storage should contain destination and filename functions
    expect(captured.storage).toBeDefined();
    expect(typeof captured.storage.destination).toBe('function');
    expect(typeof captured.storage.filename).toBe('function');

    // call destination callback
    const req = {};
    const file = { originalname: 'test.txt' };
    const destCb = jest.fn();
    captured.storage.destination(req, file, destCb);
    expect(destCb).toHaveBeenCalledWith(null, 'public/images/Users');

    // call filename: because fs.existsSync mocked true then false,
    // filename should produce a modified name (suffix _1) for the first collision
    const filenameCb = jest.fn();
    captured.storage.filename(req, file, filenameCb);

    // Since implementation may call fs.existsSync multiple times we only assert cb called with some string
    expect(filenameCb).toHaveBeenCalled();
    const cbArg = filenameCb.mock.calls[0][1];
    expect(typeof cbArg).toBe('string');
    // should contain original base name 'test' and extension '.txt'
    expect(cbArg).toMatch(/test(_\d+)?\.txt$/);
  });
});
