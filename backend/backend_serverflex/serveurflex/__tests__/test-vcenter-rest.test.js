// backend/backend_serverflex/serveurflex/__tests__/test-vcenter-rest.test.js
/**
 * Jest tests for test-vcenter-rest.js
 *
 * The original file defines and immediately invokes `testVcenter()`.
 * We mock 'axios' and 'https' before requiring the module so the
 * module's invocation uses the mocked implementations.
 */

const ORIGINAL_ENV = process.env;

describe('test-vcenter-rest script', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    // ensure a clean module cache for each test so the file is re-evaluated
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };

    // spy on console to verify output
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = ORIGINAL_ENV;
  });

  test('successful authentication and disconnect calls axios.post and axios.delete', async () => {
    // Prepare mocked axios with resolved responses
    const axiosMock = {
      post: jest.fn().mockResolvedValue({ data: { value: 'SESSION_ID_123' } }),
      delete: jest.fn().mockResolvedValue({}),
    };

    // Mock axios before requiring the module
    jest.doMock('axios', () => axiosMock);

    // Mock https.Agent to a simple class so code can construct it safely
    jest.doMock('https', () => {
      return {
        Agent: class {
          constructor(opts) {
            this.opts = opts;
          }
        },
      };
    });

    // Now require the file — it will run testVcenter() immediately using mocked modules
    require('../test-vcenter-rest');

    // wait for the microtasks/macrotasks used by the async function to complete
    await new Promise((resolve) => setImmediate(resolve));

    // Assertions about axios calls
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.post).toHaveBeenCalledWith(
      expect.stringContaining('/com/vmware/cis/session'),
      {},
      expect.objectContaining({
        auth: expect.objectContaining({ username: expect.any(String), password: expect.any(String) }),
        headers: expect.any(Object),
        httpsAgent: expect.any(Object),
      })
    );

    expect(axiosMock.delete).toHaveBeenCalledTimes(1);
    expect(axiosMock.delete).toHaveBeenCalledWith(
      expect.stringContaining('/com/vmware/cis/session'),
      expect.objectContaining({
        headers: expect.objectContaining({ 'vmware-api-session-id': 'SESSION_ID_123' }),
        httpsAgent: expect.any(Object),
      })
    );

    // verify console logs include the session id and disconnected messages
    expect(consoleLogSpy).toHaveBeenCalled();
    // check that 'Session ID:' and the id are logged
    expect(consoleLogSpy).toHaveBeenCalledWith('Session ID:', 'SESSION_ID_123');
    expect(consoleLogSpy).toHaveBeenCalledWith('Disconnected');
  });

  test('handles axios.post rejection and logs error details', async () => {
    // Prepare mocked axios that rejects
    const axiosMock = {
      post: jest.fn().mockRejectedValue({
        message: 'Request failed',
        response: {
          status: 401,
          data: { detail: 'Unauthorized' },
          headers: { 'content-type': 'application/json' },
        },
      }),
      delete: jest.fn(), // should not be called
    };

    jest.doMock('axios', () => axiosMock);

    // Mock https.Agent again
    jest.doMock('https', () => {
      return {
        Agent: class {
          constructor(opts) {
            this.opts = opts;
          }
        },
      };
    });

    // Require module (will invoke testVcenter())
    require('../test-vcenter-rest');

    // wait for async work to finish
    await new Promise((resolve) => setImmediate(resolve));

    // axios.post was called and axios.delete should not be called
    expect(axiosMock.post).toHaveBeenCalledTimes(1);
    expect(axiosMock.delete).not.toHaveBeenCalled();

    // console.error should have been called with 'Error Details:' and an object containing message/status/data
    expect(consoleErrorSpy).toHaveBeenCalled();

    // find the first call's arguments and assert structure
    const firstCallArgs = consoleErrorSpy.mock.calls[0];
    expect(firstCallArgs[0]).toBe('Error Details:');
    const detailsObj = firstCallArgs[1];
    expect(detailsObj).toMatchObject({
      message: 'Request failed',
      status: 401,
      data: { detail: 'Unauthorized' },
    });
  });
});
