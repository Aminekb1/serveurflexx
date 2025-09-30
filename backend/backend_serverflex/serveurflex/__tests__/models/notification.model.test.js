// __tests__/models/notification.model.test.js
const Notification = require('../../models/notificationModel');

describe('Notification model', () => {
  test('model is exported', () => {
    expect(Notification).toBeDefined();
  });

  test('modelName is Notification', () => {
    expect(Notification.modelName).toBe('Notification');
  });

  test('schema contains expected paths', () => {
    const paths = Object.keys(Notification.schema.paths);
    expect(paths).toContain('type');
    expect(paths).toContain('message');
    expect(paths).toContain('destinataire');
    expect(paths).toContain('dateEnvoi');
    expect(paths).toContain('ressource');
    expect(paths).toContain('user');
    expect(paths).toContain('lu');
  });

  test('type enum contains Email and SMS', () => {
    const enumValues = Notification.schema.paths.type.enumValues;
    expect(enumValues).toEqual(expect.arrayContaining(['Email', 'SMS']));
  });
});
