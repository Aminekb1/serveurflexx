// frontend_react/app/__tests__/Invoices/Invoices.test.tsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Invoices from '../../src/views/Invoices/Invoices';
import '@testing-library/jest-dom';

// mock api (point to src/api)
jest.mock('../../src/api', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
import api from '../../src/api';

// mock AuthContext (point to src/context)
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
import { useAuth } from '../../src/context/AuthContext';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

describe('Invoices list', () => {
  beforeEach(() => jest.resetAllMocks());

  test('renders invoices and pays an invoice', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: 'u1' }, loading: false });

    const invoices = [
      { _id: 'inv1', client: 'u1', montant: 50, statutPaiement: 'non payé' },
      { _id: 'inv2', client: 'u2', montant: 20, statutPaiement: 'payé' },
    ];

    (api.get as jest.Mock).mockResolvedValue({ data: invoices });
    (api.post as jest.Mock).mockResolvedValue({});

    render(<Invoices />);

    await waitFor(() => expect(screen.getByText('My Invoices')).toBeInTheDocument());

    // ensure both invoice rows render
    expect(screen.getByText('inv1')).toBeInTheDocument();
    expect(screen.getByText('inv2')).toBeInTheDocument();

    // click Pay Now for inv1
    const payButton = screen.getByRole('button', { name: /Pay Now/i });
    fireEvent.click(payButton);

    // the component calls POST `/factures/{id}/payer` — ensure the right call was made
    await waitFor(() =>
      expect(api.post).toHaveBeenCalledWith('/factures/inv1/payer', { methodePaiement: 'credit_card' })
    );

    // statut updated in UI (component updates local state)
    await waitFor(() => expect(screen.getAllByText('payé').length).toBeGreaterThanOrEqual(1));
  });

  test('shows no invoices found when empty', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { _id: 'u1' }, loading: false });
    (api.get as jest.Mock).mockResolvedValue({ data: [] });

    render(<Invoices />);
    await waitFor(() => expect(screen.getByText('No invoices found')).toBeInTheDocument());
  });
});
