// __tests__/utils/vCenter.test.js
describe('vCenter utils', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getAvailableResources -> aggregates and returns structure on success', async () => {
    await jest.isolateModulesAsync(async () => {
      // Mock axios
      jest.doMock('axios', () => ({
        post: jest.fn().mockResolvedValue({ data: { value: 'SESS' } }),
        get: jest.fn().mockImplementation((url) => {
          if (url.includes('/vcenter/host')) {
            return Promise.resolve({ data: { value: [{ host: 'host-1', name: 'host1', connection_state: 'CONNECTED' }] } });
          }
          if (url.includes('/vcenter/vm') && !/\/hardware\/disk/.test(url)) {
            if (/\/vcenter\/vm$/.test(url)) {
              return Promise.resolve({ data: { value: [{ vm: 'vm-1', name: 'vm1', power_state: 'POWERED_ON', cpu_count: 2, memory_size_MiB: 2048 }] } });
            }
            return Promise.resolve({ data: { value: { power_state: 'POWERED_ON', memory: { size_MiB: 2048 } } } });
          }
          if (url.includes('/vcenter/datastore')) {
            return Promise.resolve({ data: { value: [{ datastore: 'ds-1', name: 'datastore1', capacity: 1024 * 1024 * 1024 * 10, free_space: 1024 * 1024 * 1024 * 5 }] } });
          }
          return Promise.resolve({ data: { value: [] } });
        }),
        delete: jest.fn().mockResolvedValue({}),
      }));

      // Mock child_process.exec **avec** la propriété util.promisify.custom
      jest.doMock('child_process', () => {
        const util = require('util');
        // stdout we want to emulate from PowerCLI
        const fakeStdout = '{"Name":"host1","TotalCpuGHz":10,"UsedCpuGHz":2,"TotalRamGB":32}';

        // simple exec mock (callback style)
        const exec = (cmd, cb) => {
          cb(null, fakeStdout, '');
        };

        // implement the special promisify.custom so util.promisify(exec) resolves to { stdout, stderr }
        exec[util.promisify.custom] = (cmd) => {
          return Promise.resolve({ stdout: fakeStdout, stderr: '' });
        };

        return { exec };
      });

      // require module AFTER mocks
      const { getAvailableResources } = require('../../utils/vCenter');

      const result = await getAvailableResources({ hostname: 'vc', username: 'u', password: 'p' });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('cpu');
      expect(result).toHaveProperty('ram');
      expect(result).toHaveProperty('storage');
      expect(typeof result.cpu).toBe('number');
      expect(Array.isArray(result.vms)).toBe(true);
      expect(Array.isArray(result.hosts)).toBe(true);
    });
  });

  test('getAvailableResources -> throws when auth fails', async () => {
    await jest.isolateModulesAsync(async () => {
      jest.doMock('axios', () => ({
        post: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
        get: jest.fn(),
        delete: jest.fn(),
      }));

      // child_process exec won't be used in the auth-failed path, but keep compat with promisify
      jest.doMock('child_process', () => {
        const util = require('util');
        const exec = (cmd, cb) => cb(null, '{}', '');
        exec[util.promisify.custom] = () => Promise.resolve({ stdout: '{}', stderr: '' });
        return { exec };
      });

      const { getAvailableResources } = require('../../utils/vCenter');

      await expect(getAvailableResources({ hostname: 'vc', username: 'u', password: 'p' }))
        .rejects
        .toThrow(/Erreur vCenter|ECONNREFUSED/);
    });
  });
});
