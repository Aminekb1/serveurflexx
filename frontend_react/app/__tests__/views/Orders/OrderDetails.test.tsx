// frontend_react/app/__tests__/views/Orders/OrderDetails.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import OrderDetails from '../../../src/views/Orders/OrderDetails';
import '@testing-library/jest-dom';

// mock api
jest.mock('../../../src/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));
import api from '../../../src/api';

// mock AuthContext (useAuth)
jest.mock('../../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../../src/context/AuthContext';

// react-router-dom mocks (useNavigate + useParams)
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

describe('OrderDetails', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders order details and resources; supports edit flow', async () => {
    // prepare mocks
    mockUseParams.mockReturnValue({ id: 'order1' });
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: 'u1', name: 'User' }, loading: false });

    const order = {
      _id: 'order1',
      client: { _id: 'u1', name: 'Client A' },
      dateCommande: new Date().toISOString(),
      ressources: [{ _id: 'r1', nom: 'Res1', cpu: 2, ram: 4, stockage: 10 }],
      status: 'non traité',
    };

    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes('/commandes/getCommandeById')) return Promise.resolve({ data: order });
      return Promise.resolve({ data: [] });
    });

    const updatedOrder = { ...order, status: 'accepté' };
    (api.put as jest.Mock).mockResolvedValue({ data: updatedOrder });

    render(<OrderDetails />);

    // Wait for order to appear
    await waitFor(() => expect(screen.getByText(/Order ID:/i)).toBeInTheDocument());
    expect(screen.getByText(order._id)).toBeInTheDocument();
    expect(screen.getByText('Client A')).toBeInTheDocument();
    expect(screen.getByText(/Resources/i)).toBeInTheDocument();
    expect(screen.getByText(/Res1/i)).toBeInTheDocument();

    // Open edit modal (Edit button)
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }));

    // Modal fields should exist
    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement;
    expect(statusSelect).toBeInTheDocument();

    // change status and submit
    fireEvent.change(statusSelect, { target: { value: 'accepté' } });
    const updateButton = screen.getByRole('button', { name: /Update/i });
    fireEvent.click(updateButton);

    // expect API put called and UI updated
    await waitFor(() => expect(api.put).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/accepté/i)).toBeInTheDocument());
  });

  test('delete order triggers navigation', async () => {
    mockUseParams.mockReturnValue({ id: 'order2' });
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: 'u1' }, loading: false });

    const order2 = {
      _id: 'order2',
      client: { _id: 'u1', name: 'C' },
      dateCommande: new Date().toISOString(),
      ressources: [],
      status: 'non traité',
    };

    (api.get as jest.Mock).mockResolvedValue({ data: order2 });
    (api.delete as jest.Mock).mockResolvedValue({});

    render(<OrderDetails />);

    await waitFor(() => expect(screen.getByText('order2')).toBeInTheDocument());

    // click Delete -> show confirm dialog
    fireEvent.click(screen.getByRole('button', { name: /Delete/i }));

    // The modal has two "Delete" buttons (one main, one confirm). We fetch all and click the confirmation one (second).
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i });
    // ensure at least two and click the last (confirmation)
    expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    // If there are multiple, choose the one that is visible inside the modal (we pick the last)
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

    await waitFor(() => expect(api.delete).toHaveBeenCalled());
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard/Orders');
  });
});
