// __tests__/utils/vCenter.test.js
/**
 * Tests unitaires pour utils/vCenter.js
 * - refactorisé pour limiter la profondeur d'imbrication (runIsolated + setupMocks)
 * - utilise String.prototype.endsWith au lieu de regex pour les fins d'URL
 */

beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
});

/**
 * Helper qui centralise isolateModules / reset / require
 * - setupMocks: function() qui appelle jest.doMock(...) synchronously
 * - testBody: async (moduleExports) => { ... }
 */
async function runIsolated(setupMocks, testBody) {
  await jest.isolateModulesAsync(async () => {
    jest.resetModules();
    jest.clearAllMocks();
    setupMocks();
    // require AFTER avoir défini les mocks
    const mod = require('../../utils/vCenter');
    await testBody(mod);
  });
}

/** Mocks pour le scénario "success" */
function setupMocksForSuccess() {
  jest.doMock('axios', () => ({
    post: jest.fn().mockResolvedValue({ data: { value: 'SESS' } }),
    get: jest.fn().mockImplementation((url) => {
      if (url.includes('/vcenter/host')) {
        return Promise.resolve({
          data: { value: [{ host: 'host-1', name: 'host1', connection_state: 'CONNECTED' }] }
        });
      }
      // vm list or vm detail, but ignore disk endpoints
      if (url.includes('/vcenter/vm') && !url.includes('/hardware/disk')) {
        if (url.endsWith('/vcenter/vm')) {
          return Promise.resolve({
            data: {
              value: [
                { vm: 'vm-1', name: 'vm1', power_state: 'POWERED_ON', cpu_count: 2, memory_size_MiB: 2048 }
              ]
            }
          });
        }
        // vm details endpoint
        return Promise.resolve({ data: { value: { power_state: 'POWERED_ON', memory: { size_MiB: 2048 } } } });
      }
      if (url.includes('/vcenter/datastore')) {
        return Promise.resolve({
          data: {
            value: [
              {
                datastore: 'ds-1',
                name: 'datastore1',
                capacity: 1024 * 1024 * 1024 * 10,
                free_space: 1024 * 1024 * 1024 * 5
              }
            ]
          }
        });
      }
      return Promise.resolve({ data: { value: [] } });
    }),
    delete: jest.fn().mockResolvedValue({}),
  }));

  // Mock child_process.exec + support util.promisify.custom
  jest.doMock('child_process', () => {
    const util = require('util');
    const fakeStdout = '{"Name":"host1","TotalCpuGHz":10,"UsedCpuGHz":2,"TotalRamGB":32}';
    const exec = (cmd, cb) => {
      // Callback-style invocation expected by some code paths
      cb(null, fakeStdout, '');
    };
    // Provide promisify.custom so util.promisify(exec) works in the module under test
    exec[util.promisify.custom] = (cmd) => Promise.resolve({ stdout: fakeStdout, stderr: '' });
    return { exec };
  });
}

/** Mocks pour le scénario "auth fail" (axios.post rejette) */
function setupMocksForAuthFail() {
  jest.doMock('axios', () => ({
    post: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
    get: jest.fn(),
    delete: jest.fn(),
  }));

  jest.doMock('child_process', () => {
    const util = require('util');
    const exec = (cmd, cb) => cb(null, '{}', '');
    exec[util.promisify.custom] = () => Promise.resolve({ stdout: '{}', stderr: '' });
    return { exec };
  });
}

describe('vCenter utils', () => {
  test('getAvailableResources -> aggregates and returns structure on success', async () => {
    await runIsolated(setupMocksForSuccess, async ({ getAvailableResources }) => {
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
    await runIsolated(setupMocksForAuthFail, async ({ getAvailableResources }) => {
      await expect(getAvailableResources({ hostname: 'vc', username: 'u', password: 'p' }))
        .rejects
        .toThrow(/Erreur vCenter|ECONNREFUSED/);
    });
  });
});
