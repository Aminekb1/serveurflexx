
// backend/.../__tests__/models/user.model.test.js
const User = require('../../models/userModel');

describe('User model', () => {
  test('model is exported', () => {
    expect(User).toBeDefined();
  });

  test('static login function exists', () => {
    expect(typeof User.login).toBe('function');
  });

  test('instantiating a User does not throw and sets fields', () => {
    const data = { name: 'T', email: 't@example.com', password: 'Aa123456!' };
    const instance = new User(data);
    expect(instance).toBeDefined();
    expect(instance.email).toBe('t@example.com');
  });
});
