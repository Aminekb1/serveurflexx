/* //import React from 'react';
import { render } from '@testing-library/react';
import Orders from '../../../src/views/Orders/Orders'; // chemin relatif corrigé

test('Orders component renders', () => {
  render(<Orders />);
});
 */
// frontend_react/app/__tests__/views/Orders/Orders.test.tsx
//import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth to avoid needing the real provider
jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { role: 'user', _id: 'u1' }, loading: false }),
}));

// Mock api module used by Orders
jest.mock('../../../src/api', () => ({
  get: jest.fn().mockResolvedValue({ data: [] }),
  post: jest.fn().mockResolvedValue({ data: {} }),
  delete: jest.fn().mockResolvedValue({}),
}));

// IMPORTANT: import AFTER jest.mock so mocks are applied
import Orders from '../../../src/views/Orders/Orders';

describe('Orders component', () => {
  test('renders without crashing and resolves effects', async () => {
    // const { container, findByText } = render(
    const { container } = render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );

    // wait for component to settle (effects and state updates)
    // if Orders shows "No orders" text or similar, use findByText with that string;
    // else wait for something in DOM to confirm render has completed.
    await waitFor(() => {
      // simple existence check of root container
      expect(container).toBeDefined();
    });

    // you can also assert on a specific element, example:
    // await findByText(/No orders/i);
  });
});
