// frontend_react/app/__tests__/views/MyResources/MyResources.test.tsx
// Test minimal qui corrige le path et mocke les dépendances (useAuth + api)
// pour éviter les erreurs côté useEffect / appels réseau.

import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// mock du hook useAuth pour renvoyer un user non-admin et loading=false
jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'user', _id: 'u1' }, loading: false }),
}));

// mock du module API pour éviter appels réseau
jest.mock('../../../src/api', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({}),
}));

// IMPORTANT : importer AFTER les jest.mock pour que les mocks soient appliqués
import MyResources from '../../../src/views/MyResources';

describe('MyResources component', () => {
  test('renders without crashing', async () => {
    render(<MyResources />, {
      wrapper: ({ children }) => <MemoryRouter>{children}</MemoryRouter>,
    });

    // simple assertion : si le composant a planté, le test échouera avant cette ligne
    expect(document.body).toBeDefined();
  });
});
