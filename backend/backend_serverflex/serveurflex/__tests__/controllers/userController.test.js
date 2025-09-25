// Simple smoke test: require the controller and check it exports something
const userController = require('../../Controllers/userController');

describe('userController - basic', () => {
  test('should export an object or function', () => {
    expect(userController).toBeDefined();
  });
});
