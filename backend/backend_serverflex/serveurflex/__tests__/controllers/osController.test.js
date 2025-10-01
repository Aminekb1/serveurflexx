// __tests__/controllers/osController.test.js
const pathToController = '../../Controllers/osController';

describe('osController', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  function makeRes() {
    return {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  }

  test('getOsInformatin -> returns hostname/type/platform (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      // mock core 'os' module BEFORE require du controller
      jest.doMock('os', () => ({
        hostname: () => 'my-host',
        type: () => 'Linux',
        platform: () => 'linux'
      }));

      const controller = require(pathToController);
      const req = {};
      const res = makeRes();

      await controller.getOsInformatin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          hostname: 'my-host',
          type: 'Linux',
          platform: 'linux'
        })
      );
    });
  });

  test('osCpus -> returns list of cpus (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeCpus = [
        { model: 'Intel', speed: 2400 },
        { model: 'Intel', speed: 2400 }
      ];
      jest.doMock('os', () => ({
        cpus: () => fakeCpus
      }));

      const controller = require(pathToController);
      const req = {};
      const res = makeRes();

      await controller.osCpus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCpus);
    });
  });

  test('osCpusById -> valid id returns single cpu (200)', async () => {
    await jest.isolateModulesAsync(async () => {
      const fakeCpus = [
        { model: 'Intel', speed: 2400 },
        { model: 'AMD', speed: 3000 }
      ];
      jest.doMock('os', () => ({
        cpus: () => fakeCpus
      }));

      const controller = require(pathToController);
      const req = { params: { id: '1' } };
      const res = makeRes();

      await controller.osCpusById(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeCpus[1]);
    });
  });

  test('osCpusById -> negative id returns 500 with message', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('os', () => ({
        cpus: () => [{}, {}]
      }));

      const controller = require(pathToController);
      const req = { params: { id: '-1' } };
      const res = makeRes();

      await controller.osCpusById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      // message includes 'valid id' (le controller throw "you must provide a valid id")
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('valid id')
      }));
    });
  });

  test('osCpusById -> out-of-range id returns 500 with message', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('os', () => ({
        cpus: () => [{}, {}]
      }));

      const controller = require(pathToController);
      const req = { params: { id: '99' } };
      const res = makeRes();

      await controller.osCpusById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('valid id')
      }));
    });
  });
});
